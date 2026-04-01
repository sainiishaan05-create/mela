'use client'

import { useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────────────────────────────────────
   HERO CANVAS — Ultra-immersive multi-layer animation  (igloo.inc-inspired)

   LAYER 0 · Stars            — 200 twinkling distant stars
   LAYER 1 · Nebula clouds    — 7 large drifting gradient orbs (aurora feel)
   LAYER 2 · Elliptic rings   — 6 aurora rings, varied aspect ratios, slow drift
   LAYER 3 · Node network     — 90 magnetic nodes; colour-shift by speed (igloo-style)
   LAYER 4 · Cursor glow      — Soft gold radial halo tracking mouse
   LAYER 5 · Mouse trail      — 40 golden particles that decay behind cursor
   LAYER 6 · Shooting meteors — Random diagonal gold streaks with glowing heads
   LAYER 7 · Click ripples    — 3 expanding concentric rings on click
   LAYER 8 · 3D Torus         — 3 600 particles, 4-layer hot-white glow, breathes
   LAYER 9 · Scan lines       — Subtle horizontal scan sweep for technical feel
   LAYER 10· Vignette         — Radial edge darkening for cinematic depth
─────────────────────────────────────────────────────────────────────────────── */

// ── Torus constants ──────────────────────────────────────────────────────────
const N           = 3600
const R_MAJ       = 2.1
const R_MIN       = 0.78
const FOV         = 420
const GLOW_THRESH = 0.42   // lower = more particles get bloom

const PALETTE: [number,number,number][] = [
  [110,  75,  20],   // deep shadow gold
  [160, 120,  55],   // mid gold
  [210, 170,  90],   // warm gold
  [245, 210, 130],   // bright gold
  [255, 248, 210],   // near-white hot
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
  speed2:number   // velocity magnitude squared (igloo-style colour shift)
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
    let mx=0, my=0
    let absX=0, absY=0

    // scan-line state
    let scanY = 0

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

    for(let i=0;i<MAX_METEOR;i++){
      meteors.push({x:0,y:0,vx:0,vy:0,len:0,alpha:0,active:false,
        timer:Math.random()*500+150})
    }

    function initScene(){
      const dpr=window.devicePixelRatio||1

      stars = Array.from({length:200},()=>({
        x:Math.random()*W, y:Math.random()*H*0.92,
        r:Math.random()*0.9+0.15,
        alpha:Math.random()*0.35+0.04,
        ph:Math.random()*Math.PI*2,
        spd:Math.random()*0.022+0.006,
      }))

      nebulas = Array.from({length:7},()=>({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.12, vy:(Math.random()-0.5)*0.07,
        r:Math.min(W,H)*(Math.random()*0.24+0.14),
        ph:Math.random()*Math.PI*2,
      }))

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
      scanY=0
      initScene()
    }

    let t=0

    function loop(){
      raf=requestAnimationFrame(loop)
      t++
      ctx.clearRect(0,0,W,H)

      const dpr    = window.devicePixelRatio||1
      const wide   = W > H*1.1
      const tcx    = wide ? W*0.62 : W*0.50
      const tcy    = H*0.50
      const scale  = Math.min(W,H)*0.255
      const mAbsX  = absX*dpr
      const mAbsY  = absY*dpr

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
        if(nc.x<-nc.r) nc.x=W+nc.r
        if(nc.x>W+nc.r) nc.x=-nc.r
        if(nc.y<-nc.r) nc.y=H+nc.r
        if(nc.y>H+nc.r) nc.y=-nc.r
        const pulse=0.78+0.22*Math.sin(t*0.0038+nc.ph)
        const nr=nc.r*pulse
        const g=ctx.createRadialGradient(nc.x,nc.y,0,nc.x,nc.y,nr)
        g.addColorStop(0,'rgba(200,140,55,0.032)')
        g.addColorStop(0.45,'rgba(170,110,40,0.014)')
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
        ctx.lineWidth=0.85; ctx.stroke()
        ctx.restore()
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

        let bx=n.vx, by=n.vy
        if(distM<magnetDist){
          const str=(1-distM/magnetDist)*magnetF
          bx+=dxM*str; by+=dyM*str
        }
        n.x+=bx+Math.sin(t*n.speed+n.phase)*0.18
        n.y+=by
        n.speed2=bx*bx+by*by

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
        const dx=a.x-mAbsX, dy=a.y-mAbsY
        const dist=Math.sqrt(dx*dx+dy*dy)
        if(dist<mouseDist){
          const str=(1-dist/mouseDist)*a.alpha*1.0
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(mAbsX,mAbsY)
          ctx.strokeStyle=`rgba(240,201,122,${str})`
          ctx.lineWidth=(1-dist/mouseDist)*1.6; ctx.stroke()
        }
      }

      // Draw nodes — colour shifts when fast (igloo velocity colour)
      for(let i=0;i<bgNodes.length;i++){
        const n=bgNodes[i]
        const speedFactor=Math.min(1,n.speed2*2000)
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
      cgrd.addColorStop(0,'rgba(200,169,106,0.10)')
      cgrd.addColorStop(0.38,'rgba(200,169,106,0.035)')
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
        ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2)
        ctx.strokeStyle=`rgba(200,169,106,${rp.alpha})`
        ctx.lineWidth=1.6; ctx.stroke()
        if(rp.r>30){
          ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r*0.62,0,Math.PI*2)
          ctx.strokeStyle=`rgba(240,201,122,${rp.alpha*0.55})`
          ctx.lineWidth=0.9; ctx.stroke()
        }
        if(rp.r>55){
          ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r*0.32,0,Math.PI*2)
          ctx.strokeStyle=`rgba(255,230,160,${rp.alpha*0.35})`
          ctx.lineWidth=0.6; ctx.stroke()
        }
      }

      /* ── 8. 3D Torus (igloo-style dramatic glow) ─────────────────────── */
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
        proj[i]={x:px,y:py,z:p.z,size:norm*2.6+0.28,alpha:norm*0.82+0.14,ci}
      }
      proj.sort((a,b)=>a.z-b.z)

      // ── Torus connecting lines ──────────────────────────────────────────
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

      // ── igloo-style: 4-layer dramatic breathing glow ────────────────────
      // (drawn BEFORE particles so they sit on top)
      const breathe  = 0.82+0.18*Math.sin(t*0.022)
      const breathe2 = 0.70+0.30*Math.sin(t*0.018+1.2)
      const breathe3 = 0.90+0.10*Math.sin(t*0.031)
      const breathe4 = 0.85+0.15*Math.sin(t*0.014+2.5)

      // Layer A — wide soft halo (outermost)
      const glA=ctx.createRadialGradient(tcx,tcy,scale*0.55,tcx,tcy,scale*breathe*1.28)
      glA.addColorStop(0,'rgba(200,155,60,0.09)')
      glA.addColorStop(0.5,'rgba(190,140,50,0.04)')
      glA.addColorStop(1,'rgba(180,120,30,0)')
      ctx.beginPath(); ctx.arc(tcx,tcy,scale*breathe*1.28,0,Math.PI*2)
      ctx.fillStyle=glA; ctx.fill()

      // Layer B — medium warm gold
      const glB=ctx.createRadialGradient(tcx,tcy,scale*0.20,tcx,tcy,scale*breathe2*0.80)
      glB.addColorStop(0,'rgba(230,185,90,0.14)')
      glB.addColorStop(0.45,'rgba(210,165,70,0.07)')
      glB.addColorStop(1,'rgba(200,140,50,0)')
      ctx.beginPath(); ctx.arc(tcx,tcy,scale*breathe2*0.80,0,Math.PI*2)
      ctx.fillStyle=glB; ctx.fill()

      // Layer C — tight bright-gold inner glow (igloo ring inner glow)
      const glC=ctx.createRadialGradient(tcx,tcy,0,tcx,tcy,scale*breathe3*0.40)
      glC.addColorStop(0,'rgba(255,248,210,0.22)')
      glC.addColorStop(0.30,'rgba(255,230,150,0.14)')
      glC.addColorStop(0.65,'rgba(230,185,90,0.06)')
      glC.addColorStop(1,'rgba(200,140,50,0)')
      ctx.beginPath(); ctx.arc(tcx,tcy,scale*breathe3*0.40,0,Math.PI*2)
      ctx.fillStyle=glC; ctx.fill()

      // Layer D — hot-white core pulse (igloo's bright white centre)
      const pulse4=0.68+0.32*Math.sin(t*0.028+0.7)
      const glD=ctx.createRadialGradient(tcx,tcy,0,tcx,tcy,scale*breathe4*0.18)
      glD.addColorStop(0,`rgba(255,255,245,${0.32*pulse4})`)
      glD.addColorStop(0.40,`rgba(255,242,195,${0.16*pulse4})`)
      glD.addColorStop(1,'rgba(255,220,140,0)')
      ctx.beginPath(); ctx.arc(tcx,tcy,scale*breathe4*0.18,0,Math.PI*2)
      ctx.fillStyle=glD; ctx.fill()

      // ── Torus particles ─────────────────────────────────────────────────
      for(let i=0;i<N;i++){
        const {x,y,size,alpha,ci}=proj[i]
        const [r,g,b]=PALETTE[ci]
        if(alpha>GLOW_THRESH){
          // Extra bloom for bright (front-facing) particles
          const bloomR=size*7.2
          const grd=ctx.createRadialGradient(x,y,0,x,y,bloomR)
          const ga=(alpha-GLOW_THRESH)/(1-GLOW_THRESH)*0.55
          grd.addColorStop(0,`rgba(${r},${g},${b},${ga})`)
          grd.addColorStop(0.5,`rgba(${r},${g},${b},${ga*0.3})`)
          grd.addColorStop(1,`rgba(${r},${g},${b},0)`)
          ctx.beginPath(); ctx.arc(x,y,bloomR,0,Math.PI*2)
          ctx.fillStyle=grd; ctx.fill()
        }
        // Core particle — slightly larger for high-alpha (front-facing)
        const coreR = size * (alpha > 0.72 ? 0.90 : 0.72)
        ctx.beginPath(); ctx.arc(x,y,coreR,0,Math.PI*2)
        ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`; ctx.fill()
      }

      // ── Bright hot-ring stroke at torus centre radius ───────────────────
      // (igloo's segmented ring glow — a thin luminous circle)
      const ringR   = scale * 0.92    // approximately traces the major radius
      const ringPulse = 0.75 + 0.25 * Math.sin(t * 0.024 + 1.8)
      const ringAlpha = 0.055 * ringPulse
      ctx.save()
      ctx.translate(tcx, tcy)
      // Ellipse to match torus perspective tilt
      ctx.scale(1, 0.42)
      // Outer glow stroke
      ctx.beginPath(); ctx.arc(0, 0, ringR, 0, Math.PI*2)
      ctx.strokeStyle=`rgba(255,240,180,${ringAlpha * 0.8})`
      ctx.lineWidth = 4.5; ctx.stroke()
      // Bright inner stroke
      ctx.beginPath(); ctx.arc(0, 0, ringR, 0, Math.PI*2)
      ctx.strokeStyle=`rgba(255,252,225,${ringAlpha * 1.4})`
      ctx.lineWidth = 1.2; ctx.stroke()
      ctx.restore()

      /* ── 9. Scan-line sweep (technical feel) ─────────────────────────── */
      scanY = (scanY + 0.8) % H
      const slH = H * 0.055
      const sg = ctx.createLinearGradient(0, scanY - slH, 0, scanY + slH)
      sg.addColorStop(0,   'rgba(200,169,106,0)')
      sg.addColorStop(0.40,'rgba(200,169,106,0.015)')
      sg.addColorStop(0.50,'rgba(220,190,120,0.028)')
      sg.addColorStop(0.60,'rgba(200,169,106,0.015)')
      sg.addColorStop(1,   'rgba(200,169,106,0)')
      ctx.fillStyle=sg
      ctx.fillRect(0, scanY - slH, W, slH * 2)

      /* ── 10. Vignette ─────────────────────────────────────────────────── */
      const vig=ctx.createRadialGradient(W/2,H/2,H*0.28,W/2,H/2,H*1.05)
      vig.addColorStop(0,'rgba(7,5,10,0)')
      vig.addColorStop(1,'rgba(7,5,10,0.62)')
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H)
    }

    /* ── Event listeners ─────────────────────────────────────────────────── */
    const onMove=(e:MouseEvent)=>{
      const rect=canvas.getBoundingClientRect()
      mx=(e.clientX-rect.left)/rect.width -0.5
      my=(e.clientY-rect.top) /rect.height-0.5
      absX=(e.clientX-rect.left)
      absY=(e.clientY-rect.top)

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
