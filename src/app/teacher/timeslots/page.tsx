"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Timeslot = { 
  id: string
  teacherId: string
  dateTimeStart: string
  dateTimeEnd: string
  isAvailable: boolean
  teacher: {
    id: string
    name: string
  }
  bookings: Array<{
    id: string
    studentId: string
    status: string
  }>
}

export default function TimeslotsPage() {
  const { data: timeslots, mutate, isLoading: timeslotsLoading } = useSWR<Timeslot[]>("/api/timeslots", fetcher)
  const [form, setForm] = useState({ dateTimeStart: '', dateTimeEnd: '' })
  const [isCreating, setIsCreating] = useState(false)

  async function createTs() {
    if (!form.dateTimeStart || !form.dateTimeEnd) return
    
    setIsCreating(true)
    try {
      await fetch('/api/timeslots', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form) 
      })
      setForm({ dateTimeStart: '', dateTimeEnd: '' })
      mutate()
    } catch (error) {
      console.error('Error creating timeslot:', error)
    } finally {
      setIsCreating(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบเวลาสอนนี้?')) return
    
    try {
      await fetch(`/api/timeslots/${id}`, { method: 'DELETE' })
      mutate()
    } catch (error) {
      console.error('Error removing timeslot:', error)
    }
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getBookingCount = (timeslot: Timeslot) => {
    return timeslot.bookings.length
  }

  const upcomingTimeslots = timeslots?.filter(t => new Date(t.dateTimeStart) > new Date()) || []
  const pastTimeslots = timeslots?.filter(t => new Date(t.dateTimeStart) <= new Date()) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">เวลาสอน</h1>
        <p className="text-muted-foreground">
          จัดการเวลาที่สะดวกสอน
        </p>
      </div>

      {/* Add Timeslot Form */}
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มเวลาสอนใหม่</CardTitle>
          <CardDescription>
            กำหนดเวลาที่สะดวกสอน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">วันที่และเวลาเริ่ม</label>
              <Input 
                type="datetime-local"
                value={form.dateTimeStart} 
                onChange={e => setForm({ ...form, dateTimeStart: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">วันที่และเวลาสิ้นสุด</label>
              <Input 
                type="datetime-local"
                value={form.dateTimeEnd} 
                onChange={e => setForm({ ...form, dateTimeEnd: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-0">เพิ่ม</label>
              <Button 
                onClick={createTs} 
                disabled={isCreating || !form.dateTimeStart || !form.dateTimeEnd}
                className="w-full"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังสร้าง...
                  </div>
                ) : (
                  'เพิ่มเวลาสอน'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เวลาสอนทั้งหมด</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeslots?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              เวลาสอนทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เวลาที่กำลังจะมาถึง</CardTitle>
            <span className="text-2xl">⏰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingTimeslots.length}</div>
            <p className="text-xs text-muted-foreground">
              เวลาที่ยังไม่เริ่ม
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เวลาที่ผ่านไปแล้ว</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pastTimeslots.length}</div>
            <p className="text-xs text-muted-foreground">
              เวลาที่เสร็จสิ้นแล้ว
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Timeslots */}
      <Card>
        <CardHeader>
          <CardTitle>เวลาสอนที่กำลังจะมาถึง</CardTitle>
          <CardDescription>
            เวลาสอนที่ยังไม่เริ่ม ({upcomingTimeslots.length} ช่วงเวลา)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeslotsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">กำลังโหลด...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTimeslots.map(timeslot => (
                <div key={timeslot.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📅</span>
                    </div>
                    <div>
                      <p className="font-medium">เวลาสอน</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(timeslot.dateTimeStart)} - {formatDateTime(timeslot.dateTimeEnd)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        การจอง: {getBookingCount(timeslot)} ครั้ง
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => remove(timeslot.id)}
                  >
                    ลบ
                  </Button>
                </div>
              ))}
              
              {upcomingTimeslots.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="text-4xl mb-4 block">⏰</span>
                  <p>ไม่มีเวลาสอนที่กำลังจะมาถึง</p>
                  <p className="text-sm">เพิ่มเวลาสอนใหม่เพื่อเริ่มสอน</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Timeslots */}
      {pastTimeslots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>เวลาสอนที่ผ่านไปแล้ว</CardTitle>
            <CardDescription>
              เวลาสอนที่เสร็จสิ้นแล้ว ({pastTimeslots.length} ช่วงเวลา)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastTimeslots.slice(0, 5).map(timeslot => (
                <div key={timeslot.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div>
                      <p className="font-medium">เวลาสอน</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(timeslot.dateTimeStart)} - {formatDateTime(timeslot.dateTimeEnd)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        การจอง: {getBookingCount(timeslot)} ครั้ง
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => remove(timeslot.id)}
                  >
                    ลบ
                  </Button>
                </div>
              ))}
              
              {pastTimeslots.length > 5 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">และอีก {pastTimeslots.length - 5} ช่วงเวลา</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


