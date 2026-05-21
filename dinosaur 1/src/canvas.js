import { HAND_KEYPOINTS } from './hand-detector.js';

const PROFILES = [
  {name:'Alex',age:28,emoji:'♈',color:'#FF6B6B',bio:'Aries'},
  {name:'Jamie',age:25,emoji:'♉',color:'#4ECDC4',bio:'Taurus'},
  {name:'Sam',age:31,emoji:'♊',color:'#FFE66D',bio:'Gemini'},
  {name:'Riley',age:27,emoji:'♋',color:'#A8E6CF',bio:'Cancer'},
  {name:'Jordan',age:29,emoji:'♌',color:'#DDA0DD',bio:'Leo'},
  {name:'Casey',age:26,emoji:'♍',color:'#87CEEB',bio:'Virgo'},
  {name:'Taylor',age:30,emoji:'♎',color:'#F0E68C',bio:'Libra'},
  {name:'Morgan',age:24,emoji:'♏',color:'#FFB347',bio:'Scorpio'},
  {name:'Avery',age:28,emoji:'♐',color:'#77DD77',bio:'Sagittarius'},
  {name:'Quinn',age:27,emoji:'♑',color:'#FDCBF3',bio:'Capricorn'}
];

const ANATOMY = [
  ['wrist','thumb_cmc'],['thumb_cmc','thumb_mcp'],['thumb_mcp','thumb_ip'],['thumb_ip','thumb_tip'],
  ['wrist','index_finger_mcp'],['index_finger_mcp','index_finger_pip'],['index_finger_pip','index_finger_dip'],['index_finger_dip','index_finger_tip'],
  ['wrist','middle_finger_mcp'],['middle_finger_mcp','middle_finger_pip'],['middle_finger_pip','middle_finger_dip'],['middle_finger_dip','middle_finger_tip'],
  ['wrist','ring_finger_mcp'],['ring_finger_mcp','ring_finger_pip'],['ring_finger_pip','ring_finger_dip'],['ring_finger_dip','ring_finger_tip'],
  ['wrist','pinky_finger_mcp'],['pinky_finger_mcp','pinky_finger_pip'],['pinky_finger_pip','pinky_finger_dip'],['pinky_finger_dip','pinky_finger_tip'],
  ['thumb_cmc','index_finger_mcp'],['index_finger_mcp','middle_finger_mcp'],['middle_finger_mcp','ring_finger_mcp'],['ring_finger_mcp','pinky_finger_mcp']
];

