import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import type { Dataset, SubjectType } from '../data/types'
import { criterionScores, overallScore } from '../data/scoring'
import { scoreColor } from '../lib/format'

interface Props {
  dataset: Dataset
  subjectId: string
  subjectType: SubjectType
}

export function CriteriaRadar({ dataset, subjectId, subjectType }: Props) {
  const entries = criterionScores(dataset, subjectId, subjectType)
  const data = entries
    .filter((e) => e.value !== null)
    .map((e) => ({
      criterion: e.criterion.name,
      value: Math.round(e.value as number),
    }))

  if (data.length === 0) {
    return <p className="text-sm text-neutral-500">No scores recorded yet.</p>
  }

  const summary = overallScore(dataset, subjectId, subjectType)
  const color = scoreColor(summary.value)

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid strokeOpacity={0.3} />
        <PolarAngleAxis
          dataKey="criterion"
          tick={{ fontSize: 12, fill: '#888' }}
        />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.35}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
