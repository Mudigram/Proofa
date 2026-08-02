---
name: Proofa
description: Fast, professional business documents for Nigerian SMEs — tap, fill, generate, share.
colors:
  primary: "#e8590c"
  primary-deep: "#d44d0b"
  primary-dark: "#9e360d"
  primary-light: "#ffd1b3"
  primary-wash: "#fff4ed"
  secondary-dark: "#1a1a1a"
  secondary-deeper: "#0d0d0d"
  neutral-bg: "#fafafa"
  neutral-subtle: "#f5f5f5"
  neutral-border: "#eeeeee"
  neutral-divider: "#e0e0e0"
  neutral-muted: "#9e9e9e"
  neutral-secondary: "#757575"
  neutral-body: "#616161"
  neutral-emphasis: "#424242"
  neutral-strong: "#212121"
typography:
  display:
    fontFamily: "Outfit, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 6vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Outfit, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Outfit, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 900
    letterSpacing: "0.1em"
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.2xl}"
    padding: "16px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-primary-active:
    backgroundColor: "{colors.primary-dark}"
  button-secondary:
    backgroundColor: "{colors.neutral-subtle}"
    textColor: "{colors.neutral-strong}"
    rounded: "{rounded.2xl}"
    padding: "14px 24px"
  button-ghost-orange:
    backgroundColor: "{colors.primary-wash}"
    textColor: "{colors.primary}"
    rounded: "{rounded.3xl}"
    padding: "6px 12px"
  input-default:
    backgroundColor: "#ffffff"
    textColor: "{colors.neutral-strong}"
    rounded: "{rounded.2xl}"
    padding: "14px 16px"
  card-default:
    backgroundColor: "#ffffff"
    rounded: "{rounded.2xl}"
    padding: "{spacing.xl}"
  bottom-nav:
    backgroundColor: "rgba(255,255,255,0.8)"
    rounded: "{rounded.3xl}"
  fab:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    size: "56px"
---

# Design System: Proofa

## Overview

**Creative North Star: "The Mobile Commerce Receipt"**

Proofa's visual identity is built for speed, trust, and mobile authority. Every design decision is made in service of a single moment: a WhatsApp seller filling in a form while the customer is waiting, then tapping Share and watching a professional document land in the chat. The system is optimized for that 45-second interaction window — no decoration that slows comprehension, no detail that earns a second glance at the wrong moment.

The palette is a study in contrast without complexity: a single Burnt Orange accent that carries full brand authority, a Rich Charcoal that anchors dark document headers, and a disciplined greyscale that runs the surfaces. Orange earns credibility — it signals energy, premium attention, and Nigerian market confidence without shouting. Charcoal anchors the Bold template and the FAB with quiet authority. The neutral surfaces (off-white to mid-grey) keep the focus on the user's content, not the chrome.

Typography leans heavy. Outfit at 800–900 weight for all headings; uppercase label text at 10px/900 weight with wide tracking for field labels, section markers, and metadata. Body copy in Inter at 500 weight — readable but never passive. Radius is consistently large (16–24px for inputs and cards, 32px for nav and modals), giving the entire product a rounded, approachable physicality that works well at thumb scale. The FAB juts above the navigation rail as the most persistent action anchor on every screen.

**Key Characteristics:**
- Orange-dominant single-accent palette; never split the attention of the primary colour
- Mobile-first container (max 480px) centred on all screen sizes
- Uppercase tracking-widest labels throughout (field labels, nav items, status badges)
- Scale-on-active feedback on every interactive element (`active:scale-95`, `active:scale-[0.99]`)
- Glass/blur header and bottom navigation with `backdrop-filter: blur()`
- Framer Motion spring transitions — damping 25–30, stiffness 300–400 — for modals and sheet overlays
- Dark charcoal (`#1a1a1a`) reserved for the Invoice document header panel only; not used in app chrome

## Colors

A tight three-family palette: Burnt Orange (primary), Rich Charcoal (document header + semantic dark), and Greyscale Neutral (all surfaces, borders, text).

