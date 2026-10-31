# Signal → Playbook Map

Maps raw `telemetry_events.event_name` / `properties` to an intent read and a play.
Event names match `lib/segmentation/events.ts`.

| Signal | Read it as | Do NOT read it as | Play → skill |
|---|---|---|---|
| `doc_exported` receipt | payment received; moment of relief | general usage | timing for upsell, `paywalls` |
| `doc_exported` invoice | awaiting money; mild anxiety | same as receipt | reminder/collect angle, `emails` |
| `doc_exported` order | mid-fulfilment | sale closed | delivery-status follow-up |
| Rising `doc_exported` frequency | habit forming | noise | trigger referral now, `referrals` |
| `avg_doc_value` rising | business growing | inflation alone | Pro value re-frame, `offers` |
| `avg_doc_value` high, count low | big-ticket seller | unengaged | personal outreach, `prospecting` |
| `feature_intent` `logo_upload` | identity/credibility desire | curiosity | Pro identity pitch, `copywriting` |
| `feature_intent` `custom_color` | brand aesthetics | curiosity | Pro design pitch |
| `feature_intent` `currency_toggle` | foreign clients | browsing | cross-border offer, `offers` |
| `feature_intent` `classic_template` | premium/professional self-image | template taste | Pro template demo |
| `feature_intent` `bank_vault` | wants payment friction gone | data hoarding | Business plan, speed pitch |
| `feature_intent` `whatsapp_direct` | lives in WhatsApp ops | minor preference | `whatsapp-growth` |
| `upgrade_gate_viewed` variant `export` | value objection, live | rejection | value re-frame, `marketing-psychology` |
| `upgrade_gate_viewed` variant `logo` | identity objection, live | rejection | identity pitch |
| `upgrade_gate_viewed` repeated 3+ then quiet | price is the wall | window-shopper | guarantee first, discount last |
| Gate viewed then immediate exit | offer failed at price reveal | audience is wrong | fix offer, `offers` |
| `session_ping` evening/weekend skew | trades after hours | bot traffic | schedule sends to evening WAT |
| `isInAppWebview` instagram/whatsapp | arrived socially | direct traffic | social proof on landing, `social` |
| `is_pwa = false` on Android, repeat | install not prompted | disinterest | install prompt, `cro` |
| Validation error then exit | form friction | lack of intent | product fix, `cro` |
| `subscription_status = past_due` | payment mechanics failed | decided to leave | `churn-prevention` dunning |
| Second export within 7d | activation achieved | luck | amplify, `onboarding` |

## Sequence rules

1. **Recompute intent, never trust stored `feature_tags`.** They are append-only
   and never decay — a single tap three months ago still reads "Brand Conscious".
   Always re-derive from raw events inside the window.
2. **Recency beats frequency** for upgrade plays. One gate view this week outranks
   ten exports last month.
3. **Frequency beats recency** for retention plays. A 30-receipt merchant quiet 20
   days is a rescue; a 1-receipt merchant active today is not yet a relationship.
4. **Absence of a signal is only meaningful inside a window you can observe.**
   `paywall_views = 0` may mean "not interested" or "never reached the gate".
   Check reachability before interpreting refusal — this single distinction is
   where most upgrade diagnosis goes wrong.
5. **One play per customer per 7 days.** Overlapping campaigns to the same merchant
   is how you earn a block. Deduplicate target lists across segments before sending.