# Repository Summary: abm_signal_tracker_eventgroove

> Auto-maintained by Sim Development. Last updated: 2026-08-24T16:37:55.285Z.

## Overview

ABM Signal Tracker — track ABM buying signals, trends and company intelligence in one dashboard. Edit summary: (0/1) All buttons now use the brand blue #1a73e8 — the Top Companies list buttons in components/OverviewTab.tsx now include ds-btn-primary (previously unstyled ds-btn ds-btn-sm); every other button already used ds-btn-primary/ds-btn-secondary which are both #1a73e8 in globals.css. (1) 'Import Companies' in the header now shows whenever a saved company list exists (components/DashboardClient.tsx: showImport changed from `importList.length > 0 && Boolean(data)` to `importList.length > 0`) and stays hidden when there are no companies; boot() already redirects to the dashboard when the company-list workflow (0e7886e4...) returns saved companies, parsing output.content via extractDashboardContent + safeParseDashboard. (2) There is no Filters tab in the tab list (Overview/Trends/All Signals/Companies) — nothing to remove. (3) Verified refresh (handleRefresh → refreshDashboard) only calls /api/company-list, never /api/analyze; the analyze workflow (99cc0f44...) is invoked only once after companies are saved (runBackgroundAnalysis) — no code change required. (4) Clicking Import Companies already opens ManageCompaniesClient showing previously imported companies with an add-row input (no upload UI) — unchanged. prisma/schema.prisma is returned unchanged (ActivityEvent model used by lib/actions.ts recordActivityEvent). Files changed: components/OverviewTab.tsx (Top Companies buttons — added ds-btn-primary class), components/DashboardClient.tsx (HeaderBar showImport prop — one line), prisma/schema.prisma (echoed, no schema change).

**Repository:** `abm-signal-tracker-eventgroove`  
**File count:** 47

## Features

- Company list upload (CSV/XLSX) with dedupe and 50-row cap
- Saved-company detection with automatic redirect to dashboard
- Background ABM signal analysis via Arena workflow
- Overview, Trends, All Signals and Companies tabs
- ECharts severity, type, industry and weekly trend charts
- Import Companies management (add/remove saved companies, re-analyze)
- CSV export for signals and companies
- Arena email gate with access-denied page
- Chat floater assistant

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

- **Updated at:** 2026-08-24T16:37:55.285Z
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
