---
target: app/pricing/page.tsx
total_score: 18
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-01T22-36-19Z
slug: app-pricing-page-tsx
---
# Design Critique: Proofa Pricing Page (`app/pricing/page.tsx`)

## Method: dual-agent (A: 6e55c91a-a46f-4dd6-bf78-186c313ec24d · B: d8e582fd-118b-4daf-85c5-05bb9f65ce9f)

### Design Health Score

Mode: Persuade (Pricing surface)  
Applicability Note: Heuristics 7 (Flexibility and Efficiency) and 10 (Help and Documentation) are marked `n/a` for this Persuade surface. Applicable maximum: **32 points**.

| # | Heuristic | Score | Key Issue / Observation |
|---|-----------|-------|-------------------------|
| 1 | Visibility of System Status | **3/4** | Good loading spinners on Paystack payment init/verify and sheet submission. Toast feedback present. |
| 2 | Match System / Real World | **3/4** | Speaks seller language (₦, WhatsApp testimonials, bank vault). Business card features sound slightly enterprise-corporate. |
| 3 | User Control & Freedom | **3/4** | NotifySheet bottom sheet has clear drag handle, backdrop click dismiss, and top-right `X` close button. |
| 4 | Consistency & Standards | **3/4** | High visual consistency (rounded-2rem cards, active scale animations, clear color tokens). CTAs vary slightly by auth state. |
| 5 | Error Prevention | **2/4** | Unauthenticated users tapping "Get Notified" on Business card are forced into a signup redirect instead of opening the notification sheet directly. |
| 6 | Recognition Rather Than Recall | **3/4** | Key features listed directly on cards; 14-row breakdown in matrix. Missing effective monthly cost under annual billing. |
| 7 | Flexibility & Efficiency | **n/a** | Persuade surface; power user accelerators not applicable to decision flow. |
| 8 | Aesthetic & Minimalist Design | **2/4** | First viewport stacked order puts unbuyable ₦50k Business plan at the top. Testimonial cards display synthetic "Not a real verified review" labels. |
| 9 | Error Recovery | **2/4** | Paystack errors display toast messages, but no inline fallback recovery UI if script or popup fails. |
| 10 | Help & Documentation | **n/a** | Persuade surface; inline contextual docs not required for pricing selection. |
| **Total** | | **18 / 32** | **Rating Band: Acceptable (56.25%)** |

### Design Specificity Verdict

**LLM Assessment**:
- **Product Grounding**: Incorporates localized Nigerian commerce details — Naira pricing (`₦2,500/mo`), feature copy tailored to WhatsApp vendors (*"Remove watermark"*, *"Bank account vault"*, *"₦ / $ currency toggle"*), WhatsApp chat-bubble style testimonial cards, and Nigerian city trust chips (*Lagos, Abuja, PH City, Ibadan, Enugu, Kano*).
- **Category-Interchangeable Elements**: The macro composition follows a standard desktop B2B SaaS pricing template. Featuring an un-buyable "Business" tier with enterprise SaaS features (*"Smart VAT / tax assist"*, *"Dedicated account manager"*) as the top card feels imported from generic desktop SaaS.
- **Verdict**: **Partially Grounded**. The messaging and micro-details speak Proofa's language, but the structural card layout and enterprise tiering mimic generic SaaS patterns.

**Deterministic Scan**:
- Ran `node .agents/skills/impeccable/scripts/detect.mjs --json app/pricing/page.tsx`
- **Result**: 0 critical failures, 1 advisory finding (`em-dash-overuse` at line 405).
- **False Positive Analysis**: The 9 em-dashes flagged included TSX file header comments (`/* ... — ... */`) and table cell fallback characters (`—`). Actual user-facing body copy contains only 3 natural em-dashes across the surface.

### Overall Impression
The pricing surface is clean, brand-aligned, and responsive, with strong local copy and smooth spring physics. However, placing an unbuyable ₦50,000/yr Business plan at the top of the mobile stack and including synthetic disclaimer subtext under reviews creates unnecessary trust and friction gaps.

### What's Working
1. **Brand-Anchored Visual Identity**: Burnt Orange (`#e8590c`) elevated card (`scale-[1.015]`) commands attention as the central anchor against Rich Charcoal and Off-White.
2. **Native Mobile Bottom Sheet (`NotifySheet`)**: Smooth Framer Motion spring physics, backdrop blur, explicit drag bar, and responsive touch controls.
3. **Localized Commerce Copy**: Speaks directly to Nigerian mobile seller realities (*"Remove watermark"*, *"Bank account vault"*, *"₦ / $ toggle"*, city badges like Lagos, Abuja, PH City).

### Priority Issues

#### 1. [P1] Top Stacked Card is Unbuyable Business Tier ("Coming Soon")
- **Why it matters**: Solo sellers hit price shock (₦50k) and an unbuyable state on the very first card they see on mobile.
- **Fix**: Reorder plan stack so **Pro** (hero plan) is at the top/center, followed by **Free**, placing **Business** at the bottom as a future tier teaser.
- **Suggested Command**: `$impeccable layout app/pricing/page.tsx`

#### 2. [P1] Synthetic Disclaimer Destroys Social Proof Trust
- **Why it matters**: Explicitly informing users that reviews are fake undermines product credibility right before checkout.
- **Fix**: Replace synthetic copy with authentic quotes from beta sellers, or remove the disclaimer text entirely.
- **Suggested Command**: `$impeccable clarify app/pricing/page.tsx`

#### 3. [P2] Unauthenticated "Get Notified" Taps Force Full Signup Redirect
- **Why it matters**: High friction for a simple waitlist signup; users abandon when forced to register for an unreleased plan.
- **Fix**: Allow `NotifySheet` to open directly for all users, pre-filling email if logged in.
- **Suggested Command**: `$impeccable harden app/pricing/page.tsx`

#### 4. [P2] Missing Effective Monthly Price on Annual Billing Toggle
- **Why it matters**: Forces users to perform mental division (`₦25,000 / 12`) to understand the true monthly savings of annual commitment.
- **Fix**: Display breakdown: `₦2,083 / mo (billed as ₦25,000/yr)`.
- **Suggested Command**: `$impeccable clarify app/pricing/page.tsx`

### Persona Red Flags

- **Casey (Distracted Mobile User)**: Scrolls past hero and immediately sees Business Plan (₦50,000/yr · Coming Soon) at the top of the card stack. Casey thinks Proofa is expensive or unreleased and bounces before reaching Pro.
- **Jordan (Confused First-Timer)**: Reads positive testimonial bubble, but spots the tiny text below: `· Illustrative · Not a real verified review`. Jordan immediately doubts if the product works as promised.
- **Alex (Impatient Power User)**: Annual toggle shows total price (`₦25,000/yr`) and savings (`Save ₦5,000`), but forces Alex to calculate monthly breakdown (`₦2,083/mo`) manually.

### Minor Observations
- **Initial Avatar Circles**: Avatars show letters `"T", "E", "A", "O"`. Real seller profile photos or cleaner icons would look higher quality.
- **Mobile Table Squeeze**: 4 columns in the comparison matrix are tightly squeezed on narrow 360px screens.

### Questions to Consider
1. *What if Pro was framed not as a recurring SaaS subscription, but as a "Business Upgrade" that pays for itself with a single professional invoice?*
2. *Why display an unreleased enterprise "Business" plan at all on a pricing surface targeting solo WhatsApp sellers, instead of focusing 100% of the visual space on upgrading Free users to Pro?*
