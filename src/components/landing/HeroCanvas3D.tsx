'use client'

import { useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────────────────────────────────────
   HERO CANVAS — Interactive Constellation Network

   Full-screen interactive node constellation like the maintenance page,
   but bigger, denser, and more responsive to mouse interaction.

   LAYER 0 · Stars            — 250 twinkling distant stars
   LAYER 1 · Nebula clouds    — 7 drifting gradient orbs (depth/warmth)
   LAYER 2 · Node network     — 220 magnetic nodes, mouse-reactive
   LAYER 3 · Cursor glow      — Soft gold halo tracking mouse
   LAYER 4 · Mouse trail      — Decaying gold particles behind cursor
   LAYER 5 · Shooting meteors — Diagonal gold streaks
   LAYER 6 · Click ripples    — Expanding concentric rings on click
   LAYER 7 · Vignette         — Radial edge darkening
─────────────────────────────────────────────────────────────────────────────── */

interface Node   { x:number;y:number;vx:number;vy:number;r:number;baseAlpha:number;alpha:number;phase:number;speed:number;speed2:number }
interface Star   { x:number;y:number;r:number;alpha:number;ph:number;spd:number }
interface Nebula { x:number;y:number;vx:number;vy:number;r:number;ph:number }
interface Trail  { x:number;y:number;life:number;maxLife:number;vx:number;vy:number }
interface Meteor { x:number;y:number;vx:number;vy:number;len:number;alpha:number;active:boolean;timer:number }
interface Ripple { x:number;y:number;r:number;alpha:number }

const NODE_COUNT  = 220
const MAX_TRAIL   = 40
const MAX_METEOR  = 5

export default function HeroCanvas3D() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    let W=0, H=0, raf=0, absX=0, absY=0

    let nodes:   Node[]   = []
    let stars:   Star[]   = []
    let nebulas: Nebula[] = []
    const trails:  Trail[]  = []
    const meteors: Meteor[] = []
    const ripples: Ripple[] = []

    for (let i=0;i<MAX_METEOR;i++)
      meteors.push({x:0,y:0,vx:0,vy:0,len:0,alpha:0,active:false,timer:Math.random()*500+150})

    function initScene() {
      const dpr = window.devicePixelRatio||1

      stars = Array.from({length:250},()=>({
        x:Math.random()*W, y:Math.random()*H,
        r:Math.random()*1.0+0.15,
        alpha:Math.random()*0.40+0.05,
        ph:Math.random()*Math.PI*2,
        spd:Math.random()*0.020+0.005,
      }))

      nebulas = Array.from({length:7},()=>({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.10, vy:(Math.random()-0.5)*0.06,
        r:Math.min(W,H)*(Math.random()*0.28+0.15),
        ph:Math.random()*Math.PI*2,
      }))

      nodes = Array.from({length:NODE_COUNT},()=>{
        const ba = Math.random()*0.30+0.08
        return{
          x:Math.random()*W, y:Math.random()*H,
          vx:(Math.random()-0.5)*0.30,
          vy:(Math.random()-0.5)*0.30,
          r:Math.random()*2.2+0.6,
          baseAlpha:ba, alpha:ba,
          phase:Math.random()*Math.PI*2,
          speed:Math.random()*0.012+0.004,
          speed2:0,
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
      initScene()
    }

    let t=0

    function loop(){
      raf=requestAnimationFrame(loop)
      t++
      ctx.clearRect(0,0,W,H)

      const dpr   = window.devicePixelRatio||1
      const mAbsX = absX*dpr
      const mAbsY = absY*dpr

      /* ── 0. Stars ─────────────────────────────────────────────────────── */
      for(const s of stars){
        s.ph+=s.spd
        const ta=s.alpha*(0.40+0.60*Math.sin(s.ph))
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(255,240,200,${ta})`; ctx.fill()
      }

      /* ── 1. Nebula clouds ─────────────────────────────────────────────── */
      for(const nc of nebulas){
        nc.x+=nc.vx+Math.sin(t*0.0022+nc.ph)*0.08
        nc.y+=nc.vy+Math.cos(t*0.0016+nc.ph)*0.05
        if(nc.x<-nc.r) nc.x=W+nc.r; if(nc.x>W+nc.r) nc.x=-nc.r
        if(nc.y<-nc.r) nc.y=H+nc.r; if(nc.y>H+nc.r) nc.y=-nc.r
        const p=0.80+0.20*Math.sin(t*0.0038+nc.ph)
        const nr=nc.r*p
        const g=ctx.createRadialGradient(nc.x,nc.y,0,nc.x,nc.y,nr)
        g.addColorStop(0,'rgba(200,140,55,0.035)')
        g.addColorStop(0.5,'rgba(170,110,40,0.015)')
        g.addColorStop(1,'rgba(150,90,30,0)')
        ctx.beginPath(); ctx.arc(nc.x,nc.y,nr,0,Math.PI*2)
        ctx.fillStyle=g; ctx.fill()
      }

      /* ── 2. Node network ──────────────────────────────────────────────── */
      const connDist   = Math.min(W,H)*0.12
      const mouseDist  = Math.min(W,H)*0.22
      const magnetDist = Math.min(W,H)*0.28
      const repelDist  = Math.min(W,H)*0.08
      const magnetF    = 0.035
      const repelF     = 0.12

      // Physics
      for(const n of nodes){
        const dxM=mAbsX-n.x, dyM=mAbsY-n.y
        const distM=Math.sqrt(dxM*dxM+dyM*dyM)

        let bx=n.vx, by=n.vy

        // Attract toward cursor at medium distance
        if(distM<magnetDist && distM>repelDist){
          const str=(1-distM/magnetDist)*magnetF
          bx+=dxM*str; by+=dyM*str
        }
        // Repel from cursor when very close (interactive push)
        if(distM<repelDist && distM>1){
          const str=(1-distM/repelDist)*repelF
          bx-=dxM/distM*str*8
          by-=dyM/distM*str*8
        }

        // Gentle drift + sine wobble
        n.x+=bx+Math.sin(t*n.speed+n.phase)*0.15
        n.y+=by+Math.cos(t*n.speed*0.7+n.phase)*0.10
        n.speed2=bx*bx+by*by

        // Twinkle
        n.alpha=n.baseAlpha*(0.55+0.45*Math.sin(t*n.speed*2.5+n.phase))

        // Wrap edges
        if(n.y<-20){n.y=H+10;n.x=Math.random()*W}
        if(n.y>H+20){n.y=-10;n.x=Math.random()*W}
        if(n.x<-20) n.x=W+10
        if(n.x>W+20) n.x=-10

        // Dampen velocity
        n.vx*=0.995; n.vy*=0.995
      }

      // Connection lines between nodes
      for(let i=0;i<nodes.length;i++){
        const a=nodes[i]
        for(let j=i+1;j<nodes.length;j++){
          const b=nodes[j]
          const dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy)
          if(dist<connDist){
            const str=(1-dist/connDist)*Math.min(a.alpha,b.alpha)*0.60
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y)
            ctx.strokeStyle=`rgba(200,169,106,${str})`
            ctx.lineWidth=(1-dist/connDist)*1.1
            ctx.stroke()
          }
        }
        // Cursor connection lines
        const dx=a.x-mAbsX, dy=a.y-mAbsY, dist=Math.sqrt(dx*dx+dy*dy)
        if(dist<mouseDist){
          const str=(1-dist/mouseDist)*a.alpha*1.2
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(mAbsX,mAbsY)
          ctx.strokeStyle=`rgba(240,201,122,${str})`
          ctx.lineWidth=(1-dist/mouseDist)*2.0
          ctx.stroke()
        }
      }

      // Draw nodes
      for(const n of nodes){
        const sf=Math.min(1,n.speed2*1800)
        const nr=Math.round(200+sf*55)
        const ng=Math.round(169+sf*76)
        const nb=Math.round(106+sf*84)

        // Outer glow
        const glowR=n.r*6
        const grd=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,glowR)
        grd.addColorStop(0,`rgba(${nr},${ng},${nb},${n.alpha*0.48})`)
        grd.addColorStop(1,`rgba(${nr},${ng},${nb},0)`)
        ctx.beginPath(); ctx.arc(n.x,n.y,glowR,0,Math.PI*2)
        ctx.fillStyle=grd; ctx.fill()

        // Core dot
        const coreR=n.r*(1+sf*0.6)
        ctx.beginPath(); ctx.arc(n.x,n.y,coreR,0,Math.PI*2)
        ctx.fillStyle=`rgba(${nr},${ng},${nb},${n.alpha*(1+sf*0.5)})`
        ctx.fill()
      }

      /* ── 3. Cursor glow ───────────────────────────────────────────────── */
      const cgR=Math.min(W,H)*0.13
      const cgrd=ctx.createRadialGradient(mAbsX,mAbsY,0,mAbsX,mAbsY,cgR)
      cgrd.addColorStop(0,'rgba(200,169,106,0.12)')
      cgrd.addColorStop(0.4,'rgba(200,169,106,0.04)')
      cgrd.addColorStop(1,'rgba(200,169,106,0)')
      ctx.beginPath(); ctx.arc(mAbsX,mAbsY,cgR,0,Math.PI*2)
      ctx.fillStyle=cgrd; ctx.fill()

      /* ── 4. Mouse trail ───────────────────────────────────────────────── */
      for(let i=trails.length-1;i>=0;i--){
        const tp=trails[i]; tp.life--; tp.x+=tp.vx; tp.y+=tp.vy; tp.vx*=0.94; tp.vy*=0.94
        if(tp.life<=0){trails.splice(i,1);continue}
        const prog=tp.life/tp.maxLife
        ctx.beginPath(); ctx.arc(tp.x,tp.y,prog*2.8,0,Math.PI*2)
        ctx.fillStyle=`rgba(240,201,122,${prog*0.55})`; ctx.fill()
      }

      /* ── 5. Shooting meteors ──────────────────────────────────────────── */
      for(const m of meteors){
        if(!m.active){m.timer--;if(m.timer<=0){spawnMeteor(m);m.timer=Math.random()*700+250};continue}
        m.x+=m.vx;m.y+=m.vy;m.alpha-=0.010
        if(m.alpha<=0||m.x>W+120||m.y>H+120){m.active=false;continue}
        const mag=Math.sqrt(m.vx*m.vx+m.vy*m.vy)
        const tx=m.x-m.vx*(m.len/mag),ty=m.y-m.vy*(m.len/mag)
        const mg=ctx.createLinearGradient(tx,ty,m.x,m.y)
        mg.addColorStop(0,'rgba(255,240,180,0)'); mg.addColorStop(1,`rgba(255,240,180,${m.alpha})`)
        ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(m.x,m.y)
        ctx.strokeStyle=mg; ctx.lineWidth=1.6; ctx.stroke()
        const mhg=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,7)
        mhg.addColorStop(0,`rgba(255,248,210,${m.alpha})`); mhg.addColorStop(1,'rgba(255,248,210,0)')
        ctx.beginPath(); ctx.arc(m.x,m.y,7,0,Math.PI*2); ctx.fillStyle=mhg; ctx.fill()
      }

      /* ── 6. Click ripples ─────────────────────────────────────────────── */
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

      /* ── 7. Vignette ──────────────────────────────────────────────────── */
      const vig=ctx.createRadialGradient(W/2,H/2,H*0.30,W/2,H/2,H*1.05)
      vig.addColorStop(0,'rgba(7,5,10,0)')
      vig.addColorStop(1,'rgba(7,5,10,0.58)')
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H)
    }

    /* ── Events ──────────────────────────────────────────────────────────── */
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
      // Burst particles
      for(let i=0;i<16;i++){
        const ang=i/16*Math.PI*2, spd=Math.random()*4+1.5
        trails.push({x:cx,y:cy,life:35,maxLife:35,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd})
      }
      // Push nearby nodes outward on click
      for(const n of nodes){
        const dx=n.x-cx, dy=n.y-cy, dist=Math.sqrt(dx*dx+dy*dy)
        const pushR=Math.min(W,H)*0.18
        if(dist<pushR && dist>1){
          const str=(1-dist/pushR)*3.5
          n.vx+=dx/dist*str
          n.vy+=dy/dist*str
        }
      }
    }

    window.addEventListener('resize',resize)
    window.addEventListener('mousemove',onMove)
    window.addEventListener('mouseleave',onLeave)
    canvas.addEventListener('click',onClick)
    resize(); loop()

    return ()=>{
      cancelAnimationFrame(raf)
      window.removeEventListener('resize',resize)
      window.removeEventListener('mousemove',onMove)
      window.removeEventListener('mouseleave',onLeave)
      canvas.removeEventListener('click',onClick)
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
