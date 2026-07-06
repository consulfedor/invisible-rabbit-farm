import { useEffect, useRef, useState } from 'react'
import { Activity, DatabaseZap, Languages, Radar, RefreshCcw, ShieldAlert, Trash2 } from 'lucide-react'
import { convertMarketCandlesToFarmEvents } from './adapters/market'
import type { MarketCandle } from './adapters/market'
import { fetchLiveMarketEvents, isClosedLiveMarketKline, LIVE_MARKET_WS_URL } from './adapters/liveMarket'
import { normalizeFarmEvents, safeParseFarmEventsJson } from './adapters/farm'
import { FARM_EVENT_TYPES } from './domain/constants'
import { scoreRabbitActivity } from './domain/scoring'
import { generateSeededFarmEvents } from './domain/randomizer'
import { briefSampleEvents } from './data/briefSample'
import { marketSampleCandles } from './data/marketSample'
import type { DataMode, FarmSignalEvent, FarmSignalSource, GeneratorParameters, ScoringParameters } from './domain/types'
import { DEFAULT_SCORING_PARAMETERS } from './domain/constants'
import { AIWorklog } from './components/AIWorklog'
import { RecommendationPanel } from './components/RecommendationPanel'
import { SliderField } from './components/SliderField'
import { ContributionChart, LocationRiskChart, MarketCandlesChart, TimelineChart } from './charts/RabbitCharts'
import {
  canonicalizeLocationInput,
  dictionary,
  eventLabels,
  languages,
  localizeLocation,
  modeHelp,
  modeLabels,
  type Language,
} from './i18n/dictionary'
import './styles/app.css'

const defaultGenerator: GeneratorParameters = {
  seed: 417,
  eventCount: 28,
  hiddenPressure: 0.62,
  noiseLevel: 0.28,
  sensorSensitivity: 0.74,
  falsePositiveRate: 0.16,
}

const sourceForMode = (mode: DataMode): FarmSignalSource => {
  if (mode === 'seeded') return 'generated'
  if (mode === 'market_sample') return 'market_sample'
  if (mode === 'live_market') return 'binance_live'
  return 'brief'
}

const modeDescriptionKey: Record<DataMode, keyof typeof dictionary.ru> = {
  brief: 'modeBriefDesc',
  seeded: 'modeSeededDesc',
  market_sample: 'modeMarketDesc',
  live_market: 'modeLiveDesc',
}

const getModeEvents = (mode: DataMode, generator: GeneratorParameters): FarmSignalEvent[] => {
  if (mode === 'brief') return normalizeFarmEvents(briefSampleEvents, 'brief')
  if (mode === 'seeded') return generateSeededFarmEvents(generator)
  if (mode === 'market_sample' || mode === 'live_market') {
    return convertMarketCandlesToFarmEvents(marketSampleCandles, 'market_sample')
  }
  return normalizeFarmEvents(briefSampleEvents, 'brief')
}

const formatJson = (events: FarmSignalEvent[]) => JSON.stringify(events, null, 2)

const formatCandleMinute = (openTime: number): string => {
  const date = new Date(openTime)
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')} UTC`
}

type LiveStatus = 'idle' | 'loading' | 'connecting' | 'streaming' | 'ok' | 'error'
type MarketSourceKind = 'sample' | 'live' | 'fallback'

