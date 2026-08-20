"use client"

import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import type { EChartClickParams } from '@/lib/types'

interface EChartProps {
  option: EChartsOption
  height?: number
  onChartClick?: (params: EChartClickParams) => void
}

export default function EChart({ option, height = 280, onChartClick }: EChartProps) {
  const onEvents = onChartClick
    ? {
        click: (params: unknown) => {
          onChartClick(params as EChartClickParams)
        },
      }
    : undefined
  return (
    <ReactECharts
      option={option}
      notMerge
      lazyUpdate
      style={{ height, width: '100%' }}
      onEvents={onEvents}
    />
  )
}
