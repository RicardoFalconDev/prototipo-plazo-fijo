import { useEffect, useState } from 'react';
import { Icon } from '../components/ui.jsx';
import { JUMPS } from '../jumps.js';

const FIGMA_URL = 'https://www.figma.com/design/ojhcfF0sAvAUHdnnqKluc5/Sandbox';

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

function Panel({ s, dispatch, nav, jump }) {
  const current = s.stack[s.stack.length - 1];
  return (
    <aside className="panel">
      <span className="t-label-md c-brand">PROTOTIPO NAVEGABLE · v1.0</span>
      <h1 className="t-headline-sm c-primary">Plazo fijo</h1>
      <p className="t-body-md c-secondary">Tu ahorro, en números claros. Simulá, elegí la cuenta y constituí un plazo fijo. Los cálculos funcionan en vivo.</p>

      <section>
        <h2 className="t-label-md c-tertiary">IR A UNA PANTALLA</h2>
        {JUMPS.map(([group, items]) => (
          <div key={group} className="jump-group">
            <p className="t-label-lg c-primary">{group}</p>
            {items.map(([key, label]) => (
              <button key={key} className="jump t-body-md" onClick={() => jump(key)}>{label}</button>
            ))}
          </div>
        ))}
      </section>

      <section>
        <h2 className="t-label-md c-tertiary">ESCENARIOS DE PRUEBA</h2>
        <label className="toggle t-body-md">
          <span>Respuesta del banco</span>
          <select value={s.escenario.banco} onChange={(e) => dispatch({ type: 'escenario', patch: { banco: e.target.value } })}>
            <option value="ok">Confirma la operación</option>
            <option value="pendiente">Queda pendiente</option>
          </select>
        </label>
        <label className="toggle t-body-md">
          <span>Cálculo de la simulación</span>
          <select value={s.escenario.red} onChange={(e) => dispatch({ type: 'escenario', patch: { red: e.target.value } })}>
            <option value="ok">Funciona</option>
            <option value="error">Falla la conexión</option>
          </select>
        </label>
        <p className="t-body-sm c-tertiary">Tip: con $ 5.000 se ve el saldo insuficiente; con menos de $ 1.000, el monto mínimo.</p>
        <button className="jump t-label-lg c-link" onClick={() => { dispatch({ type: 'reset' }); nav.home(); }}>↺ Reiniciar prototipo</button>
      </section>

      <footer>
        <a className="t-label-lg-underline c-link" href={FIGMA_URL} target="_blank" rel="noreferrer">Ver diseño y sistema en Figma</a>
        <p className="t-body-sm c-tertiary">Prototipo de diseño. No es una app oficial ni mueve dinero. Tasas y montos ilustrativos. Pantalla actual: {current}.</p>
      </footer>
    </aside>
  );
}

export function DeviceShell({ s, dispatch, nav, jump, children }) {
  const mode = useDeviceMode();
  const k = useScale();
  const overlay = !!s.sheet;
  useEffect(() => { document.documentElement.dataset.mode = mode; }, [mode]);

  if (mode === 'nativo') return <div className="native">{children}</div>;

  return (
    <div className="desk">
      <Panel s={s} dispatch={dispatch} nav={nav} jump={jump} />
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
