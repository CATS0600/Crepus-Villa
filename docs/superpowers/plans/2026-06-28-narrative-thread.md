# Narrative Thread Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a five-chapter narrative thread (Define · Spark · Breathe · Manifest · Endure) to Crepuscular's Villa across three layers: homepage restructure, sub-page anchors, and easter eggs.

**Architecture:** Three-layer narrative injected into existing Astro pages with minimal footprint — Layer 1 restructures homepage sections into 5 themed chapters; Layer 2 adds chapter markers to sub-pages via Layout prop; Layer 3 adds hidden diary entries, click easter eggs, and quote fragments.

**Tech Stack:** Astro 5, GSAP (ScrollTrigger), Tailwind CSS, TypeScript

---

### Task 1: Layout + Header — Narrative infrastructure

**Files:**
- Modify: `src/layouts/Layout.astro:11-17`
- Modify: `src/components/Header.astro:6-14`, `src/components/Header.astro:66-73`

- [ ] **Step 1: Add narrative prop to Layout.astro**

In the frontmatter section (lines 11-17), add `narrative` to the Props interface and render it below the `<slot />`:

Edit `src/layouts/Layout.astro`:

Old (lines 11-17):
```
interface Props {
    title: string;
    seo?: SEO;
}

const { title, seo } = Astro.props;
```

New:
```
interface Props {
    title: string;
    seo?: SEO;
    narrative?: { chapter: string; quote: string };
}

const { title, seo, narrative } = Astro.props;
```

Then add the narrative marker rendering right after `<slot />` (line 46), before `<BgmPanel>`:

Old:
```
        <slot />
        <BgmPanel client:load />
```

New:
```
        <slot />
        {
            narrative && (
                <div class="narrative-marker">
                    <span class="narrative-chapter">· {narrative.chapter} ·</span>
                    <span class="narrative-quote">{narrative.quote}</span>
                </div>
            )
        }
        <BgmPanel client:load />
```

Add styles inside the `<style is:global>` block at the end (before closing `</style>`):

```
    .narrative-marker {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999;
        text-align: right;
        pointer-events: none;
        opacity: 0.6;
        transition: opacity 0.3s ease;
    }
    .narrative-marker:hover {
        opacity: 1;
    }
    .narrative-chapter {
        display: block;
        font-size: 11px;
        letter-spacing: 0.15em;
        color: var(--accent-color, #f7c46c);
        font-weight: 700;
        text-transform: uppercase;
    }
    .narrative-quote {
        display: block;
        font-size: 10px;
        color: var(--text-muted, #86868b);
        font-style: italic;
        margin-top: 2px;
    }
```

- [ ] **Step 2: Add chapter-aware highlighting to Header.astro**

Edit `src/components/Header.astro` frontmatter to pass current path info:

Add after the existing frontmatter (line 3):
```
const currentPath = Astro.url.pathname;
const chapterMap: Record<string, string> = {
    '/about': 'define',
    '/about/en': 'define',
    '/about/zh': 'define',
    '/send': 'endure',
    '/reply': 'endure',
    '/reply/private': 'endure',
    '/sponsor': 'endure',
    '/application/kemdr': 'manifest',
    '/application/dpmbg': 'manifest',
};
const currentChapter = chapterMap[currentPath] || '';
```

Update the nav links in the template (lines 9-12) to add a chapter class:

Old:
```
            <a href="/about" class="nav-about" data-full="About" data-short="Ab.">About</a>
            <a href="/sponsor" class="nav-sponsor" data-full="Sponsor" data-short="Sp.">Sponsor</a>
            <a href="/application/kemdr" class="nav-application" data-full="KVIV" data-short="KV.">KVIV</a>
```

New:
```
            <a href="/about" class="nav-about" data-full="About" data-short="Ab." data-chapter="define">About</a>
            <a href="/sponsor" class="nav-sponsor" data-full="Sponsor" data-short="Sp." data-chapter="endure">Sponsor</a>
            <a href="/application/kemdr" class="nav-application" data-full="KVIV" data-short="KV." data-chapter="manifest">KVIV</a>
```

