import type {
  CompanyRecord,
  DashboardData,
  DashboardSummary,
  GlobalFilters,
  IndustryBreakdown,
  SignalHistoryItem,
  SignalRecord,
  SignalSource,
  TopCompany,
  TypeBreakdown,
  WeeklyTrend,
} from '@/lib/types'

export const CHART_COLORS: string[] = ['#1A73E8', '#FB8145', '#B364D7', '#00A7D6', '#DFC612', '#F8528F', '#3BC884', '#6D717F']

function asObj(v: unknown): Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
}

function asArr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

function asStr(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' && isFinite(v)) return String(v)
  return ''
}

function asDateStr(v: unknown): string {
  const d = asStr(v).trim()
  if (!d) return ''
  const parsed = new Date(d)
  return isNaN(parsed.getTime()) ? '' : d
}

function asNum(v: unknown): number {
  if (typeof v === 'number' && isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    if (!isNaN(n)) return n
  }
  return 0
}

function asStrArr(v: unknown): string[] {
  return asArr(v)
    .map((x) => asStr(x).trim())
    .filter((x) => x !== '')
}

export const MAX_IMPORT_ROWS = 50

export function uniqueCompanyRows(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const trimmed = value.trim()
    if (!trimmed) continue
    const name = trimmed.split(',')[0]?.trim() || trimmed
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(trimmed)
  }
  return out
}

export function capImportRows(values: string[]): string[] {
  return uniqueCompanyRows(values).slice(0, MAX_IMPORT_ROWS)
}

export function sourceDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function signalTypeLabel(type: string, fallback = ''): string {
  const t = type.trim()
  if (!t) return fallback
  const labels: Record<string, string> = {
    C_SUITE_CHANGE: 'C-Suite Change',
    FUNDING: 'Funding',
    MERGER_ACQUISITION: 'Mergers & Acquisitions',
    NEWS_MENTION: 'News Mention',
    CREATIVE_HIRING: 'Creative Hiring',
    PARTNERSHIP: 'Partnership',
    PRODUCT_LAUNCH: 'Product Launch',
    OTHER: 'Other',
    IPO: 'IPO',
  }
  if (labels[t]) return labels[t]
  return t.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
}

function signalSourceFromObject(o: Record<string, unknown>): SignalSource | null {
  const nested = toSource(o.source)
  if (nested?.url) return nested
  const url = asStr(o.sourceUrl) || asStr(o.url) || asStr(o.link) || (nested?.url ?? '')
  const name = asStr(o.sourceName) || asStr(o.source) || nested?.name || ''
  if (!url && !name) return null
  return { name: name || (url ? sourceDomain(url) : ''), url }
}

function mapSignal(raw: unknown, idx: number, fallbacks?: { companyName?: string; industry?: string; location?: string }): SignalRecord {
  const o = asObj(raw)
  const type = asStr(o.type) || asStr(o.lastSignalType) || asStr(o.typeLabel)
  const location = asStr(o.location) || fallbacks?.location || ''
  return {
    id: asStr(o.id) || asStr(o.signalId) || `signal-${idx}`,
    companyName: asStr(o.companyName) || asStr(o.company) || fallbacks?.companyName || '',
    type,
    typeLabel: asStr(o.typeLabel) || signalTypeLabel(type),
    title: asStr(o.title) || asStr(o.headline) || asStr(o.name),
    summary: asStr(o.summary) || asStr(o.description) || asStr(o.details) || asStr(o.relativeDate),
    severity: (asStr(o.severity) || asStr(o.priority) || 'LOW').toUpperCase(),
    date: asDateStr(o.date) || asDateStr(o.signalDate) || asDateStr(o.lastSignalDate) || asDateStr(o.eventDate),
    industry: asStr(o.industry) || fallbacks?.industry || '',
    location,
    weekLabel: asStr(o.weekLabel),
    source: signalSourceFromObject(o) || toSource(o.website),
  }
}

