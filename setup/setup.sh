#!/usr/bin/env bash
# =============================================================
#  ClientFlow — Automated Setup Script
#  Run this from the project ROOT directory:
#    bash setup/setup.sh
# =============================================================

set -e  # exit immediately on any error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}   ClientFlow — Project Setup${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# ── Step 1: Check Node.js ────────────────────────────────────
echo -e "${YELLOW}[1/6] Checking Node.js version...${NC}"
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌  Node.js 18 or later is required. Download from https://nodejs.org${NC}"
  exit 1
fi
echo -e "${GREEN}✅  Node.js $(node -v) detected${NC}"

# ── Step 2: Copy .env ────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/6] Setting up environment variables...${NC}"
if [ -f ".env" ]; then
  echo -e "${YELLOW}⚠️   .env already exists — skipping copy.${NC}"
  echo     "     Edit it manually to update values."
else
  cp setup/.env.example .env
  echo -e "${GREEN}✅  .env created from setup/.env.example${NC}"
  echo -e "${RED}⚠️   IMPORTANT: Open .env and fill in all values before continuing!${NC}"
  echo ""
  read -p "    Press ENTER once you have filled in .env to continue..."
fi

# ── Step 3: Install dependencies ────────────────────────────
echo ""
echo -e "${YELLOW}[3/6] Installing npm dependencies...${NC}"
npm install
echo -e "${GREEN}✅  Dependencies installed${NC}"

# ── Step 4: Generate Prisma client ──────────────────────────
echo ""
echo -e "${YELLOW}[4/6] Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}✅  Prisma client generated${NC}"

# ── Step 5: Run database migrations ─────────────────────────
echo ""
echo -e "${YELLOW}[5/6] Running database migrations...${NC}"
echo     "      Make sure DATABASE_URL in .env points to your Supabase database."
npx prisma migrate deploy
echo -e "${GREEN}✅  Database migrations applied${NC}"

# ── Step 6: Done ─────────────────────────────────────────────
echo ""
echo -e "${BLUE}=================================================${NC}"
echo -e "${GREEN}🎉  Setup complete!${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""
echo "  Start the development server:"
echo -e "  ${YELLOW}npm run dev${NC}"
echo ""
echo "  For Stripe webhooks (in a separate terminal):"
echo -e "  ${YELLOW}stripe listen --forward-to localhost:3000/api/webhooks/stripe${NC}"
echo ""
echo "  Open the app at: http://localhost:3000"
echo ""
