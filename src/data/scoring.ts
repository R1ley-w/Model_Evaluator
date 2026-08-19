import type {
  Criterion,
  Dataset,
  Score,
  ScoreType,
  SubjectType,
} from './types'

export interface ScoreSummary {
  value: number
  covered: number
  total: number
}

const SCORE_TYPES: ScoreType[] = ['editorial', 'rubric', 'community']

export function scoresFor(
  dataset: Dataset,
  subjectId: string,
  subjectType: SubjectType,
  criterionId: string,
): Score[] {
  return dataset.scores.filter(
    (s) =>
      s.subjectId === subjectId &&
      s.subjectType === subjectType &&
      s.criterionId === criterionId,
  )
}

function byAsOfDesc(a: Score, b: Score): number {
  if (a.asOf === b.asOf) return a.id.localeCompare(b.id)
  return a.asOf < b.asOf ? 1 : -1
}

/** Latest score for a subject + criterion, optionally at or before `asOf`. */
export function latestScore(
  dataset: Dataset,
  subjectId: string,
  subjectType: SubjectType,
  criterionId: string,
  asOf?: string,
): Score | undefined {
  const eligible = scoresFor(dataset, subjectId, subjectType, criterionId).filter(
    (s) => (asOf ? s.asOf <= asOf : true),
  )
  eligible.sort(byAsOfDesc)
  return eligible[0]
}

/**
 * Blend the latest score of each type (editorial / rubric / community) using
 * the rubric's method.blend weights. A score's explicit `weight` overrides the
 * default weight for its type.
 */
export function blendedCriterionScore(
  dataset: Dataset,
  subjectId: string,
  subjectType: SubjectType,
  criterionId: string,
  asOf?: string,
): number | null {
  const blend = dataset.rubric.method.blend
  let weighted = 0
  let total = 0

  for (const type of SCORE_TYPES) {
    const scores = scoresFor(dataset, subjectId, subjectType, criterionId)
      .filter((s) => s.type === type && (!asOf || s.asOf <= asOf))
      .sort(byAsOfDesc)
    const score = scores[0]
    if (!score) continue

    const w = score.weight ?? blend[type] ?? 0
    weighted += score.value * w
    total += w
  }

  return total > 0 ? weighted / total : null
}

/** Criteria whose scope applies to a subject of the given type. */
export function applicableCriteria(
  dataset: Dataset,
  subjectType: SubjectType,
): Criterion[] {
  return dataset.rubric.criteria.filter((c) =>
    subjectType === 'model'
      ? c.scope === 'model' || c.scope === 'both'
      : c.scope === 'company' || c.scope === 'both',
  )
}

/** Blended score per criterion for a subject (for radar charts, etc.). */
export function criterionScores(
  dataset: Dataset,
  subjectId: string,
  subjectType: SubjectType,
  asOf?: string,
): Array<{ criterion: Criterion; value: number | null }> {
  return applicableCriteria(dataset, subjectType).map((criterion) => ({
    criterion,
    value: blendedCriterionScore(
      dataset,
      subjectId,
      subjectType,
      criterion.id,
      asOf,
    ),
  }))
}

/** Weighted overall score across applicable criteria. */
export function overallScore(
  dataset: Dataset,
  subjectId: string,
  subjectType: SubjectType,
  asOf?: string,
): ScoreSummary {
  const entries = criterionScores(dataset, subjectId, subjectType, asOf)

  let weighted = 0
  let weightSum = 0
  let covered = 0

  for (const { criterion, value } of entries) {
    if (value === null) continue
    weighted += value * criterion.weight
    weightSum += criterion.weight
    covered += 1
  }

  return {
    value: weightSum > 0 ? weighted / weightSum : 0,
    covered,
    total: entries.length,
  }
}

/** Ordered list of subjects by overall score (highest first). */
export function rankSubjects(
  dataset: Dataset,
  subjectType: SubjectType,
  asOf?: string,
): Array<{ id: string; name: string; summary: ScoreSummary }> {
  const subjects =
    subjectType === 'model'
      ? dataset.models.map((m) => ({ id: m.id, name: m.name }))
      : dataset.companies.map((c) => ({ id: c.id, name: c.name }))

  return subjects
    .map((s) => ({ ...s, summary: overallScore(dataset, s.id, subjectType, asOf) }))
    .filter((s) => s.summary.covered > 0)
    .sort((a, b) => b.summary.value - a.summary.value)
}

/** All subjects, scored first (descending) then unscored alphabetically. */
export function listSubjects(
  dataset: Dataset,
  subjectType: SubjectType,
  asOf?: string,
): Array<{ id: string; name: string; summary: ScoreSummary }> {
  const subjects =
    subjectType === 'model'
      ? dataset.models.map((m) => ({ id: m.id, name: m.name }))
      : dataset.companies.map((c) => ({ id: c.id, name: c.name }))

  return subjects
    .map((s) => ({ ...s, summary: overallScore(dataset, s.id, subjectType, asOf) }))
    .sort((a, b) => {
      const aScored = a.summary.covered > 0
      const bScored = b.summary.covered > 0
      if (aScored !== bScored) return aScored ? -1 : 1
      if (aScored && bScored) return b.summary.value - a.summary.value
      return a.name.localeCompare(b.name)
    })
}

/** Score history for a subject + criterion, oldest first. */
export function scoreHistory(
  dataset: Dataset,
  subjectId: string,
  subjectType: SubjectType,
  criterionId: string,
): Score[] {
  return scoresFor(dataset, subjectId, subjectType, criterionId).sort((a, b) =>
    a.asOf === b.asOf ? a.id.localeCompare(b.id) : a.asOf < b.asOf ? -1 : 1,
  )
}
