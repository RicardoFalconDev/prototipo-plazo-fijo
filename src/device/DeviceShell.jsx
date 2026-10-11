import { useEffect, useState } from 'react';
import { Icon } from '../components/ui.jsx';

// "nativo": celular real → pantalla completa con las barras del sistema del teléfono.
// "telefono": computadora → simulación de teléfono con barras dibujadas.
function detectMode() {
  const q = new URLSearchParams(location.search).get('modo');
  if (q === 'nativo' || q === 'telefono') return q;
  const touch = matchMedia('(hover: none) and (pointer: coarse)').matches;
  return touch || innerWidth < 600 ? 'nativo' : 'telefono';
}

export function useDeviceMode() {
  const [mode, setMode] = useState(detectMode);
  useEffect(() => {
    const on = () => setMode(detectMode());
    addEventListener('resize', on);
    return () => removeEventListener('resize', on);
  }, []);
  return mode;
}

function useClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 15000); return () => clearInterval(id); }, []);
  return t.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function StatusBar({ dark }) {
  const time = useClock();
  return (
    <div className={`statusbar ${dark ? 'dark' : ''}`} aria-hidden="true">
      <span className="t-label-md">{time}</span>
      <span className="sb-icons">
        {[4, 6, 8, 10].map((h) => <i key={h} style={{ height: h }} />)}
        <b><em /></b>
      </span>
    </div>
  );
}

function SystemNav({ onBack, onHome }) {
  return (
    <nav className="sysnav" aria-label="Navegación del sistema (simulada)">
      <button aria-label="Recientes" tabIndex={-1}><span className="recents"><i /><i /><i /></span></button>
      <button aria-label="Inicio" onClick={onHome}><span className="home" /></button>
      <button aria-label="Atrás" onClick={onBack}><Icon name="chevron-right" color="var(--color-icon-inverse)" style={{ transform: 'rotate(180deg)' }} /></button>
    </nav>
  );
}

function useScale() {
  const calc = () => Math.min(1, (innerHeight - 40) / 824);
  const [k, setK] = useState(calc);
  useEffect(() => { const on = () => setK(calc()); addEventListener('resize', on); return () => removeEventListener('resize', on); }, []);
  return k;
}

export function DeviceShell({ s, nav, children }) {
  const mode = useDeviceMode();
  const k = useScale();
  const overlay = !!s.sheet;
  useEffect(() => { document.documentElement.dataset.mode = mode; }, [mode]);

  if (mode === 'nativo') return <div className="native">{children}</div>;

  return (
    <div className="desk">
      <div className="stage" style={{ width: 384 * k, height: 824 * k }}>
        <div className="phone" style={{ transform: `scale(${k})` }}>
          <div className="phone-screen">
            <StatusBar dark={overlay} />
            <div className="phone-app">{children}</div>
            <SystemNav onBack={nav.back} onHome={nav.home} />
          </div>
        </div>
      </div>
    </div>
  );
}
