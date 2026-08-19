import type { Fact } from '../data/types'

/** Map a 0-100 score to an accessible-ish color: red -> amber -> green. */
export function scoreColor(value: number): string {
  const clamped = Math.max(0, Math.min(100, value))
  const hue = clamped * 1.4
  return `hsl(${hue} 70% 42%)`
}

export function formatNumber(n: number): string {
  const abs = Math.abs(n)
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-3)) {
    return n.toExponential(2)
  }
  return new Intl.NumberFormat('en', {
    notation: abs >= 1e6 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(n)
}

export function formatFactValue(fact: Fact): string {
  if (typeof fact.value === 'boolean') {
    return fact.value ? 'yes' : 'no'
  }
  if (typeof fact.value === 'number') {
    const formatted = formatNumber(fact.value)
    return fact.unit ? `${formatted} ${fact.unit}` : formatted
  }
  return fact.unit ? `${fact.value} ${fact.unit}` : fact.value
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
}
