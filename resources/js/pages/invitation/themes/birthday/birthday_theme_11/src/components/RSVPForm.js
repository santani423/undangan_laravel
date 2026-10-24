import { eventTitle } from './CalendarDownload.js';
import { formatEventDay, formatTimeRange } from '../utils/date.js';

// Pure helpers (unit-tested) ---------------------------------------------------

/** Digits only. Returns '' when the result is not a plausible international number. */
export function normalizeWhatsAppNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15 ? digits : '';
}

export function validateRsvp(data, { maxGuests = 4, messageMaxLength = 280 } = {}) {
  const errors = {};
  const name = String(data.name ?? '').trim();
  if (!name) errors.name = 'Please enter your name so we know who is coming.';
  else if (name.length < 2) errors.name = 'Your name needs at least 2 characters.';
  else if (name.length > 60) errors.name = 'Please keep your name under 60 characters.';

  if (data.attendance !== 'yes' && data.attendance !== 'no') {
    errors.attendance = 'Please choose whether you can come.';
  }

  if (data.attendance === 'yes') {
    const guests = Number(data.guests);
    if (!Number.isInteger(guests) || guests < 1 || guests > maxGuests) {
      errors.guests = `Choose between 1 and ${maxGuests} ${maxGuests === 1 ? 'guest' : 'guests'}.`;
    }
  }

  const message = String(data.message ?? '');
  if (message.trim().length > messageMaxLength) {
    errors.message = `Please keep your message under ${messageMaxLength} characters.`;
  }
  return errors;
}

export function buildRsvpMessage(data, config) {
  const attending = data.attendance === 'yes';
  const guests = Number(data.guests);
  const lines = [
    `Hi! This is my RSVP for ${eventTitle(config)} 🎉`,
    `(${formatEventDay(config.event)}, ${formatTimeRange(config.event)})`,
    '',
    `Name: ${String(data.name).trim()}`,
    `Attending: ${attending ? "Yes, we'll be there!" : "Sorry, we can't make it."}`,
  ];
  if (attending) lines.push(`Number of guests: ${guests}`);
  const message = String(data.message ?? '').trim();
  if (message) lines.push('', `Message for ${config.child.name}: ${message}`);
  return lines.join('\n');
}

