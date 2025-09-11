import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import { compare, hash } from 'bcryptjs'
import type { Role } from '@prisma/client'
import type { JWT } from 'next-auth/jwt'

function hasRole(user: unknown): user is { role: Role } {
  return typeof user === 'object' && user !== null && 'role' in (user as Record<string, unknown>)
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const existing = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!existing) {
          const total = await prisma.user.count()
          if (total === 0) {
            const hashed = await hash(credentials.password, 10)
            const created = await prisma.user.create({
              data: { email: credentials.email, name: null, hashedPassword: hashed, role: 'ADMIN' }
            })
            return { id: created.id, email: created.email, name: created.name, role: created.role }
          }
          return null
        }
        if (!existing.hashedPassword) return null
        const valid = await compare(credentials.password, existing.hashedPassword)
        if (!valid) return null
        return { id: existing.id, email: existing.email, name: existing.name, role: existing.role }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && hasRole(user)) {
        (token as JWT).role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token as JWT).role
        session.user.id = token.sub ?? ''
      }
      return session
    }
  },
  pages: { signIn: '/login' }
}

export const { auth } = NextAuth(authOptions)


