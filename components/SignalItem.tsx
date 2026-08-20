"use client"

import type { SignalRecord } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface SignalItemProps {
  signal: SignalRecord
  onSelectCompany: (name: string) => void
}

export default function SignalItem({ signal, onSelectCompany }: SignalItemProps) {
  const severityClass =
    signal.severity === 'HIGH' ? 'ds-badge-high' : signal.severity === 'MEDIUM' ? 'ds-badge-medium' : 'ds-badge-low'
  return (
    <div className="ds-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`ds-badge ${severityClass}`}>{signal.severity}</span>
        {signal.typeLabel ? <span className="ds-badge ds-badge-neutral">{signal.typeLabel}</span> : null}
        <button
          type="button"
          className="text-sm font-semibold hover:opacity-80"
          style={{ color: 'var(--ds-text-link)' }}
          onClick={() => onSelectCompany(signal.companyName)}
        >
          {signal.companyName || '—'}
        </button>
        <span className="ml-auto text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
          {signal.date ? formatDate(signal.date) : ''}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium">{signal.title || '—'}</p>
      {signal.summary ? (
        <p className="mt-1 text-sm" style={{ color: 'var(--ds-text-secondary)' }}>{signal.summary}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
        {signal.industry ? <span>{signal.industry}</span> : null}
        {signal.location ? <span>{signal.location}</span> : null}
        {signal.source && signal.source.url ? (
          <a
            href={signal.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium"
            style={{ color: 'var(--ds-text-link)' }}
          >
            {signal.source.name || 'Source'}
          </a>
        ) : null}
      </div>
    </div>
  )
}
