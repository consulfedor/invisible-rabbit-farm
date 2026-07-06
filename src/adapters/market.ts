import { clamp, roundTo } from '../domain/math'
import { formatMinuteOfDay } from '../domain/time'
import type { FarmSignalEvent, FarmSignalSource } from '../domain/types'

export type MarketCandle = {
  openTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  trades: number
  takerBuyBaseVolume: number
}

const average = (values: number[]): number => (
  values.reduce((total, value) => total + value, 0) / Math.max(1, values.length)
)

const rollingAverage = (candles: MarketCandle[], index: number, selector: (candle: MarketCandle) => number): number => {
  const start = Math.max(0, index - 59)
  return average(candles.slice(start, index + 1).map(selector))
}

const toLocation = (index: number): string => {
  const locations = ['Огород', 'Сарай', 'Теплица', 'У забора', 'Склад моркови']
  return locations[index % locations.length]
}

export const convertMarketCandlesToFarmEvents = (
  candles: MarketCandle[],
  source: Extract<FarmSignalSource, 'market_sample' | 'binance_live'>,
): FarmSignalEvent[] => {
  if (candles.length === 0) return []
  const events: FarmSignalEvent[] = []

  candles.forEach((candle, index) => {
    const avgVolume = rollingAverage(candles, index, (item) => item.volume)
    const avgRange = rollingAverage(candles, index, (item) => item.high - item.low)
    const volumeRatio = candle.volume / Math.max(1, avgVolume)
    const rangeRatio = (candle.high - candle.low) / Math.max(0.1, avgRange)
    const returnAbs = Math.abs(candle.close / candle.open - 1)
    const takerRatio = candle.takerBuyBaseVolume / Math.max(1, candle.volume)
    const rollingHigh = Math.max(...candles.slice(Math.max(0, index - 10), index + 1).map((item) => item.high))
    const rollingLow = Math.min(...candles.slice(Math.max(0, index - 10), index + 1).map((item) => item.low))
    const isExtreme = candle.high >= rollingHigh || candle.low <= rollingLow
    const time = formatMinuteOfDay(new Date(candle.openTime).getUTCHours() * 60 + new Date(candle.openTime).getUTCMinutes())

    events.push({
      id: `${source}_volume_${index}`,
      event: 'missing_carrot',
      location: toLocation(index),
      count: Math.max(1, Math.round(volumeRatio * 2)),
      intensity: Math.round(clamp(volumeRatio * 3, 1, 10)),
      time,
      source,
      evidence: { volumeRatio: roundTo(volumeRatio, 3), volume: roundTo(candle.volume, 2) },
    })

    if (rangeRatio >= 0.72) {
      events.push({
        id: `${source}_range_${index}`,
        event: 'motion_sensor',
        location: toLocation(index + 1),
        count: Math.max(1, Math.round(rangeRatio * 2)),
        intensity: Math.round(clamp(rangeRatio * 4, 1, 10)),
        time,
        source,
        evidence: { rangeRatio: roundTo(rangeRatio, 3), candleRange: roundTo(candle.high - candle.low, 2) },
      })
    }

    if (returnAbs >= 0.0006) {
      events.push({
        id: `${source}_return_${index}`,
        event: 'new_hole',
        location: toLocation(index + 2),
        count: Math.max(1, Math.round(returnAbs * 1800)),
        intensity: Math.round(clamp(returnAbs * 4600, 1, 10)),
        time,
        source,
        evidence: { absReturnPct: roundTo(returnAbs * 100, 4), open: candle.open, close: candle.close },
      })
    }

    if (Math.abs(takerRatio - 0.5) >= 0.06) {
      events.push({
        id: `${source}_imbalance_${index}`,
        event: 'rustle_detected',
        location: toLocation(index + 3),
        count: Math.max(1, Math.round(Math.abs(takerRatio - 0.5) * 18)),
        intensity: Math.round(clamp(Math.abs(takerRatio - 0.5) * 30, 1, 10)),
        time,
        source,
        evidence: { takerBuyRatio: roundTo(takerRatio, 3), trades: candle.trades },
      })
    }

    if (isExtreme && index > 3) {
      events.push({
        id: `${source}_extreme_${index}`,
        event: 'footprints',
        location: toLocation(index + 4),
        count: 2,
        intensity: Math.round(clamp((rangeRatio + volumeRatio) * 2, 1, 10)),
        time,
        source,
        evidence: { localExtreme: candle.high >= rollingHigh ? 'high' : 'low' },
      })
    }
  })

  return events.slice(-90)
}

export const parseBinanceKline = (row: unknown[]): MarketCandle => ({
  openTime: Number(row[0]),
  open: Number(row[1]),
  high: Number(row[2]),
  low: Number(row[3]),
  close: Number(row[4]),
  volume: Number(row[5]),
  trades: Number(row[8]),
  takerBuyBaseVolume: Number(row[9]),
})
