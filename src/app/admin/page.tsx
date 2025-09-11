export default function AdminHome() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin</h1>
      <ul className="list-disc list-inside">
        <li><a className="text-blue-600 underline" href="/admin/users">Users</a></li>
        <li><a className="text-blue-600 underline" href="/admin/audit">Audit Log</a></li>
        <li><a className="text-blue-600 underline" href="/api/report/bookings">Download Bookings CSV</a></li>
      </ul>
    </div>
  )
}
