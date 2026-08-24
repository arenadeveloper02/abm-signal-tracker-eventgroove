"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DashboardData, GlobalFilters } from '@/lib/types'
import { extractCompanyList, extractDashboardContent, safeParseDashboard, uniqueCompanyRows } from '@/lib/utils'
import { recordActivityEvent } from '@/lib/actions'
import { useArenaEmailId } from '@/components/arena-email-provider'
import HeaderBar from '@/components/HeaderBar'
import ChatFloater from '@/components/ChatFloater'
import UploadClient from '@/components/UploadClient'
import ManageCompaniesClient from '@/components/ManageCompaniesClient'
import LoadingOverlay from '@/components/LoadingOverlay'
import OverviewTab from '@/components/OverviewTab'
import TrendsTab from '@/components/TrendsTab'
import SignalsTab from '@/components/SignalsTab'
import CompaniesTab from '@/components/CompaniesTab'

type TabKey = 'overview' | 'trends' | 'signals' | 'companies'
type Phase = 'boot' | 'upload' | 'dashboard' | 'manage'

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
  const [savedCompanies, setSavedCompanies] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [filters, setFilters] = useState<GlobalFilters>(EMPTY_FILTERS)
  const [companiesSearch, setCompaniesSearch] = useState('')
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null)
  const analysisRef = useRef(false)
  const refreshRef = useRef(false)
  const bootedRef = useRef(false)

  const applyListResponse = useCallback((listResp: unknown): { names: string[]; parsed: DashboardData | null } => {
    const list = extractCompanyList(listResp)
    const content = extractDashboardContent(listResp)
    const parsed = content ? safeParseDashboard(content) : null
    const names = uniqueCompanyRows(
      list.length > 0
        ? list
        : parsed
          ? parsed.companies.map((c) => c.companyName).filter((n) => n.trim() !== '')
          : []
    )
    setSavedCompanies(names)
    if (parsed) {
      setData(parsed)
      setLastUpdated(parsed.generatedAt || new Date().toISOString())
    }
    return { names, parsed }
  }, [])

  const fetchList = useCallback(async (): Promise<unknown> => {
    const res = await fetch('/api/company-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) throw new Error('Failed to retrieve the saved company list')
    return res.json()
  }, [email])

  const runAnalysis = useCallback(
    async (rowId?: string): Promise<void> => {
      if (analysisRef.current) return
      analysisRef.current = true
      setAnalyzing(true)
      setError(null)
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, id: rowId ?? '' }),
        })
        if (!res.ok) throw new Error('Analysis request failed')
        await res.json()
        const listResp = await fetchList()
        const { parsed } = applyListResponse(listResp)
        if (!parsed) throw new Error('No dashboard output was returned after analysis')
        setPhase('dashboard')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Analysis failed')
      } finally {
        setAnalyzing(false)
        analysisRef.current = false
      }
    },
    [email, fetchList, applyListResponse]
  )

  const refreshDashboard = useCallback(async (): Promise<void> => {
    if (refreshRef.current) return
    refreshRef.current = true
    setRefreshing(true)
    setError(null)
    try {
      const listResp = await fetchList()
      const { names, parsed } = applyListResponse(listResp)
      if (!parsed && names.length === 0) throw new Error('No saved dashboard output was found for this account')
      setPhase('dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh the dashboard')
    } finally {
      setRefreshing(false)
      refreshRef.current = false
    }
  }, [fetchList, applyListResponse])

  const boot = useCallback(async (): Promise<void> => {
    setError(null)
    setPhase('boot')
    try {
      const listResp = await fetchList()
      const { names, parsed } = applyListResponse(listResp)
      if (parsed || names.length > 0) {
        setPhase('dashboard')
      } else {
        setPhase('upload')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load the company list')
      setPhase('dashboard')
    }
  }, [fetchList, applyListResponse])

  useEffect(() => {
    if (!email || bootedRef.current) return
    bootedRef.current = true
    void boot()
  }, [email, boot])

  const handleRefresh = useCallback(() => {
    void recordActivityEvent(email, 'refresh_dashboard')
    void refreshDashboard()
  }, [email, refreshDashboard])

  const handleUploadSaved = useCallback(
    (rowId: string) => {
      void recordActivityEvent(email, 'companies_uploaded', rowId || undefined)
      setPhase('dashboard')
      void runAnalysis(rowId)
    },
    [email, runAnalysis]
  )

  const handleSelectCompany = useCallback((name: string) => {
    setActiveTab('companies')
    setCompaniesSearch(name)
    setExpandedCompany(name)
  }, [])

  const handleApplyTypeFilter = useCallback((label: string) => {
    setFilters((prev) => ({ ...prev, signalType: label }))
    setActiveTab('signals')
  }, [])

  const importList = useMemo(() => {
    if (savedCompanies.length > 0) return uniqueCompanyRows(savedCompanies)
    if (!data) return []
    return uniqueCompanyRows(data.companies.map((c) => c.companyName).filter((n) => n.trim() !== ''))
  }, [savedCompanies, data])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <HeaderBar
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        refreshDisabled={refreshing || analyzing || phase !== 'dashboard' || !data}
        onRefresh={handleRefresh}
        showImport={importList.length > 0 && Boolean(data)}
        importMode={phase === 'manage'}
        onImport={() => setPhase('manage')}
        onBackToDashboard={() => setPhase('dashboard')}
      />

      {analyzing ? (
        <LoadingOverlay message="Analyzing companies... this may take a moment. Grab a cup of coffee and relax." />
      ) : refreshing ? (
        <LoadingOverlay message="Refreshing dashboard..." />
      ) : null}

      {phase === 'boot' ? (
        <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-6">
          <div className="ds-card flex items-center gap-3 px-8 py-6">
            <span className="ds-spinner" />
            <span className="text-sm font-medium">Loading saved company list...</span>
          </div>
        </main>
      ) : null}

      {phase === 'upload' ? (
        <div className="ds-scroll min-h-0 flex-1 overflow-y-auto">
          <UploadClient email={email} onSaved={handleUploadSaved} />
        </div>
      ) : null}

      {phase === 'manage' ? (
        <div className="ds-scroll min-h-0 flex-1 overflow-y-auto">
          <main className="mx-auto max-w-4xl px-6 py-10">
            <ManageCompaniesClient email={email} savedCompanies={importList} onSaved={handleUploadSaved} />
          </main>
        </div>
      ) : null}

      {phase === 'dashboard' ? (
        <main className="mx-auto flex min-h-0 w-full max-w-[1520px] flex-1 flex-col overflow-hidden px-6 pt-4">
          {error ? (
            <div className="mb-4 flex shrink-0 flex-wrap items-center gap-3 rounded-lg px-4 py-3" style={{ background: 'var(--ds-status-error-surface)', color: 'var(--ds-status-error-text)' }}>
              <span className="text-sm font-medium">{error}</span>
              <button type="button" className="ds-btn ds-btn-primary ds-btn-sm" onClick={() => void refreshDashboard()} disabled={refreshing || analyzing}>
                {refreshing ? (
                  <>
                    <span className="ds-spinner ds-spinner-sm" />
                    Retrying...
                  </>
                ) : (
                  'Retry'
                )}
              </button>
            </div>
          ) : null}

          {data ? (
            <>
              <nav className="mb-4 flex shrink-0 flex-wrap border-b" style={{ borderColor: 'var(--ds-border-default)' }}>
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
              </nav>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {activeTab === 'overview' ? (
                  <div className="ds-scroll min-h-0 flex-1 overflow-y-auto pb-16">
                    <OverviewTab
                      data={data}
                      companyCount={Math.max(savedCompanies.length, data.companies.length)}
                      onSelectCompany={handleSelectCompany}
                      onApplyTypeFilter={handleApplyTypeFilter}
                    />
                  </div>
                ) : null}
                {activeTab === 'trends' ? (
                  <div className="ds-scroll min-h-0 flex-1 overflow-y-auto pb-16">
                    <TrendsTab data={data} onApplyTypeFilter={handleApplyTypeFilter} />
                  </div>
                ) : null}
                {activeTab === 'signals' ? (
                  <div className="ds-scroll min-h-0 flex-1 overflow-y-auto pb-16">
                    <SignalsTab signals={data.signals} filters={filters} onSelectCompany={handleSelectCompany} />
                  </div>
                ) : null}
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
              </div>
            </>
          ) : null}

          {!data && !analyzing && !refreshing && !error ? (
            <div className="ds-card mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 p-10 text-center">
              <span className="ds-spinner" />
              <p className="text-sm font-medium" style={{ color: 'var(--ds-text-primary)' }}>
                Analysis is running in the background.
              </p>
              <p className="text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
                Huge volumes of signals are being tracked, so this can take a little while. Insights will appear here as soon as the first results are ready.
              </p>
            </div>
          ) : null}
        </main>
      ) : null}

      <ChatFloater />
    </div>
  )
}
