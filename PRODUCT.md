# Product

<!-- impeccable:product-schema 1 -->

## Platform

Progressive Web App (mobile-first web), with planned WhatsApp bot integration and desktop support.

**Domain:** proofa.ng (canonical)


## Users

Nigerian SMEs, entrepreneurs, and freelancers who run their businesses primarily through mobile — WhatsApp sellers, Instagram vendors, market operators, kiosk owners, freelancers (designers, devs, consultants), and service providers (stylists, tailors, artisans). All three personas are served equally without prioritization. Users are on mobile, often transacting on WhatsApp, and need documents generated and shared within seconds. They are not accountants; many have never used formal invoicing software.

## Product Purpose

Proofa eliminates the friction of creating professional business documents on mobile. Tap, fill, generate, share — done in under 60 seconds. Users generate receipts, invoices, and order summaries, then export them as images to share directly on WhatsApp. The product makes Nigerian SMEs look more professional and credible to their customers, which drives trust and sales. Success means a receipt shared on WhatsApp in under a minute, and a business owner who looks legitimate to their buyer. Proofa helps small businesses create professional business documents in seconds. Whether confirming a payment, sending an invoice, or summarizing an order, business owners can generate beautiful, branded documents that increase customer trust without leaving their sales workflow.

The goal is not accounting. The goal is helping businesses look credible, close sales faster, and communicate professionally inside WhatsApp.

## Positioning

The only document generator built specifically for the WhatsApp-first Nigerian SME — not a scaled-down desktop tool, not a generic invoice app. Every design decision prioritizes one-thumb mobile use, instant image export, and WhatsApp shareability over accounting feature depth or desktop workflows.

## Operating Context

- Users generate and share receipts primarily inside active customer conversations on WhatsApp
- The primary output format is a PNG image (not PDF, not a web link), shared via WhatsApp Web Share API or wa.me fallback
- Users often fill in forms while the customer is waiting — speed is a competitive constraint
- Most businesses operate without dedicated accounting software
- Many businesses transact through bank transfer confirmations
- Documents are often generated while conversing directly with customers
- No login required for core flow; the product must have zero barrier to first use
- Most users are on Android; mobile web is the primary delivery surface
- The product is live and serving real users today

## Capabilities and Constraints

**Current (MVP — live):**
- Three document types: Payment Receipt, Simple Invoice, Order Summary
- Three templates: Minimalist, Bold, Classic
- PNG image export via html2canvas / dom-to-image-more
- WhatsApp sharing via Web Share API + wa.me fallback
- Local history (last 20 documents, localStorage)
- Optional business logo upload with crop/resize
- Watermark ("Made with Proofa") on free-tier exports
- PWA-enabled (offline-capable, installable)
- Vercel Analytics integrated

**Auth layer:** Supabase auth is integrated (email + Google OAuth) — not yet gated to features in production.

**Undecided / Post-MVP:**
- Paystack payment and Pro plan gating not yet live
- PDF export (planned for Pro tier)
- Cloud receipt history (planned for Pro tier, replaces localStorage)
- Multi-item invoice math is implemented; currency toggle (₦/\$) planned for Pro
- No backend storage of documents today

**Technical constraints:**
- Next.js 16 (React 19), Tailwind CSS 4, TypeScript
- Framer Motion for animations
- Supabase for auth/DB
- Deployed on Vercel
- No SSR-heavy patterns — form state is client-side React

**Terminology:**
- "Receipt" = Payment Receipt (most used document type)
- "Proofa" = product name; do not abbreviate or alter
- Currency: Nigerian Naira (₦) primary; USD (\$) planned for Pro
- VAT: 7.5% (Nigeria standard, toggleable on invoices)


## Product Vision

Become the default business document platform for African SMEs.

Every small business, whether operating from WhatsApp, Instagram, TikTok, or a physical shop, should be able to create trustworthy, professional customer documents in seconds.

## Non-goals

Proofa is not:

- Accounting software
- Inventory management software
- POS software
- ERP software
- Tax filing software
- Banking software

These may integrate with Proofa in the future but are intentionally outside the product scope.

## Brand Commitments

- **Name:** Proofa (not RecGen — the repo name is a legacy artifact)
- **Domain:** proofa.ng (canonical)
- **Logo:** Orange icon (`/Logo/Proofa orange icon.png`) — orange is the brand anchor color
- **Theme color:** `#e8590c` (orange, set in viewport meta)
- **Fonts:** Outfit (headings), Inter (body), Geist Mono (mono)
- **Voice:** Direct, confident, action-oriented. Nigerian-market-aware. Sells professional credibility, not software features. Copy never says "unlock features" — always "look more professional."
- **Tagline direction:** "Send your receipt on WhatsApp in seconds"
- **Locale:** en-NG; all monetary defaults in ₦ Naira

## Evidence on Hand

- Live product at proofa.ng with real users generating receipts
- MVP build checklist fully complete (all phases 0–13 checked off)
- Three document templates (Minimalist, Bold, Classic) built and shipping
- Supabase auth integrated (email + Google OAuth)
- Vercel Analytics tracking usage
- `/public/Logo/` — brand logo assets on disk
- PRO_PLAN.md: detailed monetization psychology and conversion trigger strategy (written pre-launch)
- No real testimonials or user count data confirmed yet; fabrication is prohibited

## Product Principles

1. **Speed over completeness.** Every interaction should let the user generate and share a document in under 60 seconds. Features that add steps without adding proportional value are deferred.
2. **Professional credibility is the product.** Users are not buying a form; they are buying the perception that they run a real business. Design, copy, and templates must reinforce legitimacy, not expose the tool.
3. **WhatsApp is the office.** Every export, share action, and image format decision assumes WhatsApp as the destination. Desktop-first or PDF-first thinking is out of scope for core flows.
4. **Free must be genuinely useful.** The free tier must produce real value — a watermark is acceptable, a crippled experience is not. Upgrade motivation comes from polish and identity ownership, not necessity.
5. **Zero friction to first use.** No login, no onboarding survey, no tutorial. The form is the first screen. Trust is built through the product itself, not through promises.

6. Businesses should own their brand.

Every receipt generated should feel like it came from the business—not from Proofa.

## Accessibility & Inclusion

- Mobile-first, one-thumb usage — all primary controls within easy thumb reach on a 6" screen
- `userScalable: false` set in viewport (trade-off for consistent template rendering — document for future review)
- No confirmed WCAG target; standard accessible contrast and touch targets should be maintained

## Success Metrics

Primary

- Receipt generated in under 60 seconds
- Receipt shared successfully
- Repeat weekly usage

Secondary

- Pro conversion rate
- Monthly active businesses
- Receipts generated per business
- Time to first receipt after signup

## Product Philosophy

People don't buy receipts.

People buy trust.

Every feature in Proofa should answer one question:

"Will this help a business look more professional to its customer?"

If the answer is no, the feature probably doesn't belong in the product.