---
name: Greenlight
description: Live, voice-driven mock PM interview room — clean, calm, coaching.
colors:
  greenlight-green: "#0E6E66"
  ink: "#171B26"
  soft-ink: "#5D6470"
  faint-ink: "#A5AAA3"
  room-white: "#F6F7F4"
  panel-white: "#FFFFFF"
  hairline: "#E4E6E1"
  selected-tint: "#E7F0EE"
  hover-tint: "#EEF0EC"
  lamp-green: "#7CE0A3"
  score-good: "#2FA65A"
  score-mid: "#E0A93C"
  score-low: "#D9534F"
typography:
  display:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3.6vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.08em"
  clock:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    fontFeature: "tnum"
rounded:
  md: "8px"
  lg: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.greenlight-green}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "14px 28px 14px 20px"
  button-secondary:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "8px 20px"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "8px 20px"
  input-inline:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.selected-tint}"
    textColor: "{colors.greenlight-green}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  timer-pill:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.greenlight-green}"
    rounded: "{rounded.full}"
    padding: "8px 16px 8px 12px"
  report-card:
    backgroundColor: "{colors.panel-white}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Greenlight

## 1. Overview

**Creative North Star: "The Green Room"**

Greenlight is the calm room where performers wait before going on stage. Every
surface answers to that metaphor: the interview question sits alone at center
stage, an on-air lamp pulses quietly when the session is live, a waveform
breathes with the candidate's voice, and the clock is a stagehand — present,
never the star. The user arrives anxious; the room's job is to lower their
heart rate. Light, near-white surfaces, one deep green voice, one typeface,
hairline structure, and generous still space do that work.

The system explicitly rejects the editorial/magazine register (serif display
type, literary flourish — the direction this product deliberately retired), the
generic SaaS dashboard (purple gradients, Inter-everywhere, hero-metric cards),
and exam-simulator pressure (giant countdowns, warnings, proctored-test
energy). Pressure is the interview's job; the UI absorbs it.

