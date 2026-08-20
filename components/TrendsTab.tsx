"use client"

import { useMemo } from 'react'
import type { DashboardData, EChartClickParams } from '@/lib/types'
import EChart from '@/components/EChart'
import { CHART_COLORS } from '@/lib/utils'

interface TrendsTabProps {
  data: DashboardData
  onApplyTypeFilter: (label: string) => void
}

export default function TrendsTab({ data, onApplyTypeFilter }: TrendsTabProps) {
  const weekly = data.trends.weekly
  const byType = data.signalAnalytics.byType
  const byIndustry = data.signalAnalytics.byIndustry

  const weeklyOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      legend: { data: ['High', 'Medium', 'Low'], bottom: 0 },
      grid: { left: 8, right: 8, top: 16, bottom: 32, containLabel: true },
      xAxis: { type: 'category', data: weekly.map((w) => w.label) },
      yAxis: { type: 'value' },
      series: [
        { name: 'High', type: 'bar', stack: 'severity', data: weekly.map((w) => w.high), itemStyle: { color: '#F31A1A' }, barMaxWidth: 32 },
        { name: 'Medium', type: 'bar', stack: 'severity', data: weekly.map((w) => w.medium), itemStyle: { color: '#FB8145' }, barMaxWidth: 32 },
        { name: 'Low', type: 'bar', stack: 'severity', data: weekly.map((w) => w.low), itemStyle: { color: '#3BC884' }, barMaxWidth: 32 },
      ],
    }),
    [weekly]
  )

  const typeOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: byType.map((t) => t.label) },
      series: [{ type: 'bar', data: byType.map((t) => t.count), itemStyle: { color: '#1A73E8' }, barMaxWidth: 24 }],
    }),
    [byType]
  )

  const industryOption = useMemo(
    () => ({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, type: 'scroll' },
      series: [
        {
          type: 'pie',
          radius: ['35%', '65%'],
          label: { show: false },
          data: byIndustry.map((i, idx) => ({
            name: i.industry,
            value: i.count,
            itemStyle: { color: CHART_COLORS[idx % CHART_COLORS.length] },
          })),
        },
      ],
    }),
    [byIndustry]
  )

  return (
    <div className="grid gap-4">
      <div className="ds-card p-4">
        <h3 className="text-sm font-semibold">Weekly Signal Trend by Severity</h3>
        <EChart option={weeklyOption} height={320} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold">Signals by Type</h3>
          <EChart option={typeOption} height={300} onClickItem={(p: EChartClickParams) => onApplyTypeFilter(p.name)} />
        </div>
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold">Signals by Industry</h3>
          <EChart option={industryOption} height={300} />
        </div>
      </div>
    </div>
  )
}