Add style for the active chapter indicator inside the existing `<style>` (before the closing `</style>`):

```
    .links a.active-chapter {
        color: var(--accent-color, #f7c46c);
        position: relative;
    }
    .links a.active-chapter::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--accent-color, #f7c46c);
        border-radius: 1px;
    }
```

Add JS inside the existing `<script is:inline>` (before the closing `</script>`) to apply the active class:

```
    // Narrative chapter highlight
    const navLinks = document.querySelectorAll('.links a');
    navLinks.forEach(link => {
        const chapter = link.getAttribute('data-chapter');
        const path = window.location.pathname;
        if (chapter === 'define' && (path === '/about' || path.startsWith('/about/'))) {
            link.classList.add('active-chapter');
        } else if (chapter === 'endure' && (path === '/sponsor' || path === '/send' || path === '/reply')) {
            link.classList.add('active-chapter');
        } else if (chapter === 'manifest' && path.startsWith('/application/')) {
            link.classList.add('active-chapter');
        }
    });
```

---

### Task 2: About pages — DEFINE + MANIFEST chapter markers

**Files:**
- Modify: `src/pages/about/en.astro:6`
- Modify: `src/pages/about/zh.astro:6`
- Modify: `src/pages/about/en.astro:236`
- Modify: `src/pages/about/zh.astro:236` (approximate)

- [ ] **Step 1: Add DEFINE narrative prop to en.astro**

Edit `src/pages/about/en.astro` line 6:
```
<Layout title="About - Crepuscular's Villa">
```
to:
```
<Layout title="About - Crepuscular's Villa" narrative={{ chapter: "DEFINE", quote: "每个人都有一段故事。这是她的。 / Everyone has a story. This is hers." }}>
```

- [ ] **Step 2: Add MANIFEST narrative marker above timeline**

Edit `src/pages/about/en.astro` lines 241-243. Find:
```
                    <p class="section-text">
                        A brief timeline of Crepuscular's Villa:
                    </p>
```
Change to:
```
                    <p class="section-text" style="margin-top: 2rem;">
                        <span style="font-size: 11px; letter-spacing: 0.15em; color: var(--accent-color, #f7c46c); font-weight: 700; text-transform: uppercase;">· MANIFEST ·</span>
                    </p>
                    <p class="section-text">
                        A brief timeline of Crepuscular's Villa — <span style="font-style: italic;">从零建造这座 Villa</span>:
                    </p>
```

- [ ] **Step 3: Same changes for zh.astro**

Edit `src/pages/about/zh.astro` line 6:
```
<Layout title="关于 - Crepuscular's Villa">
```
to:
```
<Layout title="关于 - Crepuscular's Villa" narrative={{ chapter: "DEFINE", quote: "每个人都有一段故事。这是她的。/ Everyone has a story. This is hers." }}>
```

Find the Chinese timeline intro text (similar to en.astro around line 241). It should say something like "Crepuscular's Villa 的简要时间线" or similar. Change:

Old:
```
                    <p class="section-text">
                        Crepuscular's Villa 的简要时间线:
                    </p>
```
New:
```
                    <p class="section-text" style="margin-top: 2rem;">
                        <span style="font-size: 11px; letter-spacing: 0.15em; color: var(--accent-color, #f7c46c); font-weight: 700; text-transform: uppercase;">· MANIFEST ·</span>
                    </p>
                    <p class="section-text">
                        Crepuscular's Villa 的简要时间线 — <span style="font-style: italic;">从零建造这座 Villa</span>:
                    </p>
```

---

### Task 3: Send + Reply pages — ENDURE chapter markers

**Files:**
- Modify: `src/pages/send.astro:5`
- Modify: `src/pages/reply.astro:6`
- Modify: `src/pages/reply/private.astro:6`

- [ ] **Step 1: Send page**

Edit `src/pages/send.astro` line 5:
```
<Layout title="发送消息 - Crepuscular's Villa">
```
to:
```
<Layout title="发送消息 - Crepuscular's Villa" narrative={{ chapter: "ENDURE", quote: "你的故事也是它的一部分 / Your story is part of it." }}>
```

