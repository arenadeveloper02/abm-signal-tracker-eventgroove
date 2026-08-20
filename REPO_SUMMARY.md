# Repository Summary: abm_signal_tracker_eventgroove

> Auto-maintained by Sim Development. Last updated: 2026-08-20T16:29:29.914Z.

## Overview

ABM Signal Tracker — Import Companies flow now extracts the saved row id from the save-companies response, forwards it through onSaved to the analysis workflow (/api/analyze now accepts and forwards the id), shows an analyzing state on the Analyze Companies button, and disables row edits while submitting.

**Repository:** `abm-signal-tracker-eventgroove`  
**File count:** 37

## Features

- Import Companies empty-state panel with drag-and-drop CSV/XLSX upload
- Client-side parse preview table with per-row Remove before submit
- Analyze Companies submits edited rows, then triggers analysis with the returned row id
- Dashboard with Overview, Trends, All Signals and Companies tabs
- Global filters, company search, CSV exports and ECharts visualizations
- Header Import Companies action to replace the tracked list at any time

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

- **Updated at:** 2026-08-20T16:29:29.914Z
- **Request:** Implement the following functionality in the codebase. Do not modify, refactor, remove, or "clean up" any other part of the code beyond what is explicitly listed below. Preserve existing formatting, naming conventions, comments, and logic in all unrelated sections.
Changes to implement:



1) Here's the prompt addition for this Import Companies flow:

Prompt: Import Companies Screen

When no companies are currently tracked (empty state), show an "Import Companies" view instead of the dashboard:

Header (when in import/empty state):

Replace the normal header's date/refresh info with the app title and a "No analysis loaded yet" subtitle.
Show an "Import Companies" button in the header (opens/focuses this import view) alongside "Refresh Dashboard" (disabled/greyed out while no data exists), "Filters," and the search box.

Import Companies panel:

Title: "Import Companies."
If zero companies are configured, show a message: "No companies are currently configured. Upload a company list (CSV or XLSX) to start tracking ABM signals. Columns such as Company Name, City, State, and Country will be combined automatically."
If companies already exist and the user reopens this panel to replace them, show the same panel but with the message adjusted to: "Upload a new company list (CSV or XLSX) to replace the tracked companies..." and include a "Close" button in the header to dismiss the panel without importing.
A drag-and-drop upload zone (dashed border) with the text "Drag and drop your company file here," "Supported formats: CSV, XLSX," and an "Upload Companies" button/label for click-to-browse.

After a file is uploaded (parsed but not yet submitted):

Parse the file client-side and display a preview section below the upload zone:
A summary line: "[N] companies ready to import · [filename]" on the left, and an "Analyze Companies" button on the right.
A table listing every parsed row with columns: #, Company Row (the combined string, e.g. "City Men Cook/Taste of South,Dallas,TX,US"), and Remove (a button per row to drop that company from the import list before submitting).
The row string is built by joining the relevant columns (Company Name, City, State, Country) from the file with commas, matching the format the backend expects.
Removing a row updates the count in the summary line and removes it from the list that will be submitted.

On clicking "Analyze Companies":

Take the current (possibly edited) list of company row strings and submit them to the upload/insert API (companyDetails field) along with the user's email.
On success, trigger the analysis workflow using the returned row id, wait for completion, then fetch the final analyzed data and transition from the Import Companies view to the main dashboard view.
Show a loading/processing state on the "Analyze Companies" button (and disable further edits) while the import → analysis → fetch chain runs.

Behavior notes:

The import panel is the default view whenever the companies list is empty; once companies exist and analysis has run, the app opens directly to the dashboard, and "Import Companies" becomes an optional action in the header to re-import/replace the list.
No companies should be submitted for analysis without the user explicitly clicking "Analyze Companies."

API  : 

curl --location 'https://agent.thearena.ai/api/workflows/260c7841-b1a9-4e5d-a63a-bee55904eaac/execute' \
--header 'X-API-Key: sk-sim-XIrT-6iI4EYx5gI_FRRu_lGomlXF-qra' \
--header 'Content-Type: application/json' \
--data-raw '{"companyDetails":["City Men Cook/Taste of South, Dallas, TX,US",
"Stanford University,STANFORD,CA,US",
"Columbia Athletic Association,Columbia,IL,US"],"email":"anush.ms@position2.com","stream":false,"selectedOutputs":["updateTable.success","insertTable.success"]}'


{
    "success": true,
    "executionId": "b8952d59-f452-4cb7-a339-9433d9870236",
    "output": {
        "row": {
            "id": "row_66e8ea0f7eee449399d6e3d07510806e",
            "data": {
                "created_at": "2026-08-20T13:28:33Z",
                "user_email": "anush.ms@position2.com",
                "data": {
                    "totalCompanies": [
                        "City Men Cook/Taste of South, Dallas, TX,US",
                        "Stanford University,STANFORD,CA,US",
                        "Columbia Athletic Association,Columbia,IL,US"
                    ]
                },
                "id": "2026-08-20T13:28:33.816Z"
            },
            "position": 0,
            "createdAt": "2026-08-20T13:28:35.172Z",
            "updatedAt": "2026-08-20T13:30:02.731Z"
        },
        "message": "Row updated successfully"
    },
    "metadata": {
        "duration": 2447.027839999646,
        "startTime": "2026-08-20T13:30:00.371Z",
        "endTime": "2026-08-20T13:30:02.819Z"
    }
}





Constraints:

* Only touch the files/functions directly related to the points above.
* Do not change variable names, code style, or structure outside the scope of these changes.
* Do not add extra features, optimizations, or refactors that weren't requested.
* If a change requires touching a shared/common file, make the minimal edit needed and leave everything else untouched.
* After implementing, list exactly which files and lines were changed, and why.
