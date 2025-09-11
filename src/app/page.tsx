import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }
  const role = session.user.role
  if (role === 'ADMIN') redirect('/admin')
  if (role === 'TEACHER') redirect('/teacher')
  redirect('/student/calendar')
}
