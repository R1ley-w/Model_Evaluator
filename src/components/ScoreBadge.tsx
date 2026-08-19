import { scoreColor } from '../lib/format'

interface Props {
  value: number | null
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-2xl px-4 py-2',
} as const

export function ScoreBadge({ value, size = 'md' }: Props) {
  if (value === null) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-neutral-200 font-semibold text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300 ${sizes[size]}`}
      >
        n/a
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold text-white ${sizes[size]}`}
      style={{ backgroundColor: scoreColor(value) }}
      title={`${value.toFixed(1)} / 100`}
    >
      {Math.round(value)}
    </span>
  )
}
