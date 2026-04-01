'use client'

import { useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────────────────────────────────────
   HERO CANVAS — Ultra-immersive multi-layer animation

   LAYER 0 · Stars            — 180 twinkling distant stars
   LAYER 1 · Nebula clouds    — 6 large drifting gradient orbs (aurora feel)
   LAYER 2 · Elliptic rings   — 6 aurora rings, varied aspect ratios, slow drift
   LAYER 3 · Node network     — 90 magnetic nodes; colour-shift by speed (igloo-style)
   LAYER 4 · Cursor glow      — Soft gold radial halo tracking mouse
   LAYER 5 · Mouse trail      — 40 golden particles that decay behind cursor
   LAYER 6 · Shooting meteors — Random diagonal gold streaks with glowing heads
   LAYER 7 · Click ripples    — 3 expanding concentric rings on click
   LAYER 8 · 3D Torus         — 3 600 particles, breathing glow, offset right on wide
   LAYER 9 · Vignette         — Radial edge darkening for cinematic depth
─────────────────────────────────────────────────────────────────────────────── */

// ── Torus constants ──────────────────────────────────────────────────────────
const N           = 3600
const R_MAJ       = 2.1
const R_MIN       = 0.78
const FOV         = 420
const GLOW_THRESH = 0.50

const PALETTE: [number,number,number][] = [
  [140, 100,  40],
  [195, 162,  98],
  [238, 198, 118],
  [255, 224, 152],
  [255, 245, 200],
]

interface Pt   { ox:number; oy:number; oz:number; ci:number }
interface Proj { x:number;  y:number;  z:number;  size:number; alpha:number; ci:number }

function rotX(x:number,y:number,z:number,a:number){const c=Math.cos(a),s=Math.sin(a);return{x,y:y*c-z*s,z:y*s+z*c}}
function rotY(x:number,y:number,z:number,a:number){const c=Math.cos(a),s=Math.sin(a);return{x:x*c+z*s,y,z:-x*s+z*c}}

// ── Background types ─────────────────────────────────────────────────────────
interface BgNode {
  x:number; y:number; vx:number; vy:number
  r:number; baseAlpha:number; alpha:number
  phase:number; speed:number
  // igloo-style: track velocity magnitude for colour shift
  speed2:number   // current velocity magnitude (squared, for perf)
}
interface Star   { x:number; y:number; r:number; alpha:number; ph:number; spd:number }
interface Nebula { x:number; y:number; vx:number; vy:number; r:number; ph:number }
interface Trail  { x:number; y:number; life:number; maxLife:number; vx:number; vy:number }
interface Meteor { x:number; y:number; vx:number; vy:number; len:number; alpha:number; active:boolean; timer:number }
interface Ripple { x:number; y:number; r:number; alpha:number }

// ── Aurora ring config ───────────────────────────────────────────────────────
const RINGS = [
  { ph:0.0, spd:0.00015, rFrac:0.10, rx:1.00, ry:0.55, a:0.030 },
  { ph:1.8, spd:0.00022, rFrac:0.17, rx:1.18, ry:0.58, a:0.022 },
  { ph:3.4, spd:0.00013, rFrac:0.26, rx:0.88, ry:0.70, a:0.017 },
  { ph:5.1, spd:0.00019, rFrac:0.35, rx:1.22, ry:0.50, a:0.013 },
  { ph:2.3, spd:0.00024, rFrac:0.44, rx:0.82, ry:0.82, a:0.009 },
  { ph:4.7, spd:0.00011, rFrac:0.54, rx:1.30, ry:0.44, a:0.006 },
]

const BG_COUNT  = 90
const MAX_TRAIL = 40
const MAX_METEOR= 5

export default function HeroCanvas3D() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    let W=0, H=0, raf=0
    let mx=0, my=0        // normalised −0.5…0.5
    let absX=0, absY=0    // canvas pixels (DPR-corrected)

    // ── Build torus ──────────────────────────────────────────────────────────
    let angleY=0, angleX=0.25
    const pts:Pt[] = []
    for(let i=0;i<N;i++){
      const th=Math.random()*Math.PI*2, ph=Math.random()*Math.PI*2
      const ox=(R_MAJ+R_MIN*Math.cos(ph))*Math.cos(th)
      const oy=(R_MAJ+R_MIN*Math.cos(ph))*Math.sin(th)
      const oz=R_MIN*Math.sin(ph)
      const frac=(Math.cos(ph)+1)/2
      const ci=Math.min(Math.floor(frac*(PALETTE.length-1)+Math.random()*0.6),PALETTE.length-1)
      pts.push({ox,oy,oz,ci})
    }
    const proj:Proj[] = new Array(N)

    // ── State ────────────────────────────────────────────────────────────────
    let bgNodes:BgNode[] = []
    let stars:Star[]     = []
    let nebulas:Nebula[] = []
    const trails:Trail[] = []
    const meteors:Meteor[] = []
    const ripples:Ripple[] = []

    // pre-fill meteor slots
    for(let i=0;i<MAX_METEOR;i++){
      meteors.push({x:0,y:0,vx:0,vy:0,len:0,alpha:0,active:false,
        timer:Math.random()*500+150})
    }

    function initScene(){
      const dpr=window.devicePixelRatio||1

      // Stars
      stars = Array.from({length:180},()=>({
        x:Math.random()*W, y:Math.random()*H*0.90,
        r:Math.random()*0.85+0.18,
        alpha:Math.random()*0.32+0.04,
        ph:Math.random()*Math.PI*2,
        spd:Math.random()*0.020+0.006,
      }))

      // Nebula clouds
      nebulas = Array.from({length:7},()=>({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.12, vy:(Math.random()-0.5)*0.07,
        r:Math.min(W,H)*(Math.random()*0.22+0.13),
        ph:Math.random()*Math.PI*2,
      }))

      // Background nodes
      bgNodes = Array.from({length:BG_COUNT},()=>{
        const ba=Math.random()*0.24+0.06
        return{
          x:Math.random()*W, y:Math.random()*H,
          vx:(Math.random()-0.5)*0.20, vy:-(Math.random()*0.24+0.06),
          r:Math.random()*1.9+0.55,
          baseAlpha:ba, alpha:ba,
          phase:Math.random()*Math.PI*2, speed:Math.random()*0.012+0.004,
          speed2:0,
        }
      })

      // init abs mouse to centre
      absX=W/2/dpr; absY=H/2/dpr
    }

    function spawnMeteor(m:Meteor){
      const ang=Math.PI/4+(Math.random()-0.5)*0.35
      const spd=Math.random()*9+11
      m.x=Math.random()*W*0.7; m.y=Math.random()*H*0.45
      m.vx=Math.cos(ang)*spd;   m.vy=Math.sin(ang)*spd
      m.len=Math.random()*90+55; m.alpha=Math.random()*0.55+0.35
      m.active=true
    }

    function resize(){
      const dpr=window.devicePixelRatio||1
      W=canvas.width =canvas.offsetWidth *dpr
      H=canvas.height=canvas.offsetHeight*dpr
      canvas.style.width =canvas.offsetWidth +'px'
      canvas.style.height=canvas.offsetHeight+'px'
      initScene()
    }

    let t=0

    function loop(){
      raf=requestAnimationFrame(loop)
      t++
      ctx.clearRect(0,0,W,H)

      const dpr    = window.devicePixelRatio||1
      const wide   = W > H*1.1
      const tcx    = wide ? W*0.62 : W*0.50   // torus centre X
      const tcy    = H*0.50
      const scale  = Math.min(W,H)*0.255
      const mAbsX  = absX*dpr   // true canvas px
      const mAbsY  = absY*dpr

      /* ── 0. Stars ─────────────────────────────────────────────────────── */
      for(const s of stars){
        s.ph+=s.spd
        const ta=s.alpha*(0.45+0.55*Math.sin(s.ph))
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(255,240,200,${ta})`; ctx.fill()
      }

      /* ── 1. Nebula clouds (aurora orbs) ───────────────────────────────── */
      for(const nc of nebulas){
        nc.x+=nc.vx+Math.sin(t*0.0022+nc.ph)*0.09
        nc.y+=nc.vy+Math.cos(t*0.0016+nc.ph)*0.055
        if(nc.x<-nc.r) nc.x=W+nc.r
        if(nc.x>W+nc.r) nc.x=-nc.r
        if(nc.y<-nc.r) nc.y=H+nc.r
        if(nc.y>H+nc.r) nc.y=-nc.r
        const pulse=0.78+0.22*Math.sin(t*0.0038+nc.ph)
        const nr=nc.r*pulse
        const g=ctx.createRadialGradient(nc.x,nc.y,0,nc.x,nc.y,nr)
        g.addColorStop(0,'rgba(200,140,55,0.030)')
        g.addColorStop(0.45,'rgba(170,110,40,0.012)')
        g.addColorStop(1,'rgba(150,90,30,0)')
        ctx.beginPath(); ctx.arc(nc.x,nc.y,nr,0,Math.PI*2)
        ctx.fillStyle=g; ctx.fill()
      }

      /* ── 2. Elliptical aurora rings ────────────────────────────────────── */
      for(let i=0;i<RINGS.length;i++){
        const rg=RINGS[i]
        const rx2=tcx+Math.sin(t*rg.spd+rg.ph)*W*0.028
        const ry2=tcy+Math.cos(t*rg.spd*0.75+rg.ph)*H*0.020
        const rBase=Math.min(W,H)*rg.rFrac
        const rX=rBase*rg.rx, rY=rBase*rg.ry
        const pAlpha=rg.a+Math.sin(t*0.0032+i*0.9)*0.004
        ctx.save()
        ctx.translate(rx2,ry2)
        ctx.scale(1,rY/rX)
        ctx.beginPath(); ctx.arc(0,0,rX,0,Math.PI*2)
        ctx.strokeStyle=`rgba(200,169,106,${pAlpha})`
        ctx.lineWidth=0.85
        ctx.stroke()
        ctx.restore()
        // subtle inner fill
        ctx.save()
        ctx.translate(rx2,ry2)
        ctx.scale(1,rY/rX)
        const ig=ctx.createRadialGradient(0,0,0,0,0,rX)
        ig.addColorStop(0.6,'rgba(200,169,106,0)')
        ig.addColorStop(1,`rgba(200,169,106,${pAlpha*0.25})`)
        ctx.beginPath(); ctx.arc(0,0,rX,0,Math.PI*2)
        ctx.fillStyle=ig; ctx.fill()
        ctx.restore()
      }

      /* ── 3. Magnetic node network (igloo-style speed colour) ──────────── */
      const connDist   = Math.min(W,H)*0.118
      const mouseDist  = Math.min(W,H)*0.165
      const magnetDist = Math.min(W,H)*0.22
      const magnetF    = 0.022

      for(let i=0;i<bgNodes.length;i++){
        const n=bgNodes[i]
        const dxM=mAbsX-n.x, dyM=mAbsY-n.y
        const distM=Math.sqrt(dxM*dxM+dyM*dyM)

        // Magnetic pull toward cursor
        let bx=n.vx, by=n.vy
        if(distM<magnetDist){
          const str=(1-distM/magnetDist)*magnetF
          bx+=dxM*str; by+=dyM*str
        }
        n.x+=bx+Math.sin(t*n.speed+n.phase)*0.18
        n.y+=by
        n.speed2=bx*bx+by*by   // velocity magnitude²

        n.alpha=n.baseAlpha*(0.62+0.38*Math.sin(t*n.speed*2+n.phase))

        if(n.y<-20){n.y=H+10; n.x=Math.random()*W}
        if(n.x<-20) n.x=W+10
        if(n.x>W+20) n.x=-10
      }

      // Node–node connections
      for(let i=0;i<bgNodes.length;i++){
        const a=bgNodes[i]
        for(let j=i+1;j<bgNodes.length;j++){
          const b=bgNodes[j]
          const dx=a.x-b.x, dy=a.y-b.y
          const dist=Math.sqrt(dx*dx+dy*dy)
          if(dist<connDist){
            const str=(1-dist/connDist)*Math.min(a.alpha,b.alpha)*0.52
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y)
            ctx.strokeStyle=`rgba(200,169,106,${str})`
            ctx.lineWidth=(1-dist/connDist)*0.90; ctx.stroke()
          }
        }
        // Bright lines to cursor
        const dx=a.x-mAbsX, dy=a.y-mAbsY
        const dist=Math.sqrt(dx*dx+dy*dy)
        if(dist<mouseDist){
          const str=(1-dist/mouseDist)*a.alpha*1.0
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(mAbsX,mAbsY)
          ctx.strokeStyle=`rgba(240,201,122,${str})`
          ctx.lineWidth=(1-dist/mouseDist)*1.6; ctx.stroke()
        }
      }

      // Draw nodes — colour shifts warmer when fast (igloo-style)
      for(let i=0;i<bgNodes.length;i++){
        const n=bgNodes[i]
        const speedFactor=Math.min(1,n.speed2*2000)  // 0–1
        // slow = cool gold (200,169,106), fast = bright white-gold (255,245,190)
        const nr2=Math.round(200+speedFactor*55)
        const ng2=Math.round(169+speedFactor*76)
        const nb2=Math.round(106+speedFactor*84)

        const grd=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*5.5)
        grd.addColorStop(0,`rgba(${nr2},${ng2},${nb2},${n.alpha*0.52})`)
        grd.addColorStop(1,`rgba(${nr2},${ng2},${nb2},0)`)
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*5.5,0,Math.PI*2)
        ctx.fillStyle=grd; ctx.fill()

        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*(1+speedFactor*0.8),0,Math.PI*2)
        ctx.fillStyle=`rgba(${nr2},${ng2},${nb2},${n.alpha*(1+speedFactor*0.5)})`
        ctx.fill()
      }

      /* ── 4. Cursor glow ───────────────────────────────────────────────── */
      const cgR=Math.min(W,H)*0.11
      const cgrd=ctx.createRadialGradient(mAbsX,mAbsY,0,mAbsX,mAbsY,cgR)
      cgrd.addColorStop(0,'rgba(200,169,106,0.09)')
      cgrd.addColorStop(0.38,'rgba(200,169,106,0.03)')
      cgrd.addColorStop(1,'rgba(200,169,106,0)')
      ctx.beginPath(); ctx.arc(mAbsX,mAbsY,cgR,0,Math.PI*2)
      ctx.fillStyle=cgrd; ctx.fill()

      /* ── 5. Mouse trail ───────────────────────────────────────────────── */
      for(let i=trails.length-1;i>=0;i--){
        const tp=trails[i]
        tp.life--
        tp.x+=tp.vx; tp.y+=tp.vy
        tp.vx*=0.94; tp.vy*=0.94
        if(tp.life<=0){trails.splice(i,1);continue}
        const prog=tp.life/tp.maxLife
        ctx.beginPath(); ctx.arc(tp.x,tp.y,prog*2.8,0,Math.PI*2)
        ctx.fillStyle=`rgba(240,201,122,${prog*0.58})`; ctx.fill()
      }

      /* ── 6. Shooting meteors ──────────────────────────────────────────── */
      for(const m of meteors){
        if(!m.active){
          m.timer--
          if(m.timer<=0){spawnMeteor(m); m.timer=Math.random()*700+250}
          continue
        }
        m.x+=m.vx; m.y+=m.vy
        m.alpha-=0.010
        if(m.alpha<=0||m.x>W+120||m.y>H+120){m.active=false; continue}
        const mag=Math.sqrt(m.vx*m.vx+m.vy*m.vy)
        const tx=m.x-m.vx*(m.len/mag)
        const ty=m.y-m.vy*(m.len/mag)
        const mg=ctx.createLinearGradient(tx,ty,m.x,m.y)
        mg.addColorStop(0,'rgba(255,240,180,0)')
        mg.addColorStop(1,`rgba(255,240,180,${m.alpha})`)
        ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(m.x,m.y)
        ctx.strokeStyle=mg; ctx.lineWidth=1.6; ctx.stroke()
        // glowing head
        const mhg=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,7)
        mhg.addColorStop(0,`rgba(255,248,210,${m.alpha})`)
        mhg.addColorStop(1,'rgba(255,248,210,0)')
        ctx.beginPath(); ctx.arc(m.x,m.y,7,0,Math.PI*2)
        ctx.fillStyle=mhg; ctx.fill()
      }

      /* ── 7. Click ripples ─────────────────────────────────────────────── */
      for(let i=ripples.length-1;i>=0;i--){
        const rp=ripples[i]
        rp.r+=7; rp.alpha-=0.016
        if(rp.alpha<=0){ripples.splice(i,1);continue}
        // outer ring
        ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2)
        ctx.strokeStyle=`rgba(200,169,106,${rp.alpha})`
        ctx.lineWidth=1.6; ctx.stroke()
        // middle ring (half radius, slower)
        if(rp.r>30){
          ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r*0.62,0,Math.PI*2)
          ctx.strokeStyle=`rgba(240,201,122,${rp.alpha*0.55})`
          ctx.lineWidth=0.9; ctx.stroke()
        }
        // inner ring
        if(rp.r>55){
          ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r*0.32,0,Math.PI*2)
          ctx.strokeStyle=`rgba(255,230,160,${rp.alpha*0.35})`
          ctx.lineWidth=0.6; ctx.stroke()
        }
      }

      /* ── 8. 3D Torus ──────────────────────────────────────────────────── */
      angleY+=0.0038; angleX+=0.0009
      const tiltX=mx*0.52, tiltY=my*0.40

      for(let i=0;i<N;i++){
        const {ox,oy,oz,ci}=pts[i]
        let p=rotY(ox,oy,oz,angleY+tiltX)
        p=rotX(p.x,p.y,p.z,angleX+tiltY)
        const d=p.z+R_MAJ+R_MIN+1
        const px=tcx+(p.x*scale*FOV)/(d*FOV+FOV*0.5)
        const py=tcy+(p.y*scale*FOV)/(d*FOV+FOV*0.5)
        const norm=(p.z+R_MAJ+R_MIN)/(2*(R_MAJ+R_MIN))
        proj[i]={x:px,y:py,z:p.z,size:norm*2.5+0.30,alpha:norm*0.80+0.16,ci}
      }
      proj.sort((a,b)=>a.z-b.z)

      // Torus connecting lines
      const step=5
      for(let i=0;i<N;i+=step){
        const a=proj[i]
        for(let j=i+step;j<Math.min(i+step*14,N);j+=step){
          const b=proj[j]
          const dx=a.x-b.x, dy=a.y-b.y, d2=dx*dx+dy*dy
          const th=25*(window.devicePixelRatio||1)
          if(d2<th*th){
            const str=(1-Math.sqrt(d2)/th)*Math.min(a.alpha,b.alpha)*0.38
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y)
            ctx.strokeStyle=`rgba(200,169,106,${str})`
            ctx.lineWidth=0.52; ctx.stroke()
          }
        }
      }

      // Torus particles
      for(let i=0;i<N;i++){
        const {x,y,size,alpha,ci}=proj[i]
        const [r,g,b]=PALETTE[ci]
        if(alpha>GLOW_THRESH){
          const gR=size*5.8
          const grd=ctx.createRadialGradient(x,y,0,x,y,gR)
          const ga=(alpha-GLOW_THRESH)/(1-GLOW_THRESH)*0.50
          grd.addColorStop(0,`rgba(${r},${g},${b},${ga})`)
          grd.addColorStop(1,`rgba(${r},${g},${b},0)`)
          ctx.beginPath(); ctx.arc(x,y,gR,0,Math.PI*2)
          ctx.fillStyle=grd; ctx.fill()
        }
        ctx.beginPath(); ctx.arc(x,y,size*0.72,0,Math.PI*2)
        ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`; ctx.fill()
      }

      // Breathing central glow
      const breathe=0.82+0.18*Math.sin(t*0.022)
      const bGrd=ctx.createRadialGradient(tcx,tcy,0,tcx,tcy,scale*breathe*1.1)
      bGrd.addColorStop(0,'rgba(200,169,106,0.055)')
      bGrd.addColorStop(0.45,'rgba(200,169,106,0.020)')
      bGrd.addColorStop(1,'rgba(200,169,106,0)')
      ctx.beginPath(); ctx.arc(tcx,tcy,scale*breathe*1.1,0,Math.PI*2)
      ctx.fillStyle=bGrd; ctx.fill()

      /* ── 9. Vignette (cinematic depth) ────────────────────────────────── */
      const vig=ctx.createRadialGradient(W/2,H/2,H*0.28,W/2,H/2,H*1.05)
      vig.addColorStop(0,'rgba(7,5,10,0)')
      vig.addColorStop(1,'rgba(7,5,10,0.60)')
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H)
    }

    /* ── Event listeners ─────────────────────────────────────────────────── */
    const onMove=(e:MouseEvent)=>{
      const rect=canvas.getBoundingClientRect()
      mx=(e.clientX-rect.left)/rect.width -0.5
      my=(e.clientY-rect.top) /rect.height-0.5
      absX=(e.clientX-rect.left)
      absY=(e.clientY-rect.top)

      // Spawn trail particle with slight random velocity
      if(trails.length<MAX_TRAIL){
        trails.push({
          x:absX*(window.devicePixelRatio||1),
          y:absY*(window.devicePixelRatio||1),
          life:26, maxLife:26,
          vx:(Math.random()-0.5)*1.2,
          vy:(Math.random()-0.5)*1.2,
        })
      } else {
        trails.shift()
        trails.push({
          x:absX*(window.devicePixelRatio||1),
          y:absY*(window.devicePixelRatio||1),
          life:26, maxLife:26,
          vx:(Math.random()-0.5)*1.2,
          vy:(Math.random()-0.5)*1.2,
        })
      }
    }

    const onLeave=()=>{ mx=0; my=0 }

    const onClick=(e:MouseEvent)=>{
      const rect=canvas.getBoundingClientRect()
      const dpr=window.devicePixelRatio||1
      const cx=(e.clientX-rect.left)*dpr
      const cy=(e.clientY-rect.top) *dpr
      ripples.push({x:cx,y:cy,r:4,alpha:0.75})
      // Burst of trail particles
      for(let i=0;i<16;i++){
        const ang=(i/16)*Math.PI*2
        const spd=Math.random()*4+1.5
        trails.push({
          x:cx, y:cy,
          life:35, maxLife:35,
          vx:Math.cos(ang)*spd,
          vy:Math.sin(ang)*spd,
        })
      }
    }

    window.addEventListener('resize',    resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave',onLeave)
    canvas.addEventListener('click',     onClick)

    resize()
    loop()

    return ()=>{
      cancelAnimationFrame(raf)
      window.removeEventListener('resize',    resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave',onLeave)
      canvas.removeEventListener('click',     onClick)
    }
  }, [])

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
