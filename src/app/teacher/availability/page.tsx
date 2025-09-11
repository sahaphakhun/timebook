"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'

type Availability = { id: string; weekday: number; startTime: string; endTime: string }

export default function AvailabilityPage() {
  const { data, mutate } = useSWR<Availability[]>("/api/availability", fetcher)
  const [form, setForm] = useState({ weekday: 1, startTime: '09:00', endTime: '10:00' })

  async function addItem() {
    await fetch('/api/availability', { method: 'POST', body: JSON.stringify(form) })
    mutate()
  }

  async function remove(id: string) {
    await fetch(`/api/availability?id=${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Availability</h1>
      <div className="flex gap-2 items-center">
        <select value={form.weekday} onChange={e => setForm({ ...form, weekday: Number(e.target.value) })} className="border px-2 py-1 rounded">
          {[0,1,2,3,4,5,6].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="border px-2 py-1 rounded" />
        <input value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="border px-2 py-1 rounded" />
        <button onClick={addItem} className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
      </div>
      <ul className="space-y-2">
        {(data ?? []).map(a => (
          <li key={a.id} className="flex justify-between border rounded px-3 py-2">
            <span>Day {a.weekday}: {a.startTime}-{a.endTime}</span>
            <button onClick={() => remove(a.id)} className="text-red-600">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}


