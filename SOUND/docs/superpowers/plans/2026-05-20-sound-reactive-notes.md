# Sound-Reactive Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Single HTML file with two SVG notes that animate on microphone input and ease back on silence.

**Architecture:** Inline SVG (staff lines + two notes), CSS transitions for smooth return, JS animation loop driven by `AudioContext` + `AnalyserNode` volume detection.

**Tech Stack:** Vanilla HTML/CSS/JS, Web Audio API, WebRTC `getUserMedia`

---

### Task 1: Create HTML shell with inline SVG

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write the HTML file with SVG from user's asset**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sound Reactive Notes</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #f5f0e8;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: system-ui, sans-serif;
  }
  .container {
    width: 90%;
    max-width: 1100px;
  }
  svg {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
</head>
<body>
<div class="container">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080.75 94.41">
    <defs>
      <style>
        .cls-1 { fill: #050402; }
        .cls-1, .cls-2 { stroke: #000; stroke-miterlimit: 10; }
      </style>
    </defs>
    <g id="lines">
      <rect class="cls-1" x="539.68" y="-507.16" width="1.13" height="1079.5" transform="translate(572.84 -507.66) rotate(90)"/>
      <rect class="cls-1" x="539.68" y="-491.97" width="1.13" height="1079.5" transform="translate(588.03 -492.47) rotate(90)"/>
      <rect class="cls-1" x="539.94" y="-476.78" width="1.13" height="1079.5" transform="translate(603.47 -477.53) rotate(90)"/>
      <rect class="cls-1" x="539.68" y="-461.59" width="1.13" height="1079.5" transform="translate(618.41 -462.09) rotate(90)"/>
      <rect class="cls-1" x="539.94" y="-446.4" width="1.13" height="1079.5" transform="translate(633.85 -447.15) rotate(90)"/>
    </g>
    <g id="Note1">
      <path class="cls-2" d="M191.12.5v48.48c-1.94-3.46-5.63-5.81-9.88-5.81-6.25,0-11.32,5.07-11.32,11.32s5.07,11.32,11.32,11.32,10.86-4.64,11.28-10.52h.04V.5h-1.43Z"/>
    </g>
    <g id="note2">
      <path class="cls-2" d="M815.39,15.69v48.48c-1.94-3.46-5.63-5.81-9.88-5.81-6.25,0-11.32,5.07-11.32,11.32s5.07,11.32,11.32,11.32,10.86-4.64,11.28-10.52h.04V15.69h-1.43Z"/>
    </g>
  </svg>
</div>
<script>
</script>
</body>
</html>
```

- [ ] **Step 2: Verify file is valid**

Open in browser — should show the static SVG with staff lines and two notes.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add HTML shell with inline SVG"
```

### Task 2: Add CSS transitions and note transform classes

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add note IDs and CSS transitions**

Add IDs to the note `<g>` elements for JS targeting.

```html
<g id="Note1" class="note note-1">
```

```html
<g id="note2" class="note note-2">
```

Add CSS inside the `<style>` block:

```css
.note {
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
}
.note.dancing {
  transition: none;
}
```

- [ ] **Step 2: Verify in browser**

Open file — notes should be visible and styled. No animation yet since no JS logic.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add note classes and CSS transitions"
```

### Task 3: Implement mic capture and volume detection

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add JS for mic setup**

Inside the `<script>` tag:

```javascript
const THRESHOLD = 0.02;
const HOLD_TIME = 200;

let audioContext, analyser, dataArray;
let isSoundActive = false;
let silenceTimer = null;

async function initAudio() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  } catch (e) {
    console.error('Mic access denied:', e);
  }
}

function getVolume() {
  if (!analyser) return 0;
  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  for (const v of dataArray) sum += v;
  const rms = Math.sqrt(sum / dataArray.length) / 255;
  return rms;
}

initAudio();
```

- [ ] **Step 2: Verify no console errors**

Open in browser, accept mic permission prompt. Check console for errors.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add mic capture and volume detection"
```

### Task 4: Implement Note1 animation (up + rotate + dance)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add Note1 animation logic**

```javascript
const note1 = document.getElementById('Note1');
let note1Y = 0, note1Rot = 0;

function animateNote1(soundActive) {
  if (soundActive) {
    note1.classList.remove('dancing');
    const targetY = -(30 + Math.random() * 30);
    const targetRot = (Math.random() - 0.5) * 20;
    note1Y += (targetY - note1Y) * 0.3;
    note1Rot += (targetRot - note1Rot) * 0.3;
    note1.setAttribute('transform', `translate(0, ${note1Y}) rotate(${note1Rot}, 191, 30)`);
  } else {
    note1.classList.remove('dancing');
    note1Y = 0;
    note1Rot = 0;
    note1.setAttribute('transform', `translate(0, 0) rotate(0, 191, 30)`);
  }
}
```

Rotate origin `191, 30` is roughly the center of Note1's path bounding box.

- [ ] **Step 2: Verify note moves**

Add a temporary test button or console test call. Note1 should translate up and rotate on command.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Note1 animation"
```

### Task 5: Implement Note2 animation (down + random wander)

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add Note2 animation logic**

```javascript
const note2 = document.getElementById('note2');
let note2X = 0, note2Y = 0;

function animateNote2(soundActive) {
  if (soundActive) {
    note2.classList.remove('dancing');
    const targetX = (Math.random() - 0.5) * 80;
    const targetY = 20 + Math.random() * 60;
    note2X += (targetX - note2X) * 0.2;
    note2Y += (targetY - note2Y) * 0.2;
    note2.setAttribute('transform', `translate(${note2X}, ${note2Y})`);
  } else {
    note2X = 0;
    note2Y = 0;
    note2.setAttribute('transform', `translate(0, 0)`);
  }
}
```

- [ ] **Step 2: Verify in browser**

Note2 should wander downward randomly when sound is active.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Note2 random wander animation"
```

### Task 6: Wire up animation loop with sound state machine

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add main animation loop with hold timer**

```javascript
function animate() {
  const volume = getVolume();
  if (volume > THRESHOLD) {
    if (!isSoundActive) {
      isSoundActive = true;
    }
    clearTimeout(silenceTimer);
    silenceTimer = null;
  } else if (isSoundActive && !silenceTimer) {
    silenceTimer = setTimeout(() => {
      isSoundActive = false;
    }, HOLD_TIME);
  }

  animateNote1(isSoundActive);
  animateNote2(isSoundActive);
  requestAnimationFrame(animate);
}

animate();
```

- [ ] **Step 2: Full test in browser**

Open the page, allow mic access, make sounds. Note1 should jump up/rotate/dance, Note2 should wander down/random. When you stop talking, both should ease back to their original positions organically over ~600ms.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: wire animation loop with sound state"
```

### Task 7: Polish — visual tweaks and threshold tuning

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Adjust threshold for sensitivity**

Test the page with real mic input. If too sensitive (animates on background noise) or not sensitive enough, adjust `THRESHOLD`. A good starting range is 0.02-0.05.

- [ ] **Step 2: Add visual polish if needed**

Consider adding:
- A subtle glow/shadow on the notes when active
- A microphone status indicator
- A minimum animation amplitude to ensure visible motion

Keep it minimal. Only add what feels necessary.

- [ ] **Step 3: Final test and commit**

```bash
git add index.html
git commit -m "chore: tune sensitivity and polish"
```
