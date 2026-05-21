# Vector Pattern Generator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page interactive web tool for generating randomized vertical-line vector patterns, with SVG export.

**Architecture:** Single `index.html` file containing HTML skeleton, CSS layout, and vanilla JS for SVG generation, control bindings, and export.

**Tech Stack:** Vanilla HTML/CSS/JS, inline SVG. No dependencies, no build step.

---

### Task 1: HTML Skeleton and CSS Layout

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write HTML and CSS**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Vector Pattern Generator</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f5;
  color: #333;
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 280px;
  padding: 24px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.sidebar h1 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.sidebar label {
  font-size: 13px;
  font-weight: 500;
  display: block;
  margin-bottom: 6px;
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-group input[type="range"] {
  width: 100%;
}

.control-group .value-display {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.control-group input[type="color"] {
  width: 100%;
  height: 36px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #4a6cf7;
  color: #fff;
}

.btn-primary:hover {
  background: #3b5de7;
}

.btn-secondary {
  background: #e8e8e8;
  color: #333;
}

.btn-secondary:hover {
  background: #d8d8d8;
}

.preview-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

#preview {
  width: 100%;
  max-width: 600px;
  aspect-ratio: 1 / 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

#preview svg {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
</head>
<body>
<div class="sidebar">
  <h1>Pattern Generator</h1>

  <div class="control-group">
    <label for="columns">Columns</label>
    <input type="range" id="columns" min="15" max="20" value="17" step="1">
    <span class="value-display" id="columns-value">17</span>
  </div>

  <div class="control-group">
    <label for="maxLength">Max Line Length</label>
    <input type="range" id="maxLength" min="10" max="100" value="50">
    <span class="value-display" id="maxLength-value">50%</span>
  </div>

  <div class="control-group">
    <label for="thickness">Line Thickness</label>
    <input type="range" id="thickness" min="0.5" max="3" value="1" step="0.5">
    <span class="value-display" id="thickness-value">1px</span>
  </div>

  <div class="control-group">
    <label for="color">Color</label>
    <input type="color" id="color" value="#6496ff">
  </div>

  <button class="btn btn-primary" id="randomize">Randomize</button>
  <button class="btn btn-secondary" id="export">Export SVG</button>
</div>

<div class="preview-area">
  <div id="preview"></div>
</div>

<script>
// JS goes here
</script>
</body>
</html>
```

- [ ] **Step 2: Open in browser to verify layout**

Run: `open index.html`
Expected: Sidebar with controls on left, empty preview area on right. Sliders, buttons, color picker all visible.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add HTML skeleton and CSS layout"
```

---

### Task 2: SVG Generation Logic

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add JS to generate SVG**

Replace the `<script>` placeholder with the generation logic:

```javascript
function getControls() {
  return {
    columns: parseInt(document.getElementById('columns').value),
    maxLength: parseInt(document.getElementById('maxLength').value) / 100,
    thickness: parseFloat(document.getElementById('thickness').value),
    color: document.getElementById('color').value,
  };
}

function generateLines(columns, maxLength) {
  return Array.from({ length: columns }, () => Math.random() * maxLength);
}

function buildSVG(lines, thickness, color) {
  const size = 500;
  const spacing = size / lines.length;
  const halfSpacing = spacing / 2;

  const lineEls = lines.map((len, i) => {
    const x = i * spacing + halfSpacing;
    const yLen = Math.max(len * size, len > 0 ? 0.5 : 0);
    const yLenPx = len === 0 ? 0.5 : len * size;
    return `<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${yLenPx.toFixed(1)}" stroke="${color}" stroke-width="${thickness}" stroke-linecap="round"/>`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${lineEls}
</svg>`;
}

function render() {
  const { columns, maxLength, thickness, color } = getControls();
  const lines = generateLines(columns, maxLength);
  const svg = buildSVG(lines, thickness, color);
  document.getElementById('preview').innerHTML = svg;
}

render();
```

- [ ] **Step 2: Open in browser to verify SVG renders**

Open `index.html` (refresh if already open).
Expected: A square with vertical lines of varying lengths visible. Different columns have different line heights.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add SVG generation logic"
```

---

### Task 3: Control Bindings and Interactivity

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add event listeners and value displays**

Append to the `<script>` block (after `render()`):

```javascript
function setupControls() {
  const sliders = [
    { id: 'columns', format: v => v },
    { id: 'maxLength', format: v => v + '%' },
    { id: 'thickness', format: v => v + 'px' },
  ];

  sliders.forEach(({ id, format }) => {
    const input = document.getElementById(id);
    const display = document.getElementById(id + '-value');
    input.addEventListener('input', () => {
      display.textContent = format(input.value);
      render();
    });
  });

  document.getElementById('color').addEventListener('input', render);

  document.getElementById('randomize').addEventListener('click', render);
}

setupControls();
```

- [ ] **Step 2: Verify interactivity in browser**

Refresh. Move sliders — SVG should update immediately. Change color — lines should update. Click Randomize — new random pattern generated.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add control bindings and real-time interactivity"
```

---

### Task 4: SVG Export

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add export handler**

Append to the `<script>` block:

```javascript
document.getElementById('export').addEventListener('click', () => {
  const svgEl = document.querySelector('#preview svg');
  if (!svgEl) return;

  const clone = svgEl.cloneNode(true);
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(clone);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'pattern.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
```

- [ ] **Step 2: Test export**

Refresh. Click "Export SVG". A file named `pattern.svg` should download. Open it — should be a valid SVG with lines.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add SVG export/download"
```

---

### Task 5: Alpha Channel Support for Color

**Files:**
- Modify: `index.html`

The current color picker only gives hex colors (no alpha). The spec calls for "light/transparent blue." Add opacity control to achieve transparency.

- [ ] **Step 1: Add opacity slider to HTML**

Add after the color input in the sidebar:

```html
<div class="control-group">
  <label for="opacity">Opacity</label>
  <input type="range" id="opacity" min="0" max="100" value="40">
  <span class="value-display" id="opacity-value">40%</span>
</div>
```

- [ ] **Step 2: Extract color as rgba in JS**

Update `getControls()`:

```javascript
function getControls() {
  return {
    columns: parseInt(document.getElementById('columns').value),
    maxLength: parseInt(document.getElementById('maxLength').value) / 100,
    thickness: parseFloat(document.getElementById('thickness').value),
    color: document.getElementById('color').value,
    opacity: parseInt(document.getElementById('opacity').value) / 100,
  };
}
```

Add a helper to convert hex to rgba:

```javascript
function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}
```

Update `render()` to pass opacity and use `hexToRgba`:

```javascript
function render() {
  const { columns, maxLength, thickness, color, opacity } = getControls();
  const lines = generateLines(columns, maxLength);
  const rgba = hexToRgba(color, opacity);
  const svg = buildSVG(lines, thickness, rgba);
  document.getElementById('preview').innerHTML = svg;
}
```

- [ ] **Step 3: Add opacity slider value display binding**

Add to the sliders array in `setupControls()`:

```javascript
{ id: 'opacity', format: v => v + '%' },
```

- [ ] **Step 4: Verify**

Refresh. Opacity slider should control transparency. At 0% lines should be invisible, at 100% fully opaque.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add opacity control for transparent colors"
```

---

### Self-Review Checklist
- [ ] Spec coverage: Columns slider (15-20), max line length (50% default), thickness, color, randomize, export — all present
- [ ] No placeholders — every step has actual code
- [ ] Type consistency: `getControls()`, `generateLines()`, `buildSVG()`, `render()` — consistent signatures throughout
