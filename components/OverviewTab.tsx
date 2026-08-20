"use client"

import { useMemo } from 'react'
import type { DashboardData, EChartClickParams } from '@/lib/types'
import EChart from '@/components/EChart'
import SignalItem from '@/components/SignalItem'

interface OverviewTabProps {
  data: DashboardData
  onSelectCompany: (name: string) => void
  onApplyTypeFilter: (label: string) => void
}

export default function OverviewTab({ data, onSelectCompany, onApplyTypeFilter }: OverviewTabProps) {
  const s = data.summary

  const stats = useMemo(
    () => [
      { label: 'Companies Tracked', value: s.companiesTracked },
      { label: 'Total Signals', value: s.totalSignals },
      { label: 'High Alerts', value: s.highAlerts },
      { label: 'Signals (Last 7 Days)', value: s.signalsLast7Days },
      { label: 'Companies With Signals', value: s.companiesWithSignals },
      { label: 'C-Suite Changes', value: s.cSuiteChanges },
      { label: 'Funding Events', value: s.funding },
      { label: 'Mergers & Acquisitions', value: s.mergersAcquisitions },
    ],
    [s]
  )

  const severityOption = useMemo(
    () => ({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: true,
          label: { show: false },
          data: [
            { name: 'HIGH', value: s.severity.high, itemStyle: { color: '#F31A1A' } },
            { name: 'MEDIUM', value: s.severity.medium, itemStyle: { color: '#FB8145' } },
            { name: 'LOW', value: s.severity.low, itemStyle: { color: '#3BC884' } },
          ],
        },
      ],
    }),
    [s]
  )

  const typeOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 8, right: 8, top: 16, bottom: 8, containLabel: true },
      xAxis: { type: 'category', data: data.signalAnalytics.byType.map((t) => t.label), axisLabel: { rotate: 30, color: '#575A66' } },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: data.signalAnalytics.byType.map((t) => t.count), itemStyle: { color: '#1A73E8' }, barMaxWidth: 32 }],
    }),
    [data.signalAnalytics.byType]
  )

  const highSignals = useMemo(() => data.signals.filter((sig) => sig.severity === 'HIGH').slice(0, 5), [data.signals])

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label} className="ds-card p-4">
            <p className="text-xs font-medium" style={{ color: 'var(--ds-text-tertiary)' }}>{st.label}</p>
            <p className="mt-1 text-2xl font-semibold">{st.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold">Severity Distribution</h3>
          <EChart option={severityOption} height={260} />
        </div>
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold">Signals by Type</h3>
          <EChart option={typeOption} height={260} onClickItem={(p: EChartClickParams) => onApplyTypeFilter(p.name)} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold">Top Companies by Signals</h3>
          {data.signalAnalytics.topCompanies.length === 0 ? (
            <p className="mt-2 text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>—</p>
          ) : (
            <div className="mt-2">
              {data.signalAnalytics.topCompanies.map((c, idx) => (
                <button
                  key={`${c.companyName}-${idx}`}
                  type="button"
                  className="flex w-full items-center justify-between border-b py-2 text-left text-sm hover:opacity-80"
                  style={{ borderColor: 'var(--ds-border-default)' }}
                  onClick={() => onSelectCompany(c.companyName)}
                >
                  <span className="font-medium">{c.companyName}</span>
                  <span className="ds-badge ds-badge-info">{c.signalCount}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold">Recent High Severity Signals</h3>
          {highSignals.length === 0 ? (
            <p className="mt-2 text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>No high severity signals.</p>
          ) : (
            <div className="mt-2 grid gap-3">
              {highSignals.map((sig) => (
                <SignalItem key={sig.id} signal={sig} onSelectCompany={onSelectCompany} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
