'use client'

import { useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────────────────────────────────────
   HERO CANVAS — Mela Armillary Sphere

   The right half of the hero is dominated by a massive golden armillary sphere:
   6 tilted orbital rings (simulated 3D perspective), each with gem nodes
   orbiting along the ring path.  The centre holds the sacred-geometry mandala.
   The sphere fills ~90 % of viewport height.

   LAYER 0  · Stars              — 220 twinkling background stars
   LAYER 1  · Nebula clouds      — 7 drifting gradient orbs
   LAYER 2  · Aurora rings       — 6 soft elliptic rings (background depth)
   LAYER 3  · Node network       — 180 magnetic nodes (gem + circle variants)
   LAYER 4  · Armillary sphere   — 6 orbital rings + central mandala (MAIN HERO)
   LAYER 5  · Cursor glow        — soft gold halo on mouse
   LAYER 6  · Mouse trail        — decaying gold particles
   LAYER 7  · Shooting meteors   — diagonal gold streaks
   LAYER 8  · Click ripples      — expanding concentric rings
   LAYER 9  · Scan-line sweep    — subtle horizontal band
   LAYER 10 · Vignette           — radial edge darkening
─────────────────────────────────────────────────────────────────────────────── */

interface BgNode  { x:number;y:number;vx:number;vy:number;r:number;baseAlpha:number;alpha:number;phase:number;speed:number;speed2:number;gem:boolean }
interface Star    { x:number;y:number;r:number;alpha:number;ph:number;spd:number }
interface Nebula  { x:number;y:number;vx:number;vy:number;r:number;ph:number }
interface Trail   { x:number;y:number;life:number;maxLife:number;vx:number;vy:number }
interface Meteor  { x:number;y:number;vx:number;vy:number;len:number;alpha:number;active:boolean;timer:number }
interface Ripple  { x:number;y:number;r:number;alpha:number }

// ── Armillary ring configuration ─────────────────────────────────────────────
// tilt   : y-scale when drawn (0 = line, 1 = perfect circle) — simulates 3D angle
// baseAng: initial 2D rotation of the ring plane
// speed  : rotation speed in rad/frame
// rFrac  : radius as fraction of armBase (outermost ring scale)
// alpha  : base stroke opacity
// nodes  : count of gem nodes orbiting the ring
// nSpd   : orbital node angular speed rad/frame
interface ArmRing { tilt:number;baseAng:number;speed:number;rFrac:number;alpha:number;nodes:number;nSpd:number }
const ARM_RINGS: ArmRing[] = [
  { tilt:0.18, baseAng:0,             speed: 0.0034, rFrac:0.78, alpha:0.38, nodes:2, nSpd:0.0060 },
  { tilt:0.52, baseAng:Math.PI*0.22,  speed:-0.0026, rFrac:0.86, alpha:0.30, nodes:3, nSpd:0.0044 },
  { tilt:0.80, baseAng:Math.PI*0.44,  speed: 0.0019, rFrac:0.93, alpha:0.24, nodes:3, nSpd:0.0038 },
  { tilt:0.38, baseAng:Math.PI*0.67,  speed:-0.0042, rFrac:0.90, alpha:0.28, nodes:2, nSpd:0.0065 },
  { tilt:0.68, baseAng:Math.PI*0.89,  speed: 0.0030, rFrac:0.97, alpha:0.20, nodes:4, nSpd:0.0032 },
  { tilt:0.28, baseAng:Math.PI*1.12,  speed:-0.0022, rFrac:1.03, alpha:0.16, nodes:2, nSpd:0.0050 },
]

const BG_RINGS = [
  { ph:0.0, spd:0.00015, rFrac:0.10, rx:1.00, ry:0.55, a:0.025 },
  { ph:1.8, spd:0.00022, rFrac:0.17, rx:1.18, ry:0.58, a:0.018 },
  { ph:3.4, spd:0.00013, rFrac:0.26, rx:0.88, ry:0.70, a:0.014 },
  { ph:5.1, spd:0.00019, rFrac:0.35, rx:1.22, ry:0.50, a:0.010 },
  { ph:2.3, spd:0.00024, rFrac:0.44, rx:0.82, ry:0.82, a:0.008 },
  { ph:4.7, spd:0.00011, rFrac:0.54, rx:1.30, ry:0.44, a:0.005 },
]

const NODE_COUNT  = 180
const GEM_COUNT   = 16
const MAX_TRAIL   = 40
const MAX_METEOR  = 5

export default function HeroCanvas3D() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    let W=0, H=0, raf=0
    let absX=0, absY=0, scanY=0

    // Orbital node angles per ring
    const orbAngles: number[][] = ARM_RINGS.map(r =>
      Array.from({length: r.nodes}, (_,i) => (i/r.nodes)*Math.PI*2)
    )

    let bgNodes: BgNode[] = []
    let stars:   Star[]   = []
    let nebulas: Nebula[] = []
    const trails:  Trail[]  = []
    const meteors: Meteor[] = []
    const ripples: Ripple[] = []

    for (let i=0;i<MAX_METEOR;i++)
      meteors.push({x:0,y:0,vx:0,vy:0,len:0,alpha:0,active:false,timer:Math.random()*500+150})

    // ── Scene init ────────────────────────────────────────────────────────────
    function initScene() {
      const dpr = window.devicePixelRatio||1
      stars = Array.from({length:220},()=>({
        x:Math.random()*W, y:Math.random()*H*0.92,
        r:Math.random()*0.9+0.15, alpha:Math.random()*0.35+0.04,
        ph:Math.random()*Math.PI*2, spd:Math.random()*0.022+0.006,
      }))
      nebulas = Array.from({length:7},()=>({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.12, vy:(Math.random()-0.5)*0.07,
        r:Math.min(W,H)*(Math.random()*0.24+0.14),
        ph:Math.random()*Math.PI*2,
      }))
      bgNodes = Array.from({length:NODE_COUNT},(_,i)=>{
        const gem=i<GEM_COUNT, ba=Math.random()*0.26+0.06
        return{
          x:Math.random()*W, y:Math.random()*H,
          vx:(Math.random()-0.5)*0.22, vy:-(Math.random()*0.20+0.04),
          r: gem?Math.random()*2.6+1.8:Math.random()*1.9+0.55,
          baseAlpha:gem?ba*1.5:ba, alpha:ba,
          phase:Math.random()*Math.PI*2, speed:Math.random()*0.012+0.004,
          speed2:0, gem,
        }
      })
      absX=W/2/dpr; absY=H/2/dpr
    }

    function spawnMeteor(m:Meteor){
      const ang=Math.PI/4+(Math.random()-0.5)*0.35, spd=Math.random()*9+11
      m.x=Math.random()*W*0.7; m.y=Math.random()*H*0.45
      m.vx=Math.cos(ang)*spd; m.vy=Math.sin(ang)*spd
      m.len=Math.random()*90+55; m.alpha=Math.random()*0.55+0.35; m.active=true
    }

    function resize(){
      const dpr=window.devicePixelRatio||1
      W=canvas.width =canvas.offsetWidth *dpr
      H=canvas.height=canvas.offsetHeight*dpr
      canvas.style.width =canvas.offsetWidth +'px'
      canvas.style.height=canvas.offsetHeight+'px'
      scanY=0; initScene()
    }

    // ── Armillary Sphere + Mandala (Layer 4) ──────────────────────────────────
    // armBase  = radius of outermost ring (fills ~90% of viewport height)
    // mBase    = radius of inner mandala core
    function drawSphere(cx:number, cy:number, t:number) {
      const dpr     = window.devicePixelRatio||1
      const armBase = H * 0.46              // outermost ring = 92% of half-height
      const mBase   = H * 0.18             // inner mandala core
      const pulse   = 0.92+0.08*Math.sin(t*0.018)
      const pulse2  = 0.94+0.06*Math.sin(t*0.025+1.4)
      const pulse3  = 0.88+0.12*Math.sin(t*0.033+2.8)

      // Mandala rotation layers
      const rotPetIn  =  t*0.0055
      const rotStar   = -t*0.0038
      const rotOuter  =  t*0.0022
      const rotDia    = -t*0.0070
      const rotPetOut = -t*0.0032

      // Mouse parallax (subtle 3D depth shift on the whole structure)
      const ox = (absX*dpr - cx)/W * 22
      const oy = (absY*dpr - cy)/H * 14

      ctx.save()
      ctx.translate(cx+ox, cy+oy)

      /* ── Wide quadrant glow (fills the right half) ── */
      const qg = ctx.createRadialGradient(0,0,0, 0,0, armBase*1.40)
      qg.addColorStop(0,   `rgba(200,155,55,${0.08*pulse})`)
      qg.addColorStop(0.35,`rgba(190,145,48,0.04)`)
      qg.addColorStop(0.65,`rgba(180,130,40,0.018)`)
      qg.addColorStop(1,   'rgba(170,115,35,0)')
      ctx.beginPath(); ctx.arc(0,0,armBase*1.40,0,Math.PI*2)
      ctx.fillStyle=qg; ctx.fill()

      /* ══ ARMILLARY RINGS (drawn back → front) ══════════════════════════════ */
      for (let ri=ARM_RINGS.length-1; ri>=0; ri--) {
        const ring   = ARM_RINGS[ri]
        const rr     = armBase * ring.rFrac * pulse2
        const ringAng = ring.baseAng + t*ring.speed

        // Glow pass
        ctx.save()
        ctx.translate(0,0)
        ctx.rotate(ringAng)
        ctx.scale(1, ring.tilt)
        ctx.beginPath(); ctx.arc(0,0,rr,0,Math.PI*2)
        ctx.strokeStyle=`rgba(200,169,106,${ring.alpha*0.30})`
        ctx.lineWidth=10; ctx.stroke()
        // Core pass
        ctx.beginPath(); ctx.arc(0,0,rr,0,Math.PI*2)
        ctx.strokeStyle=`rgba(240,210,140,${ring.alpha})`
        ctx.lineWidth=1.1; ctx.stroke()
        // Bright highlight (thin inner stroke)
        ctx.beginPath(); ctx.arc(0,0,rr,0,Math.PI*2)
        ctx.strokeStyle=`rgba(255,245,200,${ring.alpha*0.55})`
        ctx.lineWidth=0.4; ctx.stroke()
        ctx.restore()

        // 4 cardinal tick marks on the ring
        for (let k=0;k<4;k++){
          const a   = k*Math.PI/2
          const lx  = Math.cos(a)*rr
          const ly  = Math.sin(a)*rr*ring.tilt
          const wx  = lx*Math.cos(ringAng) - ly*Math.sin(ringAng)
          const wy  = lx*Math.sin(ringAng) + ly*Math.cos(ringAng)
          const ts  = armBase*0.020
          ctx.save()
          ctx.translate(wx,wy)
          ctx.rotate(Math.atan2(wy,wx)+Math.PI/4)
          ctx.beginPath()
          ctx.moveTo(0,-ts); ctx.lineTo(ts*0.6,0)
          ctx.lineTo(0,ts);  ctx.lineTo(-ts*0.6,0)
          ctx.closePath()
          ctx.fillStyle=`rgba(255,235,160,${ring.alpha*0.80})`; ctx.fill()
          ctx.restore()
        }

        // Orbital gem nodes travelling along the ring
        for (let ni=0; ni<ring.nodes; ni++){
          orbAngles[ri][ni] += ring.nSpd
          const θ   = orbAngles[ri][ni]
          const lx  = rr*Math.cos(θ)
          const ly  = rr*Math.sin(θ)*ring.tilt
          const wx  = lx*Math.cos(ringAng) - ly*Math.sin(ringAng)
          const wy  = lx*Math.sin(ringAng) + ly*Math.cos(ringAng)
          const ds  = armBase*0.018*pulse3
          // halo
          const ng  = ctx.createRadialGradient(wx,wy,0,wx,wy,ds*7)
          ng.addColorStop(0,`rgba(255,235,155,${ring.alpha*0.55})`)
          ng.addColorStop(1,'rgba(240,200,100,0)')
          ctx.beginPath(); ctx.arc(wx,wy,ds*7,0,Math.PI*2)
          ctx.fillStyle=ng; ctx.fill()
          // diamond body
          ctx.save()
          ctx.translate(wx,wy); ctx.rotate(t*0.025+ni*1.2)
          ctx.beginPath()
          ctx.moveTo(0,-ds*2); ctx.lineTo(ds,0)
          ctx.lineTo(0,ds*2);  ctx.lineTo(-ds,0)
          ctx.closePath()
          ctx.fillStyle=`rgba(255,248,200,${ring.alpha*1.4})`; ctx.fill()
          ctx.strokeStyle=`rgba(255,230,130,${ring.alpha*0.6})`
          ctx.lineWidth=0.5; ctx.stroke()
          ctx.restore()
        }
      }

      /* ══ CENTRAL MANDALA LAYERS ══════════════════════════════════════════ */

      /* Central ambient glow */
      const cag=ctx.createRadialGradient(0,0,0,0,0,mBase*1.5)
      cag.addColorStop(0,  `rgba(230,185,90,${0.10*pulse})`)
      cag.addColorStop(0.5,`rgba(200,155,60,0.05)`)
      cag.addColorStop(1,  'rgba(180,130,40,0)')
      ctx.beginPath(); ctx.arc(0,0,mBase*1.5,0,Math.PI*2)
      ctx.fillStyle=cag; ctx.fill()

      /* Hot-white core orb */
      const coreg=ctx.createRadialGradient(0,0,0,0,0,mBase*0.38*pulse3)
      coreg.addColorStop(0,  `rgba(255,252,230,${0.88*pulse3})`)
      coreg.addColorStop(0.35,`rgba(255,238,175,${0.45*pulse3})`)
      coreg.addColorStop(0.70,`rgba(230,185,90,${0.15*pulse3})`)
      coreg.addColorStop(1,  'rgba(200,140,50,0)')
      ctx.beginPath(); ctx.arc(0,0,mBase*0.38*pulse3,0,Math.PI*2)
      ctx.fillStyle=coreg; ctx.fill()

      /* Inner ring */
      ctx.beginPath(); ctx.arc(0,0,mBase*0.55,0,Math.PI*2)
      ctx.strokeStyle=`rgba(240,210,130,${0.28*pulse})`
      ctx.lineWidth=0.8; ctx.stroke()

      /* 8 inner lotus petals */
      ctx.save(); ctx.rotate(rotPetIn)
      const PIN=8, pR=mBase*0.95*pulse, pW=mBase*0.36
      for(let i=0;i<PIN;i++){
        const a=i/PIN*Math.PI*2
        const px=Math.cos(a)*pR*0.50, py=Math.sin(a)*pR*0.50
        ctx.save(); ctx.translate(px,py); ctx.rotate(a+Math.PI/2)
        ctx.beginPath()
        ctx.moveTo(0,-pR*0.52)
        ctx.bezierCurveTo( pW,-pR*0.26,  pW, pR*0.26, 0, pR*0.52)
        ctx.bezierCurveTo(-pW, pR*0.26, -pW,-pR*0.26, 0,-pR*0.52)
        const pg=ctx.createLinearGradient(0,-pR*0.52,0,pR*0.52)
        pg.addColorStop(0,  'rgba(255,242,185,0.26)')
        pg.addColorStop(0.5,'rgba(220,178,92,0.14)')
        pg.addColorStop(1,  'rgba(200,140,50,0.05)')
        ctx.fillStyle=pg; ctx.fill()
        ctx.strokeStyle=`rgba(255,228,148,${0.20*pulse})`
        ctx.lineWidth=0.7; ctx.stroke()
        ctx.restore()
      }
      ctx.restore()

      /* Mid ring */
      ctx.beginPath(); ctx.arc(0,0,mBase*1.08,0,Math.PI*2)
      ctx.strokeStyle=`rgba(200,169,106,${0.22*pulse2})`
      ctx.lineWidth=0.8; ctx.stroke()

      /* 8-pointed octagram */
      ctx.save(); ctx.rotate(rotStar)
      const sO=mBase*1.52*pulse2, sI=mBase*0.86
      ctx.beginPath()
      for(let i=0;i<16;i++){
        const a=i/16*Math.PI*2-Math.PI/16
        const r2=i%2===0?sO:sI
        i===0?ctx.moveTo(Math.cos(a)*r2,Math.sin(a)*r2)
             :ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2)
      }
      ctx.closePath()
      ctx.strokeStyle=`rgba(200,169,106,${0.24*pulse2})`; ctx.lineWidth=0.9; ctx.stroke()
      const sfg=ctx.createRadialGradient(0,0,0,0,0,sO)
      sfg.addColorStop(0,'rgba(200,169,106,0.014)'); sfg.addColorStop(1,'rgba(200,169,106,0)')
      ctx.fillStyle=sfg; ctx.fill()
      ctx.restore()

      /* 12 spinning diamond gems */
      ctx.save(); ctx.rotate(rotDia)
      const dRing=mBase*1.64
      for(let i=0;i<12;i++){
        const a=i/12*Math.PI*2
        const dx=Math.cos(a)*dRing, dy=Math.sin(a)*dRing
        const big=i%3===0, ds=mBase*(big?0.080:0.048)*pulse2
        ctx.save(); ctx.translate(dx,dy); ctx.rotate(a+Math.PI/4+rotDia*0.3)
        ctx.beginPath()
        ctx.moveTo(0,-ds*2); ctx.lineTo(ds*0.85,0)
        ctx.lineTo(0,ds*2);  ctx.lineTo(-ds*0.85,0); ctx.closePath()
        const dg=ctx.createRadialGradient(0,0,0,0,0,ds*2.5)
        dg.addColorStop(0,`rgba(255,245,200,${big?0.72:0.42})`); dg.addColorStop(1,'rgba(200,160,80,0)')
        ctx.fillStyle=dg; ctx.fill()
        ctx.strokeStyle=`rgba(255,235,155,${big?0.45:0.22})`; ctx.lineWidth=0.6; ctx.stroke()
        if(big){
          const dh=ctx.createRadialGradient(0,0,0,0,0,ds*10)
          dh.addColorStop(0,`rgba(240,200,100,${0.22*pulse3})`); dh.addColorStop(1,'rgba(240,200,100,0)')
          ctx.beginPath(); ctx.arc(0,0,ds*10,0,Math.PI*2); ctx.fillStyle=dh; ctx.fill()
        }
        ctx.restore()
      }
      ctx.restore()

      /* Outer ring + tick marks */
      ctx.save(); ctx.rotate(rotOuter)
      const oR=mBase*1.90*pulse
      ctx.beginPath(); ctx.arc(0,0,oR,0,Math.PI*2)
      ctx.strokeStyle=`rgba(200,169,106,${0.18*pulse})`; ctx.lineWidth=0.75; ctx.stroke()
      for(let i=0;i<16;i++){
        const a=i/16*Math.PI*2, major=i%4===0, mid=i%2===0
        const len=major?mBase*0.10:mid?mBase*0.065:mBase*0.035
        const alp=major?0.32:mid?0.20:0.11
        ctx.beginPath()
        ctx.moveTo(Math.cos(a)*(oR-len),Math.sin(a)*(oR-len))
        ctx.lineTo(Math.cos(a)*(oR+len*0.4),Math.sin(a)*(oR+len*0.4))
        ctx.strokeStyle=`rgba(220,190,110,${alp})`; ctx.lineWidth=major?1.3:0.7; ctx.stroke()
      }
      ctx.restore()

      /* 6 outer lotus petals */
      ctx.save(); ctx.rotate(rotPetOut)
      const opR=mBase*2.48*pulse2, opW=mBase*0.34
      for(let i=0;i<6;i++){
        const a=i/6*Math.PI*2
        const px=Math.cos(a)*opR*0.70, py=Math.sin(a)*opR*0.70
        ctx.save(); ctx.translate(px,py); ctx.rotate(a+Math.PI/2)
        ctx.beginPath()
        ctx.moveTo(0,-opR*0.36)
        ctx.bezierCurveTo( opW,-opR*0.18,  opW, opR*0.18, 0, opR*0.36)
        ctx.bezierCurveTo(-opW, opR*0.18, -opW,-opR*0.18, 0,-opR*0.36)
        ctx.strokeStyle=`rgba(200,168,88,${0.13*pulse})`; ctx.lineWidth=0.6; ctx.stroke()
        ctx.restore()
      }
      ctx.restore()

      /* Outermost fade rings (bridges to armillary) */
      ctx.beginPath(); ctx.arc(0,0,mBase*2.30*pulse2,0,Math.PI*2)
      ctx.strokeStyle=`rgba(200,169,106,${0.10*pulse2})`; ctx.lineWidth=0.6; ctx.stroke()
      ctx.beginPath(); ctx.arc(0,0,mBase*2.80*pulse,0,Math.PI*2)
      ctx.strokeStyle=`rgba(200,169,106,${0.06*pulse})`; ctx.lineWidth=0.5; ctx.stroke()

      ctx.restore()  // translate(cx+ox, cy+oy)
    }

    // ── Main render loop ─────────────────────────────────────────────────────
    let t=0

    function loop(){
      raf=requestAnimationFrame(loop)
      t++
      ctx.clearRect(0,0,W,H)

      const dpr   = window.devicePixelRatio||1
      const wide  = W > H*1.1
      // Shift centre further right on wide screens so sphere fills the right half
      const mcx   = wide ? W*0.66 : W*0.50
      const mcy   = H*0.50
      const mAbsX = absX*dpr
      const mAbsY = absY*dpr

      /* ── 0. Stars ─────────────────────────────────────────────────────── */
      for(const s of stars){
        s.ph+=s.spd
        const ta=s.alpha*(0.42+0.58*Math.sin(s.ph))
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(255,240,200,${ta})`; ctx.fill()
      }

      /* ── 1. Nebula clouds ─────────────────────────────────────────────── */
      for(const nc of nebulas){
        nc.x+=nc.vx+Math.sin(t*0.0022+nc.ph)*0.09
        nc.y+=nc.vy+Math.cos(t*0.0016+nc.ph)*0.055
        if(nc.x<-nc.r) nc.x=W+nc.r; if(nc.x>W+nc.r) nc.x=-nc.r
        if(nc.y<-nc.r) nc.y=H+nc.r; if(nc.y>H+nc.r) nc.y=-nc.r
        const p=0.78+0.22*Math.sin(t*0.0038+nc.ph)
        const nr=nc.r*p
        const g=ctx.createRadialGradient(nc.x,nc.y,0,nc.x,nc.y,nr)
        g.addColorStop(0,'rgba(200,140,55,0.030)'); g.addColorStop(0.45,'rgba(170,110,40,0.012)'); g.addColorStop(1,'rgba(150,90,30,0)')
        ctx.beginPath(); ctx.arc(nc.x,nc.y,nr,0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
      }

      /* ── 2. Background aurora rings ───────────────────────────────────── */
      for(let i=0;i<BG_RINGS.length;i++){
        const rg=BG_RINGS[i]
        const rx2=mcx+Math.sin(t*rg.spd+rg.ph)*W*0.028
        const ry2=mcy+Math.cos(t*rg.spd*0.75+rg.ph)*H*0.020
        const rBase=Math.min(W,H)*rg.rFrac
        const rX=rBase*rg.rx, rY=rBase*rg.ry
        const pA=rg.a+Math.sin(t*0.0032+i*0.9)*0.003
        ctx.save(); ctx.translate(rx2,ry2); ctx.scale(1,rY/rX)
        ctx.beginPath(); ctx.arc(0,0,rX,0,Math.PI*2)
        ctx.strokeStyle=`rgba(200,169,106,${pA})`; ctx.lineWidth=0.75; ctx.stroke()
        ctx.restore()
      }

      /* ── 3. Magnetic node network ─────────────────────────────────────── */
      const connDist   = Math.min(W,H)*0.130
      const mouseDist  = Math.min(W,H)*0.190
      const magnetDist = Math.min(W,H)*0.260
      const magnetF    = 0.026

      for(const n of bgNodes){
        const dxM=mAbsX-n.x, dyM=mAbsY-n.y
        const distM=Math.sqrt(dxM*dxM+dyM*dyM)
        let bx=n.vx, by=n.vy
        if(distM<magnetDist){ const str=(1-distM/magnetDist)*magnetF; bx+=dxM*str; by+=dyM*str }
        n.x+=bx+Math.sin(t*n.speed+n.phase)*0.18; n.y+=by
        n.speed2=bx*bx+by*by
        n.alpha=n.baseAlpha*(0.62+0.38*Math.sin(t*n.speed*2+n.phase))
        if(n.y<-20){n.y=H+10;n.x=Math.random()*W}
        if(n.x<-20) n.x=W+10; if(n.x>W+20) n.x=-10
      }
      for(let i=0;i<bgNodes.length;i++){
        const a=bgNodes[i]
        for(let j=i+1;j<bgNodes.length;j++){
          const b=bgNodes[j], dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy)
          if(dist<connDist){
            const str=(1-dist/connDist)*Math.min(a.alpha,b.alpha)*0.50
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y)
            ctx.strokeStyle=`rgba(200,169,106,${str})`; ctx.lineWidth=(1-dist/connDist)*0.90; ctx.stroke()
          }
        }
        const dx=a.x-mAbsX, dy=a.y-mAbsY, dist=Math.sqrt(dx*dx+dy*dy)
        if(dist<mouseDist){
          const str=(1-dist/mouseDist)*a.alpha*1.1
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(mAbsX,mAbsY)
          ctx.strokeStyle=`rgba(240,201,122,${str})`; ctx.lineWidth=(1-dist/mouseDist)*1.8; ctx.stroke()
        }
      }
      for(const n of bgNodes){
        const sf=Math.min(1,n.speed2*2200)
        const nr2=Math.round(200+sf*55), ng2=Math.round(169+sf*76), nb2=Math.round(106+sf*84)
        if(n.gem){
          const ds=n.r*1.7
          ctx.save(); ctx.translate(n.x,n.y); ctx.rotate(t*n.speed*0.55)
          ctx.beginPath(); ctx.moveTo(0,-ds); ctx.lineTo(ds*0.75,0); ctx.lineTo(0,ds); ctx.lineTo(-ds*0.75,0); ctx.closePath()
          ctx.fillStyle=`rgba(${nr2},${ng2},${nb2},${n.alpha*0.88})`; ctx.fill()
          ctx.strokeStyle=`rgba(255,235,155,${n.alpha*0.50})`; ctx.lineWidth=0.5; ctx.stroke()
          const gg=ctx.createRadialGradient(0,0,0,0,0,n.r*9)
          gg.addColorStop(0,`rgba(${nr2},${ng2},${nb2},${n.alpha*0.35})`); gg.addColorStop(1,`rgba(${nr2},${ng2},${nb2},0)`)
          ctx.beginPath(); ctx.arc(0,0,n.r*9,0,Math.PI*2); ctx.fillStyle=gg; ctx.fill()
          ctx.restore()
        } else {
          const grd=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*5.5)
          grd.addColorStop(0,`rgba(${nr2},${ng2},${nb2},${n.alpha*0.52})`); grd.addColorStop(1,`rgba(${nr2},${ng2},${nb2},0)`)
          ctx.beginPath(); ctx.arc(n.x,n.y,n.r*5.5,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill()
          ctx.beginPath(); ctx.arc(n.x,n.y,n.r*(1+sf*0.8),0,Math.PI*2)
          ctx.fillStyle=`rgba(${nr2},${ng2},${nb2},${n.alpha*(1+sf*0.5)})`; ctx.fill()
        }
      }

      /* ── 4. Armillary Sphere + Sacred Mandala ─────────────────────────── */
      drawSphere(mcx, mcy, t)

      /* ── 5. Cursor glow ───────────────────────────────────────────────── */
      const cgR=Math.min(W,H)*0.11
      const cgrd=ctx.createRadialGradient(mAbsX,mAbsY,0,mAbsX,mAbsY,cgR)
      cgrd.addColorStop(0,'rgba(200,169,106,0.10)'); cgrd.addColorStop(0.38,'rgba(200,169,106,0.035)'); cgrd.addColorStop(1,'rgba(200,169,106,0)')
      ctx.beginPath(); ctx.arc(mAbsX,mAbsY,cgR,0,Math.PI*2); ctx.fillStyle=cgrd; ctx.fill()

      /* ── 6. Mouse trail ───────────────────────────────────────────────── */
      for(let i=trails.length-1;i>=0;i--){
        const tp=trails[i]; tp.life--; tp.x+=tp.vx; tp.y+=tp.vy; tp.vx*=0.94; tp.vy*=0.94
        if(tp.life<=0){trails.splice(i,1);continue}
        const prog=tp.life/tp.maxLife
        ctx.beginPath(); ctx.arc(tp.x,tp.y,prog*2.8,0,Math.PI*2)
        ctx.fillStyle=`rgba(240,201,122,${prog*0.58})`; ctx.fill()
      }

      /* ── 7. Shooting meteors ──────────────────────────────────────────── */
      for(const m of meteors){
        if(!m.active){m.timer--;if(m.timer<=0){spawnMeteor(m);m.timer=Math.random()*700+250};continue}
        m.x+=m.vx;m.y+=m.vy;m.alpha-=0.010
        if(m.alpha<=0||m.x>W+120||m.y>H+120){m.active=false;continue}
        const mag=Math.sqrt(m.vx*m.vx+m.vy*m.vy)
        const tx=m.x-m.vx*(m.len/mag),ty=m.y-m.vy*(m.len/mag)
        const mg=ctx.createLinearGradient(tx,ty,m.x,m.y)
        mg.addColorStop(0,'rgba(255,240,180,0)'); mg.addColorStop(1,`rgba(255,240,180,${m.alpha})`)
        ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(m.x,m.y); ctx.strokeStyle=mg; ctx.lineWidth=1.6; ctx.stroke()
        const mhg=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,7)
        mhg.addColorStop(0,`rgba(255,248,210,${m.alpha})`); mhg.addColorStop(1,'rgba(255,248,210,0)')
        ctx.beginPath(); ctx.arc(m.x,m.y,7,0,Math.PI*2); ctx.fillStyle=mhg; ctx.fill()
      }

      /* ── 8. Click ripples ─────────────────────────────────────────────── */
      for(let i=ripples.length-1;i>=0;i--){
        const rp=ripples[i]; rp.r+=7; rp.alpha-=0.016
        if(rp.alpha<=0){ripples.splice(i,1);continue}
        ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2)
        ctx.strokeStyle=`rgba(200,169,106,${rp.alpha})`; ctx.lineWidth=1.6; ctx.stroke()
        if(rp.r>30){
          ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r*0.62,0,Math.PI*2)
          ctx.strokeStyle=`rgba(240,201,122,${rp.alpha*0.55})`; ctx.lineWidth=0.9; ctx.stroke()
        }
        if(rp.r>55){
          ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r*0.32,0,Math.PI*2)
          ctx.strokeStyle=`rgba(255,230,160,${rp.alpha*0.35})`; ctx.lineWidth=0.6; ctx.stroke()
        }
      }

      /* ── 9. Scan-line sweep ───────────────────────────────────────────── */
      scanY=(scanY+0.8)%H
      const slH=H*0.055
      const sg=ctx.createLinearGradient(0,scanY-slH,0,scanY+slH)
      sg.addColorStop(0,'rgba(200,169,106,0)'); sg.addColorStop(0.40,'rgba(200,169,106,0.013)')
      sg.addColorStop(0.50,'rgba(220,190,120,0.024)'); sg.addColorStop(0.60,'rgba(200,169,106,0.013)'); sg.addColorStop(1,'rgba(200,169,106,0)')
      ctx.fillStyle=sg; ctx.fillRect(0,scanY-slH,W,slH*2)

      /* ── 10. Vignette ─────────────────────────────────────────────────── */
      const vig=ctx.createRadialGradient(W/2,H/2,H*0.28,W/2,H/2,H*1.05)
      vig.addColorStop(0,'rgba(7,5,10,0)'); vig.addColorStop(1,'rgba(7,5,10,0.62)')
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H)
    }

    /* ── Event listeners ─────────────────────────────────────────────────── */
    const onMove=(e:MouseEvent)=>{
      const rect=canvas.getBoundingClientRect()
      absX=e.clientX-rect.left; absY=e.clientY-rect.top
      const dpr=window.devicePixelRatio||1, ax=absX*dpr, ay=absY*dpr
      if(trails.length<MAX_TRAIL) trails.push({x:ax,y:ay,life:26,maxLife:26,vx:(Math.random()-0.5)*1.2,vy:(Math.random()-0.5)*1.2})
      else{trails.shift();trails.push({x:ax,y:ay,life:26,maxLife:26,vx:(Math.random()-0.5)*1.2,vy:(Math.random()-0.5)*1.2})}
    }
    const onLeave=()=>{ const dpr=window.devicePixelRatio||1; absX=W/2/dpr; absY=H/2/dpr }
    const onClick=(e:MouseEvent)=>{
      const rect=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1
      const cx=(e.clientX-rect.left)*dpr, cy=(e.clientY-rect.top)*dpr
      ripples.push({x:cx,y:cy,r:4,alpha:0.75})
      for(let i=0;i<16;i++){
        const ang=i/16*Math.PI*2, spd=Math.random()*4+1.5
        trails.push({x:cx,y:cy,life:35,maxLife:35,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd})
      }
    }

    window.addEventListener('resize',     resize)
    window.addEventListener('mousemove',  onMove)
    window.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('click',      onClick)
    resize(); loop()

    return ()=>{
      cancelAnimationFrame(raf)
      window.removeEventListener('resize',     resize)
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('click',      onClick)
    }
  },[])

  return (
    <canvas
      ref={ref}
      style={{
        display:'block', width:'100%', height:'100%',
        position:'absolute', inset:0,
        cursor:'crosshair',
      }}
    />
  )
}
