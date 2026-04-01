# Contributing to Melaa

> For Ishaan and all collaborators. Read this before writing any code.

---

## 1. Getting Set Up (First Time)

```bash
# 1. Clone the repo
git clone https://github.com/sainiishaan05-create/mela.git
cd mela

# 2. Set up your environment variables
cp .env.example .env.local
# Open .env.local and fill in the values — ask Ishaan for the keys

# 3. Start the dev server
./dev.sh
# → Opens at http://localhost:3000
```

**You'll see the full live site at localhost** — maintenance mode only blocks melaa.ca (the public URL), never localhost.

---

## 2. Branch Strategy

We use a simple **feature branch** workflow:

```
main                  ← production (what's live at melaa.ca)
  └── design/homepage       ← Ishaan working on homepage redesign
  └── feature/vendor-search ← someone building search
  └── feature/map-view      ← someone building map view
  └── fix/booking-flow      ← someone fixing a bug
```

### Rules
| Rule | Why |
|---|---|
| **Never commit directly to `main`** | `main` deploys to Vercel automatically — broken code goes live instantly |
| **One branch per feature/fix** | Keeps changes isolated so merges are clean |
| **Pull before you branch** | Avoids merge conflicts with stale code |
| **Small commits, often** | Easier to review and easier to undo |

---

## 3. Daily Workflow

### Starting new work
```bash
# Always start from an up-to-date main
git checkout main
git pull origin main

# Create your branch — name it clearly
git checkout -b design/homepage-redesign
# or
git checkout -b feature/vendor-search
# or
git checkout -b fix/stripe-webhook
```

### Saving your work
```bash
git add src/app/page.tsx src/components/Hero.tsx   # add specific files
git commit -m "redesign: new hero section with gradient background"
git push origin design/homepage-redesign
```

### Keeping up with others' changes
```bash
# While on your branch, pull in latest main without switching
git fetch origin
git rebase origin/main
# Fix any conflicts, then: git rebase --continue
```

---

## 4. Merging Your Work (Pull Requests)

When your feature is ready to ship:

1. Push your branch: `git push origin your-branch-name`
2. Go to GitHub → your repo → **Pull Requests** → **New Pull Request**
3. Base: `main` ← Compare: `your-branch-name`
4. Write a short description of what changed and why
5. Tag Ishaan as reviewer
6. Once approved → **Squash and Merge**

**Ishaan then flips `MAINTENANCE = false` in `src/middleware.ts` and pushes to deploy.**

---

## 5. Collaborator Cheat Sheet

```bash
# See what branch you're on
git branch

# See all branches (local + remote)
git branch -a

# Switch to an existing branch
git checkout design/homepage-redesign

# See what's changed (not committed yet)
git status
git diff

# Undo changes to a file (before committing)
git restore src/app/page.tsx

# See recent commits
git log --oneline -10

# Pull latest changes from main into your branch
git fetch origin && git rebase origin/main
```

---

## 6. What Lives Where

```
src/
  app/                    ← Pages (Next.js App Router)
    page.tsx              ← Homepage (melaa.ca/)
    dashboard/            ← Vendor dashboard
    vendors/              ← Vendor directory + profiles
    list-your-business/   ← Vendor signup page
    pricing/              ← Pricing page
    api/                  ← All API routes
      agents/             ← AI agent cron jobs
      stripe/             ← Stripe checkout + webhooks
      claim/              ← Vendor claim flow
  components/             ← Shared React components
    vendors/              ← Vendor-specific components
    dashboard/            ← Dashboard components
  lib/                    ← Utilities (supabase client, stripe config)
  types/                  ← TypeScript types

src/middleware.ts         ← Auth + maintenance mode ← MAINTENANCE flag lives here
```

---

## 7. Environment Variables

| Variable | What it's for | Who has it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Database URL | Everyone |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public DB key | Everyone |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin DB access | Ishaan only |
| `STRIPE_SECRET_KEY` | Payments | Ishaan only |
| `RESEND_API_KEY` | Email | Ishaan only |
| `ANTHROPIC_API_KEY` | AI agents | Ishaan only |
| `AGENT_SECRET` | Agent auth | Ishaan only |

For collaborators working on **frontend/design only**: you need `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Ask Ishaan for those two.

For collaborators working on **backend/API**: ask Ishaan for the full `.env.local`.

---

## 8. Maintenance Mode

The live site (melaa.ca) shows a "Coming Soon" page while we're building. **This never affects localhost** — you always see the real site locally.

To toggle:
```ts
// src/middleware.ts — line 6
const MAINTENANCE = true   // ← public site blocked
const MAINTENANCE = false  // ← public site live
```

Only Ishaan changes this. Don't touch it on your branch.

---

## 9. Deploying

Vercel auto-deploys when anything is pushed to `main`. There's no manual deploy step.

- Push to `main` → Vercel builds → melaa.ca updates in ~60 seconds
- Push to any other branch → Vercel creates a **preview URL** automatically
  - Find it at: vercel.com/dashboard → your project → Deployments

Use preview URLs to share your work before merging!

---

*Questions? Message Ishaan on Slack or WhatsApp.*