function mapHistoryItem(raw: unknown): SignalHistoryItem | null {
  const o = asObj(raw)
  const type = asStr(o.type)
  const typeLabel = asStr(o.typeLabel) || signalTypeLabel(type)
  const title = asStr(o.title) || asStr(o.headline)
  const date = asDateStr(o.date) || asDateStr(o.signalDate) || asDateStr(o.lastSignalDate)
  if (!title && !date && !type && !typeLabel) return null
  return {
    severity: (asStr(o.severity) || 'LOW').toUpperCase(),
    type,
    typeLabel,
    title,
    date,
    source: signalSourceFromObject(o),
  }
}

function signalsFromCompanies(companyRows: unknown[]): SignalRecord[] {
  const out: SignalRecord[] = []
  companyRows.forEach((raw, idx) => {
    const o = asObj(raw)
    const companyName = asStr(o.companyName) || asStr(o.name)
    if (!companyName.trim()) return
    const type = asStr(o.lastSignalType)
    const date = asStr(o.lastSignalDate)
    const label = signalTypeLabel(type)
    const industry = asStr(o.industry)
    const location = [asStr(o.location), asStr(o.country)].filter((p) => p !== '').join(', ')
    const website = asStr(o.website)
    const domain = asStr(o.domain)
    const source = website ? { name: domain || companyName, url: website } : toSource(o.source)
    const high = asNum(o.highSignalCount)
    const medium = asNum(o.mediumSignalCount)
    const low = asNum(o.lowSignalCount)
    const total = asNum(o.signalCount) || high + medium + low
    const add = (severity: string, count: number) => {
      if (count <= 0) return
      const latest = label ? ` Latest type: ${label}.` : ''
      const when = date ? ` Most recent activity on ${date}.` : ''
      out.push({
        id: `${companyName}-${severity}-${idx}`,
        companyName,
        type,
        typeLabel: label || severity,
        title: count === 1 ? `1 ${severity.toLowerCase()}-priority signal` : `${count} ${severity.toLowerCase()}-priority signals`,
        summary: `${total} signals tracked for ${companyName}.${when}${latest}`,
        severity,
        date,
        industry,
        location,
        weekLabel: '',
        source,
      })
    }
    add('HIGH', high)
    add('MEDIUM', medium)
    add('LOW', low)
    if (high + medium + low === 0 && (type || date || total > 0)) {
      out.push({
        id: `${companyName}-latest-${idx}`,
        companyName,
        type,
        typeLabel: label || 'Other',
        title: label ? `Latest ${label} signal` : 'Tracked account activity',
        summary: total > 0 ? `${total} signals tracked for ${companyName}.` : 'No detailed signal records were returned for this account.',
        severity: 'LOW',
        date,
        industry,
        location,
        weekLabel: '',
        source,
      })
    }
  })
  return out
}

function toSource(v: unknown): SignalSource | null {
  if (typeof v === 'string' && v.trim() !== '') {
    const url = v.trim()
    return { name: sourceDomain(url), url }
  }
  const o = asObj(v)
  const url = asStr(o.url).trim()
  const name = asStr(o.name).trim()
  if (!url && !name) return null
  return { name: name || (url ? sourceDomain(url) : ''), url }
}

function getRows(resp: unknown): Record<string, unknown>[] {
  const r = asObj(resp)
  const output = asObj(r.output)
  const data = asObj(r.data)
  const candidates: unknown[] = [output.rows, output['data.rows'], r.rows, data.rows]
  for (const c of candidates) {
    if (Array.isArray(c)) return c.map((x) => asObj(x))
  }
  return []
}

function unwrapJsonContent(raw: string): string {
  const trimmed = raw.trim()
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return fence ? fence[1].trim() : trimmed
}

