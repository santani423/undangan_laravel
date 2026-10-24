import { cx } from '../lib/helpers';

/** Small polite status message at the bottom of the screen (one at a time). */
export function Toast({ message, visible }: { message: string; visible: boolean }) {
    return (
        <div className={cx('bt11-toast', visible && 'is-visible')} role="status" aria-live="polite">
            {message}
        </div>
    );
}
