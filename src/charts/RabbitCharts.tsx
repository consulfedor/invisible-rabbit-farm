import type { EChartsOption } from 'echarts'
import type { Language } from '../i18n/dictionary'
import { eventLabels, localizeLocation } from '../i18n/dictionary'
import type { ScoringResult } from '../domain/types'
import type { MarketCandle } from '../adapters/market'
import { EChart } from './EChart'

const eventColors: Record<string, string> = {
  missing_carrot: '#f2b84b',
  new_hole: '#c77b4a',
  motion_sensor: '#57c7d4',
  rustle_detected: '#b9e37d',
  footprints: '#f06f63',
}

const shell = {
  textStyle: { color: '#dce7dc', fontFamily: 'Space Grotesk, Trebuchet MS, sans-serif' },
  grid: { left: 42, right: 18, top: 28, bottom: 42 },
  tooltip: { trigger: 'axis' as const, backgroundColor: '#102018', borderColor: '#2f5542', textStyle: { color: '#eff8ed' } },
  xAxis: { axisLine: { lineStyle: { color: '#476858' } }, axisLabel: { color: '#a9b9ad' }, splitLine: { show: false } },
  yAxis: { axisLine: { lineStyle: { color: '#476858' } }, axisLabel: { color: '#a9b9ad' }, splitLine: { lineStyle: { color: '#1e3228' } } },
}

export const TimelineChart = ({ result, language, title }: { result: ScoringResult; language: Language; title: string }) => {
  const option: EChartsOption = {
    ...shell,
    tooltip: { ...shell.tooltip, trigger: 'item' as const },
    xAxis: { ...shell.xAxis, type: 'category', data: result.normalizedSignals.map((signal) => signal.time) },
    yAxis: { ...shell.yAxis, type: 'value', name: 'signal' },
    series: [
      {
        type: 'scatter',
        data: result.normalizedSignals.map((signal) => ({
          value: signal.finalSignal,
          symbolSize: Math.max(8, Math.min(28, signal.intensity * 2.3)),
          itemStyle: { color: eventColors[signal.event] },
          name: `${signal.time} · ${eventLabels[language][signal.event]} · ${localizeLocation(signal.location, language)}`,
        })),
      },
    ],
  }

  return <EChart option={option} label={title} />
}

export const ContributionChart = ({ result, language, title }: { result: ScoringResult; language: Language; title: string }) => {
  const option: EChartsOption = {
    ...shell,
    xAxis: {
      ...shell.xAxis,
      type: 'category',
      data: result.contributionsByType.map((item) => eventLabels[language][item.event]),
      axisLabel: { ...shell.xAxis.axisLabel, rotate: 22 },
    },
    yAxis: { ...shell.yAxis, type: 'value', name: '%' },
    series: [
      {
        type: 'bar',
        data: result.contributionsByType.map((item) => ({
          value: item.percent,
          itemStyle: { color: eventColors[item.event] },
        })),
        barWidth: '52%',
      },
    ],
  }

  return <EChart option={option} label={title} />
}

export const LocationRiskChart = ({ result, language, title }: { result: ScoringResult; language: Language; title: string }) => {
  const option: EChartsOption = {
    ...shell,
    grid: { left: 116, right: 18, top: 24, bottom: 24 },
    xAxis: { ...shell.xAxis, type: 'value', max: 100 },
    yAxis: {
      ...shell.yAxis,
      type: 'category',
      data: result.locationRisks.map((item) => localizeLocation(item.location, language)).reverse(),
      axisLabel: { color: '#dce7dc' },
    },
    series: [
      {
        type: 'bar',
        data: result.locationRisks.map((item) => item.percent).reverse(),
        itemStyle: { color: '#8bdc9f' },
        barWidth: '46%',
      },
    ],
  }

  return <EChart option={option} label={title} />
}

export const MarketCandlesChart = ({ candles, title }: { candles: MarketCandle[]; title: string }) => {
  const categories = candles.map((candle) => {
    const date = new Date(candle.openTime)
    return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`
  })
  const option: EChartsOption = {
    ...shell,
    grid: { left: 54, right: 18, top: 24, bottom: 42 },
    xAxis: { ...shell.xAxis, type: 'category', data: categories },
    yAxis: { ...shell.yAxis, type: 'value', scale: true },
    series: [
      {
        type: 'candlestick',
        data: candles.map((candle) => [candle.open, candle.close, candle.low, candle.high]),
        itemStyle: {
          color: '#8bdc9f',
          color0: '#f06f63',
          borderColor: '#8bdc9f',
          borderColor0: '#f06f63',
        },
      },
    ],
  }

  return <EChart option={option} label={title} />
}
