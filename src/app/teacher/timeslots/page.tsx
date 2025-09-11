"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'

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
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Timeslots</h1>
      <div className="grid grid-cols-5 gap-2 items-center">
        <input placeholder="courseId" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} className="border px-2 py-1 rounded col-span-1" />
        <input placeholder="start ISO" value={form.dateTimeStart} onChange={e => setForm({ ...form, dateTimeStart: e.target.value })} className="border px-2 py-1 rounded col-span-1" />
        <input placeholder="end ISO" value={form.dateTimeEnd} onChange={e => setForm({ ...form, dateTimeEnd: e.target.value })} className="border px-2 py-1 rounded col-span-1" />
        <input placeholder="maxSeat" type="number" value={form.maxSeat} onChange={e => setForm({ ...form, maxSeat: Number(e.target.value) })} className="border px-2 py-1 rounded col-span-1" />
        <button onClick={createTs} className="bg-blue-600 text-white px-3 py-1 rounded col-span-1">Add</button>
      </div>
      <ul className="space-y-2">
        {(data ?? []).map(t => (
          <li key={t.id} className="flex justify-between border rounded px-3 py-2">
            <span>{t.course.title}: {new Date(t.dateTimeStart).toLocaleString()} - {new Date(t.dateTimeEnd).toLocaleString()} (max {t.maxSeat})</span>
            <button onClick={() => remove(t.id)} className="text-red-600">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}


