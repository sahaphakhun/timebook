"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function Navbar({ role }: { role?: 'ADMIN'|'TEACHER'|'STUDENT' }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const Item = ({ href, label, icon }: { href: string; label: string; icon?: string }) => (
    <Link 
      href={href} 
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        pathname.startsWith(href) 
          ? 'bg-primary text-primary-foreground shadow-sm' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {label}
    </Link>
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return '👨‍💼'
      case 'TEACHER': return '👨‍🏫'
      case 'STUDENT': return '👨‍🎓'
      default: return '👤'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'ผู้ดูแลระบบ'
      case 'TEACHER': return 'ครู'
      case 'STUDENT': return 'นักเรียน'
      default: return 'ผู้ใช้'
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <span className="text-2xl">📚</span>
            <span>Timebook</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {role === 'ADMIN' && (
              <>
                <Item href="/admin" label="แดชบอร์ด" icon="📊" />
                <Item href="/admin/users" label="จัดการผู้ใช้" icon="👥" />
                <Item href="/admin/audit" label="บันทึกการใช้งาน" icon="📋" />
              </>
            )}
            {role === 'TEACHER' && (
              <>
                <Item href="/teacher" label="แดชบอร์ด" icon="📊" />
                <Item href="/teacher/availability" label="ความพร้อม" icon="⏰" />
                <Item href="/teacher/courses" label="คอร์สเรียน" icon="📚" />
                <Item href="/teacher/timeslots" label="ตารางเวลา" icon="📅" />
              </>
            )}
            {role === 'STUDENT' && (
              <Item href="/student/calendar" label="ตารางเรียน" icon="📅" />
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {role && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                <span className="text-lg">{getRoleIcon(role)}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {getRoleLabel(role)}
                </span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="gap-2"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </Button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="text-xl">
                {isMobileMenuOpen ? '✕' : '☰'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-card/95 backdrop-blur">
            <div className="px-2 py-4 space-y-1">
              {role === 'ADMIN' && (
                <>
                  <Item href="/admin" label="แดชบอร์ด" icon="📊" />
                  <Item href="/admin/users" label="จัดการผู้ใช้" icon="👥" />
                  <Item href="/admin/audit" label="บันทึกการใช้งาน" icon="📋" />
                </>
              )}
              {role === 'TEACHER' && (
                <>
                  <Item href="/teacher" label="แดชบอร์ด" icon="📊" />
                  <Item href="/teacher/availability" label="ความพร้อม" icon="⏰" />
                  <Item href="/teacher/courses" label="คอร์สเรียน" icon="📚" />
                  <Item href="/teacher/timeslots" label="ตารางเวลา" icon="📅" />
                </>
              )}
              {role === 'STUDENT' && (
                <Item href="/student/calendar" label="ตารางเรียน" icon="📅" />
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}


