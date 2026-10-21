export function maxScroll(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

/**
 * Scroll position at which each section is "framed": short sections are
 * centred in the viewport, tall ones have their top aligned to the top.
 * The camera reaches the matching waypoint exactly at that position.
 */
export function measureSectionAnchors(ids: readonly string[]): number[] {
  const vh = window.innerHeight;
  const max = maxScroll();
  const anchors = ids.map((id) => {
    const element = document.getElementById(id);
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    return Math.min(max, Math.max(0, top + Math.min(rect.height, vh) / 2 - vh / 2));
  });
  if (anchors.length > 0) {
    anchors[0] = 0;
    anchors[anchors.length - 1] = max;
  }
  for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
  return anchors;
}

export function scrollToSection(ids: readonly string[], id: string, smooth: boolean): void {
  const index = ids.indexOf(id);
  if (index < 0) return;
  const top = measureSectionAnchors(ids)[index];
  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  const heading = document.getElementById(`${id}-title`);
  heading?.focus({ preventScroll: true });
}
