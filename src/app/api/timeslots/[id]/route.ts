import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// DELETE /api/timeslots/[id] - ลบ timeslot (เฉพาะครูเจ้าของ)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'เฉพาะครูเท่านั้นที่สามารถลบเวลาสอนได้' },
        { status: 403 }
      )
    }

    const { id } = await params
    // ตรวจสอบว่า timeslot มีอยู่และเป็นของครูคนนี้หรือไม่
    const timeslot = await db.timeslot.findUnique({
      where: { id },
      include: {
        bookings: true
      }
    })

    if (!timeslot) {
      return NextResponse.json(
        { error: 'ไม่พบเวลาสอนที่ต้องการลบ' },
        { status: 404 }
      )
    }

    if (timeslot.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์ลบเวลาสอนนี้' },
        { status: 403 }
      )
    }

    // ตรวจสอบว่ามีการจองหรือไม่
    if (timeslot.bookings.length > 0) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบเวลาสอนที่มีการจองแล้วได้' },
        { status: 400 }
      )
    }

    await db.timeslot.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'ลบเวลาสอนเรียบร้อยแล้ว' })
  } catch (error) {
    console.error('Error deleting timeslot:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถลบเวลาสอนได้' },
      { status: 500 }
    )
  }
}
