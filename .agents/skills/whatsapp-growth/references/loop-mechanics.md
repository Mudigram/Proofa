# Artefact Loop Mechanics

How to wire the Loop 1 receipt loop into this codebase. Nothing here needs a new
service — it reuses `telemetry_events` and `shadow_profiles`.

## Attribution model

A new visitor arrives from a receipt. Record *who sent that receipt* against the
new visitor's shadow profile, once, at first sight, and never overwrite it.

```
shadow_profiles.referred_by_shadow_id   text     -- immutable after first write
shadow_profiles.referral_source         text     -- 'receipt' | 'status' | 'broadcast' | 'referral'
shadow_profiles.referral_landing        text     -- landing path seen
```

Write-once matters: without immutability, later organic touches overwrite the
credit and the loop always looks like it produced nothing.

## Link contract

```
https://proofa.ng/?src=receipt&sid=<referrerShadowId>&dt=<docType>
```

- Short, and QR-able — a QR on the receipt is what makes the loop work for a buyer
  reading on the same phone.
- `dt` lets the landing message match context (buyer who just received an invoice
  gets "chasing payments?", one who got a receipt gets "issue receipts like this").
- Never put a phone number, account number or buyer detail in a URL. URLs leak via
  history, logs and screenshots.

## Read path

On first mount, before any other telemetry call, read `src` and `sid` from the URL,
persist to `localStorage` under one key, strip the params from the address bar, and
include them on the next `trackEvent` payload. Capture at first paint because the
params are gone as soon as the user navigates.

## Watermark change

The free-tier watermark currently renders "Made with Proofa" text. Add a compact
QR plus the short link. Constraints that actually matter here:

- Must survive PNG export at typical WhatsApp compression, so keep the QR large
  enough to scan off a phone screen — test on a real Android device, not in a browser.
- Must not obscure amount, date or business name. Bottom-right corner, fixed.
- Keep it visually quiet. A watermark that looks like an ad makes the merchant
  remove it, and then the loop is gone. It should read as a credibility mark
  ("this receipt is verifiable"), which also serves the merchant.

This tension is the real design problem: **Pro removes the watermark, which removes
the loop.** Budget for that — measure `artefact_viewed` decay as conversion to Pro
rises, and do not let a conversion win be reported without the loop cost next to it.

## Events to add

| Event | Fires | Properties |
|---|---|---|
| `referral_landing_viewed` | visitor with `src` lands | `src`, `sid`, `dt`, `landing` |
| `referred_signup` | attributed shadow later gets `user_id` | `referrer_sid` |
| `referred_activated` | attributed shadow's first `doc_exported` | `referrer_sid` |
| `status_shared` | merchant taps Share-to-Status | `doc_type` |
| `broadcast_shared` | merchant shares monthly card | `month` |
| `opt_out` | stop reply or unsubscribe | `channel` |

## Loop health report

Pull from `shadow_profiles` grouped by `referred_by_shadow_id`:

```
artefact_viewed / exports                 → is the artefact seen at all
referred_signup  / artefact_viewed        → does the landing convert
referred_activated / referred_signup      → is the referred audience real
referring_merchants / active_merchants    → what share drives the loop
k_factor                            ≈ artefact_views_per_export
                                        × signup_rate × activation_rate
```

Read `k_factor` as directional, not literal — true viral coefficient needs the
cohort-based calculation, and an approximation reported as a K-factor will be
over-trusted.

**If `artefact_viewed / exports` is near zero, stop.** The artefact is not being
seen, so no downstream optimisation can help — fix placement or the QR, not the copy.