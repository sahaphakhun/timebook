import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role
  if (!session?.user?.id || (role !== 'TEACHER' && role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()
  const { title, description, capacity } = body
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })
  const course = await prisma.course.create({
    data: { title, description, capacity: capacity ?? 1, teacherId: session.user.id }
  })
  await prisma.auditLog.create({ data: { action: 'COURSE_CREATE', userId: session.user.id, meta: { courseId: course.id } } })
  return NextResponse.json(course, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const course = await prisma.course.findUnique({ where: { id } })
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const isTeacherOwner = course.teacherId === session.user.id
  const isAdmin = session.user.role === 'ADMIN'
  if (!isTeacherOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const updated = await prisma.course.update({ where: { id }, data })
  await prisma.auditLog.create({ data: { action: 'COURSE_UPDATE', userId: session.user.id, meta: { id } } })
  return NextResponse.json(updated)
}


