export type SubjectType = 'company' | 'model'
export type ScoreType = 'editorial' | 'rubric' | 'community'
export type CriterionScope = 'model' | 'company' | 'both'
export type IndicatorValueType =
  | 'quantitative'
  | 'rating'
  | 'enum'
  | 'boolean'
  | 'text'
export type Direction = 'higher-better' | 'lower-better' | 'informational'
export type FactStatus = 'disclosed' | 'estimated' | 'speculative' | 'not-disclosed'
export type ConfidenceLabel = 'high' | 'medium' | 'low' | 'speculative'
export type SourceType =
  | 'report'
  | 'paper'
  | 'dataset'
  | 'model-card'
  | 'news'
  | 'website'
export type ModelKind = 'language' | 'image' | 'multimodal' | 'audio' | 'other'

export interface Meta {
  title: string
  version: string
  generatedAt: string
  generator: string
  methodology: string
  license?: string
}

export interface Scale {
  min: number
  max: number
}

export interface BlendMethod {
  editorial: number
  rubric: number
  community: number
}

export interface RubricMethod {
  blend: BlendMethod
}

export interface Indicator {
  id: string
  name: string
  description: string
  weight: number
  valueType: IndicatorValueType
  unit?: string
  direction?: Direction
}

export interface Criterion {
  id: string
  name: string
  description: string
  scope: CriterionScope
  weight: number
  indicators: Indicator[]
}

export interface Rubric {
  version: string
  scale: Scale
  method: RubricMethod
  criteria: Criterion[]
}

export interface Source {
  id: string
  title: string
  type: SourceType
  url?: string
  publisher?: string
  publishedAt?: string
  accessedAt?: string
  license?: string
}

export interface Fact {
  id: string
  metric: string
  value: number | string | boolean
  unit?: string
  status?: FactStatus
  asOf: string
  sourceIds: string[]
  confidence?: number
  confidenceLabel?: ConfidenceLabel
  notes?: string
}

export interface Company {
  id: string
  name: string
  aliases?: string[]
  country?: string
  founded?: number
  url?: string
  externalIds?: Record<string, string>
  facts?: Fact[]
  notes?: string
}

export interface Model {
  id: string
  name: string
  companyId: string
  family?: string
  type?: ModelKind
  releaseDate?: string
  openWeights?: boolean
  license?: string
  url?: string
  externalIds?: Record<string, string>
  facts?: Fact[]
  notes?: string
}

export interface Score {
  id: string
  subjectId: string
  subjectType: SubjectType
  criterionId: string
  indicatorId?: string
  type: ScoreType
  value: number
  weight?: number
  asOf: string
  sourceIds?: string[]
  confidence?: number
  confidenceLabel?: ConfidenceLabel
  sampleSize?: number
  rationale?: string
  reviewer?: string
}

export interface Snapshot {
  id: string
  capturedAt: string
  note?: string
  scoreIds?: string[]
}

export interface Dataset {
  meta: Meta
  rubric: Rubric
  sources: Source[]
  companies: Company[]
  models: Model[]
  scores: Score[]
  snapshots: Snapshot[]
}
