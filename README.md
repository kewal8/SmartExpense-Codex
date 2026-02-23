# SmartExpense

SmartExpense is a Next.js 14 full-stack personal expense manager with Prisma + Neon/PostgreSQL, NextAuth, Tailwind, and PWA support.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env:

```bash
cp .env.example .env.local
```

3. Fill `.env.local` values:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

4. Run Prisma:

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

5. Start dev server:

```bash
npm run dev
```

## Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma + PostgreSQL (Neon)
- NextAuth.js (Google + Credentials)
- Tailwind CSS
- React Query
- next-pwa
# SmartExpense-Codex
