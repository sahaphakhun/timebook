import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const items = await prisma.course.findMany({ where: { teacherId: session.user.id }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(items)
}


