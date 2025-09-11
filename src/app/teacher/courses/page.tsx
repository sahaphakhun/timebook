"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Course = { id: string; title: string; description?: string | null; capacity: number }

export default function CoursesPage() {
  const { data, mutate, isLoading } = useSWR<Course[]>("/api/teacher/courses", fetcher)
  const [form, setForm] = useState({ title: '', description: '', capacity: 1 })
  const [isCreating, setIsCreating] = useState(false)

  async function createCourse() {
    if (!form.title.trim()) return
    
    setIsCreating(true)
    try {
      await fetch('/api/course', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form) 
      })
      setForm({ title: '', description: '', capacity: 1 })
      mutate()
    } catch (error) {
      console.error('Error creating course:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">คอร์สเรียน</h1>
        <p className="text-muted-foreground">
          จัดการคอร์สเรียนที่สอน
        </p>
      </div>

      {/* Add Course Form */}
      <Card>
        <CardHeader>
          <CardTitle>เพิ่มคอร์สเรียนใหม่</CardTitle>
          <CardDescription>
            สร้างคอร์สเรียนใหม่สำหรับการสอน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ชื่อคอร์ส</label>
              <Input 
                placeholder="กรอกชื่อคอร์สเรียน" 
                value={form.title} 
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">คำอธิบาย</label>
              <Input 
                placeholder="กรอกคำอธิบายคอร์ส" 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">จำนวนนักเรียนสูงสุด</label>
              <Input 
                type="number" 
                placeholder="จำนวน" 
                value={form.capacity} 
                onChange={e => setForm({ ...form, capacity: Number(e.target.value) })}
                min="1"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium opacity-0">เพิ่ม</label>
              <Button 
                onClick={createCourse} 
                disabled={isCreating || !form.title.trim()}
                className="w-full"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังสร้าง...
                  </div>
                ) : (
                  'สร้างคอร์ส'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการคอร์สเรียน</CardTitle>
          <CardDescription>
            คอร์สเรียนทั้งหมด ({data?.length || 0} คอร์ส)
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(data ?? []).map(course => (
                <div key={course.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{course.title}</h3>
                      {course.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>👥</span>
                          <span>สูงสุด {course.capacity} คน</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {(data?.length ?? 0) === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <span className="text-4xl mb-4 block">📚</span>
                  <p>ยังไม่มีคอร์สเรียน</p>
                  <p className="text-sm">เริ่มต้นด้วยการสร้างคอร์สเรียนแรก</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      {data && data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">คอร์สทั้งหมด</CardTitle>
              <span className="text-2xl">📚</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.length}</div>
              <p className="text-xs text-muted-foreground">
                คอร์สเรียนที่สอน
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ความจุรวม</CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.reduce((sum, course) => sum + course.capacity, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                นักเรียนทั้งหมด
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ความจุเฉลี่ย</CardTitle>
              <span className="text-2xl">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(data.reduce((sum, course) => sum + course.capacity, 0) / data.length)}
              </div>
              <p className="text-xs text-muted-foreground">
                ต่อคอร์ส
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


