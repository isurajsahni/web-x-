# Web{X} — Global SEO Master Strategy

> Goal: Establish Web{X} (https://www.thewebx.in) as a globally authoritative website design & development agency across the US, Canada, UK, Australia, Germany, France, Singapore, Netherlands, UAE, Ireland, New Zealand, and Worldwide.
> Scope: **Global, service + topical authority.** Not Ludhiana / Punjab / local-India intent.
> This file is the strategic brain. `01-landing-pages.md` = the page architecture (150+). `02-blog-ideas.md` = the topical-authority layer (300+).

---

## 0. Reality check & prioritisation (read this first)

Dominating *every* website keyword worldwide is a 12–24 month program, not a launch. Priority order for compounding returns:

1. **Money pages first** — core service + Figma-to-X + comparison pages (highest commercial intent, you already have 6 live).
2. **Topical authority second** — the 300 blog cluster feeds internal links and E-E-A-T into the money pages.
3. **Geo/industry variants third** — only after the core service page proves it can rank; otherwise you build 150 thin doorway pages Google ignores.

**Do NOT** publish all 150+ pages at once. Ship in batches of 10–15, each genuinely differentiated (real copy, real proof, unique FAQs). 150 near-duplicate location pages = a scaled-content-abuse risk under the March 2024 core update. Differentiation is the entire game.

### Domain note (important)
`thewebx.in` is an India ccTLD → a mild geo-signal *toward India* that mildly handicaps a global goal. Two paths:
- **Recommended long-term:** acquire `thewebx.com`, 301 the `.in` → `.com`, keep `.in` as a redirect. Do this before you invest in 150 pages, or you migrate them all later.
- **If staying on `.in`:** lean hard on hreflang, an international `<meta name="geo">`-free strategy, global-signal content ("we work with founders in the US, UK, EU…"), country-neutral case studies, and links from the target countries. Set Search Console **International Targeting** to *Unlisted/Worldwide* (ccTLDs can't be geo-retargeted in GSC, which is another reason `.com` wins).

---

## 1–7. Keyword architecture & intent taxonomy

We map every keyword to one of four intents. URL/template/CTA is decided by intent, not by topic.

| Intent | User is… | Page type | CTA | Example |
|---|---|---|---|---|
| **Transactional / Commercial** | ready to hire | Service, Location, Industry, Comparison, Pricing | "Book a call" / "Get a quote" | `webflow-development`, `web-design-agency-usa` |
| **Commercial investigation** | comparing options | Comparison, "best", "vs", "cost" | "See our work" / soft consult | `webflow-vs-wordpress`, `website-design-cost` |
| **Informational** | learning | Blog, guide, glossary | newsletter / related-service link | `what-is-webflow`, `website-launch-checklist` |
| **Navigational** | looking for you | Home, brand | — | `Web{X}` |

### Primary keywords (head terms — the pages that must rank)
web design agency · website development company · web development agency · webflow development · webflow agency · wordpress development · shopify development · framer development · landing page design · landing page development · ui ux design agency · saas web design · custom web development · figma to webflow · figma to wordpress · figma to react · website redesign · technical seo services · web application development

### Secondary keywords (support the primaries, own their own pages)
webflow developer · webflow expert · enterprise web development · product design agency · dashboard design · admin panel design · crm development · erp development · website maintenance services · website speed optimization · conversion rate optimization agency · on-page seo services · website audit service · ecommerce development · marketing website design · startup website design · unbounce development · figma to html · figma to shopify · mobile app ui design · branding agency · ai automation agency

### Long-tail keywords (blog + FAQ + programmatic capture — high convert, low competition)
- "figma to webflow developer for saas" · "how much does a webflow website cost" · "best web design agency for startups" · "hire a webflow expert in the usa" · "wordpress to webflow migration service" · "landing page design for b2b saas" · "webflow vs framer for marketing sites" · "website speed optimization for shopify" · "how long does it take to build a website" · "figma to react conversion service" · "enterprise webflow development agency" · "web design agency for dental clinics"
- Pattern generators (see §Programmatic): `[service] for [industry]`, `[service] in [country]`, `hire a [role]`, `[platform A] vs [platform B]`, `how much does a [thing] cost`, `[platform] to [platform] migration`.

### Commercial-intent modifiers to weave in (naturally)
agency · company · services · developer · expert · hire · freelance · outsource · cost · pricing · quote · consultant · for startups · for saas · for enterprise · near me (geo pages) · best · top.

### Informational anchors (topical-authority spine)
what is / how to / guide / checklist / examples / trends / best practices / tutorial / vs / cost / benefits / mistakes.

---

## 8–11. Page architecture summary (full list in `01-landing-pages.md`)

| Cluster | Count | Template | Priority |
|---|---|---|---|
| Core service pages | ~40 | Service | P0 |
| Figma-to-X conversion | ~8 | Service (you have 5) | P0 |
| Platform / tech pages | ~14 | Service | P1 |
| Comparison ("vs") pages | ~18 | Comparison | P1 |
| Location pages (12 countries × key services) | ~40 | Location-Service | P2 |
| Industry pages | ~25 | Industry-Service | P2 |
| Educational / glossary hubs | ~20 | Guide | P1 |
| **Total** | **150+** | | |

### Programmatic SEO (items 11) — rules of engagement
Programmatic ≠ spun. Each generated page needs **3 unique differentiators minimum**: (a) country/industry-specific intro & pain points, (b) a relevant case study or testimonial, (c) locale-specific FAQs (currency, timezone, compliance — GDPR for EU, etc.). Matrix generators:
- **Service × Country:** `{webflow-development, web-design, landing-page-design, saas-web-design, ui-ux-design} × {usa, canada, uk, australia, germany, france, singapore, netherlands, uae, ireland, new-zealand}` — but only ship the combos with real search volume + a case study to back them. Start with `webflow-development-usa/uk/canada/australia` and `web-design-agency-{country}`.
- **Service × Industry:** `{web-design, website-development} × {dental, law-firm, real-estate, finance, healthcare, ...}`.
- **Platform-to-Platform migration:** `{webflow, wordpress, wix, squarespace} → {webflow, framer}`.
Gate every programmatic batch behind: "Would a human find this specific page uniquely useful?" If no → don't publish.

---

## 12. Internal linking strategy

**Hub-and-spoke + a flat, ≤3-click architecture.**

```
Home
 ├─ /services (hub)  ──► every core service page (spoke)
 │      └─ each service page ──► its industry variants, its country variants, its comparison pages, 3–5 related blogs
 ├─ /blog (hub) ──► cluster pillar pages ──► cluster articles ──► back up to the money page they support
 ├─ /work (proof hub) ──► case studies ──► linked from every relevant service page
 └─ /studio, /contact (global, in footer)
```

Rules:
1. **Every blog links up** to the one money page it supports (exact-ish anchor, e.g. "Webflow development service").
2. **Every money page links down** to 3–5 supporting blogs + across to 2–3 sibling services + to relevant case studies.
3. **Pillar → cluster → pillar** loop for each topic (see §13).
4. **Descriptive anchors**, never "click here". Vary anchors to avoid over-optimisation (mix exact, partial, branded).
5. **Breadcrumbs on every page** (also = Breadcrumb schema, §17).
6. Keep `footer.js` global links lean (you already centralised this) — footer links pass little value; put the real internal links in body content.
7. **Orphan check:** every published URL must be reachable from `/services` or `/blog` within 2 clicks. Run a crawl (Screaming Frog) each batch.

---

## 13. Content-cluster strategy

Each pillar is a comprehensive money/guide page; clusters are the 300 blogs. Ten pillars:

1. **Webflow** → figma-to-webflow, webflow-development, webflow-vs-*, webflow cost, webflow tutorials.
2. **WordPress** → development, figma-to-wordpress, wp-vs-*, migration, maintenance.
3. **Shopify / E-commerce** → shopify-development, figma-to-shopify, shopify-vs-woocommerce, CRO for stores.
4. **Framer / Unbounce (no-code)** → framer-development, figma-to-framer, unbounce, landing pages.
5. **Landing pages & CRO** → landing-page-design/development, cro, a/b testing, conversion.
6. **UI/UX & Product design** → ui-ux-design, product-design, saas-design, dashboard/admin, design systems.
7. **Design-to-code (Figma-to-X)** → all figma-to-* + handoff, tokens, accessibility.
8. **Web performance & Technical SEO** → speed-optimization, core-web-vitals, technical-seo, audits, crawl.
9. **Custom software** → web-app, crm, erp, saas builds, automation.
10. **Business of web / pricing** → cost guides, agency vs freelancer, hiring, process, trends.

Every blog in `02-blog-ideas.md` is tagged to one pillar. The pillar page must link to its top cluster articles, and vice-versa.

---

## 14. E-E-A-T optimisation

- **Experience:** every service page shows *real* case studies with measurable outcomes (LCP before/after, conversion lift, timeline). You already have 4 case studies — attach the relevant one to each service page.
- **Expertise:** author bylines on every blog, tied to your real 4-member team (already on `/studio`). Add `author` + `Person` schema, credentials, and a linked author archive.
- **Authoritativeness:** earn links (guest posts on Webflow/no-code communities, agency directories like Clutch/DesignRush/The Manifest, HARO/Connectively responses, podcast appearances). Get listed in Webflow/Framer expert directories.
- **Trust:** visible NAP (business name/contact), clear pricing signals, testimonials with names/photos, privacy + terms pages, HTTPS (have it), a real "About/Studio" (have it). Add review/rating schema only where genuine reviews exist.
- **"Who, How, Why"** (Google's guidance): each page should make clear *who* made it, *how* (process), and *why* it's trustworthy. Add a short "Why trust Web{X}" block to service pages.

---

## 15–20. Structured data (schema) strategy

Deploy JSON-LD (you already inject `application/ld+json`). Recommended graph per page type:

### Site-wide (in `nav.js`/head, every page)
- **Organization** (once, on Home; reference by `@id` elsewhere):
```json
{
  "@context":"https://schema.org","@type":"Organization","@id":"https://www.thewebx.in/#org",
  "name":"Web{X} Studio","url":"https://www.thewebx.in/","logo":"https://www.thewebx.in/logo-mark.svg",
  "sameAs":["https://twitter.com/theWebxOfficial","https://www.linkedin.com/company/…","https://www.instagram.com/…","https://clutch.co/…"],
  "contactPoint":[{"@type":"ContactPoint","contactType":"sales","email":"…","areaServed":["US","CA","GB","AU","DE","FR","SG","NL","AE","IE","NZ"],"availableLanguage":["en","de","fr"]}]
}
```
- **WebSite** + `SearchAction` (sitelinks searchbox) on Home.

### Service pages (16, 19)
- **Service** with `provider` → `@id` of Organization, `serviceType`, `areaServed` (list of countries or "Worldwide"), `hasOfferCatalog`.
- **BreadcrumbList** (17).
- **FAQPage** (16) — 4–8 Q&As, must match visible on-page FAQ.

### Comparison / guide / blog pages
- **Article** / **BlogPosting** with `author` (Person, @id to author page), `datePublished`, `dateModified`, `image`, `publisher` (@id org).
- **FAQPage** where FAQs exist.
- **HowTo** for step guides (e.g., "how to improve website speed").
- **BreadcrumbList**.

### Location pages (20 — LocalBusiness — use with care)
- Use **LocalBusiness** / **ProfessionalService** **only where you have a genuine presence or NAP for that market.** Fabricating local addresses = spam risk. For countries where you're remote, prefer **Organization + Service** with `areaServed: "United States"` rather than a fake `LocalBusiness` address. Your real registered address (India) is the one honest `PostalAddress`.
- If you open real presences (or use a legit registered agent), then per-country `LocalBusiness` with `@id`, `address`, `geo`, `openingHours`, `priceRange`.

### FAQ schema (16) — governance
- 4–8 questions, answers 40–300 chars, **must be visible on page** (Google requirement), no promotional/keyword-stuffed answers. Unique per page.

### Breadcrumb schema (17) — every non-home page
```
Home › Services › Webflow Development
Home › Services › Web Design › Web Design Agency USA
Home › Blog › Webflow › How much does a Webflow site cost
```

Validate every template with the Rich Results Test + Schema.org validator before batch-publishing.

---

## 21–22. Image SEO & ALT text

- **Format:** AVIF/WebP with fallback; you have raster OG PNGs — keep `og-image.png` 1200×630.
- **Dimensions:** always set `width`/`height` (prevents CLS, §29). Serve responsive `srcset` + `sizes`.
- **Lazy-load** below-the-fold (`loading="lazy"`), **eager** the LCP hero image + `fetchpriority="high"`.
- **Filenames:** descriptive, kebab-case, keyworded — `webflow-development-dashboard-webx.webp`, not `IMG_2831.png`.
- **ALT text rules:** describe the image *for a user who can't see it*, include the keyword only when it genuinely describes the image, ≤125 chars, no "image of", no stuffing.
  - Good: `alt="Web{X} team converting a Figma design into a responsive Webflow layout"`
  - Bad: `alt="figma to webflow figma to webflow developer agency usa uk"`
- Decorative images → `alt=""`.
- Add an **image sitemap** section or `<image:image>` in `sitemap.xml` for key visuals/case-study screenshots.

---

## 23–24. Meta titles & descriptions (rules + your pattern)

- **Title:** `Primary Keyword | Value/Descriptor | Web{X}` — ≤ ~60 chars / 575px so it doesn't truncate. Front-load the keyword. (You already do this — keep it.)
- **Description:** 140–155 chars, active voice, contains primary keyword + a differentiator + a soft CTA. Not a ranking factor but drives CTR.
- Unique on **every** page. No template-only descriptions.
- Every page's title/description is specified in `01-landing-pages.md` and per-blog in `02-blog-ideas.md`.

Examples:
- `webflow-development`: **Title** "Webflow Development Services | Hand-Built, CMS-Ready | Web{X}" · **Desc** "Custom Webflow development for startups & enterprises worldwide — pixel-perfect, fast, and SEO-clean. Hand-built, no templates. Book a free build consultation."

---

## 25. URL structure

- **Flat, clean, lowercase, kebab-case, no `.html`** (you already do this via clean URLs). Keep the root flat for core services (`/webflow-development`) — it's your established pattern and fine at this scale.
- **Location pages:** `/{service}-{country}` → `/webflow-development-usa`, `/web-design-agency-uk`. (Keep it consistent — pick `-usa` not `/usa/`. Root-flat is fine; sub-folders only help if you later want per-country hreflang folders. See §26/28.)
- **Industry pages:** `/{industry}-website-design` → `/dental-website-design`.
- **Comparison:** `/{a}-vs-{b}` → `/webflow-vs-wordpress`.
- **Blog:** `/blog/{slug}` ideally (folder), or keep your current `/blog-{slug}` flat pattern for consistency with the 4 existing posts. **Pick one and stick to it** — mixing `/blog-x` and `/blog/x` splits the cluster. Recommendation: migrate to `/blog/{slug}` folder for cleaner cluster semantics + a real `/blog` hub, and 301 the 4 existing posts.
- No dates, no stop-word bloat, no params for canonical content.

---

## 26. Canonical strategy

- **Self-referencing canonical on every page** (you do this). Absolute URLs with `https://www.thewebx.in`, `www` version, no trailing slash except root.
- Pick **one** host (`www`) — 301 non-www → www (and http → https). Confirm in `vercel.json`.
- Comparison pages `a-vs-b` and `b-vs-a`: build **one**, canonical the other to it (or just don't build the reverse).
- Programmatic near-duplicates: each must be genuinely unique so none needs to canonical to another. If two country pages are ~identical, you have a differentiation problem, not a canonical one.
- Paginated blog: `rel=canonical` self on each page (not to page 1); use distinct titles.
- Params (utm, etc.): canonical to the clean URL.

---

## 27. Robots strategy

Your `robots.txt` is good. Additions/keeps:
- Keep `Disallow: /uploads/ /screens/ *.dc.html$`.
- Add `Disallow: /login` and any `/thank-you` / internal-only pages you don't want indexed (or `noindex` them via meta — preferred for thank-you pages so link equity isn't wasted, but keep out of sitemap).
- Keep `index, follow, max-image-preview:large, max-snippet:-1` on all money/content pages (you have this).
- **Do NOT block CSS/JS** (you don't) — Google needs them to render/score CWV.
- Add explicit `Sitemap:` line (present). Consider a sitemap index when >1 sitemap (§28).
- Don't rely on robots.txt to hide a page from the index — use `noindex` for that (robots-blocked pages can still be indexed URL-only).

---

## 28. Sitemap strategy

- Move to a **sitemap index** as you scale:
  - `/sitemap.xml` (index) → `sitemap-pages.xml`, `sitemap-services.xml`, `sitemap-locations.xml`, `sitemap-industries.xml`, `sitemap-blog.xml`, `sitemap-images.xml`.
- Only include **canonical, indexable, 200-status** URLs. No redirects, no noindex, no params.
- Accurate `lastmod` (real modified date — you set these). Don't fake freshness.
- `changefreq`/`priority` are largely ignored by Google now — fine to keep, don't obsess.
- **Add hreflang** for location pages if you go multi-market (see below).
- Regenerate on every publish batch. Submit each sitemap in GSC.
- Add `<image:image>` entries for case-study/portfolio pages.

### hreflang (for the international goal)
If you build true per-country/per-language variants, add reciprocal `hreflang` (e.g., `en-us`, `en-gb`, `en-au`, `en-ca`, `de-de`, `fr-fr`, `en-sg`, `en-ae`, `x-default`). If a "country" page is just English-with-a-country-name (no localisation), **don't** hreflang it — you'll create duplicate-content confusion. hreflang is for genuinely localised equivalents.

---

## 29. Core Web Vitals

Targets: **LCP < 2.5s, INP < 200ms, CLS < 0.1** (field data, 75th percentile).

- **LCP:** preload hero font + LCP image, `fetchpriority="high"` on hero img, avoid render-blocking. You load Google Fonts via stylesheet — self-host the two families (Space Grotesk, JetBrains Mono) as WOFF2 + `font-display: swap` to kill the render-blocking round-trip and preconnect cost. Preload the one weight used above the fold.
- **INP:** defer non-critical JS (you use `defer`), break up long tasks, minimise third-party (GTM + gtag + any chat). Audit GTM tag bloat — it's often the INP villain.
- **CLS:** set `width/height` on all images/embeds, reserve space for fonts (size-adjust), no injected banners that shift layout.
- **TTFB:** static on Vercel is already fast; keep pages static/edge, cache aggressively.
- Ship critical CSS inline for above-the-fold, defer the rest of `webx.css` if it's large.
- Monitor: GSC Core Web Vitals report + PageSpeed field data + CrUX. Fix by template (fix once, applies to all pages of that template).

---

## 30. Crawl optimisation

- **Flat architecture** (≤3 clicks) so crawl reaches every page — the internal-linking plan handles this.
- **Internal links > sitemap** for discovery — sitemap is a hint, links are the highway.
- **Clean up crawl waste:** noindex/canonical thin variants, block faceted/param URLs, fix redirect chains (single hop), no soft-404s. Return proper 404/410 (you have `404.html`).
- **Crawl budget** isn't a concern at 500 pages, but *quality dilution* is — every low-value page you publish makes Google trust the domain slightly less. Prune/merge underperformers quarterly (content audit).
- Keep `lastmod` honest so Google recrawls updated pages.
- Log-file / GSC Crawl Stats review each quarter.

---

## AI-search / AEO optimisation (AI Overviews, ChatGPT, Gemini, Claude, Perplexity)

These engines reward *clear, extractable, citable* answers:
1. **Answer-first structure** — lead each page/section with a 40–60 word direct answer, then elaborate. Great for AI Overview + featured-snippet capture.
2. **Question-based H2s** matching real queries ("How much does a Webflow website cost?").
3. **Structured data** (FAQ, HowTo, Article, Organization) — feeds entity understanding.
4. **Entities, not just keywords** — name the tools, platforms, standards, and concepts (Webflow CMS, Core Web Vitals, WCAG, GDPR, headless CMS, design tokens…) so NLP models map you to the right topic graph. This is the "semantic/NLP entity" layer — write like an expert who names things precisely.
5. **Facts + numbers + comparisons** (tables) — LLMs love citable specifics.
6. **Be the primary source** — original data, benchmarks, opinionated frameworks (e.g., "our 7-point Webflow launch checklist") get cited over generic content.
7. **Consistent entity signals** across the web (same NAP, same descriptions, Wikidata/Wikipedia-adjacent presence, Crunchbase, LinkedIn) so models resolve "Web{X}" to one confident entity.
8. **llms.txt (optional/emerging):** consider a `/llms.txt` summarising the site for LLM crawlers.

---

## Measurement & governance

- **KPIs:** organic sessions by country, keyword rankings (track a core-100 set per market), money-page conversions, assisted conversions from blog, indexed-page ratio (indexed vs submitted), CWV pass rate.
- **Cadence:** publish batch → wait 2–4 wks → measure → double down on winners, prune losers.
- **Tools:** GSC (per-country performance), Ahrefs/Semrush (rank + gap), Screaming Frog (crawl/orphans), PageSpeed/CrUX (CWV), Rich Results Test (schema).
- **Content refresh:** update `dateModified` + freshen top pages every 6 months (freshness is a real signal for competitive terms).

---

## Build sequencing (recommended)

1. **Batch 0 (now):** fix domain decision (.com?), self-host fonts, sitemap index, Organization/WebSite schema on Home.
2. **Batch 1:** core service pages (webflow/wordpress/shopify/framer/landing-page/ui-ux/web-design-agency/custom-web-dev) — ~12 pages.
3. **Batch 2:** comparison pages (highest-ROI, low competition) — ~10.
4. **Batch 3:** educational hubs + first 30 blogs (topical authority ignition).
5. **Batch 4+:** location + industry pages, gated on real differentiation + case studies.
6. Continuous: 8–12 blogs/month from `02-blog-ideas.md`.
