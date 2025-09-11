"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'
type User = { id: string; email: string; name?: string | null; role: Role }

export default function AdminUsersPage() {
  const { data, mutate } = useSWR<User[]>("/api/admin/users", fetcher)
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'STUDENT' as Role })

  async function createUser() {
    await fetch('/api/admin/users', { method: 'POST', body: JSON.stringify(form) })
    setForm({ email: '', name: '', password: '', role: 'STUDENT' })
    mutate()
  }

  async function removeUser(id: string) {
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <Card>
      <CardHeader>Users</CardHeader>
      <div className="grid grid-cols-6 gap-2 items-center">
        <Input placeholder="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Input placeholder="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input type="password" placeholder="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })} className="border px-2 py-2 rounded">
          {(['ADMIN','TEACHER','STUDENT'] as Role[]).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <Button onClick={createUser} className="col-span-1">Add</Button>
      </div>
      <ul className="space-y-2 mt-4">
        {(data ?? []).map(u => (
          <li key={u.id} className="flex justify-between border rounded px-3 py-2">
            <span>{u.email} — {u.role}</span>
            <Button variant="danger" onClick={() => removeUser(u.id)}>Delete</Button>
          </li>
        ))}
        {(data?.length ?? 0) === 0 && <p className="text-sm text-gray-500">No users yet.</p>}
      </ul>
    </Card>
  )
}