- [ ] **Step 2: Reply page**

Edit `src/pages/reply.astro` line 6:
```
<Layout title="公开留言 - Crepuscular's Villa">
```
to:
```
<Layout title="公开留言 - Crepuscular's Villa" narrative={{ chapter: "ENDURE", quote: "故事在这里交汇 / Stories converge here." }}>
```

- [ ] **Step 3: Reply/Private page**

Edit `src/pages/reply/private.astro` line 6:
```
<Layout title="查看私密留言 - Crepuscular's Villa">
```
to:
```
<Layout title="查看私密留言 - Crepuscular's Villa" narrative={{ chapter: "ENDURE", quote: "故事在这里交汇 / Stories converge here." }}>
```

---

### Task 4: KEMDR + DPMBG + Sponsor — MANIFEST/ENDURE markers + KEMDR easter egg

**Files:**
- Modify: `src/pages/application/kemdr.astro:6`
- Modify: `src/pages/application/dpmbg.astro:6`
- Modify: `src/pages/sponsor.astro:7`
- Modify: `src/pages/application/kemdr.astro:404-406` (easter egg)

- [ ] **Step 1: KEMDR page narrative prop**

Edit `src/pages/application/kemdr.astro` line 6:
```
<Layout title="Exam - Crepuscular's Villa">
```
to:
```
<Layout title="Exam - Crepuscular's Villa" narrative={{ chapter: "MANIFEST", quote: "把热爱变成社群 / Turning passion into community." }}>
```

- [ ] **Step 2: DPMBG page narrative prop**

Edit `src/pages/application/dpmbg.astro` line 6:
```
<Layout title="DPMBG Application - Crepus Villa">
```
to:
```
<Layout title="DPMBG Application - Crepus Villa" narrative={{ chapter: "MANIFEST", quote: "让更多人看见地球科学之美 / Sharing the beauty of Earth science." }}>
```

- [ ] **Step 3: Sponsor page narrative prop**

Edit `src/pages/sponsor.astro` line 7:
```
<Layout title="Sponsor - Crepuscular's Villa">
```
to:
```
<Layout title="Sponsor - Crepuscular's Villa" narrative={{ chapter: "ENDURE", quote: "让这座 Villa 继续生长 / Help this Villa keep growing." }}>
```

- [ ] **Step 4: KEMDR hidden quote easter egg**

Add a click handler on the version text at the bottom of the KEMDR page. Find the version div (line 404-406):
```
                <div style="text-align: center; margin-top: 2rem; font-size: 0.8rem; color: var(--text-muted); opacity: 0.7;">
                    Version 4.0.0 “NZXT”，作者：Crepuscular 编辑：小张张, Crepuscular
                </div>
```

Change to:
```
                <div id="kemdrVersion" style="text-align: center; margin-top: 2rem; font-size: 0.8rem; color: var(--text-muted); opacity: 0.7; cursor: pointer;">
                    Version 4.0.0 “NZXT”，作者：Crepuscular 编辑：小张张, Crepuscular
                </div>
```

Add the easter egg JS inside the existing `<script is:inline>` (find the end of the script block, before `</script>`):

```
    // KEMDR version click easter egg
    const versionEl = document.getElementById('kemdrVersion');
    if (versionEl) {
        let versionClickCount = 0;
        let versionTimer: ReturnType<typeof setTimeout> | null = null;
        versionEl.addEventListener('click', () => {
            versionClickCount++;
            if (versionTimer) clearTimeout(versionTimer);
            versionTimer = setTimeout(() => { versionClickCount = 0; }, 3000);
            if (versionClickCount >= 7) {
                versionClickCount = 0;
                const quote = document.createElement('div');
                quote.style.cssText = 'position: fixed; bottom: 80px; right: 24px; background: var(--card-bg, #fff); border: 1px solid var(--accent-color, #f7c46c); border-radius: 12px; padding: 16px 20px; max-width: 280px; font-size: 13px; color: var(--text-main, #1d1d1f); z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,0.12); animation: fadeInUp 0.3s ease;';
                quote.textContent = 'Crepus 的 uno 哲学：当生活给你一副烂牌，那就用 wild draw four 解决。';
                document.body.appendChild(quote);
                setTimeout(() => {
                    quote.style.transition = 'opacity 0.3s ease';
                    quote.style.opacity = '0';
                    setTimeout(() => quote.remove(), 300);
                }, 4000);
            }
        });
    }
```

