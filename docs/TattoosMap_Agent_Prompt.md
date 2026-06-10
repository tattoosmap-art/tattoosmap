# TattoosMap — Comprehensive AI Coding Agent Prompt

---

## PROJECT OVERVIEW

Build a production-ready website for **TattoosMap**, a tattoo inspiration and culture brand. The site has two core pillars:

1. **A Blogging Platform** — long-form editorial content about tattoo culture, artists, styles, and technique.
2. **A Pinterest-Style Gallery** — a masonry/grid layout where users browse, filter, and save high-resolution tattoo design inspirations.

The entire product must be fast, beautiful, and disciplined in its design language.

---

## TECH STACK REQUIREMENTS

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS (strictly utility-class only, no inline styles)
- **Database**: Supabase (PostgreSQL) for blog posts, gallery images, tags, and user saves
- **Image Storage**: Supabase Storage or Cloudflare R2
- **Image Optimization**: Next.js `<Image />` component with aggressive configuration (see Performance section)
- **CMS** (for blog): Integrate with Sanity.io or use Supabase directly with a custom admin panel
- **Search/Filter**: Client-side filtering with URL query params for shareability
- **Deployment Target**: Vercel (ensure all Next.js optimizations are Vercel-compatible)
- **Authentication** (optional v1): Supabase Auth for "save to collection" functionality

---

## DESIGN SYSTEM — DIETER RAMS PRINCIPLES (STRICT)

This is non-negotiable. Every design decision must pass the Dieter Rams filter.

### The 10 Principles Applied to TattoosMap:

1. **Good design is innovative** — Use modern layout techniques (CSS Grid, masonry) but only where they serve function.
2. **Good design makes a product useful** — Every element on the page must earn its place. No decorative elements for decoration's sake.
3. **Good design is aesthetic** — Beauty through proportion, whitespace, and typographic precision — not ornamentation.
4. **Good design makes a product understandable** — Navigation must be self-evident. Users should never be confused about where they are.
5. **Good design is unobtrusive** — The tattoo designs and content are the hero. The UI is the frame, not the artwork.
6. **Good design is honest** — No fake loading states, no dark patterns, no misleading CTAs.
7. **Good design is long-lasting** — Avoid trendy design. Build something that looks as good in 5 years as it does today.
8. **Good design is thorough** — Pixel-perfect spacing. Consistent rhythm. No misaligned elements anywhere.
9. **Good design is environmentally friendly** — Translate to web: performant, lightweight, no wasted resources.
10. **Good design is as little design as possible** — If in doubt, remove it.

### Color Palette

```
--color-white:       #FFFFFF   (dominant background)
--color-off-white:   #F5F5F3   (secondary surface)
--color-black:       #0A0A0A   (primary text, borders)
--color-gray-light:  #E8E8E6   (dividers, cards borders)
--color-gray-mid:    #9A9A9A   (secondary text, captions)
--color-red:         #CC1F1F   (primary accent — CTAs, active states, tags, hover underlines)
--color-red-dark:    #991515   (red hover state)
```

**Rules:**
- White must occupy ≥ 70% of any given page's visual area.
- Red is used **sparingly** — maximum 2–3 instances per viewport at any time.
- Black is used for all body typography and structural elements (nav, footer, borders).
- No gradients. No shadows (except a single, subtle `box-shadow: 0 1px 3px rgba(0,0,0,0.08)` on cards).
- No rounded corners above `border-radius: 2px` unless on pill-shaped tags (max `border-radius: 999px`).

### Typography

```
Display / Headings:   "Playfair Display" (Google Fonts) — for editorial gravitas
Body / UI:            "DM Sans" (Google Fonts) — clean, geometric, neutral
Monospace (optional): "DM Mono" — for labels, metadata, tag counts
```

**Type Scale (rem-based, 1rem = 16px):**
```
--text-xs:    0.75rem   / 12px
--text-sm:    0.875rem  / 14px
--text-base:  1rem      / 16px
--text-lg:    1.125rem  / 18px
--text-xl:    1.25rem   / 20px
--text-2xl:   1.5rem    / 24px
--text-3xl:   1.875rem  / 30px
--text-4xl:   2.25rem   / 36px
--text-5xl:   3rem      / 48px
--text-hero:  4.5rem    / 72px  (homepage hero only)
```

