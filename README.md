# ABM Signal Tracker

API-driven ABM Signal Tracker dashboard with a tabbed interface (Overview, Trends, All Signals, Companies), React ECharts visualizations, company list upload (CSV/XLSX) and an analysis workflow orchestrated against external workflow APIs.

## Features

- Top header with title, last-updated timestamp, relative update indicator, Refresh Dashboard, Filters and company search
- Initial flow: fetch saved company list -> run analysis -> re-fetch and `JSON.parse(row.data.output.content)` -> render dashboard
- Upload flow with drag-and-drop, CSV/XLSX parsing, preview table, row removal and `companyDetails[]` save
- Overview: metric cards, scrollable Signal Feed, weekly stacked bar, signal type donut and top industries bar with click-to-filter
- Trends: 8-week stacked trend, signals by category and top 10 companies charts
- All Signals: severity/type filters, severity mix donut, at-a-glance stats, detailed signal cards and filtered CSV export
- Companies: searchable, sortable table with expandable rows (signal history, tech stack, keywords) and CSV export
- Arena email gate via middleware, cookie persistence and access-denied page

## Tech stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v3, ECharts (echarts-for-react), xlsx, Prisma + Neon Postgres.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env` and set `DATABASE_URL`, `COMPANY_LIST_API_URL`, `SAVE_COMPANIES_API_URL`, `ANALYSIS_API_URL` (and optional `ARENA_API_KEY`).
3. `npm run dev` and open `http://localhost:3000/?emailId=you@example.com`

## Build & deploy

`npm run build` runs `prisma generate && prisma db push && next build`. On Vercel, connect a Neon database so `DATABASE_URL` is injected, and configure the workflow API URLs as environment variables.
