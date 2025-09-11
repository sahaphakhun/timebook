import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const items = await prisma.timeslot.findMany({
    where: { course: { teacherId: session.user.id } },
    include: { course: true },
    orderBy: { dateTimeStart: 'asc' }
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { courseId, dateTimeStart, dateTimeEnd, maxSeat } = await req.json()
  if (!courseId || !dateTimeStart || !dateTimeEnd) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || (course.teacherId !== session.user.id && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const ts = await prisma.timeslot.create({
    data: { courseId, dateTimeStart: new Date(dateTimeStart), dateTimeEnd: new Date(dateTimeEnd), maxSeat: maxSeat ?? 1 }
  })
  return NextResponse.json(ts, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const ts = await prisma.timeslot.findUnique({ where: { id }, include: { course: true } })
  if (!ts || (ts.course.teacherId !== session.user.id && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const updated = await prisma.timeslot.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const ts = await prisma.timeslot.findUnique({ where: { id }, include: { course: true } })
  if (!ts || (ts.course.teacherId !== session.user.id && session.user.role !== 'ADMIN')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.timeslot.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}