---

### Task 5: Homepage — Chapter restructure with headers and quotes

**Files:**
- Modify: `src/pages/index.astro`

This is the largest task. The homepage needs to be restructured so that existing sections are grouped under 5 narrative chapters, each with a chapter header bar and transitioning quote.

- [ ] **Step 1: Add chapter data to the frontmatter**

In `src/pages/index.astro`, after the existing frontmatter variables (around line 48), add:

```
const chapters = [
    { id: 'define', title: 'DEFINE', subtitle: '每个人都有一段故事。这是她的。', subtitleEn: 'Everyone has a story. This is hers.' },
    { id: 'spark', title: 'SPARK', subtitle: '一些事物点燃了火光', subtitleEn: 'Certain things lit the flame' },
    { id: 'breathe', title: 'BREATHE', subtitle: '在路上，在呼吸中', subtitleEn: 'On the road, in the breath' },
    { id: 'manifest', title: 'MANIFEST', subtitle: '把火花建造成避风港', subtitleEn: 'Build a sanctuary from the sparks' },
    { id: 'endure', title: 'ENDURE', subtitle: '故事还在继续，你也是它的一部分', subtitleEn: 'The story continues. You\'re part of it.' },
];
```

- [ ] **Step 2: Wrap hero in DEFINE chapter**

Find the hero section (lines 55-61):
```
        <section class="content-section reveal">
            <div class="container safe-zone">
                <h1 class="hero-title">
                    Where Ideas <br/><span id="lineBreak"></span><span id="typewriter" class="accent-text"></span><span class="cursor"></span>
                </h1>
            </div>
        </section>
```

Replace with:
```
        <!-- ═══ DEFINE ═══ -->
        <section class="chapter-section" data-chapter="define">
            <div class="chapter-header">
                <span class="chapter-label">· DEFINE ·</span>
                <span class="chapter-quote">每个人都有一段故事。这是她的。</span>
                <span class="chapter-quote-en">Everyone has a story. This is hers.</span>
            </div>
            <section class="content-section reveal">
                <div class="container safe-zone">
                    <h1 class="hero-title">
                        Where Ideas <br/><span id="lineBreak"></span><span id="typewriter" class="accent-text"></span><span class="cursor"></span>
                    </h1>
                </div>
            </section>
        </section>
```

- [ ] **Step 3: Wrap photo gallery in SPARK chapter**

Find the gallery section (lines 63-134):
```
        <section class="photo-gallery-section safe-zone">
            ...
        </section>
```

Replace with:
```
        <!-- ═══ SPARK ═══ -->
        <section class="chapter-section" data-chapter="spark">
            <div class="chapter-header">
                <span class="chapter-label">· SPARK ·</span>
                <span class="chapter-quote">一些事物点燃了火光</span>
                <span class="chapter-quote-en">Certain things lit the flame</span>
            </div>
            <section class="photo-gallery-section safe-zone">
                ... (keep all existing content exactly as is)
            </section>
        </section>
```

- [ ] **Step 4: Wrap partners + CL16 + music in BREATHE chapter**

Find the partner scroll section (starts at line 136 `section class="auto-scroll-section"`) through the CL16 section (ends around line 170).

Wrap both sections in a BREATHE chapter container:
```
        <!-- ═══ BREATHE ═══ -->
        <section class="chapter-section" data-chapter="breathe">
            <div class="chapter-header">
                <span class="chapter-label">· BREATHE ·</span>
                <span class="chapter-quote">在路上，在呼吸中</span>
                <span class="chapter-quote-en">On the road, in the breath</span>
            </div>
            <section class="auto-scroll-section">
                ... (existing partner scroll content)
            </section>
            <section class="cl16-switch-section">
                ... (existing CL16 content)
            </section>
        </section>
```

