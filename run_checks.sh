#!/bin/bash

echo "Waiting for deployment to go live..."
for i in {1..30}; do
  if curl -s "https://tattoosmap.com" | grep -qi "PLAN YOUR NEXT TATTOO"; then
    echo "Deployment is live!"
    break
  fi
  sleep 10
done

echo "=== HOMEPAGE ELEVATE ===" && curl -s "https://tattoosmap.com" | grep -i "elevate"
echo "=== HOMEPAGE BROKEN LINK ===" && curl -s "https://tattoosmap.com" | grep "dermatologists-guide-aftercare"
echo "=== HOMEPAGE FINE LINE ===" && curl -s "https://tattoosmap.com" | grep "fine line"
echo "=== HOMEPAGE H1 ===" && curl -s "https://tattoosmap.com" | grep "sr-only"
echo "=== HOMEPAGE OG IMAGE ===" && curl -s "https://tattoosmap.com" | grep -o 'og:image" content="[^"]*"'
echo "=== HOMEPAGE PLAN ===" && curl -s "https://tattoosmap.com" | grep -i "PLAN YOUR NEXT TATTOO"
echo "=== FOOTER INSTAGRAM ===" && curl -s "https://tattoosmap.com" | grep -o 'href="https://instagram[^"]*"'
echo "=== FOOTER ABOUT ===" && curl -s "https://tattoosmap.com" | grep -o 'href="/about"'
echo "=== GALLERY OG IMAGE ===" && curl -s "https://tattoosmap.com/gallery" | grep -o 'og:image" content="[^"]*"'
echo "=== ARTISTS TWITTER TITLE ===" && curl -s "https://tattoosmap.com/artists" | grep -o 'twitter:title" content="[^"]*"'
echo "=== SITEMAP ABOUT ===" && curl -s "https://tattoosmap.com/sitemap.xml" | grep "about"
echo "=== SOFT 404 BLOG ===" && curl -s -o /dev/null -w "%{http_code}" "https://tattoosmap.com/blog/this-does-not-exist-xyz123"
echo ""
echo "=== SOFT 404 GALLERY ===" && curl -s -o /dev/null -w "%{http_code}" "https://tattoosmap.com/gallery/this-does-not-exist-xyz123"
echo ""
echo "=== SOFT 404 AFTERCARE ===" && curl -s -o /dev/null -w "%{http_code}" "https://tattoosmap.com/blog/dermatologists-guide-aftercare"
echo ""
echo "=== IN RANKED CHECK ===" && curl -s "https://tattoosmap.com/blog" | grep -i "in ranked"
echo "=== BLOG INDEX CANONICAL ===" && curl -s "https://tattoosmap.com/blog" | grep -o '<link rel="canonical" href="[^"]*"'
echo "=== VIRGIN MARY TITLE ===" && curl -s "https://tattoosmap.com/gallery/virgin-mary-tattoo-design-95ft" | grep -o '<title>.*</title>'
