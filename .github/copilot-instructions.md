# Copilot Instructions for CreatorFi

## Quick snapshot
- Stack: **Next.js (app-router) v16**, **TypeScript**, **Prisma (Postgres)**, **Wagmi/RainbowKit** (EVM), **Solana wallet-adapter** (SVM). Uses `pnpm` and Node 20+.
- Purpose: demo app for integrating X402 paywall patterns (page-level `paymentProxy` and API-level `withX402`).

---

## Where to look first (key files)
- `proxy.ts` — primary paywall configuration (exports `proxy`, `paywall`, `server`, and `config.matcher`). Update this to add protected routes.
- `app/api/*/route.ts` — examples of using `withX402` for protected APIs (see `app/api/weather/route.ts`).
- `components/ContentPaywall.tsx` — client-side paywall UI and purchase flow example (EVM/SVM checks, purchase button behavior).
- `lib/x402-client.ts` — client integration adapter for EVM & Solana signers; references env vars `NEXT_PUBLIC_BASE_MERCHANT_ADDRESS` and `NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS`.
- `components/Providers.tsx` — wallet/provider setup (wagmi + RainbowKit for EVM, Solana adapters for SVM) and SSR mounting pattern.
- `app/actions.ts` — server actions (e.g., `verifyPayment`) and cookie naming convention: `x402-access-<contentId>`.
- `prisma/schema.prisma` and `lib/prisma.ts` — DB schema and singleton client pattern used in dev.
- `scripts/seed-test.cjs` / `scripts/seed-test.ts` — test data seeding scripts.
- `scripts/verify-frontend.py` — example Playwright visual checks (not integrated into npm scripts).

---

## Developer workflows / commands
- Install & run locally:
  - `pnpm install` (project expects `pnpm` v10)
  - `pnpm dev` — starts Next.js dev server
  - `pnpm build` — runs `prisma generate` then `next build`
  - `pnpm start` — production start
- Database:
  - Set `DATABASE_URL` (Postgres); Prisma generator runs on `postinstall` and `build`.
  - Seed locally: `node scripts/seed-test.cjs` or run the TypeScript seed via ts-node if preferred.
- Environment: copy `env.example` → `.env` and fill required vars. `proxy.ts` will exit if `FACILITATOR_URL`, `EVM_ADDRESS`, or `SVM_ADDRESS` are missing.

---

## Project-specific conventions & gotchas
- Uses the Next.js app router and server actions (`"use server"`) for sensitive operations (see `app/actions.ts`).
- Cookie naming for purchase grants: `x402-access-<contentId>` (used by demo `verifyPayment`). Tests and unlock checks rely on this exact format.
- Provider mount guard: `components/Providers.tsx` prevents SSR access to window/indexedDB by rendering only after `useEffect` mount. Follow this pattern for any wallet integration.
- Prisma singleton: `lib/prisma.ts` sets a global to avoid multiple `PrismaClient` instances during hot-reload in dev.
- Paywall patterns:
  - Use `paymentProxy` (in `proxy.ts`) to protect page routes and bulk path matchers (exports `config.matcher`).
  - Use `withX402` to wrap individual API handlers (settlement occurs after successful responses).
- The project includes a mock X402 client in `lib/x402-client.ts` which returns `{success: true}`; replace with real client calls when integrating with production X402 services.

---

## Useful examples to reference in code
- Add a protected API: copy `app/api/weather/route.ts` and apply `withX402(handler, resource, server, undefined, paywall)`.
- Add a protected page route: extend `proxy.ts` accepts map and update `config.matcher` to include new paths.
- Validate unlock check: client uses wallet connection checks (`useAccount` / `useWallet`); `ContentPaywall.tsx` demonstrates user flow and alerts when wallets are not connected.

---

## Testing & CI notes
- No built-in CI Playwright jobs — `scripts/verify-fronted.py` demonstrates a headless visual smoke test; consider adding it as a workflow job if you want automated E2E checks.
- Linting & formatting: `pnpm lint` (eslint) and `pnpm format` (prettier) are available — follow these for code consistency.

---

## Short tasks an AI agent can do immediately
- Add a new protected route (update `proxy.ts` + matcher entry). Example lines to modify are obvious in `proxy.ts`.
- Convert the mock `lib/x402-client.ts` to call a real SDK by following the TODOs/comments already in that file.
- Add automated Playwright job: use `scripts/verify-frontend.py` as the test command and add a GitHub Actions workflow to launch Playwright.

---

If any of this is unclear or there are project practices missing from the doc (e.g., preferred CI, release process, or where secrets are stored), tell me which area to expand and I’ll iterate. ✅
