import { type PropsWithChildren, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }: PropsWithChildren & HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: PropsWithChildren & HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn('flex flex-col space-y-1.5 p-6', className)} 
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: PropsWithChildren & HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)} 
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: PropsWithChildren & HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={cn('text-sm text-muted-foreground', className)} 
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: PropsWithChildren & HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn('p-6 pt-0', className)} 
      {...props}
    >
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: PropsWithChildren & HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn('flex items-center p-6 pt-0', className)} 
      {...props}
    >
      {children}
    </div>
  )
}


