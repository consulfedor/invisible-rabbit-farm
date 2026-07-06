import { describe, expect, it } from 'vitest'
import { isClosedLiveMarketKline, LIVE_MARKET_REST_URL, LIVE_MARKET_WS_URL } from '../liveMarket'

describe('live market adapter', () => {
  it('uses public Binance USD-M Futures endpoints without private API keys', () => {
    expect(LIVE_MARKET_REST_URL).toContain('/fapi/v1/klines?symbol=BTCUSDT&interval=1m&limit=60')
    expect(LIVE_MARKET_WS_URL).toBe('wss://fstream.binance.com/market/ws/btcusdt@kline_1m')
  })

  it('detects only closed BTCUSDT one-minute klines from the stream', () => {
    expect(isClosedLiveMarketKline({ k: { s: 'BTCUSDT', i: '1m', x: true } })).toBe(true)
    expect(isClosedLiveMarketKline({ data: { k: { s: 'BTCUSDT', i: '1m', x: true } } })).toBe(true)
    expect(isClosedLiveMarketKline({ k: { s: 'BTCUSDT', i: '1m', x: false } })).toBe(false)
    expect(isClosedLiveMarketKline({ k: { s: 'ETHUSDT', i: '1m', x: true } })).toBe(false)
    expect(isClosedLiveMarketKline({ k: { s: 'BTCUSDT', i: '5m', x: true } })).toBe(false)
  })
})
