import { Link, useParams } from 'react-router-dom'
import { dataset } from '../data/dataset'
import { companyById, modelsByCompany } from '../data/selectors'
import { overallScore } from '../data/scoring'
import { CriteriaRadar } from '../components/CriteriaRadar'
import { CriterionList } from '../components/CriterionList'
import { FactList } from '../components/FactList'
import { ScoreBadge } from '../components/ScoreBadge'
import { NotFoundPage } from './NotFoundPage'

export function CompanyPage() {
  const { id } = useParams<{ id: string }>()
  const company = id ? companyById(dataset, id) : undefined

  if (!company) return <NotFoundPage />

  const summary = overallScore(dataset, company.id, 'company')
  const models = modelsByCompany(dataset, company.id)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          to="/companies"
          className="text-sm text-indigo-500 hover:underline"
        >
          &larr; All companies
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="mt-1 text-neutral-500">
              {[company.country, company.founded ? `founded ${company.founded}` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
            {company.url && (
              <a
                href={company.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-500 hover:underline"
              >
                {company.url}
              </a>
            )}
          </div>
          <ScoreBadge value={summary.covered > 0 ? summary.value : null} size="lg" />
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-2 font-semibold">Score profile</h2>
          <CriteriaRadar dataset={dataset} subjectId={company.id} subjectType="company" />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 font-semibold">Criteria</h2>
          <CriterionList dataset={dataset} subjectId={company.id} subjectType="company" />
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-2 font-semibold">Environmental &amp; operational facts</h2>
        <FactList dataset={dataset} facts={company.facts} />
      </section>

      {models.length > 0 && (
        <section className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="mb-3 font-semibold">Models</h2>
          <ul className="flex flex-wrap gap-2">
            {models.map((m) => (
              <li key={m.id}>
                <Link
                  to={`/models/${m.id}`}
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:border-indigo-400 dark:border-neutral-700"
                >
                  {m.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
