# ClientFlow — Client Project Management Portal

A full-stack SaaS web application that lets agencies and freelancers manage client projects, communicate in real time, handle billing, and share files — all from a single portal with separate **Admin** and **Client** roles.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Application Architecture](#application-architecture)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Deployment](#deployment)

---

## Features

### Client Role
- Sign up, log in, forgot/reset password with email verification
- Personal dashboard with live stats (active projects, completed, plan, unread alerts)
- Create and track projects with title, budget, deadline, and status
- Real-time chat per project (powered by Pusher)
- Upload and download project files (Supabase Storage)
- Subscription management and billing via Stripe
- Notification centre (project updates, messages, payments, file uploads)
- Account settings (profile, password, notification preferences, danger zone)

### Admin Role
- Admin panel with a full list of all clients
- Change any client's account status (activate / deactivate)
- View all projects across all clients
- Add admin notes to individual projects
- Manage project status (Pending → In Progress → Completed)

### Platform
- JWT-based authentication with NextAuth v5
- Cursor-reactive animated auth page (shiny floating dots)
- Page-level entrance animations (fade-up, slide-left, scale-up, bounce-in, etc.)
- Light/dark mode (beige + black for light; dark grey + white for dark)
- Rate limiting on auth routes via Upstash Redis
- Stripe webhooks for payment confirmation and subscription lifecycle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4, Radix UI primitives |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Database | PostgreSQL (Supabase) |
| Authentication | NextAuth v5 (Auth.js) — JWT + Credentials |
| Password hashing | `bcryptjs` |
| Real-time | Pusher |
| File storage | Supabase Storage |
| Email | Resend |
| Payments | Stripe (Checkout, Webhooks, Subscriptions) |
| Rate limiting | Upstash Redis |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Animation | Custom CSS keyframes + IntersectionObserver |

---

## Application Architecture

```
Browser
  │
  ├── Next.js Middleware (middleware.ts)
  │     └── JWT check via next-auth/jwt
  │           ├── /dashboard/* → must be logged in
  │           └── /admin/*     → must be ADMIN role
  │
  ├── App Router Pages (src/app/)
  │     ├── Server Components  → fetch data directly via Prisma, pass to UI
  │     └── Client Components  → React state, forms, real-time updates
  │
  ├── API Route Handlers (src/app/api/)
  │     └── HTTP layer: GET / POST / PATCH / DELETE with JSON responses
  │
  ├── Shared Library (src/lib/)
  │     ├── prisma.ts   → singleton Prisma client (pg Pool adapter)
  │     ├── auth.ts     → NextAuth config + getCurrentUser() helper
  │     ├── tokens.ts   → email verification & password-reset token helpers
  │     ├── email.ts    → Resend email senders
  │     ├── pusher.ts   → Pusher server client
  │     └── plans.ts    → Stripe plan definitions
  │
  └── Prisma Schema (prisma/schema.prisma)
        └── PostgreSQL database (Supabase)
```

### Data flow (typical page render)
1. User hits `/dashboard` → **middleware** checks JWT token
2. Next.js renders the **Server Component** (`page.tsx`)
3. Server component calls `getCurrentUser()` → reads session from JWT
4. Server component calls Prisma directly to fetch data
5. Data is passed as props to child **Client Components**
6. Client components handle interactivity, forms, real-time events

---

## Database Schema

| Model | Description |
|---|---|
| `User` | Accounts with roles (CLIENT / ADMIN), hashed password, avatar |
| `Session` | NextAuth sessions |
| `Project` | Client project with title, budget, deadline, status |
| `Conversation` | One per project for the chat thread |
| `Message` | Individual chat messages with optional file attachment |
| `File` | Uploaded files linked to a project and uploader |
| `Notification` | In-app notifications (project updates, messages, payments) |
| `Subscription` | Stripe subscription record per user |
| `Payment` | Stripe payment intent record |
| `TeamMember` | Admin/staff team membership |
| `ActivityLog` | Audit log of all significant actions |
| `VerificationToken` | Email verification tokens |
| `PasswordResetToken` | Password reset tokens |

---

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create a new client account |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handler (login, session, signout) |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/projects` | List projects for the current user |
| POST | `/api/projects` | Create a new project |
| PATCH | `/api/projects/[id]/status` | Update project status (Admin) |
| POST | `/api/projects/[id]/notes` | Add admin note to project |
| GET | `/api/projects/[id]/files` | List files for a project |
| GET | `/api/chat/conversations` | List conversations |
| GET | `/api/chat/conversations/[id]` | Get messages for a conversation |
| POST | `/api/chat/messages` | Send a message |
| POST | `/api/chat/read` | Mark messages as read |
| POST | `/api/files/upload` | Upload a file to Supabase Storage |
| DELETE | `/api/files/[id]` | Delete a file |
| POST | `/api/notifications/read` | Mark a notification as read |
| POST | `/api/notifications/read-all` | Mark all notifications as read |
| PATCH | `/api/settings/profile` | Update profile name / avatar |
| PATCH | `/api/settings/password` | Change password |
| PATCH | `/api/settings/notifications` | Update notification preferences |
| DELETE | `/api/settings/account` | Delete account |
| PATCH | `/api/admin/clients/[id]/status` | Admin: activate/deactivate client |
| POST | `/api/stripe/checkout` | Create Stripe checkout session |
| POST | `/api/stripe/auto-renew` | Toggle subscription auto-renew |
| POST | `/api/webhooks/stripe` | Stripe webhook handler |

---

## Project Structure

```
client-portal/
├── prisma/
│   ├── schema.prisma          # Database models and enums
│   └── migrations/            # Prisma migration history
├── setup/                     # ← Ready-to-run setup files
│   ├── .env.example           # All required environment variables
│   ├── setup.sh               # One-command setup script
│   └── SETUP_GUIDE.md         # Step-by-step manual setup guide
├── src/
│   ├── app/
│   │   ├── api/               # API route handlers (HTTP layer)
│   │   ├── auth/              # Auth pages (login, signup, forgot, reset)
│   │   ├── dashboard/         # Client dashboard pages
│   │   ├── admin/             # Admin panel pages
│   │   ├── globals.css        # Global styles + animation keyframes
│   │   ├── layout.tsx         # Root layout with Providers
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── auth/              # Auth layout, password input, cursor dots
│   │   ├── dashboard/         # Sidebar, stats, projects table, etc.
│   │   ├── files/             # FileUpload, FileList
│   │   ├── notifications/     # NotificationList
│   │   ├── projects/          # NewProjectModal, AdminNotesForm, etc.
│   │   ├── subscription/      # PlanCard, AutoRenewToggle
│   │   ├── ui/                # Radix-based primitives (Button, Input, etc.)
│   │   └── providers.tsx      # SessionProvider wrapper
│   ├── generated/prisma/      # Prisma-generated client & types
│   └── lib/
│       ├── auth.ts            # NextAuth config + getCurrentUser()
│       ├── email.ts           # Resend email helpers
│       ├── plans.ts           # Stripe subscription plans
│       ├── prisma.ts          # Singleton Prisma client
│       ├── pusher.ts          # Pusher server client
│       ├── tokens.ts          # Token generation/verification
│       └── utils.ts           # cn() utility
├── middleware.ts              # Route protection (JWT check)
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Setup & Installation

> **Quick start:** see [`setup/SETUP_GUIDE.md`](./setup/SETUP_GUIDE.md) or run [`setup/setup.sh`](./setup/setup.sh)

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18.17 or later |
| npm | 9 or later |
| Git | any recent version |

### External services you need to create accounts for

| Service | Purpose | Free tier |
|---|---|---|
| [Supabase](https://supabase.com) | PostgreSQL database + file storage | ✅ Yes |
| [Stripe](https://stripe.com) | Payments and subscriptions | ✅ Test mode |
| [Pusher](https://pusher.com) | Real-time messaging | ✅ Yes |
| [Resend](https://resend.com) | Transactional email | ✅ Yes |
| [Upstash](https://upstash.com) | Redis rate limiting | ✅ Yes |

---

## Environment Variables

Copy `setup/.env.example` to `.env` in the project root and fill in all values:

```env
# ── Database ───────────────────────────────────────────
DATABASE_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres?connect_timeout=10&pool_timeout=10

# ── NextAuth ───────────────────────────────────────────
NEXTAUTH_SECRET=        # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# ── Supabase Storage ───────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ── Stripe ─────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ── Pusher ─────────────────────────────────────────────
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=

# ── Resend ─────────────────────────────────────────────
RESEND_API_KEY=re_...

# ── Upstash Redis ──────────────────────────────────────
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Running the App

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For Stripe webhooks in development, run in a separate terminal:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

**Recommended platforms:** Vercel, Railway, Render

> When deploying, make sure to set all environment variables in your platform's dashboard. Change `NEXTAUTH_URL` to your production domain.
