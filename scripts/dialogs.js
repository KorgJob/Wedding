(() => {
'use strict';

function setupDialogs() {
  document.querySelectorAll('dialog').forEach(dialog => {
    if (typeof dialog.showModal === 'function' && typeof dialog.close === 'function') return;
    let backdrop;
    let previousFocus;
    const focusable = () => Array.from(dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(element => element.getClientRects().length && !element.closest('[inert]'));
    dialog.classList.add('dialog-fallback');
    dialog.setAttribute('role', 'dialog');
    if (!('open' in dialog)) Object.defineProperty(dialog, 'open', { get: () => dialog.hasAttribute('open') });

    dialog.showModal = () => {
      if (dialog.open) return;
      previousFocus = document.activeElement;
      backdrop = document.createElement('div');
      backdrop.className = 'dialog-fallback-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.addEventListener('click', () => dialog.close());
      dialog.before(backdrop);
      dialog.setAttribute('open', '');
      dialog.setAttribute('aria-modal', 'true');
      document.documentElement.classList.add('dialog-fallback-open');
      (focusable()[0] || dialog).focus({ preventScroll: true });
    };
    dialog.close = () => {
      if (!dialog.open) return;
      dialog.removeAttribute('open');
      dialog.removeAttribute('aria-modal');
      backdrop.remove();
      if (!document.querySelector('.dialog-fallback[open]')) document.documentElement.classList.remove('dialog-fallback-open');
      dialog.dispatchEvent(new Event('close'));
      if (previousFocus?.isConnected && !dialog.contains(previousFocus)) previousFocus.focus({ preventScroll: true });
    };
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (dialog.dispatchEvent(new Event('cancel', { cancelable: true }))) dialog.close();
      }
      if (event.key !== 'Tab') return;
      const controls = focusable();
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    });
  });
}

window.Wedding.setupDialogs = setupDialogs;
})();