**Key Characteristics:**
- One typeface (Hanken Grotesk) carries every role — hierarchy by weight, size, color, and space
- The question is always the center of gravity; everything else orbits it
- Flat, border-first surfaces: depth is drawn with hairlines and tonal tints, not shadows
- One green voice (#0E6E66) used sparingly, for what is live, chosen, or go
- Quiet precision: tabular numerals, hairline rules, disciplined 12/32px orbit rhythm

## 2. Colors

A near-white room with green-tinted neutrals, one deep green voice, and a
traffic-light triad reserved strictly for scores and urgency.

### Primary
- **Greenlight Green** (#0E6E66): the product's single voice. Primary buttons,
  the active question in the sidebar, live-state labels, the progress hairline,
  the satellite category line. It marks what is live, selected, or go — never
  decoration.
- **Lamp Green** (#7CE0A3): the pulsing on-air dot inside the primary button.
  Only ever a small glowing point, never a fill.

### Secondary
The scoring triad. These exist for feedback and urgency only:
- **Score Good** (#2FA65A): scores ≥4, the live on-air lamp.
- **Score Mid** (#E0A93C): score of 3.
- **Score Low** (#D9534F): scores ≤2, the final-minute urgent state (timer,
  lamp, and hairline all shift to it together).

### Neutral
- **Ink** (#171B26): primary text, the dark button, transcript speaker labels.
- **Soft Ink** (#5D6470): secondary text — hints, comments, compact clocks.
- **Faint Ink** (#A5AAA3): tertiary — counts, timestamps, caption lines. Never
  body copy.
- **Room White** (#F6F7F4): the body background, with a faint green radial
  wash (#E9F0E8) breathing in from the top corner.
- **Panel White** (#FFFFFF): sidebar, cards, pills — one quiet step above the
  room.
- **Hairline** (#E4E6E1): every border, divider, and rule. 1px, always.
- **Selected Tint** (#E7F0EE) / **Hover Tint** (#EEF0EC): green-tinted washes
  for the active nav item and hover states. Tint, never border, marks selection.

### Named Rules
**The One Voice Rule.** Greenlight Green appears on well under 10% of any
screen. If two unrelated elements are green at once, one of them is wrong.

**The Traffic-Light Rule.** The good/mid/low triad appears only on scores and
the urgent-time state. It is a message, not a palette — never use it to
decorate.

## 3. Typography

**Single Family:** Hanken Grotesk (variable, self-hosted via next/font; falls
back to ui-sans-serif / system-ui)

**Character:** A warm humanist grotesque — approachable enough to read as a
coach, plain enough to disappear into the task. There is no display serif and
no mono; those belonged to the retired editorial direction.

### Hierarchy
- **Display** (600, clamp(1.875rem, 3.6vw, 2.75rem), 1.15, -0.015em): the
  interview question only. It is the largest thing in the room, centered, with
  `text-wrap: balance`.
- **Headline** (600, 1.375–1.625rem, 1.3): report section titles, the grading
  interstitial.
- **Title** (600, 0.875–1.0625rem): buttons, dimension names, speaker labels.
- **Body** (400, 0.875rem, 1.625): transcript text, feedback comments, hints.
  Cap prose at 65–75ch.
- **Label** (500, 0.625–0.6875rem, +0.08em, UPPERCASE): satellite lines —
  category, "On air", session captions. 0.1em tracking for the on-air label.
- **Clock** (500, 1rem, tabular-nums): compact elapsed/remaining readouts.

### Named Rules
**The One Voice (Type) Rule.** One family, every role. Hierarchy comes from
weight, size, color, and space — never from switching typefaces.

**The Tabular Clock Rule.** Any number that counts — timers, turn counts,
question indices — sets `font-variant-numeric: tabular-nums` so nothing
jitters while it ticks.

## 4. Elevation

Flat by default, drawn rather than lifted. Depth is conveyed by hairline
borders (#E4E6E1), the one-step tonal ladder (Room White → Panel White →
Selected/Hover Tints), and the faint radial wash on the body. Resting surfaces
never carry shadows.

### Shadow Vocabulary
- **Drawer** (`box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)` — Tailwind
  `shadow-2xl`): the transcript overlay only, paired with a
  rgba(23,27,38,0.28) backdrop. It is the single element that floats above the
  room, and the only shadow in the system.

### Named Rules
**The Hairline Rule.** Structure is drawn with 1px lines and tonal tints. If a
resting card needs a shadow to be visible, the layering is wrong — fix the
tint, not the shadow.

## 5. Components

Component character: **quiet precision** — soft pills, hairline borders, flat
surfaces, tabular numerals. Controls should feel like a calm voice.

### Buttons
- **Shape:** full pill (9999px radius), always.
- **Primary:** Greenlight Green fill, white text, 600 weight
  (14px 28px 14px 20px padding); the Begin button carries the pulsing Lamp
  Green dot. Hover scales to 1.03, active to 0.98 — transform only, no color
  shift.
- **Secondary:** Panel White fill, 1px Hairline border, Ink text (8px 20px).
- **Dark:** Ink fill, white text — the "end early" action; decisive, not
  alarming (never red).
- **Focus:** visible focus ring in Greenlight Green; never remove outlines.

### Cards / Containers
- **Corner Style:** 16px radius (report card); 8px for small interactive
  tiles (nav items, icon buttons).
- **Background:** Panel White on Room White, sectioned internally by 1px
  Hairline dividers — never nested cards.
- **Shadow Strategy:** none at rest (see Elevation).
- **Internal Padding:** 24px sections.

### Inputs / Fields
- **Style:** full pill, Panel White fill, 1px Hairline border (8px 16px).
- **Placeholder:** must hold ≥4.5:1 contrast — use Soft Ink, not Faint Ink.
- **The typed-answer input is load-bearing:** it is the non-Chrome and
  mic-blocked fallback and must always be visible during a live session.

### Navigation (question bank sidebar)
- **Style:** Panel White rail, collapsible to a 3.5rem strip; categories as
  uppercase Label rows with count + chevron; questions as 8px-radius rows.
- **States:** hover = Hover Tint wash; active = Selected Tint wash +
  Greenlight Green text at 600; locked (mid-session) = 45% opacity,
  not-allowed cursor.

### The Orbit (signature composition)
Every phase of the room uses the same skeleton, centered vertically:
a Label satellite line on top (category or "● On air"), a compact Clock line,
**the question in Display type at dead center**, a 280px progress hairline,
then the action zone (Begin button, or waveform + status + controls). Phase
changes swap satellites; the question never moves.

### The Waveform (signature component)
Seven 6px pill bars. Live mic input drives real bar heights via the analyser;
the interviewer's turns use the synthetic `gl-wave` CSS animation in Ink;
idle bars rest flat in gray (#C9CDC7). It is the room's heartbeat and the
primary "the system hears you" signal.

### Score Bars (report)
Five equal pill segments (8px tall), filled to the score in the appropriate
traffic-light color, empty segments in #E8EAE6. Dimension name left, "n/5"
right in the same score color.

## 6. Do's and Don'ts

### Do:
- **Do** keep the question the largest element in the room, centered, in
  Display type with `text-wrap: balance`. Everything else orbits it.
- **Do** hold Greenlight Green to well under 10% of any screen (the One Voice
  Rule) — it marks live, selected, and go.
- **Do** set `tabular-nums` on every counting number (the Tabular Clock Rule).
- **Do** draw structure with 1px Hairline borders and tonal tints; keep
  resting surfaces flat.
- **Do** use full-pill shape for every button and inline input — one
  affordance vocabulary everywhere.
- **Do** keep the typed-answer fallback visible and usable in every live
  session; voice is Chrome-only.
- **Do** honor `prefers-reduced-motion` for every animation, including the
  lamp pulse and waveform.

### Don't:
- **Don't** reintroduce serif display type, a mono accent face, or any second
  family — the editorial/magazine register is retired by name in PRODUCT.md.
- **Don't** reach for the generic SaaS dashboard kit PRODUCT.md bans:
  purple-gradient-on-white, Inter-everywhere, hero-metric cards, identical
  feature-tile grids.
- **Don't** let the clock outrank the question. Giant countdown numerals,
  alarm colors before the final minute, or any proctored-exam pressure device
  is prohibited — "cold enterprise / exam-simulator energy" is a named
  anti-reference.
- **Don't** use the traffic-light triad decoratively; it speaks only for
  scores and the final-minute state.
- **Don't** add shadows to resting surfaces, side-stripe borders
  (`border-left` > 1px as accent), or gradient text — ever.
- **Don't** set body copy in Faint Ink (#A5AAA3); it fails contrast. Soft Ink
  (#5D6470) is the floor for readable text on Room White.