- [ ] **Step 5: Wrap counter + applications in MANIFEST chapter**

Find the visitor counter section (line 173) through the applications section (line 215):
```
        <section class="villa-member-counter-section section-gap">
            ...
        </section>
        <section class="applications-section section-gap">
            ...
        </section>
```

Wrap in MANIFEST:
```
        <!-- ═══ MANIFEST ═══ -->
        <section class="chapter-section" data-chapter="manifest">
            <div class="chapter-header">
                <span class="chapter-label">· MANIFEST ·</span>
                <span class="chapter-quote">把火花建造成避风港</span>
                <span class="chapter-quote-en">Build a sanctuary from the sparks</span>
            </div>
            <section class="villa-member-counter-section section-gap">
                ... (existing counter content)
            </section>
            <section class="applications-section section-gap">
                ... (existing apps content)
            </section>
        </section>
```

- [ ] **Step 6: Wrap social + contact in ENDURE chapter**

Find the contact/social section (line 217) through the end of the main content (line 280):

Wrap in ENDURE:
```
        <!-- ═══ ENDURE ═══ -->
        <section class="chapter-section" data-chapter="endure">
            <div class="chapter-header">
                <span class="chapter-label">· ENDURE ·</span>
                <span class="chapter-quote">故事还在继续，你也是它的一部分</span>
                <span class="chapter-quote-en">The story continues. You're part of it.</span>
            </div>
            <div class="contact-container safe-zone section-gap" style="padding-bottom: 100px;">
                ... (existing social/contact content)
            </div>
        </section>
```

- [ ] **Step 7: Add chapter header styling + progress dots in CSS**

Add these styles inside the existing `<style>` block in index.astro (before the closing `</style>`):

```
    /* Narrative chapter styling */
    .chapter-section {
        position: relative;
    }
    .chapter-header {
        text-align: center;
        padding: 60px 20px 20px;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.8s ease-out;
    }
    .chapter-header.visible {
        opacity: 1;
        transform: translateY(0);
    }
    .chapter-label {
        display: block;
        font-size: 14px;
        letter-spacing: 0.3em;
        color: var(--accent-color, #f7c46c);
        font-weight: 700;
        margin-bottom: 8px;
    }
    .chapter-quote {
        display: block;
        font-size: 20px;
        font-weight: 500;
        color: var(--text-main, #1d1d1f);
        margin-bottom: 4px;
    }
    .chapter-quote-en {
        display: block;
        font-size: 13px;
        font-style: italic;
        color: var(--text-muted, #86868b);
    }

    /* Progress dots */
    .chapter-progress {
        position: fixed;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 100;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
    }
    .chapter-progress-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--text-muted, #86868b);
        opacity: 0.3;
        transition: all 0.3s ease;
        pointer-events: auto;
        cursor: pointer;
    }
    .chapter-progress-dot.active {
        opacity: 1;
        background: var(--accent-color, #f7c46c);
        transform: scale(1.3);
    }
    .chapter-progress-dot:hover {
        opacity: 0.7;
    }
```

- [ ] **Step 8: Add chapter progress dots HTML**

Add the progress dots right after `<main class="main-content">` (line 52):

```
        <div class="chapter-progress" id="chapterProgress">
            <div class="chapter-progress-dot" data-chapter="define"></div>
            <div class="chapter-progress-dot" data-chapter="spark"></div>
            <div class="chapter-progress-dot" data-chapter="breathe"></div>
            <div class="chapter-progress-dot" data-chapter="manifest"></div>
            <div class="chapter-progress-dot" data-chapter="endure"></div>
        </div>
```

- [ ] **Step 9: Add IntersectionObserver JS for chapter headers + progress dots**

Inside the existing `<script>` block in index.astro (before the closing `</script>`), after the existing DOMContentLoaded listener closes (around line 1118), add:

