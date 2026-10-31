---
name: marketing-decisions
description: >-
  Turn product telemetry and admin dashboard signals into segmented marketing
  decisions. Use when the user wants to decide who to target, which segment to
  work, what to say, and which play to run, or when they mention segments,
  cohorts, RFM, lifecycle stage, lead score, health score, targeting, audiences,
  "who should I message", "group my users", "which customers are churning",
  "high value customers", "should I run a campaign", "pick a segment",
  "activation drop-off", "why aren't they upgrading", "build me a target list",
  "warm leads", or "what should I do next with these users". Routes a raw
  behavioural signal to the correct downstream skill and to a concrete,
  exportable target list. Built for the Nigerian SME / WhatsApp-first market.
  For defining the segmentation model itself, see customer-segmentation. For
  WhatsApp distribution, see whatsapp-growth. For outbound copy, see cold-email
  and emails.
---

# Marketing Decisions

Convert "I have data on my users" into "tonight I am messaging exactly these N
people, for this reason, with this message, on this channel."

This is the **decision layer**. It does not write campaigns. It reads behaviour,
picks the segment, decides the play, and hands off to the skill that executes.

## The core rule

**Never target a persona. Target a behaviour.**

"Nigerian SME sellers" is not a segment — you cannot enumerate it. "Free users
who exported 5+ receipts in 14 days, touched logo upload, never hit paywall" is
a segment: it has a count, a name list, and an obvious next message.

If a proposed segment cannot produce a `user_id` list, it is not a segment.
Reject it and go narrower.

## Operating order

Run these in sequence. Do not skip step 1 — most marketing mistakes are
wrong-signal mistakes, not wrong-copy mistakes.

### 1. Establish the observation window

Nigerian SME cadence is not SaaS cadence. Fix the window before judging anyone.

| Judging | Window | Why |
|---|---|---|
| Activation failure | 48h | A seller with a customer waiting either converts in a day or is gone |
| Engagement / habit | 30 days | Covers a full trading month including a payday cycle |
| Churn risk | 21 days quiet | Not 30 — see below |
| Revenue / value | 90 days | Smooths festive spikes (Detty December, Ramadan/Eid, back-to-school) |
| Upgrade intent | 7 days | Intent decays fast; last week's logo tap beats last month's |

**21 days, not 30:** monthly traders get paid at month end. A merchant quiet for
25 days in mid-month is likely gone; one quiet for 25 days across a month
boundary is just paid and resting. Always compare against *their* median gap
between activity, not a calendar constant. Flag `last_active vs their own norm`.

### 2. Read the signal, name the intent

Use `references/signal-playbook-map.md`. Every signal has one primary read.
The three that get misread most:

- **Viewed upgrade gate and did NOT upgrade** → do not treat as rejection. Treat
  as *price or trust objection, still live*. Cheaper to fix than a new user.
- **High export volume, low Naira volume** → not low value. High turnover, thin
  margin (food, airtime, provisions). They want speed, not polish. Sell
  Business plan volume features, not Pro branding.
- **High Naira volume, low export count** → big-ticket seller (electronics,
  furniture, land, BUA/property). A few documents, each large. Highest
  willingness to pay per unit. Personal WhatsApp outreach beats any campaign.

### 3. Pick the play by cost, cheapest first

Always exhaust cheap plays before paid ones.

1. **In-product, in-the-moment** — trigger the right paywall/hint at the moment
   of intent. Costs nothing, converts best. → `paywalls`, `popups`, `cro`
2. **Organic 1:1** — founder WhatsApp or email to a named list under ~50. Best
   reply rate in Nigeria, builds the testimonial base. → `cold-email`, `emails`
3. **Owned lifecycle** — automated flows to cohorts. → `emails`, `onboarding`
4. **Referral / word-of-mouth** — users already broadcasting on WhatsApp. →
   `referrals`, `whatsapp-growth`
5. **Paid** — only once a segment converts organically and you know the CAC
   ceiling. → `ads`, `ad-creative`

**Do not skip to 5.** Running Meta ads at a segment that has not converted via
founder WhatsApp means you have bought traffic to an unproven message and will
read it as "ads don't work in Nigeria".

### 4. Pressure-test before spending

Before any play that costs money or reputation, run `marketing-council` with:
the segment definition, its size, the observed behaviour, the proposed message
and channel, and what a "win" looks like numerically. Ask the council specifically
to attack the segment choice, not just the copy — the segment is usually the
wrong variable, not the words.

### 5. Decide the exit criteria now, not later

Write down, before sending:

- **Sample size** — below ~40 in a cell, you have an anecdote, not a result.
- **Primary metric** — one only.
- **Kill threshold** — "off if reply rate < 1% after 200 sends."
- **Read time** — WhatsApp reads land in hours; email in days; a behavioural
  shift in a monthly-trading business needs a full cycle, so 30 days minimum.

Then log it in `marketing-loops` so next cycle inherits the finding instead of
re-running it.

## Segment → play quick table

Full catalogue and predicates live in `references/segment-catalog.md`.

