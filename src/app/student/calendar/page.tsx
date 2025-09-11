"use client"
import useSWR from 'swr'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { fetcher } from '@/lib/fetcher'
import { Card, CardHeader } from '@/components/ui/card'

type Slot = {
  id: string
  course: { id: string; title: string }
  dateTimeStart: string
  dateTimeEnd: string
  available: boolean
}

export default function CalendarPage() {
  const { data: slots, isLoading, error } = useSWR<Slot[]>("/api/timeslots", fetcher)

  return (
    <Card>
      <CardHeader>Student Calendar</CardHeader>
      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">Failed to load</p>}
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        height={700}
        events={(slots ?? []).map(s => ({
          id: s.id,
          title: s.course.title,
          start: s.dateTimeStart,
          end: s.dateTimeEnd,
          backgroundColor: s.available ? '#4ade80' : '#94a3b8'
        }))}
      />
    </Card>
  )
}


