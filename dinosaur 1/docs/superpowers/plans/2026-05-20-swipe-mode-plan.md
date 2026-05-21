# Swipe Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a third "Swipe" mode with a virtual iPhone screen where index finger tracking controls Tinder-style card swiping.

**Architecture:** New `renderSwipe` method in CanvasRenderer + swipe state management. Mode switching extended in app.js. No new files.

**Tech Stack:** Canvas 2D, MediaPipe Hands (index_finger_tip keypoint)

---

### Task 1: Add Swipe button to toolbar

**File:** `index.html`

- [ ] **Step 1: Add button**

Add after the Animate button:
```html
<button id="btn-swipe" data-mode="swipe">Swipe</button>
```

- [ ] **Step 2: Add swipe indicator text**

Add near trails indicator:
```html
<span id="swipe-counter" style="display:none;color:#fdffaa;font-size:12px">0 swiped</span>
```

- [ ] **Step 3: Commit**

```bash
git add index.html && git commit -m "feat: add Swipe mode button"
```

### Task 2: Add swipe rendering to CanvasRenderer

**File:** `src/canvas.js`

- [ ] **Step 1: Add profile data and swipe state to constructor**

Add at top of file (before class):
```js
const PROFILES = [
  { name: 'Alex', age: 28, emoji: '🎨', color: '#FF6B6B', bio: 'Art lover & coffee' },
  { name: 'Jamie', age: 25, emoji: '🌿', color: '#4ECDC4', bio: 'Plant mom' },
  { name: 'Sam', age: 31, emoji: '📚', color: '#FFE66D', bio: 'Bookworm' },
  { name: 'Riley', age: 27, emoji: '🎸', color: '#A8E6CF', bio: 'Guitarist' },
  { name: 'Jordan', age: 29, emoji: '🧘', color: '#DDA0DD', bio: 'Yoga teacher' },
  { name: 'Casey', age: 26, emoji: '🎮', color: '#87CEEB', bio: 'Gamer' },
  { name: 'Taylor', age: 30, emoji: '✈️', color: '#F0E68C', bio: 'Travel bug' },
  { name: 'Morgan', age: 24, emoji: '🎬', color: '#FFB347', bio: 'Film buff' },
  { name: 'Avery', age: 28, emoji: '🎧', color: '#77DD77', bio: 'Music producer' },
  { name: 'Quinn', age: 27, emoji: '📸', color: '#FDCBF3', bio: 'Photographer' }
];
```

In constructor, add:
```js
this.swipeIndex = 0;
this.swipeOffset = 0;
this.swipeAnimating = false;
this.swipeAnimProgress = 0;
this.swipeAnimDirection = 0; // -1 left, 1 right
this.swipeCount = 0;
```

- [ ] **Step 2: Add `renderSwipe` method**

```js
renderSwipe(keypoints, handDetected) {
  const ctx = this.ctx;
  const w = this.canvas.width;
  const h = this.canvas.height;
  ctx.clearRect(0, 0, w, h);

  // iPhone frame dimensions
  const phoneW = Math.min(w * 0.55, 400);
  const phoneH = phoneW * 2.1;
  const phoneX = (w - phoneW) / 2;
  const phoneY = (h - phoneH) / 2;
  const corner = phoneW * 0.12;

  // Screen inset
  const bezel = 8;
  const screenX = phoneX + bezel;
  const screenY = phoneY + bezel + 20; // extra top for notch
  const screenW = phoneW - bezel * 2;
  const screenH = phoneH - bezel * 2 - 20;

  // Draw phone body
  ctx.beginPath();
  this._roundRect(ctx, phoneX, phoneY, phoneW, phoneH, corner);
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw screen
  ctx.beginPath();
  this._roundRect(ctx, screenX, screenY, screenW, screenH, corner * 0.6);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Notch
  const notchW = screenW * 0.3;
  const notchH = 24;
  ctx.beginPath();
  this._roundRect(ctx, screenX + (screenW - notchW) / 2, phoneY + bezel, notchW, notchH, 12);
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();

  if (!handDetected || !keypoints['index_finger_tip']) {
    ctx.fillStyle = '#999';
    ctx.font = '16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Show your index finger', screenX + screenW / 2, screenY + screenH / 2);
    ctx.fillText('to swipe', screenX + screenW / 2, screenY + screenH / 2 + 24);
    return;
  }

  // Map finger to card offset
  const tip = keypoints['index_finger_tip'];
  const videoW = 640;
  const flipX = videoW - tip.x;
  const relX = (flipX - 320) / 320; // -1 to 1
  const targetOffset = relX * screenW * 0.35;

  // Smooth card offset
  if (!this.swipeAnimating) {
    this.swipeOffset += (targetOffset - this.swipeOffset) * 0.15;
  }

  // Check threshold
  const threshold = screenW * 0.3;
  if (!this.swipeAnimating && Math.abs(this.swipeOffset) > threshold) {
    this.swipeAnimating = true;
    this.swipeAnimDirection = this.swipeOffset > 0 ? 1 : -1;
    this.swipeAnimProgress = 0;
  }

  // Draw card stack
  const nextProfile = PROFILES[(this.swipeIndex + 1) % PROFILES.length];
  this._drawSwipeCard(ctx, screenX, screenY, screenW, screenH, nextProfile, 0, -8);

  // Current card with offset/rotation
  let cardOffset = this.swipeOffset;
  let cardRotate = (this.swipeOffset / screenW) * 20; // degrees

  if (this.swipeAnimating) {
    this.swipeAnimProgress += 0.05;
    const progress = Math.min(this.swipeAnimProgress, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    cardOffset = this.swipeAnimDirection * (threshold + eased * screenW * 1.5);
    cardRotate = this.swipeAnimDirection * (20 + eased * 30);

    if (progress >= 1) {
      this.swipeIndex = (this.swipeIndex + 1) % PROFILES.length;
      this.swipeCount++;
      this.swipeOffset = 0;
      this.swipeAnimating = false;
      this.swipeAnimProgress = 0;
      // Update counter
      const counter = document.getElementById('swipe-counter');
      if (counter) counter.textContent = `${this.swipeCount} swiped`;
    }
  }

  const profile = PROFILES[this.swipeIndex];
  this._drawSwipeCard(ctx, screenX, screenY, screenW, screenH, profile, cardOffset, cardRotate);

  // Badges
  if (this.swipeOffset > screenW * 0.08) {
    const alpha = Math.min((this.swipeOffset - screenW * 0.08) / (screenW * 0.15), 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('LIKE', screenX + screenW - 60, screenY + 50);
    ctx.restore();
  }
  if (this.swipeOffset < -screenW * 0.08) {
    const alpha = Math.min((-this.swipeOffset - screenW * 0.08) / (screenW * 0.15), 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#F44336';
    ctx.font = 'bold 28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('NOPE', screenX + 60, screenY + 50);
    ctx.restore();
  }
}
```

