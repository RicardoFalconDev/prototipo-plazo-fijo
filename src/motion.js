// Tokens de movimiento (complementan los tokens de diseño de Figma).
export const DUR = { micro: 0.1, short: 0.2, medium: 0.3, long: 0.45 };
export const EASE = {
  standard: [0.2, 0, 0, 1],
  enter: [0, 0, 0, 1], // desacelera: elementos que entran
  exit: [0.3, 0, 1, 1], // acelera: elementos que salen
};
export const SPRING = {
  sheet: { type: 'spring', stiffness: 420, damping: 38 },
  indicator: { type: 'spring', stiffness: 400, damping: 34 },
  pop: { type: 'spring', stiffness: 500, damping: 28 },
};

// Transición de pantalla: eje X compartido (Material). dir = 1 avanza, -1 vuelve.
export const screenVariants = {
  enter: (dir) => ({ x: dir >= 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: DUR.medium, ease: EASE.enter } },
  exit: (dir) => ({ x: dir >= 0 ? -24 : 24, opacity: 0, transition: { duration: DUR.short, ease: EASE.exit } }),
};

// Entrada escalonada de bloques (máx. ~700 ms en total).
export const stagger = { animate: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } };
export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: DUR.medium, ease: EASE.enter } },
};

// Vibración háptica breve (solo celulares que la soportan).
export function haptic(pattern = 10) {
  try { if (document.documentElement.dataset.mode === 'nativo' && navigator.vibrate) navigator.vibrate(pattern); } catch { /* sin soporte */ }
}
