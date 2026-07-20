# Shalah Rex Laundry

Mobile-first PWA laundry ordering platform for Shalah Rex Laundry (Enugu, Nigeria) — an e-commerce-style flow where
customers shop for laundry services by category, choose a service tier per item, and track orders through a live
status timeline.

## Stack

React 19 + TypeScript + Vite, Tailwind CSS v4, Radix UI primitives, React Router, Zustand (client state), TanStack
Query (server state), Supabase (auth/db/storage, optional), Paystack (optional), `vite-plugin-pwa`.

## Getting started

```bash
npm install
npm run dev
```

The app runs entirely on local mock data (seeded in `src/lib/data/mock/seed.ts`, persisted to `localStorage`) until
Supabase credentials are added — see [`supabase/README.md`](supabase/README.md). Seeded demo accounts:

- `demo@shalahrexlaundry.com` — customer
- `admin@shalahrexlaundry.com` — admin
- password for both: `password123`

Paystack checkout falls back to a "Simulate Payment Success" button when `VITE_PAYSTACK_PUBLIC_KEY` isn't set, so
the full order flow is click-through testable without live keys.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production (also generates the PWA service worker)
- `npm run preview` — serve the production build locally
- `npm run lint` — run oxlint

## Project structure

```text
src/
├── assets/         # Static images, brand assets
├── components/     # Reusable UI (ui/ primitives, navigation/, auth/, brand/, dev/)
├── features/       # Feature modules (catalog, cart, order, tracking, dashboard, admin, tickets)
├── hooks/          # Custom hooks (useAuth, useToast, useMediaQuery)
├── layouts/        # AppLayout, AdminLayout, AuthLayout
├── lib/            # Supabase client, data layer (mock + real, same interface), React Query hooks/keys
├── pages/          # Route components, mirroring the route tree in src/routes/paths.ts
├── store/          # Zustand stores (cart, checkout wizard)
└── types/          # Database + domain TypeScript types

supabase/
├── schema.sql      # Full schema, RLS policies, and seed data — not executed automatically
└── README.md       # How to connect a real Supabase project
```

See `.env.example` for the environment variables that switch the data layer from mock to live Supabase/Paystack.
