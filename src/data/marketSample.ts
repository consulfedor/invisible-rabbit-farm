import type { MarketCandle } from '../adapters/market'

export const marketSampleCandles: MarketCandle[] = Array.from({ length: 60 }, (_, index) => {
  const openTime = Date.UTC(2026, 6, 6, 9, index)
  const wave = Math.sin(index / 4)
  const shock = index === 18 || index === 37 || index === 51 ? 1.9 : 1
  const open = 64120 + index * 8 + wave * 130
  const close = open + Math.sin(index / 2.7) * 85 * shock
  const high = Math.max(open, close) + 45 + Math.abs(Math.cos(index / 3)) * 90 * shock
  const low = Math.min(open, close) - 35 - Math.abs(Math.sin(index / 5)) * 65 * shock
  const volume = 620 + Math.abs(Math.sin(index / 3.6)) * 420 * shock + (index % 11 === 0 ? 280 : 0)
  const takerBuyBaseVolume = volume * (0.48 + Math.sin(index / 5.3) * 0.12)
  return {
    openTime,
    open: Number(open.toFixed(2)),
    high: Number(high.toFixed(2)),
    low: Number(low.toFixed(2)),
    close: Number(close.toFixed(2)),
    volume: Number(volume.toFixed(3)),
    trades: 340 + Math.round(Math.abs(Math.sin(index / 4.2)) * 260 * shock),
    takerBuyBaseVolume: Number(takerBuyBaseVolume.toFixed(3)),
  }
})
