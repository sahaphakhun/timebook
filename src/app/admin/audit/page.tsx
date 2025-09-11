"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

type Item = { id: string; action: string; createdAt: string; user?: { email: string } | null; meta?: unknown }

export default function AdminAuditPage() {
  const { data, isLoading } = useSWR<Item[]>("/api/admin/audit?take=100", fetcher)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return '🔐'
    if (action.includes('CREATE')) return '➕'
    if (action.includes('UPDATE')) return '✏️'
    if (action.includes('DELETE')) return '🗑️'
    if (action.includes('BOOK')) return '📅'
    return '📝'
  }

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN')) return 'text-green-600'
    if (action.includes('CREATE')) return 'text-blue-600'
    if (action.includes('UPDATE')) return 'text-yellow-600'
    if (action.includes('DELETE')) return 'text-red-600'
    if (action.includes('BOOK')) return 'text-purple-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">บันทึกการใช้งาน</h1>
        <p className="text-muted-foreground">
          ดูประวัติการใช้งานและกิจกรรมในระบบ
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายการทั้งหมด</CardTitle>
            <span className="text-2xl">📋</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              รายการบันทึก
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การเข้าสู่ระบบ</CardTitle>
            <span className="text-2xl">🔐</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.filter(item => item.action.includes('LOGIN')).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              ครั้ง
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การสร้าง</CardTitle>
            <span className="text-2xl">➕</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.filter(item => item.action.includes('CREATE')).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การจอง</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.filter(item => item.action.includes('BOOK')).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              ครั้ง
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการบันทึกการใช้งาน</CardTitle>
          <CardDescription>
            ประวัติการใช้งานทั้งหมดในระบบ (แสดง 100 รายการล่าสุด)
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
            <div className="space-y-2">
              {(data ?? []).map(row => (
                <div key={row.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getActionIcon(row.action)}</span>
                      <div>
                        <p className={`font-medium ${getActionColor(row.action)}`}>
                          {row.action}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(row.createdAt).toLocaleString('th-TH')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {row.user?.email || 'ไม่ระบุผู้ใช้'}
                      </span>
                      {row.meta && (
                        <button
                          onClick={() => toggleRow(row.id)}
                          className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
                        >
                          {expandedRows.has(row.id) ? 'ซ่อน' : 'ดูรายละเอียด'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {expandedRows.has(row.id) && row.meta && (
                    <div className="mt-3 p-3 bg-muted/30 rounded border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">รายละเอียด:</p>
                      <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(row.meta, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
              
              {(data?.length ?? 0) === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="text-4xl mb-4 block">📋</span>
                  <p>ยังไม่มีบันทึกการใช้งาน</p>
                  <p className="text-sm">กิจกรรมในระบบจะแสดงที่นี่</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


