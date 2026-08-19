import { Link } from 'react-router-dom'
import { dataset } from '../data/dataset'
import { rankSubjects } from '../data/scoring'
import { EntityCard } from '../components/EntityCard'
import { companyById, modelById } from '../data/selectors'

const stats = [
  { label: 'Companies', value: dataset.companies.length },
  { label: 'Models', value: dataset.models.length },
  { label: 'Scores', value: dataset.scores.length },
  { label: 'Sources', value: dataset.sources.length },
]

export function HomePage() {
  const companies = rankSubjects(dataset, 'company').slice(0, 5)
  const models = rankSubjects(dataset, 'model').slice(0, 5)

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-2xl font-bold">Ethical &amp; environmental scores for AI</h1>
        <p className="mt-1 text-neutral-500">
          A transparent, cited assessment of AI models and the companies behind
          them.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-neutral-500">{s.label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Top-rated companies</h2>
          <Link to="/companies" className="text-sm text-indigo-500 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {companies.map((c) => (
            <Link key={c.id} to={`/companies/${c.id}`}>
              <EntityCard
                dataset={dataset}
                subjectType="company"
                subjectId={c.id}
                name={c.name}
              />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Top-rated models</h2>
          <Link to="/models" className="text-sm text-indigo-500 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {models.map((m) => {
            const model = modelById(dataset, m.id)
            const company = model ? companyById(dataset, model.companyId) : undefined
            return (
              <Link key={m.id} to={`/models/${m.id}`}>
                <EntityCard
                  dataset={dataset}
                  subjectType="model"
                  subjectId={m.id}
                  name={m.name}
                  subtitle={company?.name}
                />
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
