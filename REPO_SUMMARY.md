# Repository Summary: ABM Signal Tracker

> Auto-maintained by Sim Development. Last updated: 2026-08-20T15:46:55.320Z.

## Overview

API-driven ABM Signal Tracker dashboard with tabbed navigation (Overview, Trends, All Signals, Companies), ECharts visualizations, company list upload with CSV/XLSX parsing, analysis workflow orchestration, client-side filtering and CSV exports.

**Repository:** `abm-signal-tracker-eventgroove`  
**File count:** 38

## Features

- Single top header with title, last-updated timestamp, relative update indicator, Refresh Dashboard, Filters and company search
- Tabbed interface: Overview, Trends, All Signals, Companies (no left navigation)
- Initial load flow: company-list API -> analysis API -> re-fetch and JSON.parse of row.data.output.content
- Company upload flow with CSV/XLSX parsing, drag-and-drop, preview table, row removal and companyDetails[] save
- React ECharts stacked bar, donut and horizontal bar charts with click-to-filter interactions
- All Signals tab with severity/type filters, severity mix donut, at-a-glance stats and filtered CSV export
- Companies table with client-side search, expandable rows (signal history, tech stack, keywords) and CSV export
- Global Filters panel (severity, type, industry, company, date range) applied without extra analysis calls
- Refresh Dashboard re-runs analysis while keeping previous data visible
- Arena email gate with middleware, access-denied page and httpOnly-style cookie persistence

## Tech Stack

- Next.js ^15.3.3 (App Router)
- React ^19.0.0
- Tailwind CSS v3
- TypeScript
- Prisma + PostgreSQL (Neon on Vercel)

## Infrastructure

- **Neon project ID:** `purple-silence-63540910` — managed by Sim Development; do not delete or replace
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
- `.gitignore`
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
- `.gitignore`
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

- **Updated at:** 2026-08-20T15:46:55.320Z
- **Request:** Build an **ABM Signal Tracker** application that follows the interaction flow and data presentation shown in the supplied screenshots.

Do not add a left navigation.

Use a **tabbed interface** for the main sections.

Use **React ECharts** for all charts.

Do not include any theme, styling, color, or visual redesign instructions. Focus only on functionality, data flow, button placement, search placement, tabs, tables, charts, filters, and API-driven behavior.

## Main Header

Place a single top header across the application.

Left side:

* Application title: `ABM Signal Tracker`
* Last updated timestamp
* Relative update indicator such as `Updated 21h 40m ago`

Right side:

* `Refresh Dashboard` button
* `Filters` button
* Company search input with placeholder:
  `Search companies...`

The search input should filter companies and signals client-side once dashboard data has loaded.

Do not use a left navigation.

---

# Main Tabs

Below the header, provide these main tabs:

* Overview
* Trends
* All Signals
* Companies

The tabs should switch between the four major dashboard views without reloading the application.

---

# Initial Data Load Flow

On initial application load, first call the company-list API.

Use the provided API endpoint for retrieving the existing saved company list.

Request body:

```json
{
  "email": "<CURRENT_USER_EMAIL>",
  "stream": false,
  "selectedOutputs": [
    "data.rows"
  ]
}
```

The relevant response structure is:

```text
output.rows
```

Each row may contain:

```text
row.data.data.totalCompanies
```

Example:

```json
[
  "City Men Cook/Taste of South, Dallas, TX,US",
  "Stanford University,STANFORD,CA,US",
  "Columbia Athletic Association,Columbia,IL,US"
]
```

Use the first valid row containing:

```text
data.data.totalCompanies
```

as the saved company list.

---

# If Company List Exists

If:

```text
output.rows.length > 0
```

and:

```text
output.rows[n].data.data.totalCompanies
```

contains one or more companies:

Do not show the upload flow.

Immediately proceed to the analysis flow.

Call the analysis API using:

```json
{
  "email": "<CURRENT_USER_EMAIL>",
  "id": "",
  "stream": false,
  "selectedOutputs": [
    "function1.result"
  ],
  "includeThinking": false,
  "includeToolCalls": false
}
```

Wait for a successful analysis response.

The response may simply contain a success message such as:

```json
{
  "response": "Success"
}
```

Treat this as confirmation that analysis has completed.

After successful analysis, call the company-list API again to retrieve the updated row containing the generated dashboard output.

---

# If Company List Is Empty

If:

```text
output.rows
```

is empty, or no row contains a usable:

```text
data.data.totalCompanies
```

show a company upload/import interface instead of the dashboard.

The upload view should contain:

