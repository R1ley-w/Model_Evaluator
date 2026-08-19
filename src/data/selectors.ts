import type {
  Company,
  Criterion,
  Dataset,
  Model,
  Source,
} from './types'

export function companyById(dataset: Dataset, id: string): Company | undefined {
  return dataset.companies.find((c) => c.id === id)
}

export function modelById(dataset: Dataset, id: string): Model | undefined {
  return dataset.models.find((m) => m.id === id)
}

export function criterionById(
  dataset: Dataset,
  id: string,
): Criterion | undefined {
  return dataset.rubric.criteria.find((c) => c.id === id)
}

export function sourceById(dataset: Dataset, id: string): Source | undefined {
  return dataset.sources.find((s) => s.id === id)
}

export function modelsByCompany(dataset: Dataset, companyId: string): Model[] {
  return dataset.models.filter((m) => m.companyId === companyId)
}

export function sourcesByIds(
  dataset: Dataset,
  ids: string[] | undefined,
): Source[] {
  if (!ids) return []
  return ids
    .map((id) => sourceById(dataset, id))
    .filter((s): s is Source => Boolean(s))
}
