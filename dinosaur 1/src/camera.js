export class Camera {
  constructor(videoElementId) {
    this.video = document.getElementById(videoElementId);
    this.stream = null;
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 }
    });
    this.video.srcObject = this.stream;
    await this.video.play();
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }
}
