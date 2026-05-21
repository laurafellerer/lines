# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page portfolio website that links to 5 existing exercise projects with custom dinosaur cursor, floating stars, and smooth transitions.

**Architecture:** Hybrid SPA — index.html contains HOME/ABOUT/EXERCISES sections toggled via JS. Exercise wrapper pages load existing projects in iframes. Shared CSS/JS assets provide consistent cursor, nav, and styling across all pages.

**Tech Stack:** Vanilla HTML, CSS, JavaScript. Google Fonts (Caveat for handwritten style). No frameworks.

---

### Task 1: Directory Structure and Dinosaur Cursor SVG

**Files:**
- Create: `assets/svg/dino-cursor.svg`
- Create: `assets/css/`
- Create: `assets/js/`
- Create: `assets/images/`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p "assets/css" "assets/js" "assets/svg" "assets/images"
```

- [ ] **Step 2: Save the dinosaur cursor SVG**

Save the dinosaur SVG to `assets/svg/dino-cursor.svg`.

The SVG content (provided by the user) uses an embedded PNG image via xlink:href. Write the complete SVG including the `<svg>` wrapper with the `xmlns` and `viewBox` attributes and the embedded `<image>` element with the base64 PNG data. The viewBox should be `0 0 1080 1080`.

---

### Task 2: Shared CSS (main.css)

**Files:**
- Create: `assets/css/main.css`

- [ ] **Step 1: Write shared CSS**

```css
/* ========== RESET & BASE ========== */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  cursor: none;
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #ffffff;
  color: #000000;
  overflow-x: hidden;
  min-height: 100vh;
}

/* ========== CUSTOM CURSOR ========== */
#cursor {
  position: fixed;
  width: 40px;
  height: 40px;
  pointer-events: none;
  z-index: 99999;
  background-image: url('../svg/dino-cursor.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transition: transform 0.15s ease, filter 0.15s ease;
  transform: translate(-50%, -50%);
}

#cursor.hover {
  transform: translate(-50%, -50%) scale(1.4);
  filter: drop-shadow(0 0 8px #FF00FF) drop-shadow(0 0 16px #FF00FF);
}

#cursor.hidden {
  opacity: 0;
}

/* ========== NAVIGATION ========== */
.nav {
  position: fixed;
  top: 32px;
  right: 32px;
  z-index: 1000;
  display: flex;
  gap: 28px;
}

.nav a {
  font-family: 'Caveat', cursive;
  font-size: 28px;
  color: #000;
  text-decoration: none;
  position: relative;
  cursor: none;
  transition: color 0.2s ease;
}

.nav a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #FF00FF;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.nav a:hover {
  color: #FF00FF;
}

.nav a:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.nav a.active {
  color: #FF00FF;
}

.nav a.active::after {
  transform: scaleX(1);
}

/* ========== SECTIONS ========== */
.section {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.5s ease, visibility 0.5s ease, transform 0.5s ease;
  transform: translateY(20px);
  overflow-y: auto;
}

.section.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* ========== HOME ========== */
#home {
  flex-direction: column;
  text-align: center;
}

#home h1 {
  font-size: clamp(36px, 6vw, 72px);
  font-weight: 400;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
}

#home p {
  font-size: clamp(16px, 2vw, 24px);
  color: #666;
  font-weight: 300;
}

/* ========== STARS ========== */
.star {
  position: fixed;
  width: 24px;
  height: 24px;
  color: #FF00FF;
  pointer-events: none;
  z-index: 0;
}

/* ========== ABOUT ========== */
#about {
  padding: 120px 10%;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  max-width: 1100px;
  width: 100%;
}

.about-image {
  width: 100%;
  aspect-ratio: 3/4;
  background: #f0f0f0;
  border-radius: 4px;
  transition: transform 0.3s ease;
  transform: rotate(-1deg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  overflow: hidden;
}

.about-image:hover {
  transform: rotate(2deg) scale(1.02);
}

.about-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-text {
  font-size: 18px;
  line-height: 1.8;
  color: #333;
  font-weight: 300;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s;
}

#about.active .about-text {
  opacity: 1;
  transform: translateY(0);
}

/* ========== EXERCISES ========== */
#exercises {
  flex-direction: column;
  gap: 20px;
  padding: 120px 10%;
}

.exercise-btn {
  font-family: 'Caveat', cursive;
  font-size: 28px;
  padding: 16px 48px;
  background: #4700FF;
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.4s ease;
  opacity: 0;
  transform: translateY(20px);
  min-width: 320px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  position: relative;
}

.exercise-btn.reveal {
  opacity: 1;
  transform: translateY(0);
}

