import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/teachers/[id] - ดึงข้อมูลครูเฉพาะคน
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacher = await db.user.findUnique({
      where: {
        id: params.id,
        role: 'TEACHER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        bio: true,
        specialties: true,
        experience: true,
        education: true,
        phone: true,
        createdAt: true,
        availabilities: {
          select: {
            id: true,
            weekday: true,
            startTime: true,
            endTime: true
          }
        }
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลครู' },
        { status: 404 }
      )
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error('Error fetching teacher:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลครูได้' },
      { status: 500 }
    )
  }
}

// PUT /api/teachers/[id] - แก้ไขข้อมูลครู (เฉพาะแอดมิน)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      email,
      profileImage,
      bio,
      specialties,
      experience,
      education,
      phone
    } = body

    // ตรวจสอบว่าครูมีอยู่หรือไม่
    const existingTeacher = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingTeacher || existingTeacher.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลครู' },
        { status: 404 }
      )
    }

    // ตรวจสอบว่าอีเมลซ้ำหรือไม่ (ถ้าเปลี่ยนอีเมล)
    if (email !== existingTeacher.email) {
      const emailExists = await db.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'อีเมลนี้มีอยู่ในระบบแล้ว' },
          { status: 400 }
        )
      }
    }

    const updatedTeacher = await db.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
        profileImage,
        bio,
        specialties: specialties || [],
        experience: experience ? parseInt(experience) : null,
        education,
        phone
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        bio: true,
        specialties: true,
        experience: true,
        education: true,
        phone: true,
        createdAt: true
      }
    })

    return NextResponse.json(updatedTeacher)
  } catch (error) {
    console.error('Error updating teacher:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถแก้ไขข้อมูลครูได้' },
      { status: 500 }
    )
  }
}

// DELETE /api/teachers/[id] - ลบครู (เฉพาะแอดมิน)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    // ตรวจสอบว่าครูมีอยู่หรือไม่
    const existingTeacher = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!existingTeacher || existingTeacher.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลครู' },
        { status: 404 }
      )
    }

    await db.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'ลบครูเรียบร้อยแล้ว' })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถลบครูได้' },
      { status: 500 }
    )
  }
}
