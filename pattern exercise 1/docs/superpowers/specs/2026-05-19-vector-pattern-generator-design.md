# Vector Pattern Generator — Design Spec

## Overview
A single-page web tool for generating randomized vector patterns composed of vertical lines of varying lengths, exportable as SVG. Intended for use as web backgrounds.

## Tech Stack
- **Single `index.html` file** — vanilla HTML, CSS, and JavaScript
- No frameworks, no build step, no dependencies
- SVG rendered inline in the browser

## UI Layout
- **Left sidebar**: control panel (sliders, buttons, color picker)
- **Right area**: SVG preview — a square, responsive to container size, centered
- Clean, minimal aesthetic

## Controls
| Control | Type | Range | Default |
|---------|------|-------|---------|
| Columns | Slider | 10–100 | 20 |
| Max fragment length | Slider | 5–100% of square height | 30% |
| Gap height | Slider | 1–20% of square height | 5% |
| Line thickness | Slider | 0.5–3px | 1px |
| Color | Color picker | Any hex/rgba | `#6496ff` |
| Opacity | Slider | 0–100% | 40% |
| Randomize | Button | — | — |
| Export SVG | Button | — | — |

## SVG Generation Logic
1. Determine square size = 500px viewBox (responsive via CSS)
2. Divide width evenly into N columns (based on Columns slider)
3. For each column, generate a vertical stack of fragments from top to bottom:
   - Start at y=0
   - While current y < square height:
     - Generate a random fragment length between 1px dot and max fragment length
     - Draw a `<line>` from current y to current y + fragment length
     - Advance y by fragment length + gap height (gap is uniform across all columns)
   - Fragments fill the entire column height (fragments + gaps = full height)
4. One `<line>` per fragment, uniformly spaced horizontally
5. No border or outline around the square

## Interactivity
- **Sliders**: update SVG in real-time on `input` event
- **Randomize**: re-rolls all line lengths, keeps other parameters
- **Export**: serializes SVG element to XML string → Blob → `pattern.svg` download

## File Structure (output)
```
index.html          — the entire application
docs/superpowers/specs/
  └── 2026-05-19-vector-pattern-generator-design.md
```

## Future Considerations (out of scope for v1)
- More pattern types (horizontal lines, grids, diagonals)
- Preset saving/loading
- Multiple color palettes
- Pattern tiling / repeat controls
