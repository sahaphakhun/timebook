"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'
type User = { id: string; email: string; name?: string | null; role: Role }

export default function AdminUsersPage() {
  const { data, mutate, isLoading } = useSWR<User[]>("/api/admin/users", fetcher)
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'STUDENT' as Role })
  const [isCreating, setIsCreating] = useState(false)

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'ADMIN': return 'ผู้ดูแลระบบ'
      case 'TEACHER': return 'ครู'
      case 'STUDENT': return 'นักเรียน'
      default: return role
    }
  }

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'ADMIN': return '👨‍💼'
      case 'TEACHER': return '👨‍🏫'
      case 'STUDENT': return '👨‍🎓'
      default: return '👤'
    }
  }

  async function createUser() {
    if (!form.email || !form.password) return
    
    setIsCreating(true)
    try {
      await fetch('/api/admin/users', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form) 
      })
      setForm({ email: '', name: '', password: '', role: 'STUDENT' })
      mutate()
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setIsCreating(false)
    }
  }

  async function removeUser(id: string) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return
    
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
      mutate()
    } catch (error) {
      console.error('Error removing user:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">จัดการผู้ใช้</h1>
        <p className="text-muted-foreground">
          เพิ่ม แก้ไข และลบผู้ใช้ในระบบ
        </p>
      </div>

      {/* Add User Form */}
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มผู้ใช้ใหม่</CardTitle>
          <CardDescription>
            กรอกข้อมูลเพื่อเพิ่มผู้ใช้ใหม่ในระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">อีเมล</label>
              <Input 
                placeholder="กรอกอีเมล" 
                value={form.email} 
                onChange={e => setForm({ ...form, email: e.target.value })}
                type="email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">ชื่อ</label>
              <Input 
                placeholder="กรอกชื่อ" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">รหัสผ่าน</label>
              <Input 
                type="password" 
                placeholder="กรอกรหัสผ่าน" 
                value={form.password} 
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">บทบาท</label>
              <select 
                value={form.role} 
                onChange={e => setForm({ ...form, role: e.target.value as Role })} 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {(['ADMIN','TEACHER','STUDENT'] as Role[]).map(r => (
                  <option key={r} value={r}>{getRoleLabel(r)}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-0">เพิ่ม</label>
              <Button 
                onClick={createUser} 
                disabled={isCreating || !form.email || !form.password}
                className="w-full"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังเพิ่ม...
                  </div>
                ) : (
                  'เพิ่มผู้ใช้'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อผู้ใช้</CardTitle>
          <CardDescription>
            ผู้ใช้ทั้งหมดในระบบ ({data?.length || 0} คน)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">กำลังโหลด...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(data ?? []).map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-lg">{getRoleIcon(u.role)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{u.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {u.name && `${u.name} • `}{getRoleLabel(u.role)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeUser(u.id)}
                  >
                    ลบ
                  </Button>
                </div>
              ))}
              
              {(data?.length ?? 0) === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="text-4xl mb-4 block">👥</span>
                  <p>ยังไม่มีผู้ใช้ในระบบ</p>
                  <p className="text-sm">เริ่มต้นด้วยการเพิ่มผู้ใช้คนแรก</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


