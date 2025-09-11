import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { Role } from '@prisma/client'

export type NextRequestHandler = (req: NextRequest) => Promise<Response> | Response

export const withRole = (roles: Role[]) => (handler: NextRequestHandler) => {
  return async (req: NextRequest) => {
    const session = await getServerSession(authOptions)
    const role: Role | undefined = session?.user?.role
    if (!session || !role || !roles.includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return handler(req)
  }
}


