---
name: LeadPilot Obsidian Intelligence Design System
colors:
  canvas: '#090D16'
  canvas-subtle: '#0D1322'
  surface: '#111827'
  surface-elevated: '#1E293B'
  surface-glass: 'rgba(17, 24, 39, 0.72)'
  surface-glass-hover: 'rgba(30, 41, 59, 0.85)'
  border-subtle: 'rgba(255, 255, 255, 0.08)'
  border-medium: 'rgba(255, 255, 255, 0.16)'
  border-highlight: 'rgba(129, 140, 248, 0.35)'
  text-primary: '#F8FAFC'
  text-secondary: '#94A3B8'
  text-muted: '#64748B'
  primary: '#6366F1'
  primary-gradient-start: '#6366F1'
  primary-gradient-end: '#8B5CF6'
  accent-cyan: '#06B6D4'
  accent-emerald: '#10B981'
  accent-amber: '#F59E0B'
  accent-rose: '#F43F5E'
typography:
  display-xl:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.03em
  display-lg:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-md:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-xs:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.375rem
  md: 0.5rem
  lg: 0.75rem
  xl: 1rem
  2xl: 1.25rem
  3xl: 1.5rem
  full: 9999px
spacing:
  xs: 0.5rem
  sm: 0.75rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  2xl: 3rem
---

# LeadPilot Obsidian Design System

> **Extracted & Synthesized from**: Insightlancer's Portfolio & Modern SaaS UI/UX Design (Behance / Figma reference `199733791`).
> **Goal**: Transform LeadPilot from a sterile, sparse wireframe into a world-class, executive AI intelligence platform with rich dark-mode glassmorphism, balanced Bento Grid modularity, ergonomic pipeline tracking, and zero button redundancy.

---

## 1. Creative North Star: "The Obsidian Intelligence Grid"

In high-performance B2B sales automation and AI lead discovery, interface quality directly impacts confidence. Flat, washed-out white space with isolated lines makes complex data feel incomplete or broken. 

**"The Obsidian Intelligence Grid"** replaces sterile voids with:
- **Atmospheric Depth**: A dark, tactile canvas (`#090D16`) illuminated by subtle ambient cyan-indigo radial glows (`blur-3xl`).
- **Frosted Glass Cards (Bento System)**: Content is housed in crisp, translucent containers (`backdrop-blur-xl bg-slate-900/60 border border-slate-800/80`) with soft perimeter illumination.
- **Purposeful Visual Hierarchy**: Information flows naturally from the **Company Identity Header** → **Interactive Workflow Pipeline** → **Contextual Action Center** → **Detailed Bento Modules** (AI Dossier, Contact Intel, Outreach Studio, and Meta Rail).
- **Zero Redundancy**: Elimination of duplicated CTAs in favor of a single, highly visible, context-aware command bar.

---

## 2. Color Palette & Lighting Philosophy

The color palette utilizes deep charcoal and midnight tones to eliminate ocular fatigue during long prospecting sessions, complemented by luminous status accents.

### Core Foundation
- **Base Canvas (`#090D16`)**: Deep midnight obsidian base that prevents glare.
- **Card Surface (`#0F172A` / `rgba(15, 23, 42, 0.75)`)**: Translucent frosted glass that reveals underlying ambient gradients.
- **Elevated Hover Surface (`#1E293B` / `rgba(30, 41, 59, 0.85)`)**: Tactile feedback on interactive elements.
- **Subtle Hairline Borders (`rgba(255, 255, 255, 0.08)`)**: Hairline borders defining card bounds without harsh visual separation.
- **Border Highlight (`rgba(99, 102, 241, 0.4)`)**: Electric violet border applied to active or focused cards.

### Semantic & Status Accents
- **Primary / Brand Action (`#6366F1` to `#8B5CF6`)**: Linear gradient from Electric Indigo to Vivid Violet. Conveys intelligence, computational power, and premium precision.
- **Verified / Success (`#10B981`)**: Emerald green with glowing ring for completed stages, verified email addresses, and sent emails.
- **In-Progress / Running (`#06B6D4` / `#38BDF8`)**: Cyan / Sky pulse indicating live background n8n workflow execution.
- **Attention / Rating (`#F59E0B`)**: Radiant Amber for Google star ratings, reviews, and pending manual approvals.
- **Critical / Destructive (`#F43F5E`)**: Coral rose for deletion modals, failed executions, and bounce warnings.

