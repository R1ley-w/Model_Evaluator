import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Dataset, SubjectType } from '../data/types'
import { scoreHistory } from '../data/scoring'

interface Props {
  dataset: Dataset
  subjectId: string
  subjectType: SubjectType
  criterionId: string
  criterionName: string
}

export function ScoreTrend({ dataset, subjectId, subjectType, criterionId, criterionName }: Props) {
  const history = scoreHistory(dataset, subjectId, subjectType, criterionId)
  if (history.length < 2) return null

  const data = history.map((s) => ({ asOf: s.asOf, value: s.value }))

  return (
    <div>
      <h4 className="mb-1 text-sm font-medium text-neutral-500">
        {criterionName} over time
      </h4>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -30 }}>
          <XAxis dataKey="asOf" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
