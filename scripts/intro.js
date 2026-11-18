(() => {
'use strict';

function setupIntro(config = {}) {
  const root = document.documentElement;
  const screen = document.querySelector('#intro-screen');
  const page = document.querySelector('#site-page');
  if (config.introEnabled === false) {
    root.classList.remove('intro-pending');
    return Promise.resolve();
  }

  const layout = screen.querySelector('.intro-layout');
  const openButton = screen.querySelector('.envelope-open');
  const card = screen.querySelector('.envelope-card');
  const enterButton = screen.querySelector('.intro-enter');
  const hint = screen.querySelector('.intro-hint');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const timers = new Set();
  let opened = false;
  let ready = false;
  let leaving = false;
  let closed = false;
  let revealPage;
  const entrance = new Promise(resolve => { revealPage = resolve; });

  function later(callback, delay) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (!closed) callback();
    }, delay);
    timers.add(timer);
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers.clear();
  }

  function revealCard() {
    if (ready || leaving || closed) return;
    ready = true;
    layout.classList.add('is-ready');
    card.inert = false;
    card.removeAttribute('inert');
    card.removeAttribute('aria-hidden');
    enterButton.disabled = false;
    hint.textContent = 'Ваше приглашение готово';
    enterButton.focus({ preventScroll: true });
  }

  function enterSite() {
    if (leaving || closed) return;
    leaving = true;
    clearTimers();
    screen.classList.add('is-leaving');
    root.classList.remove('intro-pending');
    revealPage();
    later(() => screen.close(), reducedMotion.matches ? 0 : 420);
  }

  openButton.addEventListener('click', () => {
    if (opened || leaving) return;
    opened = true;
    openButton.disabled = true;
    openButton.setAttribute('aria-expanded', 'true');
    layout.classList.add('is-open');
    hint.textContent = 'Открываем ваше приглашение…';
    if (reducedMotion.matches) revealCard();
    else later(revealCard, 2300);
  });
  card.addEventListener('transitionend', event => {
    if (event.target === card && event.propertyName === 'transform') revealCard();
  });
  const onMotionChange = () => {
    if (reducedMotion.matches && opened) revealCard();
  };
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotionChange);
  else reducedMotion.addListener(onMotionChange);
  enterButton.addEventListener('click', enterSite);
  screen.addEventListener('cancel', event => {
    event.preventDefault();
    enterSite();
  });
  screen.addEventListener('close', () => {
    if (closed) return;
    closed = true;
    clearTimers();
    root.classList.remove('intro-pending', 'intro-active');
    page.inert = false;
    revealPage();
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.querySelector('#hero-title').focus({ preventScroll: true });
  });

  page.inert = true;
  root.classList.add('intro-active');
  window.scrollTo({ top: 0, behavior: 'instant' });
  screen.showModal();
  screen.focus({ preventScroll: true });
  return entrance;
}

window.Wedding.setupIntro = setupIntro;
})();
