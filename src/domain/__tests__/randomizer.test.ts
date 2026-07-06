import { describe, expect, it } from 'vitest'
import { generateSeededFarmEvents } from '../randomizer'
import type { GeneratorParameters } from '../types'

const params: GeneratorParameters = {
  seed: 1447,
  eventCount: 16,
  hiddenPressure: 0.64,
  noiseLevel: 0.24,
  sensorSensitivity: 0.72,
  falsePositiveRate: 0.12,
}

describe('generateSeededFarmEvents', () => {
  it('is deterministic for the same seed and settings', () => {
    expect(generateSeededFarmEvents(params)).toEqual(generateSeededFarmEvents(params))
  })

  it('changes the generated stream when the seed changes', () => {
    const first = generateSeededFarmEvents(params)
    const second = generateSeededFarmEvents({ ...params, seed: params.seed + 1 })

    expect(second).not.toEqual(first)
  })

  it('caps event count into a safe UI range', () => {
    expect(generateSeededFarmEvents({ ...params, eventCount: 999 })).toHaveLength(120)
    expect(generateSeededFarmEvents({ ...params, eventCount: 0 })).toHaveLength(1)
  })
})
