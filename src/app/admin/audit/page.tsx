"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Card, CardHeader } from '@/components/ui/card'

type Item = { id: string; action: string; createdAt: string; user?: { email: string } | null; meta?: unknown }

export default function AdminAuditPage() {
  const { data } = useSWR<Item[]>("/api/admin/audit?take=100", fetcher)
  return (
    <Card>
      <CardHeader>Audit Log</CardHeader>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Time</th>
            <th>Action</th>
            <th>User</th>
            <th>Meta</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map(row => (
            <tr key={row.id} className="border-b">
              <td className="py-2">{new Date(row.createdAt).toLocaleString()}</td>
              <td>{row.action}</td>
              <td>{row.user?.email ?? '-'}</td>
              <td><pre className="whitespace-pre-wrap">{JSON.stringify(row.meta)}</pre></td>
            </tr>
          ))}
          {(data?.length ?? 0) === 0 && (
            <tr><td colSpan={4} className="py-3 text-sm text-gray-500">No logs.</td></tr>
          )}
        </tbody>
      </table>
    </Card>
  )
}


