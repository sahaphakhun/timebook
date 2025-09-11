import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { timeslotId } = await req.json()
  if (!timeslotId) return NextResponse.json({ error: 'timeslotId required' }, { status: 400 })

  try {
    const result = await prisma.$transaction(async (tx) => {
      const slot = await tx.timeslot.findUnique({
        where: { id: timeslotId },
        include: { _count: { select: { bookings: { where: { status: 'BOOKED' } } } } }
      })
      if (!slot) throw new Error('Timeslot not found')
      if (slot._count.bookings >= slot.maxSeat) throw new Error('No seats left')

      const booking = await tx.booking.create({
        data: { timeslotId, studentId: session.user.id }
      })
      await tx.auditLog.create({ data: { action: 'BOOK', userId: session.user.id, meta: { timeslotId } } })
      return booking
    })
    return NextResponse.json(result, { status: 201 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const hours = Number(process.env.BOOKING_CANCEL_BEFORE_HOURS ?? 0)
  try {
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        include: { timeslot: true }
      })
      if (!booking || booking.studentId !== session.user.id) throw new Error('Not found')
      const diffMs = booking.timeslot.dateTimeStart.getTime() - Date.now()
      const diffHours = diffMs / (1000 * 60 * 60)
      if (diffHours < hours) throw new Error('Cannot cancel within restricted hours')

      const deleted = await tx.booking.update({ where: { id }, data: { status: 'CANCELLED' } })
      await tx.auditLog.create({ data: { action: 'CANCEL', userId: session.user.id, meta: { id } } })
      return deleted
    })
    return NextResponse.json(result)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}


