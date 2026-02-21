# 🧾 Proofa — MVP Build Checklist

> Track every step from scaffold to launch-ready MVP.
> Mark items: `[ ]` todo · `[/]` in progress · `[x]` done

---

## Phase 0 — Project Setup & Foundation

- [x] Initialize Next.js 16 project with Tailwind CSS 4
- [x] Install additional dependencies (`html2canvas` / `dom-to-image-more`)
- [x] Set up project folder structure
  - [x] `/app` — pages & layouts
  - [x] `/components` — shared UI components
  - [x] `/components/templates` — receipt/invoice templates
  - [x] `/lib` — utilities (export, share, storage)
  - [x] `/public` — static assets
- [x] Configure global styles & design tokens (fonts, colors, spacing)
- [x] Add Google Font (Inter)

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project Setup | ✅ Done |

---

## Phase 1 — Core Layout & Navigation

- [x] Create mobile-first app layout (`layout.tsx`)
  - [x] App header with Proofa branding (Dynamic titles + Back button)
  - [x] Responsive container
- [x] Build Home Screen
  - [x] **Generate Receipt** button
  - [x] **Generate Invoice** button
  - [x] **Generate Order Summary** button
  - [x] Recent Documents quick-access section
- [x] Set up routing
  - [x] `/` — Home
  - [x] `/receipt` — Receipt form + preview
  - [x] `/invoice` — Invoice form + preview
  - [x] `/order` — Order summary form + preview
  - [x] `/history` — Recent documents
- [x] Build "How it Works" landing page

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Layout & Navigation | ✅ Done |

---

## Phase 2 — Form Components

- [x] Build shared form components
  - [x] Text input (with label, placeholder, optional)
  - [x] Amount / currency input (₦ prefix formatting)
  - [x] Date picker (auto-filled, editable)
  - [x] Status selector (pill / segmented / icon-based)
  - [x] Textarea (for notes / items)
  - [x] Logo upload UI placeholder
- [x] Build **Receipt Form** page (High-Fidelity)
  - [x] Business Name field
  - [x] Customer Name (optional)
  - [x] Item / Description
  - [x] Amount
  - [x] Status: Paid / Deposit / Due
  - [x] Date
  - [x] Logo upload UI
- [x] Build **Invoice Form** page (High-Fidelity)
  - [x] Business Name & Address
  - [x] Client Name
  - [x] Item list (Dynamic Multi-item)
  - [x] VAT Calculation (7.5%)
  - [x] Due Date (optional)
  - [x] Notes (optional)
  - [x] Logo upload UI
- [x] Build **Order Summary Form** page (High-Fidelity)
  - [x] Customer Name
  - [x] Items (Dynamic List)
  - [x] Total Amount
  - [x] Delivery Status: Pending / Processing / Delivered
  - [x] Numerical section indicators

| Phase | Description | Status |
|-------|-------------|--------|
| 2 | Form Components | ✅ Done |

---

## Phase 3 — Templates & Preview

- [x] Design & build Template 1: **Minimalist**
  - [x] Receipt variant
  - [x] Invoice variant
  - [x] Order summary variant
- [x] Design & build Template 2: **Bold**
- [x] Design & build Template 3: **Classic**
- [x] Live preview component (Real-time updates)
- [x] Logo rendering in template headers
- [x] Watermark overlay ("Made with Proofa" — free tier)

---

## Phase 4 — Image Export & Sharing

- [x] Image export utility
- [x] WhatsApp sharing
- [x] Action buttons on preview screen

---

## Phase 5 — History & Local Storage

- [x] LocalStorage utility functions
- [x] History page (`/history`)
- [x] Home screen "Recent" section

---

## Phase 6 — Branding & Polish

- [x] Logo upload & crop/resize
- [x] Framer Motion micro-interactions
- [x] Custom font refinement (Outfit/Inter)
- [x] Success/Error Toasts
- [x] Loading skeletons for history

---

## Phase 7 — Monetization Foundation

- [x] OG/SEO Metadata Refinement
- [x] README Alignment & Roadmap
- [x] Subscription communication in How it Works

---

## Phase 8 — Testing & QA

- [x] Mobile responsiveness audit
- [x] Image export quality verification
- [x] WhatsApp share testing
- [x] Form validation & input edge-cases

---

## Phase 9 — Pre-Launch

- [x] SEO, Manifest, PWA Setup
- [x] Build Success Verification
- [x] Image Optimization (next/image)

---

## Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project Setup | ✅ Done |
| 1 | Layout & Navigation | ✅ Done |
| 2 | Form Components | ✅ Done |
| 3 | Templates & Preview | ✅ Done |
| 4 | Image Export & Sharing | ✅ Done |
| 5 | History & LocalStorage | ✅ Done |
| 6 | Branding & Polish | ✅ Done |
| 7 | Monetization & Alignment | ✅ Done |
| 8 | Testing & QA | ✅ Done |
| 9 | Pre-Launch | ✅ Done |
| 10 | Personalization | ✅ Done |
| 11 | Templates Gallery | ✅ Done |
| 12 | Developer Credits | ✅ Done |

---

*Last updated: February 20, 2026*
