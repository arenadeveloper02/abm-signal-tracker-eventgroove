"use client"

import { useMemo, useState } from 'react'
import type { CompanyRecord } from '@/lib/types'
import { formatDateTime, formatRelative } from '@/lib/utils'
import { useArenaEmailId } from '@/components/arena-email-provider'
import UploadClient from '@/components/UploadClient'

interface HeaderBarProps {
  lastUpdated: string | null
  refreshing: boolean
  refreshDisabled: boolean
  onRefresh: () => void
  onToggleFilters: () => void
  searchQuery: string
  onSearchChange: (value: string) => void
  companies: CompanyRecord[]
  onSelectCompany: (name: string) => void
}

export default function HeaderBar({
  lastUpdated,
  refreshing,
  refreshDisabled,
  onRefresh,
  onToggleFilters,
  searchQuery,
  onSearchChange,
  companies,
  onSelectCompany,
}: HeaderBarProps) {
  const email = useArenaEmailId()
  const [focused, setFocused] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const matches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return companies
      .filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [companies, searchQuery])

  return (
    <header className="sticky top-0 z-20 border-b" style={{ background: 'var(--ds-surface-page)', borderColor: 'var(--ds-border-default)' }}>
      <div className="mx-auto flex max-w-[1520px] flex-wrap items-center gap-3 px-6 py-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">ABM Signal Tracker</h1>
          {lastUpdated ? (
            <p className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
              Last updated: {formatDateTime(lastUpdated)} · Updated {formatRelative(lastUpdated)}
            </p>
          ) : (
            <p className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>No analysis loaded yet</p>
          )}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button type="button" className="ds-btn ds-btn-secondary" onClick={() => setShowImport(true)}>
            Import Companies
          </button>
          <button type="button" className="ds-btn ds-btn-primary" onClick={onRefresh} disabled={refreshDisabled}>
            {refreshing ? 'Refreshing...' : 'Refresh Dashboard'}
          </button>
          <button type="button" className="ds-btn ds-btn-secondary" onClick={onToggleFilters}>
            Filters
          </button>
          <div className="relative">
            <input
              type="text"
              className="ds-input w-56"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {focused && matches.length > 0 ? (
              <div
                className="absolute right-0 top-11 z-30 w-72 overflow-hidden rounded-lg border"
                style={{ background: 'var(--ds-surface-page)', borderColor: 'var(--ds-border-default)', boxShadow: 'var(--ds-elevation-lg)' }}
              >
                {matches.map((c) => (
                  <button
                    key={c.companyName}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:opacity-80"
                    onMouseDown={() => onSelectCompany(c.companyName)}
                  >
                    <span className="font-medium">{c.companyName}</span>
                    <span className="ml-2 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
                      {c.industry || c.location || c.domain}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showImport ? (
        <div
          className="ds-scroll fixed inset-0 z-40 flex items-start justify-center overflow-y-auto p-4"
          style={{ background: 'rgba(44, 45, 51, 0.72)' }}
        >
          <div className="w-full max-w-4xl">
            <div className="mt-4 flex justify-end">
              <button type="button" className="ds-btn ds-btn-secondary ds-btn-sm" onClick={() => setShowImport(false)}>
                Close
              </button>
            </div>
            <UploadClient
              email={email}
              heading="Import Companies"
              description="Upload a new company list (CSV or XLSX) to replace the tracked companies. Columns such as Company Name, City, State and Country will be combined automatically."
              onSaved={() => {
                setShowImport(false)
                onRefresh()
              }}
            />
          </div>
        </div>
      ) : null}
    </header>
  )
}