---

## 3. Typography & Micro-Legibility

Typography uses the modern geometric sans-serif stack (`Inter`, `system-ui`, `-apple-system`).

### Typographic Rhythm
1. **Company Title**: `display-lg` (32px / 2rem), `font-bold`, tight tracking (`-0.025em`) in pure white `#F8FAFC`.
2. **Category & Status Eyebrows**: `label-xs` (11px), uppercase, tracked (`tracking-wider` / `+0.08em`), semibold, muted slate `#94A3B8`.
3. **Card Section Titles**: `headline-sm` (18px), `font-semibold`, with integrated icons and status pills.
4. **Body & Intelligence Copy**: `body-md` (14px), generous line-height (`leading-relaxed`), soft off-white `#CBD5E1`.
5. **Code & Email Text**: Monospace-accented subject and copy blocks with distinct dark inset background (`#0B0F17`).

---

## 4. Bento Grid Layout Architecture

The former layout spread isolated text strings across an open white screen. The Bento architecture groups related information into high-density, easily scannable modules:

```
+-----------------------------------------------------------------------------------------+
| [← Back to Leads]           LEAD WORKSPACE DOCK           [Last updated 2m ago] [Share] |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  HERO IDENTITY CARD                                                                     |
|  +--------+  Nephro Care                                       [Quick Actions]          |
|  |   NC   |  Medical Clinic • Kolkata, West Bengal              [🌐 Website]            |
|  | Avatar |  ★ 4.8 (1,377 reviews on Google)                    [📍 Google Maps]        |
|  +--------+                                                                             |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  5-STAGE INTERACTIVE WORKFLOW PIPELINE                                                  |
|  [✓ 1. Discovered]  ──>  [○ 2. AI Research]  ──>  [○ 3. Contact]  ──>  [○ 4. Outreach]  |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  CONTEXT-AWARE ACTION CONSOLE                                                           |
|  "Ready to gather deep business intelligence for Nephro Care."                          |
|  [ ⚡ Start AI Research (n8n) → ]                                                      |
|                                                                                         |
+-----------------------------------------------------------------+-----------------------+
|  MAIN INTELLIGENCE CANVAS (70%)                                 |  SIDEBAR RAIL (30%)   |
|                                                                 |                       |
|  +-----------------------------------------------------------+  |  +-----------------+  |
|  | 🧠 AI Company Intelligence Dossier                         |  |  | 📊 Lead Status  |  |
|  | - Summary, Core Offerings, Market Angles                  |  |  | - Current Stage |  |
|  | - Pain Points & Custom Outreach Triggers                  |  |  | - Pipeline Time |  |
|  +-----------------------------------------------------------+  |  +-----------------+  |
|                                                                 |                       |
|  +-----------------------------------------------------------+  |  +-----------------+  |
|  | ✉️ Contact Discovery & Verified Intel                     |  |  | 🏢 Place Details|  |
|  | - Decision Maker Name & Verified Email Address            |  |  | - Phone Number  |  |
|  | - One-Click Copy & Deliverability Badge                   |  |  | - Place ID      |  |
|  +-----------------------------------------------------------+  |  +-----------------+  |
|                                                                 |                       |
|  +-----------------------------------------------------------+  |  +-----------------+  |
|  | ✍️ Cold Outreach & AI Email Studio                         |  |  | ⚠️ Danger Zone  |  |
|  | - Subject Line & Interactive Draft Editor                 |  |  | - Delete Lead   |  |
|  | - [Regenerate AI Draft] [Approve] [Send via n8n]          |  |  |                 |  |
|  +-----------------------------------------------------------+  |  +-----------------+  |
+-----------------------------------------------------------------+-----------------------+
```

---

## 5. Component Specifications

### 5.1 Company Identity Hero
- **Avatar Badge**: 64x64px rounded-2xl square with dynamic two-letter monogram on a radiant indigo-to-purple gradient.
- **Rating Chip**: Soft amber badge with a glowing golden star `★ 4.8` and review count pill `(1,377 Google Reviews)`.
- **Location & Category**: Modern icon-prefixed pill tags with subtle background tint.
- **External Links**: Pill buttons with subtle border (`border-white/10`) and hover illumination for Website and Google Maps.

