# Repository Summary: abm_signal_tracker_eventgroove

> Auto-maintained by Sim Development. Last updated: 2026-08-20T16:57:29.811Z.

## Overview

ABM Signal Tracker — edit applied: (0) all buttons now use brand blue #1A73E8 (app/globals.css .ds-btn-secondary changed to blue background/white text); (1) Import Companies button in HeaderBar stays hidden when no companies exist (now also checks savedCompanies); boot() already redirects to dashboard and parses output.content — unchanged; (2) removed the active-filters chip bar from DashboardClient (removeFilter/activeFilterEntries/useMemo removed); (3) boot() no longer auto-calls the analyze workflow on page refresh — analysis only runs on explicit user actions (Refresh button or after saving companies); (4) Import Companies modal now shows the previously imported company list with add/remove rows via new components/ManageCompaniesClient.tsx instead of the upload dropzone. prisma/schema.prisma returned per database rule (ActivityEvent model matching lib/actions.ts, additive only). Files changed: app/globals.css (ds-btn-secondary block), components/DashboardClient.tsx (savedCompanies state, boot/runAnalysis, chips removed), components/HeaderBar.tsx (savedCompanies prop, modal swapped to ManageCompaniesClient), components/ManageCompaniesClient.tsx (new), prisma/schema.prisma + lib/actions.ts + lib/types.ts (echoed).

**Repository:** `abm-signal-tracker-eventgroove`  
**File count:** 38

## Features

- Company list upload (CSV/XLSX) with auto column detection
- ABM signal analysis dashboard with Overview, Trends, Signals and Companies tabs
- ECharts visualizations for severity, type, industry and weekly trends
- CSV export for signals and companies
- Manage previously imported companies with add/remove and re-analysis
- Arena email gating with activity event tracking

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
- `components/ManageCompaniesClient.tsx`
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
- `components/ManageCompaniesClient.tsx`
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

- **Updated at:** 2026-08-20T16:57:29.811Z
- **Request:** Implement the following functionality in the codebase. Do not modify, refactor, remove, or "clean up" any other part of the code beyond what is explicitly listed below. Preserve existing formatting, naming conventions, comments, and logic in all unrelated sections.
Changes to implement:

0) Make all the Buttons blue #1a73e8

1) The analysis company should look like a button … 
And at the top, import companies should not appear if there are no companies … 
If the companies are already present, then it should redirect to the Dashboard page … the data will be present in the API of the fetch in this API 'https://agent.thearena.ai/api/workflows/0e7886e4-020e-418a-898d-997689d70488/execute'

In output. content in the response, parse it, then use the resposne 
2) Remove the Filters tab 
3) On every refresh, the API is calling for https://agent.thearena.ai/api/workflows/99cc0f44-94a2-4e42-8aa5-31656739d857/execute
This should not happen 

4) When import Companies is clicked, then the dashboard should go, and the older data companies imported data should show up ,,, there should be an option to add new data.. not the upload option 

Constraints:

* Only touch the files/functions directly related to the points above.
* Do not change variable names, code style, or structure outside the scope of these changes.
* Do not add extra features, optimizations, or refactors that weren't requested.
* If a change requires touching a shared/common file, make the minimal edit needed and leave everything else untouched.
* After implementing, list exactly which files and lines were changed, and why.
