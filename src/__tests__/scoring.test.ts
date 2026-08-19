import { describe, expect, it } from 'vitest'
import { dataset } from '../data/dataset'
import {
  blendedCriterionScore,
  criterionScores,
  latestScore,
  overallScore,
  rankSubjects,
  scoreHistory,
} from '../data/scoring'
import type { Dataset, Score } from '../data/types'

const blend = { editorial: 0.5, rubric: 0.4, community: 0.1 }

function makeDataset(scores: Score[]): Dataset {
  return {
    meta: {
      title: 'test',
      version: '1',
      generatedAt: '2024-01-01T00:00:00Z',
      generator: 'test',
      methodology: 'https://example.com',
    },
    rubric: {
      version: '1',
      scale: { min: 0, max: 100 },
      method: { blend },
      criteria: [
        {
          id: 'transparency',
          name: 'Transparency',
          description: '',
          scope: 'both',
          weight: 0.15,
          indicators: [],
        },
      ],
    },
    sources: [],
    companies: [],
    models: [],
    scores,
    snapshots: [],
  }
}

function score(
  id: string,
  overrides: Partial<Score> = {},
): Score {
  return {
    id,
    subjectId: 'gpt-4',
    subjectType: 'model',
    criterionId: 'transparency',
    type: 'editorial',
    value: 50,
    asOf: '2024-01-01',
    ...overrides,
  }
}

describe('blendedCriterionScore', () => {
  it('returns the single score when only one type exists', () => {
    expect(blendedCriterionScore(dataset, 'gpt-4', 'model', 'transparency')).toBeCloseTo(55)
  })

  it('blends editorial, rubric, and community by method weights', () => {
    const d = makeDataset([
      score('e', { type: 'editorial', value: 60 }),
      score('r', { type: 'rubric', value: 40 }),
      score('c', { type: 'community', value: 80 }),
    ])
    const expected = 60 * 0.5 + 40 * 0.4 + 80 * 0.1
    expect(blendedCriterionScore(d, 'gpt-4', 'model', 'transparency')).toBeCloseTo(expected)
  })

  it('returns null when there are no scores', () => {
    expect(blendedCriterionScore(makeDataset([]), 'gpt-4', 'model', 'transparency')).toBeNull()
  })
})

describe('latestScore', () => {
  it('picks the most recent score at or before asOf', () => {
    const d = makeDataset([
      score('a', { asOf: '2024-01-01', value: 10 }),
      score('b', { asOf: '2024-06-01', value: 20 }),
    ])
    expect(latestScore(d, 'gpt-4', 'model', 'transparency', '2024-03-01')?.value).toBe(10)
    expect(latestScore(d, 'gpt-4', 'model', 'transparency')?.value).toBe(20)
  })
})

describe('scoreHistory', () => {
  it('returns scores sorted oldest first', () => {
    const d = makeDataset([
      score('b', { asOf: '2024-06-01' }),
      score('a', { asOf: '2024-01-01' }),
    ])
    expect(scoreHistory(d, 'gpt-4', 'model', 'transparency').map((s) => s.id)).toEqual([
      'a',
      'b',
    ])
  })
})

describe('overallScore', () => {
  it('weights criteria by their rubric weight', () => {
    const s = overallScore(dataset, 'gpt-4', 'model')
    expect(s.covered).toBe(1)
    expect(s.total).toBe(4)
    expect(s.value).toBeCloseTo(55)
  })
})

describe('criterionScores', () => {
  it('only returns criteria applicable to the subject type', () => {
    const entries = criterionScores(dataset, 'gpt-4', 'model')
    const ids = entries.map((e) => e.criterion.id)
    expect(ids).toEqual(['carbon', 'transparency', 'openness', 'safety'])
  })
})

describe('rankSubjects', () => {
  it('ranks models highest overall score first', () => {
    const ranked = rankSubjects(dataset, 'model')
    expect(ranked.map((r) => r.id)).toEqual(['llama-3-70b', 'gpt-4'])
  })
})
