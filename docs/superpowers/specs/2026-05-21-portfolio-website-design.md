# Portfolio Website Design

## Overview
A single-page portfolio website with a minimalist experimental aesthetic — playful, hand-drawn, slightly surreal, fluid/animated. Acts as a hub linking to 5 existing exercise projects.

## Architecture

### Approach: Hybrid SPA + Standalone Exercises
- `index.html` is a single-page app for HOME / ABOUT / EXERCISES sections with smooth internal transitions
- Each exercise is a standalone HTML file (wrapper pages linking to existing project folders)
- Shared `/assets/css/main.css` and `/assets/js/main.js` provide cursor, nav, and global styling across all pages
- Existing exercise folders remain untouched

### Folder Structure
```
website/
├── index.html                     # Main SPA: HOME + ABOUT + EXERCISES
├── exercise1.html                 # Ricetta (placeholder)
├── exercise2.html                 # Wrapper → pattern exercise 1/index.html
├── exercise3.html                 # Wrapper → trockenmauer 1/index.html
├── exercise4.html                 # Wrapper → sound test 1/index.html
├── exercise5.html                 # Wrapper → dinosaur 1/index.html
├── assets/
│   ├── css/
│   │   └── main.css               # Shared styles
│   ├── js/
│   │   ├── main.js                 # Cursor, navigation, transitions
│   │   └── stars.js                # Floating stars animation
│   ├── svg/                        # SVG assets (future)
│   └── images/                     # Image assets (future)
├── docs/superpowers/specs/         # Design specs
└── (existing exercise folders)     # Untouched
```

## Pages & Layout

### index.html (Main SPA)
Three sections toggled via JavaScript:

1. **HOME** (default)
   - Full viewport, white background
   - Centered composition with site title in clean sans-serif
   - 4–5 floating magenta (#FF00FF) stars with slow keyframe animations
   - Navigation in top-right corner: ABOUT | EXERCISES
   - Grain/noise overlay pseudo-element for texture

2. **ABOUT**
   - Triggered by nav click; homepage fades out, about fades in
   - Asymmetrical layout: image (placeholder) on left, text on right
   - Image tilts slightly, tilts more on hover
   - Text fades in with delay
   - Close/back button returns to HOME

3. **EXERCISES**
   - Triggered by nav click
   - 5 buttons appear staggered (100–150ms delay each):
     - Ricetta → exercise1.html
     - Pattern Exercise 1 → exercise2.html
     - Trockenmauer 1 → exercise3.html
     - Sound Test 1 → exercise4.html
     - Dinosaur 1 → exercise5.html
   - Each button: #4700FF bg, white text, rounded, hand-drawn CSS look, wobble hover

### Exercise Wrapper Pages (exercise1.html–exercise5.html)
- Include shared CSS/JS for consistent cursor and navigation
- Clean fullscreen layout: title, short description, large content area
- Each wraps its corresponding project in a full-viewport iframe:
  - exercise1.html → placeholder ("Ricetta" — TBD content)
  - exercise2.html → `pattern exercise 1/index.html`
  - exercise3.html → `trockenmauer 1/index.html`
  - exercise4.html → `sound test 1/index.html`
  - exercise5.html → `dinosaur 1/index.html`
- "Back to Exercises" button returns to EXERCISES section
- Smooth fade-in transition on load

## Shared Components

### Custom Cursor
- Default cursor hidden via CSS `cursor: none`
- `<div id="cursor">` with dinosaur SVG as background-image, follows pointer
- Smooth lag via `requestAnimationFrame` + lerp easing (~100ms)
- On hover over links/buttons: scale up 1.2x + #FF00FF drop-shadow glow
- Hidden when mouse leaves window

### Navigation
- Top-right corner: ABOUT and EXERCISES links
- Styled with hand-drawn CSS: handwritten font (Caveat or similar), irregular underline
- Current section highlighted

### Animations
- **Stars**: SVG stars absolutely positioned, each with different `animation-duration` and `animation-delay` for organic floating
- **Page transitions**: ~400ms fade + slide (CSS transitions)
- **Button wobble**: slight rotation oscillation on hover
- **Grain overlay**: fixed pseudo-element with noise pattern at 3–5% opacity

### Color Palette
- Background: #FFFFFF (#F5F5F5 light gray as alternative)
- Accent 1: #FF00FF (magenta — stars, cursor glow, hover effects)
- Accent 2: #4700FF (blue-purple — buttons, interactive elements)
- Text: #000000 (black)
- Secondary text: #333333

### Typography
- Body: clean sans-serif (Inter or system sans-serif)
- Navigation/buttons: handwritten-style (Caveat from Google Fonts, or CSS hand-drawn simulation)

## Performance & Constraints
- No frameworks — vanilla HTML, CSS, JavaScript only
- CSS transitions/animations preferred over JS for motion
- `will-change` on animated elements for GPU acceleration
- Lightweight — no heavy libraries
- Responsive: desktop-first with mobile breakpoints
