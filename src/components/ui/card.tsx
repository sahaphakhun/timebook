import { type PropsWithChildren } from 'react'

export function Card({ children }: PropsWithChildren) {
  return <div className="rounded border bg-white shadow-sm p-4">{children}</div>
}

export function CardHeader({ children }: PropsWithChildren) {
  return <div className="mb-3 text-base font-semibold">{children}</div>
}

export function CardFooter({ children }: PropsWithChildren) {
  return <div className="mt-3 pt-3 border-t">{children}</div>
}


