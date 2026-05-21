# Sound-Reactive Notes & Stars Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page web app that displays an SVG notation with notes and stars, where screaming triggers smooth note-stretching animation and star twinkling, with audio capture via browser mic.

**Architecture:** Single `index.html` with inline SVG (all note/staff/star elements), CSS for two-state transitions and star keyframes, and JS for AudioContext-based volume detection and class toggling.

**Tech Stack:** Vanilla HTML5, CSS3, ES6, Web Audio API (getUserMedia + AnalyserNode)

---

### Task 1: HTML Shell + Embedded SVG

**Files:**
- Create: `index.html`
- Reference: `noten_sterne_statisch.svg` (for element coordinates and structure)

- [ ] **Step 1: Create `index.html` with DOCTYPE and viewport meta**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Sound Notes</title>
</head>
<body>
</body>
</html>
```

- [ ] **Step 2: Embed the SVG inline inside `<body>`, centered in a container**

The SVG contains:
- 5 staff lines (horizontal rects, y: 401, 416, 431, 446, 462)
- 8 note groups (n1-n8), each with `<ellipse>` (not circle — for CSS transition) and stem `<rect>`
- n2 and n7 also have a connecting bar `<rect>`
- 5 star groups (s1-s5) as `<polygon>` elements

```html
<div id="container">
  <svg viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        .st0 { fill: #050402; }
        .st0, .st1, .st2 { stroke: #000; stroke-miterlimit: 10; }
        .st1 { fill: #ff44d0; }
        .st2 { fill: #ff4462; }
      </style>
    </defs>
    <!-- Staff lines -->
    <g id="staff">
      <rect class="st0" x="539.02" y="401.38" width="1.13" height="1079.5" transform="translate(1480.71 401.55) rotate(90)"/>
      <rect class="st0" x="539.02" y="416.57" width="1.13" height="1079.5" transform="translate(1495.9 416.74) rotate(90)"/>
      <rect class="st0" x="539.27" y="431.76" width="1.13" height="1079.5" transform="translate(1511.34 431.68) rotate(90)"/>
      <rect class="st0" x="539.02" y="446.95" width="1.13" height="1079.5" transform="translate(1526.28 447.12) rotate(90)"/>
      <rect class="st0" x="539.27" y="462.14" width="1.13" height="1079.5" transform="translate(1541.72 462.05) rotate(90)"/>
    </g>
    <!-- Notes in rest state (ellipse with ry=rx so it appears circular) -->
    <g id="n1">
      <ellipse class="st0" cx="170.12" cy="978.49" rx="11.32" ry="11.32"/>
      <rect class="st0" x="180" y="924.5" width="1.43" height="54.79"/>
    </g>
    <g id="n2">
      <ellipse class="st0" cx="953.03" cy="947.84" rx="11.32" ry="11.32"/>
      <rect class="st0" x="962.91" y="893.85" width="1.43" height="54.79"/>
      <ellipse class="st0" cx="998.94" cy="947.84" rx="11.32" ry="11.32"/>
      <rect class="st0" x="1008.82" y="893.85" width="1.43" height="54.79"/>
      <rect class="st0" x="962.91" y="883.24" width="47.35" height="9.72"/>
    </g>
    <g id="n3">
      <ellipse class="st0" cx="864.01" cy="993.68" rx="11.32" ry="11.32"/>
      <rect class="st0" x="873.89" y="939.69" width="1.43" height="54.79"/>
    </g>
    <g id="n4">
      <ellipse class="st0" cx="703.11" cy="977.37" rx="11.32" ry="11.32"/>
      <rect class="st0" x="712.99" y="923.37" width="1.43" height="54.79"/>
    </g>
    <g id="n5">
      <ellipse class="st0" cx="542.21" cy="961.03" rx="11.32" ry="11.32"/>
      <rect class="st0" x="552.09" y="907.04" width="1.43" height="54.79"/>
    </g>
    <g id="n6">
      <ellipse class="st0" cx="381.31" cy="993.12" rx="11.32" ry="11.32"/>
      <rect class="st0" x="391.19" y="939.13" width="1.43" height="54.79"/>
    </g>
    <g id="n7">
      <ellipse class="st0" cx="259.49" cy="964.07" rx="11.32" ry="11.32"/>
      <rect class="st0" x="269.37" y="910.08" width="1.43" height="54.79"/>
      <ellipse class="st0" cx="305.4" cy="964.07" rx="11.32" ry="11.32"/>
      <rect class="st0" x="315.29" y="910.08" width="1.43" height="54.79"/>
      <rect class="st0" x="269.37" y="899.47" width="47.35" height="9.72"/>
    </g>
    <g id="n8">
      <ellipse class="st0" cx="80.22" cy="994.83" rx="11.32" ry="11.32"/>
      <rect class="st0" x="90.1" y="940.84" width="1.43" height="54.79"/>
    </g>
    <!-- Stars -->
    <g id="s1">
      <polygon class="st1" points="928.05 928.33 910.28 929.89 906.27 947.28 899.29 930.86 881.52 932.42 894.98 920.71 888 904.29 903.3 913.47 916.75 901.76 912.75 919.15 928.05 928.33"/>
    </g>
    <g id="s2">
      <polygon class="st1" points="778.91 1034.3 768.06 1012.45 753.32 1016.47 761.36 998.95 750.51 977.1 766.32 988.12 774.35 970.6 776.09 994.93 791.91 1005.95 777.17 1009.97 778.91 1034.3"/>
    </g>
    <g id="s3">
      <polygon class="st2" points="498.52 948.39 472.53 960.84 477.11 980.79 456.48 968.54 430.5 980.99 443.72 960.97 423.09 948.72 451.9 948.59 465.13 928.57 469.7 948.52 498.52 948.39"/>
    </g>
    <g id="s4">
      <polygon class="st1" points="470.12 951.08 452.35 952.65 448.34 970.03 441.36 953.61 423.59 955.18 437.05 943.47 430.07 927.05 445.37 936.23 458.82 924.52 454.82 941.9 470.12 951.08"/>
    </g>
    <g id="s5">
      <polygon class="st2" points="68.45 957.63 47.52 958.4 42.96 976.64 34.58 958.87 13.65 959.63 29.4 947.88 21.03 930.1 39.14 940.62 54.89 928.87 50.34 947.12 68.45 957.63"/>
    </g>
  </svg>
</div>
```

- [ ] **Step 3: Add the "Tap to start" overlay inside `<body>` but above the SVG container**

```html
<div id="overlay">
  <p>Tap to start</p>
</div>
```

- [ ] **Step 4: Open in browser to verify SVG renders correctly**

Run: open as file:// URL or via a local server `python3 -m http.server 8000`

Expected: centered SVG with staff lines, note heads (black circles with short stems), and pink stars, plus a "Tap to start" overlay.

---

### Task 2: CSS Styles, Transitions, and Animations

**Files:**
- Modify: `index.html` (add `<style>` block in `<head>`)

- [ ] **Step 1: Add base layout CSS inside `<style>`**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
}
#container {
  max-width: 100%;
  max-height: 100vh;
  aspect-ratio: 1080 / 1920;
}
svg {
  display: block;
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 2: Add transition rule for all note elements**

```css
#n1 ellipse, #n1 rect,
#n2 ellipse, #n2 rect,
#n3 ellipse, #n3 rect,
#n4 ellipse, #n4 rect,
#n5 ellipse, #n5 rect,
#n6 ellipse, #n6 rect,
#n7 ellipse, #n7 rect,
#n8 ellipse, #n8 rect {
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
```

- [ ] **Step 3: Add `.screaming` state overrides with movement SVG values**

```css
.screaming #n1 ellipse { cy: 1114.96; ry: 39.92; }
.screaming #n1 rect { height: 193.29; }

.screaming #n2 ellipse { cy: 1166.5; ry: 49.63; }
.screaming #n2 rect:first-of-type { height: 240.27; }
.screaming #n2 rect:nth-of-type(2) { height: 240.27; }
.screaming #n2 rect:last-of-type { height: 42.61; }

.screaming #n3 ellipse { cy: 968.05; ry: 36.95; }
.screaming #n3 rect { y: 791.77; height: 178.9; }

.screaming #n4 ellipse { cy: 1155.75; ry: 48.71; }
.screaming #n4 rect { height: 235.83; }

.screaming #n5 ellipse { cy: 925.07; ry: 47.27; }
.screaming #n5 rect { y: 699.56; height: 228.87; }

.screaming #n6 ellipse { cy: 1193.44; ry: 53.31; }
.screaming #n6 rect { height: 258.1; }

.screaming #n7 ellipse { cy: 928.23; ry: 47.16; }
.screaming #n7 rect:first-of-type { y: 703.27; height: 228.31; }
.screaming #n7 rect:nth-of-type(2) { y: 703.27; height: 228.31; }
.screaming #n7 rect:last-of-type { y: 659.07; height: 40.49; }

.screaming #n8 ellipse { cy: 966.22; ry: 39.93; }
.screaming #n8 rect { y: 775.73; height: 193.32; }
```

- [ ] **Step 4: Add star twinkle keyframes and pause/play control**

```css
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
#s1 polygon, #s2 polygon, #s3 polygon, #s4 polygon, #s5 polygon {
  animation: twinkle 1.5s ease-in-out infinite;
  animation-play-state: paused;
}
.screaming #s1 polygon { animation-delay: 0s; animation-play-state: running; }
.screaming #s2 polygon { animation-delay: 0.3s; animation-play-state: running; }
.screaming #s3 polygon { animation-delay: 0.6s; animation-play-state: running; }
.screaming #s4 polygon { animation-delay: 0.9s; animation-play-state: running; }
.screaming #s5 polygon { animation-delay: 1.2s; animation-play-state: running; }
```

- [ ] **Step 5: Add overlay styling**

```css
#overlay {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font: 2rem/1.4 system-ui, sans-serif;
  cursor: pointer;
  z-index: 10;
}
#overlay.hidden { display: none; }
```

- [ ] **Step 6: Test by manually adding `screaming` class to `<body>` in dev tools**

Open browser dev tools, add `class="screaming"` to `<body>`. All notes should smoothly morph to their extended positions, stars should start twinkling. Remove the class — everything should smoothly return.

---

### Task 3: Audio Capture

**Files:**
- Modify: `index.html` (add `<script>` block before `</body>`)

- [ ] **Step 1: Add JavaScript that requests mic on tap and sets up AudioContext**

```html
<script>
let audioContext = null;
let analyser = null;
let dataArray = null;
let isListening = false;
let isScreaming = false;
let quietStartTime = 0;

const THRESHOLD = 0.25;   // RMS threshold for scream detection
const QUIET_DELAY = 300; // ms of quiet before returning
const FFT_SIZE = 256;

const overlay = document.getElementById('overlay');

async function startAudio() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.fftSize);
    isListening = true;
    overlay.classList.add('hidden');
    listen();
  } catch (err) {
    if (err.name === 'NotFoundError') {
      overlay.textContent = 'Microphone not found';
    } else if (err.name === 'NotAllowedError') {
      overlay.textContent = 'Please allow microphone access';
      overlay.onclick = startAudio;
    } else {
      overlay.textContent = 'Error: ' + err.message;
    }
  }
}

