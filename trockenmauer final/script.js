const LETTERS = ['T','R','O','C','K','E','N','M','A','U','E','R'];

const params = {
  speed: 1.5,
  swing: 15,
  bounce: 0.6,
  stagger: 260
};

const sliders = {
  speed: document.getElementById('speed'),
  swing: document.getElementById('swing'),
  bounce: document.getElementById('bounce'),
  stagger: document.getElementById('stagger')
};

const valDisplays = {
  speed: document.getElementById('speed-val'),
  swing: document.getElementById('swing-val'),
  bounce: document.getElementById('bounce-val'),
  stagger: document.getElementById('stagger-val')
};

Object.keys(sliders).forEach((key) => {
  sliders[key].addEventListener('input', () => {
    params[key] = parseFloat(sliders[key].value);
    if (key === 'speed') valDisplays[key].textContent = params[key].toFixed(1) + 'x';
    else if (key === 'stagger') valDisplays[key].textContent = params[key] + 'ms';
    else valDisplays[key].textContent = params[key];
  });
});

const FONT_SIZE = 72;
let containerEl = null;

const letterData = LETTERS.map((letter) => {
  return {
    letter,
    element: null,
    finalPos: null,
    fallDelay: 0,
    wobbleRotate: (Math.random() - 0.5) * 8,
    settledWobble: (Math.random() - 0.5) * 3,
    swingDir: Math.random() > 0.5 ? 1 : -1,
    swingAmp: 0.5 + Math.random() * 0.5,
    startY: -120 - Math.random() * 100,
    startXSpread: 0,
    shakePhase: Math.random() * Math.PI * 2,
    shakeFreq: 25 + Math.random() * 25
  };
});

const NUM_STARS = 16;
const starData = Array.from({ length: NUM_STARS }, () => ({
  element: null,
  finalPos: { x: 0, y: 0 },
  startY: -80 - Math.random() * 120,
  fallDelay: Math.random() * 1500,
  size: 16 + Math.random() * 16,
  wobbleRotate: (Math.random() - 0.5) * 30,
  shakePhase: Math.random() * Math.PI * 2,
  shakeFreq: 20 + Math.random() * 30,
  opacity: 0.4 + Math.random() * 0.6
}));

function calculateFinalPositions() {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const totalWidth = LETTERS.length * (FONT_SIZE * 0.78);
  const startX = cx - totalWidth / 2 + FONT_SIZE * 0.35;

  letterData.forEach((ld, i) => {
    ld.finalPos = {
      x: startX + i * FONT_SIZE * 0.78,
      y: cy - FONT_SIZE * 0.3
    };
  });

  starData.forEach((sd, i) => {
    const gap = FONT_SIZE * 0.78;
    const letterIndex = (i / starData.length) * (LETTERS.length - 1);
    const pos = letterIndex;
    const lerpIdx = pos - Math.floor(pos);
    const before = Math.floor(pos);
    const after = Math.min(before + 1, LETTERS.length - 1);
    const lx = lerp(
      startX + before * gap,
      startX + after * gap,
      lerpIdx
    );
    sd.finalPos = {
      x: lx + (Math.random() - 0.5) * 40,
      y: cy - FONT_SIZE * 0.3 + (Math.random() - 0.5) * 60
    };
  });
}

function initLetters() {
  containerEl = document.getElementById('container');
  letterData.forEach((ld) => {
    const el = document.createElement('span');
    el.className = 'letter';
    el.textContent = ld.letter;
    el.style.left = (ld.finalPos.x + ld.startXSpread) + 'px';
    el.style.top = ld.startY + 'px';
    el.style.transform = `rotate(${ld.wobbleRotate}deg)`;
    containerEl.appendChild(el);
    ld.element = el;
  });

  starData.forEach((sd) => {
    const el = document.createElement('span');
    el.className = 'star';
    el.textContent = '★';
    el.style.fontSize = sd.size + 'px';
    el.style.opacity = sd.opacity;
    el.style.left = sd.finalPos.x + 'px';
    el.style.top = sd.startY + 'px';
    el.style.transform = `rotate(${sd.wobbleRotate}deg)`;
    containerEl.appendChild(el);
    sd.element = el;
  });
}

const PHASE = {
  FALL: 'fall',
  DONE: 'done'
};

let animStartTime = 0;

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function lerp(a, b, t) { return a + (b - a) * t; }

function getPhaseTimings() {
  const s = params.speed;
  const fallEnd = 2800 / s;
  return { fallEnd };
}

function getPhase(elapsed, timings) {
  if (elapsed < timings.fallEnd) return PHASE.FALL;
  return PHASE.DONE;
}

