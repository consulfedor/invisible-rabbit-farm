import type { EventWeights, FarmEventType, ScoringParameters } from './types'

export const FARM_EVENT_TYPES: FarmEventType[] = [
  'missing_carrot',
  'new_hole',
  'motion_sensor',
  'rustle_detected',
  'footprints',
]

export const DEFAULT_EVENT_WEIGHTS: EventWeights = {
  missing_carrot: 1.25,
  new_hole: 1.2,
  motion_sensor: 1.15,
  rustle_detected: 0.82,
  footprints: 1.05,
}

export const DEFAULT_SCORING_PARAMETERS: ScoringParameters = {
  noiseLevel: 0.28,
  sensorSensitivity: 0.74,
  falsePositiveRate: 0.18,
  rabbitScale: 1.0,
  eventWeights: DEFAULT_EVENT_WEIGHTS,
}
