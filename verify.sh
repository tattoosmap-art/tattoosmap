#!/bin/bash

# Give the server a moment to boot
sleep 2

URL="http://localhost:3000"

echo "=== SECTION 1 — HOMEPAGE VERIFICATION ==="
echo "=== HOMEPAGE TITLE ===" && curl -s "$URL" | grep -o '<title>.*</title>'
echo "=== HOMEPAGE CANONICAL ===" && curl -s "$URL" | grep -o '<link rel="canonical" href="[^"]*"'
echo "=== HOMEPAGE OG TITLE ===" && curl -s "$URL" | grep -o 'property="og:title" content="[^"]*"'
echo "=== HOMEPAGE OG IMAGE ===" && curl -s "$URL" | grep -o 'property="og:image" content="[^"]*"'
echo "=== HOMEPAGE H1 ===" && curl -s "$URL" | grep -o '<h1[^>]*>.*</h1>'
echo "=== HOMEPAGE ELEVATE CHECK ===" && curl -s "$URL" | grep -i "PLAN YOUR NEXT TATTOO"
echo "=== HOMEPAGE BROKEN LINK CHECK ===" && curl -s "$URL" | grep "dermatologists-guide-aftercare" || echo "No broken links found"
echo "=== HOMEPAGE JSON-LD ===" && curl -s "$URL" | grep -A 10 "application/ld+json"

echo -e "\n=== SECTION 2 — FOOTER CHECK ==="
echo "=== FOOTER ABOUT LINK ===" && curl -s "$URL" | grep -o '<a[^>]*href="/about"[^>]*>About</a>'
echo "=== FOOTER INSTAGRAM ===" && curl -s "$URL" | grep -o 'https://instagram.com/tattoosmap'

echo -e "\n=== SECTION 3 — GALLERY PAGE CHECK ==="
echo "=== GALLERY OG IMAGE ===" && curl -s "$URL/gallery" | grep -o 'property="og:image" content="[^"]*"'

echo -e "\n=== SECTION 4 — ARTISTS PAGE CHECK ==="
echo "=== ARTISTS OG TITLE ===" && curl -s "$URL/artists" | grep -o 'property="og:title" content="[^"]*"'
echo "=== ARTISTS TWITTER TITLE ===" && curl -s "$URL/artists" | grep -o 'name="twitter:title" content="[^"]*"'

echo -e "\n=== SECTION 5 — SITEMAP CHECK ==="
echo "=== SITEMAP ABOUT URL ===" && curl -s "$URL/sitemap.xml" | grep "/about"

echo -e "\n=== SECTION 6 — SOFT 404 CHECKS ==="
echo "=== BLOG FAKE POST ===" && curl -s -o /dev/null -w "%{http_code}" "$URL/blog/fake-post-xyz123"
echo "=== GALLERY FAKE DESIGN ===" && curl -s -o /dev/null -w "%{http_code}" "$URL/gallery/fake-design-xyz123"
