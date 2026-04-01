'use client'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function Reveal({
  children,
  delay = 0,
  className = '',
  y = 32,
  scale = true,
  blur = true,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  y?: number
  scale?: boolean
  blur?: boolean
}) {
  const { ref, isVisible } = useScrollReveal()

  const transform = isVisible
    ? 'translateY(0) scale(1)'
    : `translateY(${y}px) scale(${scale ? 0.96 : 1})`

  const filter = blur
    ? isVisible ? 'blur(0px)' : 'blur(6px)'
    : undefined

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform,
        filter,
        transition: [
          `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
          `transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
          blur ? `filter 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms` : '',
        ].filter(Boolean).join(', '),
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
