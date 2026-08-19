import { Link } from 'react-router-dom'
import { dataset } from '../data/dataset'
import { listSubjects } from '../data/scoring'
import { EntityCard } from '../components/EntityCard'
import { companyById, modelById } from '../data/selectors'

export function ModelsPage() {
  const models = listSubjects(dataset, 'model')

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Models</h1>
      <p className="text-neutral-500">
        {models.length} models tracked.
      </p>
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
    </div>
  )
}
