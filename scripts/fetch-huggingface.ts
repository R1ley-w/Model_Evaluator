import type { Fact } from '../src/data/types'
import { loadDataset } from './lib/dataset'
import { ensureDir, fetchText, RAW_DIR, writeJson } from './lib/io'

const HF_API = 'https://huggingface.co/api/models'

interface HfModel {
  id?: string
  gated?: string | false | null
  private?: boolean
  tags?: string[]
  cardData?: {
    license?: string
    co2_eq_emissions?:
      | number
      | {
          emissions?: number
          source?: string
          training_type?: string
          geographical_location?: string
          energy_consumed?: number
        }
  }
}

function licenseFromTags(tags: string[] | undefined): string | undefined {
  if (!tags) return undefined
  const tag = tags.find((t) => t.startsWith('license:'))
  return tag ? tag.slice('license:'.length) : undefined
}

function emissionsKg(cardData: HfModel['cardData']): number | null {
  const co2 = cardData?.co2_eq_emissions
  if (co2 === undefined || co2 === null) return null
  const grams = typeof co2 === 'number' ? co2 : co2.emissions
  if (typeof grams !== 'number' || !Number.isFinite(grams)) return null
  return grams / 1000
}

function buildFacts(modelId: string, kg: number, today: string): Fact[] {
  if (kg === null) return []
  return [
    {
      id: `hf-${modelId}-emissions`,
      metric: 'trainingEmissionsKgCO2e',
      value: kg,
      unit: 'kgCO2e',
      status: 'disclosed',
      asOf: today,
      sourceIds: ['hf-hub'],
      confidenceLabel: 'medium',
      notes: 'Self-reported on Hugging Face model card',
    },
  ]
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function run(): Promise<void> {
  ensureDir(RAW_DIR)
  const dataset = loadDataset()
  const today = new Date().toISOString().slice(0, 10)
  const models: Record<string, unknown> = {}

  const targets = dataset.models.filter((m) => m.externalIds?.hf)
  let ok = 0

  for (const model of targets) {
    const hfId = model.externalIds!.hf!
    try {
      const text = await fetchText(`${HF_API}/${hfId}`)
      const info = JSON.parse(text) as HfModel

      const kg = emissionsKg(info.cardData)
      const license = info.cardData?.license ?? licenseFromTags(info.tags)

      models[model.id] = {
        found: true,
        hfId,
        license,
        gated: info.gated ?? false,
        private: info.private ?? false,
        emissionsKgCO2e: kg,
        facts: buildFacts(model.id, kg, today),
      }
      ok += 1
    } catch (err) {
      models[model.id] = {
        found: false,
        hfId,
        error: err instanceof Error ? err.message : String(err),
      }
    }
    await sleep(150)
  }

  writeJson(`${RAW_DIR}/hf.json`, {
    fetchedAt: new Date().toISOString(),
    models,
  })

  console.log(`huggingface: ${ok}/${targets.length} models fetched`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