function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function repairTruncatedJson(input: string): string {
  let inString = false
  let escape = false
  const stack: string[] = []
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (inString) {
      if (escape) {
        escape = false
        continue
      }
      if (ch === '\\') {
        escape = true
        continue
      }
      if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{') stack.push('}')
    else if (ch === '[') stack.push(']')
    else if ((ch === '}' || ch === ']') && stack[stack.length - 1] === ch) stack.pop()
  }

  let out = input
  if (escape) out = out.slice(0, -1)
  if (inString) out += '"'
  out = out.replace(/,\s*"(?:\\.|[^"\\])*"\s*:\s*$/, '')
  out = out.replace(/([{,])\s*"(?:\\.|[^"\\])*"\s*$/, '$1')
  out = out.replace(/[,:\s]+$/, '')
  for (let i = stack.length - 1; i >= 0; i--) out += stack[i]
  return out
}

function parseDashboardJson(content: string): unknown | null {
  const unwrapped = unwrapJsonContent(content)
  const attempts = [unwrapped, repairTruncatedJson(unwrapped)]
  for (const attempt of attempts) {
    const parsed = tryParseJson(attempt)
    if (parsed === null) continue
    if (typeof parsed === 'string') {
      const nested = tryParseJson(repairTruncatedJson(unwrapJsonContent(parsed)))
      if (nested !== null && typeof nested === 'object') return nested
      continue
    }
    if (typeof parsed === 'object') return parsed
  }
  return null
}

function contentFromUnknown(v: unknown): string | null {
  if (typeof v === 'string' && v.trim() !== '') return unwrapJsonContent(v)
  if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
    const o = asObj(v)
    if ('summary' in o || 'signals' in o || 'companies' in o) return JSON.stringify(v)
  }
  return null
}

export function extractCompanyList(resp: unknown): string[] {
  const rows = getRows(resp)
  for (const row of rows) {
    const data = asObj(row.data)
    const inner = asObj(data.data)
    const list = inner.totalCompanies
    if (Array.isArray(list)) {
      const cleaned = uniqueCompanyRows(
        list.filter((c): c is string => typeof c === 'string' && c.trim() !== '')
      )
      if (cleaned.length > 0) return cleaned
    }
  }
  return []
}

export function extractDashboardContent(resp: unknown): string | null {
  const r = asObj(resp)
  const output = asObj(r.output)
  const fromOutput = contentFromUnknown(output.content)
  if (fromOutput) return fromOutput
  const fromRoot = contentFromUnknown(r.content)
  if (fromRoot) return fromRoot
  const rows = getRows(resp)
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    const data = asObj(row.data)
    const candidates = [asObj(row.output).content, asObj(data.output).content, data.content, row.content]
    for (const c of candidates) {
      const content = contentFromUnknown(c)
      if (content) return content
    }
  }
  return null
}

export function extractSavedRowId(resp: unknown): string {
  const r = asObj(resp)
  const output = asObj(r.output)
  const row = asObj(output.row)
  return asStr(row.id).trim()
}

