import { useSmile } from '../context/SmileContext';
import { useNativeDialog } from '../hooks/useNativeDialog';
import { ACTIVITY_ART } from '../lib/assets';
import { CloseIcon } from './Icons';

/** Activity details sheet with previous / next, opened from a card or a toy on the island. */
export function ActivityDialog({ index, onChange, onClose }: { index: number | null; onChange: (index: number) => void; onClose: () => void }) {
    const { config } = useSmile();
    const activities = config.activities;
    const n = activities.length;
    const activity = index !== null ? activities[index] : null;
    const { ref, onBackdropClick, close } = useNativeDialog(index !== null, onClose, () =>
        activity ? document.querySelector<HTMLElement>(`[data-activity="${CSS.escape(activity.id)}"]`) : null,
    );

    return (
        <dialog ref={ref} className="bt11-sheet" aria-labelledby="bt11-activity-title" onClick={onBackdropClick}>
            <div className="bt11-sheet__inner">
                <button className="bt11-sheet__close" type="button" aria-label="Tutup detail aktivitas" onClick={close}>
                    <CloseIcon />
                </button>
                {activity && index !== null && (
                    <>
                        <img className="bt11-sheet__art" src={ACTIVITY_ART[activity.icon]} alt="" width={120} height={120} />
                        <h3 id="bt11-activity-title">{activity.title}</h3>
                        <p className="bt11-sheet__details">{activity.details || activity.summary}</p>
                        {n > 1 && (
                            <div className="bt11-sheet__footer">
                                <button
                                    className="bt11-btn bt11-btn--ghost bt11-btn--small"
                                    type="button"
                                    onClick={() => onChange((index - 1 + n) % n)}
                                >
                                    Sebelumnya
                                </button>
                                <span className="bt11-sheet__count">
                                    {index + 1} dari {n}
                                </span>
                                <button
                                    className="bt11-btn bt11-btn--secondary bt11-btn--small"
                                    type="button"
                                    onClick={() => onChange((index + 1) % n)}
                                >
                                    Aktivitas berikutnya
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </dialog>
    );
}
