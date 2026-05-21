# TROCKENMAUER Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page webtool that animates the word TROCKENMAUER being assembled like a dry stone wall — stones stack into a tower, collapse, roll to staggered positions, and reveal the word.

**Architecture:** Pure HTML + CSS + JavaScript. Animation driven by `requestAnimationFrame` with a time-based state machine controlling per-stone positions. CSS `transition` handles rotation reveals. No libraries.

**Tech Stack:** HTML5, CSS3 (clip-path, gradients, transforms), vanilla JavaScript (requestAnimationFrame, Web Animations API)

---

### Task 1: HTML Structure + Stone Data

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `script.js`

- [ ] **Step 1: Create index.html with 12 stone divs**

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TROCKENMAUER</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="container">
    <div class="stone" data-letter="T"></div>
    <div class="stone" data-letter="R"></div>
    <div class="stone" data-letter="O"></div>
    <div class="stone" data-letter="C"></div>
    <div class="stone" data-letter="K"></div>
    <div class="stone" data-letter="E"></div>
    <div class="stone" data-letter="N"></div>
    <div class="stone" data-letter="M"></div>
    <div class="stone" data-letter="A"></div>
    <div class="stone" data-letter="U"></div>
    <div class="stone" data-letter="E"></div>
    <div class="stone" data-letter="R"></div>
  </div>
  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Run to verify HTML loads (blank page with nothing visible yet because stones are off-screen)**

Run: Open `index.html` in browser. Expected: empty page, no errors in console.

- [ ] **Step 3: Commit**

---

### Task 2: Stone CSS Styling

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Add stone base styles + stone texture**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #2a2520; }

#container { width: 100%; height: 100%; position: relative; }

