"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'
import { Card, CardHeader, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    <Card>
      <CardHeader>Availability</CardHeader>
      <div className="flex gap-2 items-center">
        <select value={form.weekday} onChange={e => setForm({ ...form, weekday: Number(e.target.value) })} className="border px-2 py-2 rounded">
          {[0,1,2,3,4,5,6].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <Input value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
        <Input value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
        <Button onClick={addItem}>Add</Button>
      </div>
      <ul className="space-y-2 mt-4">
        {(data ?? []).map(a => (
          <li key={a.id} className="flex justify-between border rounded px-3 py-2">
            <span>Day {a.weekday}: {a.startTime}-{a.endTime}</span>
            <Button variant="danger" onClick={() => remove(a.id)}>Delete</Button>
          </li>
        ))}
        {(data?.length ?? 0) === 0 && <p className="text-sm text-gray-500">No availability yet.</p>}
      </ul>
      <CardFooter />
    </Card>
  )
}


