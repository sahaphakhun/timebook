"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'
type User = { id: string; email: string; name?: string | null; role: Role }

export default function AdminUsersPage() {
  const { data, mutate } = useSWR<User[]>("/api/admin/users", fetcher)
  const [form, setForm] = useState({ email: '', name: '', role: 'STUDENT' as Role })

  async function createUser() {
    await fetch('/api/admin/users', { method: 'POST', body: JSON.stringify(form) })
    setForm({ email: '', name: '', role: 'STUDENT' })
    mutate()
  }

  async function removeUser(id: string) {
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Users</h1>
      <div className="grid grid-cols-5 gap-2 items-center">
        <input placeholder="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border px-2 py-1 rounded" />
        <input placeholder="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border px-2 py-1 rounded" />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as Role })} className="border px-2 py-1 rounded">
          {(['ADMIN','TEACHER','STUDENT'] as Role[]).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={createUser} className="bg-blue-600 text-white px-3 py-1 rounded col-span-1">Add</button>
      </div>
      <ul className="space-y-2">
        {(data ?? []).map(u => (
          <li key={u.id} className="flex justify-between border rounded px-3 py-2">
            <span>{u.email} — {u.role}</span>
            <button onClick={() => removeUser(u.id)} className="text-red-600">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}


