# Narrative Thread Design: Crepuscular's Villa

Date: 2026-06-28

## Overview

Add a unified narrative main thread to Crepuscular's Villa, tying together all existing pages and features through a "Five Words Journey Arc" — **Define · Spark · Breathe · Manifest · Endure** — with three narrative layers.

## Narrative Architecture

### Three-Layer Model

```
Layer 1: Homepage Main Arc (every visitor sees)
         Define → Spark → Breathe → Manifest → Endure

Layer 2: Sub-page Narrative Anchors (deeper browsers)
         Each page tagged with its chapter + narrative quote

Layer 3: Easter Eggs & Diary Fragments (curious explorers)
         Hidden quotes, click interactions, diary entries
```

### Core Vocabulary

Five words already in the homepage typewriter animation serve as chapter titles:

| Word | Theme | Core Idea |
|------|-------|-----------|
| DEFINE | Identity | Who I am, where I come from |
| SPARK | Passion | Moments that lit the fire |
| BREATHE | Exploration | Travel, music, absorbing the world |
| MANIFEST | Creation | Building community, tools, the Villa itself |
| ENDURE | Continuity | Growth, connection, lasting |

## Layer 1: Homepage Narrative Flow

### Current Homepage Section Order

Hero (Typewriter) → Photo Gallery → Infinite Partners → CL16 Cinematic → Visitor Counter → Applications → Social Links → "Explore" button

### Proposed Section Restructuring

Sections are reordered and grouped into five visible chapters, each with a chapter header and a connecting quote. No existing content is removed — only repositioned and annotated.

```
┌── DEFINE ─────────────────────────────────────────────┐
│  Typewriter animation (unchanged)                      │
│  Chapter header: · DEFINE ·                            │
│  Sub-quote: "每个人都有一段故事。这是她的。"             │
│  "Everyone has a story. This is hers."                 │
│  Connected to: /about                                  │
├── SPARK ──────────────────────────────────────────────┤
│  Chapter header: · SPARK ·                             │
│  Sub-quote: "一些事物点燃了火光"                         │
│  "Certain things lit the flame"                        │
│  Photo Gallery (existing, no changes)                  │
│  Connected to: /about (interests section)              │
├── BREATHE ────────────────────────────────────────────┤
│  Chapter header: · BREATHE ·                           │
│  Sub-quote: "在路上，在呼吸中"                           │
│  "On the road, in the breath"                          │
│  Music BGM + Travel context (existing gallery)         │
│  Connected to: about music/travel sections             │
├── MANIFEST ───────────────────────────────────────────┤
│  Chapter header: · MANIFEST ·                          │
│  Sub-quote: "把火花建造成避风港"                         │
│  "Build a sanctuary from the sparks"                   │
│  KEMDR + DPMBG applications (existing)                 │
│  Villa version timeline highlights                     │
│  Connected to: /application/*, /about timeline         │
├── ENDURE ─────────────────────────────────────────────┤
│  Chapter header: · ENDURE ·                            │
│  Sub-quote: "故事还在继续，你也是它的一部分"               │
│  "The story continues. You're part of it."             │
│  Message board preview + visitor counter               │
│  Sponsor/donation section                              │
│  Connected to: /send, /reply, /sponsor                 │
└────────────────────────────────────────────────────────┘
```

### Implementation Details

1. **index.astro**: Wrap existing section content in chapter containers. Add chapter headers (styled as small uppercase text, accent color `#f7c46c`). Add connecting quotes below each header.

2. **GSAP ScrollTrigger**: Use existing GSAP setup to trigger chapter header fade-in/fade-out as user scrolls between chapters. Each chapter header appears on entering its viewport section.

3. **Navigation markers**: Left or right edge of viewport shows a vertical "chapter progress" indicator (five dots, current chapter highlighted), subtle and non-intrusive.

4. **No changes to**: BGM player, photo gallery images, partner scroll, CL16 quotes, visitor counter logic, application forms, social links.

## Layer 2: Sub-page Narrative Anchors

Each sub-page receives a narrative chapter tag + a contextual quote. Implementation via an optional `narrative` prop on Layout.

### Page-to-Chapter Mapping

| Page Route | Chapter | Anchor Text |
|---|---|---|
| `/about/en`, `/about/zh` | DEFINE | Subtitle: "Chapter One: Define · 定义" |
| `/about/en`, `/about/zh` (timeline section) | MANIFEST | Timeline header: "Manifest · 从零建造这座 Villa" |
| `/send` | ENDURE | Form area note: "Endure · 你的故事也是它的一部分" |
| `/reply`, `/reply/private` | ENDURE | Board header: "Endure · 故事在这里交汇" |
| `/application/kemdr` | MANIFEST | Footer: "Manifest · 把热爱变成社群" |
| `/application/dpmbg` | MANIFEST | Footer: "Manifest · 让更多人看见地球科学之美" |
| `/sponsor` | ENDURE | Section intro: "Endure · 让这座 Villa 继续生长" |
| `/privacy/*` | (none) | No narrative tag needed |