export function normalizeDashboard(raw: unknown): DashboardData {
  const root = asObj(raw)
  const sum = asObj(root.summary)
  const sev = asObj(sum.severity)
  const summary: DashboardSummary = {
    companiesTracked: asNum(sum.companiesTracked),
    totalSignals: asNum(sum.totalSignals),
    highAlerts: asNum(sum.highAlerts),
    cSuiteChanges: asNum(sum.cSuiteChanges),
    funding: asNum(sum.funding),
    mergersAcquisitions: asNum(sum.mergersAcquisitions),
    ipo: asNum(sum.ipo),
    newsMentions: asNum(sum.newsMentions),
    productLaunches: asNum(sum.productLaunches),
    partnerships: asNum(sum.partnerships),
    creativeHiring: asNum(sum.creativeHiring),
    signalsLast7Days: asNum(sum.signalsLast7Days),
    companiesWithSignals: asNum(sum.companiesWithSignals),
    severity: { high: asNum(sev.high), medium: asNum(sev.medium), low: asNum(sev.low) },
  }

  const weekly: WeeklyTrend[] = asArr(asObj(root.trends).weekly).map((w) => {
    const o = asObj(w)
    return { label: asStr(o.label), high: asNum(o.high), medium: asNum(o.medium), low: asNum(o.low) }
  })

  const analytics = asObj(root.signalAnalytics)
  const byType: TypeBreakdown[] = asArr(analytics.byType).map((t) => {
    const o = asObj(t)
    return { type: asStr(o.type) || asStr(o.label), label: asStr(o.label) || asStr(o.type), count: asNum(o.count) }
  })
  const byIndustry: IndustryBreakdown[] = asArr(analytics.byIndustry).map((t) => {
    const o = asObj(t)
    return { industry: asStr(o.industry) || asStr(o.label), count: asNum(o.count) }
  })
  const topCompanies: TopCompany[] = asArr(analytics.topCompanies).map((t) => {
    const o = asObj(t)
    return { companyName: asStr(o.companyName) || asStr(o.name), signalCount: asNum(o.signalCount) || asNum(o.count) }
  })

  const mappedSignals: SignalRecord[] = asArr(root.signals).map((raw2, idx) => mapSignal(raw2, idx))

  const companies: CompanyRecord[] = []
  const seenCompanies = new Set<string>()
  for (const raw2 of asArr(root.companies)) {
    const o = asObj(raw2)
    const history: SignalHistoryItem[] = asArr(o.signalHistory)
      .map((h) => mapHistoryItem(h))
      .filter((h): h is SignalHistoryItem => h !== null && (h.title !== '' || h.date !== ''))
    const lastType = asStr(o.lastSignalType)
    const lastDate = asStr(o.lastSignalDate)
    const lastLabel = signalTypeLabel(lastType)
    const website = asStr(o.website)
    const domain = asStr(o.domain)
    const companyName = asStr(o.companyName) || asStr(o.name)
    const companySource = website ? { name: domain || companyName, url: website } : toSource(o.source)
    if (history.length === 0) {
      const buckets: Array<[string, number]> = [
        ['HIGH', asNum(o.highSignalCount)],
        ['MEDIUM', asNum(o.mediumSignalCount)],
        ['LOW', asNum(o.lowSignalCount)],
      ]
      for (const [severity, count] of buckets) {
        if (count <= 0) continue
        history.push({
          severity,
          type: lastType,
          typeLabel: lastLabel || severity,
          title: count === 1 ? `1 ${severity.toLowerCase()}-priority signal` : `${count} ${severity.toLowerCase()}-priority signals`,
          date: lastDate,
          source: companySource,
        })
      }
      if (history.length === 0 && (lastType || lastDate || asNum(o.signalCount) > 0)) {
        history.push({
          severity: 'LOW',
          type: lastType,
          typeLabel: lastLabel || 'Other',
          title: lastLabel ? `Latest ${lastLabel} signal` : 'Tracked account activity',
          date: lastDate,
          source: companySource,
        })
      }
    }
    const key = companyName.trim().toLowerCase()
    if (!key || seenCompanies.has(key)) continue
    seenCompanies.add(key)
    companies.push({
      companyName,
      domain: asStr(o.domain),
      website: asStr(o.website),
      industry: asStr(o.industry),
      location: [asStr(o.location), asStr(o.country)].filter((p) => p !== '').join(', '),
      employeeCount: asStr(o.employeeCount),
      revenue: asStr(o.revenue),
      fundingStage: asStr(o.fundingStage),
      lastSignalType: lastLabel || lastType,
      lastSignalDate: lastDate,
      signalCount: asNum(o.signalCount),
      techStack: asStrArr(o.techStack),
      keywords: asStrArr(o.keywords),
      signalHistory: history,
    })
  }

  const fromHistory: SignalRecord[] = []
  companies.forEach((c, ci) => {
    c.signalHistory.forEach((h, hi) => {
      fromHistory.push({
        id: `history-${ci}-${hi}`,
        companyName: c.companyName,
        type: h.type || h.typeLabel,
        typeLabel: h.typeLabel || signalTypeLabel(h.type),
        title: h.title,
        summary: h.title.includes('-priority signal')
          ? `${c.signalCount} signals tracked for ${c.companyName}.`
          : '',
        severity: h.severity,
        date: h.date,
        industry: c.industry,
        location: c.location,
        weekLabel: '',
        source: h.source,
      })
    })
  })

  const signals =
    mappedSignals.length > 0
      ? mappedSignals
      : fromHistory.length > 0
        ? fromHistory
        : signalsFromCompanies(asArr(root.companies))

  const uniqueTopCompanies: TopCompany[] = []
  const seenTop = new Set<string>()
  for (const c of topCompanies) {
    const key = c.companyName.trim().toLowerCase()
    if (!key || seenTop.has(key)) continue
    seenTop.add(key)
    uniqueTopCompanies.push(c)
  }

  summary.companiesTracked = Math.max(summary.companiesTracked, companies.length)

  return {
    generatedAt: asStr(root.generatedAt),
    summary,
    trends: { weekly },
    signalAnalytics: { byType, byIndustry, topCompanies: uniqueTopCompanies },
    companies,
    signals,
  }
}