**Rules:**
- Line-height for body text: `1.7`
- Line-height for headings: `1.15`
- Letter-spacing for all-caps labels: `0.08em`
- Max line width for reading: `68ch`

### Spacing System

Use an 8px base grid exclusively:
```
4px / 8px / 12px / 16px / 24px / 32px / 48px / 64px / 96px / 128px / 192px
```

Section padding vertical: minimum `96px` top and bottom on desktop, `64px` on mobile.

### Layout Grid

- Desktop: 12-column grid, `1280px` max-width container, `24px` column gaps
- Tablet: 8-column grid
- Mobile: 4-column grid, `16px` side padding

---

## FEATURE 1 — BLOGGING PLATFORM

### Pages Required

| Route | Description |
|---|---|
| `/blog` | Blog index — list of articles, featured post hero at top |
| `/blog/[slug]` | Individual article page |
| `/blog/category/[category]` | Filtered list by category |

### Blog Index (`/blog`)

- Full-width featured article hero at top: large image left, title + excerpt + author + date right. Title in Playfair Display, large.
- Below: 3-column article grid (on desktop). Each card has: image (16:9 ratio), category tag in red, title, 1-line excerpt, author name, read time.
- Infinite scroll or "Load More" button (prefer "Load More" for Rams-compliant, intentional UX).
- Category filter bar below the hero: horizontal list of text tabs (e.g., "All", "Styles", "Artists", "Culture", "Technique"). Active tab underlined in red.

### Article Page (`/blog/[slug]`)

- Full-width hero image with article title overlaid at bottom-left (white text on dark overlay).
- Article metadata bar: Author avatar + name, publish date, read time, category.
- Body content in `68ch` max-width centered column.
- Typographic elements to support: H2, H3, blockquote (left red border + italic), inline code, ordered/unordered lists, pull quotes (large, centered, Playfair).
- Related articles section at the bottom: 3 cards, same style as blog index grid.
- Social share: minimal text-only buttons (Twitter/X, Copy Link) — no colored social icons.

### Blog Data Schema (Supabase)

```sql
posts (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body_content TEXT,         -- MDX or rich text
  cover_image_url TEXT,
  cover_image_alt TEXT,
  author_id UUID REFERENCES authors(id),
  category TEXT,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  read_time_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

authors (
  id UUID PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  bio TEXT
)
```

---

## FEATURE 2 — PINTEREST-STYLE GALLERY

### Pages Required

| Route | Description |
|---|---|
| `/gallery` | Main gallery with masonry grid |
| `/gallery/[id]` | Single design detail page |
| `/gallery/style/[style]` | Filtered by tattoo style |

### Gallery Index (`/gallery`)

**Layout:** CSS Masonry grid (use `columns` CSS property with `column-gap`, NOT JavaScript masonry libraries — keep it fast and dependency-free). On desktop: 4 columns. Tablet: 3. Mobile: 2.

**Filtering System:**
- Sticky filter bar at top (below nav), white background, `1px solid var(--color-gray-light)` bottom border.
- Filter options (multi-select pills): Style (Traditional, Realism, Blackwork, Japanese, Geometric, Watercolor, Fine Line, Neo-Traditional), Body Part (Arm, Back, Chest, Leg, Neck, Hand), Size (Small, Medium, Large, Full Sleeve).
- Active filters shown as dismissible red pills below the filter bar.
- Filter state stored in URL query params: `/gallery?style=blackwork&size=small`
- Sort options: "Latest", "Most Saved", "Most Viewed" (right-aligned dropdown).

**Gallery Cards:**
- No fixed aspect ratio — images display at natural ratio (key for masonry).
- On hover: Smooth overlay fades in (black, 60% opacity) with: Save icon (bookmark outline → filled on save), Style tag, "View" text.
- Cards have `border: 1px solid var(--color-gray-light)` and `border-radius: 2px`.
- No card titles visible by default — let the image speak.

