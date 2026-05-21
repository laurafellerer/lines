import { Camera } from './camera.js';

const HAND_KEYPOINTS = [
  'wrist',
  'thumb_cmc', 'thumb_mcp', 'thumb_ip', 'thumb_tip',
  'index_finger_mcp', 'index_finger_pip', 'index_finger_dip', 'index_finger_tip',
  'middle_finger_mcp', 'middle_finger_pip', 'middle_finger_dip', 'middle_finger_tip',
  'ring_finger_mcp', 'ring_finger_pip', 'ring_finger_dip', 'ring_finger_tip',
  'pinky_finger_mcp', 'pinky_finger_pip', 'pinky_finger_dip', 'pinky_finger_tip'
];

export class HandDetector {
  constructor() {
    this.detector = null;
    this.camera = new Camera('webcam');
    this.onFrame = null;
    this.onFps = null;
    this.running = false;
    this.frameCount = 0;
    this.lastFpsTime = 0;
    this.keypoints = {};
    this.handDetected = false;
  }

  async init() {
    await this.camera.start();

    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    const config = {
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
      modelType: 'full'
    };

    this.detector = await handPoseDetection.createDetector(model, config);
    this.running = true;
    this.lastFpsTime = performance.now();
    this._loop();
  }

  async _loop() {
    if (!this.running) return;

    const now = performance.now();
    this.frameCount++;

    if (now - this.lastFpsTime >= 1000) {
      if (this.onFps) this.onFps(this.frameCount);
      this.frameCount = 0;
      this.lastFpsTime = now;
    }

    if (this.detector && this.camera.video.readyState >= 2) {
      try {
        const hands = await this.detector.estimateHands(this.camera.video);
        const kpMap = {};

        if (hands.length > 0) {
          this.handDetected = true;
          hands[0].keypoints.forEach(kp => {
            kpMap[kp.name] = { x: kp.x, y: kp.y };
          });
        } else {
          this.handDetected = false;
        }

        this.keypoints = kpMap;

        if (this.onFrame) this.onFrame(kpMap, hands.length > 0);
      } catch (e) {
        // detection frame skipped
      }
    }

    requestAnimationFrame(() => this._loop());
  }

  stop() {
    this.running = false;
    this.camera.stop();
  }

  getKeypoint(name) {
    return this.keypoints[name] || null;
  }

  getAllKeypoints() {
    return { ...this.keypoints };
  }
}

export { HAND_KEYPOINTS };
