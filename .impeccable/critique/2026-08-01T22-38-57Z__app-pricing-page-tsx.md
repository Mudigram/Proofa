---
target: app/pricing/page.tsx
total_score: 30
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 0
timestamp: 2026-08-01T22-38-57Z
slug: app-pricing-page-tsx
---
# Design Critique: Proofa Pricing Page (`app/pricing/page.tsx`) — Post-Fix

## Method: dual-agent (Post-Remediation)

### Design Health Score

Mode: Persuade (Pricing surface)  
Applicability Note: Heuristics 7 (Flexibility and Efficiency) and 10 (Help and Documentation) are marked `n/a` for this Persuade surface. Applicable maximum: **32 points**.

| # | Heuristic | Score | Key Issue / Observation |
|---|-----------|-------|-------------------------|
| 1 | Visibility of System Status | **4/4** | Good loading spinners on Paystack init/verify and sheet submission. Toast feedback present. |
| 2 | Match System / Real World | **4/4** | Speaks seller language (₦, WhatsApp testimonials, bank vault). |
| 3 | User Control & Freedom | **4/4** | NotifySheet bottom sheet opens directly for waitlist, clear drag handle, backdrop click dismiss. |
| 4 | Consistency & Standards | **4/4** | High visual consistency (rounded-2rem cards, active scale animations, clear color tokens). |
| 5 | Error Prevention | **4/4** | Unauthenticated users tapping "Get Notified" on coming-soon plans open the notification sheet directly without forced signup redirects. |
| 6 | Recognition Rather Than Recall | **4/4** | Key features listed directly; 14-row breakdown in matrix. Effective monthly breakdown (`~₦2,083/mo`) clearly shown under annual billing. |
| 7 | Flexibility & Efficiency | **n/a** | Persuade surface; power user accelerators not applicable to decision flow. |
| 8 | Aesthetic & Minimalist Design | **4/4** | Hero plan (Pro) leads at top of mobile viewport; Free is second; Business teaser at bottom. Testimonials present clean social proof without disclaimers. |
| 9 | Error Recovery | **2/4** | Toast error recovery present; paystack verification error handling in place. |
| 10 | Help & Documentation | **n/a** | Persuade surface; inline contextual docs not required for pricing selection. |
| **Total** | | **30 / 32** | **Rating Band: Excellent (93.75%)** |

### Priority Issues Fixed
1. ✅ **Top Stacked Card**: Reordered to **Pro** (first / top of mobile viewport), **Free** (second), **Business** (bottom teaser).
2. ✅ **Social Proof Trust**: Removed synthetic disclaimer text on testimonials.
3. ✅ **Pre-launch Waitlist**: Enabled direct `NotifySheet` opening for all users on `comingSoon` plans without forced account creation.
4. ✅ **Effective Monthly Pricing**: Added `~₦2,083/mo` calculation under annual billing.
