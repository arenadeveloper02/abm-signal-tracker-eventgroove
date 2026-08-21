"use client"

import { Fragment, useMemo } from 'react'
import type { CompanyRecord, GlobalFilters } from '@/lib/types'
import { exportCsv, formatRelative, getInitials } from '@/lib/utils'

interface CompaniesTabProps {
  companies: CompanyRecord[]
  filters: GlobalFilters
  search: string
  onSearchChange: (value: string) => void
  expanded: string | null
  onToggleExpand: (name: string | null) => void
}

export default function CompaniesTab({ companies, filters, search, onSearchChange, expanded, onToggleExpand }: CompaniesTabProps) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return companies
      .filter((c) => {
        if (filters.industry && c.industry !== filters.industry) return false
        if (filters.company && c.companyName !== filters.company) return false
        if (!q) return true
        return (
          c.companyName.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => b.signalCount - a.signalCount)
  }, [companies, filters, search])

  const handleExport = () => {
    exportCsv(
      'abm-companies.csv',
      ['Company', 'Domain', 'Industry', 'Location', 'Employees', 'Revenue', 'Funding Stage', 'Last Signal', 'Signals'],
      filtered.map((c) => [
        c.companyName,
        c.domain,
        c.industry,
        c.location,
        c.employeeCount,
        c.revenue,
        c.fundingStage,
        c.lastSignalType,
        String(c.signalCount),
      ])
    )
  }

  const severityClass = (severity: string) =>
    severity === 'HIGH' ? 'ds-badge-high' : severity === 'MEDIUM' ? 'ds-badge-medium' : 'ds-badge-low'

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 pb-4">
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <input
          type="text"
          className="ds-input w-72"
          placeholder="Search name, domain, industry..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
          {filtered.length} of {companies.length} companies
        </span>
        <button type="button" className="ds-btn ds-btn-primary ml-auto" onClick={handleExport}>
          Export CSV
        </button>
      </div>

      {companies.length === 0 ? (
        <div className="ds-card p-10 text-center text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>
          No analyzed company records are available yet.
        </div>
      ) : (
        <div className="ds-card ds-scroll min-h-0 flex-1 overflow-auto">
          <table className="ds-table w-full min-w-[960px]">
            <thead>
              <tr>
                <th>#</th>
                <th>Company</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Employees</th>
                <th>Revenue</th>
                <th>Funding Stage</th>
                <th>Last Signal</th>
                <th>Signals</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center" style={{ color: 'var(--ds-text-tertiary)' }}>
                    No companies match the current search.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => {
                  const websiteUrl = c.website || (c.domain ? `https://${c.domain}` : '')
                  const isExpanded = expanded === c.companyName
                  return (
                    <Fragment key={`${c.companyName}-${idx}`}>
                      <tr
                        className="cursor-pointer"
                        style={isExpanded ? { background: 'var(--ds-interactive-selected)' } : undefined}
                        onClick={() => onToggleExpand(isExpanded ? null : c.companyName)}
                      >
                        <td>{idx + 1}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="ds-avatar">{getInitials(c.companyName)}</span>
                            <span>
                              <span className="block font-medium">{c.companyName || '—'}</span>
                              {c.domain ? (
                                <span className="block text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>{c.domain}</span>
                              ) : null}
                            </span>
                          </div>
                        </td>
                        <td>{c.industry || '—'}</td>
                        <td>{c.location || '—'}</td>
                        <td>{c.employeeCount || '—'}</td>
                        <td>{c.revenue || '—'}</td>
                        <td>{c.fundingStage || '—'}</td>
                        <td>{c.lastSignalType ? <span className="ds-badge ds-badge-neutral">{c.lastSignalType}</span> : '—'}</td>
                        <td>
                          <span className="ds-badge ds-badge-info">{c.signalCount}</span>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className="ds-btn ds-btn-secondary ds-btn-sm"
                              disabled={!websiteUrl}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (websiteUrl) window.open(websiteUrl, '_blank', 'noopener,noreferrer')
                              }}
                            >
                              Website
                            </button>
                            <button
                              type="button"
                              className="ds-btn ds-btn-secondary ds-btn-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(`https://www.google.com/search?q=${encodeURIComponent(c.companyName)}`, '_blank', 'noopener,noreferrer')
                              }}
                            >
                              Search
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr>
                          <td colSpan={10} style={{ background: 'var(--ds-surface-subtle)' }}>
                            <div className="grid gap-4 p-4 lg:grid-cols-2">
                              <div>
                                <h4 className="text-sm font-semibold">Signal History</h4>
                                {c.signalHistory.length === 0 ? (
                                  <p className="mt-2 text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>—</p>
                                ) : (
                                  <div className="ds-scroll mt-2 max-h-64 overflow-y-auto pr-1">
                                    {c.signalHistory.map((h, hIdx) => (
                                      <div key={hIdx} className="flex items-start gap-2 border-b py-2" style={{ borderColor: 'var(--ds-border-default)' }}>
                                        <span className={`ds-badge ${severityClass(h.severity)}`}>{h.severity}</span>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-xs font-medium" style={{ color: 'var(--ds-text-secondary)' }}>{h.typeLabel || '—'}</p>
                                          <p className="text-sm">{h.title || '—'}</p>
                                          {h.date ? (
                                            <p className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>{formatRelative(h.date)}</p>
                                          ) : null}
                                        </div>
                                        {h.source && h.source.url ? (
                                          <a
                                            href={h.source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-medium"
                                            style={{ color: 'var(--ds-text-link)' }}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            Source
                                          </a>
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold">Tech Stack</h4>
                                {c.techStack.length === 0 ? (
                                  <p className="mt-2 text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>—</p>
                                ) : (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {c.techStack.map((t) => (
                                      <span key={t} className="ds-chip">{t}</span>
                                    ))}
                                  </div>
                                )}
                                <h4 className="mt-4 text-sm font-semibold">Keywords</h4>
                                {c.keywords.length === 0 ? (
                                  <p className="mt-2 text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>—</p>
                                ) : (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {c.keywords.map((k) => (
                                      <span key={k} className="ds-chip">{k}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
