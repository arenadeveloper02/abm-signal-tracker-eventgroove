"use client"

import type { SignalRecord } from '@/lib/types'
import { formatDate, formatRelative, getInitials } from '@/lib/utils'

interface SignalItemProps {
  signal: SignalRecord
  detailed?: boolean
}

export default function SignalItem({ signal, detailed = false }: SignalItemProps) {
  const websiteUrl = signal.source && signal.source.url ? signal.source.url : ''

  const openWebsite = () => {
    if (websiteUrl) window.open(websiteUrl, '_blank', 'noopener,noreferrer')
  }
  const openEmail = () => {
    const subject = encodeURIComponent(`Regarding ${signal.companyName}: ${signal.title}`.trim())
    window.open(`mailto:?subject=${subject}`, '_self')
  }
  const openResearch = () => {
    const q = encodeURIComponent(`${signal.companyName} ${signal.typeLabel}`.trim())
    window.open(`https://www.google.com/search?q=${q}`, '_blank', 'noopener,noreferrer')
  }

  const severityClass =
    signal.severity === 'HIGH' ? 'ds-badge-high' : signal.severity === 'MEDIUM' ? 'ds-badge-medium' : 'ds-badge-low'

  return (
    <div className="ds-card p-4">
      <div className="flex items-start gap-3">
        <div className="ds-avatar" aria-hidden="true">{getInitials(signal.companyName)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold">{signal.companyName || 'Unknown company'}</span>
            {signal.typeLabel ? <span className="ds-badge ds-badge-info">{signal.typeLabel}</span> : null}
          </div>
          <p className="mt-1 text-sm font-medium">{signal.title || signal.summary || 'No title available'}</p>
          {detailed && signal.summary ? (
            <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>{signal.summary}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
            <span className={`ds-badge ${severityClass}`}>{signal.severity}</span>
            {signal.date ? <span>{formatRelative(signal.date)}</span> : null}
            {detailed && signal.date ? <span>· {formatDate(signal.date)}</span> : null}
            {detailed && signal.source && signal.source.name ? <span>· {signal.source.name}</span> : null}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="ds-btn ds-btn-secondary ds-btn-sm" onClick={openWebsite} disabled={!websiteUrl}>
          Website
        </button>
        <button type="button" className="ds-btn ds-btn-secondary ds-btn-sm" onClick={openEmail}>
          Email
        </button>
        <button type="button" className="ds-btn ds-btn-secondary ds-btn-sm" onClick={openResearch}>
          Research
        </button>
      </div>
    </div>
  )
}
