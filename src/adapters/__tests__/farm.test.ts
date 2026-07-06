import { describe, expect, it } from 'vitest'
import { normalizeFarmEvents, safeParseFarmEventsJson } from '../farm'
import type { FarmSignalEvent } from '../../domain/types'

describe('farm adapter', () => {
  it('normalizes numeric fields and source in editable events', () => {
    const events = normalizeFarmEvents([
      {
        id: '',
        event: 'unknown_signal' as FarmSignalEvent['event'],
        location: '',
        count: -2,
        intensity: 99,
        time: '',
        source: 'brief',
      },
    ] as FarmSignalEvent[], 'generated')

    expect(events[0].id).toBe('generated_1')
    expect(events[0].event).toBe('rustle_detected')
    expect(events[0].location).toBe('Unknown zone')
    expect(events[0].source).toBe('generated')
    expect(events[0].count).toBe(0)
    expect(events[0].intensity).toBe(10)
    expect(events[0].time).toBe('00:00')
  })

  it('fails gracefully for invalid JSON', () => {
    const parsed = safeParseFarmEventsJson('{not-json')

    expect(parsed.ok).toBe(false)
    if (!parsed.ok) expect(parsed.error.length).toBeGreaterThan(0)
  })

  it('requires an array JSON root for event import', () => {
    const parsed = safeParseFarmEventsJson('{"id":"evt"}')

    expect(parsed.ok).toBe(false)
    if (!parsed.ok) expect(parsed.error).toContain('array')
  })
})