export function safeParseDashboard(content: string): DashboardData | null {
  const parsed = parseDashboardJson(content)
  if (parsed === null || typeof parsed !== 'object') return null
  return normalizeDashboard(parsed)
}

export function formatRelative(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return ''
  let diff = Date.now() - d.getTime()
  if (diff < 0) diff = 0
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  const remM = mins % 60
  if (hours < 24) return `${hours}h ${remM}m ago`
  const days = Math.floor(hours / 24)
  const remH = hours % 24
  if (days < 30) return `${days}d ${remH}h ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function formatDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return typeof value === 'string' ? value : ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return typeof value === 'string' ? value : ''
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter((p) => p !== '')
  if (parts.length === 0) return '?'
  const first = parts[0].charAt(0)
  const second = parts.length > 1 ? parts[1].charAt(0) : ''
  return (first + second).toUpperCase()
}

function parseWeekLabel(label: string): Date | null {
  const trimmed = label.trim()
  if (!trimmed) return null
  const direct = new Date(trimmed)
  if (!isNaN(direct.getTime()) && direct.getFullYear() >= 2005) return direct
  const withYear = new Date(`${trimmed} ${new Date().getFullYear()}`)
  if (!isNaN(withYear.getTime())) return withYear
  if (!isNaN(direct.getTime())) return direct
  return null
}

export function signalInWeek(signal: SignalRecord, weekLabel: string): boolean {
  if (signal.weekLabel && signal.weekLabel === weekLabel) return true
  const start = parseWeekLabel(weekLabel)
  if (!start) return false
  const d = new Date(signal.date)
  if (isNaN(d.getTime())) return false
  const diff = d.getTime() - start.getTime()
  return diff >= 0 && diff < 7 * 24 * 3600 * 1000
}

export function filterSignals(signals: SignalRecord[], filters: GlobalFilters, search: string): SignalRecord[] {
  const q = search.trim().toLowerCase()
  return signals.filter((s) => {
    if (filters.severity && s.severity.toUpperCase() !== filters.severity.toUpperCase()) return false
    if (filters.signalType && s.typeLabel !== filters.signalType && s.type !== filters.signalType) return false
    if (filters.industry && s.industry !== filters.industry) return false
    if (filters.company && s.companyName !== filters.company) return false
    if (filters.dateFrom) {
      const d = new Date(s.date)
      const from = new Date(filters.dateFrom)
      if (!isNaN(d.getTime()) && !isNaN(from.getTime()) && d.getTime() < from.getTime()) return false
    }
    if (filters.dateTo) {
      const d = new Date(s.date)
      const to = new Date(`${filters.dateTo}T23:59:59`)
      if (!isNaN(d.getTime()) && !isNaN(to.getTime()) && d.getTime() > to.getTime()) return false
    }
    if (q) {
      const hay = `${s.companyName} ${s.title} ${s.summary}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

function csvEscape(v: string): string {
  return `"${v.replace(/"/g, '""')}"`
}

export function exportCsv(filename: string, header: string[], rows: string[][]): void {
  const lines = [header, ...rows].map((r) => r.map(csvEscape).join(','))
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
