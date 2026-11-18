(() => {
'use strict';

function setupPhotoViewer() {
  const viewer = document.querySelector('#photo-viewer');
  const image = viewer.querySelector('.photo-viewer-image');
  const caption = viewer.querySelector('.photo-viewer-caption');
  const stage = viewer.querySelector('.photo-viewer-stage');
  const closeButton = viewer.querySelector('.photo-viewer-close');

  document.querySelectorAll('[data-photo-open]').forEach(button => {
    button.addEventListener('click', () => {
      const source = button.querySelector('img');
      image.src = source.currentSrc || source.src;
      image.alt = source.alt;
      caption.textContent = button.dataset.photoTitle || source.alt;
      viewer.setAttribute('aria-label', caption.textContent);
      viewer.showModal();
      document.documentElement.classList.add('photo-viewer-open');
    });
  });

  closeButton.addEventListener('click', () => viewer.close());
  stage.addEventListener('click', event => { if (event.target === stage) viewer.close(); });
  viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('close', () => {
    document.documentElement.classList.remove('photo-viewer-open');
    image.removeAttribute('src');
  });
}

window.Wedding.setupPhotoViewer = setupPhotoViewer;
})();
