import { Car } from 'lucide-react';

/** Empty scroll distance between destinations where the camera travels. */
export function TravelSpacer({ label }: { label: string }) {
    return (
        <div aria-hidden="true" className="bt10-travel">
            <span className="bt10-travel__label">
                <Car size={16} />
                {label}…
            </span>
        </div>
    );
}
