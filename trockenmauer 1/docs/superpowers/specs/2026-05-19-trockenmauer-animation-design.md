# TROCKENMAUER Stone Animation — Design Spec

## Overview

A single-page webtool that animates the word **TROCKENMAUER** (12 letters) being assembled like a dry stone wall. Letters start as rough stone blocks off-screen, stack into a tower, then collapse and roll into a staggered wall layout. The word is revealed and the animation loops.

## Technology

Pure HTML + CSS + JavaScript (vanilla, no libraries). Animation driven by `requestAnimationFrame` for position updates and CSS `transition`/`transform` for rotations and reveals.

## Layout

- Two staggered rows forming a dry wall pattern:
  - Row 1 (top): T, C, N, A, E
  - Row 2 (bottom, offset half-width): R, O, K, E, M, U, R
- Each stone has slight random Y offset within its row for organic feel
- Some stones protrude more than others horizontally

## Animation Phases (moderate pace, ~12–15s total)

| Phase | Timing | Description |
|-------|--------|-------------|
| Entry | 0s–3s | 2 stones enter from left/right sides; 10 stones fall from top. All stack into a rough column at center, landing with bounce. |
| Collapse & Roll | 3s–8s | Column wobbles, then collapses. Stones slide/roll along curved paths to staggered final positions. |
| Letter Reveal | 8s–10s | ~half the stones rotate to reveal their letter face; others already show their letter. CSS `transform: rotateY()` with 0.5s ease-in-out. |
| Pause & Loop | 10s–12s/15s | Full word visible for ~5s. Stones briefly crumble/fade out, then loop restarts. |

## Stone Styling

- **Shape:** Rough rectangles via asymmetric `border-radius` + `clip-path` for jagged edges
- **Colors:** Warm stone palette — grays, browns, ochre, terra cotta. Random shade per stone.
- **Texture:** CSS gradient + noise/grunge pseudo-element overlay
- **Size:** ~80×100px base, ±10% random variation
- **Letter:** Chiseled look — inset `text-shadow`, dark drop shadow
- **Rotating stones:** `transform-origin: center`, CSS transition for smooth reveal

## Architecture

- `index.html` — single page with 12 stone `<div>` elements
- `style.css` — stone styling, wall layout, animation keyframes
- `script.js` — animation controller: entry sequencing, position tracking, phase timing, loop orchestration
- Each stone is a data object: `{ element, startPos, stackPos, finalPos, letter, rotateToReveal, entrySide }`

## Entry Directions

- Stone 1–2: slide in from left/right edges
- Stones 3–12: fall from above viewport, staggered delays (~0.2s apart)

## Loop Behavior

- Auto-plays on page load
- After pause phase, stones briefly exit (scatter/fade), then animation restarts
- Infinite loop with no user interaction required
