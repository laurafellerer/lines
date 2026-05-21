# Fragment Pattern Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the pattern generator from single-lines-per-column to fragmented vertical lines with uniform gaps

**Architecture:** Rewrite `buildSVG()` and update HTML controls. Single `index.html` file.

**Tech Stack:** Vanilla HTML/CSS/JS, inline SVG.

---

### Task 1: Update HTML Controls

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update columns slider range**

Change column slider from `min="15" max="20" value="17"` to `min="10" max="100" value="20"`.

- [ ] **Step 2: Replace max line length with max fragment length**

Change the max line length label to "Max Fragment Length" and value display to use `%`.

- [ ] **Step 3: Add gap height slider**

Add after the max fragment length control:
```html
<div class="control-group">
  <label for="gapHeight">Gap Height</label>
  <input type="range" id="gapHeight" min="1" max="20" value="5">
  <span class="value-display" id="gapHeight-value">5%</span>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: update controls for fragmented pattern (columns 10-100, fragment length, gap height)"
```

---

### Task 2: Rewrite SVG Generation for Fragments

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update `getControls()` to read gap height**

Add `gapHeight: parseInt(document.getElementById('gapHeight').value) / 100` to the returned object.

- [ ] **Step 2: Rewrite `generateLines()` to `generateFragments()`**

Replace `generateLines` with a function that, for each column, generates an array of fragments from top to bottom:

```javascript
function generateFragments(columns, maxFragment, gapHeight) {
  const size = 500;
  const fragments = [];
  for (let col = 0; col < columns; col++) {
    const colFrags = [];
    let y = 0;
    const gapPx = gapHeight * size;
    const maxFragPx = maxFragment * size;
    while (y < size) {
      const fragLen = Math.max(0.5, Math.random() * maxFragPx);
      const endY = Math.min(y + fragLen, size);
      if (endY > y) {
        colFrags.push({ y1: y, y2: endY });
      }
      y = endY + gapPx;
    }
    fragments.push(colFrags);
  }
  return fragments;
}
```

- [ ] **Step 3: Rewrite `buildSVG()` to render fragments**

Replace `buildSVG`:

```javascript
function buildSVG(fragments, thickness, color) {
  const size = 500;
  const columns = fragments.length;
  if (columns === 0) return '';
  const spacing = size / columns;
  const halfSpacing = spacing / 2;

  const lineEls = [];
  fragments.forEach((colFrags, i) => {
    const x = i * spacing + halfSpacing;
    colFrags.forEach(({ y1, y2 }) => {
      lineEls.push(`<line x1="${x.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="${thickness}" stroke-linecap="round"/>`);
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  ${lineEls.join('\n  ')}
</svg>`;
}
```

- [ ] **Step 4: Update `render()` to use new functions**

```javascript
function render() {
  const { columns, maxFragment, gapHeight, thickness, color, opacity } = getControls();
  const fragments = generateFragments(columns, maxFragment, gapHeight);
  const rgba = hexToRgba(color, opacity);
  const svg = buildSVG(fragments, thickness, rgba);
  document.getElementById('preview').innerHTML = svg;
}
```

- [ ] **Step 5: Update `setupControls()` sliders array**

Add gapHeight entry: `{ id: 'gapHeight', format: v => v + '%' },` and update maxFragment format.

- [ ] **Step 6: Open in browser and verify**

Run: `open index.html`
Expected: Columns show fragmented vertical lines with uniform horizontal spacing and uniform vertical gaps.

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: rewrite generation for fragmented vertical lines with uniform gaps"
```
