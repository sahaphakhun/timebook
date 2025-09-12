import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/teachers - ดึงรายการครูทั้งหมด
export async function GET() {
  try {
    const teachers = await db.user.findMany({
      where: {
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
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(teachers)
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลครูได้' },
      { status: 500 }
    )
  }
}

// POST /api/teachers - เพิ่มครูใหม่ (เฉพาะแอดมิน)
export async function POST(request: NextRequest) {
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

    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'อีเมลนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      )
    }

    const teacher = await db.user.create({
      data: {
        name,
        email,
        role: 'TEACHER',
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

    return NextResponse.json(teacher, { status: 201 })
  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถเพิ่มครูได้' },
      { status: 500 }
    )
  }
}
