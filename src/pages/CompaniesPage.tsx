import { Link } from 'react-router-dom'
import { dataset } from '../data/dataset'
import { rankSubjects } from '../data/scoring'
import { EntityCard } from '../components/EntityCard'

export function CompaniesPage() {
  const companies = rankSubjects(dataset, 'company')

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Companies</h1>
      <p className="text-neutral-500">
        {companies.length} companies with at least one score.
      </p>
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
    </div>
  )
}
