import { describe, expect, it } from 'vitest'
import { marketSampleCandles } from '../../data/marketSample'
import { convertMarketCandlesToFarmEvents, parseBinanceKline } from '../market'

describe('market adapter', () => {
  it('converts bundled OHLCV candles into the shared farm event contract', () => {
    const events = convertMarketCandlesToFarmEvents(marketSampleCandles, 'market_sample')

    expect(events.length).toBeGreaterThanOrEqual(marketSampleCandles.length)
    expect(events.every((event) => event.source === 'market_sample')).toBe(true)
    expect(events.some((event) => event.event === 'missing_carrot')).toBe(true)
    expect(events.some((event) => event.evidence && 'volumeRatio' in event.evidence)).toBe(true)
    expect(events.some((event) => event.evidence && 'takerBuyRatio' in event.evidence)).toBe(true)
  })

  it('parses Binance kline rows without API keys or private fields', () => {
    const parsed = parseBinanceKline([
      1783330000000,
      '64000.1',
      '64110.2',
      '63920.3',
      '64075.4',
      '830.5',
      1783330060000,
      '0',
      412,
      '410.25',
    ])

    expect(parsed.openTime).toBe(1783330000000)
    expect(parsed.open).toBe(64000.1)
    expect(parsed.trades).toBe(412)
    expect(parsed.takerBuyBaseVolume).toBe(410.25)
  })
})
