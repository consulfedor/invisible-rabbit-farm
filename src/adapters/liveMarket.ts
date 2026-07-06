import { convertMarketCandlesToFarmEvents, parseBinanceKline } from './market'
import type { MarketCandle } from './market'
import type { FarmSignalEvent } from '../domain/types'

export const LIVE_MARKET_REST_URL = 'https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval=1m&limit=60'
export const LIVE_MARKET_WS_URL = 'wss://fstream.binance.com/market/ws/btcusdt@kline_1m'

export type LiveMarketResult =
  | { ok: true; events: FarmSignalEvent[]; candles: MarketCandle[]; sourceNote: string }
  | { ok: false; events: FarmSignalEvent[]; error: string; sourceNote: string }

type BinanceKlineEnvelope = {
  data?: unknown
  k?: {
    i?: string
    s?: string
    x?: boolean
  }
}

export const fetchLiveMarketEvents = async (): Promise<LiveMarketResult> => {
  try {
    const response = await fetch(LIVE_MARKET_REST_URL)
    if (!response.ok) {
      return { ok: false, events: [], error: `HTTP ${response.status}`, sourceNote: 'Binance public REST unavailable' }
    }
    const payload = await response.json() as unknown
    if (!Array.isArray(payload)) {
      return { ok: false, events: [], error: 'Unexpected payload shape', sourceNote: 'Binance public REST unavailable' }
    }
    const candles = payload.map((row) => parseBinanceKline(row as unknown[]))
    return {
      ok: true,
      events: convertMarketCandlesToFarmEvents(candles, 'binance_live'),
      candles,
      sourceNote: 'Binance USD-M Futures public REST, no API key',
    }
  } catch (error) {
    return {
      ok: false,
      events: [],
      error: error instanceof Error ? error.message : 'Unknown live market error',
      sourceNote: 'Live mode failed gracefully; offline modes remain available',
    }
  }
}

export const isClosedLiveMarketKline = (payload: unknown): boolean => {
  if (!payload || typeof payload !== 'object') return false
  const envelope = payload as BinanceKlineEnvelope
  const raw = envelope.data && typeof envelope.data === 'object' ? envelope.data : payload
  const kline = (raw as BinanceKlineEnvelope).k

  return kline?.s === 'BTCUSDT' && kline.i === '1m' && kline.x === true
}
