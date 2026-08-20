"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DashboardData, GlobalFilters } from '@/lib/types'
import { extractCompanyList, extractDashboardContent, safeParseDashboard } from '@/lib/utils'
import { recordActivityEvent } from '@/lib/actions'
import { useArenaEmailId } from '@/components/arena-email-provider'
import HeaderBar from '@/components/HeaderBar'
import UploadClient from '@/components/UploadClient'
import OverviewTab from '@/components/OverviewTab'
import TrendsTab from '@/components/TrendsTab'
import SignalsTab from '@/components/SignalsTab'
import CompaniesTab from '@/components/CompaniesTab'

type TabKey = 'overview' | 'trends' | 'signals' | 'companies'
type Phase = 'boot' | 'upload' | 'dashboard'

const EMPTY_FILTERS: GlobalFilters = { severity: '', signalType: '', industry: '', company: '', dateFrom: '', dateTo: '' }

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'trends', label: 'Trends' },
  { key: 'signals', label: 'All Signals' },
  { key: 'companies', label: 'Companies' },
]

export default function DashboardClient() {
  const email = useArenaEmailId()
  const [phase, setPhase] = useState<Phase>('boot')
  const [data, setData] = useState<DashboardData | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<GlobalFilters>(EMPTY_FILTERS)
  const [draft, setDraft] = useState<GlobalFilters>(EMPTY_FILTERS)
  const [companiesSearch, setCompaniesSearch] = useState('')
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null)
  const analysisRef = useRef(false)
  const bootedRef = useRef(false)

  const fetchList = useCallback(async (): Promise<unknown> => {
    const res = await fetch('/api/company-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) throw new Error('Failed to retrieve the saved company list')
    return res.json()
  }, [email])

  const runAnalysis = useCallback(async (): Promise<void> => {
    if (analysisRef.current) return
    analysisRef.current = true
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Analysis request failed')
      await res.json()
      const listResp = await fetchList()
      const content = extractDashboardContent(listResp)
      if (!content) throw new Error('No dashboard output was returned after analysis')
      const parsed = safeParseDashboard(content)
      if (!parsed) throw new Error('The dashboard output could not be parsed')
      setData(parsed)
      setLastUpdated(parsed.generatedAt || new Date().toISOString())
      setPhase('dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
      analysisRef.current = false
    }
  }, [email, fetchList])

  const boot = useCallback(async (): Promise<void> => {
    setError(null)
    setPhase('boot')
    try {
      const listResp = await fetchList()
      const savedCompanies = extractCompanyList(listResp)
      const content = extractDashboardContent(listResp)
      if (content) {
        const parsed = safeParseDashboard(content)
        if (parsed) {
          setData(parsed)
          setLastUpdated(parsed.generatedAt || new Date().toISOString())
        }
      }
      if (savedCompanies.length > 0) {
        setPhase('dashboard')
        void runAnalysis()
      } else if (content) {
        setPhase('dashboard')
      } else {
        setPhase('upload')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load the company list')
      setPhase('dashboard')
    }
  }, [fetchList, runAnalysis])

  useEffect(() => {
    if (!email || bootedRef.current) return
    bootedRef.current = true
    void boot()
  }, [email, boot])

  const handleRefresh = useCallback(() => {
    void recordActivityEvent(email, 'refresh_dashboard')
    void runAnalysis()
  }, [email, runAnalysis])

  const handleUploadSaved = useCallback(() => {
    void recordActivityEvent(email, 'companies_uploaded')
    setPhase('dashboard')
    void runAnalysis()
  }, [email, runAnalysis])

  const handleSelectCompany = useCallback((name: string) => {
    setActiveTab('companies')
    setCompaniesSearch(name)
    setExpandedCompany(name)
    setSearchQuery('')
  }, [])

  const handleApplyTypeFilter = useCallback((label: string) => {
    setFilters((prev) => ({ ...prev, signalType: label }))
    setDraft((prev) => ({ ...prev, signalType: label }))
    setActiveTab('signals')
  }, [])

  const openFilters = useCallback(() => {
    setDraft(filters)
    setShowFilters((v) => !v)
  }, [filters])

  const applyFilters = () => {
    setFilters(draft)
    setShowFilters(false)
  }

  const clearFilters = () => {
    setDraft(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
    setShowFilters(false)
  }

  const removeFilter = (key: keyof GlobalFilters) => {
    setFilters((prev) => ({ ...prev, [key]: '' }))
    setDraft((prev) => ({ ...prev, [key]: '' }))
  }

  const activeFilterEntries = useMemo(() => {
    const entries: { key: keyof GlobalFilters; label: string; value: string }[] = []
    if (filters.severity) entries.push({ key: 'severity', label: 'Severity', value: filters.severity })
    if (filters.signalType) entries.push({ key: 'signalType', label: 'Type', value: filters.signalType })
    if (filters.industry) entries.push({ key: 'industry', label: 'Industry', value: filters.industry })
    if (filters.company) entries.push({ key: 'company', label: 'Company', value: filters.company })
    if (filters.dateFrom) entries.push({ key: 'dateFrom', label: 'From', value: filters.dateFrom })
    if (filters.dateTo) entries.push({ key: 'dateTo', label: 'To', value: filters.dateTo })
    return entries
  }, [filters])

  return (
    <div className="min-h-screen">
      <HeaderBar
        lastUpdated={lastUpdated}
        refreshing={analyzing}
        refreshDisabled={analyzing || phase !== 'dashboard'}
        onRefresh={handleRefresh}
        onToggleFilters={openFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        companies={data ? data.companies : []}
        onSelectCompany={handleSelectCompany}
      />

      {phase === 'boot' ? (
        <main className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="ds-card flex items-center gap-3 px-8 py-6">
            <span className="ds-spinner" />
            <span className="text-sm font-medium">Loading saved company list...</span>
          </div>
        </main>
      ) : null}

      {phase === 'upload' ? <UploadClient email={email} onSaved={handleUploadSaved} /> : null}

      {phase === 'dashboard' ? (
        <main className="mx-auto max-w-[1520px] px-6 pb-16 pt-4">
          {showFilters && data ? (
            <div className="ds-card mb-4 p-4">
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                <label className="flex flex-col gap-1 text-xs font-medium">
                  Severity
                  <select className="ds-input" value={draft.severity} onChange={(e) => setDraft({ ...draft, severity: e.target.value })}>
                    <option value="">All</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium">
                  Signal Type
                  <select className="ds-input" value={draft.signalType} onChange={(e) => setDraft({ ...draft, signalType: e.target.value })}>
                    <option value="">All</option>
                    {data.signalAnalytics.byType.map((t) => (
                      <option key={t.label} value={t.label}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium">
                  Industry
                  <select className="ds-input" value={draft.industry} onChange={(e) => setDraft({ ...draft, industry: e.target.value })}>
                    <option value="">All</option>
                    {data.signalAnalytics.byIndustry.map((i) => (
                      <option key={i.industry} value={i.industry}>
                        {i.industry}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium">
                  Company
                  <select className="ds-input" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })}>
                    <option value="">All</option>
                    {data.companies.map((c, idx) => (
                      <option key={`${c.companyName}-${idx}`} value={c.companyName}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium">
                  From
                  <input type="date" className="ds-input" value={draft.dateFrom} onChange={(e) => setDraft({ ...draft, dateFrom: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium">
                  To
                  <input type="date" className="ds-input" value={draft.dateTo} onChange={(e) => setDraft({ ...draft, dateTo: e.target.value })} />
                </label>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="ds-btn ds-btn-secondary" onClick={clearFilters}>
                  Clear Filters
                </button>
                <button type="button" className="ds-btn ds-btn-primary" onClick={applyFilters}>
                  Apply
                </button>
              </div>
            </div>
          ) : null}

          {activeFilterEntries.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {activeFilterEntries.map((entry) => (
                <button key={entry.key} type="button" className="ds-chip" onClick={() => removeFilter(entry.key)}>
                  {entry.label}: {entry.value} ✕
                </button>
              ))}
            </div>
          ) : null}

          {analyzing && data ? (
            <div className="mb-4 flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: 'var(--ds-brand-surface)', color: 'var(--ds-text-link)' }}>
              <span className="ds-spinner" />
              <span className="text-sm font-medium">Refreshing analysis...</span>
            </div>
          ) : null}

          {error ? (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg px-4 py-3" style={{ background: 'var(--ds-status-error-surface)', color: 'var(--ds-status-error-text)' }}>
              <span className="text-sm font-medium">{error}</span>
              <button
                type="button"
                className="ds-btn ds-btn-secondary ds-btn-sm ml-auto"
                onClick={() => {
                  if (data) {
                    void runAnalysis()
                  } else {
                    void boot()
                  }
                }}
              >
                Retry
              </button>
            </div>
          ) : null}

          {analyzing && !data ? (
            <div className="ds-card flex min-h-[40vh] flex-col items-center justify-center gap-3 p-10 text-center">
              <span className="ds-spinner" />
              <p className="text-base font-semibold">Analyzing company signals...</p>
              <p className="text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>This can take a few minutes. Please keep this page open.</p>
            </div>
          ) : null}

          {data ? (
            <>
              <div className="mb-4 flex flex-wrap gap-1 border-b" style={{ borderColor: 'var(--ds-border-default)' }}>
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`ds-tab ${activeTab === tab.key ? 'ds-tab-active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {activeTab === 'overview' ? <OverviewTab data={data} filters={filters} searchQuery={searchQuery} /> : null}
              {activeTab === 'trends' ? (
                <TrendsTab data={data} onApplyTypeFilter={handleApplyTypeFilter} onSelectCompany={handleSelectCompany} />
              ) : null}
              {activeTab === 'signals' ? <SignalsTab data={data} filters={filters} searchQuery={searchQuery} /> : null}
              {activeTab === 'companies' ? (
                <CompaniesTab
                  companies={data.companies}
                  filters={filters}
                  search={companiesSearch}
                  onSearchChange={setCompaniesSearch}
                  expanded={expandedCompany}
                  onToggleExpand={setExpandedCompany}
                />
              ) : null}
            </>
          ) : null}
        </main>
      ) : null}
    </div>
  )
}
