"use client"

import { useMemo } from 'react'
import type { GlobalFilters, SignalRecord } from '@/lib/types'
import { exportCsv, filterSignals } from '@/lib/utils'
import SignalItem from '@/components/SignalItem'

interface SignalsTabProps {
  signals: SignalRecord[]
  filters: GlobalFilters
  search: string
  onSelectCompany: (name: string) => void
}

export default function SignalsTab({ signals, filters, search, onSelectCompany }: SignalsTabProps) {
  const filtered = useMemo(() => {
    const list = filterSignals(signals, filters, search)
    return list.slice().sort((a, b) => {
      const ta = new Date(a.date).getTime()
      const tb = new Date(b.date).getTime()
      return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta)
    })
  }, [signals, filters, search])

  const handleExport = () => {
    exportCsv(
      'abm-signals.csv',
      ['Company', 'Type', 'Title', 'Summary', 'Severity', 'Date', 'Industry', 'Location', 'Source'],
      filtered.map((s) => [
        s.companyName,
        s.typeLabel,
        s.title,
        s.summary,
        s.severity,
        s.date,
        s.industry,
        s.location,
        s.source ? s.source.url : '',
      ])
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm" style={{ color: 'var(--ds-text-secondary)' }}>
          {filtered.length} of {signals.length} signals
        </span>
        <button type="button" className="ds-btn ds-btn-secondary ml-auto" onClick={handleExport}>
          Export CSV
        </button>
      </div>
      {filtered.length === 0 ? (
        <div className="ds-card p-10 text-center text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>
          No signals match the current filters.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((sig) => (
            <SignalItem key={sig.id} signal={sig} onSelectCompany={onSelectCompany} />
          ))}
        </div>
      )}
    </div>
  )
}
