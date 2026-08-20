# Repository Summary: abm_signal_tracker_eventgroove

> Auto-maintained by Sim Development. Last updated: 2026-08-20T16:46:51.962Z.

## Overview

ABM Signal Tracker — dashboard for tracking ABM buying signals, trends and company intelligence with company list upload and Arena workflow analysis.

**Repository:** `abm-signal-tracker-eventgroove`  
**File count:** 37

## Features

- Company list upload (CSV/XLSX) with automatic column combination
- Automatic redirect to dashboard when companies already exist (parses output.content from the company-list API)
- Blue primary CTAs across the app (Import Companies, Analyze Companies, Refresh Dashboard, Export CSV)
- Import Companies hidden when no companies are tracked yet
- Overview, Trends, All Signals and Companies tabs with ECharts visualizations
- Filter chips via chart interactions (Filters panel removed)

## Tech Stack

- Next.js ^15.3.3 (App Router)
- React ^19.0.0
- Tailwind CSS v3
- TypeScript
- Prisma + PostgreSQL (Neon on Vercel)

## Infrastructure

- **DATABASE_URL:** set on Vercel when Neon is connected — do not commit real credentials

## Routes & Pages

- `/` — `app/page.tsx`
- `/access-denied` — `app/access-denied/page.tsx`

## Database Models

- `ActivityEvent`

## File Inventory

### App pages

- `app/access-denied/page.tsx`
- `app/arena-ds-tokens.css`
- `app/error.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/not-found.tsx`
- `app/page.tsx`

### API routes

- `app/api/analyze/route.ts`
- `app/api/company-list/route.ts`
- `app/api/save-companies/route.ts`

### Components

- `components/CompaniesTab.tsx`
- `components/DashboardClient.tsx`
- `components/EChart.tsx`
- `components/HeaderBar.tsx`
- `components/OverviewTab.tsx`
- `components/SignalItem.tsx`
- `components/SignalsTab.tsx`
- `components/TrendsTab.tsx`
- `components/UploadClient.tsx`
- `components/arena-email-provider.tsx`

### Libraries

- `lib/actions.ts`
- `lib/arena-email-constants.ts`
- `lib/arena-email.ts`
- `lib/prisma.ts`
- `lib/types.ts`
- `lib/utils.ts`
- `prisma/schema.prisma`

### Config

- `.env.example`
- `middleware.ts`
- `next-env.d.ts`
- `next.config.ts`
- `package.json`
- `postcss.config.mjs`
- `tailwind.config.ts`
- `tsconfig.json`

### Other

- `README.md`
- `REPO_SUMMARY.md`

## Complete File Index

- `.env.example`
- `README.md`
- `REPO_SUMMARY.md`
- `app/access-denied/page.tsx`
- `app/api/analyze/route.ts`
- `app/api/company-list/route.ts`
- `app/api/save-companies/route.ts`
- `app/arena-ds-tokens.css`
- `app/error.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/not-found.tsx`
- `app/page.tsx`
- `components/CompaniesTab.tsx`
- `components/DashboardClient.tsx`
- `components/EChart.tsx`
- `components/HeaderBar.tsx`
- `components/OverviewTab.tsx`
- `components/SignalItem.tsx`
- `components/SignalsTab.tsx`
- `components/TrendsTab.tsx`
- `components/UploadClient.tsx`
- `components/arena-email-provider.tsx`
- `lib/actions.ts`
- `lib/arena-email-constants.ts`
- `lib/arena-email.ts`
- `lib/prisma.ts`
- `lib/types.ts`
- `lib/utils.ts`
- `middleware.ts`
- `next-env.d.ts`
- `next.config.ts`
- `package.json`
- `postcss.config.mjs`
- `prisma/schema.prisma`
- `tailwind.config.ts`
- `tsconfig.json`

## Latest Change

- **Updated at:** 2026-08-20T16:46:51.962Z
- **Request:** Implement the following functionality in the codebase. Do not modify, refactor, remove, or "clean up" any other part of the code beyond what is explicitly listed below. Preserve existing formatting, naming conventions, comments, and logic in all unrelated sections.
Changes to implement:

0) make all the CTA blue 

1)Analysis company Should look like a button … 
And at the top import companies should not appear if there are no companies … 
If the companies are already present these then it should redirect to Dashboard page … the data is will be present in the API of the fetch in this API 'https://agent.thearena.ai/api/workflows/0e7886e4-020e-418a-898d-997689d70488/execute'

In output.content in the response parse it then use the resposne 


2) remove the Filters tab 

Constraints:

* Only touch the files/functions directly related to the points above.
* Do not change variable names, code style, or structure outside the scope of these changes.
* Do not add extra features, optimizations, or refactors that weren't requested.
* If a change requires touching a shared/common file, make the minimal edit needed and leave everything else untouched.
* After implementing, list exactly which files and lines were changed, and why.
