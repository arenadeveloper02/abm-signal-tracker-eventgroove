export interface SeveritySummary {
  high: number
  medium: number
  low: number
}

export interface DashboardSummary {
  companiesTracked: number
  totalSignals: number
  highAlerts: number
  cSuiteChanges: number
  funding: number
  mergersAcquisitions: number
  ipo: number
  newsMentions: number
  productLaunches: number
  partnerships: number
  creativeHiring: number
  signalsLast7Days: number
  companiesWithSignals: number
  severity: SeveritySummary
}

export interface WeeklyTrend {
  label: string
  high: number
  medium: number
  low: number
}

export interface TypeBreakdown {
  type: string
  label: string
  count: number
}

export interface IndustryBreakdown {
  industry: string
  count: number
}

export interface TopCompany {
  companyName: string
  signalCount: number
}

export interface SignalSource {
  name: string
  url: string
}

export interface SignalRecord {
  id: string
  companyName: string
  type: string
  typeLabel: string
  title: string
  summary: string
  severity: string
  date: string
  industry: string
  location: string
  weekLabel: string
  source: SignalSource | null
}

export interface SignalHistoryItem {
  severity: string
  typeLabel: string
  title: string
  date: string
  source: SignalSource | null
}

export interface CompanyRecord {
  companyName: string
  domain: string
  website: string
  industry: string
  location: string
  employeeCount: string
  revenue: string
  fundingStage: string
  lastSignalType: string
  lastSignalDate: string
  signalCount: number
  techStack: string[]
  keywords: string[]
  signalHistory: SignalHistoryItem[]
}

export interface SignalAnalytics {
  byType: TypeBreakdown[]
  byIndustry: IndustryBreakdown[]
  topCompanies: TopCompany[]
}

export interface DashboardData {
  generatedAt: string
  summary: DashboardSummary
  trends: { weekly: WeeklyTrend[] }
  signalAnalytics: SignalAnalytics
  companies: CompanyRecord[]
  signals: SignalRecord[]
}

export interface GlobalFilters {
  severity: string
  signalType: string
  industry: string
  company: string
  dateFrom: string
  dateTo: string
}

export interface EChartClickParams {
  name: string
  seriesName?: string
  dataIndex?: number
  value?: number | number[] | string
}
