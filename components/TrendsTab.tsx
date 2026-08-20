"use client"

import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import type { DashboardData } from '@/lib/types'
import EChart from '@/components/EChart'

interface TrendsTabProps {
  data: DashboardData
  onApplyTypeFilter: (label: string) => void
  onSelectCompany: (name: string) => void
}

export default function TrendsTab({ data, onApplyTypeFilter, onSelectCompany }: TrendsTabProps) {
  const weekly = data.trends.weekly

  const weeklyOption = useMemo<EChartsOption>(
    () => ({
      tooltip: { trigger: 'axis' },
      legend: { data: ['HIGH', 'MEDIUM', 'LOW'], bottom: 0 },
      grid: { left: 40, right: 16, top: 24, bottom: 44 },
      xAxis: { type: 'category', data: weekly.map((w) => w.label) },
      yAxis: { type: 'value' },
      series: [
        { name: 'HIGH', type: 'bar', stack: 'total', data: weekly.map((w) => w.high), itemStyle: { color: '#F31A1A' } },
        { name: 'MEDIUM', type: 'bar', stack: 'total', data: weekly.map((w) => w.medium), itemStyle: { color: '#FB8145' } },
        { name: 'LOW', type: 'bar', stack: 'total', data: weekly.map((w) => w.low), itemStyle: { color: '#3BC884' } },
      ],
    }),
    [weekly]
  )

  const categoryOption = useMemo<EChartsOption>(
    () => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 16, top: 24, bottom: 80 },
      xAxis: { type: 'category', data: data.signalAnalytics.byType.map((t) => t.label), axisLabel: { rotate: 35, fontSize: 10 } },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: data.signalAnalytics.byType.map((t) => t.count), itemStyle: { color: '#1A73E8' }, barMaxWidth: 32 }],
    }),
    [data.signalAnalytics.byType]
  )

  const topCompanies = useMemo(
    () => [...data.signalAnalytics.topCompanies].sort((a, b) => b.signalCount - a.signalCount).slice(0, 10),
    [data.signalAnalytics.topCompanies]
  )

  const companiesOption = useMemo<EChartsOption>(() => {
    const rows = [...topCompanies].reverse()
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 170, right: 24, top: 12, bottom: 28 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: rows.map((c) => c.companyName), axisLabel: { fontSize: 10 } },
      series: [{ type: 'bar', data: rows.map((c) => c.signalCount), itemStyle: { color: '#00A7D6' }, barMaxWidth: 18 }],
    }
  }, [topCompanies])

  return (
    <div className="grid gap-4">
      <section className="ds-card p-4">
        <h3 className="text-base font-semibold">Weekly Signal Trend (8 Weeks)</h3>
        {weekly.length === 0 ? (
          <p className="py-10 text-center text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>No weekly trend data available.</p>
        ) : (
          <EChart option={weeklyOption} height={300} />
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="ds-card p-4">
          <h3 className="text-base font-semibold">Signals by Category</h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>Click a bar to filter All Signals by that type.</p>
          {data.signalAnalytics.byType.length === 0 ? (
            <p className="py-10 text-center text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>No category data available.</p>
          ) : (
            <EChart option={categoryOption} height={320} onChartClick={(p) => onApplyTypeFilter(p.name)} />
          )}
        </section>
        <section className="ds-card p-4">
          <h3 className="text-base font-semibold">Top 10 Companies by Signal Count</h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>Click a company to open it in the Companies tab.</p>
          {topCompanies.length === 0 ? (
            <p className="py-10 text-center text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>No company signal data available.</p>
          ) : (
            <EChart option={companiesOption} height={320} onChartClick={(p) => onSelectCompany(p.name)} />
          )}
        </section>
      </div>
    </div>
  )
}
