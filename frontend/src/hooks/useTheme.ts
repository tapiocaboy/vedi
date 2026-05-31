import { useState, useEffect } from 'react';

export function useTheme(): boolean {
  const [isLight, setIsLight] = useState(() =>
    document.documentElement.classList.contains('theme-light')
  );

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains('theme-light'));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return isLight;
}
