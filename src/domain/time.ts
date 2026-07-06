export const parseEventMinutes = (time: string): number => {
  const hhmm = /^(\d{1,2}):(\d{2})$/.exec(time)
  if (hhmm) {
    return Number(hhmm[1]) * 60 + Number(hhmm[2])
  }

  const parsed = Date.parse(time)
  if (Number.isFinite(parsed)) {
    const date = new Date(parsed)
    return date.getUTCHours() * 60 + date.getUTCMinutes()
  }

  return 0
}

export const formatMinuteOfDay = (minutes: number): string => {
  const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const mins = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}
