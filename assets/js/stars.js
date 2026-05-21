function createStars(count) {
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
  }
}

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

document.addEventListener('DOMContentLoaded', () => {
  createStars(5);
  applyParallax();
});
