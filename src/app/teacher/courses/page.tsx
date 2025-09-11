"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Course = { id: string; title: string; description?: string | null; capacity: number }

export default function CoursesPage() {
  const { data, mutate } = useSWR<Course[]>("/api/teacher/courses", fetcher)
  const [form, setForm] = useState({ title: '', description: '', capacity: 1 })

  async function createCourse() {
    await fetch('/api/course', { method: 'POST', body: JSON.stringify(form) })
    mutate()
  }

  return (
    <Card>
      <CardHeader>Courses</CardHeader>
      <div className="grid grid-cols-4 gap-2 items-center">
        <Input placeholder="title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <Input placeholder="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <Input type="number" placeholder="capacity" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} />
        <Button onClick={createCourse}>Add</Button>
      </div>
      <ul className="space-y-2 mt-4">
        {(data ?? []).map(c => (
          <li key={c.id} className="flex justify-between border rounded px-3 py-2">
            <span>{c.title} (cap {c.capacity})</span>
          </li>
        ))}
        {(data?.length ?? 0) === 0 && <p className="text-sm text-gray-500">No courses yet.</p>}
      </ul>
    </Card>
  )
}


