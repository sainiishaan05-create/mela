#!/bin/bash

# ─────────────────────────────────────────────
#  Mela — Stripe Live Mode Setup
# ─────────────────────────────────────────────

set -e

MELA_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$MELA_DIR/.env.local"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Mela — Stripe Live Mode Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You need 3 keys from dashboard.stripe.com (in LIVE mode):"
echo "  Developers → API Keys → Secret key       (sk_live_...)"
echo "  Developers → API Keys → Publishable key  (pk_live_...)"
echo "  Developers → Webhooks → Signing secret   (whsec_...)"
echo ""

# ── Prompt for keys ──────────────────────────────────────────────────────────

read -p "Paste your Stripe LIVE Secret key (sk_live_...): " SK
echo ""

if [[ "$SK" != sk_live_* ]]; then
  echo "❌  That doesn't look like a live secret key (must start with sk_live_)"
  echo "    Go to dashboard.stripe.com → switch to Live mode → Developers → API Keys"
  exit 1
fi

read -p "Paste your Stripe LIVE Publishable key (pk_live_...): " PK
echo ""

if [[ "$PK" != pk_live_* ]]; then
  echo "❌  That doesn't look like a live publishable key (must start with pk_live_)"
  exit 1
fi

read -p "Paste your Stripe Webhook Signing Secret (whsec_...): " WH
echo ""

if [[ "$WH" != whsec_* ]]; then
  echo "❌  That doesn't look like a webhook secret (must start with whsec_)"
  echo ""
  echo "To create a webhook endpoint:"
  echo "  1. Go to dashboard.stripe.com (live mode)"
  echo "  2. Developers → Webhooks → Add endpoint"
  echo "  3. URL: https://melaa.ca/api/webhooks/stripe"
  echo "  4. Events: checkout.session.completed, customer.subscription.updated,"
  echo "             customer.subscription.deleted"
  echo "  5. Copy the signing secret and re-run this script"
  exit 1
fi

# ── Update .env.local ─────────────────────────────────────────────────────────

echo "Updating .env.local..."

# Replace or append each key
update_env() {
  local key="$1"
  local val="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    # macOS-compatible sed in-place
    sed -i '' "s|^${key}=.*|${key}=${val}|" "$ENV_FILE"
  else
    echo "${key}=${val}" >> "$ENV_FILE"
  fi
}

update_env "STRIPE_SECRET_KEY" "$SK"
update_env "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "$PK"
update_env "STRIPE_WEBHOOK_SECRET" "$WH"

echo "✅  .env.local updated"

# ── Verify keys hit the Stripe API ───────────────────────────────────────────

echo ""
echo "Verifying keys with Stripe API..."

VERIFY=$(curl -s -u "${SK}:" https://api.stripe.com/v1/products?limit=3)

if echo "$VERIFY" | grep -q '"error"'; then
  ERR=$(echo "$VERIFY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['error']['message'])")
  echo "❌  Stripe rejected the key: $ERR"
  exit 1
fi

PROD_COUNT=$(echo "$VERIFY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))")
echo "✅  Stripe API confirmed — $PROD_COUNT products found in live mode"

# ── Push to Vercel ────────────────────────────────────────────────────────────

echo ""
echo "Checking for Vercel CLI..."

if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel --silent
fi

echo ""
echo "Pushing environment variables to Vercel..."
echo "(You may be prompted to log in to Vercel)"
echo ""

cd "$MELA_DIR"

# Set each env var on Vercel for all environments
vercel env add STRIPE_SECRET_KEY production <<< "$SK" 2>/dev/null || \
  vercel env rm STRIPE_SECRET_KEY production -y 2>/dev/null && \
  printf "%s" "$SK" | vercel env add STRIPE_SECRET_KEY production

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production <<< "$PK" 2>/dev/null || \
  vercel env rm NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production -y 2>/dev/null && \
  printf "%s" "$PK" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production

vercel env add STRIPE_WEBHOOK_SECRET production <<< "$WH" 2>/dev/null || \
  vercel env rm STRIPE_WEBHOOK_SECRET production -y 2>/dev/null && \
  printf "%s" "$WH" | vercel env add STRIPE_WEBHOOK_SECRET production

echo ""
echo "✅  Vercel environment variables updated"

# ── Trigger Vercel redeploy ───────────────────────────────────────────────────

echo ""
read -p "Redeploy melaa.ca now to apply changes? (y/n): " DEPLOY

if [[ "$DEPLOY" == "y" || "$DEPLOY" == "Y" ]]; then
  echo "Deploying to Vercel..."
  vercel --prod --yes
  echo ""
  echo "✅  Deployed! melaa.ca is now running in Stripe LIVE mode"
else
  echo ""
  echo "Skipped deploy. Run this to deploy when ready:"
  echo "  cd ~/Downloads/mela && vercel --prod"
fi

# ── Final check ───────────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Done!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Secret key:      ${SK:0:12}...  ✅"
echo "  Publishable key: ${PK:0:12}...  ✅"
echo "  Webhook secret:  ${WH:0:12}...  ✅"
echo ""
echo "  Checkout URL to test: https://melaa.ca/pricing"
echo ""
echo "  Real cards can now be charged."
echo ""
