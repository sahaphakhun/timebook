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
  const items = await prisma.availability.findMany({ where: { teacherId: session.user.id }, orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }] })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { weekday, startTime, endTime } = await req.json()
  if (typeof weekday !== 'number' || !startTime || !endTime) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  const a = await prisma.availability.create({ data: { teacherId: session.user.id, weekday, startTime, endTime } })
  return NextResponse.json(a, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const a = await prisma.availability.findUnique({ where: { id } })
  if (!a || a.teacherId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const updated = await prisma.availability.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const a = await prisma.availability.findUnique({ where: { id } })
  if (!a || a.teacherId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.availability.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}


