import type { Dataset, SubjectType } from '../data/types'
import { criterionScores } from '../data/scoring'
import { scoreColor } from '../lib/format'

interface Props {
  dataset: Dataset
  subjectId: string
  subjectType: SubjectType
}

export function CriterionList({ dataset, subjectId, subjectType }: Props) {
  const entries = criterionScores(dataset, subjectId, subjectType)

  return (
    <ul className="flex flex-col gap-3">
      {entries.map(({ criterion, value }) => {
        const color = value === null ? undefined : scoreColor(value)
        return (
          <li key={criterion.id} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
            <div className="mb-1 flex items-center justify-between gap-2">
              <div>
                <span className="font-medium">{criterion.name}</span>
                <span className="ml-2 text-xs text-neutral-400">
                  weight {(criterion.weight * 100).toFixed(0)}%
                </span>
              </div>
              <span className="font-semibold" style={{ color }}>
                {value === null ? '—' : Math.round(value)}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${value ?? 0}%`,
                  backgroundColor: color ?? '#888',
                }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
