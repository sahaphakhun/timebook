"use client"
import useSWR from 'swr'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { fetcher } from '@/lib/fetcher'

type Slot = {
  id: string
  course: { id: string; title: string }
  dateTimeStart: string
  dateTimeEnd: string
  available: boolean
}

export default function CalendarPage() {
  const { data: slots } = useSWR<Slot[]>("/api/timeslots", fetcher)

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Calendar</h1>
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={(slots ?? []).map(s => ({
          id: s.id,
          title: s.course.title,
          start: s.dateTimeStart,
          end: s.dateTimeEnd,
          backgroundColor: s.available ? '#4ade80' : '#94a3b8'
        }))}
      />
    </div>
  )
}


