'use client'

import { useRef, useState } from 'react'

interface MagneticProps {
  children: React.ReactNode
  strength?: number
  className?: string
}

export default function Magnetic({ children, strength = 0.3, className = '' }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setPos({ x: (e.clientX - cx) * strength, y: (e.clientY - cy) * strength })
  }

  function handleMouseLeave() {
    setPos({ x: 0, y: 0 })
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
    >
      {children}
    </div>
  )
}