* Heading explaining that no companies are currently configured
* File upload control
* Drag-and-drop area
* `Upload Companies` button
* Preview table of parsed rows
* `Continue` or `Analyze Companies` button after successful parsing

The user must be able to upload a company list file.

Read the file in the browser and convert every valid company row into a string array.

The backend input must eventually look like:

```json
{
  "companyDetails": [
    "City Men Cook/Taste of South, Dallas, TX,US",
    "Stanford University,STANFORD,CA,US",
    "Columbia Athletic Association,Columbia,IL,US"
  ],
  "email": "<CURRENT_USER_EMAIL>",
  "stream": false,
  "selectedOutputs": [
    "updateTable.success",
    "insertTable.success"
  ]
}
```

Do not send the raw file to this workflow.

Parse the file first and send the company rows as:

```text
companyDetails[]
```

Each element should be a complete company row string.

---

# Company Upload Parsing

Support common tabular company-list formats.

At minimum support:

* CSV
* XLSX

Read the uploaded file and identify useful columns such as:

* Company Name
* City
* State
* Country

If the uploaded file contains these as separate columns, combine them into:

```text
Company Name,City,State,Country
```

Example:

```text
Stanford University,STANFORD,CA,US
```

Ignore completely empty rows.

Trim surrounding whitespace.

Show the parsed values in a table before submitting.

Provide a count:

```text
294 companies ready to import
```

Allow the user to remove invalid rows before submission if necessary.

---

# Save Company List

When the user confirms the uploaded companies, call the provided save/update API.

Send:

```json
{
  "companyDetails": "<PARSED_COMPANY_ARRAY>",
  "email": "<CURRENT_USER_EMAIL>",
  "stream": false,
  "selectedOutputs": [
    "updateTable.success",
    "insertTable.success"
  ]
}
```

Treat a successful response or a message such as:

```text
Row updated successfully
```

as completion.

After this succeeds:

1. Call the analysis API.
2. Wait for analysis to complete.
3. Call the company-list API again.
4. Retrieve the generated output.
5. Render the dashboard.

---

# Analysis Flow

After a saved company list exists, call the analysis API.

Request:

```json
{
  "email": "<CURRENT_USER_EMAIL>",
  "id": "",
  "stream": false,
  "selectedOutputs": [
    "function1.result"
  ],
  "includeThinking": false,
  "includeToolCalls": false
}
```

During analysis, display a blocking progress state.

Show text such as:

`Analyzing company signals...`

Do not allow repeated analysis submissions while one is already running.

After the analysis API returns success, call the company-list API again.

---

# Dashboard Data Retrieval

After analysis is complete, call the company-list API again.

The relevant dashboard response is stored inside:

```text
output.rows[n].data.output.content
```

Important:

```text
content
```

is a JSON string, not an already-parsed JavaScript object.

For example:

```text
"{\"generatedAt\":\"2026-08-20T13:33:09Z\", ... }"
```

Parse it using JSON parsing.

Conceptually:

```javascript
const rawContent = row.data.output.content;
const dashboardData = JSON.parse(rawContent);
```

Do not render:

* row metadata
* token counts
* cost
* model
* toolCalls
* providerTiming
* assistantContent
* executions
* executionId

Only map the parsed:

```text
row.data.output.content
```

into the dashboard.

---

# Expected Parsed Dashboard Structure

The parsed `content` object contains:

```text
generatedAt
summary
trends
signalAnalytics
companies
signals
```

Use these fields directly to render the screens.

---

# Overview Tab

The Overview tab should contain the summary metric cards first.

Use:

```text
summary.companiesTracked
summary.totalSignals
summary.highAlerts
summary.cSuiteChanges
summary.funding
summary.mergersAcquisitions
summary.ipo
summary.newsMentions
summary.productLaunches
summary.partnerships
summary.creativeHiring
```

Place the cards in a grid.

Each card should show:

* metric label
* metric count

For `Total Signals`, also show:

```text
summary.severity.high
summary.severity.medium
summary.severity.low
```

as compact sub-counts.

Example:

```text
Total Signals
170

H: 0
M: 116
L: 54
```

---

# Overview — Signal Feed and Charts

Below the metric cards, provide a dashboard section matching the supplied structure.

Left column:

### Signal Feed

Heading:

`Signal Feed`

Count badge:

```text
summary.totalSignals
```

Provide a small informational row:

`Showing signals from last 90 days only`

Display a vertically scrollable signal feed.

Each signal item should map from:

```text
signals[]
```

Show:

* company logo or fallback initials
* company name
* signal type
* title or summary
* severity badge
* relative date
* `Website` button
* `Email` button
* `Research` button

`Website` should open:

```text
signal.source.url
```

if available.

The signal feed itself should scroll independently.

---

# Overview — Weekly Signal Trend

Right side, first chart:

### Weekly Signal Trend

Use React ECharts.

Map from:

```text
trends.weekly[]
```

Use a stacked bar chart.

Series:

```text
high
medium
low
```

X-axis:

```text
weekly.label
```

Y-axis:

signal counts.

Clicking a weekly bar should filter the Signal Feed to the selected week.

Provide a clear way to remove the chart filter.

---

# Overview — Signal Type Breakdown

Below the weekly trend chart:

### Signal Type Breakdown

Use React ECharts.

Use a donut chart.

Map from:

```text
signalAnalytics.byType[]
```

Each slice uses:

```text
label
count
```

Clicking a slice should filter the Signal Feed by that signal type.

---

# Overview — Top Industries

Below the signal type chart:

### Top Industries by Signal Count

Use React ECharts.

Map from:

```text
signalAnalytics.byIndustry[]
```

Use a horizontal bar chart.

Display:

```text
industry
count
```

Clicking an industry should filter the relevant signal/company data.

---

# Trends Tab

The Trends tab should contain:

### Weekly Signal Trend (8 Weeks)

Use React ECharts stacked bar chart.

Map:

```text
trends.weekly[]
```

Show:

* HIGH
* MEDIUM
* LOW

---

### Signals by Category

Use React ECharts vertical bar chart.

Map from:

```text
signalAnalytics.byType[]
```

X-axis:

```text
label
```

Y-axis:

```text
count
```

Clicking a bar should apply a signal-type filter.

---

### Top 10 Companies by Signal Count

Use React ECharts horizontal bar chart.

Map from:

```text
signalAnalytics.topCompanies[]
```

Show a maximum of 10 companies.

Use:

```text
companyName
signalCount
```

Sort descending by `signalCount`.

Clicking a company should filter or navigate to its signals.

---

# All Signals Tab

At the top show:

```text
All Signals
```

and a badge containing:

```text
summary.totalSignals
```

Place filters on the right side:

* Severity dropdown
* Signal Type dropdown
* `Export CSV` button

Below that, show three summary panels.

---

# All Signals — Severity Mix

Use:

```text
summary.severity.high
summary.severity.medium
summary.severity.low
```

Render with React ECharts as a donut chart.

Also show numeric values alongside the chart.

---

# All Signals — Signal Types

Use:

```text
signalAnalytics.byType[]
```

Show horizontal progress bars or bar visualization with:

* signal type label
* count

Use React ECharts if implemented as a chart.

---

# All Signals — At a Glance

Show:

```text
summary.totalSignals
summary.signalsLast7Days
summary.companiesWithSignals
```

Example:

```text
170 total signals
1 in the last 7 days
75 companies with signals
```

---

# All Signals — Signal Cards

Below the summaries, display the full:

```text
signals[]
```

collection.

Each signal card should show:

* company logo/fallback initials
* company name
* signal type
* title
* summary
* severity
* relative date
* signal date
* website/source
* Email button
* Research button

If a source is available, also show its source domain/name.

Filtering must work together.

Example:

If severity is `MEDIUM` and type is `PARTNERSHIP`, show only signals matching both.

---

# Export Signals CSV

`Export CSV` should export the currently filtered signal result, not always the entire raw dataset.

Include useful columns such as:

```text
Company
Signal Type
Severity
Title
Summary
Signal Date
Industry
Location
Source Name
Source URL
```

---

# Companies Tab

At the top left place a search field:

```text
Search name, domain, industry...
```

Next to it show:

```text
X of Y companies
```

Example:

```text
294 of 294 companies
```

On the right place:

`Export CSV`

Below that render a table.

Do not use cards for the primary Companies view.

Use a table.

---

# Companies Table Columns

Use:

```text
#
Company
Industry
Location
Employees
Revenue
Funding Stage
Last Signal
Signals
Actions
```

Map from:

```text
companies[]
```

Company:

```text
companyName
```

Industry:

```text
industry
```

Location:

```text
location
```

Employees:

```text
employeeCount
```

Revenue:

```text
revenue
```

Funding Stage:

```text
fundingStage
```

Last Signal:

```text
lastSignalType
```

Signals:

```text
signalCount
```

Sort the Signals column descending by default.

---

# Companies Table Search

The Companies-tab search should filter by:

* companyName
* domain
* industry
* location

