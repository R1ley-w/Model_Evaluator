# Model Evaluator

An interactive web app that assesses and tracks the **ethical ratings** and
**environmental scores / impacts** of AI models and their parent companies.

## Status

Early design phase. Currently documenting the data model, scoring rubric, and
dataset schema before writing any application code.

## Repository layout

```
docs/                      Design & methodology documentation
  data-model.md            Entities, scoring rubric, confidence model, snapshots
schema/                    Machine-readable schema + example data
  dataset.schema.json      JSON Schema (draft 2020-12) for the dataset
  example-dataset.json     Small illustrative dataset
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
