"use client"

import ReactECharts from 'echarts-for-react'
import type { EChartClickParams } from '@/lib/types'

interface EChartProps {
  option: Record<string, unknown>
  height?: number
  onClickItem?: (params: EChartClickParams) => void
}

export default function EChart({ option, height = 280, onClickItem }: EChartProps) {
  const events: Record<string, (params: EChartClickParams) => void> = {}
  if (onClickItem) {
    const cb = onClickItem
    events.click = (params: EChartClickParams) => {
      cb(params)
    }
  }
  return <ReactECharts option={option} style={{ height, width: '100%' }} notMerge onEvents={events} />
}
