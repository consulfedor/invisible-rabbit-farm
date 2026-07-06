import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

type EChartProps = {
  option: EChartsOption
  height?: number
  label: string
}

export const EChart = ({ option, height = 280, label }: EChartProps) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return undefined
    const chart = echarts.init(ref.current, undefined, { renderer: 'canvas' })
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(ref.current)
    chart.setOption(option, true)
    return () => {
      observer.disconnect()
      chart.dispose()
    }
  }, [option])

  return <div className="echart" ref={ref} role="img" aria-label={label} style={{ height }} />
}
