"use client"
import useSWR from 'swr'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { fetcher } from '@/lib/fetcher'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

type Slot = {
  id: string
  course: { id: string; title: string }
  dateTimeStart: string
  dateTimeEnd: string
  available: boolean
}

export default function CalendarPage() {
  const { data: slots, isLoading, error } = useSWR<Slot[]>("/api/timeslots", fetcher)
  const [view, setView] = useState<'timeGridWeek' | 'dayGridMonth'>('timeGridWeek')

  const calendarEvents = (slots ?? []).map(s => ({
    id: s.id,
    title: s.course.title,
    start: s.dateTimeStart,
    end: s.dateTimeEnd,
    backgroundColor: s.available ? '#22c55e' : '#94a3b8',
    borderColor: s.available ? '#16a34a' : '#64748b',
    textColor: s.available ? '#ffffff' : '#ffffff',
    classNames: s.available ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-60'
  }))

  const availableSlots = slots?.filter(s => s.available).length || 0
  const totalSlots = slots?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ตารางเรียน</h1>
        <p className="text-muted-foreground">
          ดูและจองคาบเรียนที่ต้องการ
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คาบเรียนทั้งหมด</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSlots}</div>
            <p className="text-xs text-muted-foreground">
              คาบเรียนในระบบ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คาบเรียนว่าง</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableSlots}</div>
            <p className="text-xs text-muted-foreground">
              คาบเรียนที่จองได้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คาบเรียนเต็ม</CardTitle>
            <span className="text-2xl">❌</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalSlots - availableSlots}</div>
            <p className="text-xs text-muted-foreground">
              คาบเรียนที่จองแล้ว
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>ปฏิทินคาบเรียน</CardTitle>
              <CardDescription>
                คลิกที่คาบเรียนเพื่อจอง (สีเขียว = ว่าง, สีเทา = เต็ม)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === 'timeGridWeek' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('timeGridWeek')}
              >
                สัปดาห์
              </Button>
              <Button
                variant={view === 'dayGridMonth' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('dayGridMonth')}
              >
                เดือน
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">กำลังโหลด...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <span className="text-4xl mb-4 block">❌</span>
                <p className="text-destructive">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
                <p className="text-sm text-muted-foreground">กรุณาลองใหม่อีกครั้ง</p>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <div className="rounded-lg overflow-hidden border">
              <FullCalendar
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView={view}
                height={700}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'timeGridWeek,dayGridMonth'
                }}
                buttonText={{
                  today: 'วันนี้',
                  month: 'เดือน',
                  week: 'สัปดาห์'
                }}
                events={calendarEvents}
                eventClick={(info) => {
                  if (info.event.backgroundColor === '#22c55e') {
                    // Handle booking logic here
                    alert(`จองคาบเรียน: ${info.event.title}`)
                  } else {
                    alert('คาบเรียนนี้เต็มแล้ว')
                  }
                }}
                eventClassNames={(event) => {
                  return event.backgroundColor === '#22c55e' 
                    ? 'cursor-pointer hover:opacity-80' 
                    : 'cursor-not-allowed opacity-60'
                }}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                nowIndicator={true}
                locale="th"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>คำอธิบายสี</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">คาบเรียนว่าง (จองได้)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-sm">คาบเรียนเต็ม (จองไม่ได้)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