**Gallery Data Schema (Supabase):**

```sql
designs (
  id UUID PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,         -- original high-res URL
  image_blurhash TEXT,             -- BlurHash string for placeholder
  image_width INT,
  image_height INT,
  alt_text TEXT,
  style TEXT[],                    -- e.g. ['blackwork', 'geometric']
  body_part TEXT[],
  size TEXT,
  artist_name TEXT,
  artist_instagram TEXT,
  tags TEXT[],
  save_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
)

user_saves (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  design_id UUID REFERENCES designs(id),
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, design_id)
)
```

### Single Design Page (`/gallery/[id]`)

- Two-column layout: large image left (sticky on scroll), metadata right.
- Right column: Style tags, Size, Body part, Artist credit with Instagram link (no logo, text only).
- "Save" button (large, black, full-width on mobile).
- "Similar Designs" section below: horizontal scroll row of 6 related cards.

---

## PERFORMANCE ARCHITECTURE — HIGH-RES IMAGE SYSTEM

This is critical. Follow every instruction below without exception.

### 1. Image Pipeline on Upload

When an admin uploads a new gallery image, trigger an automated pipeline:

```
Original Upload (e.g., 4000×5000px RAW)
        ↓
Generate 4 derivative sizes via Sharp.js:
  - thumbnail:  400px wide  (for gallery grid cards)
  - medium:     800px wide  (for mobile full-view)
  - large:      1200px wide (for desktop detail page)
  - original:   kept in storage, never served directly
        ↓
Convert all derivatives to WebP format (quality: 82)
        ↓
Generate BlurHash string from thumbnail
        ↓
Store all URLs + BlurHash in Supabase `designs` table
```

Use **Sharp.js** in a Next.js API route or Supabase Edge Function for this pipeline.

### 2. Next.js Image Component Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 400, 800],
    minimumCacheTTL: 31536000, // 1 year
    domains: ['your-supabase-project.supabase.co'],
  },
}
```

Always use Next.js `<Image />` with:
- `sizes` prop calibrated to actual layout (e.g., `sizes="(max-width: 768px) 50vw, 25vw"` for 4-col gallery)
- `placeholder="blur"` with `blurDataURL` from stored BlurHash (decode server-side using `blurhash` npm package)
- `loading="lazy"` for all below-the-fold images
- `priority` only for above-the-fold hero images (max 1–2 per page)

### 3. BlurHash Placeholder System

```typescript
// lib/blurhash.ts
import { decode } from 'blurhash';

