import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/bookings - ดึงรายการการจอง
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'ต้องเข้าสู่ระบบก่อน' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = session.user.role

    let bookings

    if (role === 'STUDENT') {
      // นักเรียนเห็นการจองของตัวเอง
      bookings = await db.booking.findMany({
        where: {
          studentId: session.user.id
        },
        include: {
          timeslot: {
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
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else if (role === 'TEACHER') {
      // ครูเห็นการจองของนักเรียนที่จองกับตัวเอง
      bookings = await db.booking.findMany({
        where: {
          teacherId: session.user.id
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          timeslot: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else if (role === 'ADMIN') {
      // แอดมินเห็นการจองทั้งหมด
      bookings = await db.booking.findMany({
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          timeslot: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      return NextResponse.json(
        { error: 'ไม่มีสิทธิ์เข้าถึง' },
        { status: 403 }
      )
    }

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลการจองได้' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - จองเวลาสอน
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'เฉพาะนักเรียนเท่านั้นที่สามารถจองได้' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { timeslotId, notes } = body

    if (!timeslotId) {
      return NextResponse.json(
        { error: 'กรุณาระบุเวลาที่ต้องการจอง' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่า timeslot มีอยู่และว่างหรือไม่
    const timeslot = await db.timeslot.findUnique({
      where: { id: timeslotId },
      include: {
        teacher: true,
        bookings: true
      }
    })

    if (!timeslot) {
      return NextResponse.json(
        { error: 'ไม่พบเวลาที่ต้องการจอง' },
        { status: 404 }
      )
    }

    if (!timeslot.isAvailable) {
      return NextResponse.json(
        { error: 'เวลานี้ไม่ว่างสำหรับการจอง' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่าจองซ้ำหรือไม่
    const existingBooking = await db.booking.findUnique({
      where: {
        timeslotId_studentId: {
          timeslotId,
          studentId: session.user.id
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'คุณได้จองเวลานี้ไปแล้ว' },
        { status: 400 }
      )
    }

    // สร้างการจอง
    const booking = await db.booking.create({
      data: {
        timeslotId,
        studentId: session.user.id,
        teacherId: timeslot.teacherId,
        notes
      },
      include: {
        timeslot: {
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
        }
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถจองเวลาได้' },
      { status: 500 }
    )
  }
}
