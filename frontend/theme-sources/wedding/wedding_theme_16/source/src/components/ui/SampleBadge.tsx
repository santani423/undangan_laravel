import { Info } from 'lucide-react';

/** Discreet notice that the invitation still shows placeholder data. */
export function SampleBadge() {
  return (
    <p
      className="glass-pill fixed left-3 top-3 z-30 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-medium text-gold-ink opacity-90 sm:px-3 sm:py-1.5 sm:text-[0.72rem]"
      title="Nama, lokasi, foto, dan data hadiah masih berupa contoh. Ganti di src/data/invitation.ts."
    >
      <Info aria-hidden="true" className="size-3.5" />
      Mode contoh<span className="hidden sm:inline"> · data pengganti</span>
    </p>
  );
}
