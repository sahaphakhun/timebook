import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Navbar } from '@/components/navbar'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timebook - ระบบจัดการตารางเรียน",
  description: "ระบบจัดการตารางเรียนและจองคาบเรียนสำหรับครูและนักเรียน",
  keywords: ["ตารางเรียน", "จองคาบเรียน", "การศึกษา", "ครู", "นักเรียน"],
  authors: [{ name: "Timebook Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role as 'ADMIN'|'TEACHER'|'STUDENT'|undefined
  return (
    <html lang="th" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <div className="min-h-screen flex flex-col">
          {session?.user && <Navbar role={role} />}
          <main className="flex-1">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
