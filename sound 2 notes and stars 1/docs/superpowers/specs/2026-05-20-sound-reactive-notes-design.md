# Sound-Reactive Notes & Stars Animation

## Overview

A single-page web app that displays a musical notation SVG with notes and stars. When the user screams into their microphone, the notes animate from a compact static layout to an extended expressive layout. When sound stops, they smoothly return. Stars pulse/twinkle during sound.

## Architecture

Single `index.html` file — no build tools, no dependencies. Inline SVG, CSS, and JavaScript.

- **SVG**: extracted from the static SVG (`noten_sterne_statisch.svg`), embedded directly in HTML
- **CSS**: two state classes (`.rest` / `.screaming`) with CSS transitions on all animatable SVG elements
- **JS**: audio capture via `getUserMedia` + `AnalyserNode`, toggles `.screaming` class on `<body>` based on volume threshold

## Audio Pipeline

1. **User gesture**: On first click/tap, request mic via `navigator.mediaDevices.getUserMedia`
2. **Audio context**: `AudioContext` + `AnalyserNode` (FFT 256) connected to mic stream
3. **Frame loop**: On `requestAnimationFrame`, read RMS volume from analyser
4. **Threshold logic**: RMS >= threshold → add `.screaming` class. RMS < threshold for 300ms → remove `.screaming` class (hysteresis prevents flickering)
5. **Threshold**: Fixed value tuned so normal speech doesn't trigger but a loud scream does

## SVG State Management

- Note heads use `<ellipse>` elements (so `rx`/`ry` can transition; at rest `ry` equals `rx` making it appear circular)
- Each note element (ellipse + stem rect) gets `transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1)`
- `.screaming` class overrides `cy`, `ry` (ellipse) and `y`, `height` (stem rect) to movement SVG values
- The same transition applies in both directions (entering and returning)
- Mid-transition re-trigger naturally interpolates from current position to new target

### Notes animation targets (static → movement)

- **n1**: ellipse `cy` 978 → 1114 (drops), `ry` 11 → 40, stem `y` unchanged, `height` 55 → 193 (extends down)
- **n2** (double note): ellipses `cy` 947 → 1166, `ry` 11 → 50, stems `height` 55 → 240, bar `height` 10 → 43
- **n3**: ellipse `cy` 993 → 968 (rises), `ry` 11 → 37, stem `y` 940 → 792 (stretches up), `height` 55 → 179
- **n4**: ellipse `cy` 977 → 1155 (drops), `ry` 11 → 49, stem `y` unchanged, `height` 55 → 236
- **n5**: ellipse `cy` 961 → 925 (rises), `ry` 11 → 47, stem `y` 907 → 699 (stretches up), `height` 55 → 229
- **n6**: ellipse `cy` 993 → 1193 (drops), `ry` 11 → 53, stem `y` unchanged, `height` 55 → 258
- **n7** (double note): ellipses `cy` 964 → 928, `ry` 11 → 47, stems `y` 910 → 703, `height` 55 → 228, bar `y` 899 → 659, `height` 10 → 40
- **n8**: ellipse `cy` 994 → 966 (rises), `ry` 11 → 40, stem `y` 941 → 776 (stretches up), `height` 55 → 193

## Star Animation (s1-s5)

- Stars are `<polygon>` elements with pink fill (`#ff44d0` or `#ff4462`)
- CSS `@keyframes twinkle` alternates `opacity` between 0.3 and 1.0 and `transform: scale()` between 0.8 and 1.1
- Stars have `animation-play-state: paused` by default; `.screaming` sets it to `running`
- Each star gets a different `animation-delay` so they twinkle asynchronously

## UI / Layout

- SVG `viewBox="0 0 1080 1920"` (portrait aspect ratio)
- Centered in viewport, scaled to fit via `max-width: 100%; max-height: 100vh; object-fit: contain`
- Initial state shows a translucent "Tap to start" overlay — disappears on first interaction
- Works on mobile and desktop

## Edge Cases

| Scenario | Handling |
|---|---|
| No mic available | Show "Microphone not found" message |
| Mic permission denied | Show "Please allow microphone access" with retry button |
| Autoplay policy | Mic starts on first user gesture (tap/click) |
| Tab hidden | Stop audio processing; resume on visibility change |
| Repeated screams | CSS transitions handle smooth re-trigger automatically |
| Mobile sizing | `viewport` meta tag, touch events trigger mic start |
