(() => {
'use strict';

function setupRsvp() {
  const form = document.querySelector('#guest-form');
  const preferences = document.querySelector('#guest-preferences');
  const fields = preferences.querySelectorAll('input');

  function updateAttendance() {
    const absent = form.elements.attendance.value === 'no';
    preferences.hidden = absent;
    fields.forEach(input => { input.disabled = absent; });
  }

  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('change', updateAttendance);
  updateAttendance();
}

window.Wedding.setupRsvp = setupRsvp;
})();
