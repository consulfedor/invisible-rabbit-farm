export const clamp = (value: number, min: number, max: number): number => (
  Math.min(max, Math.max(min, value))
)

export const roundTo = (value: number, digits = 2): number => {
  const multiplier = 10 ** digits
  return Math.round(value * multiplier) / multiplier
}

export const sumBy = <T>(items: T[], selector: (item: T) => number): number => (
  items.reduce((total, item) => total + selector(item), 0)
)

export const stableHash = (value: unknown): string => {
  const serialized = JSON.stringify(value)
  let hash = 2166136261
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16)
}
