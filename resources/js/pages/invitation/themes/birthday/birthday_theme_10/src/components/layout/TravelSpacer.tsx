import { Car } from 'lucide-react';

/** Empty scroll distance between destinations where the camera travels. */
export function TravelSpacer({ label }: { label: string }) {
  return (
    <div aria-hidden="true" className="pointer-events-none flex h-[55svh] items-center justify-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 font-display text-sm font-medium text-toy-ink/80 shadow-sm">
        <Car size={16} />
        {label}…
      </span>
    </div>
  );
}
