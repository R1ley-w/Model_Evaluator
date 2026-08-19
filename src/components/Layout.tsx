import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold tracking-tight">
            Model Evaluator
          </Link>
          <nav className="flex gap-4 text-sm text-neutral-500">
            <Link to="/" className="hover:text-neutral-900 dark:hover:text-neutral-100">
              Overview
            </Link>
            <Link to="/models" className="hover:text-neutral-900 dark:hover:text-neutral-100">
              Models
            </Link>
            <Link to="/companies" className="hover:text-neutral-900 dark:hover:text-neutral-100">
              Companies
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>

      <footer className="border-t border-neutral-200 bg-white py-4 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
        Data licensed CC-BY-4.0 · See{' '}
        <a
          className="underline"
          href="https://github.com/R1ley-w/Model_Evaluator/blob/main/docs/data-model.md"
          target="_blank"
          rel="noreferrer"
        >
          methodology
        </a>
      </footer>
    </div>
  )
}
