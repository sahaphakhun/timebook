import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TeacherHome() {
  const teacherFeatures = [
    {
      title: 'ความพร้อมสอน',
      description: 'จัดการเวลาที่พร้อมสอนของครู',
      icon: '⏰',
      href: '/teacher/availability',
      color: 'bg-green-500'
    },
    {
      title: 'คอร์สเรียน',
      description: 'จัดการคอร์สเรียนที่สอน',
      icon: '📚',
      href: '/teacher/courses',
      color: 'bg-blue-500'
    },
    {
      title: 'ตารางเวลา',
      description: 'ดูและจัดการตารางเวลาการสอน',
      icon: '📅',
      href: '/teacher/timeslots',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">แดชบอร์ดครู</h1>
        <p className="text-muted-foreground">
          จัดการคอร์สเรียนและตารางเวลาการสอน
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คอร์สเรียน</CardTitle>
            <span className="text-2xl">📚</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              คอร์สเรียนที่สอน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คาบเรียนวันนี้</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              คาบเรียนที่ต้องสอนวันนี้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การจองใหม่</CardTitle>
            <span className="text-2xl">🆕</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              การจองใหม่วันนี้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">นักเรียน</CardTitle>
            <span className="text-2xl">👨‍🎓</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              นักเรียนที่เรียนด้วย
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teacherFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-2xl text-white">{feature.icon}</span>
                </div>
                <div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={feature.href} className="w-full">
                <Button className="w-full">
                  ไปยัง {feature.title}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>ตารางสอนวันนี้</CardTitle>
          <CardDescription>
            คาบเรียนที่ต้องสอนในวันนี้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <span className="text-4xl mb-4 block">📅</span>
            <p>ยังไม่มีคาบเรียนในวันนี้</p>
            <p className="text-sm">เริ่มต้นด้วยการตั้งค่าความพร้อมสอน</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>การดำเนินการด่วน</CardTitle>
          <CardDescription>
            การดำเนินการที่ใช้บ่อยในระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/teacher/availability">
              <Button variant="outline">
                <span className="mr-2">⏰</span>
                ตั้งค่าความพร้อมสอน
              </Button>
            </Link>
            <Link href="/teacher/courses">
              <Button variant="outline">
                <span className="mr-2">📚</span>
                จัดการคอร์สเรียน
              </Button>
            </Link>
            <Link href="/teacher/timeslots">
              <Button variant="outline">
                <span className="mr-2">📅</span>
                ดูตารางเวลา
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


