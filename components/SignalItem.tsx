"use client"

import type { SignalRecord } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface SignalItemProps {
  signal: SignalRecord
  onSelectCompany: (name: string) => void
}

function severityAccent(severity: string): { bar: string; surface: string } {
  const value = severity.toUpperCase()
  if (value === 'HIGH') return { bar: '#F31A1A', surface: '#FFF8F8' }
  if (value === 'MEDIUM') return { bar: '#FB8145', surface: '#FFF9F5' }
  return { bar: '#3BC884', surface: '#F5FCF9' }
}

function typeStyle(label: string, type: string): { color: string; background: string } {
  const key = `${label} ${type}`.toLowerCase()
  if (key.includes('merger') || key.includes('acquisition') || key.includes('m&a')) {
    return { color: '#C96737', background: '#FDFCF3' }
  }
  if (key.includes('c-suite') || key.includes('csuite') || key.includes('leadership') || key.includes('executive')) {
    return { color: '#C64272', background: '#FFF7F9' }
  }
  if (key.includes('fund')) {
    return { color: '#2FA06A', background: '#F5FCF9' }
  }
  if (key.includes('partner')) {
    return { color: '#8F50AC', background: '#FBF7FD' }
  }
  if (key.includes('product') || key.includes('launch')) {
    return { color: '#155CBA', background: '#F3F8FE' }
  }
  if (key.includes('hiring') || key.includes('hire') || key.includes('talent')) {
    return { color: '#C96737', background: '#FFF9F5' }
  }
  if (key.includes('ipo')) {
    return { color: '#86770B', background: '#FDFCF3' }
  }
  if (key.includes('news')) {
    return { color: '#0086AB', background: '#F2FBFD' }
  }
  return { color: '#575A66', background: '#F7F8F9' }
}

export default function SignalItem({ signal, onSelectCompany }: SignalItemProps) {
  const severityClass =
    signal.severity === 'HIGH' ? 'ds-badge-high' : signal.severity === 'MEDIUM' ? 'ds-badge-medium' : 'ds-badge-low'
  const accent = severityAccent(signal.severity)
  const typeColors = typeStyle(signal.typeLabel, signal.type)
  const sourceName = signal.source?.name?.trim() || 'Source'
  const showSourceLabel = sourceName.toLowerCase() !== (signal.companyName || '').trim().toLowerCase()

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{ background: accent.surface, borderColor: 'var(--ds-border-default)', borderLeft: `3px solid ${accent.bar}` }}
    >
      <div className="px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`ds-badge ${severityClass}`}>{signal.severity}</span>
          {signal.typeLabel ? (
            <span
              className="ds-badge"
              style={{ color: typeColors.color, background: typeColors.background, border: `1px solid ${typeColors.color}33` }}
            >
              {signal.typeLabel}
            </span>
          ) : null}
          <span className="ml-auto text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
            {signal.date ? formatDate(signal.date) : ''}
          </span>
        </div>

        <button
          type="button"
          className="mt-2 text-left text-sm font-semibold hover:underline"
          style={{ color: 'var(--ds-text-link)' }}
          onClick={() => onSelectCompany(signal.companyName)}
        >
          {signal.companyName || '—'}
        </button>

        <p className="mt-1 text-sm font-medium" style={{ color: 'var(--ds-text-primary)' }}>{signal.title || '—'}</p>
        {signal.summary ? (
          <p className="mt-1 text-sm leading-5" style={{ color: 'var(--ds-text-secondary)' }}>{signal.summary}</p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {signal.industry ? (
            <span className="ds-badge ds-badge-neutral">{signal.industry}</span>
          ) : null}
          {signal.location ? (
            <span style={{ color: 'var(--ds-text-tertiary)' }}>{signal.location}</span>
          ) : null}
          {signal.source && signal.source.url ? (
            <a
              href={signal.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: 'var(--ds-text-link)' }}
            >
              {showSourceLabel ? sourceName : 'Source'}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
