---
name: customer-segmentation
description: >-
  Build or extend a behavioural segmentation model: identity resolution, RFM
  scoring, lifecycle stages, engagement/health/purchase-intent scores, computed
  segments and cohorts from product telemetry. Use when the user wants to assess
  customers from their activity, group them, score them, rank them, build
  personas from data, or asks about "segment my users", "customer scoring",
  "RFM", "lifecycle stage", "health score", "lead score", "behavioural cohorts",
  "find my high value customers", "why can't I see what my Pro users do",
  "amplitude style tracking", "event stream", "computed segments", or
  "identify anonymous users". Owns the model and its definitions; for choosing
  which segment to act on, see marketing-decisions; for the outbound channel,
  see whatsapp-growth.
---

# Customer Segmentation

The capability the user is asking for has a standard shape. Amplitude, Mixpanel,
Segment, HubSpot and Attio all converge on the same five layers. Implement them in
order — each one is impossible without the layer beneath.

```
1 identity   who is this?  merge anonymous → authenticated, one person one record
2 events     what did they do?  append-only raw stream, never mutated
3 attributes what is true of them?  derived, recomputable, windowed
4 scores     how good/bad/at-risk is it?  comparable across the whole base
5 segments   who do I act on?  declarative predicates over 3+4, resolved to ID lists
```

**The failure mode this prevents:** computing segments straight off raw events.
It works to about 5 segments and then every consumer re-implements the logic
differently, so "churned" means four things in four places. Attributes and scores
are the seam that keeps definitions single-sourced.

## Layer 1 — Identity

One human, one record, across anonymous and authenticated states.

`shadow_profiles.id` → `shadow_profiles.user_id` is already the right structure.
The rule that must hold: **when a shadow ID authenticates, carry its history
forward — never fork a new timeline.** Otherwise every user looks like a newbie on
the day they sign up, which is exactly why activation rates read wrong.

Merge keys, strongest first: `user_id` → normalised phone → normalised email →
`shadow_id`. Phone is a *stronger* primary key than email in this market — many
merchants have sparse email and one authoritative MSISDN.

Never merge on business name. Two "Aunty Bisi Foods" exist; merging them corrupts
both timelines silently.

## Layer 2 — Events

Append-only. `telemetry_events` already satisfies this. Two invariants:

- **Events are facts, never opinions.** `feature_intent`, not `interested`. A score
  is an opinion; a score must never be written into the event stream, or the raw
  truth becomes unrecoverable.
- **Recompute, never mutate.** Attributes are derived from events on read. Storing
  only aggregates is what makes the current `feature_tags` system unfixable — see below.

## Layer 3 — Attributes

Windowed, recomputable, and named so the window is in the name. `exports`, `volume`
and `recency` are bugs waiting to happen; `exports_30d`, `volume_ngn_90d`,
`days_since_last` are self-documenting.

Required set for a product like Proofa:

```
recency     days_since_last, days_since_first, activity_days_30d
frequency   exports_7d / 30d / 90d, sessions_30d, doc_mix (receipt|invoice|order)
value       volume_ngn_30d / 90d, avg_doc_value, docs_usd_90d
intent      paywall_views_7d, pro_feature_taps_30d, gate_variants_seen
activation  second_export_within_7d, pwa_installed, bank_details_saved
channel     platform, is_pwa, in_app_webview, peak_hour_band, contactable_channel
```

`peak_hour_band` and `contactable_channel` are what make sends land rather than
arrive, and they are nearly free to compute from data already collected.

## Layer 4 — Scores

Four scores, each answering a different question. Do not collapse them into one
"score" — a customer who is high-value and about to churn is exactly the case a
single number hides.

| Score | Question | Range |
|---|---|---|
| RFM (1–5 each, 5=best) | how valuable historically | composite 3–15 |
| Engagement | habit strength vs **their own** norm | 0–100 |
| Purchase intent | how soon might they pay | 0–100 |
| Health / churn risk | are they drifting (paid only) | 0–100 |

**Engagement must be relative to the customer's own median activity**, not to the
population. A monthly trader at their own median is healthy; measured against the
population mean they look like churn risk, and the whole model inverts. This is the
single most important line in the file for a business with irregular cadence.

Score honestly about limits: these are **transparent linear composites, deliberately
not a trained model.** With the current volume, a learned model would overfit to a
handful of conversions. Every weight must be readable and adjustable in one place.

## Layer 5 — Computed segments

Declarative predicates over attributes + scores, resolved to ID lists on demand.

Requirements for each definition:

- **Enumerable** — must yield a concrete list or it is a persona, not a segment.
- **Non-overlapping by design at act time** — overlap is fine for analysis, fatal
  for sends; deduplicate before messaging, one touch per customer per 7 days.
- **Self-describing** — id, name, why it matters, what to do about it. A segment
  with no play attached is inventory, not insight.
- **Recomputable** — no manual membership edits, or drift becomes invisible.

Segment *definitions* live in `marketing-decisions/references/segment-catalog.md`.
The *predicates* live in code. Keep the IDs identical across both.

## Anti-patterns that specifically bite here

**Append-only tags.** `feature_tags` currently only ever grows. A user is
"Brand Conscious" forever from one tap. Attributes must be windowed and recomputed
so they decay naturally. Until that is fixed, treat stored tags as hints and
recompute from raw events.

**Aggregates without an event stream.** If only counters are kept, the model can
never be corrected retroactively — a new score definition cannot be backfilled.
Proofa is safe here: the raw stream is retained, so recomputation is possible. Keep it that way.

**Behavioural blindness for authenticated users.** Attaching `user_id` to events and
then never querying by it — rich anonymous tracking, and paid customers reduced to a
document count. Paid users are the highest-value cohort; instrument their feature
usage with the same fidelity as guests'.

**Segments defined before the data exists.** If the predicate references a field not
being emitted, the segment silently returns zero and reads as "no opportunity".
Check field availability before defining.

## References

- `references/model-spec.md` — attribute definitions, score formulas and weights as implemented in `lib/segmentation/`
- `references/instrumentation.md` — the event taxonomy and the Pro-feature gaps to close so the model has inputs