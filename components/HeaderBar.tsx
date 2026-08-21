"use client"

import { formatDateTime, formatRelative } from '@/lib/utils'

interface HeaderBarProps {
  lastUpdated: string | null
  refreshing: boolean
  refreshDisabled: boolean
  onRefresh: () => void
  showImport: boolean
  importMode: boolean
  onImport: () => void
  onBackToDashboard: () => void
}

export default function HeaderBar({
  lastUpdated,
  refreshing,
  refreshDisabled,
  onRefresh,
  showImport,
  importMode,
  onImport,
  onBackToDashboard,
}: HeaderBarProps) {
  return (
    <header className="z-20 shrink-0 border-b" style={{ background: 'var(--ds-surface-page)', borderColor: 'var(--ds-border-default)' }}>
      <div className="mx-auto flex max-w-[1520px] flex-wrap items-center gap-3 px-6 py-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">Account Signal Tracker</h1>
          {lastUpdated ? (
            <p className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>
              Last updated: {formatDateTime(lastUpdated)} · Updated {formatRelative(lastUpdated)}
            </p>
          ) : (
            <p className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>No analysis loaded yet</p>
          )}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {importMode ? (
            <button type="button" className="ds-btn ds-btn-primary" onClick={onBackToDashboard}>
              Back to Dashboard
            </button>
          ) : showImport ? (
            <button type="button" className="ds-btn ds-btn-primary" onClick={onImport}>
              Import Companies
            </button>
          ) : null}
          <button type="button" className="ds-btn ds-btn-primary" onClick={onRefresh} disabled={refreshDisabled}>
            {refreshing ? (
              <>
                <span className="ds-spinner ds-spinner-sm" />
                Refreshing...
              </>
            ) : (
              'Refresh Dashboard'
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
