# 🧾 Proofa — Universal Receipt & Invoice Generator

## MVP Specification v1.0

> **Mission:** Give Nigerian SMEs the fastest way to create professional receipts, invoices, and order summaries — optimized for WhatsApp sharing, zero friction.

---

## 1. Problem Statement

Nigerian SMEs live inside WhatsApp. They need to generate clean, professional payment documents *instantly* — but current solutions demand complex software installations, accounting knowledge, or unfamiliar dashboards.

**Proofa** eliminates that friction: tap, fill, generate, share. Done.

---

## 2. Target Users

| Persona | Example |
|---------|---------|
| Small vendors | Sneaker sellers, phone accessory shops |
| Freelancers | Designers, developers, consultants |
| Online sellers | Instagram & WhatsApp-based businesses |
| Service providers | Stylists, tailors, artisans |

---

## 3. MVP Document Types (3 Only)

### 3.1 — Payment Receipt ⭐ (Primary Use Case)

| Field | Required | Notes |
|-------|----------|-------|
| Business Name | ✅ | Default placeholder: "Your Business" |
| Customer Name | ❌ | Optional toggle |
| Item / Description | ✅ | Single text field |
| Amount (₦) | ✅ | Numeric input with Naira formatting |
| Status | ✅ | Paid · Deposit · Balance Due |
| Date | ✅ | Auto-filled, editable |

### 3.2 — Simple Invoice

| Field | Required | Notes |
|-------|----------|-------|
| Business Name | ✅ | — |
| Customer Name | ✅ | — |
| Item / Service | ✅ | — |
| Amount (₦) | ✅ | — |
| Due Date | ❌ | Optional |
| Notes | ❌ | Optional (e.g. bank details) |

### 3.3 — Order Summary / Confirmation

| Field | Required | Notes |
|-------|----------|-------|
| Customer Name | ✅ | — |
| Items | ✅ | Simple text list for MVP |
| Total Amount (₦) | ✅ | — |
| Delivery Status | ✅ | Pending · Processing · Delivered |

---

## 4. UX Flow (Mobile-First)

```
Home Screen
  ├─ 🟢 Generate Receipt     (big button)
  ├─ 🔵 Generate Invoice     (big button)
  └─ 🟠 Generate Order Summary (big button)

Tap → Fill Form → Live Preview → Actions
  ├─ ✅ Share to WhatsApp
  ├─ 📥 Download Image (PNG)
  └─ 🕐 Auto-saved to Recent History
```

### Design Principles
- **One-thumb usage** — all controls within easy thumb reach
- **Instant preview** — see the receipt update as you type
- **No login required** — zero barrier to first use
- **No dashboards** — just forms and output

---

## 5. Templates

### MVP: 3 Clean Templates

| # | Template Name | Style |
|---|---------------|-------|
| 1 | **Minimalist** | Clean white, subtle borders, modern typography |
| 2 | **Bold** | Dark header, clear hierarchy, strong contrast |
| 3 | **Classic** | Soft accents, traditional receipt feel, warm tones |

### Template Rules
- Business-neutral colors
- All templates support optional logo placement
- Clean and professional — no gimmicks
- Consistent layout across all three document types

---

## 6. Branding (Lightweight)

| Feature | MVP Scope |
|---------|-----------|
| Business Name | ✅ Always shown prominently |
| Logo Upload | ✅ Optional, displayed in header |
| Full brand system | ❌ Post-MVP |

> Logo upload dramatically increases perceived value and user retention.

---

## 7. History / Saving

| Feature | Approach |
|---------|----------|
| Storage | LocalStorage (browser) |
| Capacity | Last 20 documents |
| Accounts | ❌ Not required |
| Cloud sync | ❌ Post-MVP |

Simple "Recent Documents" list accessible from the home screen.

---

## 8. Export & Sharing

### Primary (MVP)
- **Image export (PNG)** — via `html2canvas` or `dom-to-image`
- **WhatsApp share** — via Web Share API / `wa.me` deep link
- **Direct download** — PNG saved to device

### Post-MVP (Premium)
- PDF export
- HD image export

---

## 9. Monetization Strategy

### Free Tier (Extremely Usable)
- ✅ All 3 document types
- ✅ 2 of 3 templates
- ✅ Basic image export
- ⚠️ Small "Made with RecGen" watermark

### Paid Tier (Nigeria-Friendly Pricing)
- ✅ Remove watermark
- ✅ All templates + future additions
- ✅ Logo support + HD export
- ✅ PDF export
- ✅ Color themes / custom accent color

> **Psychology:** Free must be genuinely useful. Upgrade is about polish, not necessity.

---

## 10. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 16** (React 19) |
| Styling | **Tailwind CSS 4** |
| Image Export | `html2canvas` / `dom-to-image-more` |
| State | React state + LocalStorage |
| Hosting | Vercel (recommended) |
| Backend | **None** — pure frontend MVP |
| WhatsApp | Web Share API + `wa.me` link fallback |

---

## 11. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Next.js App                     │
├──────────┬──────────┬──────────┬────────────────┤
│  Home    │  Form    │ Preview  │  History       │
│  Page    │  Pages   │ + Export │  (LocalStorage)│
│          │ (3 types)│          │                │
├──────────┴──────────┴──────────┴────────────────┤
│         Shared Components & Templates            │
│  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │Minimalt│  │ Bold   │  │Classic │            │
│  └────────┘  └────────┘  └────────┘            │
├─────────────────────────────────────────────────┤
│  Utils: image export, WhatsApp share, storage   │
└─────────────────────────────────────────────────┘
```

---

## 12. What MVP Does NOT Include

| Feature | Reason |
|---------|--------|
| Multi-item line items with math | Adds complexity, post-MVP |
| User accounts / database | No friction policy |
| Analytics dashboards | Not needed for launch |
| Bank integration | Complex, regulatory |
| PDF export | Premium tier, post-MVP |
| WhatsApp bot | Phase 2 feature |
| Full brand customization | Post-MVP polish |

---

## 13. Success Metrics

| Metric | Target |
|--------|--------|
| Time to first receipt | < 60 seconds |
| Mobile usability score | 90+ (Lighthouse) |
| WhatsApp shares per session | ≥ 1 |
| Return users (7-day) | > 30% |

---

## 14. Post-MVP Roadmap (Not for v1)

1. **WhatsApp Bot** — link-to-web approach (user types "receipt" → gets web link)
2. **PDF Export** — premium feature
3. **Multi-item invoices** — line items with quantity × price
4. **Cloud storage** — optional account creation
5. **Custom color themes** — brand accent colors
6. **Recurring invoices** — scheduled generation
7. **Analytics** — basic usage tracking

---

*Document created: February 17, 2026*
*Version: 1.0 — MVP Specification*
