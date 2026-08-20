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

export function sourceDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
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
  const candidates: unknown[] = [output.rows, r.rows, asObj(r.data).rows]
  for (const c of candidates) {
    if (Array.isArray(c)) return c.map((x) => asObj(x))
  }
  return []
}

export function extractCompanyList(resp: unknown): string[] {
  const rows = getRows(resp)
  for (const row of rows) {
    const data = asObj(row.data)
    const inner = asObj(data.data)
    const list = inner.totalCompanies
    if (Array.isArray(list)) {
      const cleaned = list
        .filter((c): c is string => typeof c === 'string' && c.trim() !== '')
        .map((c) => c.trim())
      if (cleaned.length > 0) return cleaned
    }
  }
  return []
}

export function extractDashboardContent(resp: unknown): string | null {
  const rows = getRows(resp)
  for (let i = rows.length - 1; i >= 0; i--) {
    const data = asObj(rows[i].data)
    const output = asObj(data.output)
    const content = output.content
    if (typeof content === 'string' && content.trim() !== '') return content
  }
  const r = asObj(resp)
  const directContent = asObj(r.output).content
  if (typeof directContent === 'string' && directContent.trim() !== '') return directContent
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

  const signals: SignalRecord[] = asArr(root.signals).map((raw2, idx) => {
    const o = asObj(raw2)
    return {
      id: asStr(o.id) || `signal-${idx}`,
      companyName: asStr(o.companyName) || asStr(o.company),
      type: asStr(o.type),
      typeLabel: asStr(o.typeLabel) || asStr(o.type),
      title: asStr(o.title),
      summary: asStr(o.summary),
      severity: (asStr(o.severity) || 'LOW').toUpperCase(),
      date: asStr(o.date) || asStr(o.signalDate),
      industry: asStr(o.industry),
      location: asStr(o.location),
      weekLabel: asStr(o.weekLabel),
      source: toSource(o.source),
    }
  })

  const companies: CompanyRecord[] = asArr(root.companies).map((raw2) => {
    const o = asObj(raw2)
    const history: SignalHistoryItem[] = asArr(o.signalHistory).map((h) => {
      const ho = asObj(h)
      return {
        severity: (asStr(ho.severity) || 'LOW').toUpperCase(),
        typeLabel: asStr(ho.typeLabel) || asStr(ho.type),
        title: asStr(ho.title),
        date: asStr(ho.date),
        source: toSource(ho.source),
      }
    })
    return {
      companyName: asStr(o.companyName) || asStr(o.name),
      domain: asStr(o.domain),
      website: asStr(o.website),
      industry: asStr(o.industry),
      location: asStr(o.location),
      employeeCount: asStr(o.employeeCount),
      revenue: asStr(o.revenue),
      fundingStage: asStr(o.fundingStage),
      lastSignalType: asStr(o.lastSignalType),
      signalCount: asNum(o.signalCount),
      techStack: asStrArr(o.techStack),
      keywords: asStrArr(o.keywords),
      signalHistory: history,
    }
  })

  return {
    generatedAt: asStr(root.generatedAt),
    summary,
    trends: { weekly },
    signalAnalytics: { byType, byIndustry, topCompanies },
    companies,
    signals,
  }
}

export function safeParseDashboard(content: string): DashboardData | null {
  try {
    const parsed: unknown = JSON.parse(content)
    if (parsed === null || typeof parsed !== 'object') return null
    return normalizeDashboard(parsed)
  } catch {
    return null
  }
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
