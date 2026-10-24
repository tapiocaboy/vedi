/** Shared open and close timing so side panels and sections move the same way. */
export const slideEase = [0.22, 1, 0.36, 1] as const;

export const drawerTransition = {
  duration: 0.48,
  ease: slideEase,
};

export const backdropTransition = {
  duration: 0.36,
  ease: slideEase,
};

export const sectionTransition = {
  duration: 0.36,
  ease: slideEase,
};
