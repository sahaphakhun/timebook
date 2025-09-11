"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Availability = { id: string; weekday: number; startTime: string; endTime: string }

export default function AvailabilityPage() {
  const { data, mutate, isLoading } = useSWR<Availability[]>("/api/availability", fetcher)
  const [form, setForm] = useState({ weekday: 1, startTime: '09:00', endTime: '10:00' })
  const [isAdding, setIsAdding] = useState(false)

  const weekdays = [
    { value: 0, label: 'อาทิตย์', short: 'อา' },
    { value: 1, label: 'จันทร์', short: 'จ' },
    { value: 2, label: 'อังคาร', short: 'อ' },
    { value: 3, label: 'พุธ', short: 'พ' },
    { value: 4, label: 'พฤหัสบดี', short: 'พฤ' },
    { value: 5, label: 'ศุกร์', short: 'ศ' },
    { value: 6, label: 'เสาร์', short: 'ส' }
  ]

  async function addItem() {
    if (!form.startTime || !form.endTime) return
    
    setIsAdding(true)
    try {
      await fetch('/api/availability', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form) 
      })
      setForm({ weekday: 1, startTime: '09:00', endTime: '10:00' })
      mutate()
    } catch (error) {
      console.error('Error adding availability:', error)
    } finally {
      setIsAdding(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบเวลาความพร้อมนี้?')) return
    
    try {
      await fetch(`/api/availability?id=${id}`, { method: 'DELETE' })
      mutate()
    } catch (error) {
      console.error('Error removing availability:', error)
    }
  }

  const getWeekdayLabel = (weekday: number) => {
    return weekdays.find(w => w.value === weekday)?.label || `วัน ${weekday}`
  }

  const getWeekdayIcon = (weekday: number) => {
    const icons = ['☀️', '🌙', '🌙', '🌙', '🌙', '🌙', '🌙']
    return icons[weekday] || '📅'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ความพร้อมสอน</h1>
        <p className="text-muted-foreground">
          จัดการเวลาที่พร้อมสอนของครู
        </p>
      </div>

      {/* Add Availability Form */}
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มเวลาความพร้อม</CardTitle>
          <CardDescription>
            กำหนดเวลาที่พร้อมสอนในแต่ละวัน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">วัน</label>
              <select 
                value={form.weekday} 
                onChange={e => setForm({ ...form, weekday: Number(e.target.value) })} 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {weekdays.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">เวลาเริ่ม</label>
              <Input 
                type="time"
                value={form.startTime} 
                onChange={e => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">เวลาสิ้นสุด</label>
              <Input 
                type="time"
                value={form.endTime} 
                onChange={e => setForm({ ...form, endTime: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-0">เพิ่ม</label>
              <Button 
                onClick={addItem} 
                disabled={isAdding || !form.startTime || !form.endTime}
                className="w-full"
              >
                {isAdding ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังเพิ่ม...
                  </div>
                ) : (
                  'เพิ่มเวลา'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability List */}
      <Card>
        <CardHeader>
          <CardTitle>ตารางความพร้อมสอน</CardTitle>
          <CardDescription>
            เวลาที่พร้อมสอนทั้งหมด ({data?.length || 0} ช่วงเวลา)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">กำลังโหลด...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(data ?? []).map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-lg">{getWeekdayIcon(a.weekday)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{getWeekdayLabel(a.weekday)}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.startTime} - {a.endTime}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => remove(a.id)}
                  >
                    ลบ
                  </Button>
                </div>
              ))}
              
              {(data?.length ?? 0) === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="text-4xl mb-4 block">⏰</span>
                  <p>ยังไม่มีการตั้งค่าความพร้อมสอน</p>
                  <p className="text-sm">เริ่มต้นด้วยการเพิ่มเวลาความพร้อม</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      {data && data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ภาพรวมสัปดาห์</CardTitle>
            <CardDescription>
              ตารางความพร้อมสอนในแต่ละวัน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-7">
              {weekdays.map(day => {
                const dayAvailabilities = data.filter(a => a.weekday === day.value)
                return (
                  <div key={day.value} className="p-3 border rounded-lg text-center">
                    <div className="font-medium mb-2">{day.short}</div>
                    <div className="space-y-1">
                      {dayAvailabilities.length > 0 ? (
                        dayAvailabilities.map(a => (
                          <div key={a.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {a.startTime}-{a.endTime}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground">ไม่พร้อม</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


