const cursor = document.getElementById('cursor');

function moveCursor(x, y) {
  cursor.style.left = x + 'px';
  cursor.style.top = y + 'px';
}

document.addEventListener('mousemove', e => {
  moveCursor(e.clientX, e.clientY);
});

document.querySelectorAll('iframe').forEach(iframe => {
  function hookIframe(doc) {
    doc.addEventListener('mousemove', e => {
      const rect = iframe.getBoundingClientRect();
      moveCursor(rect.left + e.clientX, rect.top + e.clientY);
    });
  }
  try {
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      hookIframe(iframe.contentDocument);
    } else {
      iframe.addEventListener('load', () => hookIframe(iframe.contentDocument));
    }
  } catch (err) {}
});
