export default function TeacherHome() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Teacher</h1>
      <ul className="list-disc list-inside">
        <li><a className="text-blue-600 underline" href="/teacher/availability">Availability</a></li>
        <li><a className="text-blue-600 underline" href="/teacher/courses">Courses</a></li>
        <li><a className="text-blue-600 underline" href="/teacher/timeslots">Timeslots</a></li>
      </ul>
    </div>
  )
}


