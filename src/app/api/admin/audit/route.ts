import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const take = Number(searchParams.get('take') ?? 100)
  const items = await prisma.auditLog.findMany({
    take,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } }
  })
  return NextResponse.json(items)
}


