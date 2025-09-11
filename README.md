# Timebook

เว็บแอปจองคอร์ส/คลาสเดี่ยวแบบ Monorepo เดียว (Next.js App Router) ใช้ Prisma + PostgreSQL, NextAuth (JWT) และ RBAC แบบง่าย รันบน Railway ด้วย Dockerfile เดียว

## สแต็ก
- **UI**: React 19, Next.js App Router, Tailwind CSS, FullCalendar React
- **ฟอร์ม**: React-Hook-Form + Zod
- **สถานะ client**: Zustand
- **Auth & RBAC**: NextAuth (JWT) + prisma-adapter + `middleware.ts`
- **ORM**: Prisma (PostgreSQL)
- **ทดสอบ**: Vitest + React Testing Library
- **CI**: GitHub Actions (build + prisma generate)
- **Deploy**: Railway (Dockerfile เดียว)

## โครงสร้าง
```
prisma/schema.prisma
src/
  app/ (routes)
    api/...
    admin/...
    teacher/...
    student/...
  lib/ (db, auth, rbac, fetcher)
  middleware.ts
```

## สคีมา DB (ตารางหลัก)
- `User` (role: ADMIN | TEACHER | STUDENT)
- `Course` (teacherId, capacity)
- `Availability` (teacherId, weekday, startTime, endTime)
- `Timeslot` (courseId, dateTimeStart, dateTimeEnd, maxSeat)
- `Booking` (timeslotId, studentId, status: BOOKED | CANCELLED)
- `AuditLog` (action, userId, meta)

กฎสำคัญ:
- UNIQUE `(timeslotId, studentId)`
- ตรวจที่นั่งเหลือก่อน INSERT (ทำใน transaction)

## การติดตั้ง (Local)
1) เตรียมค่าแวดล้อม
```bash
cp .env.example .env
# แก้ DATABASE_URL, NEXTAUTH_SECRET ให้เรียบร้อย
```
2) สร้าง Client และ migrate
```bash
npx prisma generate
npx prisma migrate dev --name init
```
3) รัน dev
```bash
npm run dev
# เปิด http://localhost:3000
```

## เส้นทางสำคัญ
- Student: `/student/calendar`
- Teacher: `/teacher` (มี Availability, Courses, Timeslots)
- Admin: `/admin` (Users, Audit Log, ดาวน์โหลด CSV ที่ `/api/report/bookings`)

## API หลัก (ย่อ)
- `GET /api/timeslots` ดึงช่วงเวลาอนาคต + สถานะที่นั่ง
- `POST /api/book` (STUDENT) สร้างการจอง (transaction)
- `DELETE /api/book?id=...` (STUDENT) ยกเลิกตามกฎ `BOOKING_CANCEL_BEFORE_HOURS`
- `POST /api/course` (TEACHER/ADMIN) สร้างคอร์ส
- `PATCH /api/course` (TEACHER owner/ADMIN) แก้คอร์ส
- `GET/POST/PATCH/DELETE /api/availability` (TEACHER/ADMIN)
- `GET/POST/PATCH/DELETE /api/teacher/timeslots` (TEACHER owner/ADMIN)
- `GET /api/admin/users` (ADMIN) + `POST/PATCH/DELETE` จัดการผู้ใช้
- `GET /api/admin/audit` (ADMIN) ดู AuditLog
- `GET /api/report/bookings` (ADMIN) ดาวน์โหลด CSV

## RBAC
- ใช้ `src/middleware.ts` ตรวจ JWT (NextAuth) และจำกัดเส้นทาง `/admin`, `/teacher`, `/student`
- Helper `withRole` สำหรับห่อ handler ฝั่ง API ได้ (ถ้าต้องการ)

## ทดสอบ
```bash
npm test -- --run
```

## Deploy บน Railway
1) Push ขึ้น GitHub
2) เชื่อม Railway กับ repo และตั้งค่า Environment ให้ครบตาม `.env.example`
3) ใช้ Dockerfile ในรูท โปรเจ็กต์มีคำสั่ง `prisma migrate deploy` ก่อน `next start` อัตโนมัติ

## หมายเหตุ
- โปรดสร้างผู้ใช้และ role เบื้องต้นเองผ่าน Admin UI หรือเพิ่มสคริปต์ seed ตามต้องการ
- โค้ด UI เป็นตัวอย่างขั้นต่ำ สามารถปรับปรุง UX/สไตล์เพิ่มได้
