# About Section Redesign & Style Guide Consistency

## Overview
Update the portfolio's about section with new workshop content, ensure consistent linking from all exercise pages, and confirm the existing style guide is uniformly applied.

## Changes

### 1. About Section Content (index.html `#about`)
- Left column: keep existing image placeholder
- Right column: replace current text with:
  - **H1**: "Interaction Design & AI" — Instrument Sans, ~2.5rem, weight 400
  - **H2**: "Workshop by Rocco Modugno & Andrea Maffei" — Instrument Sans, ~1.3rem, weight 400
  - **H3**: "On this page you'll find some outcomes of the workshop: Experimental interactive works exploring hand tracking, generative patterns, sound-reactive animations, and typographic animation." — Instrument Serif, italic, ~1.1rem, line-height 1.8
- Remove old `<p>` tag, add proper heading elements

### 2. About Button Linking
- **Exercise pages (1–5)**: Change ABOUT button `href="index.html"` → `href="index.html#about"`
- **index.html JS**: On page load, check if URL hash is `#about` → auto-show the about section (so arrivals from exercise pages land correctly)

### 3. Style Guide Consistency
The existing CSS (`main.css`) already implements the full style guide:
- Typography: Instrument Sans (body, headings), Instrument Serif (italic)
- Colors: #4700FF (buttons bg), #FF00FF (hover/accent), black, white
- Button states: static (#4700FF bg + white font), hover (#4700FF bg + #FF00FF font), active (#FF00FF bg + white font)
- No CSS changes needed

## Files to Modify
1. `index.html` — about section content, JS hash handling
2. `exercise1.html` — ABOUT button href
3. `exercise2.html` — ABOUT button href
4. `exercise3.html` — ABOUT button href
5. `exercise4.html` — ABOUT button href
6. `exercise5.html` — ABOUT button href
