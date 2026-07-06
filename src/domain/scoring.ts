import { DEFAULT_SCORING_PARAMETERS, FARM_EVENT_TYPES } from './constants'
import { clamp, roundTo, stableHash, sumBy } from './math'
import { parseEventMinutes } from './time'
import type {
  FarmEventType,
  FarmSignalEvent,
  LocationRisk,
  NormalizedSignal,
  Recommendation,
  ScoringParameters,
  ScoringResult,
  SignalContribution,
} from './types'

const normalizeParams = (params: Partial<ScoringParameters> = {}): ScoringParameters => ({
  ...DEFAULT_SCORING_PARAMETERS,
  ...params,
  eventWeights: {
    ...DEFAULT_SCORING_PARAMETERS.eventWeights,
    ...(params.eventWeights ?? {}),
  },
})

export const normalizeSignals = (
  events: FarmSignalEvent[],
  parameters: Partial<ScoringParameters> = {},
): NormalizedSignal[] => {
  const params = normalizeParams(parameters)
  const maxMinutes = Math.max(...events.map((event) => parseEventMinutes(event.time)), 0)

  return events.map((event) => {
    const eventMinutes = parseEventMinutes(event.time)
    const ageMinutes = Math.max(0, maxMinutes - eventMinutes)
    const recencyFactor = clamp(1 - (ageMinutes / 720) * 0.36, 0.64, 1.08)
    const baseSignal = Math.max(0, event.count) * clamp(event.intensity, 0, 10)
    const weightedSignal = baseSignal * params.eventWeights[event.event]
    const noiseAdjustment = clamp(
      0.42 + params.sensorSensitivity * 0.78 - params.noiseLevel * 0.32 - params.falsePositiveRate * 0.26,
      0.2,
      1.32,
    )
    const finalSignal = weightedSignal * recencyFactor * noiseAdjustment

    return {
      ...event,
      baseSignal: roundTo(baseSignal),
      weightedSignal: roundTo(weightedSignal),
      recencyFactor: roundTo(recencyFactor, 3),
      noiseAdjustment: roundTo(noiseAdjustment, 3),
      finalSignal: roundTo(finalSignal),
    }
  })
}

const buildContributions = (signals: NormalizedSignal[]): SignalContribution[] => {
  const total = Math.max(sumBy(signals, (signal) => signal.finalSignal), 0.001)
  return FARM_EVENT_TYPES.map((event) => {
    const value = sumBy(signals.filter((signal) => signal.event === event), (signal) => signal.finalSignal)
    return {
      event,
      value: roundTo(value),
      percent: roundTo((value / total) * 100, 1),
    }
  }).sort((left, right) => right.value - left.value)
}

const buildLocationRisks = (signals: NormalizedSignal[]): LocationRisk[] => {
  const locationMap = new Map<string, number>()
  signals.forEach((signal) => {
    locationMap.set(signal.location, (locationMap.get(signal.location) ?? 0) + signal.finalSignal)
  })
  const total = Math.max(sumBy(Array.from(locationMap.values()), (value) => value), 0.001)
  return Array.from(locationMap.entries())
    .map(([location, value]) => ({
      location,
      value: roundTo(value),
      percent: roundTo((value / total) * 100, 1),
    }))
    .sort((left, right) => right.value - left.value)
}

const uniqueCount = <T>(values: T[]): number => new Set(values).size

const estimateConfidence = (
  signals: NormalizedSignal[],
  parameters: ScoringParameters,
  rawActivity: number,
): number => {
  if (signals.length === 0) return 0
  const eventDiversity = uniqueCount(signals.map((signal) => signal.event)) / FARM_EVENT_TYPES.length
  const locationRepeat = 1 - uniqueCount(signals.map((signal) => signal.location)) / Math.max(signals.length, 1)
  const averageRecency = sumBy(signals, (signal) => signal.recencyFactor) / signals.length
  const strength = clamp(rawActivity / 240, 0, 1)
  const confidence =
    0.18
    + eventDiversity * 0.24
    + clamp(locationRepeat, 0, 1) * 0.18
    + averageRecency * 0.18
    + strength * 0.32
    - parameters.noiseLevel * 0.18
    - parameters.falsePositiveRate * 0.16

  return roundTo(clamp(confidence * 100, 8, 96), 1)
}

const buildRecommendations = (
  signals: NormalizedSignal[],
  contributions: SignalContribution[],
  locations: LocationRisk[],
  estimatedRabbits: number,
  confidence: number,
): Recommendation[] => {
  const topLocation = locations[0]
  const topSignal = contributions[0]
  const recs: Recommendation[] = []

  if (estimatedRabbits >= 12 && confidence >= 62 && topLocation) {
    recs.push({ code: 'secure_high_risk_zone', severity: 'urgent', location: topLocation.location })
  }
  if (estimatedRabbits >= 9 && confidence < 55) {
    recs.push({ code: 'collect_more_evidence', severity: 'watch', location: topLocation?.location })
  }
  if (topSignal && ['motion_sensor', 'rustle_detected'].includes(topSignal.event) && confidence < 68) {
    recs.push({ code: 'inspect_sensors', severity: 'watch', signal: topSignal.event })
  }
  if (topSignal?.event === 'missing_carrot' || estimatedRabbits >= 10) {
    recs.push({ code: 'rebalance_carrots', severity: 'info', location: topLocation?.location })
  }
  if (signals.some((signal) => signal.source === 'market_sample' || signal.source === 'binance_live')) {
    recs.push({ code: 'watch_market_impulse', severity: 'info', signal: topSignal?.event })
  }

  return recs.slice(0, 5)
}

export const scoreRabbitActivity = (
  events: FarmSignalEvent[],
  parameters: Partial<ScoringParameters> = {},
): ScoringResult => {
  const params = normalizeParams(parameters)
  const normalizedSignals = normalizeSignals(events, params)
  const rawActivity = sumBy(normalizedSignals, (signal) => signal.finalSignal)
  const hiddenActivity = roundTo(clamp(Math.sqrt(rawActivity) * 7.5 * params.rabbitScale, 0, 100), 1)
  const estimatedRabbits = Math.max(0, Math.round(Math.sqrt(rawActivity) * 1.42 * params.rabbitScale))
  const contributionsByType = buildContributions(normalizedSignals)
  const locationRisks = buildLocationRisks(normalizedSignals)
  const confidence = estimateConfidence(normalizedSignals, params, rawActivity)
  const strongestSignal = contributionsByType[0]?.value > 0 ? contributionsByType[0].event : null
  const highestRiskLocation = locationRisks[0]?.location ?? null

  return {
    recalculationId: stableHash({ events, params, rawActivity }).slice(0, 8),
    totalEvents: events.length,
    hiddenActivity,
    estimatedRabbits,
    confidence,
    strongestSignal,
    highestRiskLocation,
    normalizedSignals,
    contributionsByType,
    locationRisks,
    recommendations: buildRecommendations(
      normalizedSignals,
      contributionsByType,
      locationRisks,
      estimatedRabbits,
      confidence,
    ),
  }
}