### 5.2 5-Stage Interactive Pipeline
- **Continuous Timeline**: Connected bar indicating pipeline percentage (20%, 40%, 60%, 80%, 100%).
- **Stage Pills**:
  1. **Discovered**: Green checkmark badge (`✓ Completed`).
  2. **AI Research**: Status badge (`○ Pending` / `◌ In Progress` / `✓ Completed`).
  3. **Contact Intel**: Status badge (`○ Pending` / `✓ Found` / `! Not Found`).
  4. **Outreach Draft**: Status badge (`○ Not Ready` / `● Drafted` / `✓ Approved`).
  5. **Dispatched**: Status badge (`○ Not Sent` / `✓ Dispatched`).

### 5.3 Single Context-Aware Action Bar
- Replaces duplicate buttons.
- Dynamically computes the **Next Recommended Action**:
  - If research is unstarted → *"Start AI Research"*
  - If research is completed & contact is missing → *"Find Contact Email"*
  - If contact is found & email not drafted → *"Generate Outreach Draft"*
  - If email is drafted → *"Review & Approve Draft"*
  - If approved → *"Send Approved Email"*
- Highlights button with vibrant gradient and pulsing focus ring.

### 5.4 AI Intelligence Dossier Card
- Displays structured data received from n8n:
  - Executive Summary
  - Strengths & Key Offerings
  - Target Audience & Market Signals
  - Recommended Pitch Angle
- If research is running: Sleek animated pulse skeleton simulating real-time AI scanning.
- If unstarted: Inspiring empty state explaining what insights will be unlocked.

### 5.5 Contact Intelligence Card
- Displays contact name, verified business email, and discovery source.
- Includes a **Copy to Clipboard** button with instantaneous checkmark feedback.
- If email is not found: Clear diagnostic state with option to retry or enter email manually.

### 5.6 Cold Outreach & Email Studio
- **Draft Header**: Subject line with quick-edit trigger.
- **Email Body Editor**: Syntax-highlighted text block with clean line spacing and editable textarea mode.
- **Action Trays**:
  - `Update Draft`
  - `Regenerate with New Tone`
  - `Approve Draft`
  - `Send via n8n Webhook` (with confirmation modal)

### 5.7 Sidebar Meta & Utility
- **Lead Metrics**: Discovered date, Place ID, Direct phone link with click-to-call, Category slug.
- **Workflow Health**: n8n connection indicator with green ping animation.
- **Danger Zone**: Quiet, low-contrast "Delete Lead" button that expands a safety confirmation dialog.

---

## 6. Global Application Upgrades

### Home Page (`/`)
- Hero section redesigned with dark glass console, animated feature chips ("Google Places Discovery", "n8n Webhook Automation", "Neon Database Persistence").
- Search form with dark inputs, glowing focus rings, country selector with flag badges, and live limit slider.

### Leads Dashboard (`/leads`)
- **Metric Bento Cards**: Total Leads Discovered, Researched Count, Verified Contacts, Ready for Outreach.
- **Filter Dock**: Multi-attribute filter pills (All, Researched, Unresearched, Has Email, Approved).
- **Batch Actions**: Floating glass action bar when leads are selected ("Research Selected", "Delete Selected").
- **Lead Cards**: High-contrast cards with rating badges, stage pills, and direct "Open Workspace →" actions.

---

## 7. Do's and Don'ts

| Do | Don't |
|---|---|
| Use translucent frosted glass cards with hairline borders (`border-white/10`). | Don't use stark, flat, borderless white sheets with empty voids. |
| Provide one clear, context-aware primary CTA for the current step. | Don't duplicate the same button across multiple sections on one screen. |
| Use rich status colors with subtle ambient glows (emerald for ok, cyan for running, amber for rating). | Don't use monochrome or ambiguous gray indicators. |
| Keep micro-interactions snappy (150ms-200ms ease-out transitions). | Don't use sluggish or jarring layout shifts. |
| Group related intelligence in modular cards with icons and tags. | Don't display raw unstructured text without visual hierarchy. |