### Implementation Details

- Add `narrative` prop to `Layout.astro`: `{ chapter?: 'define' | 'spark' | 'breathe' | 'manifest' | 'endure', quote?: string }`
- When present, render a small chapter indicator in the page header area (below the main title) — accent-colored, subtle, ~14px.
- Update `Header.astro` navigation links: each nav item gets a `data-chapter` attribute. Current page's chapter word has a subtle underline highlight.

### Files to modify
- `src/layouts/Layout.astro`
- `src/components/Header.astro`
- `src/pages/about/en.astro`
- `src/pages/about/zh.astro`
- `src/pages/send.astro`
- `src/pages/reply.astro`
- `src/pages/reply/private.astro`
- `src/pages/application/kemdr.astro`
- `src/pages/application/dpmbg.astro`
- `src/pages/sponsor.astro`

## Layer 3: Easter Eggs & Diary Fragments

### 3.1 Diary Entry Rotator

A small, subtle diary entry display in the homepage footer or CL16 area. Shows a random entry from a static array on each page load.

- Location: Footer area of `index.astro`, before the main footer
- Style: Small italic text, low opacity (0.5), accent color on hover
- Content: ~10-15 short diary entries (20-40 characters each, bilingual or Chinese)
- Implementation: Simple JS array + random selection on load

Sample entries:
- "2026.04.16 今天又大了一岁。Villa 也大了一岁。"
- "2026.03.12 深夜修 bug 修到崩溃，然后发现是少了个分号。"
- "2026.01.01 新的一年，想学更多东西。"
- "2025.12.24 圣诞夜，加了个 BGM 播放器。"
- "2025.08.15 第一次部署到 Cloudflare，紧张到手抖。"

### 3.2 Typewriter Click Easter Eggs

On the homepage hero, clicking the current typewriter word 5 times within 3 seconds triggers a hidden "chapter annotation" popup.

- Detection: Click counter + timer per word
- Content per word:
  - DEFINE: "定义自己是最难的事，也是最值得的事。"
  - SPARK: "火花的起点往往微不足道。"
  - BREATHE: "停下来，看看世界。"
  - MANIFEST: "建造是另一种表达。"
  - ENDURE: "坚持不是一天的事，是每一天的事。"
- Visual: A small floating tooltip/animated text, auto-dismisses after 4 seconds

### 3.3 KEMDR Hidden Quote

On the KEMDR exam page, clicking the logo 7 times triggers a personal reflection unrelated to earthquakes:
- Content: "Crepus 的 uno 哲学：当生活给你一副烂牌，那就用 wild draw four 解决。"
- Implementation: Reuse or extend existing logo click handler (currently has Bing redirect easter egg)

### 3.4 CL16 Cinematic Hidden Entry

Add one extra entry to the CL16 rotating quotes that is a narrative fragment:
- Content: "这座 Villa 不是一天建成的。但每一块砖，都有它的故事。"
- Implementation: Add to the existing `cl16Quotes` array

## Non-goals

- Do NOT change BGM system, BgmController.ts, BgmPanel.astro
- Do NOT change message board submission/reply logic
- Do NOT change KEMDR/DPMBG exam logic or scoring
- Do NOT change admin panel
- Do NOT change database schema or API endpoints
- Do NOT remove any existing homepage content
- Do NOT create new pages
- Do NOT add new dependencies
- Do NOT change site layout or responsive breakpoints
- Do NOT alter photo gallery images or captions

## Files to Modify (Summary)

| File | Change |
|------|--------|
| `src/pages/index.astro` | Restructure sections into 5 chapters, add headers/quotes, diary rotator, click easter egg, CL16 extra entry |
| `src/layouts/Layout.astro` | Add optional `narrative` prop rendering |
| `src/components/Header.astro` | Add chapter-aware nav highlighting |
| `src/pages/about/en.astro` | Add DEFINE chapter marker at top, MANIFEST marker at timeline |
| `src/pages/about/zh.astro` | Same as en.astro |
| `src/pages/send.astro` | Add ENDURE narrative anchor |
| `src/pages/reply.astro` | Add ENDURE narrative anchor |
| `src/pages/reply/private.astro` | Add ENDURE narrative anchor |
| `src/pages/application/kemdr.astro` | Add MANIFEST narrative anchor + hidden click quote |
| `src/pages/application/dpmbg.astro` | Add MANIFEST narrative anchor |
| `src/pages/sponsor.astro` | Add ENDURE narrative anchor |

## Design Principles

- **Minimal visual footprint**: Narrative elements use the existing accent color (`#f7c46c`), small type sizes, and generous whitespace. They annotate rather than dominate.
- **Progressive discovery**: Layer 1 is undeniable, Layer 2 is subtle, Layer 3 is hidden. Different visitors have different experiences.
- **Existing content as canon**: The narrative doesn't invent new facts about Crepus — it reframes what already exists.
- **No user-facing functionality changes**: Every existing button, link, form, and animation works exactly as before.
