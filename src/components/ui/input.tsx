import { forwardRef, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, Props>(function InputBase({ className = '', ...props }, ref) {
  return (
    <input ref={ref} className={`border rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300 ${className}`} {...props} />
  )
})