Search must be client-side after data is loaded.

---

# Companies Table Expandable Row

Clicking a company row should expand it inline.

Do not navigate away from the table.

The expanded section should contain two main areas.

Left:

### Signal History

Use:

```text
company.signalHistory[]
```

Show rows containing:

* severity
* typeLabel
* title
* relative date
* source link

Signal History should support internal scrolling if there are many records.

Right:

### Tech Stack

Use:

```text
company.techStack[]
```

Display as tags/chips.

### Keywords

Use:

```text
company.keywords[]
```

Display as tags/chips.

If arrays are empty, show a simple `—`.

Only one or a small number of rows should remain expanded at once to avoid an excessively long table.

---

# Companies Table Actions

Include compact actions on the right side of each company row.

Use:

* `Website`
* `Search`

If the data supports additional actions, they can be added later.

Do not invent unsupported destinations.

---

# Company Search in Header

The global header search:

```text
Search companies...
```

should search the loaded:

```text
companies[]
```

When a user selects a matching company:

* switch to the Companies tab
* apply that company search
* optionally expand the selected company row

Do not call the analysis API for every search.

---

# Filters Button

The header `Filters` button should open filtering controls.

Support useful filters derived from available data:

* Severity
* Signal Type
* Industry
* Company
* Date range

Applying filters should update relevant dashboard data without another LLM analysis call.

Provide:

* Apply
* Clear Filters

---

# Refresh Dashboard Button

Place `Refresh Dashboard` in the header.

When clicked:

1. Disable the button.
2. Show a refreshing/loading state.
3. Call the analysis API.
4. Wait for successful completion.
5. Call the company-list API.
6. Parse the newest `output.content`.
7. Replace the existing dashboard data.
8. Update the `Updated` timestamp.
9. Re-enable the button.

Do not simply reload the browser.

---

# Output Content Parsing

The most important mapping rule is:

```text
API
↓
output.rows[]
↓
row.data.output.content
↓
JSON.parse(content)
↓
dashboardData
```


Do not map:

```text
output.rows
```

directly into charts.

Charts and tables must use the parsed `content`.

---

# Empty Analysis Output

If parsed content contains:

```json
{
  "summary": {
    "companiesTracked": 0,
    "totalSignals": 0
  },
  "companies": [],
  "signals": []
}
```

do not treat it as an application failure.

Render the dashboard with zeros and appropriate empty states.

Examples:

Signal Feed:

`No signals found for the current company list.`

Companies:

`No analyzed company records are available yet.`

Charts should render zero/empty states gracefully.

Do not inject fake sample values.

---

# Analysis Loading

While the analysis workflow is running, show a clear progress state.

Do not clear the existing dashboard before the new analysis result is available.

If previous data exists:

* keep the previous dashboard visible
* show `Refreshing analysis...`
* replace data only when the refreshed content has successfully loaded

---

# API Failure Handling

For any API failure:

* retain previously loaded data where possible
* show a retry option
* do not leave buttons permanently disabled

Handle separately:

* initial company-list retrieval failure
* company upload/save failure
* analysis failure
* final dashboard retrieval failure
* malformed `output.content`

---

# Data Rules

Never fabricate data for the charts or tables.

Always derive values from the parsed response.

Use:

```text
summary
trends.weekly
signalAnalytics.byType
signalAnalytics.byIndustry
signalAnalytics.topCompanies
companies
signals
```

as the source of truth.

If a property is missing, fall back safely to:

```text
0
[]
""
null
```

depending on its type.

---

# Final Required Interaction Flow

```text
Application loads
        ↓
Get existing company list
        ↓
Does totalCompanies exist?
        ↓
   YES                NO
    │                  │
    │             Show upload
    │                  │
    │             Parse file
    │                  │
    │             Preview rows
    │                  │
    │             Save companyDetails[]
    │                  │
    └──────────────┬───┘
                   ↓
             Run analysis
                   ↓
             Wait for success
                   ↓
          Get company row again
                   ↓
       Read row.data.output.content
                   ↓
            JSON.parse(content)
                   ↓
          Render dashboard tabs
                   ↓
    Overview / Trends / All Signals / Companies
```

Use **React ECharts** for:

* Weekly Signal Trend
* Signal Type Breakdown
* Top Industries
* Signals by Category
* Top Companies
* Severity Mix

Use a **tabbed interface** for the main dashboard navigation.

Do not implement a left navigation.

Do not add UI redesign, theming, styling, or color-change requirements.

Do not alter the API response structure.

Build the application around the workflow and mapping rules above.
