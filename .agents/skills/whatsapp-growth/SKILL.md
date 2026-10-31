---
name: whatsapp-growth
description: >-
  WhatsApp-native distribution, referral and retention for businesses whose
  customers and sellers live in WhatsApp. Use when the user wants to grow via
  WhatsApp, or mentions WhatsApp marketing, WhatsApp status, status broadcasts,
  broadcast lists, WhatsApp Business, wa.me links, catalogue, groups, communities,
  Clickatell/Twilio/Termii WhatsApp API, distribution lists, "share loop",
  "loop through my customers", "make the receipt share itself", "referral on
  WhatsApp", "grow Nigerian SMEs", "should I advertise on WhatsApp". Handles
  consent, spam-reduction and blocking risk. For channel-neutral segmentation,
  see marketing-decisions. For email lifecycle, see emails.
---

# WhatsApp Growth

For Nigerian SMEs, WhatsApp is not a marketing channel bolted onto the product.
It *is* the product surface — the receipt, the sale, the proof, and the referral
all happen in the same chat window. Growth here means engineering the loops that
already exist inside that window, not buying traffic into it.

## The governing idea

**A Proofa receipt is a shared artefact sitting in a conversation with another
business person.** Every export already puts the brand in front of a qualified
audience: the buyer, who also buys, and often resells.

That is a distribution loop that exists today, unplumbed. Build loops into
artefacts the user already sends before doing anything that costs money or goodwill.

## The consent line, and why it is also the growth strategy

Buyer phone numbers must **never** enter a marketing list. Beyond the NDPA 2023
problem, messaging a stranger who never opted in is the fastest route to a block,
and a blocked number is unrecoverable in a market where one screenshot can circulate.

The loop design solves this by construction: the **buyer chooses to act** on the
artefact the merchant sent. Merchant consents to share; buyer consents to tap.
Nobody is messaged without consent, and the channel is free.

> Rule: **share artefacts, do not import contacts.** If a play requires sending an
> unsolicited message to someone who is not the account holder, reject the play.

## The five loops, in build order

### Loop 1 — Artefact loop (the receipt) · highest priority
Every free export carries the "Made with Proofa" watermark. Today it is branding.
Make it attribution:

- Watermark carries a short link or QR with `?src=receipt&sid=<shadowId>`.
- Landing attributes the new visitor's `shadow_id` to the referrer, so the loop is
  *measurable before it is optimised*.
- Landing page speaks to a buyer, not a seller: "Get receipts like this for your
  business" — they arrived mid-purchase, which is peak relevance.
- Credit the referrer (see Loop 5) once attributed.

This is the only loop that scales with usage, costs nothing, and requires no
messaging. Instrument it before building any other.

### Loop 2 — Status loop
WhatsApp Status is the highest-reach free surface for a Nigerian merchant and the
most under-used in product marketing. It is ephemeral, low-shame, and seen by their
own saved contacts — the exact ICP.

- Ship a **"Share to Status"** action producing a 1080×1920 image of the merchant's
  best-looking receipt, their business name prominent.
- Frame merchant benefit as visibility ("let your contacts see you are professional"),
  not as helping Proofa grow.
- Track `status_shared` as a first-class event. It is a strong activation and
  loyalty signal — someone advertising their own business tool is fully onboard.

### Loop 3 — Broadcast / distribution-list loop
Merchants keep broadcast lists for customers. Give them a reason to use it that is
also retention: a monthly **"You sent N receipts worth ₦X this month"** card.

- Merchant forwards voluntarily; the card carries their brand and the attribution link.
- Sells Proofa *and* gives the merchant a professional self-report — the receipt
  count is the feature, and it is real data, so no fabricated numbers are involved.
- Monthly cadence aligns with the month-end payment cycle.

### Loop 4 — WhatsApp Business catalogue loop
For merchants on WhatsApp Business, the catalogue and quick replies are the surface.
- Seed quick-reply snippets with the merchant's bank details and receipt language,
  so Proofa sits inside the conversation rather than beside it.
- Deeper: merchant's own bank-details vault already exists (`bank_vault` intent).
  Quick-replies is the natural paid feature extension and a genuine time-saver.

### Loop 5 — Referral loop (build last, not first)
Referral before the artefact loop is attributed is guesswork. Once Loop 1 works:

- Reward with **usage, not cash**: free Pro days, extra exports, PDF quota. Cash
  invites self-referral and fraud in a price-sensitive market.
- Seed message in the merchant's own voice, written by them, one tap. Pre-written
  brand copy performs worse because it is obviously an ad.
- Trigger the ask at peak satisfaction: the moment an export succeeds, never on login.
- Cap: reward verified *activated* referees (first export), not signups.

## Channel rules

| Rule | Reason |
|---|---|
| Never message buyers | See consent line above |
| Never auto-send without a human tap | Platform bans, and it stops feeling like the merchant's voice |
| Personalise with *their* data only | their business name, their receipt count — never a fabricated number |
| One loop per customer per 7 days | shared across segments, deduplicated at send |
| Text before media | data costs; a heavy image loses to a light one at any quality gap |
| Honour stop replies | store the opt-out on the profile and respect it permanently |

## Timing

[STRUCTURAL] Merchant availability skews evening WAT and Sunday.
[HEURISTIC] Test 7–10pm against 12–2pm before standardising. Never launch a play
during Ramadan daylight hours into Muslim-majority segments.

## Measurement

A loop without attribution is decoration. Minimum events:

```
artefact_viewed      { referrer_sid, landing }
referred_signup      { referrer_sid, new_shadow_id }
referred_activated   { referrer_sid, new_shadow_id }   // first export
status_shared        { doc_type }
broadcast_shared     { month }
referral_sent        { channel }
opt_out              { channel, source }
```

Report loops as: **exports → artefact views → signups → activations → paid**, by
referrer. Two numbers decide whether to invest: `artefact_viewed / exports`
(does the artefact get seen) and `referred_activated / referred_signup`
(is the referred audience real). Optimise the first before spending on the second.

## What not to do

- **Bulk unsolicited blasts** — number gets banned, and the ban lands on the
  merchant's number, destroying trust in the product that caused it.
- **Unofficial WhatsApp automation or bulk-send tools** — account bans, and any
  growth built on them is rented, not owned.
- **Buying WhatsApp number lists** — illegal, worthless, and reputationally fatal.
- **Paid ads before a loop is attributed** — you cannot compute a CAC ceiling for a
  channel you have not measured, so you cannot know when to stop.

## References

- `references/loop-mechanics.md` — implementation detail for the artefact loop, attribution model, and event wiring in this codebase
- `references/copy-library.md` — status cards, share seeds, win-back and referral copy in Proofa's voice