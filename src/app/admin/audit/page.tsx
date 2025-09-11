"use client"
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

type Item = { id: string; action: string; createdAt: string; user?: { email: string } | null; meta?: unknown }

export default function AdminAuditPage() {
  const { data } = useSWR<Item[]>("/api/admin/audit?take=100", fetcher)
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Audit Log</h1>
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
        </tbody>
      </table>
    </div>
  )
}