```
    // Narrative chapter IntersectionObserver
    const chapterHeaders = document.querySelectorAll('.chapter-header');
    const chapterDots = document.querySelectorAll('.chapter-progress-dot');
    const chapterSections = document.querySelectorAll('.chapter-section');

    const chapterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Update progress dots
                const chapter = entry.target.closest('.chapter-section')?.getAttribute('data-chapter');
                if (chapter) {
                    chapterDots.forEach(dot => {
                        dot.classList.toggle('active', dot.getAttribute('data-chapter') === chapter);
                    });
                }
            }
        });
    }, { threshold: 0.15 });

    chapterHeaders.forEach(h => chapterObserver.observe(h));

    // Click progress dots to scroll to chapter
    chapterDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const chapter = dot.getAttribute('data-chapter');
            const section = document.querySelector(`.chapter-section[data-chapter="${chapter}"]`);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
```

---

### Task 6: Homepage — Easter eggs (diary rotator, CL16 entry, typewriter click)

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add diary entries array + rotator**

In the frontmatter of `index.astro`, after the `chapters` array (added in Task 5), add:

```
const diaryEntries = [
    "2026.04.16 今天又大了一岁。Villa 也大了一岁。",
    "2026.03.12 深夜修 bug 修到崩溃，然后发现是少了个分号。",
    "2026.01.01 新的一年，想学更多东西。",
    "2025.12.24 圣诞夜，加了个 BGM 播放器。",
    "2025.08.15 第一次部署到 Cloudflare，紧张到手抖。",
    "2026.05.01 五月了，KEMDR 的考试系统终于写完了。",
    "2026.02.14 今天没人留言，有点冷清。",
    "2025.10.31 万圣节，给网站加了 dark mode。",
    "2026.06.01 儿童节快乐。保持好奇心。",
    "2026.04.01 愚人节，把整个网站变成颠倒的。然后改回来了。",
    "2026.03.28 今天收到了一条很温暖的留言。",
    "2025.09.15 开始学 Astro，感觉还不错。",
];
```

Add the diary rotator HTML right before the footer area. Find the closing `</section>` of the main content (around line 280) and the closing `</main>` (line 281). Add between them:

```
        <!-- Diary entry -->
        <div class="diary-entry" id="diaryEntry"></div>
```

Add the diary JS inside the existing `<script>` block, before the closing `</script>`:

```
    // Diary entry rotator
    const diaryEl = document.getElementById('diaryEntry');
    if (diaryEl) {
        const entries = [
            "2026.04.16 今天又大了一岁。Villa 也大了一岁。",
            "2026.03.12 深夜修 bug 修到崩溃，然后发现是少了个分号。",
            "2026.01.01 新的一年，想学更多东西。",
            "2025.12.24 圣诞夜，加了个 BGM 播放器。",
            "2025.08.15 第一次部署到 Cloudflare，紧张到手抖。",
            "2026.05.01 五月了，KEMDR 的考试系统终于写完了。",
            "2026.02.14 今天没人留言，有点冷清。",
            "2025.10.31 万圣节，给网站加了 dark mode。",
            "2026.06.01 儿童节快乐。保持好奇心。",
            "2026.04.01 愚人节，把整个网站变成颠倒的。然后改回来了。",
            "2026.03.28 今天收到了一条很温暖的留言。",
            "2025.09.15 开始学 Astro，感觉还不错。",
        ];
        diaryEl.textContent = entries[Math.floor(Math.random() * entries.length)];
    }
```

- [ ] **Step 2: Add diary entry CSS**

Inside the existing `<style>` block in index.astro, add:

```
    .diary-entry {
        text-align: center;
        padding: 40px 20px 80px;
        font-size: 13px;
        font-style: italic;
        color: var(--text-muted, #86868b);
        opacity: 0.5;
        transition: opacity 0.3s ease;
        cursor: default;
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
    }
    .diary-entry:hover {
        opacity: 0.8;
    }
```

- [ ] **Step 3: Add CL16 extra narrative entry**

Find the `cl16Words` array in the existing `<script>` block (line 962-976). Add one more entry to the end:

