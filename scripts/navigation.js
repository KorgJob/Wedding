(() => {
'use strict';

function setupNavigation(config = {}) {
  const header = document.querySelector('.site-header');
  const shell = document.querySelector('.header-shell');
  const backToTop = document.querySelector('.back-to-top');
  const threshold = Math.max(0, Number(config.stickyHeaderAfter) || 240);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let framePending = false;

  const measureHeader = () => {
    const height = Math.ceil(header.getBoundingClientRect().height);
    shell.style.height = `${height}px`;
    document.documentElement.style.setProperty('--header-height', `${height}px`);
  };
  function updateNavigation() {
    const pinned = scrollY >= threshold;
    header.classList.toggle('is-sticky', pinned);
    backToTop.classList.toggle('is-visible', pinned);
    backToTop.setAttribute('aria-hidden', String(!pinned));
    backToTop.tabIndex = pinned ? 0 : -1;
    framePending = false;
  }
  addEventListener('scroll', () => {
    if (!framePending) {
      framePending = true;
      requestAnimationFrame(updateNavigation);
    }
  }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);
  else addEventListener('resize', measureHeader, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    document.querySelector('.monogram').focus({ preventScroll: true });
  });
  measureHeader();
  updateNavigation();
}

window.Wedding.setupNavigation = setupNavigation;
})();
