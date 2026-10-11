import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui.jsx';

// Intersticial de bienvenida según Figma "Dialog" (99:24255, frame 01), 327 × 585.
// Fondo (degradé, elipses y foto) exportado de Figma; textos, íconos y botones en código.
// Posiciones en coordenadas del diseño (px dentro del diálogo) para respetarlo tal cual.
// Tipografías del diseño: Titillium Web (título) e Inter (textos).
const IMG = `${import.meta.env.BASE_URL}intersticial/`;
const SPRING = { type: 'spring', stiffness: 320, damping: 30, mass: 0.9 };
const OUT = [0.3, 0, 1, 1];
const IN = [0, 0, 0, 1];

// Entrada en cascada del contenido (después de que el diálogo se asienta).
const item = (i) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: IN, delay: 0.28 + i * 0.06 } },
});

const BENEFICIOS = [
  ['ganancia', 'Calculá tu ganancia estimada'],
  ['plazo', 'Elegí el plazo que prefieras'],
  ['seguro', 'Simulá sin invertir tu dinero'],
];

export function Intersticial({ onClose, onSimular }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    // La raíz es motion para que AnimatePresence desmonte la capa al terminar la salida.
    <motion.div
      className="inter-layer" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2, ease: OUT } }}
    >
      <motion.div
        className="inter-scrim" onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.26, ease: IN } }}
      />
      <motion.div
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="inter-titulo" aria-describedby="inter-desc"
        className="inter-dialog"
        initial={{ opacity: 0, y: 48, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { ...SPRING, opacity: { duration: 0.2, ease: IN } } }}
        exit={{ opacity: 0, y: 24, scale: 0.98, transition: { duration: 0.18, ease: OUT } }}
      >
        <motion.img
          className="inter-fondo" src={`${IMG}fondo.webp`} alt="" draggable={false}
          initial={{ scale: 1.08 }} animate={{ scale: 1, transition: { duration: 0.9, ease: IN } }}
        />

        <motion.button
          className="inter-cerrar" onClick={onClose} aria-label="Cerrar"
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1, transition: { ...SPRING, delay: 0.35 } }}
          whileTap={{ scale: 0.9 }}
        >
          <img src={`${IMG}cerrar.svg`} width="16" height="16" alt="" />
        </motion.button>

        <motion.h2 id="inter-titulo" className="inter-titulo" {...item(0)}>
          Descubrí <span>cuánto podés ganar</span>
        </motion.h2>
        <motion.p id="inter-desc" className="inter-desc" {...item(1)}>
          Simulá un Plazo Fijo y conocé el rendimiento estimado de tus ahorros antes de invertir.
        </motion.p>

        <ul className="inter-lista">
          {BENEFICIOS.map(([icon, texto], i) => (
            <motion.li key={icon} className="inter-item" style={{ top: 317 + i * 42 }} {...item(2 + i)}>
              <span className="inter-icono"><img src={`${IMG}${icon}.svg`} width="24" height="24" alt="" /></span>
              <span>{texto}</span>
            </motion.li>
          ))}
        </ul>

        <motion.div className="inter-acciones" {...item(6)}>
          <Button onClick={onSimular}>Simular plazo fijo</Button>
          <Button variant="secondary" onClick={onClose}>Ahora no</Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