overlay.addEventListener('click', startAudio);
</script>
```

- [ ] **Step 2: Test that clicking overlay triggers mic permission prompt**

Open in browser, click "Tap to start". Browser should show mic permission dialog.

---

### Task 4: Volume Detection + Class Toggling

**Files:**
- Modify: `index.html` (add the `listen()` and volume detection functions in the existing `<script>`)

- [ ] **Step 1: Add the visual callback and the volume-checking function**

```javascript
function getRMS() {
  analyser.getByteTimeDomainData(dataArray);
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const val = (dataArray[i] / 128) - 1;
    sum += val * val;
  }
  return Math.sqrt(sum / dataArray.length);
}

function listen() {
  if (!isListening) return;
  requestAnimationFrame(listen);

  const rms = getRMS();
  const now = performance.now();

  if (rms >= THRESHOLD) {
    document.body.classList.add('screaming');
    isScreaming = true;
    quietStartTime = now;
  } else if (isScreaming) {
    if (quietStartTime === 0) {
      quietStartTime = now;
    } else if (now - quietStartTime >= QUIET_DELAY) {
      document.body.classList.remove('screaming');
      isScreaming = false;
      quietStartTime = 0;
    }
  } else {
    quietStartTime = 0;
  }
}
```

- [ ] **Step 2: Handle tab visibility — pause/resume processing**

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    isListening = false;
  } else if (audioContext) {
    isListening = true;
    listen();
  }
});
```

