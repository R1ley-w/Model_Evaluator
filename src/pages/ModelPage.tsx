import { Link, useParams } from 'react-router-dom'
import { dataset } from '../data/dataset'
import { companyById, modelById } from '../data/selectors'
import { overallScore } from '../data/scoring'
import { CriteriaRadar } from '../components/CriteriaRadar'
import { CriterionList } from '../components/CriterionList'
import { FactList } from '../components/FactList'
import { ScoreBadge } from '../components/ScoreBadge'
import { NotFoundPage } from './NotFoundPage'

export function ModelPage() {
  const { id } = useParams<{ id: string }>()
  const model = id ? modelById(dataset, id) : undefined

  if (!model) return <NotFoundPage />

  const summary = overallScore(dataset, model.id, 'model')
  const company = companyById(dataset, model.companyId)

  const meta = [
    model.family ? `family ${model.family}` : null,
    model.releaseDate ? `released ${model.releaseDate}` : null,
    model.openWeights ? 'open weights' : null,
    model.license ?? null,
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link to="/models" className="text-sm text-indigo-500 hover:underline">
          &larr; All models
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{model.name}</h1>
            {company && (
              <p className="mt-1">
                by{' '}
                <Link
                  to={`/companies/${company.id}`}
                  className="text-indigo-500 hover:underline"
                >
                  {company.name}
                </Link>
              </p>
            )}
            {meta.length > 0 && (
              <p className="mt-1 text-sm text-neutral-500">{meta.join(' · ')}</p>
            )}
            {model.url && (
              <a
                href={model.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-500 hover:underline"
              >
                {model.url}
              </a>
            )}
          </div>
          <ScoreBadge value={summary.covered > 0 ? summary.value : null} size="lg" />
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-2 font-semibold">Score profile</h2>
          <CriteriaRadar dataset={dataset} subjectId={model.id} subjectType="model" />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 font-semibold">Criteria</h2>
          <CriterionList dataset={dataset} subjectId={model.id} subjectType="model" />
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-2 font-semibold">Technical &amp; environmental facts</h2>
        <FactList dataset={dataset} facts={model.facts} />
      </section>
    </div>
  )
}
