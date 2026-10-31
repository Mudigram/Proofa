# Real Proof Collection

`PRODUCT.md` line 113: *"No real testimonials or user count data confirmed yet;
fabrication is prohibited."* `PRO_PLAN.md` has a Social Proof System section with
nothing to fill it. This is the way to fill it honestly.

## Hard prohibitions

Never write, draft as "example", supply as "placeholder you can swap", or seed into
a template: invented testimonials, invented names, invented business names, invented
user counts, invented receipt counts, invented ratings, or real quotes you were not
given. Also do not composite two real quotes into a smoother one, and do not
"tidy" a quote's grammar into different words — a paraphrase is a fabrication.

An obvious `[TESTIMONIAL HERE]` marker is acceptable in layout work. A realistic
fake one is not.

## The collect loop

Target **only** `loyalty-loop` (see `segment-catalog.md`) — high RFM, active,
10+ exports. Never ask a churn-risk or never-activated user; it invites negative
proof at the worst moment.

**Step 1 — Ask in WhatsApp, reply in WhatsApp.** No form, no typeform link, no
email. One message, one reply.

> Good afternoon. You have been sending receipts with Proofa for a while now —
> is it saving you time? If yes, may I record a short voice note from you about
> what changed for your business? I would like to show other businesses like yours.

Voice-first matters: typing feels like work, talking does not, and a voice note is
the highest-trust artifact in Nigerian commerce. It is also the most shareable.

**Step 2 — Capture permission explicitly.** Ask, in the same thread:
"Can I put your first name, your business name and your area on it?" Record the
answer. Store the grant, not just the quote.

**Step 3 — Transcribe verbatim.** Keep Pidgin and imperfect English exactly as
said. Polishing a quote destroys the credibility that made it useful, and it is
the specific way real testimonial programmes quietly turn into fake ones.

**Step 4 — Attach a verifiable artefact** where possible: first name + business
name + area + date + their own receipt count from telemetry. Numbers pulled from
your own data are true statements, so they are allowed: *"Aisha, sneakers, Yaba —
142 receipts sent."*

**Step 5 — Record the grant** so it survives the chat thread:

```
quote_id, customer_id, verbatim_text, format (voice|text),
attribution (name, business, area), consent_given_at,
consent_channel, may_edit (no), source_url (wa.me thread), status
```

## Sequence for the ask

**Ask → thank → use.** No incentive on the first ask; an incentivised quote is a
purchased one and reads as such. If response is thin after 25 asks, offer a month
of Pro — disclose it on the quote ("Proofa Pro customer") rather than hiding it.

## Honest interim states

Until quotes exist, use only true statements:

- Live counts you can actually compute from your own tables, e.g. receipts
  generated this month — pull from `documents`, never round up.
- The product artefact itself: a real receipt on screen proves the promise better
  than a stranger's opinion.
- Founder credibility and the specific problem narrative.
- **"Be one of the first 100 businesses"** — turns small scale into scarcity. True,
  and it converts once you can show the counter moving.

Never write "Join thousands of Nigerian businesses" while `totalUsers` says otherwise.