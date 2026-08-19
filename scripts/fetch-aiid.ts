import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { loadDataset } from './lib/dataset'
import { csvToObjects } from './lib/csv'
import { download, ensureDir, fetchText, RAW_DIR, writeJson } from './lib/io'

const SNAPSHOTS_PAGE = 'https://incidentdatabase.ai/research/snapshots/'
const ARCHIVE_PATH = `${RAW_DIR}/aiid.tar.bz2`
const MEMBER = 'mongodump_full_snapshot/incidents.csv'

function extractEntities(raw: string): string[] {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    const token = (m[1] ?? m[2] ?? '').trim().toLowerCase()
    if (token) out.push(token)
  }
  return out
}

async function findLatestArchiveUrl(): Promise<{ url: string; date: string }> {
  const html = await fetchText(SNAPSHOTS_PAGE)
  const match = html.match(/https:\/\/[^"]+\/backup-(\d{14})\.tar\.bz2/)
  if (!match) throw new Error('Could not find latest AIID snapshot URL')
  const date = match[1].slice(0, 8)
  return { url: match[0], date }
}

async function run(): Promise<void> {
  ensureDir(RAW_DIR)
  const dataset = loadDataset()

  const aliasToCompany = new Map<string, string>()
  for (const c of dataset.companies) {
    for (const n of [c.name, ...(c.aliases ?? [])]) {
      const key = n.trim().toLowerCase()
      if (key) aliasToCompany.set(key, c.id)
    }
  }

  const { url, date } = await findLatestArchiveUrl()
  if (!existsSync(ARCHIVE_PATH)) {
    console.log(`aiid: downloading snapshot ${date} (${url})`)
    await download(url, ARCHIVE_PATH)
  } else {
    console.log(`aiid: using cached snapshot (${date})`)
  }

  const csv = execFileSync(
    'tar',
    ['-xjOf', ARCHIVE_PATH, MEMBER],
    { maxBuffer: 256 * 1024 * 1024 },
  ).toString('utf8')

  const rows = csvToObjects(csv)
  const counts = new Map<string, number>()

  for (const row of rows) {
    const dev = extractEntities(row['Alleged developer of AI system'] ?? '')
    const seen = new Set<string>()
    for (const entity of dev) {
      const companyId = aliasToCompany.get(entity)
      if (companyId) seen.add(companyId)
    }
    for (const companyId of seen) {
      counts.set(companyId, (counts.get(companyId) ?? 0) + 1)
    }
  }

  const incidents = Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1]))

  writeJson(`${RAW_DIR}/aiid.json`, {
    fetchedAt: new Date().toISOString(),
    snapshotDate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
    totalIncidents: rows.length,
    incidents,
  })

  const total = Object.values(incidents).reduce((a, b) => a + b, 0)
  console.log(`aiid: ${rows.length} incidents; ${Object.keys(incidents).length} tracked companies matched (${total} developer-mentions)`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
