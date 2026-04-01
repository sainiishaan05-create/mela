'use client'

import { useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────────────────────────────────────
   HERO CANVAS — Dense Rising Constellation

   600+ bright gold nodes continuously rising, 3 depth layers (near/mid/far),
   mouse repels nodes outward (never attracts/clumps), click explodes them.
   Bright warm gold palette, large glows, hot-white cores.
─────────────────────────────────────────────────────────────────────────────── */

// Depth layer: 0=far (small,dim), 1=mid, 2=near (big,bright)
interface Node { x:number;y:number;vx:number;vy:number;r:number;baseAlpha:number;alpha:number;phase:number;speed:number;speed2:number;depth:number }
interface Star   { x:number;y:number;r:number;alpha:number;ph:number;spd:number }
interface Nebula { x:number;y:number;vx:number;vy:number;r:number;ph:number }
interface Trail  { x:number;y:number;life:number;maxLife:number;vx:number;vy:number }
interface Meteor { x:number;y:number;vx:number;vy:number;len:number;alpha:number;active:boolean;timer:number }
interface Ripple { x:number;y:number;r:number;alpha:number }

const NODE_COUNT = 600
const MAX_TRAIL  = 40
const MAX_METEOR = 5

// Depth layer configs: [radiusMin, radiusMax, alphaMin, alphaMax, riseSpeedMin, riseSpeedMax, glowMult]
const LAYERS: [number,number,number,number,number,number,number][] = [
  [0.4, 1.2,  0.10, 0.25,  0.12, 0.30, 4.0],  // far  — small, dim, slow
  [1.0, 2.4,  0.22, 0.42,  0.25, 0.50, 5.5],  // mid  — medium
  [2.0, 4.0,  0.40, 0.70,  0.35, 0.65, 7.5],  // near — big, bright, fast
]

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

    for(let i=0;i<MAX_METEOR;i++)
      meteors.push({x:0,y:0,vx:0,vy:0,len:0,alpha:0,active:false,timer:Math.random()*500+150})

    function makeNode(yOverride?:number): Node {
      // 30% far, 45% mid, 25% near
      const roll = Math.random()
      const depth = roll<0.30?0 : roll<0.75?1 : 2
      const L = LAYERS[depth]
      const ba = L[2]+Math.random()*(L[3]-L[2])
      return {
        x: Math.random()*W,
        y: yOverride ?? Math.random()*H,
        vx: (Math.random()-0.5)*0.14,
        vy: -(L[4]+Math.random()*(L[5]-L[4])),
        r: L[0]+Math.random()*(L[1]-L[0]),
        baseAlpha:ba, alpha:ba,
        phase: Math.random()*Math.PI*2,
        speed: Math.random()*0.014+0.004,
        speed2:0, depth,
      }
    }

    function initScene() {
      const dpr=window.devicePixelRatio||1
      stars = Array.from({length:280},()=>({
        x:Math.random()*W, y:Math.random()*H,
        r:Math.random()*1.1+0.2,
        alpha:Math.random()*0.45+0.06,
        ph:Math.random()*Math.PI*2,
        spd:Math.random()*0.022+0.005,
      }))
      nebulas = Array.from({length:7},()=>({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.10, vy:(Math.random()-0.5)*0.06,
        r:Math.min(W,H)*(Math.random()*0.28+0.15),
        ph:Math.random()*Math.PI*2,
      }))
      nodes = Array.from({length:NODE_COUNT},()=>makeNode())
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
        const ta=s.alpha*(0.35+0.65*Math.sin(s.ph))
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(255,245,210,${ta})`; ctx.fill()
      }

      /* ── 1. Nebula clouds ─────────────────────────────────────────────── */
      for(const nc of nebulas){
        nc.x+=nc.vx+Math.sin(t*0.0022+nc.ph)*0.08
        nc.y+=nc.vy+Math.cos(t*0.0016+nc.ph)*0.05
        if(nc.x<-nc.r)nc.x=W+nc.r; if(nc.x>W+nc.r)nc.x=-nc.r
        if(nc.y<-nc.r)nc.y=H+nc.r; if(nc.y>H+nc.r)nc.y=-nc.r
        const p=0.80+0.20*Math.sin(t*0.0038+nc.ph)
        const nr=nc.r*p
        const g=ctx.createRadialGradient(nc.x,nc.y,0,nc.x,nc.y,nr)
        g.addColorStop(0,'rgba(210,160,60,0.040)')
        g.addColorStop(0.5,'rgba(180,120,40,0.018)')
        g.addColorStop(1,'rgba(150,90,30,0)')
        ctx.beginPath(); ctx.arc(nc.x,nc.y,nr,0,Math.PI*2)
        ctx.fillStyle=g; ctx.fill()
      }

      /* ── 2. Node network ──────────────────────────────────────────────── */
      const connDist   = Math.min(W,H)*0.095
      const mouseDist  = Math.min(W,H)*0.16
      const repelDist  = Math.min(W,H)*0.14
      const repelF     = 0.055

      // Physics — continuous rise, mouse ONLY repels (no attract = no clumping)
      const fadeTop = H*0.12, fadeBot = H*0.12
      for(const n of nodes){
        const dxM=mAbsX-n.x, dyM=mAbsY-n.y
        const distM=Math.sqrt(dxM*dxM+dyM*dyM)

        let bx=n.vx, by=n.vy

        // REPEL ONLY — push nodes away from cursor, never attract
        if(distM<repelDist && distM>1){
          const str=(1-distM/repelDist)*repelF
          bx -= dxM/distM*str*6
          by -= dyM/distM*str*6
        }

        n.x += bx+Math.sin(t*n.speed+n.phase)*0.20
        n.y += by+Math.cos(t*n.speed*0.7+n.phase)*0.06
        n.speed2 = bx*bx+by*by

        // Edge fade
        let fade=1
        if(n.y<fadeTop)      fade=Math.max(0,n.y/fadeTop)
        if(n.y>H-fadeBot)    fade=Math.max(0,(H-n.y)/fadeBot)

        n.alpha = n.baseAlpha*(0.50+0.50*Math.sin(t*n.speed*2.5+n.phase))*fade

        // Respawn at bottom
        if(n.y<-40){
          const fresh=makeNode(H+Math.random()*80)
          n.x=fresh.x; n.y=fresh.y; n.vx=fresh.vx; n.vy=fresh.vy
          n.r=fresh.r; n.baseAlpha=fresh.baseAlpha; n.depth=fresh.depth
        }
        if(n.x<-40) n.x=W+20
        if(n.x>W+40) n.x=-20

        // Dampen horizontal drift, preserve upward rise
        n.vx*=0.992
        // Gently restore upward velocity if it was disrupted by click/repel
        const L=LAYERS[n.depth]
        const targetVy=-(L[4]+L[5])*0.5
        n.vy+=(targetVy-n.vy)*0.008
      }

      // Spatial grid for connections
      const cellSize=connDist
      const cols=Math.ceil(W/cellSize)+1
      const gridRows=Math.ceil(H/cellSize)+1
      const grid:number[][]=new Array(cols*gridRows)
      for(let i=0;i<grid.length;i++) grid[i]=[]
      for(let i=0;i<nodes.length;i++){
        const n=nodes[i]
        const cx2=Math.floor(n.x/cellSize),cy2=Math.floor(n.y/cellSize)
        if(cx2>=0&&cx2<cols&&cy2>=0&&cy2<gridRows) grid[cy2*cols+cx2].push(i)
      }

      const cd2=connDist*connDist
      const nb:number[][]= [[0,0],[1,0],[0,1],[1,1],[-1,1]]
      for(let gy=0;gy<gridRows;gy++){
        for(let gx=0;gx<cols;gx++){
          const cell=grid[gy*cols+gx]
          for(const [ox,oy] of nb){
            const nx2=gx+ox,ny2=gy+oy
            if(nx2<0||nx2>=cols||ny2<0||ny2>=gridRows)continue
            const other=grid[ny2*cols+nx2]
            const same=ox===0&&oy===0
            for(let ii=0;ii<cell.length;ii++){
              const ai=cell[ii],a=nodes[ai]
              for(let jj=same?ii+1:0;jj<other.length;jj++){
                const bi=other[jj],b=nodes[bi]
                const dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy
                if(d2<cd2){
                  const dist=Math.sqrt(d2)
                  const str=(1-dist/connDist)*Math.min(a.alpha,b.alpha)*0.50
                  if(str>0.004){
                    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y)
                    ctx.strokeStyle=`rgba(220,190,120,${str})`
                    ctx.lineWidth=(1-dist/connDist)*1.1
                    ctx.stroke()
                  }
                }
              }
            }
          }
        }
      }

      // Cursor connection lines (bright)
      for(const a of nodes){
        const dx=a.x-mAbsX,dy=a.y-mAbsY,dist=Math.sqrt(dx*dx+dy*dy)
        if(dist<mouseDist){
          const str=(1-dist/mouseDist)*a.alpha*1.4
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(mAbsX,mAbsY)
          ctx.strokeStyle=`rgba(255,225,140,${str})`
          ctx.lineWidth=(1-dist/mouseDist)*2.2
          ctx.stroke()
        }
      }

      // Draw nodes — bright warm gold with hot-white centres
      for(const n of nodes){
        if(n.alpha<0.01)continue
        const sf=Math.min(1,n.speed2*1400)
        const L=LAYERS[n.depth]
        const glowMul=L[6]

        // Colour shifts brighter when moving fast
        const cr=Math.round(230+sf*25)
        const cg=Math.round(200+sf*45)
        const cb=Math.round(120+sf*80)

        // Outer glow (warm gold halo)
        const glowR=n.r*glowMul
        const grd=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,glowR)
        grd.addColorStop(0,`rgba(${cr},${cg},${cb},${n.alpha*0.55})`)
        grd.addColorStop(0.5,`rgba(${cr},${cg},${cb},${n.alpha*0.15})`)
        grd.addColorStop(1,`rgba(${cr},${cg},${cb},0)`)
        ctx.beginPath(); ctx.arc(n.x,n.y,glowR,0,Math.PI*2)
        ctx.fillStyle=grd; ctx.fill()

        // Core dot (bright gold)
        const coreR=n.r*(1+sf*0.5)
        ctx.beginPath(); ctx.arc(n.x,n.y,coreR,0,Math.PI*2)
        ctx.fillStyle=`rgba(${cr},${cg},${cb},${Math.min(1,n.alpha*1.6)})`
        ctx.fill()

        // Hot white centre for near-layer nodes
        if(n.depth===2 && n.alpha>0.15){
          const hotR=coreR*0.45
          ctx.beginPath(); ctx.arc(n.x,n.y,hotR,0,Math.PI*2)
          ctx.fillStyle=`rgba(255,252,235,${n.alpha*0.9})`
          ctx.fill()
        }
      }

      /* ── 3. Cursor glow ───────────────────────────────────────────────── */
      const cgR=Math.min(W,H)*0.14
      const cgrd=ctx.createRadialGradient(mAbsX,mAbsY,0,mAbsX,mAbsY,cgR)
      cgrd.addColorStop(0,'rgba(255,220,120,0.14)')
      cgrd.addColorStop(0.4,'rgba(230,190,90,0.05)')
      cgrd.addColorStop(1,'rgba(200,160,70,0)')
      ctx.beginPath(); ctx.arc(mAbsX,mAbsY,cgR,0,Math.PI*2)
      ctx.fillStyle=cgrd; ctx.fill()

      /* ── 4. Mouse trail ───────────────────────────────────────────────── */
      for(let i=trails.length-1;i>=0;i--){
        const tp=trails[i]; tp.life--; tp.x+=tp.vx; tp.y+=tp.vy; tp.vx*=0.94; tp.vy*=0.94
        if(tp.life<=0){trails.splice(i,1);continue}
        const prog=tp.life/tp.maxLife
        ctx.beginPath(); ctx.arc(tp.x,tp.y,prog*3.0,0,Math.PI*2)
        ctx.fillStyle=`rgba(255,220,130,${prog*0.60})`; ctx.fill()
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
        mhg.addColorStop(0,`rgba(255,250,220,${m.alpha})`); mhg.addColorStop(1,'rgba(255,250,220,0)')
        ctx.beginPath(); ctx.arc(m.x,m.y,7,0,Math.PI*2); ctx.fillStyle=mhg; ctx.fill()
      }

      /* ── 6. Click ripples ─────────────────────────────────────────────── */
      for(let i=ripples.length-1;i>=0;i--){
        const rp=ripples[i]; rp.r+=7; rp.alpha-=0.016
        if(rp.alpha<=0){ripples.splice(i,1);continue}
        ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r,0,Math.PI*2)
        ctx.strokeStyle=`rgba(255,220,130,${rp.alpha})`; ctx.lineWidth=1.6; ctx.stroke()
        if(rp.r>30){
          ctx.beginPath(); ctx.arc(rp.x,rp.y,rp.r*0.62,0,Math.PI*2)
          ctx.strokeStyle=`rgba(255,235,160,${rp.alpha*0.55})`; ctx.lineWidth=0.9; ctx.stroke()
        }
      }

      /* ── 7. Vignette ──────────────────────────────────────────────────── */
      const vig=ctx.createRadialGradient(W/2,H/2,H*0.32,W/2,H/2,H*1.05)
      vig.addColorStop(0,'rgba(7,5,10,0)')
      vig.addColorStop(1,'rgba(7,5,10,0.55)')
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
      ripples.push({x:cx,y:cy,r:4,alpha:0.80})
      for(let i=0;i<20;i++){
        const ang=i/20*Math.PI*2, spd=Math.random()*5+2
        trails.push({x:cx,y:cy,life:40,maxLife:40,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd})
      }
      // Explode nearby nodes outward (never inward)
      for(const n of nodes){
        const dx=n.x-cx, dy=n.y-cy, dist=Math.sqrt(dx*dx+dy*dy)
        const pushR=Math.min(W,H)*0.22
        if(dist<pushR && dist>1){
          const str=(1-dist/pushR)*5.0
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
    <canvas ref={ref} style={{display:'block',width:'100%',height:'100%',position:'absolute',inset:0,cursor:'crosshair'}} />
  )
}