### Primary
- **Burnt Orange** (`#e8590c`): The brand anchor. Used on all primary CTAs, the FAB, active nav indicators, focus rings, segmented control active state, and any element that communicates "act now." Appears as both solid fill and in `primary-50` (#fff4ed) wash backgrounds for badge containers and hover states on ghost buttons.
- **Ember Deep** (`#d44d0b`): Hover state for primary buttons. One step darker; used on `:hover` only.
- **Burnt Dark** (`#9e360d`): `:active` state and error-adjacent accent uses. Rarely appears in the UI.
- **Orange Mist** (`#ffd1b3`): Border colour on the avatar / profile placeholder ring. Connects logo-related elements to the brand without full saturation.
- **Orange Wash** (`#fff4ed`): Background of Pro badge, "Go Pro" button, icon containers on UpgradePrompt. The lightest expression of the brand — reads as warm white.

### Secondary
- **Rich Charcoal** (`#1a1a1a`): The Bold document template's left panel. The only use of near-black in the product outside of body text. Creates a premium split-panel header that signals serious business documentation.
- **Deep Void** (`#0d0d0d`): Backdrop tint variant; not used on surfaces.

### Neutral
- **Off-White Canvas** (`#fafafa`): App body background; the default page surface.
- **Light Lift** (`#f5f5f5`): Hover backgrounds, disabled field fills, secondary button backgrounds.
- **Hairline** (`#eeeeee`): Card borders, input borders, divider lines.
- **Rule Grey** (`#e0e0e0`): Section dividers within templates.
- **Mid Grey** (`#9e9e9e`): Placeholder text, secondary metadata.
- **Secondary Text** (`#757575`): Subtext, helper labels, inactive nav icons.
- **Body Text** (`#616161`): Default running-text paragraphs; rarely used since most text is `#212121` or white.
- **Strong Emphasis** (`#424242`): Timestamps, secondary headings in templates.
- **Near Black** (`#212121`): Primary body text; page headings; all high-importance content.

**The One Accent Rule.** Orange (`#e8590c`) is the only coloured accent in the application chrome. No competing accent colours on backgrounds, borders, or icons. Semantic status colours (green for success toast, red for error toast) live only in transient notification elements — they never appear on persistent surfaces.

## Typography

**Display / Heading Font:** Outfit (Google Fonts) — subsets: Latin; display swap  
**Body / UI Font:** Inter (Google Fonts) — subsets: Latin; display swap  
**Mono Font:** Geist Mono (Google Fonts) — used for reference numbers, receipt codes

**Character:** Outfit at heavy weights brings commercial confidence without stubbornness — the humanist letterforms keep it friendly where a geometric face would feel cold. Inter at 500 weight body keeps form labels and metadata readable at 10–13px on mobile screens. The combination feels like a professional business tool that was built by someone who also cares about the user experience.

### Hierarchy

- **Display** (800 weight, `clamp(1.75rem, 6vw, 2.25rem)`, line-height 1.1, tracking −0.02em): Greeting headline on the Home screen ("Good Morning, Amara"). Used sparingly — one instance per screen.
- **Headline** (900 weight, 1.25rem, line-height 1.2, tracking −0.01em): Section titles within pages ("Recent Documents"), modal titles, template document type headers ("PAYMENT RECEIPT").
- **Title** (700 weight, 1rem, line-height 1.4): Card titles (action card labels), form section headings. Outfit family.
- **Body** (500 weight, 0.875rem, line-height 1.6): All running text, subtext in cards, receipt content rows, UpgradePrompt subtext. Inter family. Maximum line length approximately 55ch in the 480px container.
- **Label** (900 weight, 0.625rem, letter-spacing 0.1em, UPPERCASE): All form field labels, navigation item labels, status badge text, section separator meta. The system's workhorse micro-type — appears everywhere data is categorized.

**The Uppercase Label Rule.** Every field label, nav label, and status indicator is rendered in uppercase with wide letter-spacing (tracking-widest, ≈0.1em). No label uses title-case or sentence-case. The uniformity creates instant scan hierarchy on a mobile screen.

## Layout

Proofa is a single-column, mobile-first application. All content lives in `.app-container` — `max-width: 480px`, `margin: auto`, `padding-inline: 1.25rem (20px)` — centred on larger viewports. There are no breakpoint-driven layout changes; the 480px container is the design surface. Desktop users see the app centred on a `#fafafa` expanse.

The vertical rhythm is driven by `gap` values in flex containers: `gap-1.5 (6px)` within field label+input pairs; `gap-6 (24px)` between form sections; `gap-8 (32px)` between page sections on the home screen.

The header is `h-16 (64px)` sticky, `z-50`. The bottom navigation sits in a `pb-6` floating pill, `z-50`, with `pb-20` on the `<body>` ensuring no content is clipped beneath it. No horizontal scrolling anywhere; the 480px container and `max-w-full` inputs handle all overflow.

Document templates break from the app container: the Minimalist template renders at `w-[480px]` and the Bold template at `w-[560px]` — fixed widths for PNG export consistency, not viewport responsiveness.

## Elevation & Depth

The system is tonal and surface-contrast-driven rather than shadow-heavy. Depth is primarily achieved by stepping background luminance: white cards (`#ffffff`) on the off-white page (`#fafafa`), bordered with `#eeeeee` hairlines. Shadows exist but they are ambient and nearly invisible at rest.

**The Tonal-First Rule.** Surfaces separate by luminance difference and border, not shadow lift. Shadows appear only as a state response (hover, active, floating) or on elements that genuinely float above the page (bottom nav, modals, toast, FAB).

### Shadow Vocabulary
- **Card Rest** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`): Applied via `.shadow-card`. Cards on the home screen and history. At rest — nearly invisible; serves as depth hint not anchor.
- **Card Hover** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)`): Applied via `.shadow-card-hover:hover`. Lifts card slightly on hover/focus to confirm interactivity.
- **FAB Shadow** (`shadow-xl shadow-primary-500/40`): Orange-tinted glow beneath the FAB. The only coloured shadow in the system — ties the float to the brand.
- **Glass Nav** (`backdrop-filter: blur(24px)`, `shadow-2xl shadow-surface-900/5`): Bottom navigation pill and header use glass morphism — white/80 background + blur. The app chrome is deliberately translucent.
- **Modal / Sheet** (`shadow-2xl`): Modals use centered `shadow-2xl`; the UpgradePrompt bottom sheet uses the same shadow on its top edge.

