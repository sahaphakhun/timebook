"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'
import { Card, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Course = { id: string; title: string }
type Timeslot = { id: string; courseId: string; course: Course; dateTimeStart: string; dateTimeEnd: string; maxSeat: number }

export default function TimeslotsPage() {
  const { data, mutate } = useSWR<Timeslot[]>("/api/teacher/timeslots", fetcher)
  const [form, setForm] = useState({ courseId: '', dateTimeStart: '', dateTimeEnd: '', maxSeat: 1 })

  async function createTs() {
    await fetch('/api/teacher/timeslots', { method: 'POST', body: JSON.stringify(form) })
    mutate()
  }

  async function remove(id: string) {
    await fetch(`/api/teacher/timeslots?id=${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <Card>
      <CardHeader>Timeslots</CardHeader>
      <div className="grid grid-cols-5 gap-2 items-center">
        <Input placeholder="courseId" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} className="col-span-1" />
        <Input placeholder="start ISO" value={form.dateTimeStart} onChange={e => setForm({ ...form, dateTimeStart: e.target.value })} className="col-span-1" />
        <Input placeholder="end ISO" value={form.dateTimeEnd} onChange={e => setForm({ ...form, dateTimeEnd: e.target.value })} className="col-span-1" />
        <Input placeholder="maxSeat" type="number" value={form.maxSeat} onChange={e => setForm({ ...form, maxSeat: Number(e.target.value) })} className="col-span-1" />
        <Button onClick={createTs} className="col-span-1">Add</Button>
      </div>
      <ul className="space-y-2 mt-4">
        {(data ?? []).map(t => (
          <li key={t.id} className="flex justify-between border rounded px-3 py-2">
            <span>{t.course.title}: {new Date(t.dateTimeStart).toLocaleString()} - {new Date(t.dateTimeEnd).toLocaleString()} (max {t.maxSeat})</span>
            <Button variant="danger" onClick={() => remove(t.id)}>Delete</Button>
          </li>
        ))}
        {(data?.length ?? 0) === 0 && <p className="text-sm text-gray-500">No timeslots yet.</p>}
      </ul>
    </Card>
  )
}


