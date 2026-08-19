# Model Evaluator

An interactive web app that assesses and tracks the **ethical ratings** and
**environmental scores / impacts** of AI models and their parent companies.

## Status

Design + app scaffold + live data pipeline complete. The data model, scoring
rubric, and dataset schema are documented, the React app renders the data, and
build-time scripts populate real facts from Epoch AI, Hugging Face, and the AI
Incident Database.

## Tech stack

- **React 19 + TypeScript** on **Vite 8**
- **Tailwind CSS v4** for styling
- **Recharts** for score visualizations (radar, trend lines)
- **React Router** (hash-based, for zero-config static hosting)
- **Vitest + React Testing Library** for tests
- **oxlint** for linting
- **tsx** for running the TypeScript data scripts

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm run build      # typecheck + production build
npm run lint       # oxlint
npm run test       # vitest (run once)
npm run typecheck  # tsc --noEmit
npm run data       # fetch live data + merge into the dataset
```

## Data pipeline

`npm run data` (or `npm run data:fetch` then `npm run data:merge`) populates
`src/data/dataset.json` with facts pulled from live sources, while preserving
manually-curated scores, criteria, and sources:

| Script | Source | What it adds |
| ------ | ------ | ------------ |
| `scripts/fetch-epoch.ts` | [Epoch AI](https://epoch.ai/data/ai-models) | `parameters`, `trainingComputeFlop`, dataset size, cost, power draw (per model) |
| `scripts/fetch-huggingface.ts` | [HF Hub API](https://huggingface.co/docs/hub/en/api) | license and self-reported training emissions |
| `scripts/fetch-aiid.ts` | [AI Incident Database](https://incidentdatabase.ai/) | incident counts per company (alleged developer) |
| `scripts/merge.ts` | — | merges raw data into `src/data/dataset.json` |

Mappings live in the dataset itself: `model.externalIds.epoch` and
`model.externalIds.hf` point to external records, and `company.aliases` match
AIID entity names. Generated facts use `epoch-`, `hf-`, and `aiid-` id prefixes
and are safely replaced on each run; curated facts are left untouched. Raw
intermediate data is cached in `data/` (git-ignored).

## Repository layout

```
docs/                      Design & methodology documentation
  data-model.md            Entities, scoring rubric, confidence model, snapshots
schema/                    Machine-readable schema + example data
  dataset.schema.json      JSON Schema (draft 2020-12) for the dataset
  example-dataset.json     Small illustrative dataset
scripts/                   Data pipeline (fetch + merge)
  fetch-epoch.ts           Epoch AI model facts
  fetch-huggingface.ts     HF license + emissions
  fetch-aiid.ts            AIID incident counts
  merge.ts                 Combine raw data into the dataset
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
