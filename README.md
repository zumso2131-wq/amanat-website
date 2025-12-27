# AMANAT System

Production-ready Islamic Installment System.

## Features
- **Public:** Calculator, Info.
- **Admin CRM:** Clients, Deals, Payments, PDF, Reports.
- **Client Cabinet:** View deals.
- **Tech:** Next.js 14+, Prisma, Postgres, Tailwind.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment:**
   Copy `.env.example` to `.env` and set `DATABASE_URL`.

3. **Database:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed Admin:**
   ```bash
   npx ts-node prisma/seed.ts
   ```
   Admin Credentials:
   - Phone: `+77000000000`
   - Password: `admin123`

5. **Run:**
   ```bash
   npm run dev
   ```

## Development
- `lib/amanat-logic.ts`: Core calculation logic.
- `app/actions`: Server Actions.
- `prisma/schema.prisma`: Database Schema.