export function buildWhatsAppUrl(number, message) {
  const digits = normalizeWhatsAppNumber(number);
  if (!digits) throw new Error('The WhatsApp number in the invitation config is missing or invalid.');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Form controller ---------------------------------------------------------------

export class RSVPForm {
  /**
   * @param {HTMLFormElement} form
   * @param {object} config resolved invitation config
   * @param {{ onSubmitted?: (data) => void, onReset?: () => void, onInteract?: () => void }} hooks
   */
  constructor(form, config, hooks = {}) {
    this.form = form;
    this.config = config;
    this.hooks = hooks;
    this.maxGuests = Math.max(1, Number(config.rsvp.maxGuestsPerReply) || 1);
    this.messageMax = Number(config.rsvp.messageMaxLength) || 280;

    this.fields = {
      name: form.elements.namedItem('name'),
      guests: form.elements.namedItem('guests'),
      message: form.elements.namedItem('message'),
    };
    this.guestsGroup = form.querySelector('[data-guests-group]');
    this.counter = form.querySelector('[data-message-count]');
    this.status = form.querySelector('[data-form-status]');
    this.success = document.querySelector('[data-rsvp-success]');
    this.preview = this.success?.querySelector('[data-rsvp-preview]');
    this.whatsappLink = this.success?.querySelector('[data-rsvp-whatsapp]');
    this.copyButton = this.success?.querySelector('[data-rsvp-copy]');
    this.editButton = this.success?.querySelector('[data-rsvp-edit]');
    this.lastMessage = '';

    this.fields.guests.max = String(this.maxGuests);
    this.fields.message.maxLength = this.messageMax;
    form.querySelector('[data-guests-max]').textContent = String(this.maxGuests);

    form.noValidate = true;
    form.addEventListener('submit', (e) => this.#submit(e));
    form.addEventListener('change', (e) => this.#onChange(e));
    form.addEventListener('input', (e) => this.#onInput(e));
    form.querySelectorAll('[data-step]').forEach((btn) =>
      btn.addEventListener('click', () => this.#step(Number(btn.dataset.step))),
    );
    form.querySelectorAll('input, textarea').forEach((input) =>
      input.addEventListener('blur', () => this.#validateField(input.name)),
    );
    this.copyButton?.addEventListener('click', () => this.#copy());
    this.editButton?.addEventListener('click', () => this.showForm());
    this.#syncGuests();
    this.#updateCounter();
  }

  get data() {
    const fd = new FormData(this.form);
    return {
      name: fd.get('name') ?? '',
      attendance: fd.get('attendance') ?? '',
      guests: fd.get('guests') ?? '',
      message: fd.get('message') ?? '',
    };
  }

  #onChange(e) {
    if (e.target.name === 'attendance') {
      this.#syncGuests();
      this.#setError('attendance', '');
    }
  }

  #onInput(e) {
    this.hooks.onInteract?.();
    if (e.target.name === 'message') this.#updateCounter();
    if (e.target.getAttribute('aria-invalid') === 'true') this.#validateField(e.target.name);
  }

  #step(delta) {
    const current = Number(this.fields.guests.value) || 1;
    this.fields.guests.value = String(Math.min(this.maxGuests, Math.max(1, current + delta)));
    this.#validateField('guests');
    this.#syncStepper();
  }

  #syncStepper() {
    const value = Number(this.fields.guests.value) || 1;
    this.form.querySelector('[data-step="-1"]').disabled = this.fields.guests.disabled || value <= 1;
    this.form.querySelector('[data-step="1"]').disabled = this.fields.guests.disabled || value >= this.maxGuests;
  }

  #syncGuests() {
    const attending = this.data.attendance === 'yes';
    this.guestsGroup.hidden = !attending;
    this.fields.guests.disabled = !attending;
    if (!attending) this.#setError('guests', '');
    this.#syncStepper();
  }

  #updateCounter() {
    const length = this.fields.message.value.length;
    this.counter.textContent = `${length} / ${this.messageMax}`;
  }

  #validateField(name) {
    if (!name) return true;
    const errors = validateRsvp(this.data, { maxGuests: this.maxGuests, messageMaxLength: this.messageMax });
    // Only show an attendance error after submit, not on blur of a single radio.
    if (name === 'attendance') return !errors.attendance;
    this.#setError(name, errors[name] || '');
    return !errors[name];
  }

  #setError(name, message) {
    const error = this.form.querySelector(`[data-error-for="${name}"]`);
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
    const targets =
      name === 'attendance' ? this.form.querySelectorAll('input[name="attendance"]') : [this.fields[name]].filter(Boolean);
    targets.forEach((input) => {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    });
    this.form.querySelector(`[data-field="${name}"]`)?.classList.toggle('has-error', Boolean(message));
  }

  #submit(event) {
    event.preventDefault();
    const data = this.data;
    const errors = validateRsvp(data, { maxGuests: this.maxGuests, messageMaxLength: this.messageMax });
    ['name', 'attendance', 'guests', 'message'].forEach((key) => this.#setError(key, errors[key] || ''));

    const invalid = Object.keys(errors);
    if (invalid.length) {
      this.#announce(
        `Please fix ${invalid.length === 1 ? 'the highlighted field' : `${invalid.length} highlighted fields`} and try again.`,
        'error',
      );
      const first = invalid[0] === 'attendance' ? this.form.querySelector('input[name="attendance"]') : this.fields[invalid[0]];
      first?.focus();
      return;
    }

    let url;
    try {
      this.lastMessage = buildRsvpMessage(data, this.config);
      url = buildWhatsAppUrl(this.config.host.whatsappNumber, this.lastMessage);
    } catch (err) {
      this.#announce(`${err.message} Ask the host for another way to reply.`, 'error');
      return;
    }

    const opened = window.open(url, '_blank');
    if (opened) opened.opener = null;
    this.#showSuccess(url, Boolean(opened), data);
    this.hooks.onSubmitted?.(data);
  }

  #showSuccess(url, opened, data) {
    this.#announce('', 'info');
    this.whatsappLink.href = url;
    this.preview.textContent = this.lastMessage;
    const heading = this.success.querySelector('[data-rsvp-success-heading]');
    const lead = this.success.querySelector('[data-rsvp-success-lead]');
    heading.textContent = data.attendance === 'yes' ? 'Your reply is ready to send' : 'Thanks for letting us know';
    lead.textContent = opened
      ? 'WhatsApp opened in a new tab with your reply already written. Press send in WhatsApp to deliver it. Nothing is saved on this website.'
      : 'Your browser blocked the new tab. Use the WhatsApp button below, then press send in WhatsApp. Nothing is saved on this website.';
    this.form.hidden = true;
    this.success.hidden = false;
    heading.focus();
  }

  showForm() {
    this.success.hidden = true;
    this.form.hidden = false;
    this.fields.name.focus();
    this.hooks.onReset?.();
  }

  async #copy() {
    const done = (text) => {
      this.copyButton.textContent = text;
      setTimeout(() => (this.copyButton.textContent = 'Copy message'), 2200);
    };
    try {
      await navigator.clipboard.writeText(this.lastMessage);
      done('Copied');
    } catch {
      // Clipboard API unavailable (insecure context, permissions) — select the preview instead.
      const range = document.createRange();
      range.selectNodeContents(this.preview);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      done('Selected, press Ctrl+C');
    }
  }

  #announce(message, tone) {
    this.status.textContent = message;
    this.status.dataset.tone = tone;
    this.status.hidden = !message;
  }

  /** Clears the form and returns to the empty state (used by "Replay"). */
  reset() {
    this.form.reset();
    ['name', 'attendance', 'guests', 'message'].forEach((key) => this.#setError(key, ''));
    this.#announce('', 'info');
    this.success.hidden = true;
    this.form.hidden = false;
    this.#syncGuests();
    this.#updateCounter();
  }
}