function easeBounce(t) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  else return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

function easeFall(t) {
  const p = params.bounce / 100;
  const smooth = easeOutCubic(t);
  const bouncy = easeBounce(t);
  return smooth * (1 - p) + bouncy * p;
}

let containerShakeTimer = 0;

function updateLetterPosition(ld, elapsed, timings) {
  const phase = getPhase(elapsed, timings);
  const el = ld.element;
  const wobble = ld.wobbleRotate;

  let shakeDecay = 0;
  let t = 0;

  if (phase === PHASE.FALL) {
    const fallElapsed = elapsed - ld.fallDelay / params.speed;
    const fallDuration = (700 + ld.swingAmp * 200) / params.speed;
    const rawT = fallElapsed / fallDuration;
    t = Math.max(0, Math.min(1, rawT));

    const y = lerp(ld.startY, ld.finalPos.y, easeFall(t));
    const swingOffset = Math.sin(t * Math.PI) * params.swing * ld.swingDir * ld.swingAmp * (1 - t);
    const landX = ld.finalPos.x;

    shakeDecay = Math.max(0, 1 - t * 0.8);
    const shakeX = Math.sin(elapsed * 0.04 * ld.shakeFreq + ld.shakePhase) * 5 * shakeDecay;
    const shakeY = Math.sin(elapsed * 0.06 * ld.shakeFreq + ld.shakePhase + 1) * 3 * shakeDecay;

    el.style.left = (landX + swingOffset + shakeX) + 'px';
    el.style.top = (y + shakeY) + 'px';
    el.style.transform = `rotate(${wobble + (1 - t) * 20 * ld.swingDir}deg)`;
  }
  else if (phase === PHASE.DONE) {
    el.style.left = ld.finalPos.x + 'px';
    el.style.top = ld.finalPos.y + 'px';
    el.style.transform = `rotate(${ld.settledWobble}deg)`;
    el.style.opacity = '1';
  }
}

function updateStarPosition(sd, elapsed, timings) {
  const phase = getPhase(elapsed, timings);
  const el = sd.element;

  if (phase === PHASE.FALL) {
    const fallDelay = 300 + sd.fallDelay / params.speed;
    const fallElapsed = elapsed - fallDelay;
    const fallDuration = 1500 / params.speed;
    const rawT = fallElapsed / fallDuration;
    const t = Math.max(0, Math.min(1, rawT));

    const y = lerp(sd.startY, sd.finalPos.y, easeOutCubic(t));
    const shakeDecay = Math.max(0, 1 - t * 0.7);
    const shakeX = Math.sin(elapsed * 0.04 * sd.shakeFreq + sd.shakePhase) * 3 * shakeDecay;
    const shakeY = Math.sin(elapsed * 0.05 * sd.shakeFreq + sd.shakePhase + 2) * 2 * shakeDecay;
    const twinkle = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(elapsed * 0.003 * sd.shakeFreq + sd.shakePhase));

    el.style.left = (sd.finalPos.x + shakeX) + 'px';
    el.style.top = (y + shakeY) + 'px';
    el.style.opacity = twinkle * sd.opacity;
    el.style.transform = `rotate(${sd.wobbleRotate + t * 90}deg)`;
  }
  else if (phase === PHASE.DONE) {
    el.style.left = sd.finalPos.x + 'px';
    el.style.top = sd.finalPos.y + 'px';
    el.style.opacity = sd.opacity;
    el.style.transform = `rotate(${sd.wobbleRotate}deg)`;
  }
}

function animate(timestamp) {
  if (!animStartTime) animStartTime = timestamp;
  const elapsed = timestamp - animStartTime;
  const timings = getPhaseTimings();

  letterData.forEach((ld) => {
    ld.fallDelay = ld.swingAmp > 0.7 ? params.stagger * 0.5 : params.stagger;
  });

  let doneCount = 0;
  letterData.forEach((ld) => {
    updateLetterPosition(ld, elapsed, timings);
    if (getPhase(elapsed, timings) === PHASE.DONE) doneCount++;
  });

  starData.forEach((sd) => updateStarPosition(sd, elapsed, timings));

  if (doneCount < letterData.length) {
    const phase = getPhase(elapsed, timings);
    let containerShake = 0;
    containerShake = Math.sin(elapsed * 0.03) * 1.5;
    containerEl.style.transform = `translate(${containerShake}px, 0)`;
    requestAnimationFrame(animate);
  } else {
    containerEl.style.transform = '';
  }
}

window.addEventListener('resize', () => {
  calculateFinalPositions();
});

calculateFinalPositions();
initLetters();
requestAnimationFrame(animate);
