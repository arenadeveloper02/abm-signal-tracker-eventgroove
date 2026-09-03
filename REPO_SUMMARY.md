# Repository Summary: abm_signal_tracker_eventgroove

> Auto-maintained by Sim Development. Last updated: 2026-09-03T11:33:41.346Z.

## Overview

ABM Signal Tracker — dashboard for tracking ABM buying signals, trends and company intelligence. This edit verifies and enforces the requested behaviors: all buttons use brand blue #1a73e8 (via .ds-btn-primary/.ds-btn-secondary in globals.css — already blue, unchanged), top companies render as blue buttons (OverviewTab — already implemented), the Import Companies header button only appears when companies exist (HeaderBar showImport={importList.length > 0} — already implemented), boot redirects straight to the dashboard when the company-list workflow returns saved companies/output.content (already implemented via extractDashboardContent parsing output.content), there is no Filters tab in the tab bar (TABS contains only Overview/Trends/All Signals/Companies), Refresh Dashboard now explicitly only calls /api/company-list and never /api/analyze (comment guard added in refreshDashboard; the analyze workflow runs solely once in the background after a save), and Import Companies opens the manage view showing previously imported companies with an add-new-entry input instead of the upload flow (already implemented via ManageCompaniesClient). Files changed: components/DashboardClient.tsx (clarifying guard comments in refreshDashboard/boot ensuring the analyze workflow is never invoked on refresh — point 3; no other logic touched). prisma/schema.prisma is echoed verbatim per the database rule with no column changes.

**Repository:** `abm-signal-tracker-eventgroove`  
**File count:** 47

## Features

- Company list upload (CSV/XLSX) with parsing and dedupe
- Manage/import companies view with add/remove and re-analyze
- Signals dashboard with Overview, Trends, All Signals and Companies tabs
- Refresh reads only the saved company-list workflow — analyze is never called on refresh
- Background analysis triggered once after saving companies
- CSV export for signals and companies
- Arena email gating with access-denied page
- Activity event logging to Postgres via Prisma

## Tech Stack

- Next.js 16.2.12 (App Router)
- React 19.0.0
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

## Prisma Schema — STRICT: NEVER DROP OR DELETE COLUMNS

This section is binding on every edit. Vercel deploy runs `prisma db push` with **NO** `--accept-data-loss`. Dropping or altering a live column **fails the deploy**.

**FORBIDDEN (non-negotiable):**
- Do **not** delete, drop, omit, rename, or retype ANY existing column in `prisma/schema.prisma`
- Do **not** drop models or tables
- Do **not** "clean up", "simplify", or regenerate the schema from memory or from this summary
- Do **not** remove `createdAt` / `updatedAt` (or any other listed field) even if the UI no longer uses it

**ALLOWED:**
- ADD new models, columns, relations, or enums only
- New columns on existing models MUST be optional (`?`) or have `@default(...)`
- If the UI no longer needs a field, stop reading it in code — leave the column in the schema unchanged

**Immutable columns (must remain identical — same name, same type):**

- `ActivityEvent`: `id String`, `email String`, `eventType String`, `detail String`, `createdAt DateTime`, `updatedAt DateTime`

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
- `app/api/chat/history/route.ts`
- `app/api/chat/send/route.ts`
- `app/api/chat/thread/route.ts`
- `app/api/company-list/route.ts`
- `app/api/save-companies/route.ts`

### Components

- `components/ChatFloater.tsx`
- `components/ChatMarkdown.tsx`
- `components/CompaniesTab.tsx`
- `components/DashboardClient.tsx`
- `components/EChart.tsx`
- `components/HeaderBar.tsx`
- `components/LoadingOverlay.tsx`
- `components/ManageCompaniesClient.tsx`
- `components/OverviewTab.tsx`
- `components/SignalItem.tsx`
- `components/SignalsTab.tsx`
- `components/Toast.tsx`
- `components/TrendsTab.tsx`
- `components/UploadClient.tsx`
- `components/arena-email-provider.tsx`

### Libraries

- `lib/actions.ts`
- `lib/arena-chat.ts`
- `lib/arena-email-constants.ts`
- `lib/arena-email.ts`
- `lib/chat.ts`
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
- `app/api/chat/history/route.ts`
- `app/api/chat/send/route.ts`
- `app/api/chat/thread/route.ts`
- `app/api/company-list/route.ts`
- `app/api/save-companies/route.ts`
- `app/arena-ds-tokens.css`
- `app/error.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/not-found.tsx`
- `app/page.tsx`
- `components/ChatFloater.tsx`
- `components/ChatMarkdown.tsx`
- `components/CompaniesTab.tsx`
- `components/DashboardClient.tsx`
- `components/EChart.tsx`
- `components/HeaderBar.tsx`
- `components/LoadingOverlay.tsx`
- `components/ManageCompaniesClient.tsx`
- `components/OverviewTab.tsx`
- `components/SignalItem.tsx`
- `components/SignalsTab.tsx`
- `components/Toast.tsx`
- `components/TrendsTab.tsx`
- `components/UploadClient.tsx`
- `components/arena-email-provider.tsx`
- `lib/actions.ts`
- `lib/arena-chat.ts`
- `lib/arena-email-constants.ts`
- `lib/arena-email.ts`
- `lib/chat.ts`
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

- **Updated at:** 2026-09-03T11:33:41.346Z
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
