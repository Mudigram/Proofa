# Segment Catalog

Segment IDs here are the canonical IDs emitted by `lib/segmentation/segments.ts`.
Keep the two in sync — if the engine adds a segment, add it here with a play, or
it will show up in the admin console with no playbook attached.

Every entry must stay enumerable: a predicate that resolves to a `user_id` or
`shadow_id` list. If a definition cannot, delete it.

---

## Activation

### `never-activated`
- **Predicate:** `exports = 0 AND sessions >= 1 AND last_active within 7d`
- **Read:** reached the form, never produced a document. The leak is in the form
  or the preview, not in willingness — they showed up with intent.
- **Play:** tier 1 only. Do not email. Fix the step where they stopped, using the
  event immediately preceding their last. If the last event is a validation error
  or an abandoned required field, that is the whole campaign.
- **Do not:** send "welcome to Proofa" sequences. They never arrived.

### `first-win-earned`
- **Predicate:** `exports = 1 AND days_since_first <= 7`
- **Read:** the single most fragile moment. One receipt exists; the habit does not.
- **Play:** tier 3 — a single message that helps them do the *second* receipt
  (save bank details, reuse business name). Value, not praise.
- **Watch:** second-export-within-7d rate is the true activation metric here.

### `ghosted-after-first`
- **Predicate:** `exports = 1 AND days_since_last > 14 AND days_since_first <= 45`
- **Read:** got the artifact, got no reason to return. Almost always "my customer
  did not react" or "I could not find it again".
- **Play:** tier 2 — founder WhatsApp, plain ask: what stopped you. Ask, do not pitch.
- **Why it matters:** cheapest source of real product insight you have.

---

## Engagement

### `power-exporter-free`
- **Predicate:** `plan = free AND exports_30d >= 5 AND paywall_views = 0`
- **Read:** running a real business on the free tier and never shown a reason to pay.
- **Play:** tier 1 — paywall at the export moment, where PRO_PLAN Trigger A lives.
  Highest-value segment on the product. Volume typically small, worth per head high.
- **Ceiling check:** if this segment is large and conversion is zero, the gate is
  misplaced, not the audience wrong.

### `high-turnover-thin-margin`
- **Predicate:** `exports_30d >= 8 AND avg_doc_value < 15000`
- **Read:** provisions, food, airtime, small retail. Many receipts, small amounts.
  Speed is the entire product for them; polish is irrelevant.
- **Play:** Business plan volume features (bulk, reuse, history), never Pro branding.
  Selling a logo to a sino seller is a category error.
- **Pricing note:** ₦2,500/mo must beat "I just write it in the chat for free".
  Sell time saved per day, quantified.

### `big-ticket-low-freq`
- **Predicate:** `total_volume_ngn >= 1000000 AND exports_90d <= 5`
- **Read:** electronics, furniture, land, property, cars. One document is worth more
  than a year of subscription. Highest willingness to pay per interaction.
- **Play:** tier 2, personal, named, by the founder. No automation, ever. Small list.
- **Copy:** credibility under a large transaction — a buyer paying ₦900k for a
  fridge wants a receipt that looks like it came from a company, not a chat log.

### `invoice-upsell`
- **Predicate:** `receipt_share > 0.8 AND exports >= 3 AND invoice_count = 0`
- **Read:** taking money but never requesting it. Likely extends credit and
  struggles to collect — a real, painful, unpaid-for problem.
- **Play:** invoice-first education. "Get paid, not chased." Strong candidate for a
  lead magnet or a short WhatsApp-status explainer.

---

## Conversion

### `brand-conscious-stalled`
- **Predicate:** `plan = free AND logo_or_color_intent >= 1 AND paywall_views = 0 AND last_active within 14d`
- **Read:** desire is proven and price has never been encountered. Product gap, not
  demand gap — the intent signal leaks before any gate appears.
- **Play:** tier 2 note plus Pro logo demo; and file the paywall-placement fix.

### `upgrade-gate-stalled`
- **Predicate:** `paywall_views >= 1 AND plan = free AND last_active within 7d`
- **Read:** live price objection or trust objection, still warm. Decays within days.
- **Play:** tier 2 objection-specific follow-up. Route by which gate they saw —
  Trigger A (export) is a value objection, Trigger B (logo) an identity objection,
  Trigger E (history) a fear-of-loss objection. Same offer, different first line.
- **Rule:** do not discount on first follow-up. Establish the guarantee first.

### `cross-border`
- **Predicate:** `docs_usd >= 1`
- **Read:** diaspora clients, export sellers, foreign-paid freelancers. Dollar
  exposure means higher income and real PDF/invoice needs.
- **Play:** Pro pack with PDF + currency toggle framed as "bill your Lagos client
  and your London client properly."

### `pwa-install-ready`
- **Predicate:** `platform = Android AND is_pwa = false AND exports >= 2`
- **Read:** repeat mobile-web user, not installed. One tap from home-screen and
  re-engagement you get for free.
- **Play:** in-app install prompt after second export. Cheapest retention lever present.

---

## Retention & revenue

### `churn-risk-paid`
- **Predicate:** `plan in (pro, business) AND exports_30d < 0.5 * personal_median_30d AND days_since_last > 14`
- **Read:** paid and disengaging. Compare to *their own* norm — a monthly trader at
  their own median is healthy, not quiet.
- **Play:** `churn-prevention` save-offer and dunning review before any marketing.
- **Economics:** saving a ₦2,500 sub is worth more than a new one — already acquired,
  already trusting.

### `dunning-recoverable`
- **Predicate:** `subscription_status = past_due OR payment_failed`
- **Read:** usually a failed transfer or expired card, not a decision to leave.
- **Play:** tier 2 personal WhatsApp, "your Pro lapsed, no action needed on my side,
  want me to reinstate?" Do not send a formal dunning email chain to a micro seller.

### `dormant-winnable`
- **Predicate:** `exports_lifetime >= 3 AND days_since_last between 21 and 60`
- **Read:** had a habit, lost it. Recoverable only within ~60 days.
- **Play:** tier 3 win-back anchored on their own history: "you sent 14 receipts in
  March" is the only message that lands, because it is true and specific.

### `loyalty-loop`
- **Predicate:** `rfm_score >= 12 AND days_since_last <= 14 AND exports >= 10 AND churn_risk = low`
- **Read:** the only segment allowed to be asked for favours.
- **Play:** testimonials (see `proof-collection.md`), referrals, case studies,
  beta features. **This is the sole legitimate source of social proof.**
- **Rule:** never send a discount to this segment. You are paying people who already
  buy to buy more, and teaching the price is negotiable.

---

## Pipeline (anonymous)

### `shadow-lead-reachable`
- **Predicate:** `user_id is null AND contact_phone is not null AND exports >= 3`
- **Read:** real trading business generating volume with no account. Risk: local
  history dies with their phone.
- **Play:** WhatsApp with their business name and their own receipt count.
- **Never:** use any buyer contact captured in event properties.

### `shadow-lead-high-intent`
- **Predicate:** `user_id is null AND feature_tags contains (Brand Conscious OR Upgrade Primed)`
- **Read:** intent without identity. Highest-value anonymous group; also the group
  most likely to lose their data, which is the honest hook.
- **Play:** "create an account so your receipts survive a phone change."