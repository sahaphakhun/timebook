import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminHome() {
  const adminFeatures = [
    {
      title: 'จัดการผู้ใช้',
      description: 'เพิ่ม แก้ไข และลบผู้ใช้ในระบบ',
      icon: '👥',
      href: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'บันทึกการใช้งาน',
      description: 'ดูประวัติการใช้งานของระบบ',
      icon: '📋',
      href: '/admin/audit',
      color: 'bg-green-500'
    },
    {
      title: 'รายงานการจอง',
      description: 'ดาวน์โหลดรายงานการจองคาบเรียน',
      icon: '📊',
      href: '/api/report/bookings',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">แดชบอร์ดผู้ดูแลระบบ</h1>
        <p className="text-muted-foreground">
          จัดการระบบและดูข้อมูลสถิติการใช้งาน
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้ใช้ทั้งหมด</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              ครูและนักเรียนในระบบ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คอร์สเรียน</CardTitle>
            <span className="text-2xl">📚</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              คอร์สเรียนทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การจองวันนี้</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              การจองคาบเรียนวันนี้
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ครูที่พร้อม</CardTitle>
            <span className="text-2xl">👨‍🏫</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              ครูที่พร้อมสอนวันนี้
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminFeatures.map((feature, index) => (
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
            <Link href="/admin/users">
              <Button variant="outline">
                <span className="mr-2">👥</span>
                จัดการผู้ใช้
              </Button>
            </Link>
            <Link href="/admin/audit">
              <Button variant="outline">
                <span className="mr-2">📋</span>
                ดูบันทึกการใช้งาน
              </Button>
            </Link>
            <a href="/api/report/bookings" download>
              <Button variant="outline">
                <span className="mr-2">📊</span>
                ดาวน์โหลดรายงาน
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
