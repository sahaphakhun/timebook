"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export function Navbar({ role }: { role?: 'ADMIN'|'TEACHER'|'STUDENT' }) {
  const pathname = usePathname()
  const Item = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} className={`px-3 py-2 rounded ${pathname.startsWith(href) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>{label}</Link>
  )
  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
        <Link href="/" className="font-semibold">Timebook</Link>
        <div className="flex items-center gap-2">
          {role === 'ADMIN' && (<>
            <Item href="/admin" label="Admin" />
            <Item href="/admin/users" label="Users" />
            <Item href="/admin/audit" label="Audit" />
          </>)}
          {role === 'TEACHER' && (<>
            <Item href="/teacher" label="Teacher" />
            <Item href="/teacher/courses" label="Courses" />
            <Item href="/teacher/timeslots" label="Timeslots" />
          </>)}
          {role === 'STUDENT' && <Item href="/student/calendar" label="Calendar" />}
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="px-3 py-2 rounded hover:bg-gray-100">Sign out</button>
        </div>
      </div>
    </nav>
  )
}


