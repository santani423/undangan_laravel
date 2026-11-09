import { useEffect, useState } from 'react';
import type { SectionId } from '../data/sections';

/** Tracks which section currently crosses the middle of the viewport. */
export function useActiveSection(ids: SectionId[], enabled: boolean): SectionId {
  const [active, setActive] = useState<SectionId>(ids[0]);

  useEffect(() => {
    if (!enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [ids, enabled]);

  return active;
}
