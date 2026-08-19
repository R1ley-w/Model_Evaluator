import type { Dataset } from '../../src/data/types'
import { DATASET_PATH, readJson } from './io'

export function loadDataset(): Dataset {
  return readJson<Dataset>(DATASET_PATH)
}
