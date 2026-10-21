import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from '../../hooks/useAppContext';
import { copyText } from '../../lib/clipboard';

interface CopyButtonProps {
  text: string;
  label: string;
  /** Accessible description, e.g. "Salin nomor rekening Nama Bank". */
  ariaLabel?: string;
  successMessage: string;
  variant?: 'primary' | 'secondary';
}

/** Copies `text` and confirms with an inline check mark plus a toast. */
export function CopyButton({ text, label, ariaLabel, successMessage, variant = 'secondary' }: CopyButtonProps) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      notify(successMessage, 'success');
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } else {
      notify('Gagal menyalin. Silakan salin secara manual.', 'error');
    }
  };

  return (
    <button type="button" onClick={onCopy} className={`btn btn-sm ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'}`} aria-label={ariaLabel}>
      {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
      <span>{copied ? 'Tersalin' : label}</span>
    </button>
  );
}
