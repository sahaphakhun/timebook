import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const rows = await prisma.booking.findMany({
    include: {
      timeslot: { include: { course: true } },
      student: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const headers = ['booking_id','status','course_title','timeslot_start','timeslot_end','student_email']
  const csv = [headers.join(','),
    ...rows.map(r => [
      r.id,
      r.status,
      r.timeslot.course.title,
      r.timeslot.dateTimeStart.toISOString(),
      r.timeslot.dateTimeEnd.toISOString(),
      r.student.email
    ].map(v => `"${String(v).replaceAll('"','""')}"`).join(','))
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bookings.csv"'
    }
  })
}


