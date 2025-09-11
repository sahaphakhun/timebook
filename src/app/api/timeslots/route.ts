import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const now = new Date()
  const slots = await prisma.timeslot.findMany({
    where: { dateTimeEnd: { gte: now } },
    orderBy: { dateTimeStart: 'asc' },
    include: {
      course: { select: { id: true, title: true } },
      _count: {
        select: { bookings: { where: { status: 'BOOKED' } } }
      }
    }
  })

  const data = slots.map(s => ({
    id: s.id,
    course: s.course,
    dateTimeStart: s.dateTimeStart,
    dateTimeEnd: s.dateTimeEnd,
    maxSeat: s.maxSeat,
    bookedCount: s._count.bookings,
    available: s._count.bookings < s.maxSeat
  }))

  return NextResponse.json(data)
}