- [ ] **Step 3: Full integration test**

Open in browser, tap to start, scream. Notes should smoothly extend and stars should twinkle. Stop screaming — notes should smoothly return after ~300ms of quiet.

---

### Task 5: Manual Testing & Tuning

**Files:** (no file changes)

- [ ] **Step 1: Test scream detection at various volumes**

Open `index.html` (via a local server or file://). Click to start. Test:
- Normal speaking voice: should NOT trigger animation
- Loud scream: should trigger extension and star twinkle
- Short scream (~0.5s): should trigger and then return after quiet delay
- Scream mid-return: should smoothly redirect back to extension
- Repeated screams: should work consistently

If threshold is too sensitive or not sensitive enough, adjust `THRESHOLD` value (0.25 is a reasonable starting point).

- [ ] **Step 2: Test mobile**

Open on a phone browser. Layout should be centered and scale correctly. Tap to start should trigger mic permission.

- [ ] **Step 3: Test error states**

- Deny mic permission: should show "Please allow microphone access" with retry
- Device without mic (e.g., some desktops): should show "Microphone not found"

---

### Task 6: Polish (if needed)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Tune transition easing or duration if motion doesn't feel right**

Adjust the `cubic-bezier` values or `0.8s` duration in the CSS transition rule to taste.

- [ ] **Step 2: Add a subtle color or opacity shift to the notes during animation** (optional stretch goal)

```css
.screaming #n1 ellipse,
.screaming #n1 rect { 
  /* subtle highlight, e.g. slightly lighter fill */ 
}
```

- [ ] **Step 3: Save final `index.html` to project directory**

The final file lives at `index.html` in the project root.