export const App = () => {
  const [language, setLanguage] = useState<Language>('ru')
  const [mode, setMode] = useState<DataMode>('brief')
  const [events, setEvents] = useState<FarmSignalEvent[]>(() => getModeEvents('brief', defaultGenerator))
  const [jsonDraft, setJsonDraft] = useState(() => formatJson(getModeEvents('brief', defaultGenerator)))
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [params, setParams] = useState<ScoringParameters>(DEFAULT_SCORING_PARAMETERS)
  const [generator, setGenerator] = useState<GeneratorParameters>(defaultGenerator)
  const [marketCandles, setMarketCandles] = useState<MarketCandle[]>(marketSampleCandles)
  const [marketSourceKind, setMarketSourceKind] = useState<MarketSourceKind>('sample')
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('idle')
  const [liveDetail, setLiveDetail] = useState('')
  const [isRecalculating, setIsRecalculating] = useState(false)
  const liveSocketRef = useRef<WebSocket | null>(null)
  const liveRefreshInFlightRef = useRef(false)

  const t = dictionary[language]
  const result = scoreRabbitActivity(events, params)
  const showMarketChart = mode === 'market_sample' || mode === 'live_market'
  const strongestSignalLabel = result.strongestSignal ? eventLabels[language][result.strongestSignal] : t.noSignal
  const highestRiskLocationLabel = localizeLocation(result.highestRiskLocation, language)
  const latestCandle = marketCandles[marketCandles.length - 1]
  const marketChartLabel = mode === 'live_market' && liveStatus !== 'error'
    ? t.marketLiveCandles
    : t.marketCandles
  const marketSourceLabel: Record<MarketSourceKind, string> = {
    sample: t.marketSourceSample,
    live: t.marketSourceLive,
    fallback: t.marketSourceFallback,
  }
  const marketSnapshotMeta = latestCandle
    ? `${marketSourceLabel[marketSourceKind]} · ${formatCandleMinute(latestCandle.openTime)} · close ${latestCandle.close.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    : marketSourceLabel[marketSourceKind]
  const liveMessageByStatus: Record<LiveStatus, string> = {
    idle: t.liveOptional,
    loading: t.liveLoading,
    connecting: t.liveConnecting,
    streaming: t.liveStreaming,
    ok: t.liveLoaded,
    error: t.liveUsingOffline,
  }
  const liveMessage = mode === 'live_market'
    ? [liveMessageByStatus[liveStatus], liveDetail].filter(Boolean).join(' ')
    : t.liveOptional

  useEffect(() => {
    setIsRecalculating(true)
    const timer = window.setTimeout(() => setIsRecalculating(false), 520)
    return () => window.clearTimeout(timer)
  }, [result.recalculationId])

  useEffect(() => {
    if (mode === 'seeded') {
      const generated = generateSeededFarmEvents(generator)
      setEvents(generated)
      setJsonDraft(formatJson(generated))
    }
  }, [generator, mode])

  useEffect(() => () => {
    liveSocketRef.current?.close()
    liveSocketRef.current = null
  }, [])

  const loadMode = (nextMode: DataMode) => {
    liveSocketRef.current?.close()
    liveSocketRef.current = null
    setMode(nextMode)
    const nextEvents = getModeEvents(nextMode, generator)
    setEvents(nextEvents)
    setJsonDraft(formatJson(nextEvents))
    setJsonError(null)
    if (nextMode === 'market_sample') {
      setMarketCandles(marketSampleCandles)
      setMarketSourceKind('sample')
    }
    setLiveStatus('idle')
    setLiveDetail('')
  }

  const updateParam = (key: keyof Omit<ScoringParameters, 'eventWeights'>, value: number) => {
    setParams((current) => ({ ...current, [key]: value }))
  }

  const updateWeight = (eventType: keyof ScoringParameters['eventWeights'], value: number) => {
    setParams((current) => ({
      ...current,
      eventWeights: { ...current.eventWeights, [eventType]: value },
    }))
  }

  const updateGenerator = (key: keyof GeneratorParameters, value: number) => {
    setGenerator((current) => ({ ...current, [key]: value }))
  }

  const updateEvent = (id: string, patch: Partial<FarmSignalEvent>) => {
    setEvents((current) => {
      const next = current.map((event) => (event.id === id ? { ...event, ...patch } : event))
      setJsonDraft(formatJson(next))
      return next
    })
  }

  const addEvent = () => {
    const source = sourceForMode(mode)
    const next: FarmSignalEvent = {
      id: `${source}_manual_${Date.now()}`,
      event: 'rustle_detected',
      location: language === 'ru' ? 'Новая зона' : 'New zone',
      count: 1,
      intensity: 4,
      time: '12:30',
      source,
      evidence: { manual: 'true' },
    }
    setEvents((current) => {
      const updated = [...current, next]
      setJsonDraft(formatJson(updated))
      return updated
    })
  }

  const deleteEvent = (id: string) => {
    setEvents((current) => {
      const updated = current.filter((event) => event.id !== id)
      setJsonDraft(formatJson(updated))
      return updated
    })
  }

  const applyJson = () => {
    const parsed = safeParseFarmEventsJson(jsonDraft)
    if (!parsed.ok) {
      setJsonError(parsed.error)
      return
    }
    const next = normalizeFarmEvents(parsed.events, sourceForMode(mode))
    setEvents(next)
    setJsonDraft(formatJson(next))
    setJsonError(null)
  }

  const applyLiveRestSnapshot = async () => {
    const live = await fetchLiveMarketEvents()
    if (live.ok && live.events.length > 0) {
      setEvents(live.events)
      setMarketCandles(live.candles)
      setJsonDraft(formatJson(live.events))
      setJsonError(null)
      setLiveDetail(live.sourceNote)
      setMarketSourceKind('live')
      return true
    }
    throw new Error('error' in live ? live.error : 'Live REST returned no events')
  }

  const connectLiveStream = () => {
    if (!('WebSocket' in window)) {
      setLiveStatus('error')
      setLiveDetail(t.liveStreamUnavailable)
      return
    }

    const socket = new WebSocket(LIVE_MARKET_WS_URL)
    liveSocketRef.current = socket

    socket.onopen = () => {
      if (liveSocketRef.current !== socket) return
      setLiveStatus('streaming')
      setLiveDetail('BTCUSDT 1m')
    }

    socket.onmessage = async (event) => {
      if (liveSocketRef.current !== socket || liveRefreshInFlightRef.current) return
      try {
        const payload = JSON.parse(event.data as string) as unknown
        if (!isClosedLiveMarketKline(payload)) return
        liveRefreshInFlightRef.current = true
        await applyLiveRestSnapshot()
        setLiveStatus('streaming')
        setLiveDetail(t.liveUpdated)
      } catch (error) {
        setLiveStatus('error')
        setLiveDetail(`${t.liveStreamUnavailable} ${error instanceof Error ? error.message : ''}`)
      } finally {
        liveRefreshInFlightRef.current = false
      }
    }

    socket.onerror = () => {
      if (liveSocketRef.current !== socket) return
      setLiveStatus('error')
      setLiveDetail(t.liveStreamUnavailable)
    }

    socket.onclose = () => {
      if (liveSocketRef.current !== socket) return
      setLiveStatus('error')
      setLiveDetail(t.liveStreamUnavailable)
      liveSocketRef.current = null
    }
  }

  const startLiveMode = async () => {
    liveSocketRef.current?.close()
    liveSocketRef.current = null
    setMode('live_market')
    setLiveStatus('loading')
    setLiveDetail('')
    const fallback = convertMarketCandlesToFarmEvents(marketSampleCandles, 'market_sample')
    try {
      await applyLiveRestSnapshot()
      setLiveStatus('connecting')
      connectLiveStream()
    } catch (error) {
      setEvents(fallback)
      setMarketCandles(marketSampleCandles)
      setJsonDraft(formatJson(fallback))
      setLiveStatus('error')
      setMarketSourceKind('fallback')
      setLiveDetail(error instanceof Error ? error.message : '')
    }
  }

  const resetCurrentMode = () => {
    if (mode === 'live_market') {
      void startLiveMode()
      return
    }
    loadMode(mode)
  }

  return (
    <main className="app-shell" data-testid="rabbit-dashboard">
      <section className="hero-panel">
        <div>
          <div className="badge-row">
            <span><Radar size={14} /> {t.scenarioBadge}</span>
            <span><DatabaseZap size={14} /> {t.offlineBadge}</span>
            <span><Activity size={14} /> {t.aiBadge}</span>
          </div>
          <h1>{t.appTitle}</h1>
          <p>{t.appSubtitle}</p>
        </div>
        <div className="language-switch" aria-label={t.language}>
          <Languages size={18} />
          {Object.entries(languages).map(([key, label]) => (
            <button
              className={language === key ? 'is-active' : ''}
              key={key}
              type="button"
              onClick={() => setLanguage(key as Language)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="mode-strip" aria-label={t.dataMode}>
        {(['brief', 'seeded', 'market_sample', 'live_market'] satisfies DataMode[]).map((item) => (
          <div className="mode-card-wrap" key={item}>
            <button
              className={`mode-card ${mode === item ? 'is-active' : ''} ${item === 'live_market' ? `mode-card--live mode-card--${liveStatus}` : ''}`}
              type="button"
              onClick={() => { item === 'live_market' ? void startLiveMode() : loadMode(item) }}
            >
              {modeLabels[language][item]}
              <small>{t[modeDescriptionKey[item]]}</small>
            </button>
            <button
              aria-label={`${t.help}: ${modeLabels[language][item]}`}
              className="qmark-help"
              title={modeHelp[language][item].join('\n')}
              type="button"
            >
              ?
            </button>
            <div className="mode-help-popover" role="tooltip">
              {modeHelp[language][item].map((line) => <p key={line}>{line}</p>)}
            </div>
          </div>
        ))}
      </section>

      <section className="status-line" data-testid="recalculation-status">
        <span className={isRecalculating ? 'status-dot status-dot--hot' : 'status-dot'} />
        <b>{isRecalculating ? t.recalculating : t.recalculated}</b>
        <code>{result.recalculationId}</code>
        <span>{t.sourceNote}: {modeLabels[language][mode]}</span>
        <span className={`live-copy live-copy--${liveStatus}`}>{liveMessage}</span>
      </section>

      <section className="summary-panel" data-testid="analysis-summary">
        <div>
          <span className="summary-eyebrow">{t.summaryTitle}</span>
          <h2>{result.estimatedRabbits} · {result.confidence}%</h2>
          <p>{t.summaryLead}</p>
        </div>
        <dl className="summary-grid">
          <div>
            <dt>{t.summaryEstimate}</dt>
            <dd>{result.estimatedRabbits} / {result.hiddenActivity}</dd>
          </div>
          <div>
            <dt>{t.summaryReason}</dt>
            <dd>{strongestSignalLabel}</dd>
          </div>
          <div>
            <dt>{t.summaryZone}</dt>
            <dd>{highestRiskLocationLabel}</dd>
          </div>
          <div>
            <dt>{t.summaryAction}</dt>
            <dd>{t.summaryActionText}</dd>
          </div>
        </dl>
        <div className="summary-tone-row" aria-label={t.summaryToneLegend}>
          <span className="summary-tone summary-tone--green">{t.toneOutcome}</span>
          <span className="summary-tone summary-tone--blue">{t.toneDriver}</span>
          <span className="summary-tone summary-tone--red">{t.toneRisk}</span>
          <span className="summary-tone summary-tone--amber">{t.toneData}</span>
        </div>
      </section>

      <section className="dashboard-grid">
        <aside className="control-stack">
          <section className="panel">
            <div className="panel-title">
              <h2>{t.parameterDeck}</h2>
              <RefreshCcw size={16} />
            </div>
            <SliderField id="noise-level" label={t.noiseLevel} value={params.noiseLevel} onChange={(value) => updateParam('noiseLevel', value)} />
            <SliderField id="sensor-sensitivity" label={t.sensorSensitivity} value={params.sensorSensitivity} onChange={(value) => updateParam('sensorSensitivity', value)} />
            <SliderField id="false-positive-rate" label={t.falsePositiveRate} value={params.falsePositiveRate} onChange={(value) => updateParam('falsePositiveRate', value)} />
            <SliderField id="rabbit-scale" label={t.rabbitScale} value={params.rabbitScale} min={0.5} max={1.6} onChange={(value) => updateParam('rabbitScale', value)} />
          </section>

          <section className="panel">
            <div className="panel-title">
              <h2>{t.generatorDeck}</h2>
              <span>{mode === 'seeded' ? 'active' : 'standby'}</span>
            </div>
            <label className="input-field">
              <span>{t.seed}</span>
              <input id="generator-seed" name="generator-seed" type="number" value={generator.seed} onChange={(event) => updateGenerator('seed', Number(event.target.value))} />
            </label>
            <SliderField id="generator-event-count" label={t.eventCountInput} value={generator.eventCount} min={5} max={80} step={1} onChange={(value) => updateGenerator('eventCount', value)} />
            <SliderField id="generator-hidden-pressure" label={t.hiddenPressure} value={generator.hiddenPressure} onChange={(value) => updateGenerator('hiddenPressure', value)} />
          </section>

          <section className="panel">
            <div className="panel-title">
              <h2>{t.weightsDeck}</h2>
              <span>heuristic</span>
            </div>
            {FARM_EVENT_TYPES.map((eventType) => (
              <SliderField
                key={eventType}
                id={`event-weight-${eventType}`}
                label={eventLabels[language][eventType]}
                value={params.eventWeights[eventType]}
                min={0.4}
                max={1.8}
                onChange={(value) => updateWeight(eventType, value)}
              />
            ))}
          </section>
        </aside>

        <section className="chart-stack">
          <div className="chart-row">
            <section className="panel">
              <div className="panel-title"><h2>{t.timeline}</h2><span>{result.normalizedSignals.length}</span></div>
              <TimelineChart result={result} language={language} title={t.timeline} />
            </section>
            <section className="panel">
              <div className="panel-title"><h2>{t.contributions}</h2><span>{result.contributionsByType[0]?.percent ?? 0}%</span></div>
              <ContributionChart result={result} language={language} title={t.contributions} />
            </section>
          </div>

          <div className="chart-row chart-row--narrow">
            <section className="panel">
              <div className="panel-title"><h2>{t.locationRisk}</h2><span>{highestRiskLocationLabel}</span></div>
              <LocationRiskChart result={result} language={language} title={t.locationRisk} />
            </section>
            {showMarketChart ? (
              <section className="panel" data-testid="market-mode-panel">
                <div className="panel-title"><h2>{marketChartLabel}</h2><span>{marketCandles.length} x 1m</span></div>
                <p className="market-source-line" data-testid="market-source-line">{marketSnapshotMeta}</p>
                <MarketCandlesChart candles={marketCandles} title={marketChartLabel} />
              </section>
            ) : (
              <RecommendationPanel title={t.recommendations} recommendations={result.recommendations} language={language} />
            )}
          </div>
        </section>
      </section>

      <section className="panel data-panel" data-testid="event-editor">
        <div className="panel-title">
          <h2>{t.eventEditor}</h2>
          <span>{t.tableHint}</span>
        </div>
        <div className="data-actions">
          <button type="button" onClick={addEvent}>{t.addEvent}</button>
          <button type="button" onClick={resetCurrentMode}>{t.resetMode}</button>
          <button type="button" onClick={() => setJsonDraft(formatJson(events))}>{t.syncJson}</button>
          <button type="button" className="primary-action" onClick={applyJson}>{t.applyJson}</button>
          {jsonError ? <span className="error-copy"><ShieldAlert size={14} /> {t.invalidJson}: {jsonError}</span> : null}
        </div>

        <div className="event-editor-grid">
          <div className="event-table-wrap">
            <table className="event-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t.event}</th>
                  <th>{t.location}</th>
                  <th>{t.count}</th>
                  <th>{t.intensity}</th>
                  <th>{t.time}</th>
                  <th>{t.action}</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 36).map((event) => (
                  <tr key={event.id}>
                    <td><code>{event.id}</code></td>
                    <td>
                      <select id={`event-${event.id}-type`} name={`event-${event.id}-type`} value={event.event} onChange={(item) => updateEvent(event.id, { event: item.target.value as FarmSignalEvent['event'] })}>
                        {FARM_EVENT_TYPES.map((eventType) => (
                          <option key={eventType} value={eventType}>{eventLabels[language][eventType]}</option>
                        ))}
                      </select>
                    </td>
                    <td><input id={`event-${event.id}-location`} name={`event-${event.id}-location`} value={localizeLocation(event.location, language)} onChange={(item) => updateEvent(event.id, { location: canonicalizeLocationInput(item.target.value, language) })} /></td>
                    <td><input id={`event-${event.id}-count`} name={`event-${event.id}-count`} type="number" value={event.count} min={0} onChange={(item) => updateEvent(event.id, { count: Number(item.target.value) })} /></td>
                    <td><input id={`event-${event.id}-intensity`} name={`event-${event.id}-intensity`} type="number" value={event.intensity} min={0} max={10} onChange={(item) => updateEvent(event.id, { intensity: Number(item.target.value) })} /></td>
                    <td><input id={`event-${event.id}-time`} name={`event-${event.id}-time`} value={event.time} onChange={(item) => updateEvent(event.id, { time: item.target.value })} /></td>
                    <td>
                      <button className="delete-row-button" type="button" onClick={() => deleteEvent(event.id)} aria-label={`${t.deleteEvent}: ${event.id}`}>
                        <Trash2 size={14} />
                        <span>{t.deleteEvent}</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-row">{t.emptyEvents}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
            {events.length > 36 ? <p className="muted">Showing first 36 editable rows; JSON editor contains all {events.length} events.</p> : null}
          </div>
          <label className="json-editor">
            <span>{t.jsonEditor}</span>
            <textarea id="farm-events-json" name="farm-events-json" value={jsonDraft} spellCheck={false} onChange={(event) => setJsonDraft(event.target.value)} />
          </label>
        </div>
      </section>

      {showMarketChart ? <RecommendationPanel title={t.recommendations} recommendations={result.recommendations} language={language} /> : null}

      <section className="panel evidence-panel">
        <div className="panel-title">
          <h2>{t.normalizedEvidence}</h2>
          <span>top 8 final signals</span>
        </div>
        <div className="evidence-grid">
          {result.normalizedSignals.slice().sort((left, right) => right.finalSignal - left.finalSignal).slice(0, 8).map((signal) => (
            <article key={`${signal.id}-${signal.finalSignal}`}>
              <b>{eventLabels[language][signal.event]}</b>
              <span>{localizeLocation(signal.location, language)} · {signal.time}</span>
              <strong>{signal.finalSignal}</strong>
              <small>base {signal.baseSignal} / weighted {signal.weightedSignal} / recency {signal.recencyFactor}</small>
            </article>
          ))}
        </div>
      </section>

      <AIWorklog title={t.aiWorklog} lead={t.worklogLead} language={language} />
    </main>
  )
}
