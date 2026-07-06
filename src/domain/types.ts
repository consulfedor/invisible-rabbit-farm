export type FarmEventType =
  | 'missing_carrot'
  | 'new_hole'
  | 'motion_sensor'
  | 'rustle_detected'
  | 'footprints'

export type FarmSignalSource = 'brief' | 'generated' | 'market_sample' | 'binance_live'

export type DataMode = 'brief' | 'seeded' | 'market_sample' | 'live_market'

export type FarmSignalEvent = {
  id: string
  event: FarmEventType
  location: string
  count: number
  intensity: number
  time: string
  source: FarmSignalSource
  evidence?: Record<string, number | string>
}

export type EventWeights = Record<FarmEventType, number>

export type ScoringParameters = {
  noiseLevel: number
  sensorSensitivity: number
  falsePositiveRate: number
  rabbitScale: number
  eventWeights: EventWeights
}

export type GeneratorParameters = {
  seed: number
  eventCount: number
  hiddenPressure: number
  noiseLevel: number
  sensorSensitivity: number
  falsePositiveRate: number
}

export type NormalizedSignal = FarmSignalEvent & {
  baseSignal: number
  weightedSignal: number
  recencyFactor: number
  noiseAdjustment: number
  finalSignal: number
}

export type SignalContribution = {
  event: FarmEventType
  value: number
  percent: number
}

export type LocationRisk = {
  location: string
  value: number
  percent: number
}

export type RecommendationCode =
  | 'secure_high_risk_zone'
  | 'collect_more_evidence'
  | 'inspect_sensors'
  | 'rebalance_carrots'
  | 'watch_market_impulse'

export type Recommendation = {
  code: RecommendationCode
  severity: 'info' | 'watch' | 'urgent'
  location?: string
  signal?: FarmEventType
}

export type ScoringResult = {
  recalculationId: string
  totalEvents: number
  hiddenActivity: number
  estimatedRabbits: number
  confidence: number
  strongestSignal: FarmEventType | null
  highestRiskLocation: string | null
  normalizedSignals: NormalizedSignal[]
  contributionsByType: SignalContribution[]
  locationRisks: LocationRisk[]
  recommendations: Recommendation[]
}
