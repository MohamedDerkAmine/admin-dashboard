# Stripe Email Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a demo Stripe Checkout, Stripe webhook, React Email template, and optional Mailgun sender to the admin dashboard.

**Architecture:** Keep third-party integrations behind server-only modules in `lib/integrations`. Expose demo behavior through App Router route handlers under `app/api`, and add a small admin UI entry point that calls those routes without changing the existing mock order model.

**Tech Stack:** Next.js 16 route handlers, Stripe Checkout Sessions, Stripe webhook signature verification, React Email render/components, optional Mailgun HTTP API.

---

### Task 1: Dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Install `stripe`, `@react-email/components`, and `@react-email/render`.
- [ ] Keep Mailgun dependency-free by using `fetch`, `FormData`, and HTTP Basic auth.

### Task 2: Server Integration Modules

**Files:**
- Create: `lib/integrations/env.ts`
- Create: `lib/integrations/stripe.ts`
- Create: `lib/integrations/mailgun.ts`
- Create: `emails/order-payment-receipt.tsx`

- [ ] Add env helpers for `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`, `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, and `MAILGUN_FROM_EMAIL`.
- [ ] Create a Stripe client only when `STRIPE_SECRET_KEY` exists.
- [ ] Render the payment receipt email with React Email.
- [ ] Send through Mailgun only when all Mailgun env vars exist; otherwise return a skipped demo result.

### Task 3: Route Handlers

**Files:**
- Create: `app/api/stripe/checkout/route.ts`
- Create: `app/api/stripe/webhook/route.ts`
- Create: `app/api/email/demo/route.ts`
- Modify: `lib/middleware.ts`

- [ ] `POST /api/stripe/checkout` creates a Stripe Checkout Session for a demo order and returns `{ url }`.
- [ ] `POST /api/stripe/webhook` reads raw body text, verifies `stripe-signature`, and handles `checkout.session.completed`.
- [ ] `POST /api/email/demo` renders and attempts/skips a Mailgun demo email.
- [ ] Allow `/api/stripe` and `/api/email` through auth middleware.

### Task 4: Admin Demo Surface

**Files:**
- Create: `components/admin/sections/integrations-demo.tsx`
- Modify: `components/admin/sections/orders-section.tsx`

- [ ] Add a compact integrations demo panel above the orders table.
- [ ] Include buttons for starting demo checkout and sending demo email.
- [ ] Show clear inline status for missing Stripe/Mailgun configuration.

### Task 5: Verification

**Commands:**
- `npm run build`
- `Invoke-WebRequest http://localhost:3000/api/email/demo -Method POST ...`
- `Invoke-WebRequest http://localhost:3000/api/stripe/checkout -Method POST ...`

- [ ] Build must pass.
- [ ] Missing env vars must produce JSON responses, not overlays.
- [ ] Commit and push to the current PR branch.
