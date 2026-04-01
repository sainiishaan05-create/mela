import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── MAINTENANCE MODE ────────────────────────────────────────────
// Set to false and redeploy when ready to go back live.
const MAINTENANCE = true
// ────────────────────────────────────────────────────────────────

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Melaa — Something Big Is Coming</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;overflow:hidden}
    body{
      display:flex;align-items:center;justify-content:center;
      background:#110e07;
      font-family:'Inter',sans-serif;padding:2rem;position:relative;
    }
    canvas{position:fixed;inset:0;z-index:0;pointer-events:none;}

    /* soft radial glow behind card */
    .glow{
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      width:700px;height:700px;
      background:radial-gradient(ellipse at center,rgba(200,169,106,0.13) 0%,transparent 70%);
      pointer-events:none;z-index:0;
    }

    .card{
      text-align:center;max-width:560px;width:100%;
      background:rgba(17,14,7,0.55);
      border:1px solid rgba(200,169,106,0.22);
      border-radius:28px;padding:3.5rem 3rem;
      backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);
      box-shadow:0 0 0 1px rgba(200,169,106,0.06),0 40px 80px rgba(0,0,0,0.6);
      position:relative;z-index:1;
    }

    .logo{
      font-family:'Playfair Display',serif;
      font-size:3.25rem;font-weight:900;
      background:linear-gradient(120deg,#a8782a 0%,#e8bc60 40%,#f5d080 60%,#C8A96A 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      letter-spacing:-1px;margin-bottom:0.35rem;
      animation:shimmer 4s linear infinite;
      background-size:200% auto;
    }
    @keyframes shimmer{0%{background-position:0% center}100%{background-position:200% center}}

    .tagline{
      font-size:0.72rem;color:rgba(200,169,106,0.5);
      letter-spacing:0.2em;text-transform:uppercase;margin-bottom:2.25rem;
    }

    .badge{
      display:inline-flex;align-items:center;gap:6px;
      background:rgba(200,169,106,0.1);border:1px solid rgba(200,169,106,0.2);
      border-radius:999px;padding:0.35rem 1rem;margin-bottom:1.5rem;
      font-size:0.75rem;font-weight:600;color:rgba(200,169,106,0.9);
      letter-spacing:0.06em;text-transform:uppercase;
    }
    .badge-dot{width:6px;height:6px;border-radius:50%;background:#C8A96A;animation:pulse 2s ease-in-out infinite;}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}

    h1{
      font-family:'Playfair Display',serif;
      font-size:2.1rem;font-weight:900;color:#fff;
      line-height:1.2;margin-bottom:1rem;
    }
    h1 em{
      font-style:italic;
      background:linear-gradient(120deg,#C8A96A,#f0c97a);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }

    .sub{
      color:rgba(255,255,255,0.45);font-size:0.95rem;line-height:1.75;margin-bottom:2rem;
    }
    .sub strong{color:rgba(200,169,106,0.85);font-weight:600;}

    .pills{display:flex;flex-wrap:wrap;gap:0.45rem;justify-content:center;margin-bottom:2.25rem;}
    .pill{
      font-size:0.72rem;font-weight:500;
      padding:0.3rem 0.85rem;border-radius:999px;
      background:rgba(200,169,106,0.08);
      border:1px solid rgba(200,169,106,0.18);
      color:rgba(200,169,106,0.75);
      letter-spacing:0.03em;
      transition:all 0.3s ease;
    }

    .dots{display:flex;align-items:center;justify-content:center;gap:6px;}
    .dot{
      width:6px;height:6px;border-radius:50%;
      background:rgba(200,169,106,0.6);
      animation:bounce 1.5s ease-in-out infinite;
    }
    .dot:nth-child(2){animation-delay:0.25s}
    .dot:nth-child(3){animation-delay:0.5s}
    @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:0.4}40%{transform:translateY(-9px);opacity:1}}
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <div class="glow"></div>

  <div class="card">
    <div class="logo">Melaa</div>
    <div class="tagline">Weddings &amp; Events · South Asian · GTA</div>

    <div class="badge"><span class="badge-dot"></span> Launching Soon</div>

    <h1>Something <em>extraordinary</em><br/>is almost here.</h1>
    <p class="sub">
      The GTA&rsquo;s most <strong>complete South Asian event platform</strong> is getting a major upgrade.<br/>
      More vendors, richer profiles, and a seamless experience<br/>from first search to your perfect day.
    </p>

    <div class="pills">
      <span class="pill">📸 Photography</span>
      <span class="pill">🎬 Videography</span>
      <span class="pill">🎶 Entertainment</span>
      <span class="pill">💄 Beauty</span>
      <span class="pill">🍛 Catering</span>
      <span class="pill">💍 Jewellery</span>
      <span class="pill">✨ Decor</span>
      <span class="pill">🏛️ Venues</span>
    </div>

    <div class="dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>

  <script>
  (function(){
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    // --- colour palette (gold tones on dark) ---
    const GOLD   = [200, 169, 106];
    const AMBER  = [212, 168,  67];
    const CREAM  = [240, 201, 122];

    function rgba(rgb, a){ return \`rgba(\${rgb[0]},\${rgb[1]},\${rgb[2]},\${a})\`; }

    let W, H, nodes, mouse = {x:null, y:null};

    // --- Node ---
    function Node(){
      this.reset(true);
    }
    Node.prototype.reset = function(initial){
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = -(Math.random() * 0.4 + 0.15);
      this.r  = Math.random() * 2.2 + 0.8;
      const t = Math.random();
      this.col = t < 0.5 ? GOLD : t < 0.8 ? AMBER : CREAM;
      this.baseAlpha = Math.random() * 0.55 + 0.2;
      this.alpha = this.baseAlpha;
      this.phase = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.012 + 0.006;
    };
    Node.prototype.update = function(t){
      this.x += this.vx + Math.sin(t * this.speed + this.phase) * 0.3;
      this.y += this.vy;
      this.alpha = this.baseAlpha * (0.7 + 0.3 * Math.sin(t * this.speed * 2 + this.phase));
      if(this.y < -10 || this.x < -20 || this.x > W + 20) this.reset(false);
    };

    // --- resize ---
    function resize(){
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    // --- init ---
    function init(){
      resize();
      const count = Math.min(Math.floor(W * H / 9000), 110);
      nodes = Array.from({length: count}, () => new Node());
    }

    // --- draw connections ---
    const CONN_DIST = 140;
    const MOUSE_DIST = 180;

    function drawConnections(t){
      const len = nodes.length;
      for(let i = 0; i < len; i++){
        const a = nodes[i];

        // node → node
        for(let j = i + 1; j < len; j++){
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < CONN_DIST){
            const strength = 1 - dist / CONN_DIST;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = rgba(GOLD, strength * 0.18);
            ctx.lineWidth = strength * 1.2;
            ctx.stroke();
          }
        }

        // node → mouse
        if(mouse.x !== null){
          const dx = a.x - mouse.x, dy = a.y - mouse.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < MOUSE_DIST){
            const strength = 1 - dist / MOUSE_DIST;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = rgba(CREAM, strength * 0.35);
            ctx.lineWidth = strength * 1.5;
            ctx.stroke();
          }
        }
      }
    }

    // --- draw nodes ---
    function drawNodes(){
      nodes.forEach(n => {
        // glow halo
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
        grd.addColorStop(0,   rgba(n.col, n.alpha * 0.6));
        grd.addColorStop(1,   rgba(n.col, 0));
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(n.col, n.alpha);
        ctx.fill();
      });
    }

    // --- large slow drifting rings ---
    const RINGS = Array.from({length:3}, (_,i) => ({
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      r: 120 + i * 80,
      phase: i * 2.1,
      speed: 0.0003 + i * 0.0001,
    }));

    function drawRings(t){
      RINGS.forEach(ring => {
        ring.x += Math.sin(t * ring.speed + ring.phase) * 0.4;
        ring.y += Math.cos(t * ring.speed * 0.7 + ring.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(GOLD, 0.045);
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // --- loop ---
    let t = 0;
    function loop(){
      requestAnimationFrame(loop);
      t++;

      ctx.clearRect(0, 0, W, H);

      // subtle vignette
      const vig = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*0.72);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vig;
      ctx.fillRect(0,0,W,H);

      drawRings(t);
      nodes.forEach(n => n.update(t));
      drawConnections(t);
      drawNodes();
    }

    window.addEventListener('resize', ()=>{ resize(); init(); });
    window.addEventListener('mousemove', e=>{ mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', ()=>{ mouse.x = null; mouse.y = null; });

    init();
    loop();
  })();
  </script>
</body>
</html>`

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Maintenance mode — block public traffic on the live site.
  // Localhost is always bypassed so you can develop freely.
  const isLocalhost = request.headers.get('host')?.includes('localhost') || request.headers.get('host')?.includes('127.0.0.1')
  if (MAINTENANCE && !isLocalhost) {
    const allowed = ['/dashboard', '/login', '/api/auth']
    const isAllowed = allowed.some(p => pathname.startsWith(p))
    if (!isAllowed) {
      return new NextResponse(MAINTENANCE_HTML, {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': '3600',
        },
      })
    }
  }

  // Auth protection for /dashboard
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return supabaseResponse
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)'] }
