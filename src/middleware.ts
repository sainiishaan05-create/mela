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
  <title>Mela — Coming Soon</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:#F7F4EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      padding:2rem;
    }
    .card{
      text-align:center;max-width:480px;width:100%;
      background:#fff;border-radius:20px;padding:3rem 2.5rem;
      box-shadow:0 8px 40px rgba(0,0,0,0.08);
    }
    .logo{font-size:2.25rem;font-weight:700;color:#C8A96A;letter-spacing:-0.5px;margin-bottom:0.5rem}
    .tagline{font-size:0.85rem;color:#bbb;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:2rem}
    h1{font-size:1.5rem;font-weight:700;color:#1A1A1A;margin-bottom:0.75rem}
    p{color:#6b6b6b;font-size:1rem;line-height:1.6;margin-bottom:2rem}
    .dot{
      display:inline-block;width:8px;height:8px;border-radius:50%;
      background:#C8A96A;margin:0 4px;animation:bounce 1.2s infinite;
    }
    .dot:nth-child(2){animation-delay:0.2s}
    .dot:nth-child(3){animation-delay:0.4s}
    @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Mela</div>
    <div class="tagline">South Asian Wedding Vendors · GTA</div>
    <h1>We&rsquo;re making things better ✨</h1>
    <p>Our site is undergoing a quick upgrade. We&rsquo;ll be back shortly — better than ever.</p>
    <div>
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
