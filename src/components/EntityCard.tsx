import type { Dataset, SubjectType } from '../data/types'
import { overallScore } from '../data/scoring'
import { ScoreBadge } from './ScoreBadge'

interface Props {
  dataset: Dataset
  subjectType: SubjectType
  subjectId: string
  name: string
  subtitle?: string
}

export function EntityCard({ dataset, subjectType, subjectId, name, subtitle }: Props) {
  const summary = overallScore(dataset, subjectId, subjectType)

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 p-4 transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-500">
      <div className="min-w-0">
        <h3 className="truncate font-semibold">{name}</h3>
        {subtitle && (
          <p className="truncate text-sm text-neutral-500">{subtitle}</p>
        )}
        <p className="mt-1 text-xs text-neutral-400">
          {summary.covered}/{summary.total} criteria scored
        </p>
      </div>
      <ScoreBadge value={summary.covered > 0 ? summary.value : null} size="lg" />
    </div>
  )
}
