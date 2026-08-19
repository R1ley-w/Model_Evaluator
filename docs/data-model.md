# Data Model & Scoring Rubric

Version: 1.0.0 · Status: draft

This document defines the data model for Model Evaluator: the entities, the
scoring rubric, how ratings are produced, how facts are distinguished from
judgments, and how time-series tracking (snapshots) works.

---

## 1. Design principles

1. **Facts vs. judgments.** Objective, sourced measurements ("GPT-4 was trained
   on ~2.1e25 FLOP") are stored separately from subjective ratings ("transparency
   = 72/100"). Facts can be wrong or outdated; judgments are opinions. Keeping
   them apart preserves auditability.
2. **Every claim is cited.** Every fact and every score points to one or more
   `source` records (URL + publisher + date + license).
3. **Uncertainty is first-class.** Values carry a `confidence` and a
   `status` (`disclosed`, `estimated`, `not-disclosed`, `speculative`). "We don't
   know" is a legitimate, scoreable state.
4. **Append-only scores.** A score is never edited in place. Corrections add a
   new record with a later `asOf` date. This is what makes time-series possible.
5. **Static, build-time data.** The dataset is plain JSON. A build script merges
   automated pulls (Epoch AI CSVs, Hugging Face API, AI Incident Database
   snapshot) with hand-curated ratings. No runtime backend is required.

---

## 2. Top-level structure

The dataset is a single JSON document with these top-level keys:

| Key | Type | Description |
| --- | --- | --- |
| `meta` | object | Dataset version, generation timestamp, methodology link |
| `rubric` | object | Criteria, indicators, weights, and scale |
| `sources` | array | All citations, referenced by id |
| `companies` | array | Parent organizations / developers |
| `models` | array | AI models, linked to companies |
| `scores` | array | All ratings (editorial / rubric / community) |
| `snapshots` | array | Dated point-in-time captures for time-series |

`facts` are not a top-level key; they are embedded on `companies` and `models`
(see §6) because a fact is always a property of exactly one subject.

---

## 3. The scoring rubric

### 3.1 Scale

All criterion and indicator scores use a **0–100** scale.

- `0` = worst / no evidence of good practice
- `50` = neutral / partial
- `100` = best / fully meets the criterion

Facts (e.g. `trainingEmissionsKgCO2e`) use their own natural units and are **not**
mapped onto the 0–100 scale directly; a separate editorial score interprets
them against the rubric.

### 3.2 Criteria

Seven criteria. Each has a `scope` (`model`, `company`, or `both`) determining
whether it is assessed per model, per company, or at both levels.

| id | Name | Scope | Weight | Rationale |
| --- | --- | --- | --- | --- |
| `carbon` | Carbon & energy footprint | `model` | 0.20 | Training + inference energy, emissions, data-center efficiency |
| `transparency` | Transparency | `both` | 0.15 | Disclosure of data, compute, evals, model cards, incident reporting |
| `openness` | Openness & licensing | `model` | 0.10 | Open weights, source availability, license permissiveness |
| `privacy` | Privacy & data practices | `company` | 0.15 | Training-data sourcing, consent, user data handling |
| `labor` | Labor & supply chain | `company` | 0.15 | Data-labeler conditions, moderation-worker welfare |
| `safety` | Safety & harms | `model` | 0.15 | Red-teaming, safety evals, known incidents, misuse |
| `governance` | Governance & accountability | `company` | 0.10 | Corporate policy, audits, board oversight, legal/regulatory |

Weights default to these values and may be tuned in `rubric.method`.

### 3.3 Indicators

Each criterion is broken into concrete `indicator`s. An indicator has a
`valueType`: `quantitative` (has a `unit`), `rating` (0–100), `enum` (an
ordered/string scale), `boolean`, or `text`.

Example indicators for `carbon`:

| id | valueType | unit | Question it answers |
| --- | --- | --- | --- |
| `training_emissions` | `quantitative` | kgCO2e | What did training emit? |
| `training_energy` | `quantitative` | kWh | How much energy did training use? |
| `emissions_disclosed` | `boolean` | — | Did the developer disclose emissions at all? |
| `renewable_share` | `quantitative` | percent | What share of energy is renewable? |
| `data_center_pue` | `quantitative` | ratio | How efficient is the data center? |

### 3.4 How ratings are produced (blended method)

The user selected a **combination of three** methods. A single criterion score
may therefore be a weighted blend of up to three `score` records of different
`type`s, referenced by the same `(subjectId, criterionId)`:

| `type` | Meaning | Example |
| --- | --- | --- |
| `editorial` | Curated by the maintainers using the rubric + cited evidence | "Transparency = 72" |
| `rubric` | Mechanically derived from indicator values via weights | "weighted sum of indicators" |
| `community` | Aggregated from user votes / external ratings | "average 4.2/5 from 300 votes" |

Blending rule (in `rubric.method`):

```
overall(subject, criterion) =
    Σ over score s of that subject+criterion:
        s.value * s.weight
    / Σ s.weight
```

Default blend weights are `editorial: 0.5`, `rubric: 0.4`, `community: 0.1`
(subject to change; community weight stays low until vote volume is meaningful).

---

## 4. Entities

### 4.1 `company`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | ✅ | Stable slug, e.g. `openai` |
| `name` | string | ✅ | Display name |
| `aliases` | string[] | | Other names for matching across sources |
| `country` | string | | ISO 3166-1 alpha-2 |
| `founded` | integer | | Year |
| `url` | string | | Homepage |
| `externalIds` | object | | e.g. `{ "wikidata": "Q21708256" }` |
| `facts` | `fact[]` | | See §6 |
| `notes` | string | | |

### 4.2 `model`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | ✅ | Stable slug, e.g. `gpt-4` |
| `name` | string | ✅ | Display name |
| `companyId` | string | ✅ | References `company.id` |
| `family` | string | | e.g. `GPT`, `Llama`, `Claude` |
| `type` | enum | | `language`, `image`, `multimodal`, `audio`, `other` |
| `releaseDate` | string | | ISO 8601 date |
| `openWeights` | boolean | | True if weights are openly released |
| `license` | string | | SPDX or free text |
| `url` | string | | Model card / announcement |
| `externalIds` | object | | e.g. `{ "epoch": "gpt-4", "hf": "openai/gpt-4" }` |
| `facts` | `fact[]` | | See §6 |
| `notes` | string | | |

### 4.3 `criterion` (in `rubric.criteria`)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | e.g. `transparency` |
| `name` | string | |
| `description` | string | |
| `scope` | enum | `model` \| `company` \| `both` |
| `weight` | number | 0–1; must sum to 1 across criteria |
| `indicators` | array | See below |

### 4.4 `indicator` (nested in a criterion)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `name` | string | |
| `description` | string | |
| `weight` | number | 0–1 within the criterion |
| `valueType` | enum | `quantitative` \| `rating` \| `enum` \| `boolean` \| `text` |
| `unit` | string | Required when `valueType` is `quantitative` |
| `direction` | enum | `higher-better` \| `lower-better` \| `informational` |

### 4.5 `score`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | ✅ | e.g. `gpt-4-transparency-editorial-2024` |
| `subjectId` | string | ✅ | `company.id` or `model.id` |
| `subjectType` | enum | ✅ | `company` \| `model` |
| `criterionId` | string | ✅ | References `rubric.criteria[].id` |
| `indicatorId` | string | | Optional; when set, scores one indicator only |
| `type` | enum | ✅ | `editorial` \| `rubric` \| `community` |
| `value` | number | ✅ | 0–100 |
| `weight` | number | | Blend weight; defaults to 1 |
| `asOf` | string | ✅ | ISO 8601 date of the assessment |
| `sourceIds` | string[] | | References `sources[].id` |
| `confidence` | number | | 0–1, or use `confidenceLabel` |
| `confidenceLabel` | enum | | `high` \| `medium` \| `low` \| `speculative` |
| `sampleSize` | integer | | For `community` scores |
| `rationale` | string | | Human-readable justification |
| `reviewer` | string | | Who/what made the assessment |

### 4.6 `snapshot`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | ✅ | e.g. `2024-Q2` |
| `capturedAt` | string | ✅ | ISO 8601 datetime |
| `note` | string | | Release note |
| `scoreIds` | string[] | | Pinned score ids; if empty, derived as "latest `asOf` ≤ `capturedAt`" |

**Derivation rule.** The rating at any historical date `t` for `(subject,
criterion)` is the `score` with the greatest `asOf ≤ t`. Snapshots with explicit
`scoreIds` pin exact records and are immutable; they are the recommended way to
publish a point-in-time view.

---

## 5. The fact object

A `fact` is an objective, sourced measurement attached to a `company` or
`model`. It is **not** a rating.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | ✅ | e.g. `gpt-4-training-compute` |
| `metric` | string | ✅ | Canonical name, e.g. `trainingComputeFlop` |
| `value` | number \| string \| boolean | ✅ | |
| `unit` | string | | e.g. `FLOP`, `kWh`, `kgCO2e`, `percent`, `ratio` |
| `status` | enum | | `disclosed` \| `estimated` \| `speculative` \| `not-disclosed` |
| `asOf` | string | ✅ | When the value was last confirmed |
| `sourceIds` | string[] | ✅ | |
| `confidence` | number | | 0–1 |
| `confidenceLabel` | enum | | `high` \| `medium` \| `low` \| `speculative` |
| `notes` | string | | |

### Canonical metrics

- **Model-level:** `parameters`, `trainingComputeFlop`, `trainingDatasetSize`,
  `trainingCostUsd`, `trainingTimeDays`, `trainingPowerDrawW`,
  `trainingEmissionsKgCO2e`, `trainingEnergyKwh`, `inferenceEnergyKwhPer1k`.
- **Company-level:** `scope1EmissionsTco2e`, `scope2EmissionsTco2e`,
  `scope3EmissionsTco2e`, `renewableSharePercent`, `waterUseMegaliters`,
  `dataCenterPue`, `totalEnergyKwh`.

---

## 6. Source object

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | string | ✅ | |
| `title` | string | ✅ | |
| `type` | enum | ✅ | `report` \| `paper` \| `dataset` \| `model-card` \| `news` \| `website` |
| `url` | string | | |
| `publisher` | string | | |
| `publishedAt` | string | | ISO 8601 |
| `accessedAt` | string | | ISO 8601 |
| `license` | string | | e.g. `CC-BY-4.0` |

---

## 7. Data sources (verified availability)

| Source | Use | Access | Notes |
| --- | --- | --- | --- |
| Epoch AI model DB | Model facts (compute, params, cost, org, date) | Free CSVs, CC-BY, weekly updates | ~3500 models; confidence labels included |
| Hugging Face Hub | `co2_eq_emissions`, license, openness | Free API | Only ~190 models report emissions |
| AI Incident Database | Harms/incident counts per entity | Free DB snapshot | ~1600+ incidents |
| Stanford FMTI | Transparency sub-scores for major developers | PDF/report (manual) | ~100 indicators |
| Company sustainability reports | Scope 1/2/3, renewable share, water | Manual (PDFs) | Google, MS, Meta, Amazon |
| ML CO2 / CodeCarbon | Methodology + provider offsets | GitHub | Reference only |

Frontier models rarely disclose training emissions — record them with
`status: "not-disclosed"`, which feeds the `transparency` criterion.

---

## 8. Overall score

For a subject (company or model), the overall score is:

```
overall(subject) = Σ over criteria c of scope-compatible:
                       overall(subject, c) * c.weight
```

where `overall(subject, c)` is the blended criterion score from §3.4. Because
criteria have a `scope`, a **model's** overall score includes only `model` and
`both` criteria; a **company's** overall score includes only `company` and
`both` criteria.
