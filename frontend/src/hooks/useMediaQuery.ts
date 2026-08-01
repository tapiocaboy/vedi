import { useEffect, useState } from 'react';

/**
 * Live match state for a CSS media query.
 *
 * Used where a layout genuinely changes shape rather than size — the chart side
 * panel opens a second pane beside itself on a wide screen and a full-screen
 * overlay on a phone, which is two different component trees, not one that
 * Tailwind breakpoints can switch.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