export function blurhashToDataURL(hash: string, width = 32, height = 32): string {
  const pixels = decode(hash, width, height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

// On server: pre-compute base64 blurDataURL from BlurHash
// and pass as prop to <Image blurDataURL={...} />
```

### 4. Virtualization for Large Galleries

When the gallery exceeds 100 items, implement windowed rendering:
- Use `@tanstack/react-virtual` for virtualized masonry rendering.
- Only render cards within 1.5× the viewport height.
- Intersection Observer API to trigger lazy loading of next batch (20 items per page from Supabase).

### 5. Caching Strategy

```typescript
// app/gallery/page.tsx
export const revalidate = 3600; // ISR: revalidate every 1 hour

// app/blog/[slug]/page.tsx  
export const revalidate = 86400; // ISR: revalidate every 24 hours
```

- Use Next.js `unstable_cache` for repeated database queries.
- Set `Cache-Control: public, max-age=31536000, immutable` on all image responses.
- Use Supabase CDN for image delivery (enabled by default on Supabase Storage).

### 6. Core Web Vitals Targets

The build must pass these benchmarks (measure with Lighthouse CI):
```
LCP (Largest Contentful Paint): < 2.5s
FID / INP:                       < 100ms
CLS (Cumulative Layout Shift):   < 0.1
TTI (Time to Interactive):       < 3.5s
Lighthouse Performance Score:    ≥ 90
```

To achieve CLS < 0.1: **always define explicit `width` and `height` on every `<Image />`** so the browser reserves space before the image loads.

---

## NAVIGATION & GLOBAL LAYOUT

### Header
- Full-width, white background, `1px solid var(--color-gray-light)` bottom border.
- Left: Wordmark "TATTOOSMAP" in Playfair Display, tracking `0.05em`, 20px, black.
- Center: Nav links — "Gallery", "Blog", "Styles", "Artists" — DM Sans, 14px, black. On hover: red underline animates in from left (CSS `transform: scaleX()`).
- Right: Search icon (outline, 20px), Save icon (bookmark, 20px), Language toggle if needed.
- Mobile: Hamburger → fullscreen overlay menu, white background, large Playfair Display nav links.
- Header must be `position: sticky; top: 0; z-index: 100` with `backdrop-filter: blur(8px)` and slight transparency on scroll.

### Footer
- 3-column layout: Brand column (wordmark + 1-line tagline), Navigation column, Social/Legal column.
- All text: DM Sans, 13px, `--color-gray-mid`.
- Social links: text-only ("Instagram", "Pinterest") — no icons.
- Top border: `1px solid var(--color-gray-light)`.
- Padding: `96px` top, `48px` bottom.

### 404 Page
- Large "404" in Playfair Display, center-aligned.
- One-line message. One red CTA button: "Back to Gallery".

---

## HOMEPAGE (`/`)

Structure (top to bottom):
1. **Hero** — Full-viewport-height. Split: left half white with large Playfair Display headline ("Find Your Next Tattoo."), subheadline, red CTA "Explore Gallery". Right half: single curated high-res tattoo image (priority loaded).
2. **Featured Gallery Strip** — "Trending Designs" label (all-caps, DM Mono, gray), followed by horizontal scroll of 6 gallery cards.
3. **Editorial Section** — "From the Blog" — 3 latest posts in card grid.
4. **Style Categories** — 6 style categories as large text links in a 2×3 grid. No images — typography only. On hover: red.
5. **Footer**

---

## SEO & METADATA

- Every page must have a `generateMetadata()` function.
- Blog posts: use post title, excerpt, cover image for OG tags.
- Gallery designs: use design alt_text and image for OG tags.
- Implement `sitemap.xml` via Next.js `app/sitemap.ts`.
- Implement `robots.txt`.
- Add structured data (JSON-LD) for blog posts (`Article` schema) and gallery items (`ImageObject` schema).

---

## ACCESSIBILITY

- All images must have descriptive `alt` text.
- Color contrast ratio ≥ 4.5:1 for all text (red on white passes at the specified red value — verify).
- All interactive elements must be keyboard-navigable with visible `:focus-visible` outlines (use `outline: 2px solid var(--color-red); outline-offset: 2px`).
- Use semantic HTML throughout: `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<figure>`, `<figcaption>`.
- ARIA labels on icon-only buttons.

---

## CODE QUALITY STANDARDS

- TypeScript strict mode (`"strict": true` in tsconfig).
- ESLint + Prettier configured.
- All components documented with a JSDoc comment block.
- No `any` types.
- Separate concerns: `/components/ui/` for primitives, `/components/gallery/` for gallery-specific, `/components/blog/` for blog-specific.
- Environment variables: all secrets via `.env.local`, never hardcoded.
- Error boundaries on all data-fetching components.

---

## DELIVERABLES CHECKLIST

- [ ] Next.js project initialized with TypeScript + Tailwind
- [ ] Supabase schema migrations for all tables
- [ ] Image upload pipeline with Sharp.js resizing + BlurHash generation
- [ ] Gallery page with masonry layout, filters, URL state, virtualization
- [ ] Blog index + article page with full typography system
- [ ] Homepage with all 5 sections
- [ ] Global Nav + Footer components
- [ ] `next.config.js` with full image optimization configuration
- [ ] ISR configured on all pages
- [ ] SEO metadata + sitemap + robots.txt
- [ ] Lighthouse score ≥ 90 on Performance
- [ ] WCAG AA accessibility compliance
- [ ] README with setup instructions and environment variable documentation

---

*Prompt authored for TattoosMap — Version 1.0*
