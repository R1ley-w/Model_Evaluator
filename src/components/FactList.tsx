import type { Dataset, Fact } from '../data/types'
import { sourcesByIds } from '../data/selectors'
import { formatFactValue } from '../lib/format'

const metricLabels: Record<string, string> = {
  parameters: 'Parameters',
  trainingComputeFlop: 'Training compute',
  trainingDatasetSize: 'Training dataset size',
  trainingCostUsd: 'Training cost',
  trainingTimeDays: 'Training time',
  trainingTimeHours: 'Training time',
  trainingPowerDrawW: 'Training power draw',
  trainingEmissionsKgCO2e: 'Training emissions',
  trainingEnergyKwh: 'Training energy',
  inferenceEnergyKwhPer1k: 'Inference energy',
  aiIncidents: 'AI incidents',
  scope1EmissionsTco2e: 'Scope 1 emissions',
  scope2EmissionsTco2e: 'Scope 2 emissions',
  scope3EmissionsTco2e: 'Scope 3 emissions',
  renewableSharePercent: 'Renewable share',
  waterUseMegaliters: 'Water use',
  dataCenterPue: 'Data center PUE',
  totalEnergyKwh: 'Total energy',
}

const statusStyles: Record<string, string> = {
  disclosed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  estimated: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  speculative: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  'not-disclosed': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

function FactRow({ dataset, fact }: { dataset: Dataset; fact: Fact }) {
  const sources = sourcesByIds(dataset, fact.sourceIds)
  return (
    <li className="flex items-start justify-between gap-4 py-2">
      <div>
        <p className="font-medium">
          {metricLabels[fact.metric] ?? fact.metric}
        </p>
        {fact.status && (
          <span
            className={`mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${statusStyles[fact.status] ?? 'bg-neutral-100 text-neutral-600'}`}
          >
            {fact.status}
          </span>
        )}
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatFactValue(fact)}</p>
        {sources.length > 0 && (
          <p className="text-xs text-neutral-400">
            {sources.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="ml-1 underline hover:text-neutral-600"
                title={s.title}
              >
                {s.publisher ?? s.type}
              </a>
            ))}
          </p>
        )}
      </div>
    </li>
  )
}

export function FactList({ dataset, facts }: { dataset: Dataset; facts?: Fact[] }) {
  if (!facts || facts.length === 0) {
    return <p className="text-sm text-neutral-500">No facts recorded.</p>
  }

  return (
    <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
      {facts.map((f) => (
        <FactRow key={f.id} dataset={dataset} fact={f} />
      ))}
    </ul>
  )
}
