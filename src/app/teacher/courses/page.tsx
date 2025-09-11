"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'

type Course = { id: string; title: string; description?: string | null; capacity: number }

export default function CoursesPage() {
  const { data, mutate } = useSWR<Course[]>("/api/teacher/courses", fetcher)
  const [form, setForm] = useState({ title: '', description: '', capacity: 1 })

  async function createCourse() {
    await fetch('/api/course', { method: 'POST', body: JSON.stringify(form) })
    mutate()
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Courses</h1>
      <div className="grid grid-cols-4 gap-2 items-center">
        <input placeholder="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="border px-2 py-1 rounded" />
        <input placeholder="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border px-2 py-1 rounded" />
        <input type="number" placeholder="capacity" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} className="border px-2 py-1 rounded" />
        <button onClick={createCourse} className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
      </div>
      <ul className="space-y-2">
        {(data ?? []).map(c => (
          <li key={c.id} className="flex justify-between border rounded px-3 py-2">
            <span>{c.title} (cap {c.capacity})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}