export class CanvasRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.selectedKeypoint = null;
    this.trailsOn = false;
    this.trailsData = [];
    this.mode = 'connect';
    this.swipeIndex = 0;
    this.swipeOffset = 0;
    this.swipeAnimating = false;
    this.swipeAnimProgress = 0;
    this.swipeAnimDirection = 0;
    this.swipeCount = 0;
    this.swipeMatchTimer = 0;
  }

  resize() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }

  renderLive(keypoints, connections, handDetected) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const videoW = 640;
    const videoH = 480;
    const scaleX = w / videoW;
    const scaleY = h / videoH;

    ctx.clearRect(0, 0, w, h);

    // Trails (animate mode only)
    if (this.mode === 'animate') {
      this.trailsData.forEach(({ x1, y1, x2, y2, color }) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
    }

    // Connection lines
    connections.forEach(conn => {
      const from = keypoints[conn.from];
      const to = keypoints[conn.to];
      if (!from || !to) return;

      const fx = (videoW - from.x) * scaleX;
      const fy = from.y * scaleY;
      const tx = (videoW - to.x) * scaleX;
      const ty = to.y * scaleY;

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = this.mode === 'animate' ? '#e94560' : '#4ecca3';
      ctx.lineWidth = this.mode === 'animate' ? 5 : 2;
      ctx.stroke();

      if (this.trailsOn && this.mode === 'animate') {
        this.trailsData.push({
          x1: fx, y1: fy, x2: tx, y2: ty,
          color: '#e94560'
        });
      }
    });

    // Keypoint stars (connect mode only)
    if (this.mode !== 'animate') {
      HAND_KEYPOINTS.forEach(name => {
        const kp = keypoints[name];
        if (!kp) return;
        const x = (videoW - kp.x) * scaleX;
        const y = kp.y * scaleY;
        this._drawStar(ctx, x, y, 3, 6, 5);
        ctx.fillStyle = handDetected ? '#ff9ff3' : '#555';
        ctx.fill();
      });
    }

    if (!handDetected) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '24px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Show your hand to the camera', w / 2, h / 2);
    }
  }

  renderStaticHand(ctx, canvasW, canvasH, positions, connections, selectedKeypoint) {
    const margin = 0.08;
    const range = 1 - margin * 2;

    function pos(name) {
      const p = positions[name];
      if (!p) return null;
      return {
        x: (p.x * range + margin) * canvasW,
        y: (p.y * range + margin) * canvasH
      };
    }

    ctx.clearRect(0, 0, canvasW, canvasH);

    // Anatomical guide lines
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ANATOMY.forEach(([a, b]) => {
      const pa = pos(a), pb = pos(b);
      if (!pa || !pb) return;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });

    // Connection lines
    connections.forEach(conn => {
      const pa = pos(conn.from), pb = pos(conn.to);
      if (!pa || !pb) return;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = '#4ecca3';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Stars
    HAND_KEYPOINTS.forEach(name => {
      const p = pos(name);
      if (!p) return;
      const isSelected = selectedKeypoint === name;
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }
      this._drawStar(ctx, p.x, p.y, isSelected ? 5 : 3, isSelected ? 10 : 6, 5);
      ctx.fillStyle = isSelected ? '#fff' : '#ff9ff3';
      ctx.fill();

      // Label
      ctx.fillStyle = '#888';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(name.replace(/_finger/g,''), p.x + 7, p.y + 2);
    });
  }

  _drawStar(ctx, cx, cy, innerR, outerR, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  renderSwipe(keypoints, handDetected) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const phoneW = Math.min(w * 0.55, 400);
    const phoneH = phoneW * 2.1;
    const phoneX = (w - phoneW) / 2;
    const phoneY = (h - phoneH) / 2;
    const corner = phoneW * 0.12;
    const bezel = 8;
    const screenX = phoneX + bezel;
    const screenY = phoneY + bezel + 20;
    const screenW = phoneW - bezel * 2;
    const screenH = phoneH - bezel * 2 - 20;

    // Phone body
    ctx.beginPath();
    this._roundRect(ctx, phoneX, phoneY, phoneW, phoneH, corner);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Screen
    ctx.beginPath();
    this._roundRect(ctx, screenX, screenY, screenW, screenH, corner * 0.6);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Notch
    const notchW = screenW * 0.3;
    ctx.beginPath();
    this._roundRect(ctx, screenX + (screenW - notchW) / 2, phoneY + bezel, notchW, 24, 12);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();

    if (!handDetected || !keypoints['index_finger_tip']) {
      ctx.fillStyle = '#999';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Show your index finger', screenX + screenW / 2, screenY + screenH / 2 - 10);
      ctx.fillText('to swipe', screenX + screenW / 2, screenY + screenH / 2 + 14);
      return;
    }

    const tip = keypoints['index_finger_tip'];
    const flipX = 640 - tip.x;
    const relX = (flipX - 320) / 320;
    const targetOffset = relX * screenW * 0.35;

    if (!this.swipeAnimating) {
      this.swipeOffset += (targetOffset - this.swipeOffset) * 0.15;
    }

    const threshold = screenW * 0.3;
    if (!this.swipeAnimating && Math.abs(this.swipeOffset) > threshold) {
      this.swipeAnimating = true;
      this.swipeAnimDirection = this.swipeOffset > 0 ? 1 : -1;
      this.swipeAnimProgress = 0;
    }

    // Next card (stack behind)
    const nextProfile = PROFILES[(this.swipeIndex + 1) % PROFILES.length];
    this._drawSwipeCard(ctx, screenX, screenY, screenW, screenH, nextProfile, 0, -6);

    // Current card
    let cardOffset = this.swipeOffset;
    let cardRotate = (this.swipeOffset / screenW) * 20;

    if (this.swipeAnimating) {
      this.swipeAnimProgress += 0.05;
      const p = Math.min(this.swipeAnimProgress, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      cardOffset = this.swipeAnimDirection * (threshold + eased * screenW * 1.5);
      cardRotate = this.swipeAnimDirection * (20 + eased * 30);

      if (p >= 1) {
        this.swipeIndex = (this.swipeIndex + 1) % PROFILES.length;
        this.swipeCount++;
        this.swipeOffset = 0;
        this.swipeAnimating = false;
        this.swipeAnimProgress = 0;
        if (this.swipeAnimDirection === 1 && Math.random() < 0.3) {
          this.swipeMatchTimer = 90;
        }
        const el = document.getElementById('swipe-counter');
        if (el) el.textContent = `${this.swipeCount} swiped`;
      }
    }

    const profile = PROFILES[this.swipeIndex];
    this._drawSwipeCard(ctx, screenX, screenY, screenW, screenH, profile, cardOffset, cardRotate);

    // Badges
    if (this.swipeOffset > screenW * 0.08) {
      const a = Math.min((this.swipeOffset - screenW * 0.08) / (screenW * 0.15), 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#4CAF50';
      ctx.font = 'bold 28px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('LIKE', screenX + screenW - 60, screenY + 20);
      ctx.restore();
    }
    if (this.swipeOffset < -screenW * 0.08) {
      const a = Math.min((-this.swipeOffset - screenW * 0.08) / (screenW * 0.15), 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#F44336';
      ctx.font = 'bold 28px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('NOPE', screenX + 60, screenY + 20);
      ctx.restore();
    }

    // Match overlay
    if (this.swipeMatchTimer > 0) {
      this.swipeMatchTimer--;
      const alpha = Math.min(this.swipeMatchTimer / 30, 1);
      ctx.save();
      ctx.fillStyle = `rgba(0,0,0,${0.4 * alpha})`;
      ctx.fillRect(screenX, screenY, screenW, screenH);

      ctx.shadowColor = '#ff69b4';
      ctx.shadowBlur = 40;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 36px system-ui';
      ctx.fillStyle = `rgba(255,105,180,${alpha})`;
      ctx.fillText("IT'S A MATCH!", screenX + screenW / 2, screenY + screenH / 2 - 10);
      ctx.shadowBlur = 20;
      ctx.font = '18px system-ui';
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
      ctx.fillText('💬 Send a message', screenX + screenW / 2, screenY + screenH / 2 + 40);
      ctx.restore();
    }
  }

  _drawSwipeCard(ctx, sx, sy, sw, sh, profile, offset, rotation) {
    ctx.save();
    const cx = sx + sw / 2 + offset;
    const cy = sy + sh / 2;
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);

    const cardW = sw * 0.85;
    const cardH = sh * 0.75;
    const cx2 = -cardW / 2;
    const cy2 = -cardH / 2;

    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    this._roundRect(ctx, cx2, cy2, cardW, cardH, 12);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.shadowColor = 'transparent';

    const photoR = cardW * 0.2;
    ctx.beginPath();
    ctx.arc(0, -cardH * 0.12, photoR, 0, Math.PI * 2);
    ctx.fillStyle = profile.color;
    ctx.fill();

    ctx.font = `${photoR * 0.9}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(profile.emoji, 0, -cardH * 0.12);

    ctx.font = 'bold 22px system-ui';
    ctx.fillStyle = '#222';
    ctx.fillText(`${profile.name}, ${profile.age}`, 0, cardH * 0.2);

    ctx.font = '14px system-ui';
    ctx.fillStyle = '#666';
    ctx.fillText(profile.bio, 0, cardH * 0.35);

    ctx.restore();
  }

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

  renderRead(keypoints, handDetected) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const videoW = 640;
    const videoH = 480;
    const scaleX = w / videoW;
    const scaleY = h / videoH;

    ctx.clearRect(0, 0, w, h);

    // Mystical background
    ctx.fillStyle = '#0d0221';
    ctx.fillRect(0, 0, w, h);

    // Glow circle
    const cx = w / 2, cy = h / 2;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.45);
    grad.addColorStop(0, 'rgba(100,0,200,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Floating particles (small dots)
    for (let i = 0; i < 30; i++) {
      const px = ((i * 137.5 + 50) % w);
      const py = ((i * 97.3 + 20) % h);
      ctx.beginPath();
      ctx.arc(px, py, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,150,255,${0.2 + Math.sin(Date.now() * 0.001 + i) * 0.1})`;
      ctx.fill();
    }

    if (!handDetected) {
      ctx.fillStyle = 'rgba(200,150,255,0.6)';
      ctx.font = '20px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Show one finger to read your fortune', cx, cy);
      return;
    }

    // Detect which finger is raised
    const fingers = [
      {name:'thumb',  fortune:'LUCK',      mcp:'thumb_cmc',       tip:'thumb_tip',      kps:['thumb_cmc','thumb_mcp','thumb_ip','thumb_tip']},
      {name:'index',  fortune:'BAD LUCK',  mcp:'index_finger_mcp',tip:'index_finger_tip',kps:['index_finger_mcp','index_finger_pip','index_finger_dip','index_finger_tip']},
      {name:'middle', fortune:'LUCK',      mcp:'middle_finger_mcp',tip:'middle_finger_tip',kps:['middle_finger_mcp','middle_finger_pip','middle_finger_dip','middle_finger_tip']},
      {name:'ring',   fortune:'LUCK',      mcp:'ring_finger_mcp',  tip:'ring_finger_tip',  kps:['ring_finger_mcp','ring_finger_pip','ring_finger_dip','ring_finger_tip']},
      {name:'pinky',  fortune:'BAD LUCK',  mcp:'pinky_finger_mcp', tip:'pinky_finger_tip', kps:['pinky_finger_mcp','pinky_finger_pip','pinky_finger_dip','pinky_finger_tip']}
    ];

    let bestFinger = null;
    let bestScore = 0;

    for (const f of fingers) {
      const tip = keypoints[f.tip];
      const mcp = keypoints[f.mcp];
      if (!tip || !mcp) continue;

      let score = 0;
      if (f.name === 'thumb') {
        // Thumb extends sideways
        const dx = Math.abs(tip.x - mcp.x);
        const dy = tip.y - mcp.y; // positive = tip below mcp
        score = dx - Math.max(dy, 0) * 0.5;
      } else {
        // Finger extends upward: tip should be above mcp
        const dy = mcp.y - tip.y; // positive = tip above mcp
        const tipPip = keypoints[f.kps[2]]; // DIP
        if (tipPip && tip.y < tipPip.y - 3) score += 10;
        score += Math.max(dy, 0);
      }

      if (score > bestScore) {
        bestScore = score;
        bestFinger = f;
      }
    }

    const threshold = bestFinger && bestFinger.name === 'thumb' ? 25 : 12;
    const detected = bestFinger && bestScore > threshold;

    // Draw hand keypoints
    const nameMap = {};
    for (const kp of Object.keys(keypoints)) {
      nameMap[kp] = true;
    }

    // Draw connection lines (anatomical guides)
    ctx.strokeStyle = 'rgba(200,150,255,0.15)';
    ctx.lineWidth = 1;
    ANATOMY.forEach(([a, b]) => {
      const pa = keypoints[a];
      const pb = keypoints[b];
      if (!pa || !pb) return;
      ctx.beginPath();
      ctx.moveTo((videoW - pa.x) * scaleX, pa.y * scaleY);
      ctx.lineTo((videoW - pb.x) * scaleX, pb.y * scaleY);
      ctx.stroke();
    });

    HAND_KEYPOINTS.forEach(name => {
      const kp = keypoints[name];
      if (!kp) return;
      const x = (videoW - kp.x) * scaleX;
      const y = kp.y * scaleY;

      const inBest = detected && bestFinger.kps.includes(name);
      this._drawStar(ctx, x, y, inBest ? 5 : 2, inBest ? 10 : 4, 5);
      ctx.fillStyle = inBest ? '#fdffaa' : 'rgba(200,150,255,0.4)';
      ctx.fill();
    });

    // Show fortune
    if (detected) {
      const fortune = bestFinger.fortune;
      const isBad = fortune === 'BAD LUCK';

      // Glow behind text
      ctx.shadowColor = isBad ? '#ff4444' : '#44ffaa';
      ctx.shadowBlur = 30;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 56px system-ui';
      ctx.fillStyle = isBad ? '#ff6666' : '#66ffbb';
      ctx.fillText(fortune, cx, cy - 20);

      ctx.shadowBlur = 0;

      ctx.font = '16px system-ui';
      ctx.fillStyle = 'rgba(200,150,255,0.7)';
      ctx.fillText(`${bestFinger.name} finger raised`, cx, cy + 40);
    } else {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '18px system-ui';
      ctx.fillStyle = 'rgba(200,150,255,0.5)';
      ctx.fillText('Raise one finger to see your fortune', cx, cy);
    }
  }

  clearTrails() { this.trailsData = []; }
  setTrails(on) { this.trailsOn = on; }
  setMode(mode) {
    this.mode = mode;
    if (mode === 'swipe') {
      this.swipeIndex = 0;
      this.swipeOffset = 0;
      this.swipeAnimating = false;
      this.swipeCount = 0;
      this.swipeMatchTimer = 0;
      const el = document.getElementById('swipe-counter');
      if (el) el.textContent = '0 swiped';
    }
  }
  getCanvasCoords(e, cvs) {
    const rect = (cvs || this.canvas).getBoundingClientRect();
    const w = (cvs || this.canvas).width;
    return {
      x: (e.clientX - rect.left) * (w / rect.width),
      y: (e.clientY - rect.top) * ((cvs || this.canvas).height / rect.height)
    };
  }
}