.stone {
  position: absolute;
  width: 80px;
  height: 100px;
  border-radius: 6px 10px 8px 12px;
  clip-path: polygon(
    2% 0%, 96% 3%, 100% 5%, 98% 95%, 94% 100%, 5% 97%, 0% 93%, 1% 4%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Times New Roman', serif;
  font-size: 48px;
  font-weight: bold;
  color: #3a3025;
  text-shadow:
    0 1px 0 #6a5a45,
    1px 1px 0 #4a3a28,
    -1px -1px 0 #2a2015,
    inset 0 2px 4px rgba(0,0,0,0.3);
  transform-origin: center center;
  will-change: transform, left, top;
}

.stone::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    rgba(0,0,0,0.04) 4px,
    rgba(0,0,0,0.04) 5px
  );
  pointer-events: none;
}
```

- [ ] **Step 2: Add stone color variants via JS-assigned classes**

```css
.stone-color-1 {
  background: linear-gradient(135deg, #8a7a65, #7a6a55);
}
.stone-color-2 {
  background: linear-gradient(135deg, #9a8a75, #7a6a55);
}
.stone-color-3 {
  background: linear-gradient(135deg, #7a6a55, #6a5a45);
}
.stone-color-4 {
  background: linear-gradient(135deg, #a08a6a, #8a7a55);
}
.stone-color-5 {
  background: linear-gradient(135deg, #6a5a45, #5a4a35);
}
.stone-color-6 {
  background: linear-gradient(135deg, #8a7a55, #7a6a45);
}
.stone-color-7 {
  background: linear-gradient(135deg, #9a8a65, #7a5a40);
}
.stone-color-8 {
  background: linear-gradient(135deg, #7a6a5a, #6a5a4a);
}
```

- [ ] **Step 3: Add size variation styles**

```css
.stone-size-sm { width: 72px; height: 90px; font-size: 42px; }
.stone-size-lg { width: 88px; height: 110px; font-size: 52px; }
```

- [ ] **Step 4: Add rotation reveal transition (applied when stone gets the reveal class)**

```css
.stone.reveal-letter {
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: #d4c4a4;
  text-shadow:
    0 1px 0 #f4e4c4,
    1px 1px 0 #6a5a45,
    -1px -1px 0 #2a2015,
    inset 0 2px 4px rgba(0,0,0,0.3);
}
```

- [ ] **Step 5: Open page in browser and inspect stones**

Run: Open `index.html`. Right-click + Inspect to verify stone elements render with stone-like appearance. Expected: colored stone blocks visible if we temporarily give them `left: 400px; top: 300px;`. Verify they look stone-like, then remove that temp CSS.

- [ ] **Step 6: Commit**

---

### Task 3: Animation Controller — Core Loop + Entry Phase

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Define stone data configuration**

```javascript
const LETTERS = ['T','R','O','C','K','E','N','M','A','U','E','R'];
const STONE_W = 80;
const STONE_H = 100;
const TOTAL_DURATION = 15000; // ms for full loop

const stoneData = LETTERS.map((letter, i) => {
  const side = i < 2 ? (i === 0 ? 'left' : 'right') : 'top';
  const stackCol = i % 2 === 0 ? -30 : 30; // slight left/right in stack
  const stackRow = Math.floor(i / 2); // pair index (0-5)
  return {
    letter,
    element: null,
    entrySide: side,
    entryDelay: i * 150, // stagger entries
    stackPos: {
      x: window.innerWidth / 2 + stackCol + (Math.random() - 0.5) * 20,
      y: window.innerHeight / 2 + stackRow * 70 - 200 + (Math.random() - 0.5) * 15
    },
    finalPos: null, // calculated in layout phase
    rotateToReveal: i % 3 !== 0, // ~2/3 rotate
    revealDelay: 8000 + i * 150,
    sizeClass: i % 4 === 0 ? 'stone-size-sm' : i % 5 === 0 ? 'stone-size-lg' : ''
  };
});
```

- [ ] **Step 2: Calculate final staggered positions**

```javascript
function calculateFinalPositions() {
  // Staggered rows:
  // Row 1 (top): T, C, N, A, E  (indices 0, 3, 6, 8, 10)
  // Row 2 (bottom, offset): R, O, K, E, M, U, R (indices 1, 2, 4, 5, 7, 9, 11)
  const topRow = [0, 3, 6, 8, 10];
  const bottomRow = [1, 2, 4, 5, 7, 9, 11];
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  topRow.forEach((idx, col) => {
    const x = cx - 200 + col * 100 + (Math.random() - 0.5) * 15;
    const y = cy - 60 + (Math.random() - 0.5) * 20;
    stoneData[idx].finalPos = { x, y };
  });

  bottomRow.forEach((idx, col) => {
    const x = cx - 280 + col * 93 + (Math.random() - 0.5) * 15;
    const y = cy + 30 + (Math.random() - 0.5) * 20;
    stoneData[idx].finalPos = { x, y };
  });
}
```

- [ ] **Step 3: Calculate off-screen start positions**

```javascript
function calculateStartPositions() {
  stoneData.forEach((stone) => {
    if (stone.entrySide === 'left') {
      stone.startPos = { x: -150, y: window.innerHeight / 2 + (Math.random() - 0.5) * 200 };
    } else if (stone.entrySide === 'right') {
      stone.startPos = { x: window.innerWidth + 150, y: window.innerHeight / 2 + (Math.random() - 0.5) * 200 };
    } else {
      stone.startPos = {
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
        y: -150 - Math.random() * 200
      };
    }
  });
}
```

- [ ] **Step 4: Initialize stone DOM elements**

```javascript
function initStones() {
  const container = document.getElementById('container');
  stoneData.forEach((stone) => {
    const el = document.createElement('div');
    el.className = `stone ${stone.sizeClass}`;
    el.dataset.letter = stone.letter;
    // assign random color class
    el.classList.add(`stone-color-${Math.floor(Math.random() * 8) + 1}`);
    // set start position
    el.style.left = stone.startPos.x + 'px';
    el.style.top = stone.startPos.y + 'px';
    el.textContent = stone.letter;
    container.appendChild(el);
    stone.element = el;
  });
}
```

- [ ] **Step 5: Implement animation state machine + render loop**

```javascript
const PHASE = {
  ENTRY: 'entry',       // 0–3000
  STACK: 'stack',       // 0–3000 (concurrent)
  COLLAPSE: 'collapse', // 3000–8000
  REVEAL: 'reveal',     // 8000–10000
  DISPLAY: 'display',   // 10000–14000
  EXIT: 'exit'          // 14000–15000
};

let animStartTime = 0;
let running = true;

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function lerp(a, b, t) { return a + (b - a) * t; }

function getPhase(elapsed) {
  if (elapsed < 3000) return PHASE.ENTRY;
  if (elapsed < 8000) return PHASE.COLLAPSE;
  if (elapsed < 10000) return PHASE.REVEAL;
  if (elapsed < 14000) return PHASE.DISPLAY;
  return PHASE.EXIT;
}

function updateStonePosition(stone, elapsed) {
  const phase = getPhase(elapsed);
  const el = stone.element;

  if (phase === PHASE.ENTRY) {
    // Move from startPos to stackPos
    const t = Math.max(0, Math.min(1, (elapsed - stone.entryDelay) / 1000));
    const eased = easeOutCubic(t);
    const x = lerp(stone.startPos.x, stone.stackPos.x, eased);
    const y = lerp(stone.startPos.y, stone.stackPos.y, eased);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    if (t >= 0.9) {
      // slight bounce settling
      const bounce = Math.sin((t - 0.9) * 20) * 3 * (1 - (t - 0.9) * 10);
      el.style.top = (y - bounce) + 'px';
    }
  }
  else if (phase === PHASE.COLLAPSE) {
    // Move from stackPos to finalPos
    const stoneElapsed = elapsed - 3000 + stone.entryDelay * 0.5;
    const duration = 4000;
    const t = Math.max(0, Math.min(1, stoneElapsed / duration));
    const eased = easeInOutCubic(t);
    const x = lerp(stone.stackPos.x, stone.finalPos.x, eased);
    // Arc path: go slightly higher during motion
    const arc = Math.sin(t * Math.PI) * (-60 - Math.random() * 40);
    const y = lerp(stone.stackPos.y, stone.finalPos.y, eased) + arc;
    // Slight rotation during roll
    const rotation = t * (Math.random() > 0.5 ? 360 : -360);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.transform = `rotate(${rotation}deg)`;
  }
  else if (phase === PHASE.REVEAL) {
    // Some stones rotate to reveal letter
    if (stone.rotateToReveal && !el.classList.contains('reveal-letter')) {
      el.style.transform = `rotateY(180deg)`;
      el.classList.add('reveal-letter');
    } else if (!stone.rotateToReveal && !el.classList.contains('reveal-letter')) {
      el.classList.add('reveal-letter');
    }
    // Keep in final position
    el.style.left = stone.finalPos.x + 'px';
    el.style.top = stone.finalPos.y + 'px';
  }
  else if (phase === PHASE.DISPLAY) {
    el.style.left = stone.finalPos.x + 'px';
    el.style.top = stone.finalPos.y + 'px';
  }
  else if (phase === PHASE.EXIT) {
    const t = Math.max(0, Math.min(1, (elapsed - 14000) / 1000));
    const eased = easeOutCubic(t);
    const x = lerp(stone.finalPos.x, stone.finalPos.x + (Math.random() - 0.5) * 600, eased);
    const y = lerp(stone.finalPos.y, window.innerHeight + 200, eased);
    const opacity = 1 - eased;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.opacity = opacity;
  }
}

function animate(timestamp) {
  if (!animStartTime) animStartTime = timestamp;
  const elapsed = timestamp - animStartTime;

  if (elapsed >= TOTAL_DURATION) {
    // Loop: reset everything
    animStartTime = timestamp;
    stoneData.forEach((stone) => {
      stone.element.classList.remove('reveal-letter');
      stone.element.style.transform = '';
      stone.element.style.opacity = '1';
      stone.element.style.left = stone.startPos.x + 'px';
      stone.element.style.top = stone.startPos.y + 'px';
    });
    requestAnimationFrame(animate);
    return;
  }

  stoneData.forEach((stone) => updateStonePosition(stone, elapsed));
  requestAnimationFrame(animate);
}

calculateStartPositions();
calculateFinalPositions();
initStones();
requestAnimationFrame(animate);
```

- [ ] **Step 6: Open page — verify stones enter from off-screen and stack in center**

Run: Open `index.html`. Expected: stones fall from top (2 slide from sides), all pile up in a rough column near center.

- [ ] **Step 7: Commit**

---

### Task 4: Collapse Phase — Column Collapses + Stones Roll to Positions

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add column wobble before collapse**

In the `updateStonePosition` COLLAPSE case, before stones start moving to final positions, add a brief wobble at t < 0.15:

```javascript
// Add this right before the arc calculation
if (t < 0.15) {
  const wobble = Math.sin(t / 0.15 * Math.PI * 3) * 8 * (1 - t / 0.15);
  el.style.left = (lerp(stone.stackPos.x, stone.finalPos.x, eased) + wobble + (Math.random() - 0.5) * 4) + 'px';
  el.style.top = (lerp(stone.stackPos.y, stone.finalPos.y, eased) + Math.abs(wobble)) + 'px';
  el.style.transform = `rotate(${wobble * 2}deg)`;
  return;
}
```

- [ ] **Step 2: Verify collapse + roll looks good**

Run: Open browser. Expected: tower wobbles ~0.5s, then stones arc outward to staggered positions with rotation.

- [ ] **Step 3: Commit**

---

### Task 5: Letter Reveal — Stones Show Their Letter

**Files:**
- Modify: `script.js`
- Modify: `style.css`

- [ ] **Step 1: Fix reveal-letter transition on letter color**

In `style.css`, add the reveal letter styling:

```css
.stone.reveal-letter {
  color: #d4c4a4;
  text-shadow:
    0 1px 0 #f4e4c4,
    1px 1px 0 #6a5a45,
    -1px -1px 0 #2a2015,
    inset 0 2px 4px rgba(0,0,0,0.3);
}

.stone.revealed {
  color: #d4c4a4;
  text-shadow:
    0 1px 0 #f4e4c4,
    1px 1px 0 #6a5a45,
    -1px -1px 0 #2a2015,
    inset 0 2px 4px rgba(0,0,0,0.3);
}
```

- [ ] **Step 2: Update reveal logic for rotation + non-rotation stones**

In `script.js`, replace the REVEAL phase logic:

```javascript
else if (phase === PHASE.REVEAL) {
  if (!el.classList.contains('revealed')) {
    if (stone.rotateToReveal) {
      const revealProgress = Math.max(0, Math.min(1, (elapsed - stone.revealDelay) / 600));
      const angle = revealProgress * 180;
      el.style.transform = `rotateY(${angle}deg)`;
      if (revealProgress >= 1) el.classList.add('revealed');
    } else {
      el.classList.add('revealed');
    }
  }
  el.style.left = stone.finalPos.x + 'px';
  el.style.top = stone.finalPos.y + 'px';
}
```

- [ ] **Step 3: Test — word should be readable after reveal phase**

Run: Open browser. Expected: after collapse, some stones rotate smoothly to show bright letters, others already show bright letters. By ~10s the full word is readable.

- [ ] **Step 4: Commit**

---

### Task 6: Loop — Exit Animation + Restart

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Implement exit and loop**

The loop logic is already in the `animate` function. Verify the EXIT phase makes stones fall off the bottom and the animation restarts. If needed, adjust timing to ensure a smooth restart:

```javascript
// In animate function, after TOTAL_DURATION reset:
if (elapsed >= TOTAL_DURATION) {
  animStartTime = timestamp;
  stoneData.forEach((stone) => {
    const el = stone.element;
    el.classList.remove('revealed', 'reveal-letter');
    el.style.transform = '';
    el.style.opacity = '1';
    el.style.left = stone.startPos.x + 'px';
    el.style.top = stone.startPos.y + 'px';
    el.style.transition = 'none';
  });
  // Force reflow
  stoneData.forEach(s => s.element.offsetHeight);
  requestAnimationFrame(animate);
  return;
}
```

- [ ] **Step 2: Test looping**

Run: Open browser, let animation run for 30+ seconds. Expected: after initial 15s animation, stones exit and the animation restarts cleanly. No visual glitches or console errors.

- [ ] **Step 3: Commit**

---

### Task 7: Polish — Timing, Stone Diversity, Responsiveness

**Files:**
- Modify: `script.js`
- Modify: `style.css`

- [ ] **Step 1: Tweak timing values for best visual feel**

Adjust these knobs in `script.js`:
- Entry stagger delay: `i * 150` → tune to `i * 120` or `i * 200` depending on visual density
- Stack bounce amplitude: `sin(...) * 3 * (1 - (t - 0.9) * 10)` → adjust for heavier/softer landing
- Roll arc height: `-60 - Math.random() * 40` → `-80 - Math.random() * 60` for more dramatic rolls
- Reveal rotation duration: `0.6s` in CSS → try `0.8s` or `0.4s`

- [ ] **Step 2: Add more stone shape diversity**

Add additional stone shape clips in `style.css`:

```css
.stone-shape-1 { clip-path: polygon(3% 0%, 97% 2%, 100% 6%, 98% 94%, 95% 100%, 6% 98%, 1% 95%, 0% 5%); }
.stone-shape-2 { clip-path: polygon(2% 2%, 96% 0%, 99% 8%, 97% 92%, 93% 98%, 4% 100%, 0% 92%, 1% 3%); }
.stone-shape-3 { clip-path: polygon(4% 1%, 98% 3%, 100% 4%, 96% 97%, 92% 99%, 7% 96%, 2% 93%, 3% 6%); }
```

Assign random shapes in `initStones`:
```javascript
el.classList.add(`stone-shape-${Math.floor(Math.random() * 3) + 1}`);
```

- [ ] **Step 3: Test all changes together**

Run: Open browser, watch 2-3 full loops. Verify:
- All 12 stones appear and animate
- Staggered wall is readable as TROCKENMAUER
- Loop resets cleanly
- Performance is smooth (60fps)

- [ ] **Step 4: Commit**

---

### Task 8: Final Polish — Shadow, Background Atmosphere

**Files:**
- Modify: `style.css`
- Modify: `index.html`

- [ ] **Step 1: Add subtle ground shadow beneath the wall**

In `index.html`, add a shadow element before the stones:

```html
<div id="ground-shadow"></div>
```

In `style.css`:

```css
#ground-shadow {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 40px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%);
  pointer-events: none;
}
```

- [ ] **Step 2: Final test**

Run: Open browser, verify everything works. No console errors. Animation smooth. Word readable.

- [ ] **Step 3: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: TROCKENMAUER stone wall animation webtool"
```