.exercise-btn:hover {
  transform: translateY(-3px) rotate(-0.5deg);
  box-shadow: 0 8px 24px rgba(71, 0, 255, 0.3);
}

.exercise-btn:active {
  transform: translateY(0) rotate(0.5deg);
}

.back-btn {
  font-family: 'Caveat', cursive;
  font-size: 24px;
  color: #4700FF;
  background: none;
  border: none;
  cursor: none;
  position: absolute;
  top: 32px;
  left: 32px;
  text-decoration: none;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: #FF00FF;
}

/* ========== GRAIN OVERLAY ========== */
#grain {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99998;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

/* ========== CLOSE BUTTON ========== */
.close-btn {
  position: fixed;
  top: 32px;
  left: 32px;
  z-index: 1000;
  font-family: 'Caveat', cursive;
  font-size: 24px;
  color: #4700FF;
  background: none;
  border: none;
  cursor: none;
  transition: color 0.2s ease;
  display: none;
}

.close-btn:hover {
  color: #FF00FF;
}

/* ========== EXERCISE SUBPAGE ========== */
.exercise-page {
  width: 100%;
  min-height: 100vh;
  background: #fff;
}

.exercise-page .exercise-header {
  padding: 100px 10% 40px;
  text-align: center;
}

.exercise-page .exercise-header h1 {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 400;
  margin-bottom: 12px;
}

.exercise-page .exercise-header p {
  font-size: 16px;
  color: #666;
  font-weight: 300;
  max-width: 500px;
  margin: 0 auto;
}

.exercise-page .exercise-frame {
  width: 100%;
  height: calc(100vh - 200px);
  border: none;
  display: block;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .nav {
    top: 20px;
    right: 20px;
    gap: 16px;
  }

  .nav a {
    font-size: 22px;
  }

  #about {
    padding: 80px 5%;
  }

  .about-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  #exercises {
    padding: 80px 5%;
  }

  .exercise-btn {
    font-size: 22px;
    padding: 14px 32px;
    min-width: 260px;
  }

  .exercise-page .exercise-header {
    padding: 80px 5% 20px;
  }

  .exercise-page .exercise-frame {
    height: calc(100vh - 160px);
  }

  #cursor {
    width: 28px;
    height: 28px;
  }
}
```

---

### Task 3: Shared JavaScript (main.js)

**Files:**
- Create: `assets/js/main.js`

- [ ] **Step 1: Write main.js with cursor logic and navigation**

```javascript
// ========== CUSTOM CURSOR ==========
const cursor = document.getElementById('cursor');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let isVisible = true;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (!isVisible) {
    cursor.classList.remove('hidden');
    isVisible = true;
  }
});

document.addEventListener('mouseleave', () => {
  cursor.classList.add('hidden');
  isVisible = false;
});