| Segment | Primary play | Skill |
|---|---|---|
| Ghosted after first export | 1:1 WhatsApp ask-what-blocked-you | `cold-email` |
| Power exporter, free tier | Paywall at export moment | `paywalls` |
| Brand-conscious, unconverted | Founder note + Pro logo demo | `cold-email`, `offers` |
| Upgrade-gate viewer, stalled | Objection-specific follow-up | `marketing-psychology` |
| Big-ticket low-frequency | Personal call / WhatsApp | `prospecting` |
| Activated but stalling (paid) | Save offer, dunning fix | `churn-prevention` |
| Loyalty loop / high RFM | Ask for testimonial + referral | `referrals`, `social` |
| Cross-border (USD seen) | Currency + PDF pack | `offers` |

## Nigerian-market constraints that override generic advice

`references/nigeria-benchmarks.md` carries the working numbers. The load-bearing
ones:

- **WhatsApp first, email second.** For micro and small sellers, email is not a
  reach channel. A WhatsApp text with a name and their business name in it will
  out-perform a well-built email sequence by an order of magnitude. Email is for
  freelancers and registered businesses only.
- **Trust precedes transaction.** Bank-transfer culture means payment anxiety is
  the default. Lead with a named human, a phone number, and a refund promise.
  Anonymous brand-voice sends read as scam.
- **Price in Naira, anchor in value not dollars.** ₦2,500/mo must be framed
  against one receipt, not against foreign SaaS prices.
- **Data costs are a tax on every asset you ship.** Heavy video or image landing
  pages lose to a light page at any quality difference.
- **Evening and weekend trading is real.** Peak engagement skews to evening
  WAT and Sundays. Do not schedule sends at 9am on a Monday assuming work hours.
- **Testimonials must be real.** `PRODUCT.md` forbids fabrication and no
  verified user quotes exist yet. Never draft fake quotes — instead run the
  loyalty-loop segment to *collect* them (see `references/proof-collection.md`).

## Guardrails

- **Do not message buyers.** Only the merchant's own contact detail may be
  used. Buyer phones appearing in telemetry are not a marketing list.
- **Opt-out on first contact**, and honour it in `shadow_profiles`.
  A WhatsApp block is close to permanent; an annoyed merchant is a public
  screenshot on Twitter.

## Output format

Every decision this skill produces must land as this block, so it is actionable
and auditable rather than advice:

```
DECISION:  <one line — who gets what, where>
SEGMENT:   <segment id> — <count> customers
DEFINITION: <exact predicate, e.g. plan=free AND exports_30d>=5 AND logo_taps>=1 AND paywall_views=0>
SIGNAL:    <behaviour observed, with numbers>
PLAY:      <channel + cost tier from step 3>
OFFER:     <what they get; tie to PRO_PLAN trigger A-E if upgrade-related>
COPY:      <draft, or hand off to <skill>>
METRIC:    <one primary metric> | KILL: <threshold> | READ BY: <date>
LIST:      <how to export the IDs — api/admin/segments?segment=<id>>
SKILL:     <downstream skill to run next>
```

If `SEGMENT` count is unknown, the first action is to get it from
`POST /api/admin/segments` — do not proceed on a guessed size.

## Worked example

> "Some people keep hitting the logo upload but don't upgrade. What do I do?"

```
DECISION:   Founder WhatsApp to brand-conscious stalled free users offering a
            7-day Pro trial with their own logo already applied.
SEGMENT:    brand-conscious-stalled — get live count from /api/admin/segments
DEFINITION: plan=free AND feature_intent(logo_upload)>=1 AND upgrade_gate_viewed=0
            AND last_active within 14d
SIGNAL:     Tapped a Pro-only branding control but never reached a paywall —
            desire present, price never actually encountered.
PLAY:       Tier 2 organic 1:1 (expect list < 50; do not build automation yet)
OFFER:      Pro 7 days, no card. Logo pre-applied so the receipt they send
            tonight already carries their brand — value is proven before the
            trial can be forgotten.
COPY:       → hand to copywriting; frame as "your logo, your receipts" not
            "unlock the logo feature" (PRODUCT.md voice rule)
METRIC:     trial-to-paid within 7d | KILL: <2 replies per 50 sends
            READ BY: 30 days (one full trading cycle)
LIST:       POST /api/admin/segments { segment: "brand-conscious-stalled" }
SKILL:      cold-email → paywalls (close the gate-to-paywall gap that caused this)
```

Note the last line: the segment exists *because* a product gap leaks intent.
Always name the product fix alongside the campaign. Repeatedly messaging around
a missing paywall is how a segment gets exhausted.

## Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Targeting by plan tier alone ("all free users") | Mixes the almost-ready with the long-dead; dilutes reply rate until you conclude the segment is worthless |
| One blast, verdict drawn | Sub-40 cells cannot separate signal from noise |
| Email-first sequence for micro sellers | Wrong channel; you will measure deliverability, not interest |
| Discount as first lever | Teaches price sensitivity before value is established, in a market that anchors hard on first price |
| Messaging buyers | Legal and reputational exposure; see Guardrails |
| Re-targeting an exhausted segment | Nigerian SME circles are small and loud; third touch invites public complaints |
| Acting on `feature_tags` from admin UI as truth | Tags are append-only and never decay — treat stored tags as hints, recompute from raw events |

## Reference files

- `references/segment-catalog.md` — every segment with exact predicate, size expectation, and play
- `references/signal-playbook-map.md` — raw telemetry event → intent read → play
- `references/nigeria-benchmarks.md` — reply, open, conversion and price-anchoring numbers for the Nigerian SME market, with confidence labels
- `references/proof-collection.md` — collecting real testimonials without fabricating any