"use client"

import { useMemo, useState } from 'react'
import type { EChartsOption } from 'echarts'
import type { DashboardData, GlobalFilters } from '@/lib/types'
import { exportCsv, filterSignals } from '@/lib/utils'
import EChart from '@/components/EChart'
import SignalItem from '@/components/SignalItem'

interface SignalsTabProps {
  data: DashboardData
  filters: GlobalFilters
  searchQuery: string
}

export default function SignalsTab({ data, filters, searchQuery }: SignalsTabProps) {
  const [severityFilter, setSeverityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const sev = data.summary.severity

  const filtered = useMemo(() => {
    let list = filterSignals(data.signals, filters, searchQuery)
    if (severityFilter) list = list.filter((s) => s.severity.toUpperCase() === severityFilter)
    if (typeFilter) list = list.filter((s) => s.typeLabel === typeFilter || s.type === typeFilter)
    return list
  }, [data.signals, filters, searchQuery, severityFilter, typeFilter])

  const severityOption = useMemo<EChartsOption>(
    () => ({
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['55%', '80%'],
          label: { show: false },
          data: [
            { name: 'High', value: sev.high, itemStyle: { color: '#F31A1A' } },
            { name: 'Medium', value: sev.medium, itemStyle: { color: '#FB8145' } },
            { name: 'Low', value: sev.low, itemStyle: { color: '#3BC884' } },
          ],
        },
      ],
    }),
    [sev.high, sev.medium, sev.low]
  )

  const typeRows = useMemo(
    () => [...data.signalAnalytics.byType].sort((a, b) => b.count - a.count),
    [data.signalAnalytics.byType]
  )
  const maxTypeCount = typeRows.reduce((max, t) => Math.max(max, t.count), 1)

  const handleExport = () => {
    exportCsv(
      'abm-signals.csv',
      ['Company', 'Signal Type', 'Severity', 'Title', 'Summary', 'Signal Date', 'Industry', 'Location', 'Source Name', 'Source URL'],
      filtered.map((s) => [
        s.companyName,
        s.typeLabel || s.type,
        s.severity,
        s.title,
        s.summary,
        s.date,
        s.industry,
        s.location,
        s.source ? s.source.name : '',
        s.source ? s.source.url : '',
      ])
    )
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-base font-semibold">All Signals</h3>
        <span className="ds-badge ds-badge-info">{data.summary.totalSignals}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select className="ds-input" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="">All severities</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
          <select className="ds-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All signal types</option>
            {typeRows.map((t) => (
              <option key={t.label} value={t.label}>
                {t.label}
              </option>
            ))}
          </select>
          <button type="button" className="ds-btn ds-btn-secondary" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="ds-card p-4">
          <h4 className="text-sm font-semibold">Severity Mix</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <EChart option={severityOption} height={180} />
            </div>
            <div className="grid gap-2 text-sm">
              <p><span className="ds-badge ds-badge-high">HIGH</span> {sev.high}</p>
              <p><span className="ds-badge ds-badge-medium">MEDIUM</span> {sev.medium}</p>
              <p><span className="ds-badge ds-badge-low">LOW</span> {sev.low}</p>
            </div>
          </div>
        </section>

        <section className="ds-card p-4">
          <h4 className="text-sm font-semibold">Signal Types</h4>
          <div className="ds-scroll mt-3 grid max-h-52 content-start gap-2 overflow-y-auto pr-1">
            {typeRows.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>No signal type data available.</p>
            ) : (
              typeRows.map((t) => (
                <div key={t.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{t.label}</span>
                    <span style={{ color: 'var(--ds-text-tertiary)' }}>{t.count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full" style={{ background: 'var(--ds-surface-subtle)' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${Math.round((t.count / maxTypeCount) * 100)}%`, background: '#1A73E8' }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="ds-card p-4">
          <h4 className="text-sm font-semibold">At a Glance</h4>
          <ul className="mt-3 grid gap-3">
            <li>
              <p className="text-2xl font-semibold">{data.summary.totalSignals}</p>
              <p className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>total signals</p>
            </li>
            <li>
              <p className="text-2xl font-semibold">{data.summary.signalsLast7Days}</p>
              <p className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>in the last 7 days</p>
            </li>
            <li>
              <p className="text-2xl font-semibold">{data.summary.companiesWithSignals}</p>
              <p className="text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>companies with signals</p>
            </li>
          </ul>
        </section>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.length === 0 ? (
          <p className="col-span-full py-10 text-center text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>
            No signals found for the current company list.
          </p>
        ) : (
          filtered.map((sig) => <SignalItem key={sig.id} signal={sig} detailed />)
        )}
      </div>
    </div>
  )
}
