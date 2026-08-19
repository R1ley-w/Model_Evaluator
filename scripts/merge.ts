import type { Fact } from '../src/data/types'
import { loadDataset } from './lib/dataset'
import { DATASET_PATH, readJson, writeJson } from './lib/io'
import { RAW_DIR } from './lib/io'

interface EpochModel {
  found: boolean
  releaseDate?: string
  openWeights?: boolean
  facts?: Fact[]
}
interface HfModel {
  found: boolean
  license?: string
  facts?: Fact[]
}
interface EpochRaw {
  fetchedAt: string
  models: Record<string, EpochModel>
}
interface HfRaw {
  fetchedAt: string
  models: Record<string, HfModel>
}
interface AiidRaw {
  fetchedAt: string
  snapshotDate: string
  totalIncidents: number
  incidents: Record<string, number>
}

function readOptional<T>(path: string): T | null {
  try {
    return readJson<T>(path)
  } catch {
    return null
  }
}

function stripGenerated(facts: Fact[] | undefined, prefixes: string[]): Fact[] {
  return (facts ?? []).filter((f) => !prefixes.some((p) => f.id.startsWith(p)))
}

function run(): void {
  const dataset = loadDataset()

  const epoch = readOptional<EpochRaw>(`${RAW_DIR}/epoch.json`)
  const hf = readOptional<HfRaw>(`${RAW_DIR}/hf.json`)
  const aiid = readOptional<AiidRaw>(`${RAW_DIR}/aiid.json`)

  if (!epoch && !hf && !aiid) {
    console.error('No raw data found. Run `npm run data:fetch` first.')
    process.exit(1)
  }

  let addedFacts = 0

  for (const model of dataset.models) {
    const before = stripGenerated(model.facts, ['epoch-', 'hf-']).length
    let facts = stripGenerated(model.facts, ['epoch-', 'hf-'])

    const em = epoch?.models[model.id]
    if (em?.found) {
      facts = [...facts, ...(em.facts ?? [])]
      if (!model.releaseDate && em.releaseDate) model.releaseDate = em.releaseDate
      if (typeof em.openWeights === 'boolean') model.openWeights = em.openWeights
    }

    const hm = hf?.models[model.id]
    if (hm?.found) {
      facts = [...facts, ...(hm.facts ?? [])]
      if (!model.license && hm.license) model.license = hm.license
    }

    addedFacts += facts.length - before
    model.facts = facts
  }

  for (const company of dataset.companies) {
    const before = stripGenerated(company.facts, ['aiid-']).length
    let facts = stripGenerated(company.facts, ['aiid-'])

    const count = aiid?.incidents[company.id]
    if (typeof count === 'number') {
      facts = [
        ...facts,
        {
          id: `aiid-${company.id}-incidents`,
          metric: 'aiIncidents',
          value: count,
          unit: 'incidents',
          status: 'disclosed',
          asOf: aiid?.snapshotDate ?? new Date().toISOString().slice(0, 10),
          sourceIds: ['aiid'],
          confidenceLabel: 'high',
          notes: 'Incidents where the company is the alleged developer',
        },
      ]
    }

    addedFacts += facts.length - before
    company.facts = facts
  }

  dataset.meta.generatedAt = new Date().toISOString()
  dataset.meta.generator = 'data-pipeline'

  writeJson(DATASET_PATH, dataset)
  console.log(
    `merge: wrote ${DATASET_PATH} (${dataset.companies.length} companies, ${dataset.models.length} models, ${dataset.scores.length} scores, ${addedFacts} facts added)`,
  )
}

run()
