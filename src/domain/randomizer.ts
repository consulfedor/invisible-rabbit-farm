import { FARM_EVENT_TYPES } from './constants'
import { formatMinuteOfDay } from './time'
import type { FarmSignalEvent, GeneratorParameters } from './types'

const LOCATIONS = ['Огород', 'У забора', 'Сарай', 'Теплица', 'Северная грядка', 'Склад моркови']

export const createSeededRng = (seed: number): (() => number) => {
  let state = Math.trunc(seed) || 1
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0xffffffff
  }
}

const pick = <T>(items: T[], rng: () => number): T => (
  items[Math.min(items.length - 1, Math.floor(rng() * items.length))]
)

export const generateSeededFarmEvents = (params: GeneratorParameters): FarmSignalEvent[] => {
  const rng = createSeededRng(params.seed)
  const eventCount = Math.max(1, Math.min(120, Math.trunc(params.eventCount)))
  const hiddenPressure = Math.max(0, Math.min(1, params.hiddenPressure))
  const noise = Math.max(0, Math.min(1, params.noiseLevel))
  const sensitivity = Math.max(0, Math.min(1, params.sensorSensitivity))
  const falsePositive = Math.max(0, Math.min(1, params.falsePositiveRate))

  return Array.from({ length: eventCount }, (_, index) => {
    const isFalsePositive = rng() < falsePositive
    const event = pick(FARM_EVENT_TYPES, rng)
    const location = pick(LOCATIONS, rng)
    const base = 1 + hiddenPressure * 7 + rng() * 4
    const noisyFactor = isFalsePositive
      ? 0.32 + rng() * 0.42
      : 0.72 + rng() * (0.75 + sensitivity * 0.5)
    const count = Math.max(1, Math.round(base * noisyFactor + noise * rng() * 5))
    const intensity = Math.max(1, Math.min(10, Math.round((base + sensitivity * 4 + rng() * 5) * noisyFactor)))
    const minutes = 7 * 60 + index * Math.max(8, Math.round(300 / eventCount)) + Math.round(rng() * 9)

    return {
      id: `gen_${params.seed}_${String(index + 1).padStart(3, '0')}`,
      event,
      location,
      count,
      intensity,
      time: formatMinuteOfDay(minutes),
      source: 'generated',
      evidence: {
        hiddenPressure: Number(hiddenPressure.toFixed(2)),
        noise: Number(noise.toFixed(2)),
        sensitivity: Number(sensitivity.toFixed(2)),
        falsePositive: isFalsePositive ? 'yes' : 'no',
      },
    }
  })
}
