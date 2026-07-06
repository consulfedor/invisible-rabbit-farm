import { FARM_EVENT_TYPES } from '../domain/constants'
import type { FarmEventType, FarmSignalEvent, FarmSignalSource } from '../domain/types'

const normalizeEventType = (value: unknown): FarmEventType => (
  FARM_EVENT_TYPES.includes(value as FarmEventType) ? value as FarmEventType : 'rustle_detected'
)

export const normalizeFarmEvents = (
  events: FarmSignalEvent[],
  source: FarmSignalSource,
): FarmSignalEvent[] => events.map((event, index) => ({
  ...event,
  id: event.id || `${source}_${index + 1}`,
  event: normalizeEventType(event.event),
  location: event.location || 'Unknown zone',
  source,
  count: Number.isFinite(Number(event.count)) ? Math.max(0, Number(event.count)) : 0,
  intensity: Number.isFinite(Number(event.intensity)) ? Math.max(0, Math.min(10, Number(event.intensity))) : 0,
  time: event.time || '00:00',
  evidence: event.evidence ?? {},
}))

export const safeParseFarmEventsJson = (value: string): { ok: true; events: FarmSignalEvent[] } | { ok: false; error: string } => {
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return { ok: false, error: 'JSON root must be an array' }
    }
    return { ok: true, events: normalizeFarmEvents(parsed as FarmSignalEvent[], 'brief') }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Invalid JSON' }
  }
}