## Shapes

The form language is uniformly rounded — large, friendly, and thumb-appropriate. No sharp corners anywhere in the app chrome.

- **Extra Large Cards and Modals** (`border-radius: 2rem / 2.5rem`, i.e., `rounded-[2rem]` / `rounded-[2.5rem]`): Modal panels, the bottom navigation pill, the UpgradePrompt sheet. The most dramatic radius in the system — these elements read as friendly containers, not hard boxes.
- **Standard Cards and Inputs** (`border-radius: 1rem / 1.5rem`, i.e., `rounded-2xl` / `rounded-3xl`): All form inputs, textareas, action cards, segmented controls, and buttons. The default interactive radius.
- **Pill Shapes** (`border-radius: 9999px`): The "Go Pro" badge in the header, status chips, Pro badge in UpgradePrompt, nav active-dot indicator. Pills are used exclusively for labels and single-line badges.
- **Square-ish Tiles** (`border-radius: 1rem`, `rounded-2xl`): The FAB, icon containers (logo-upload area, Pro icon box). Square with large radius for icons that need a container.
- **FAB Notch**: The FAB sits `-top-6` above the nav rail with a `ring-4 ring-white` that creates a physical cutout effect separating it from the nav surface.

**The No-Sharp-Corners Rule.** No element in the app chrome has `border-radius: 0`. The templates (particularly Bold's dark panel) use hard edges internally, but only within the exported document context — never in the app UI shell.

## Components

### Buttons

**Character:** Tactile and confident. Every button responds visibly to touch with `scale-[0.98]` or `scale-95` on `:active`. Primary buttons carry full burnt-orange fills; secondary buttons are neutral-surface fills. The weight difference between fill and surface communicates action priority without colour-coding multiple actions.

- **Shape:** Generously rounded (24px radius, `rounded-2xl`); full-width on mobile within forms
- **Primary** (`bg-primary-500 text-white font-bold py-4 rounded-2xl`): Full burnt orange fill, white bold text, `padding: 16px 24px`. Full-width in CTAs (pricing, UpgradePrompt). Shadow: `shadow-lg`.
- **Hover:** Darkens to `#d44d0b` (primary-600); no shadow change
- **Active:** `scale-[0.98]` — physical press feedback, always
- **Secondary / Neutral** (`bg-surface-100 text-surface-700`): Off-white fill, dark text, same radius. Used for "cancel" and secondary actions adjacent to the primary.
- **Ghost / Orange** (`bg-primary-50 text-primary-600 rounded-full`): Pill shape, orange-tinted wash background. Used for the "Go Pro" header badge. On hover: `bg-primary-100`.
- **Icon Button** (`w-10 h-10 rounded-full`): Circular, 40px, surface-100 background. Back button, modal close button, action icon buttons.

### Segmented Control

The primary status-selection pattern (Paid / Deposit / Due; Pending / Processing / Delivered). Replaces a dropdown for 2–4 options.

- **Container:** `bg-white border border-surface-200 p-1 rounded-2xl shadow-sm`
- **Active Segment:** `bg-primary-500 text-white shadow-md shadow-primary-500/20 rounded-xl` — orange fill, white text, inner shadow
- **Inactive Segment:** `text-surface-400`, hover: `text-surface-600 bg-surface-50`
- **Label:** `text-xs font-bold uppercase tracking-wider` — all uppercase, bold

### Cards / Containers

- **Action Cards (Home screen):** Three-card row, each full width in the 480px column. Orange (Receipt), Charcoal (Invoice), White-bordered (Order Summary). Corner radius: `rounded-2xl`. Shadow: `.shadow-card`. No border except the white Order card (`border border-surface-200`).
- **Content Cards (History, Pro features):** `bg-white rounded-2xl p-5 shadow-card`. Border: `border border-surface-100` when stacked. Hover: `.shadow-card-hover`.
- **Glass Panel (Nav, Header):** `bg-white/80 backdrop-blur-xl border border-surface-200/50 rounded-[2rem] shadow-2xl shadow-surface-900/5` — the signature glass surface.

### Inputs / Fields

- **Style:** `bg-white border border-surface-200 rounded-2xl py-3.5 px-4` — white fill, hairline border, large radius
- **Focus:** `border-primary-500 ring-4 ring-primary-500/10` — orange border + diffuse orange ring at 10% opacity
- **Active / Press:** `scale-[0.99]` — micro-press feedback even on text inputs
- **Label:** Always uppercase, 10px, 900 weight, tracking-widest, `text-surface-700`
- **Error:** `text-xs text-red-500 font-bold px-1` below the input
- **Icon variant:** Icon pinned `left-4`, input padding shifts to `pl-11`
- **Right-element variant:** For paste button and currency prefix; element pinned `right-3`
- **Textarea:** Same style as input; `min-height: 100px`, `resize: none`, `rounded-2xl p-4`
- **CurrencyInput:** Wraps `Input` with ₦ icon prefix; formats with `Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })`

### Navigation

**Header** (`sticky top-0 z-50 h-16`): Glass effect — `bg-white/80 backdrop-blur-lg border-b border-surface-100`. On home: shows orange Proofa icon + "PROOFA" logotype gradient text. On inner pages: shows back arrow icon button + page title in uppercase Outfit 900. Right side: "Go Pro" pill badge (orange wash) for free users.

**Bottom Navigation** (floating pill, `z-50`): Five items — Home, History, FAB (Create), Upgrade/Dashboard, Profile. Glass pill (`bg-white/80 backdrop-blur-xl border border-surface-200/50 rounded-[2rem]`). Active items use `text-primary-500`, inactive use `text-surface-400`. Active indicator: 4×4px orange dot, spring-animated between items via Framer Motion `layoutId="active-nav"`. FAB juts `-top-6` above rail.

### Upgrade Prompt (Signature Component)

A bottom-sheet overlay (`items-end` on mobile, `items-center` on `sm:`) used for all upgrade gates. Spring-animated entry from bottom (`y: "100%" → 0`). Contains: drag handle pill, Pro badge chip, icon + headline, subtext, social proof row, primary CTA. Background: `bg-white rounded-t-[2.5rem]`. Backdrop: `bg-surface-950/60 backdrop-blur-sm`.

- **Pro badge chip:** `bg-primary-50 text-primary-600 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full`
- **Icon container:** `w-14 h-14 bg-primary-50 rounded-2xl` — orange wash square tile
- **Social proof row:** `bg-surface-50 rounded-2xl px-4 py-3` — avatar stack + copy
- **CTA:** Full-width primary button, `shadow-lg`

### Toast Notifications

Floating, centred above the bottom nav (`bottom-24`). Framer Motion fade+scale entry. Rounded (`rounded-2xl`). Four semantic variants: success (green-50), error (red-50), warning (yellow-50), info (blue-50) — each with matching border and Lucide icon. Text: `text-sm font-bold text-surface-900 tracking-tight`.

## Do's and Don'ts

### Do:
- **Do** use `active:scale-95` or `active:scale-[0.98]` on every interactive element — buttons, cards, icon buttons, inputs. Physical feedback is a system invariant.
- **Do** render all form field labels in `uppercase tracking-widest text-[10px] font-black text-surface-700`. Never use sentence-case or title-case for labels.
- **Do** use `rounded-2xl` (16px) as the default radius for inputs, buttons, and cards. Step up to `rounded-[2rem]` only for modals, sheets, and the nav pill.
- **Do** limit the orange accent (`#e8590c`) to primary actions, active states, focus rings, and brand identity elements. One accent, one purpose per screen.
- **Do** use spring physics for all overlay transitions: `type: "spring", damping: 25–30, stiffness: 300–320`. Linear or ease-only transitions feel out of place.
- **Do** use Framer Motion `layoutId` for animated state transitions between sibling elements (e.g., the nav active dot).
- **Do** apply `.glass-effect` (`bg-white/80 backdrop-blur-12`) for floating chrome elements that sit above content — header, bottom nav, toasts.
- **Do** follow the `app-container` constraint (`max-width: 480px, padding-inline: 1.25rem`) for all app-shell content. Only document templates break out of it for fixed-width PNG export.

### Don't:
- **Don't** use a second accent colour in the app chrome. Green, blue, purple, and teal belong only in transient semantic contexts (toast backgrounds). Never on cards, buttons, or backgrounds.
- **Don't** use `border-radius: 0` on any app-shell element. Sharp corners are reserved for inside the exported document templates only.
- **Don't** use the Rich Charcoal (`#1a1a1a`) as an app-shell background or surface colour. It is a document-template colour — the Bold template's brand panel. Applying it to the app chrome would break the light, approachable shell.
- **Don't** use title-case or sentence-case for labels, status chips, or nav items. The Uppercase Label Rule applies universally.
- **Don't** use `box-shadow` for surface separation in resting state. Use luminance difference (card `#ffffff` on page `#fafafa`) and hairline borders (`border-surface-200`). Shadows respond to state, they don't define hierarchy.
- **Don't** place primary CTA buttons above fold content — on mobile, the primary action button is always pinned to the bottom of the form/screen, reachable by the right thumb.
- **Don't** use font weights below 500 anywhere in the UI. The system's minimum is 500 (body); 700/900 on all headings, labels, and UI text. Thin type feels out-of-place against Proofa's confident market voice.
