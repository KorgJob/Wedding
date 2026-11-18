(() => {
'use strict';

function setupMotion() {
  const elements = document.querySelectorAll('[data-reveal], [data-photo-reveal]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target;
        const image = element.querySelector('img');
        const show = () => element.classList.add('is-visible');
        if (image && !image.complete) {
          image.addEventListener('load', show, { once: true });
          image.addEventListener('error', show, { once: true });
        } else show();
        observer.unobserve(element);
      }
    }, { threshold: 0.04, rootMargin: '0px 0px -16px 0px' });
    elements.forEach(element => {
      element.classList.add(element.hasAttribute('data-photo-reveal') ? 'photo-reveal-pending' : 'reveal-pending');
      observer.observe(element);
    });
    const onMotionChange = () => {
      if (reduceMotion.matches) {
        observer.disconnect();
        elements.forEach(element => element.classList.add('is-visible'));
      }
    };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionChange);
    else reduceMotion.addListener(onMotionChange);
  }
  const progress = document.querySelector('.reading-progress');
  let framePending = false;
  function update() {
    const total = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${total > 0 ? Math.min(1, scrollY / total) : 0})`;
    framePending = false;
  }
  addEventListener('scroll', () => {
    if (!framePending) { framePending = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}

window.Wedding.setupMotion = setupMotion;
})();
