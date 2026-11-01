# ClientFlow — Step-by-Step Setup Guide

Follow these steps in order to get the app running from scratch on any machine.

---

## Prerequisites

Install the following before you begin:

| Tool | Download |
|---|---|
| **Node.js 18+** | https://nodejs.org |
| **Git** | https://git-scm.com |
| **Stripe CLI** (optional, for webhooks) | https://stripe.com/docs/stripe-cli |

---

## Step 1 — Create External Service Accounts

You need accounts on 5 services. All have free tiers.

### 1a. Supabase (Database + File Storage)
1. Go to [supabase.com](https://supabase.com) → **Start your project**
2. Create a new project (choose any region)
3. Wait for the database to provision (~2 minutes)
4. Go to **Settings → Database → Connection String → URI** — copy this URL
5. Go to **Settings → API** — copy **Project URL**, **anon key**, and **service_role key**
6. Go to **Storage** → create a new bucket called `project-files` and set it to **Public**

### 1b. Stripe (Payments)
1. Go to [stripe.com](https://stripe.com) → create account
2. Stay in **Test mode** (toggle in top-right)
3. Go to **Developers → API Keys** — copy **Publishable key** and **Secret key**
4. Go to **Developers → Webhooks → Add endpoint**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `payment_intent.succeeded`
   - Copy the **Signing secret**

### 1c. Pusher (Real-time Chat)
1. Go to [pusher.com](https://pusher.com) → **Get started free**
2. Create a new **Channels** app
3. Go to **App Keys** — copy **App ID**, **Key**, **Secret**, and **Cluster**

### 1d. Resend (Email)
1. Go to [resend.com](https://resend.com) → sign up
2. Go to **API Keys** → **Create API Key** — copy it
3. (Optional) Add and verify your sending domain under **Domains**

### 1e. Upstash (Redis / Rate Limiting)
1. Go to [upstash.com](https://upstash.com) → sign up
2. Create a new **Redis** database (choose any region)
3. Go to **Details → REST API** — copy **REST URL** and **REST Token**

---

## Step 2 — Clone and Configure

```bash
# Clone the repository (or copy the project folder)
git clone <your-repo-url>
cd client-portal

# Copy the environment template
cp setup/.env.example .env
```

Open `.env` in any text editor and fill in **every value** using the keys you collected in Step 1:

```
DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres?connect_timeout=10&pool_timeout=10
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=us2
RESEND_API_KEY=re_...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

> **Generate NEXTAUTH_SECRET** on macOS/Linux:
> ```bash
> openssl rand -base64 32
> ```

---

## Step 3 — Install Dependencies

```bash
npm install
```

---

## Step 4 — Set Up the Database

```bash
# Generate the Prisma client
npx prisma generate

# Apply all database migrations (creates all tables)
npx prisma migrate deploy
```

> **First time?** If you have no migrations yet, use:
> ```bash
> npx prisma migrate dev --name init
> ```

---

## Step 5 — Start the Development Server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Step 6 — (Optional) Stripe Webhooks in Development

In a **separate terminal**, run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This forwards Stripe events to your local server so payments work end-to-end during development.

---

## Creating Your First Admin Account

The system does not have a seed script. To create an admin:

1. Sign up normally at `/auth/signup` — this creates a CLIENT account
2. Go to your Supabase dashboard → **Table Editor → User**
3. Find your row and change the `role` column from `CLIENT` to `ADMIN`
4. Log out and log back in

---

## Common Issues

| Problem | Fix |
|---|---|
| `Operation has timed out` on login | Your Supabase project may be paused (free tier). Go to your Supabase dashboard and click **Restore project** |
| `Module not found: @prisma/client` | Run `npx prisma generate` |
| `Error: PrismaClientInitializationError` | Check that `DATABASE_URL` in `.env` has no extra spaces or brackets around the password |
| Login hangs for 10+ seconds | Make sure you switched from `bcrypt` to `bcryptjs`. Check `src/lib/auth.ts` |
| `Invalid URL` on Stripe webhook | Make sure `STRIPE_WEBHOOK_SECRET` is set to the `whsec_...` secret from the Stripe dashboard |

---

## Folder Reference

```
setup/
  .env.example      ← Template for all environment variables
  setup.sh          ← Automated one-command setup script
  SETUP_GUIDE.md    ← This file (manual step-by-step guide)
```

---

## Quick Command Reference

```bash
npm run dev                          # Start dev server
npm run build                        # Build for production
npm start                            # Start production server
npx prisma studio                    # Open database GUI in browser
npx prisma migrate dev --name <name> # Create a new migration
npx prisma generate                  # Regenerate Prisma client after schema changes
npx prisma migrate deploy            # Apply migrations in production
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # Dev webhooks
```
