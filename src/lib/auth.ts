import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import { compare } from 'bcryptjs'
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
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.hashedPassword) return null
        const valid = await compare(credentials.password, user.hashedPassword)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role }
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


