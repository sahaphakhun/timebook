import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { email, name, password, role } = await req.json()
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
  if (!password) return NextResponse.json({ error: 'password required' }, { status: 400 })
  const { hash } = await import('bcryptjs')
  const hashedPassword = await hash(password, 10)
  const user = await prisma.user.create({ data: { email, name, hashedPassword, role } })
  await prisma.auditLog.create({ data: { action: 'USER_CREATE', userId: session.user.id, meta: { id: user.id } } })
  return NextResponse.json(user, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const updated = await prisma.user.update({ where: { id }, data })
  await prisma.auditLog.create({ data: { action: 'USER_UPDATE', userId: session.user.id, meta: { id } } })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await prisma.user.delete({ where: { id } })
  await prisma.auditLog.create({ data: { action: 'USER_DELETE', userId: session.user.id, meta: { id } } })
  return NextResponse.json({ ok: true })
}


