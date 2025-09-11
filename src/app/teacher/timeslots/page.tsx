"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Course = { id: string; title: string }
type Timeslot = { id: string; courseId: string; course: Course; dateTimeStart: string; dateTimeEnd: string; maxSeat: number }

export default function TimeslotsPage() {
  const { data: timeslots, mutate, isLoading: timeslotsLoading } = useSWR<Timeslot[]>("/api/teacher/timeslots", fetcher)
  const { data: courses } = useSWR<Course[]>("/api/teacher/courses", fetcher)
  const [form, setForm] = useState({ courseId: '', dateTimeStart: '', dateTimeEnd: '', maxSeat: 1 })
  const [isCreating, setIsCreating] = useState(false)

  async function createTs() {
    if (!form.courseId || !form.dateTimeStart || !form.dateTimeEnd) return
    
    setIsCreating(true)
    try {
      await fetch('/api/teacher/timeslots', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form) 
      })
      setForm({ courseId: '', dateTimeStart: '', dateTimeEnd: '', maxSeat: 1 })
      mutate()
    } catch (error) {
      console.error('Error creating timeslot:', error)
    } finally {
      setIsCreating(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคาบเรียนนี้?')) return
    
    try {
      await fetch(`/api/teacher/timeslots?id=${id}`, { method: 'DELETE' })
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

  const getCourseTitle = (courseId: string) => {
    return courses?.find(c => c.id === courseId)?.title || 'ไม่ระบุคอร์ส'
  }

  const upcomingTimeslots = timeslots?.filter(t => new Date(t.dateTimeStart) > new Date()) || []
  const pastTimeslots = timeslots?.filter(t => new Date(t.dateTimeStart) <= new Date()) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ตารางเวลา</h1>
        <p className="text-muted-foreground">
          จัดการตารางเวลาการสอน
        </p>
      </div>

      {/* Add Timeslot Form */}
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มคาบเรียนใหม่</CardTitle>
          <CardDescription>
            สร้างคาบเรียนใหม่สำหรับการสอน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">คอร์สเรียน</label>
              <select 
                value={form.courseId} 
                onChange={e => setForm({ ...form, courseId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">เลือกคอร์สเรียน</option>
                {courses?.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
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
              <label className="text-sm font-medium">จำนวนที่นั่งสูงสุด</label>
              <Input 
                type="number" 
                value={form.maxSeat} 
                onChange={e => setForm({ ...form, maxSeat: Number(e.target.value) })}
                min="1"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-0">เพิ่ม</label>
              <Button 
                onClick={createTs} 
                disabled={isCreating || !form.courseId || !form.dateTimeStart || !form.dateTimeEnd}
                className="w-full"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังสร้าง...
                  </div>
                ) : (
                  'สร้างคาบเรียน'
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
            <CardTitle className="text-sm font-medium">คาบเรียนทั้งหมด</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeslots?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              คาบเรียนทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คาบเรียนที่กำลังจะมาถึง</CardTitle>
            <span className="text-2xl">⏰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingTimeslots.length}</div>
            <p className="text-xs text-muted-foreground">
              คาบเรียนที่ยังไม่เริ่ม
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คาบเรียนที่ผ่านไปแล้ว</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pastTimeslots.length}</div>
            <p className="text-xs text-muted-foreground">
              คาบเรียนที่เสร็จสิ้นแล้ว
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Timeslots */}
      <Card>
        <CardHeader>
          <CardTitle>คาบเรียนที่กำลังจะมาถึง</CardTitle>
          <CardDescription>
            คาบเรียนที่ยังไม่เริ่มสอน ({upcomingTimeslots.length} คาบ)
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
                      <p className="font-medium">{getCourseTitle(timeslot.courseId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(timeslot.dateTimeStart)} - {formatDateTime(timeslot.dateTimeEnd)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        จำนวนที่นั่งสูงสุด: {timeslot.maxSeat} คน
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
                  <p>ไม่มีคาบเรียนที่กำลังจะมาถึง</p>
                  <p className="text-sm">สร้างคาบเรียนใหม่เพื่อเริ่มสอน</p>
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
            <CardTitle>คาบเรียนที่ผ่านไปแล้ว</CardTitle>
            <CardDescription>
              คาบเรียนที่เสร็จสิ้นแล้ว ({pastTimeslots.length} คาบ)
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
                      <p className="font-medium">{getCourseTitle(timeslot.courseId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(timeslot.dateTimeStart)} - {formatDateTime(timeslot.dateTimeEnd)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        จำนวนที่นั่งสูงสุด: {timeslot.maxSeat} คน
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
                  <p className="text-sm">และอีก {pastTimeslots.length - 5} คาบเรียน</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


