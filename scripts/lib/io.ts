import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const ROOT = process.cwd()
export const RAW_DIR = join(ROOT, 'data', 'raw')
export const DATASET_PATH = join(ROOT, 'src', 'data', 'dataset.json')

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true })
}

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

export function writeJson(path: string, data: unknown): void {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

export async function fetchText(url: string, headers?: Record<string, string>): Promise<string> {
  const res = await fetch(url, { headers })
  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`)
  }
  return res.text()
}

export async function download(url: string, dest: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(dest, buf)
}

export const today = () => new Date().toISOString().slice(0, 10)
