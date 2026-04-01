'use client'

import { useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────
   3D TORUS PARTICLE FIELD
   – 2 400 gold particles on a torus surface
   – depth-based size, opacity & colour
   – auto-rotate Y + X  with mouse-tilt influence
   – connecting lines between close neighbours
   – soft per-particle glow
───────────────────────────────────────────── */

const N       = 2400   // particle count
const R_MAJ   = 2.1    // torus major radius
const R_MIN   = 0.78   // torus minor radius
const FOV     = 420
const GLOW_THRESH = 0.55  // only draw glow for front particles

// gold palette: index 0 = dark, 1 = mid, 2 = bright
const PALETTE: [number,number,number][] = [
  [160, 118,  55],
  [200, 169, 106],
  [240, 201, 122],
  [255, 220, 150],
]

interface Pt { ox:number; oy:number; oz:number; ci:number }

function rotX(x:number, y:number, z:number, a:number) {
  const c=Math.cos(a), s=Math.sin(a)
  return { x, y: y*c - z*s, z: y*s + z*c }
}
function rotY(x:number, y:number, z:number, a:number) {
  const c=Math.cos(a), s=Math.sin(a)
  return { x: x*c + z*s, y, z: -x*s + z*c }
}

export default function HeroCanvas3D() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0, H = 0
    let raf = 0
    let mx = 0, my = 0   // -0.5 to 0.5
    let angleY = 0, angleX = 0.25

    // ── build torus points ──────────────────
    const pts: Pt[] = []
    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.random() * Math.PI * 2
      const ox = (R_MAJ + R_MIN * Math.cos(phi)) * Math.cos(theta)
      const oy = (R_MAJ + R_MIN * Math.cos(phi)) * Math.sin(theta)
      const oz = R_MIN * Math.sin(phi)
      // colour index by outer-vs-inner position
      const outerFrac = (Math.cos(phi) + 1) / 2  // 0=inner, 1=outer
      const ci = Math.floor(outerFrac * (PALETTE.length - 1) + Math.random() * 0.6)
      pts.push({ ox, oy, oz, ci: Math.min(ci, PALETTE.length - 1) })
    }

    // ── resize ─────────────────────────────
    function resize() {
      W = canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
      H = canvas.height = canvas.offsetHeight * window.devicePixelRatio
      canvas.style.width  = canvas.offsetWidth  + 'px'
      canvas.style.height = canvas.offsetHeight + 'px'
    }

    // ── projected cache ─────────────────────
    interface Proj { x:number; y:number; z:number; size:number; alpha:number; ci:number }
    const proj: Proj[] = new Array(N)

    // ── main loop ───────────────────────────
    let t = 0
    function loop() {
      raf = requestAnimationFrame(loop)
      t++

      ctx.clearRect(0, 0, W, H)

      // slow auto-rotation + gentle mouse tilt
      angleY += 0.004
      angleX += 0.001

      const tiltX = mx * 0.5
      const tiltY = my * 0.4

      const scale = Math.min(W, H) * 0.255
      const cx = W * 0.5
      const cy = H * 0.5

      for (let i = 0; i < N; i++) {
        const { ox, oy, oz, ci } = pts[i]

        // apply rotations
        let p = rotY(ox, oy, oz, angleY + tiltX)
        p = rotX(p.x, p.y, p.z, angleX + tiltY)

        // perspective project
        const d = p.z + R_MAJ + R_MIN + 1
        const px = cx + (p.x * scale * FOV) / (d * FOV + FOV * 0.5)
        const py = cy + (p.y * scale * FOV) / (d * FOV + FOV * 0.5)

        // depth normalised 0→1 (back→front)
        const norm = (p.z + R_MAJ + R_MIN) / (2 * (R_MAJ + R_MIN))
        proj[i] = {
          x: px, y: py, z: p.z,
          size:  norm * 2.2 + 0.35,
          alpha: norm * 0.75 + 0.18,
          ci,
        }
      }

      // back-to-front sort
      proj.sort((a, b) => a.z - b.z)

      // ── draw connecting lines (nearby pts) ──
      // Sample a subset for performance
      const step = 6
      for (let i = 0; i < N; i += step) {
        const a = proj[i]
        for (let j = i + step; j < Math.min(i + step * 12, N); j += step) {
          const b = proj[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist2 = dx*dx + dy*dy
          const thresh = 28 * window.devicePixelRatio
          if (dist2 < thresh * thresh) {
            const strength = (1 - Math.sqrt(dist2) / thresh) * Math.min(a.alpha, b.alpha) * 0.35
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(200,169,106,${strength})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // ── draw particles ──────────────────────
      for (let i = 0; i < N; i++) {
        const { x, y, size, alpha, ci } = proj[i]
        const [r, g, b] = PALETTE[ci]

        // glow halo (front particles only — expensive)
        if (alpha > GLOW_THRESH) {
          const glowR = size * 5
          const grd = ctx.createRadialGradient(x, y, 0, x, y, glowR)
          const glowAlpha = (alpha - GLOW_THRESH) / (1 - GLOW_THRESH) * 0.45
          grd.addColorStop(0, `rgba(${r},${g},${b},${glowAlpha})`)
          grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(x, y, glowR, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        }

        // core dot
        ctx.beginPath()
        ctx.arc(x, y, size * 0.75, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fill()
      }

      // ── central glow ────────────────────────
      if (t % 3 === 0) {  // only update every 3 frames (perf)
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.9)
        grd.addColorStop(0, 'rgba(200,169,106,0.04)')
        grd.addColorStop(1, 'rgba(200,169,106,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, scale * 0.9, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }
    }

    // ── event listeners ─────────────────────
    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mx = (e.clientX - rect.left) / rect.width  - 0.5
      my = (e.clientY - rect.top)  / rect.height - 0.5
    }
    const onLeave = () => { mx = 0; my = 0 }
    const onResize = () => resize()

    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('mouseleave', onLeave)

    resize()
    loop()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  )
}
