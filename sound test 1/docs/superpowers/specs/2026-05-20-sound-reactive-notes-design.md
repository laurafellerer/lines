# Sound-Reactive Musical Notes

## Overview
Single HTML file that listens to microphone input and animates two SVG notes in real time. Notes sit static on a music staff by default; when sound is detected they animate, and when silence returns they ease back organically.

## File Structure
- `index.html` — single file, no dependencies

## Architecture

### Sound Pipeline
1. `getUserMedia` captures microphone audio
2. Audio routed through `AudioContext` + `AnalyserNode`
3. Every `requestAnimationFrame` frame, RMS volume computed from frequency data
4. If RMS > threshold → "sound active" state
5. Hold timer (~200ms) prevents flickering on brief silences
6. When sound stops for hold duration → "silent" state → notes ease back

### Tunable Parameters
- Volume threshold (default: 0.02)
- Hold time (default: 200ms)
- Note1 max displacement (30-60px up)
- Note1 max rotation (±10-20°)
- Note2 wander radius (~80px random walk)
- Easing return duration (600ms)

## Animation

### Note1 (top note)
| State | Transform |
|-------|-----------|
| Silent | `translate(0, 0) rotate(0deg)` |
| Sound active | `translate(0, -Y) rotate(±deg)` with per-frame jitter |
| Silent → Sound | Immediate jitter kicks in |
| Sound → Silent | CSS transition eases back over 600ms |

### Note2 (bottom note)
| State | Transform |
|-------|-----------|
| Silent | `translate(0, 0)` |
| Sound active | `translate(randomX, randomY)` — random walk within radius |
| Sound → Silent | CSS transition eases back over 600ms |

### Easing
- `cubic-bezier(0.34, 1.56, 0.64, 1)` — slight overshoot then settle for organic feel

## Implementation
- Inline SVG directly in HTML (staff lines, Note1, Note2)
- CSS `.dancing` class triggers transitions
- JavaScript animation loop: set `transform` on active, let CSS transitions handle the return
- Mic permission requested on page load via `getUserMedia`
