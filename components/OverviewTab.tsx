"use client"

import { useMemo, useState } from 'react'
import type { EChartsOption } from 'echarts'
import type { DashboardData, GlobalFilters, SeveritySummary } from '@/lib/types'
import { CHART_COLORS, filterSignals, signalInWeek } from '@/lib/utils'
import EChart from '@/components/EChart'
import SignalItem from '@/components/SignalItem'

interface OverviewTabProps {
  data: DashboardData
  filters: GlobalFilters
  searchQuery: string
}

interface MetricCard {
  label: string
  value: number
  severity?: SeveritySummary
}

export default function OverviewTab({ data, filters, searchQuery }: OverviewTabProps) {
  const [weekFilter, setWeekFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [industryFilter, setIndustryFilter] = useState<string | null>(null)

  const s = data.summary
  const cards: MetricCard[] = [
    { label: 'Companies Tracked', value: s.companiesTracked },
    { label: 'Total Signals', value: s.totalSignals, severity: s.severity },
    { label: 'High Alerts', value: s.highAlerts },
    { label: 'C-Suite Changes', value: s.cSuiteChanges },
    { label: 'Funding', value: s.funding },
    { label: 'Mergers & Acquisitions', value: s.mergersAcquisitions },
    { label: 'IPO', value: s.ipo },
    { label: 'News Mentions', value: s.newsMentions },
    { label: 'Product Launches', value: s.productLaunches },
    { label: 'Partnerships', value: s.partnerships },
    { label: 'Creative Hiring', value: s.creativeHiring },
  ]

  const feedSignals = useMemo(() => {
    let list = filterSignals(data.signals, filters, searchQuery)
    if (weekFilter) list = list.filter((sig) => signalInWeek(sig, weekFilter))
    if (typeFilter) list = list.filter((sig) => sig.typeLabel === typeFilter || sig.type === typeFilter)
    if (industryFilter) list = list.filter((sig) => sig.industry === industryFilter)
    return list
  }, [data.signals, filters, searchQuery, weekFilter, typeFilter, industryFilter])

  const weekly = data.trends.weekly
  const weeklyOption = useMemo<EChartsOption>(
    () => ({
      tooltip: { trigger: 'axis' },
      legend: { data: ['High', 'Medium', 'Low'], bottom: 0 },
      grid: { left: 40, right: 16, top: 24, bottom: 44 },
      xAxis: { type: 'category', data: weekly.map((w) => w.label) },
      yAxis: { type: 'value' },
      series: [
        { name: 'High', type: 'bar', stack: 'total', data: weekly.map((w) => w.high), itemStyle: { color: '#F31A1A' } },
        { name: 'Medium', type: 'bar', stack: 'total', data: weekly.map((w) => w.medium), itemStyle: { color: '#FB8145' } },
        { name: 'Low', type: 'bar', stack: 'total', data: weekly.map((w) => w.low), itemStyle: { color: '#3BC884' } },
      ],
    }),
    [weekly]
  )

  const typeOption = useMemo<EChartsOption>(
    () => ({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', right: 0, top: 'middle', type: 'scroll' },
      color: CHART_COLORS,
      series: [
        {
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['32%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          data: data.signalAnalytics.byType.map((t) => ({ name: t.label, value: t.count })),
        },
      ],
    }),
    [data.signalAnalytics.byType]
  )

  const industryRows = useMemo(
    () => [...data.signalAnalytics.byIndustry].sort((a, b) => a.count - b.count),
    [data.signalAnalytics.byIndustry]
  )
  const industryOption = useMemo<EChartsOption>(
    () => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 140, right: 24, top: 12, bottom: 28 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: industryRows.map((i) => i.industry), axisLabel: { fontSize: 10 } },
      series: [{ type: 'bar', data: industryRows.map((i) => i.count), itemStyle: { color: '#1A73E8' }, barMaxWidth: 18 }],
    }),
    [industryRows]
  )

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="ds-card p-4">
            <p className="text-xs font-medium" style={{ color: 'var(--ds-text-tertiary)' }}>{card.label}</p>
            <p className="mt-1 text-2xl font-semibold">{card.value}</p>
            {card.severity ? (
              <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-secondary)' }}>
                H: {card.severity.high} · M: {card.severity.medium} · L: {card.severity.low}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="ds-card p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">Signal Feed</h3>
            <span className="ds-badge ds-badge-info">{s.totalSignals}</span>
          </div>
          <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>Showing signals from last 90 days only</p>
          {weekFilter || typeFilter || industryFilter ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {weekFilter ? (
                <button type="button" className="ds-chip" onClick={() => setWeekFilter(null)}>
                  Week: {weekFilter} ✕
                </button>
              ) : null}
              {typeFilter ? (
                <button type="button" className="ds-chip" onClick={() => setTypeFilter(null)}>
                  Type: {typeFilter} ✕
                </button>
              ) : null}
              {industryFilter ? (
                <button type="button" className="ds-chip" onClick={() => setIndustryFilter(null)}>
                  Industry: {industryFilter} ✕
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="ds-scroll mt-3 grid max-h-[860px] content-start gap-3 overflow-y-auto pr-1">
            {feedSignals.length === 0 ? (
              <p className="py-8 text-center text-sm" style={{ color: 'var(--ds-text-tertiary)' }}>
                No signals found for the current company list.
              </p>
            ) : (
              feedSignals.map((sig) => <SignalItem key={sig.id} signal={sig} />)
            )}
          </div>
        </section>

        <div className="grid content-start gap-4">
          <section className="ds-card p-4">
            <h3 className="text-base font-semibold">Weekly Signal Trend</h3>
            <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>Click a bar to filter the feed to that week.</p>
            <EChart option={weeklyOption} height={250} onChartClick={(p) => setWeekFilter(p.name)} />
          </section>
          <section className="ds-card p-4">
            <h3 className="text-base font-semibold">Signal Type Breakdown</h3>
            <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>Click a slice to filter the feed by signal type.</p>
            <EChart option={typeOption} height={250} onChartClick={(p) => setTypeFilter(p.name)} />
          </section>
          <section className="ds-card p-4">
            <h3 className="text-base font-semibold">Top Industries by Signal Count</h3>
            <p className="mt-1 text-xs" style={{ color: 'var(--ds-text-tertiary)' }}>Click an industry to filter the feed.</p>
            <EChart option={industryOption} height={280} onChartClick={(p) => setIndustryFilter(p.name)} />
          </section>
        </div>
      </div>
    </div>
  )
}
