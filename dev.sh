#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# Melaa — Local Dev Launcher
# Run this once to start the dev server: ./dev.sh
# ─────────────────────────────────────────────────────────────────

set -e
cd "$(dirname "$0")"

# Check .env.local exists
if [ ! -f .env.local ]; then
  echo ""
  echo "  ❌  .env.local not found!"
  echo "  📋  Copy the template and fill in your keys:"
  echo "      cp .env.example .env.local"
  echo ""
  exit 1
fi

# Install dependencies if node_modules is missing
if [ ! -d node_modules ]; then
  echo "📦  Installing dependencies..."
  npm install
fi

echo ""
echo "  ███╗   ███╗███████╗██╗      █████╗  █████╗ "
echo "  ████╗ ████║██╔════╝██║     ██╔══██╗██╔══██╗"
echo "  ██╔████╔██║█████╗  ██║     ███████║███████║"
echo "  ██║╚██╔╝██║██╔══╝  ██║     ██╔══██║██╔══██║"
echo "  ██║ ╚═╝ ██║███████╗███████╗██║  ██║██║  ██║"
echo "  ╚═╝     ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝"
echo ""
echo "  🚀  Starting local dev server..."
echo "  🌐  Open: http://localhost:3000"
echo "  🔒  Maintenance mode is ON for melaa.ca (live site)"
echo "      Localhost always bypasses maintenance — you see the real site."
echo ""
echo "  Press Ctrl+C to stop."
echo ""

npm run dev