- [ ] **Step 3: Add `_drawSwipeCard` helper**

```js
_drawSwipeCard(ctx, sx, sy, sw, sh, profile, offset, rotation) {
  ctx.save();
  const cx = sx + sw / 2 + offset;
  const cy = sy + sh / 2;
  ctx.translate(cx, cy);
  ctx.rotate((rotation * Math.PI) / 180);

  const cardW = sw * 0.85;
  const cardH = sh * 0.75;
  const cardX = -cardW / 2;
  const cardY = -cardH / 2;

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  // Card background
  ctx.beginPath();
  this._roundRect(ctx, cardX, cardY, cardW, cardH, 12);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Photo circle
  const photoR = cardW * 0.2;
  ctx.beginPath();
  ctx.arc(0, -cardH * 0.12, photoR, 0, Math.PI * 2);
  ctx.fillStyle = profile.color;
  ctx.fill();

  // Emoji
  ctx.font = `${photoR * 0.9}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(profile.emoji, 0, -cardH * 0.12);

  // Name & age
  ctx.font = 'bold 22px system-ui';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#222';
  ctx.fillText(`${profile.name}, ${profile.age}`, 0, cardH * 0.2);

  // Bio
  ctx.font = '14px system-ui';
  ctx.fillStyle = '#666';
  ctx.fillText(profile.bio, 0, cardH * 0.35);

  ctx.restore();
}
```

- [ ] **Step 4: Add `_roundRect` helper**

```js
_roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}
```

- [ ] **Step 5: Update `setMode` to reset swipe state**

```js
setMode(mode) {
  this.mode = mode;
  if (mode === 'swipe') {
    this.swipeIndex = 0;
    this.swipeOffset = 0;
    this.swipeAnimating = false;
    this.swipeCount = 0;
    const counter = document.getElementById('swipe-counter');
    if (counter) counter.textContent = '0 swiped';
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/canvas.js && git commit -m "feat: add swipe rendering with iPhone frame and Tinder cards"
```

### Task 3: Wire up swipe mode in app.js

**File:** `src/app.js`

- [ ] **Step 1: Add swipe button handler**

Append after the animate button handler:
```js
$('btn-swipe').addEventListener('click', () => switchMode('swipe'));
```

- [ ] **Step 2: Update switchMode for swipe**

In `switchMode`:
```js
$('side-panel').classList.toggle('visible', mode === 'connect');
$('camera-overlay').classList.toggle('visible', mode === 'connect' || mode === 'swipe');
$('btn-clear-trails').style.display = mode === 'animate' ? 'inline-block' : 'none';
$('swipe-counter').style.display = mode === 'swipe' ? 'inline' : 'none';
```

- [ ] **Step 3: Update onFrame for swipe mode**

In the `detector.onFrame` callback, add swipe rendering:
```js
if (currentMode === 'swipe') {
  renderer.renderSwipe(keypoints, detected);
  return;
}
```

Place this BEFORE the existing `renderLive` call.

- [ ] **Step 4: Commit**

```bash
git add src/app.js && git commit -m "feat: wire up swipe mode in app controller"
```

### Task 4: Verify and test

- [ ] **Step 1: Kill server and restart**

```bash
lsof -ti:8080 | xargs kill -9 2>/dev/null; nohup python3 -m http.server 8080 > /tmp/server.log 2>&1 &
sleep 2
```

- [ ] **Step 2: Manual test**
   - Open http://localhost:8080
   - Click "Swipe" button
   - Confirm iPhone frame appears
   - Show index finger to camera
   - Move finger left/right to swipe cards
   - Confirm counter increments
   - Switch to Connect, verify it still works
   - Switch to Animate, verify it still works