document.addEventListener('mouseenter', () => {
  cursor.classList.remove('hidden');
  isVisible = true;
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.12;
  cursorY += (mouseY - cursorY) * 0.12;
  cursor.style.left = cursorX + 'px';
  cursor.style.top = cursorY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover effects on clickable elements
const hoverTargets = document.querySelectorAll('a, button, .exercise-btn, .nav a, .close-btn, .back-btn');
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// ========== NAVIGATION ==========
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');

  // Update nav active state
  document.querySelectorAll('.nav a').forEach(a => {
    a.classList.remove('active');
  });
  const navLink = document.querySelector(`.nav a[data-section="${sectionId}"]`);
  if (navLink) navLink.classList.add('active');

  // Show/hide close button
  const closeBtn = document.querySelector('.close-btn');
  if (sectionId === 'home') {
    closeBtn.style.display = 'none';
  } else {
    closeBtn.style.display = 'block';
  }

  // Re-attach hover effects for new elements
  setTimeout(() => {
    document.querySelectorAll('a, button, .exercise-btn, .nav a, .close-btn, .back-btn').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }, 100);
}

// ========== EXERCISES STAGGER ==========
function revealExercises() {
  const btns = document.querySelectorAll('.exercise-btn');
  btns.forEach((btn, i) => {
    setTimeout(() => {
      btn.classList.add('reveal');
    }, 150 * (i + 1));
  });
}

// Watch for exercises section becoming active
const observer = new MutationObserver(() => {
  const exercises = document.getElementById('exercises');
  if (exercises.classList.contains('active')) {
    revealExercises();
  } else {
    document.querySelectorAll('.exercise-btn').forEach(btn => {
      btn.classList.remove('reveal');
    });
  }
});

document.querySelectorAll('.section').forEach(s => {
  observer.observe(s, { attributes: true, attributeFilter: ['class'] });
});

// ========== KEYBOARD SHORTCUT ==========
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    showSection('home');
  }
});
```

---

### Task 4: Stars Animation Module (stars.js)

**Files:**
- Create: `assets/js/stars.js`

- [ ] **Step 1: Write stars.js**

```javascript
function createStars(count) {
  const stars = [];

  for (let i = 0; i < count; i++) {
    const wrapper = document.createElement('div');
    wrapper.className = 'star-wrapper';

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    wrapper.style.left = x + 'px';
    wrapper.style.top = y + 'px';
    wrapper.style.position = 'fixed';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '0';

    const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    star.setAttribute('class', 'star');
    star.setAttribute('viewBox', '0 0 24 24');
    star.setAttribute('width', '24');
    star.setAttribute('height', '24');
    star.innerHTML = '<polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="#FF00FF"/>';
    star.style.display = 'block';

    const duration = 6 + Math.random() * 8;
    const delay = Math.random() * 5;
    const driftX = (Math.random() - 0.5) * 80;
    const driftY = (Math.random() - 0.5) * 80;

    wrapper.style.animation = `
      floatStar${i} ${duration}s ease-in-out ${delay}s infinite alternate
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatStar${i} {
        0% { transform: translate(0, 0) rotate(0deg); }
        50% { transform: translate(${driftX}px, ${driftY}px) rotate(180deg); }
        100% { transform: translate(${-driftX}px, ${-driftY}px) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    wrapper.appendChild(star);
    document.body.appendChild(wrapper);
    stars.push({ wrapper, star });
  }

  return stars;
}

// Parallax on mouse move
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function applyParallax() {
  const wrappers = document.querySelectorAll('.star-wrapper');
  wrappers.forEach((wrapper, i) => {
    const factor = 3 + i * 2;
    const star = wrapper.querySelector('.star');
    if (star) {
      star.style.transform = `translate(${mouseX * factor}px, ${mouseY * factor}px)`;
    }
  });
  requestAnimationFrame(applyParallax);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  createStars(5);
  applyParallax();
});
```

---

### Task 5: index.html (Main SPA)

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>

  <div id="cursor"></div>
  <div id="grain"></div>

  <!-- Navigation -->
  <nav class="nav">
    <a href="#" data-section="about" class="nav-link" onclick="showSection('about'); return false;">ABOUT</a>
    <a href="#" data-section="exercises" class="nav-link" onclick="showSection('exercises'); return false;">EXERCISES</a>
  </nav>

  <button class="close-btn" onclick="showSection('home')">← BACK</button>

  <!-- HOME Section -->
  <section id="home" class="section active">
    <h1>Portfolio</h1>
    <p>interactive digital sketchbook</p>
  </section>

  <!-- ABOUT Section -->
  <section id="about" class="section">
    <div class="about-content">
      <div class="about-image">
        <span>image placeholder</span>
      </div>
      <div class="about-text">
        <p>A collection of experimental interactive works exploring hand tracking, generative patterns, sound-reactive visuals, and typographic animation.</p>
      </div>
    </div>
  </section>

  <!-- EXERCISES Section -->
  <section id="exercises" class="section">
    <a href="exercise1.html" class="exercise-btn">Ricetta</a>
    <a href="exercise2.html" class="exercise-btn">Pattern Exercise 1</a>
    <a href="exercise3.html" class="exercise-btn">Trockenmauer 1</a>
    <a href="exercise4.html" class="exercise-btn">Sound Test 1</a>
    <a href="exercise5.html" class="exercise-btn">Dinosaur 1</a>
  </section>

  <script src="assets/js/stars.js"></script>
  <script src="assets/js/main.js"></script>
</body>
</html>
```

---

### Task 6: Exercise 1 — Ricetta Placeholder (exercise1.html)

**Files:**
- Create: `exercise1.html`

- [ ] **Step 1: Write exercise1.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ricetta — Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/main.css">
  <style>
    .exercise-page .exercise-frame {
      display: flex;
      align-items: center;
      justify-content: center;
      height: calc(100vh - 200px);
      color: #999;
      font-size: 20px;
      font-weight: 300;
    }
  </style>
</head>
<body>

  <div id="cursor"></div>
  <div id="grain"></div>

  <nav class="nav">
    <a href="index.html" class="nav-link">HOME</a>
    <a href="index.html" data-section="exercises" class="nav-link">EXERCISES</a>
  </nav>

  <div class="exercise-page">
    <div class="exercise-header">
      <h1>Ricetta</h1>
      <p>Coming soon — an experimental recipe concept.</p>
    </div>
    <div class="exercise-frame">
      <span>placeholder content</span>
    </div>
  </div>

  <script src="assets/js/main.js"></script>
</body>
</html>
```

---

### Task 7: Exercise 2 — Pattern Exercise 1 Wrapper (exercise2.html)

**Files:**
- Create: `exercise2.html`

- [ ] **Step 1: Write exercise2.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pattern Exercise 1 — Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>

  <div id="cursor"></div>
  <div id="grain"></div>

  <nav class="nav">
    <a href="index.html" class="nav-link">HOME</a>
    <a href="index.html" data-section="exercises" class="nav-link">EXERCISES</a>
  </nav>

  <div class="exercise-page">
    <div class="exercise-header">
      <h1>Pattern Exercise 1</h1>
      <p>A vector pattern generator with customizable columns, fragment lengths, and colors.</p>
    </div>
    <iframe class="exercise-frame" src="pattern exercise 1/index.html" title="Pattern Exercise 1"></iframe>
  </div>

  <script src="assets/js/main.js"></script>
</body>
</html>
```

---

### Task 8: Exercise 3 — Trockenmauer 1 Wrapper (exercise3.html)

**Files:**
- Create: `exercise3.html`

- [ ] **Step 1: Write exercise3.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trockenmauer 1 — Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>

  <div id="cursor"></div>
  <div id="grain"></div>

  <nav class="nav">
    <a href="index.html" class="nav-link">HOME</a>
    <a href="index.html" data-section="exercises" class="nav-link">EXERCISES</a>
  </nav>

  <div class="exercise-page">
    <div class="exercise-header">
      <h1>Trockenmauer 1</h1>
      <p>An animated typography piece where letters fall and stack like dry stone wall blocks.</p>
    </div>
    <iframe class="exercise-frame" src="trockenmauer 1/index.html" title="Trockenmauer 1"></iframe>
  </div>

  <script src="assets/js/main.js"></script>
</body>
</html>
```

---

### Task 9: Exercise 4 — Sound Test 1 Wrapper (exercise4.html)

**Files:**
- Create: `exercise4.html`

- [ ] **Step 1: Write exercise4.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sound Test 1 — Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>

  <div id="cursor"></div>
  <div id="grain"></div>

  <nav class="nav">
    <a href="index.html" class="nav-link">HOME</a>
    <a href="index.html" data-section="exercises" class="nav-link">EXERCISES</a>
  </nav>

  <div class="exercise-page">
    <div class="exercise-header">
      <h1>Sound Test 1</h1>
      <p>A sound-reactive musical note animation triggered by microphone input.</p>
    </div>
    <iframe class="exercise-frame" src="sound test 1/index.html" title="Sound Test 1"></iframe>
  </div>

  <script src="assets/js/main.js"></script>
</body>
</html>
```

---

### Task 10: Exercise 5 — Dinosaur 1 Wrapper (exercise5.html)

**Files:**
- Create: `exercise5.html`

- [ ] **Step 1: Write exercise5.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dinosaur 1 — Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>

  <div id="cursor"></div>
  <div id="grain"></div>

  <nav class="nav">
    <a href="index.html" class="nav-link">HOME</a>
    <a href="index.html" data-section="exercises" class="nav-link">EXERCISES</a>
  </nav>

  <div class="exercise-page">
    <div class="exercise-header">
      <h1>Dinosaur 1</h1>
      <p>A hand-tracking web app with gesture-based interaction modes using the device camera.</p>
    </div>
    <iframe class="exercise-frame" src="dinosaur 1/index.html" title="Dinosaur 1"></iframe>
  </div>

  <script src="assets/js/main.js"></script>
</body>
</html>
```

---

### Task 11: Verify All Files and Open in Browser

**Files:**
- All

- [ ] **Step 1: Verify the file structure**

```bash
ls -la
ls -la assets/css/ assets/js/ assets/svg/
```

Expected: All directories and files exist.

- [ ] **Step 2: Open index.html in browser to verify it works**

```bash
open index.html
```

Manual checks:
- Custom dinosaur cursor follows mouse with lag
- Cursor glows on hover over links/buttons
- Stars float around the homepage
- Click ABOUT → smooth transition to about section with image placeholder and text
- Click EXERCISES → 5 buttons appear staggered with animation
- Each exercise button opens the correct wrapper page
- Exercise wrapper pages show the exercise in an iframe
- Navigation links work on all pages
- Grain overlay visible (very subtle)
- Responsive: resize window, layout adapts
- Close button returns to HOME
- Escape key returns to HOME
