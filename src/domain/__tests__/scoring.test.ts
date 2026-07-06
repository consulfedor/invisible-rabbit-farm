import { describe, expect, it } from 'vitest'
import { briefSampleEvents } from '../../data/briefSample'
import { DEFAULT_SCORING_PARAMETERS } from '../constants'
import { scoreRabbitActivity } from '../scoring'

describe('scoreRabbitActivity', () => {
  it('calculates explainable hidden-state outputs for the brief sample', () => {
    const result = scoreRabbitActivity(briefSampleEvents, DEFAULT_SCORING_PARAMETERS)

    expect(result.totalEvents).toBe(5)
    expect(result.estimatedRabbits).toBeGreaterThan(0)
    expect(result.confidence).toBeGreaterThan(30)
    expect(result.strongestSignal).not.toBeNull()
    expect(result.highestRiskLocation).not.toBeNull()
    expect(result.contributionsByType).toHaveLength(5)
    expect(result.locationRisks.length).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('reacts visibly when a signal weight is changed', () => {
    const baseline = scoreRabbitActivity(briefSampleEvents, DEFAULT_SCORING_PARAMETERS)
    const amplified = scoreRabbitActivity(briefSampleEvents, {
      ...DEFAULT_SCORING_PARAMETERS,
      eventWeights: {
        ...DEFAULT_SCORING_PARAMETERS.eventWeights,
        missing_carrot: 1.8,
      },
    })

    expect(amplified.recalculationId).not.toBe(baseline.recalculationId)
    expect(amplified.hiddenActivity).toBeGreaterThan(baseline.hiddenActivity)
  })

  it('penalizes high-noise/high-false-positive conditions in confidence', () => {
    const clean = scoreRabbitActivity(briefSampleEvents, {
      noiseLevel: 0.05,
      falsePositiveRate: 0.02,
      sensorSensitivity: 0.9,
    })
    const noisy = scoreRabbitActivity(briefSampleEvents, {
      noiseLevel: 0.92,
      falsePositiveRate: 0.85,
      sensorSensitivity: 0.35,
    })

    expect(noisy.confidence).toBeLessThan(clean.confidence)
  })
})
