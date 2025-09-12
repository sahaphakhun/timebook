"use client"
import { useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export default function TeachersPage() {
  const { data: teachers, isLoading, error, mutate } = useSWR<Teacher[]>("/api/teachers", fetcher)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileImage: '',
    bio: '',
    specialties: '',
    experience: '',
    education: '',
    phone: ''
  })

  const handleAddTeacher = async () => {
    try {
      const specialties = formData.specialties.split(',').map(s => s.trim()).filter(s => s)
      
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          specialties,
          experience: formData.experience ? parseInt(formData.experience) : null
        }),
      })

      if (response.ok) {
        alert('เพิ่มครูเรียบร้อยแล้ว!')
        setShowAddForm(false)
        setFormData({
          name: '',
          email: '',
          profileImage: '',
          bio: '',
          specialties: '',
          experience: '',
          education: '',
          phone: ''
        })
        mutate()
      } else {
        const error = await response.json()
        alert(error.error || 'ไม่สามารถเพิ่มครูได้')
      }
    } catch (error) {
      console.error('Error adding teacher:', error)
      alert('เกิดข้อผิดพลาดในการเพิ่มครู')
    }
  }

  const handleEditTeacher = async () => {
    if (!editingTeacher) return

    try {
      const specialties = formData.specialties.split(',').map(s => s.trim()).filter(s => s)
      
      const response = await fetch(`/api/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          specialties,
          experience: formData.experience ? parseInt(formData.experience) : null
        }),
      })

      if (response.ok) {
        alert('แก้ไขข้อมูลครูเรียบร้อยแล้ว!')
        setEditingTeacher(null)
        setFormData({
          name: '',
          email: '',
          profileImage: '',
          bio: '',
          specialties: '',
          experience: '',
          education: '',
          phone: ''
        })
        mutate()
      } else {
        const error = await response.json()
        alert(error.error || 'ไม่สามารถแก้ไขข้อมูลครูได้')
      }
    } catch (error) {
      console.error('Error editing teacher:', error)
      alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูลครู')
    }
  }

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบครูคนนี้?')) return

    try {
      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('ลบครูเรียบร้อยแล้ว!')
        mutate()
      } else {
        const error = await response.json()
        alert(error.error || 'ไม่สามารถลบครูได้')
      }
    } catch (error) {
      console.error('Error deleting teacher:', error)
      alert('เกิดข้อผิดพลาดในการลบครู')
    }
  }

  const startEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      profileImage: teacher.profileImage || '',
      bio: teacher.bio || '',
      specialties: teacher.specialties.join(', '),
      experience: teacher.experience?.toString() || '',
      education: teacher.education || '',
      phone: teacher.phone || ''
    })
  }

  const cancelEdit = () => {
    setEditingTeacher(null)
    setFormData({
      name: '',
      email: '',
      profileImage: '',
      bio: '',
      specialties: '',
      experience: '',
      education: '',
      phone: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">จัดการครู</h1>
          <p className="text-muted-foreground">
            เพิ่ม แก้ไข และลบข้อมูลครูในระบบ
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          เพิ่มครูใหม่
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingTeacher) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTeacher ? 'แก้ไขข้อมูลครู' : 'เพิ่มครูใหม่'}
            </CardTitle>
            <CardDescription>
              กรอกข้อมูลครูที่ต้องการ{editingTeacher ? 'แก้ไข' : 'เพิ่ม'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">ชื่อ</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ชื่อครู"
                />
              </div>
              <div>
                <label className="text-sm font-medium">อีเมล</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="อีเมลครู"
                />
              </div>
              <div>
                <label className="text-sm font-medium">รูปโปรไฟล์ (URL)</label>
                <Input
                  value={formData.profileImage}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="text-sm font-medium">เบอร์โทรศัพท์</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="เบอร์โทรศัพท์"
                />
              </div>
              <div>
                <label className="text-sm font-medium">ประสบการณ์ (ปี)</label>
                <Input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="จำนวนปี"
                />
              </div>
              <div>
                <label className="text-sm font-medium">การศึกษา</label>
                <Input
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="ระดับการศึกษา"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">ความเชี่ยวชาญ (คั่นด้วยจุลภาค)</label>
              <Input
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                placeholder="คณิตศาสตร์, วิทยาศาสตร์, ภาษาอังกฤษ"
              />
            </div>
            <div>
              <label className="text-sm font-medium">ประวัติ</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="ประวัติและประสบการณ์ของครู"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingTeacher ? handleEditTeacher : handleAddTeacher}
                className="bg-green-600 hover:bg-green-700"
              >
                {editingTeacher ? 'บันทึกการแก้ไข' : 'เพิ่มครู'}
              </Button>
              <Button
                variant="outline"
                onClick={editingTeacher ? cancelEdit : () => setShowAddForm(false)}
              >
                ยกเลิก
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teachers List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการครู</CardTitle>
          <CardDescription>
            ครูทั้งหมดในระบบ ({teachers?.length || 0} คน)
          </CardDescription>
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
            <div className="space-y-4">
              {teachers?.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">👨‍🏫</span>
                  <p className="text-muted-foreground">ยังไม่มีครูในระบบ</p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4"
                  >
                    เพิ่มครูคนแรก
                  </Button>
                </div>
              ) : (
                teachers?.map((teacher) => (
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
                            {teacher.email}
                          </p>
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
                          <div className="flex gap-2">
                            <Button
                              onClick={() => startEdit(teacher)}
                              variant="outline"
                              size="sm"
                            >
                              แก้ไข
                            </Button>
                            <Button
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              ลบ
                            </Button>
                          </div>
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
    </div>
  )
}
