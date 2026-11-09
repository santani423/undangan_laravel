import { useEffect, useState } from 'react';

/** `false` while the tab is hidden, so rendering and music can pause. */
export function usePageVisibility() {
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden');

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}
