# Ragnarok: The New World — Landing page (Tanger 01)

Static page with no build step. Open `index.html` in a browser.

```
index.html          page markup
style.css           all styles
script.js           all interactions (deferred)
assets/images/      hero.webp, screenshots, og-image.jpg (link preview)
assets/videos/      hero loop + 2 official trailers (load on demand)
```

## Key rules (from the brief)
- One CTA: "Play free on Steam" pointing to `https://store.steampowered.com/app/4212480/Ragnarok_The_New_World/`, with no parameters added
- CTA clicks are pushed to `window.dataLayer` with `cta_position` = hero / steps / final / sticky
- Never write "no pay-to-win", "without paying" or "best MMORPG"

## Deploy with a custom domain
Connect this repo to Netlify or Vercel (no build command, publish directory = `/`), then add the domain in the host's settings.