```
    const cl16Words = [
        "Don't judge others by what they can't do, \n judge yourself by what you can do.",
        "In the cracks, find the gold.",
        "Everyone has their own path.",
        "Potential lies in the journey.",
        "Every moment shapes who you are.",
        "Your effort defines your story.",
        "Growth comes from acceptance.",
        "You are not the best, but you are not the worst.",
        "Focus on the step, not the mountain.",
        "You are a work in progress, and that is enough.",
        "Success is measured by the obstacles you've overcome, not the finish line.",
        "Bloom where you are planted, even in the shadows.",
        "这座 Villa 不是一天建成的。但每一块砖，都有它的故事。 / This Villa wasn't built in a day. But every brick has its story."
    ];
```

- [ ] **Step 4: Typewriter click easter egg**

Add this JS inside the existing `<script>` block (before `</script>`) to create the typewriter word click easter egg:

```
    // Typewriter click easter egg
    const typewriterEl = document.getElementById('typewriter');
    if (typewriterEl) {
        let typeClickCount = 0;
        let typeTimer: ReturnType<typeof setTimeout> | null = null;
        const typeAnnotations: Record<string, string> = {
            'Define.': '定义自己是最难的事，也是最值得的事。',
            'Spark.': '火花的起点往往微不足道。',
            'Breathe.': '停下来，看看世界。',
            'Manifest.': '建造是另一种表达。',
            'Endure.': '坚持不是一天的事，是每一天的事。',
        };
        typewriterEl.style.cursor = 'pointer';
        typewriterEl.addEventListener('click', () => {
            typeClickCount++;
            if (typeTimer) clearTimeout(typeTimer);
            typeTimer = setTimeout(() => { typeClickCount = 0; }, 3000);
            if (typeClickCount >= 5) {
                typeClickCount = 0;
                const currentText = typewriterEl.textContent || '';
                const annotation = typeAnnotations[currentText];
                if (annotation) {
                    const tooltip = document.createElement('div');
                    tooltip.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--card-bg, #fff); border: 1px solid var(--accent-color, #f7c46c); border-radius: 16px; padding: 20px 28px; max-width: 320px; font-size: 15px; color: var(--text-main, #1d1d1f); z-index: 9999; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,0.15); animation: fadeInUp 0.3s ease; pointer-events: none;';
                    tooltip.textContent = annotation;
                    document.body.appendChild(tooltip);
                    setTimeout(() => {
                        tooltip.style.transition = 'opacity 0.3s ease';
                        tooltip.style.opacity = '0';
                        setTimeout(() => tooltip.remove(), 300);
                    }, 4000);
                }
            }
        });
    }
```

---

### Task 7: Self-review — Verify consistency and completeness

- [ ] **Step 1: Verify all files modified correctly**

Check that each modified file has the expected changes by running:
```
git diff --stat
```
Expected output should show all 11 modified files: Layout.astro, Header.astro, index.astro, about/en.astro, about/zh.astro, send.astro, reply.astro, reply/private.astro, application/kemdr.astro, application/dpmbg.astro, sponsor.astro.

- [ ] **Step 2: Verify the build**

Run the Astro build to verify no errors:
```
npm run build
```
Expected: Build succeeds with no errors. If errors, fix them and rebuild.

- [ ] **Step 3: Verify chapter order on homepage**

Open the built site and confirm that the homepage sections flow in this order:
1. DEFINE (hero/typewriter)
2. SPARK (photo gallery)
3. BREATHE (partners + CL16)
4. MANIFEST (counter + applications)
5. ENDURE (social/contact + diary entry)

Each chapter section should have a visible header with the chapter label and quotes.

- [ ] **Step 4: Verify sub-page chapter markers**

Visit each sub-page and confirm the narrative marker appears in the bottom-right corner with the correct chapter label and quote for:
- `/about` → DEFINE
- `/send` → ENDURE
- `/reply` → ENDURE
- `/sponsor` → ENDURE
- `/application/kemdr` → MANIFEST
- `/application/dpmbg` → MANIFEST

Also verify Header nav items show the active chapter highlight on the corresponding page.

- [ ] **Step 5: Verify easter eggs**

1. Click the typewriter word 5 times quickly → hidden annotation tooltip appears
2. The CL16 cinematics section includes the new Villa narrative quote
3. A diary entry is visible in the homepage footer area
4. On KEMDR page, click the version text 7 times → hidden quote appears
