# Web{X} Studio — Website

A deployment-ready, SEO-optimized marketing site for a web design, landing-page &
SEO agency (India-based). Pure **HTML + CSS + JavaScript** — no build step, no
framework, no dependencies to install before deploying.

It was converted from the original Claude-designed canvas files (`*.dc.html`) into
clean, standards-based pages: the proprietary design-canvas runtime (`support.js`,
`DCLogic`, `<x-dc>`, `{{ }}` templating) was removed and replaced with one
self-contained vanilla script.

---

## 1. What ships (the live site)

```
index.html                      Home (hero, services, work, process, stats, testimonials, FAQ, CTA)
work.html                       Portfolio / project list
studio.html                     About the studio + team
contact.html                    Contact details + working contact form
case-study-nova-finance.html    Example case study
404.html                        Branded not-found page
assets/css/webx.css             All styles (shared across every page)
assets/js/webx.js               All motion + interactions (shared)
assets/icon.svg                 Source for the app icons
images/cap-01..04.png           Capability images
favicon.svg  favicon.ico  favicon-32.png
apple-touch-icon.png  icon-192.png  icon-512.png
og-image.png  og-image.svg      Social share card (+ its source)
site.webmanifest  robots.txt  sitemap.xml
```

**Dev-only files — do NOT upload to production:** `*.dc.html`, `support.js`,
`webx-runtime.js`, `build-icons.cjs`, `screens/`, `uploads/`, `.thumbnail`.

---

## 2. Preview locally

Because pages use root-relative links, the most accurate preview is via a tiny
local server (Node is fine):

```bash
npx --yes serve .
# then open the printed http://localhost:3000
```

Opening `index.html` directly (double-click) also works for a quick look.

---

## 3. Deploy

It's a static site — host it anywhere:

- **Netlify / Cloudflare Pages:** drag-and-drop the folder (or connect the repo).
- **Vercel:** `vercel` in the folder, or import the repo (framework preset: *Other*).
- **GitHub Pages:** push the files, enable Pages on the branch root.
- **cPanel / shared hosting / S3:** upload the files to the web root.

Serve over **HTTPS** and at the **domain root** so the canonical URLs and
`og-image` resolve correctly.

---

## 4. Customise before launch  ✅

Work through this checklist — most items are a global find-and-replace.

### 4.1 Domain & clean URLs
The live domain is set to **`https://www.thewebx.in`** across every page's
`<link rel="canonical">`, Open Graph & Twitter tags and JSON-LD, plus the
`Sitemap:` line in `robots.txt` and all `<loc>` entries in `sitemap.xml`.
If it ever changes, find-replace that one string.

Links use **extensionless / clean URLs** (`/work`, not `/work.html`). The files
are still named `work.html` on disk — the host serves them without the extension.
This works out of the box on GitHub Pages, Netlify, Vercel and Cloudflare Pages
(they auto-resolve `/work` → `work.html` and 301-redirect `/work.html` → `/work`).
If you move to a host that does *not* do this, either enable "clean/pretty URLs"
there or restructure pages into folders (`work/index.html`).

### 4.2 Contact details
- **Email** `hello@thewebx.in` — make sure this mailbox actually exists (or change it). Used in footers, the contact page, JSON-LD and the mobile-menu link in `assets/js/webx.js`.
- **Phone** `+91 98765 43210` and the `tel:+919876543210` link in `contact.html` + JSON-LD.
- **Address / city** `12th Main Road, Indiranagar, Bengaluru …` in `contact.html` + JSON-LD on `index.html`/`contact.html`.
- **Geo** `geo.position` / `ICBM` / JSON-LD `geo` coordinates (currently Bengaluru `12.9716, 77.5946`).

### 4.3 Social links
Replace the placeholder profile URLs (`instagram.com/webxstudio`, `x.com/webxstudio`,
`linkedin.com/company/webxstudio`, `dribbble.com/webxstudio`) in every footer **and**
in the JSON-LD `sameAs` on `index.html`. Use real, working profiles (or delete the
ones you don't have).

### 4.4 Contact form (make it actually send)
The form validates client-side and, out of the box, just shows a success message
(demo mode). To receive real submissions, create a free endpoint
([Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com)) and put
the URL on the form in `contact.html`:

```html
<form id="wx-contact-form" data-endpoint="https://formspree.io/f/yourid" ...>
```

The script will `POST` the fields there and show the success panel on a 2xx response.

### 4.5 Content (placeholders)
Projects, the case study, team names, testimonials, stats and the FAQ **pricing in
₹** are sample content — update them with your real work, people and numbers.

### 4.6 Brand images
- **Capability images:** swap `images/cap-01.png … cap-04.png` (keep ~4:3).
- **Social card / icons:** edit `og-image.svg`, `favicon.svg`, `assets/icon.svg`,
  then regenerate the PNG/ICO files (see §6).

### 4.7 Analytics (optional but recommended)
Paste your GA4 snippet just before `</head>` on each page:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());gtag('config','G-XXXXXXX');</script>
```

---

## 5. The SEO that's already built in

- Unique, keyword-targeted `<title>` + meta description on every page.
- Open Graph + Twitter Card tags and a generated `og-image.png` (1200×630).
- Canonical URLs, `robots` meta (`max-image-preview:large`), `robots.txt`, `sitemap.xml`.
- **JSON-LD structured data:** `ProfessionalService`/`Organization` (with address,
  geo, ratings, reviews, service catalogue, opening hours), `WebSite`, `WebPage`,
  `BreadcrumbList` on every page, an **`FAQPage`** on the home page, `CollectionPage`
  + `ItemList` on Work, `AboutPage` on Studio, `ContactPage` + `ContactPoint`, and
  `Article` on the case study.
- India local-SEO signals: `lang="en-IN"`, `geo.*` meta, `areaServed`, IST clock.
- Semantic HTML (`header/nav/main/section/article/footer`, one `h1` per page),
  descriptive `alt` text, ARIA labels, a skip link, and a content-visible-without-JS
  fallback so crawlers never see hidden text.
- Performance: font `preconnect` + `display=swap`, lazy-loaded images with
  width/height (no layout shift), a deferred single JS file, reduced-motion support.

### After launch
1. Add the site to **Google Search Console** and **Bing Webmaster Tools**; submit `sitemap.xml`.
2. Validate with the **Rich Results Test** and **Schema Markup Validator**.
3. Create a **Google Business Profile** (big for local "web design agency in <city>" queries).
4. Run **Lighthouse** / PageSpeed Insights and confirm Core Web Vitals are green.
5. Keep the placeholder ratings/reviews honest — replace with real ones as you collect them.

---

## 6. Regenerating images

The PNG/ICO assets are generated from the SVG sources with [sharp](https://sharp.pixelplumbing.com):

```bash
npm i sharp          # once
node build-icons.cjs # rebuilds og-image.png, favicon.ico, icon-*.png, apple-touch-icon.png
```

(The build step already installed sharp under your system temp folder; the script
finds it automatically, or set `WX_SHARP` to a sharp install path.)
