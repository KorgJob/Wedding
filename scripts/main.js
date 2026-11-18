(() => {
'use strict';
const { renderContent, setupDialogs, setupDate, setupIntro, setupMotion, setupNavigation, setupPhotoViewer, setupRsvp } = window.Wedding;
try {
  const content = window.WEDDING_CONFIG;
  if (!content) throw new Error('Не найден файл настроек content/wedding.js.');
  setupDialogs();
  renderContent(content);
  setupDate(content.event);
  const entrance = setupIntro(content.ui);
  setupRsvp();
  setupNavigation(content.ui);
  setupPhotoViewer();
  entrance.then(setupMotion);
} catch (error) {
  console.error(error);
  document.documentElement.classList.remove('intro-pending', 'intro-active');
  document.querySelector('#site-page').inert = false;
  const intro = document.querySelector('#intro-screen');
  if (intro.open) intro.close();
  const status = document.querySelector('#form-status');
  status.textContent = 'Не получилось загрузить приглашение полностью. Пожалуйста, обновите страницу.';
  status.classList.add('is-error');
  document.querySelector('#guest-form button[type="submit"]').disabled = true;
}
})();
