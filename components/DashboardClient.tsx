"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [savedCompanies, setSavedCompanies] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<GlobalFilters>(EMPTY_FILTERS)
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
        setSavedCompanies(extractCompanyList(listResp))
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
    },
    [email, fetchList]
  )

  const boot = useCallback(async (): Promise<void> => {
    setError(null)
    setPhase('boot')
    try {
      const listResp = await fetchList()
      const list = extractCompanyList(listResp)
      setSavedCompanies(list)
      const content = extractDashboardContent(listResp)
      if (content) {
        const parsed = safeParseDashboard(content)
        if (parsed) {
          setData(parsed)
          setLastUpdated(parsed.generatedAt || new Date().toISOString())
        }
      }
      if (content) {
        setPhase('dashboard')
      } else if (list.length > 0) {
        setPhase('dashboard')
      } else {
        setPhase('upload')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load the company list')
      setPhase('dashboard')
    }
  }, [fetchList])

  useEffect(() => {
    if (!email || bootedRef.current) return
    bootedRef.current = true
    void boot()
  }, [email, boot])

  const handleRefresh = useCallback(() => {
    void recordActivityEvent(email, 'refresh_dashboard')
    void runAnalysis()
  }, [email, runAnalysis])

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
    setSearchQuery('')
  }, [])

  const handleApplyTypeFilter = useCallback((label: string) => {
    setFilters((prev) => ({ ...prev, signalType: label }))
    setActiveTab('signals')
  }, [])

  return (
    <div className="min-h-screen">
      <HeaderBar
        lastUpdated={lastUpdated}
        refreshing={analyzing}
        refreshDisabled={analyzing || phase !== 'dashboard'}
        onRefresh={handleRefresh}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        companies={data ? data.companies : []}
        savedCompanies={savedCompanies}
        onSelectCompany={handleSelectCompany}
        onImportSaved={handleUploadSaved}
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
          {analyzing && data ? (
            <div className="mb-4 flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: 'var(--ds-brand-surface)', color: 'var(--ds-text-link)' }}>
              <span className="ds-spinner" />
              <span className="text-sm font-medium">Refreshing analysis...</span>
            </div>
          ) : null}

          {error ? (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg px-4 py-3" style={{ background: 'var(--ds-status-error-surface)', color: 'var(--ds-status-error-text)' }}>
              <span className="text-sm font-medium">{error}</span>
              <button type="button" className="ds-btn ds-btn-primary ds-btn-sm" onClick={() => void runAnalysis()} disabled={analyzing}>
                Retry
              </button>
            </div>
          ) : null}

          {analyzing && !data ? (
            <div className="ds-card flex items-center justify-center gap-3 px-8 py-16">
              <span className="ds-spinner" />
              <span className="text-sm font-medium">Analyzing companies... this may take a moment.</span>
            </div>
          ) : null}

          {data ? (
            <>
              <nav className="mb-4 flex flex-wrap border-b" style={{ borderColor: 'var(--ds-border-default)' }}>
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

              {activeTab === 'overview' ? (
                <OverviewTab data={data} onSelectCompany={handleSelectCompany} onApplyTypeFilter={handleApplyTypeFilter} />
              ) : null}
              {activeTab === 'trends' ? <TrendsTab data={data} onApplyTypeFilter={handleApplyTypeFilter} /> : null}
              {activeTab === 'signals' ? (
                <SignalsTab signals={data.signals} filters={filters} search={searchQuery} onSelectCompany={handleSelectCompany} />
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
            </>
          ) : null}

          {!data && !analyzing && !error ? (
            <div className="ds-card p-10 text-center text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>
              No dashboard data is available yet. Run an analysis to generate insights.
            </div>
          ) : null}
        </main>
      ) : null}
    </div>
  )
}
