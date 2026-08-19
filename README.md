# Model Evaluator

An interactive web app that assesses and tracks the **ethical ratings** and
**environmental scores / impacts** of AI models and their parent companies.

## Status

Design + initial app scaffold complete. The data model, scoring rubric, and
dataset schema are documented, and a working React app renders the (currently
small, illustrative) dataset. Fetch scripts for live data are the next step.

## Tech stack

- **React 19 + TypeScript** on **Vite 8**
- **Tailwind CSS v4** for styling
- **Recharts** for score visualizations (radar, trend lines)
- **React Router** (hash-based, for zero-config static hosting)
- **Vitest + React Testing Library** for tests
- **oxlint** for linting

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm run build      # typecheck + production build
npm run lint       # oxlint
npm run test       # vitest (run once)
npm run typecheck  # tsc --noEmit
```

## Repository layout

```
docs/                      Design & methodology documentation
  data-model.md            Entities, scoring rubric, confidence model, snapshots
schema/                    Machine-readable schema + example data
  dataset.schema.json      JSON Schema (draft 2020-12) for the dataset
  example-dataset.json     Small illustrative dataset
src/                       React application source
  data/                    Types, dataset, scoring logic, selectors
  components/              UI components (charts, cards, layout)
  pages/                   Route pages (overview, companies, models)
  lib/                     Formatting helpers
```

## Data model at a glance

| Entity | Purpose |
| ------ | ------- |
| `company` | Parent organization / developer (e.g. OpenAI, Google, Meta) |
| `model` | An AI model linked to a company (e.g. GPT-4, Llama 3) |
| `criterion` | A scored dimension of the rubric (e.g. transparency, carbon) |
| `indicator` | Sub-metric within a criterion |
| `fact` | Objective, sourced measurement (e.g. training FLOP, scope-1 emissions) |
| `score` | A judgment (0-100) against a criterion, with source + date + confidence |
| `snapshot` | A dated, point-in-time capture enabling time-series tracking |
| `source` | A citation backing facts and scores |

See `docs/data-model.md` for the full specification.
