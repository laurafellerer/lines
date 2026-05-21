import { HandDetector } from './hand-detector.js';
import { CanvasRenderer } from './canvas.js';

const $ = id => document.getElementById(id);

const HAND_KEYPOINTS = [
  'wrist','thumb_cmc','thumb_mcp','thumb_ip','thumb_tip',
  'index_finger_mcp','index_finger_pip','index_finger_dip','index_finger_tip',
  'middle_finger_mcp','middle_finger_pip','middle_finger_dip','middle_finger_tip',
  'ring_finger_mcp','ring_finger_pip','ring_finger_dip','ring_finger_tip',
  'pinky_finger_mcp','pinky_finger_pip','pinky_finger_dip','pinky_finger_tip'
];

const STATIC_POSITIONS = {
  wrist:{x:0.5,y:0.85},thumb_cmc:{x:0.25,y:0.75},thumb_mcp:{x:0.15,y:0.65},
  thumb_ip:{x:0.08,y:0.55},thumb_tip:{x:0.05,y:0.45},
  index_finger_mcp:{x:0.38,y:0.6},index_finger_pip:{x:0.38,y:0.45},
  index_finger_dip:{x:0.38,y:0.32},index_finger_tip:{x:0.38,y:0.2},
  middle_finger_mcp:{x:0.5,y:0.58},middle_finger_pip:{x:0.5,y:0.4},
  middle_finger_dip:{x:0.5,y:0.25},middle_finger_tip:{x:0.5,y:0.1},
  ring_finger_mcp:{x:0.62,y:0.6},ring_finger_pip:{x:0.62,y:0.45},
  ring_finger_dip:{x:0.62,y:0.32},ring_finger_tip:{x:0.62,y:0.2},
  pinky_finger_mcp:{x:0.72,y:0.65},pinky_finger_pip:{x:0.74,y:0.52},
  pinky_finger_dip:{x:0.76,y:0.42},pinky_finger_tip:{x:0.78,y:0.32}
};

const detector = new HandDetector();
const renderer = new CanvasRenderer('main-canvas');

const modelCanvas = $('model-canvas');
const modelCtx = modelCanvas.getContext('2d');

let connections = [];
let currentMode = 'connect';
let selectedStatic = null;

function resizeModelCanvas() {
  const rect = modelCanvas.getBoundingClientRect();
  modelCanvas.width = rect.width;
  modelCanvas.height = rect.height;
}

function renderStaticModel() {
  renderer.renderStaticHand(modelCtx, modelCanvas.width, modelCanvas.height, STATIC_POSITIONS, connections, selectedStatic);
}

function switchMode(mode) {
  currentMode = mode;
  renderer.setMode(mode);
  document.querySelectorAll('.toolbar button[data-mode]').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });

  $('side-panel').classList.toggle('visible', mode === 'connect');
  if (mode === 'connect') resizeModelCanvas();
  $('camera-overlay').classList.toggle('visible', mode === 'connect' || mode === 'swipe' || mode === 'read');
  $('btn-clear-trails').style.display = mode === 'animate' ? 'inline-block' : 'none';
  $('swipe-counter').style.display = mode === 'swipe' ? 'inline' : 'none';

  if (mode === 'animate' && renderer.trailsOn) {
    $('trails-indicator').classList.add('on');
  } else {
    $('trails-indicator').classList.remove('on');
  }
}

// --- Static model interaction (connect mode) ---

function hitTestStaticModel(mx, my) {
  const w = modelCanvas.width;
  const h = modelCanvas.height;
  const margin = 0.08;
  const range = 1 - margin * 2;
  const threshold = 14;

  for (const name of HAND_KEYPOINTS) {
    const p = STATIC_POSITIONS[name];
    const sx = (p.x * range + margin) * w;
    const sy = (p.y * range + margin) * h;
    const dx = mx - sx;
    const dy = my - sy;
    if (Math.sqrt(dx * dx + dy * dy) < threshold) return name;
  }
  return null;
}

modelCanvas.addEventListener('click', (e) => {
  if (currentMode !== 'connect') return;

  const rect = modelCanvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (modelCanvas.width / rect.width);
  const my = (e.clientY - rect.top) * (modelCanvas.height / rect.height);

  const hit = hitTestStaticModel(mx, my);

  if (!hit) {
    selectedStatic = null;
    renderStaticModel();
    return;
  }

  if (selectedStatic === null) {
    selectedStatic = hit;
  } else if (selectedStatic === hit) {
    selectedStatic = null;
  } else {
    const exists = connections.some(c =>
      (c.from === selectedStatic && c.to === hit) ||
      (c.from === hit && c.to === selectedStatic)
    );
    if (!exists) {
      connections.push({ from: selectedStatic, to: hit });
    }
    selectedStatic = null;
    renderConnectionsList();
  }
  renderStaticModel();
});

// --- Connections list ---

function removeConnection(index) {
  connections.splice(index, 1);
  renderConnectionsList();
}

function renderConnectionsList() {
  const el = $('conn-list');
  let html = '';
  if (connections.length === 0) {
    html = '<div style="font-size:12px;color:#555;padding:4px 0">Click dots on the hand model below to connect.</div>';
  } else {
    connections.forEach((c, i) => {
      html += `<div class="conn-item">
        <span>${c.from} → ${c.to}</span>
        <button data-idx="${i}">✕</button>
      </div>`;
    });
  }
  el.innerHTML = html;
  el.querySelectorAll('[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => removeConnection(parseInt(btn.dataset.idx)));
  });
}

// --- UI buttons ---

$('btn-connect').addEventListener('click', () => switchMode('connect'));
$('btn-animate').addEventListener('click', () => switchMode('animate'));
$('btn-swipe').addEventListener('click', () => switchMode('swipe'));
$('btn-read').addEventListener('click', () => switchMode('read'));

$('btn-clear-trails').addEventListener('click', () => renderer.clearTrails());

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && currentMode === 'animate') {
    e.preventDefault();
    const newState = !renderer.trailsOn;
    renderer.setTrails(newState);
    $('trails-indicator').classList.toggle('on', newState);
  }
});

// --- Detector callbacks ---

detector.onFps = (fps) => { $('fps-display').textContent = fps; };

detector.onFrame = (keypoints, detected) => {
  const dot = $('hand-dot');
  const text = $('hand-text');
  if (detected) {
    dot.className = 'dot green';
    text.textContent = 'Hand detected';
  } else {
    dot.className = 'dot red';
    text.textContent = 'No hand';
  }

  if (currentMode === 'swipe') {
    renderer.renderSwipe(keypoints, detected);
    return;
  }

  if (currentMode === 'read') {
    renderer.renderRead(keypoints, detected);
    return;
  }

  renderer.renderLive(keypoints, connections, detected);
  if (currentMode === 'connect') {
    renderStaticModel();
  }
};

// --- Init ---

async function init() {
  renderer.resize();
  window.addEventListener('resize', () => {
    renderer.resize();
    resizeModelCanvas();
  });

  await detector.init();
  switchMode('connect');
}

init();
