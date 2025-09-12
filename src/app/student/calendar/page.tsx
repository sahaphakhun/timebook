"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import Image from 'next/image'

type Teacher = {
  id: string
  name: string
  email: string
  profileImage: string | null
  bio: string | null
  specialties: string[]
  experience: number | null
  education: string | null
  phone: string | null
  createdAt: string
}

type Timeslot = {
  id: string
  teacherId: string
  dateTimeStart: string
  dateTimeEnd: string
  isAvailable: boolean
  available: boolean
  teacher: {
    id: string
    name: string
    profileImage: string | null
    bio: string | null
    specialties: string[]
    experience: number | null
  }
  bookings: Array<{
    id: string
    studentId: string
    status: string
  }>
}

export default function CalendarPage() {
  const { data: teachers, isLoading: teachersLoading, error: teachersError } = useSWR<Teacher[]>("/api/teachers", fetcher)
  const { data: timeslots, isLoading: timeslotsLoading, error: timeslotsError } = useSWR<Timeslot[]>("/api/timeslots", fetcher)
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
  const [view, setView] = useState<'teachers' | 'timeslots'>('teachers')

  const filteredTimeslots = selectedTeacher 
    ? timeslots?.filter(t => t.teacherId === selectedTeacher) || []
    : timeslots || []

  const availableSlots = filteredTimeslots.filter(s => s.available).length
  const totalSlots = filteredTimeslots.length

  const handleBookLesson = async (timeslotId: string) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeslotId }),
      })

      if (response.ok) {
        alert('จองเรียนเรียบร้อยแล้ว!')
        // Refresh data
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'ไม่สามารถจองเรียนได้')
      }
    } catch (error) {
      console.error('Error booking lesson:', error)
      alert('เกิดข้อผิดพลาดในการจองเรียน')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">เลือกครูและจองเรียน</h1>
        <p className="text-muted-foreground">
          เลือกครูที่ต้องการเรียนด้วยและจองเวลาที่สะดวก
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === 'teachers' ? 'default' : 'outline'}
          onClick={() => setView('teachers')}
        >
          ดูรายการครู
        </Button>
        <Button
          variant={view === 'timeslots' ? 'default' : 'outline'}
          onClick={() => setView('timeslots')}
        >
          ดูเวลาที่ว่าง
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ครูทั้งหมด</CardTitle>
            <span className="text-2xl">👨‍🏫</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              ครูในระบบ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เวลาว่าง</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableSlots}</div>
            <p className="text-xs text-muted-foreground">
              เวลาที่จองได้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เวลาที่จองแล้ว</CardTitle>
            <span className="text-2xl">❌</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalSlots - availableSlots}</div>
            <p className="text-xs text-muted-foreground">
              เวลาที่จองแล้ว
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Teachers List */}
      {view === 'teachers' && (
        <Card>
          <CardHeader>
            <CardTitle>รายการครู</CardTitle>
            <CardDescription>
              เลือกครูที่ต้องการเรียนด้วย
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teachersLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-muted-foreground">กำลังโหลด...</span>
                </div>
              </div>
            )}
            
            {teachersError && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">❌</span>
                  <p className="text-destructive">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
                  <p className="text-sm text-muted-foreground">กรุณาลองใหม่อีกครั้ง</p>
                </div>
              </div>
            )}

            {!teachersLoading && !teachersError && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teachers?.map((teacher) => (
                  <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {teacher.profileImage ? (
                            <Image
                              src={teacher.profileImage}
                              alt={teacher.name || 'ครู'}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              👨‍🏫
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {teacher.name || 'ไม่ระบุชื่อ'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            ประสบการณ์ {teacher.experience || 0} ปี
                          </p>
                          {teacher.bio && (
                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                              {teacher.bio}
                            </p>
                          )}
                          {teacher.specialties && teacher.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {teacher.specialties.map((specialty, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          )}
                          <Button
                            onClick={() => {
                              setSelectedTeacher(teacher.id)
                              setView('timeslots')
                            }}
                            className="w-full"
                          >
                            ดูเวลาที่ว่าง
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeslots List */}
      {view === 'timeslots' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>เวลาที่ว่าง</CardTitle>
                <CardDescription>
                  {selectedTeacher ? 'เวลาของครูที่เลือก' : 'เวลาที่ว่างทั้งหมด'}
                </CardDescription>
              </div>
              {selectedTeacher && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTeacher(null)
                    setView('timeslots')
                  }}
                >
                  ดูทั้งหมด
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {timeslotsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-muted-foreground">กำลังโหลด...</span>
                </div>
              </div>
            )}
            
            {timeslotsError && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">❌</span>
                  <p className="text-destructive">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
                  <p className="text-sm text-muted-foreground">กรุณาลองใหม่อีกครั้ง</p>
                </div>
              </div>
            )}

            {!timeslotsLoading && !timeslotsError && (
              <div className="space-y-4">
                {filteredTimeslots.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-4 block">📅</span>
                    <p className="text-muted-foreground">ไม่มีเวลาที่ว่าง</p>
                  </div>
                ) : (
                  filteredTimeslots.map((timeslot) => (
                    <Card key={timeslot.id} className={`${timeslot.available ? 'border-green-200' : 'border-gray-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              {timeslot.teacher.profileImage ? (
                                <Image
                                  src={timeslot.teacher.profileImage}
                                  alt={timeslot.teacher.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg">
                                  👨‍🏫
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold">{timeslot.teacher.name}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(timeslot.dateTimeStart).toLocaleString('th-TH', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              <p className="text-sm text-gray-500">
                                ถึง {new Date(timeslot.dateTimeEnd).toLocaleString('th-TH', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {timeslot.available ? (
                              <Button
                                onClick={() => handleBookLesson(timeslot.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                จองเรียน
                              </Button>
                            ) : (
                              <Button disabled variant="outline">
                                จองแล้ว
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}


