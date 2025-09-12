import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/timeslots - ดึงรายการเวลาที่ว่าง
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const whereClause: {
      isAvailable: boolean
      teacherId?: string
      dateTimeStart?: {
        gte: Date
        lte: Date
      }
    } = {
      isAvailable: true
    }

    if (teacherId) {
      whereClause.teacherId = teacherId
    }

    if (startDate && endDate) {
      whereClause.dateTimeStart = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const timeslots = await db.timeslot.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            bio: true,
            specialties: true,
            experience: true
          }
        },
        bookings: {
          select: {
            id: true,
            studentId: true,
            status: true
          }
        }
      },
      orderBy: {
        dateTimeStart: 'asc'
      }
    })

    // เพิ่มข้อมูลว่าแต่ละ timeslot ว่างหรือไม่
    const timeslotsWithAvailability = timeslots.map(timeslot => ({
      ...timeslot,
      available: timeslot.bookings.length === 0
    }))

    return NextResponse.json(timeslotsWithAvailability)
  } catch (error) {
    console.error('Error fetching timeslots:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลเวลาที่ว่างได้' },
      { status: 500 }
    )
  }
}

// POST /api/timeslots - สร้าง timeslot ใหม่ (เฉพาะครู)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'เฉพาะครูเท่านั้นที่สามารถสร้างเวลาสอนได้' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { dateTimeStart, dateTimeEnd } = body

    if (!dateTimeStart || !dateTimeEnd) {
      return NextResponse.json(
        { error: 'กรุณาระบุเวลาเริ่มต้นและสิ้นสุด' },
        { status: 400 }
      )
    }

    const startTime = new Date(dateTimeStart)
    const endTime = new Date(dateTimeEnd)

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'เวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุด' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่าเวลาซ้อนทับกับ timeslot อื่นหรือไม่
    const overlappingTimeslot = await db.timeslot.findFirst({
      where: {
        teacherId: session.user.id,
        isAvailable: true,
        OR: [
          {
            AND: [
              { dateTimeStart: { lte: startTime } },
              { dateTimeEnd: { gt: startTime } }
            ]
          },
          {
            AND: [
              { dateTimeStart: { lt: endTime } },
              { dateTimeEnd: { gte: endTime } }
            ]
          },
          {
            AND: [
              { dateTimeStart: { gte: startTime } },
              { dateTimeEnd: { lte: endTime } }
            ]
          }
        ]
      }
    })

    if (overlappingTimeslot) {
      return NextResponse.json(
        { error: 'เวลานี้ซ้อนทับกับเวลาสอนอื่น' },
        { status: 400 }
      )
    }

    const timeslot = await db.timeslot.create({
      data: {
        teacherId: session.user.id,
        dateTimeStart: startTime,
        dateTimeEnd: endTime
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            bio: true,
            specialties: true
          }
        }
      }
    })

    return NextResponse.json(timeslot, { status: 201 })
  } catch (error) {
    console.error('Error creating timeslot:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถสร้างเวลาสอนได้' },
      { status: 500 }
    )
  }
}