import type { ConfidenceLabel, Fact } from '../src/data/types'
import { loadDataset } from './lib/dataset'
import { csvToObjects } from './lib/csv'
import { ensureDir, fetchText, RAW_DIR, writeJson } from './lib/io'

export const EPOCH_CSV_URL = 'https://epoch.ai/data/all_ai_models.csv'

const CONFIDENCE: Record<string, ConfidenceLabel | undefined> = {
  Confident: 'high',
  Likely: 'medium',
  Speculative: 'low',
}

interface MetricSpec {
  col: string
  metric: string
  unit: string
}

const METRICS: MetricSpec[] = [
  { col: 'Parameters', metric: 'parameters', unit: 'count' },
  { col: 'Training compute (FLOP)', metric: 'trainingComputeFlop', unit: 'FLOP' },
  { col: 'Training dataset size (total)', metric: 'trainingDatasetSize', unit: 'tokens' },
  { col: 'Training compute cost (2023 USD)', metric: 'trainingCostUsd', unit: 'USD' },
  { col: 'Training power draw (W)', metric: 'trainingPowerDrawW', unit: 'W' },
  { col: 'Training time (hours)', metric: 'trainingTimeHours', unit: 'hours' },
]

function num(s: string | undefined): number | null {
  if (!s) return null
  const v = Number(s)
  return Number.isFinite(v) ? v : null
}

function buildFacts(row: Record<string, string>, modelId: string, today: string): Fact[] {
  const confidence = CONFIDENCE[row.Confidence ?? '']

  const facts: Fact[] = []
  for (const { col, metric, unit } of METRICS) {
    const value = num(row[col])
    if (value === null) continue
    facts.push({
      id: `epoch-${modelId}-${metric}`,
      metric,
      value,
      unit,
      status: 'estimated',
      asOf: today,
      sourceIds: ['epoch-models'],
      confidenceLabel: confidence,
      notes: 'Epoch AI estimate',
    })
  }
  return facts
}

async function run(): Promise<void> {
  ensureDir(RAW_DIR)

  const text = await fetchText(EPOCH_CSV_URL)
  const rows = csvToObjects(text)

  const byName = new Map<string, Record<string, string>>()
  for (const row of rows) {
    const name = (row.Model ?? '').trim()
    if (name && !byName.has(name.toLowerCase())) byName.set(name.toLowerCase(), row)
  }

  const dataset = loadDataset()
  const today = new Date().toISOString().slice(0, 10)
  const models: Record<string, unknown> = {}

  for (const model of dataset.models) {
    const epochName = model.externalIds?.epoch
    if (!epochName) continue

    const row = byName.get(epochName.trim().toLowerCase())
    if (!row) {
      models[model.id] = { found: false, epochName }
      continue
    }

    const releaseDate = (row['Publication date'] ?? '').trim()
    const openWeightsRaw = (row['Open model weights?'] ?? '').trim().toLowerCase()

    models[model.id] = {
      found: true,
      epochName,
      releaseDate: releaseDate || undefined,
      openWeights:
        openWeightsRaw === 'yes'
          ? true
          : openWeightsRaw === 'no'
            ? false
            : undefined,
      facts: buildFacts(row, model.id, today),
    }
  }

  writeJson(`${RAW_DIR}/epoch.json`, {
    fetchedAt: new Date().toISOString(),
    source: EPOCH_CSV_URL,
    models,
  })

  const entries = Object.values(models) as Array<{ found: boolean; epochName: string }>
  const found = entries.filter((m) => m.found).length
  const missing = entries.filter((m) => !m.found)
  const total = dataset.models.filter((m) => m.externalIds?.epoch).length

  console.log(`epoch: ${found}/${total} models matched${missing.length ? ` (missing: ${missing.length})` : ''}`)
  for (const m of missing) console.log(`  - missing: ${m.epochName}`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
