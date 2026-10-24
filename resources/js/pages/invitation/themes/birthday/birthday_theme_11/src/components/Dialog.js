/**
 * Thin wrapper around the native <dialog> element: modal focus handling, Esc to close,
 * click on the backdrop to close, and focus returned to whatever opened it.
 */
export class Dialog {
  constructor(element, { onClose } = {}) {
    this.element = element;
    this.onClose = onClose;
    this.opener = null;

    element.addEventListener('click', (e) => {
      // Clicks on the ::backdrop land on the dialog element itself.
      if (e.target === element) this.close();
    });
    element.querySelectorAll('[data-dialog-close]').forEach((btn) => btn.addEventListener('click', () => this.close()));
    element.addEventListener('close', () => {
      document.documentElement.classList.remove('has-dialog');
      this.onClose?.();
      const opener = this.opener;
      this.opener = null;
      if (opener?.isConnected && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
    });
  }

  get isOpen() {
    return this.element.open;
  }

  open(opener = document.activeElement) {
    if (!this.element.open) {
      this.opener = opener instanceof HTMLElement && opener !== document.body ? opener : null;
      this.element.showModal();
      document.documentElement.classList.add('has-dialog');
    }
  }

  close() {
    if (this.element.open) this.element.close();
  }
}
