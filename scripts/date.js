(() => {
'use strict';
const { escapeHtml } = window.Wedding;

const MOSCOW = 'Europe/Moscow';
const pad = value => String(value).padStart(2, '0');
const dateText = (date, options) => new Intl.DateTimeFormat('ru-RU', { ...options, timeZone: MOSCOW }).format(date);


function setupDate(event) {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(event.date || '');
  const candidate = event.date ? new Date(dateOnly ? `${event.date}T00:00:00+03:00` : event.date) : null;
  const date = candidate && !Number.isNaN(candidate.getTime()) ? candidate : null;
  document.querySelectorAll('[data-event-date]').forEach(label => { label.textContent = date ? dateText(date, { day: '2-digit', month: '2-digit', year: 'numeric' }) : event.dateNote; });
  document.querySelectorAll('[data-event-time]').forEach(label => { label.textContent = date && !dateOnly ? dateText(date, { hour: '2-digit', minute: '2-digit' }) : event.timeNote; });
  const base = date || new Date();
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: MOSCOW }).formatToParts(base).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  const weddingYear = Number(parts.year), weddingMonth = Number(parts.month) - 1, weddingDay = Number(parts.day);
  let viewYear = weddingYear, viewMonth = weddingMonth;
  const calendar = document.querySelector('[data-calendar]');
  const dialog = document.querySelector('#date-dialog');

  function renderCalendar() {
    const monthLabel = dateText(new Date(Date.UTC(viewYear, viewMonth, 15)), { month: 'long', year: 'numeric' }).replace(' г.', '');
    const firstWeekday = (new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay() + 6) % 7;
    const lastDay = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
    const isWeddingMonth = Boolean(date && viewYear === weddingYear && viewMonth === weddingMonth);
    let grid = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(name => `<span class="calendar-weekday">${name}</span>`).join('');
    grid += '<span aria-hidden="true"></span>'.repeat(firstWeekday);
    for (let current = 1; current <= lastDay; current++) {
      const selected = isWeddingMonth && current === weddingDay;
      grid += selected
        ? `<button type="button" class="calendar-day is-wedding" aria-label="${escapeHtml(dateText(date, { day: 'numeric', month: 'long' }))} — день свадьбы. Открыть подробности">${current}<svg aria-hidden="true"><use href="#icon-heart"/></svg></button>`
        : `<span class="calendar-day">${current}</span>`;
    }
    calendar.innerHTML = `<div class="calendar-navigation"><button type="button" class="month-arrow" data-month="-1" aria-label="Предыдущий месяц">←</button><p class="calendar-month" aria-live="polite">${escapeHtml(monthLabel)}</p><button type="button" class="month-arrow" data-month="1" aria-label="Следующий месяц">→</button></div><div class="calendar-grid">${grid}</div>${date ? '<button type="button" class="calendar-reset">К дате свадьбы</button>' : '<p class="calendar-note">Дата свадьбы — (ЗАПОЛНИТЬ)</p>'}`;
    calendar.querySelectorAll('[data-month]').forEach(button => {
      button.addEventListener('click', () => {
        const direction = button.dataset.month;
        viewMonth += Number(direction);
        if (viewMonth > 11) { viewMonth = 0; viewYear++; }
        if (viewMonth < 0) { viewMonth = 11; viewYear--; }
        renderCalendar();
        calendar.querySelector(`[data-month="${direction}"]`).focus({ preventScroll: true });
      });
    });
    calendar.querySelector('.calendar-reset')?.addEventListener('click', () => {
      viewYear = weddingYear; viewMonth = weddingMonth; renderCalendar();
      calendar.querySelector('.is-wedding').focus({ preventScroll: true });
    });
    calendar.querySelector('.is-wedding')?.addEventListener('click', () => dialog.showModal());
  }
  renderCalendar();
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('a').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  if (!date) return;

  document.querySelector('[data-date-stamp]').classList.remove('is-placeholder');
  document.querySelector('[data-date-stamp]').innerHTML = `${parts.day}<span class="stamp-dot">.</span><br>${parts.month}<span class="stamp-dot">.</span><br>${parts.year}`;
  const timeDescription = dateOnly ? '' : ` в ${dateText(date, { hour: '2-digit', minute: '2-digit' })}`;
  document.querySelector('[data-date-dialog]').textContent = `${dateText(date, { day: 'numeric', month: 'long', year: 'numeric' })}${timeDescription}. ${event.city}, ${event.venue}.`;
  const note = document.querySelector('[data-countdown-note]');
  const values = document.querySelectorAll('[data-countdown] strong');
  const futureNote = `До ${dateText(date, { day: 'numeric', month: 'long' })} — и нашей новой главы.`;
  function updateCountdown() {
    const seconds = Math.max(0, Math.floor((date.getTime() - Date.now()) / 1000));
    const remaining = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    values.forEach((element, index) => {
      const value = pad(remaining[index]);
      if (element.textContent !== value) element.textContent = value;
    });
    const message = seconds > 0 ? futureNote : 'Наш день наступил. Спасибо, что вы с нами!';
    if (note.textContent !== message) note.textContent = message;
  }
  let timer;
  const startTimer = () => {
    clearInterval(timer);
    updateCountdown();
    if (!document.hidden) timer = setInterval(updateCountdown, 1000);
  };
  startTimer();
  window.addEventListener('pagehide', () => clearInterval(timer));
  window.addEventListener('pageshow', event => { if (event.persisted) startTimer(); });
  document.addEventListener('visibilitychange', startTimer);

}
window.Wedding.setupDate = setupDate;
})();
