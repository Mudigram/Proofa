# Nigerian SME Marketing Benchmarks

## Read this first: confidence labels

Fabricated precision is worse than no number, because a made-up target gets
managed to. Every figure here carries a label:

- **[STRUCTURAL]** — follows from how the market works; safe to plan on.
- **[HEURISTIC]** — a starting assumption, not a measurement. Set it, then
  replace it with your own first-week real number within 14 days.
- **[UNMEASURED]** — plausible but unevidenced for Proofa. Do not use as a goal.

There is **no** verified Proofa benchmark in this file. `PRODUCT.md` confirms the
product is live with real users but no confirmed conversion data exists yet. Until
`/api/admin/segments` returns real counts, every number below is a hypothesis.

---

## Channel

| Claim | Label | Planning consequence |
|---|---|---|
| WhatsApp is the primary business comms channel for Nigerian micro/small sellers | [STRUCTURAL] | For micro sellers, WhatsApp is the reach channel; email is supplementary |
| Business email addresses are frequently unused, shared, or checked slowly | [STRUCTURAL] | A low email reply rate measures the channel, not the offer |
| A named, personal WhatsApp from a human outperforms branded automated email | [HEURISTIC] | Run tier-2 founder outreach before building any automation |
| Email remains correct for freelancers and registered businesses | [HEURISTIC] | Split channel by persona, never by plan tier |
| Cold SMS to Nigerian micro sellers reads as spam/ scam | [STRUCTURAL] | Do not use `sms` skill for acquisition here |
| Peak merchant activity skews evening WAT and Sunday | [HEURISTIC] | Schedule sends 7–10pm WAT; test against 12–2pm |

## Response rates (starting hypotheses only)

| Play | Hypothesis | Label | Replace when |
|---|---|---|---|
| Founder WhatsApp, named, with their business name | 15–25% reply | [HEURISTIC] | after first 50 sends |
| Same message without their business name | ~⅓ of the above | [HEURISTIC] | A/B on first 100 |
| Cold email to micro seller | 1–3% reply | [HEURISTIC] | treat deliverability as suspect |
| Cold email to freelancer persona | 3–7% reply | [HEURISTIC] | after 200 sends |
| Win-back WhatsApp to `dormant-winnable` | 5–10% return | [HEURISTIC] | after one full cycle |
| In-product gate → paid | unknown | [UNMEASURED] | measure, do not assume |
| Free → paid overall | unknown | [UNMEASURED] | no basis to set a target yet |

**If a reply rate comes in near zero, suspect the channel and the list before the
copy.** Near-zero on email from micro sellers is expected regardless of copy quality.

## Trust mechanics [STRUCTURAL]

Bank-transfer culture plus a high-scam environment means:

1. **A named human beats a brand voice.** Sign as a person with a phone number.
2. **A visible refund promise is load-bearing**, not a nice-to-have.
3. **Unsolicited links are suspect.** Send the number, invite a reply, share the
   link once they respond. Costs one extra step, buys most of the trust.
4. **Naira pricing must be explicit.** "From ₦2,500/mo", never "from $2".
5. **A receipt that looks bank-grade outperforms one that looks designed** —
   credibility here is formal, not aesthetic. Relevant to template marketing.

## Price anchoring

| Claim | Label |
|---|---|
| Frame monthly cost against one document, not against foreign SaaS | [STRUCTURAL] |
| "Less than one receipt's worth of time" beats any feature list | [HEURISTIC] |
| Annual discount should be a real 2-months-free, stated in Naira saved | [HEURISTIC] |
| First-anchored price becomes the reference for the whole category | [STRUCTURAL] |
| Discounting before value lands teaches negotiability permanently | [STRUCTURAL] |
| Data cost is part of the price the user pays | [STRUCTURAL] |

Existing PRO_PLAN pricing (₦2,500 Pro / ₦5,000 Business, per `estimatedMRR` in
`app/api/admin/overview/route.ts:178`) is unvalidated. Treat as a test cell, not truth.

## Seasonality [HEURISTIC — verify against your own volume curve]

| Period | Effect | Action |
|---|---|---|
| Month end (25th–30th) | salary and payment cycle; receipt volume up | run conversion plays here |
| First week of month | quiet, low intent | do not launch; build |
| Ramadan / Eid | Muslim-majority-market trading shifts sharply | pause, then festive offer |
| December ("Detty December") | peak for food, fashion, events, hospitality | biggest seasonal window |
| Back-to-school (Aug–Sep, Jan) | strong for relevant sellers only | segment-specific, not blanket |
| Fuel/ FX price shocks | purchasing power drops fast | freeze price tests; do not raise prices |

## Sample-size floor [STRUCTURAL]

With reply rates in single digits, sub-40 cells cannot distinguish a better message
from luck. Either run sequentially and compare across periods, or send 200+ per arm.
Anything smaller is an anecdote — write it down as a hypothesis, never as a result.