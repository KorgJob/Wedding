(() => {
'use strict';
const app = window.Wedding = window.Wedding || {};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function icon(name, className = 'icon') {
  const allowed = ['glasses', 'rings', 'dinner', 'cake', 'music', 'sparkle', 'heart', 'flower', 'envelope'];
  const safeName = allowed.includes(name) ? name : 'heart';
  return `<svg class="${className}" aria-hidden="true"><use href="#icon-${safeName}"/></svg>`;
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach(element => { element.textContent = value; });
}

function renderContent(content) {
  const { couple, event, invitation, schedule, dresscode, rsvp } = content;
  const names = `${couple.groom} и ${couple.bride}`;
  document.title = `${names} — приглашение на свадьбу`;
  document.querySelector('.monogram').innerHTML = `${escapeHtml(couple.groom[0])} <span>&</span> ${escapeHtml(couple.bride[0])}`;
  setText('[data-intro-groom]', couple.groom);
  setText('[data-intro-bride]', couple.bride);
  setText('[data-intro-monogram]', `${couple.groom[0]} & ${couple.bride[0]}`);
  const namesMarkup = `<span class="couple-name">${escapeHtml(couple.groom)}</span> <span class="couple-amp">&</span> <span class="couple-name">${escapeHtml(couple.bride)}</span>`;
  document.querySelectorAll('[data-couple]').forEach(element => {
    element.innerHTML = namesMarkup;
  });
  document.querySelector('[data-couple-lines]').innerHTML = namesMarkup;
  setText('[data-city]', event.city);
  setText('[data-venue]', event.venue);
  setText('[data-address]', event.address);
  if (event.mapUrl && /^https:\/\//.test(event.mapUrl)) document.querySelector('[data-map-link]').href = event.mapUrl;
  else document.querySelector('[data-map-link]').hidden = true;
  document.querySelector('[data-invitation]').innerHTML = invitation.paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('');
  setText('[data-signature]', invitation.signature);
  document.querySelector('[data-timeline]').innerHTML = schedule.items.map((item, index) => `
    <li class="timeline-item" data-reveal style="--reveal-delay:${index * 70}ms">
      <time class="timeline-time${item.time.includes('ЗАПОЛНИТЬ') ? ' is-placeholder' : ''}">${escapeHtml(item.time)}</time><span class="timeline-marker">${icon(item.icon)}</span>
      <div class="timeline-copy"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div>
    </li>`).join('');
  setText('[data-dresscode]', dresscode.description);
  setText('[data-dresscode-note]', dresscode.note);
  document.querySelector('[data-palette]').innerHTML = dresscode.colors.map(color => {
    const hex = /^#[\da-f]{6}$/i.test(color.hex) ? color.hex : '#c9b197';
    return `<span class="palette-color" style="--swatch:${hex}" role="img" aria-label="${escapeHtml(color.name)}" title="${escapeHtml(color.name)}"></span>`;
  }).join('');
  setText('[data-rsvp-description]', rsvp.description);
  document.querySelector('[data-meal-options]').innerHTML = rsvp.meals.map((meal, index) => `<label class="choice"><input type="radio" name="meal" value="${escapeHtml(meal)}" ${index === 0 ? 'required' : ''}><span>${escapeHtml(meal)}</span></label>`).join('');
  document.querySelector('[data-drink-options]').innerHTML = rsvp.drinks.map(drink => `<label class="choice"><input type="checkbox" name="drinks" value="${escapeHtml(drink)}"><span>${escapeHtml(drink)}</span></label>`).join('');
  if (event.replyBy) {
    const deadline = new Date(event.replyBy);
    if (!Number.isNaN(deadline.getTime())) {
      const element = document.querySelector('[data-reply-deadline]');
      element.textContent = `Пожалуйста, ответьте до ${new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Europe/Moscow' }).format(deadline)}.`;
      element.hidden = false;
    }
  }
  for (const [key, photo] of Object.entries(content.photos || {})) {
    document.querySelectorAll(`[data-photo="${key}"]`).forEach(image => {
      image.src = photo.src;
      image.alt = photo.alt || '';
      if (photo.position) image.style.objectPosition = photo.position;
      if (Number.isInteger(photo.width) && photo.width > 0) image.width = photo.width;
      if (Number.isInteger(photo.height) && photo.height > 0) image.height = photo.height;
    });
  }
  setText('[data-wishlist-description]', content.wishlist.description);
  document.querySelector('[data-contacts]').innerHTML = content.contacts.map((contact, index) => {
    const phone = String(contact.phone || '(ЗАПОЛНИТЬ)');
    const rawDigits = phone.replace(/\D/g, '');
    const digits = rawDigits.length === 11 && rawDigits.startsWith('8') ? `+7${rawDigits.slice(1)}` : `${phone.trim().startsWith('+') ? '+' : ''}${rawDigits}`;
    const phoneLink = /^\+?\d{10,15}$/.test(digits) ? `<a href="tel:${escapeHtml(digits)}">${escapeHtml(phone)}</a>` : `<span>${escapeHtml(phone)}</span>`;
    const telegram = /^https:\/\/t\.me\/[A-Za-z0-9_]+$/.test(contact.telegram) ? `<a class="text-link" href="${escapeHtml(contact.telegram)}" target="_blank" rel="noopener noreferrer">Написать в Telegram ↗</a>` : '';
    return `<article class="contact-card" data-reveal style="--reveal-delay:${index * 100}ms"><p class="eyebrow">${escapeHtml(contact.role)}</p><h3>${escapeHtml(contact.name)}</h3><p class="contact-phone">${phoneLink}</p>${telegram}</article>`;
  }).join('');
  document.querySelector('#rsvp').hidden = rsvp.enabled === false;
}
Object.assign(app, { escapeHtml, icon, renderContent });
})();
