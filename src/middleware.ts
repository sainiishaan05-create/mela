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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#1a1008 0%,#2d1f0a 50%,#1a1008 100%);
      font-family:'Inter',sans-serif;padding:2rem;overflow:hidden;position:relative;
    }
    /* floating orbs */
    body::before,body::after{
      content:'';position:fixed;border-radius:50%;filter:blur(80px);opacity:0.25;pointer-events:none;
    }
    body::before{width:500px;height:500px;background:#C8A96A;top:-100px;right:-100px;animation:drift 8s ease-in-out infinite;}
    body::after{width:400px;height:400px;background:#d4a843;bottom:-80px;left:-80px;animation:drift 10s ease-in-out infinite reverse;}
    @keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,20px)}}

    .card{
      text-align:center;max-width:560px;width:100%;
      background:rgba(255,255,255,0.04);
      border:1px solid rgba(200,169,106,0.25);
      border-radius:28px;padding:3.5rem 3rem;
      backdrop-filter:blur(20px);
      box-shadow:0 0 80px rgba(200,169,106,0.08),0 32px 64px rgba(0,0,0,0.4);
      position:relative;z-index:1;
    }
    .logo{
      font-family:'Playfair Display',serif;
      font-size:3rem;font-weight:900;
      background:linear-gradient(135deg,#C8A96A,#f0c97a,#C8A96A);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      letter-spacing:-1px;margin-bottom:0.35rem;
    }
    .tagline{
      font-size:0.75rem;color:rgba(200,169,106,0.6);
      letter-spacing:0.18em;text-transform:uppercase;margin-bottom:2.5rem;
    }
    .emoji{font-size:2.5rem;margin-bottom:1.25rem;display:block;animation:pop 2s ease-in-out infinite;}
    @keyframes pop{0%,100%{transform:scale(1) rotate(-3deg)}50%{transform:scale(1.15) rotate(3deg)}}
    h1{
      font-family:'Playfair Display',serif;
      font-size:2rem;font-weight:700;color:#fff;
      line-height:1.2;margin-bottom:1rem;
    }
    h1 span{
      background:linear-gradient(135deg,#C8A96A,#f0c97a);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }
    .sub{color:rgba(255,255,255,0.55);font-size:1rem;line-height:1.7;margin-bottom:2rem;}
    .sub strong{color:rgba(200,169,106,0.9);font-weight:600;}
    .pills{display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;margin-bottom:2.25rem;}
    .pill{
      font-size:0.75rem;font-weight:500;
      padding:0.35rem 0.9rem;border-radius:999px;
      background:rgba(200,169,106,0.12);
      border:1px solid rgba(200,169,106,0.25);
      color:rgba(200,169,106,0.85);
      letter-spacing:0.02em;
    }
    .dots{display:flex;align-items:center;justify-content:center;gap:6px;}
    .dot{
      width:7px;height:7px;border-radius:50%;
      background:linear-gradient(135deg,#C8A96A,#f0c97a);
      animation:bounce 1.4s ease-in-out infinite;
    }
    .dot:nth-child(2){animation-delay:0.2s}
    .dot:nth-child(3){animation-delay:0.4s}
    @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:0.5}40%{transform:translateY(-10px);opacity:1}}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Melaa</div>
    <div class="tagline">South Asian Wedding Vendors · GTA</div>
    <span class="emoji">🌟</span>
    <h1>Something <span>big</span> is<br/>almost here.</h1>
    <p class="sub">
      We&rsquo;re putting the finishing touches on the <strong>GTA&rsquo;s #1 South Asian wedding platform</strong>.<br/>
      Better profiles. More vendors. A whole new experience.
    </p>
    <div class="pills">
      <span class="pill">📸 Photographers</span>
      <span class="pill">🎶 DJs</span>
      <span class="pill">💄 Makeup Artists</span>
      <span class="pill">🌸 Mehndi</span>
      <span class="pill">🍛 Catering</span>
      <span class="pill">💍 Jewellers</span>
      <span class="pill">✨ Decor</span>
    </div>
    <div class="dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</body>
</html>`

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Maintenance mode — block everything except /dashboard and /login
  // so you can still log in and work on the site.
  if (MAINTENANCE) {
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
