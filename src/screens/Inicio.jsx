import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components/ui.jsx';
import { track } from '../logic.js';

// Pantalla de inicio según Figma "Inicio · Macro" (36:19610).
// Solo "Plazo fijo" y la tarjeta "Hacé rendir tus ahorros" navegan; el resto es contexto visual.
// Barra de navegación, tarjeta de débito, banners y tarjetas "Para vos" son exportaciones de Figma (fieles al diseño).

const IMG = `${import.meta.env.BASE_URL}inicio/`;
const AZUL = '#00529E';
const CLARO = '#E4F2FC';

const pesos = (x, y, s = 1) => (
  <text x={x} y={y} fontSize={9 * s} fontWeight="700" fontFamily="Roboto, sans-serif" textAnchor="middle" fill={CLARO}>$</text>
);

const TILE = {
  servicios: (<>
    <path d="M26.28 10.17H12.18V32.32L16.21 30.21L20.24 32.32L24.27 30.21L28.29 32.32V21.77" stroke={AZUL} strokeWidth="1.5" strokeLinecap="round" />
    <rect x="16.21" y="16.21" width="5.03" height="1.5" fill={AZUL} /><rect x="16.21" y="20.24" width="5.03" height="1.5" fill={AZUL} /><rect x="16.21" y="24.27" width="5.03" height="1.5" fill={AZUL} />
    <circle cx="27.79" cy="14.70" r="5.20" fill={AZUL} stroke={CLARO} strokeWidth="0.66" />{pesos(27.79, 17.9)}
  </>),
  recargar: (<>
    <path d="M30.31 14.57C25.29 7.50 14.24 9.52 11.23 16.58C7.21 25.67 15.25 34.76 24.29 31.73C28.30 31.73 30.31 29.71 32.32 26.68" stroke={AZUL} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M25.27 12.18L29.30 17.22L33.33 12.18" stroke={AZUL} strokeWidth="1.5" strokeLinecap="round" />
    <text x="20.8" y="27" fontSize="15" fontWeight="700" fontFamily="Roboto, sans-serif" textAnchor="middle" fill={AZUL}>$</text>
  </>),
  extraer: (<>
    <rect x="10.92" y="10.92" width="20.65" height="3.53" rx="1" stroke={AZUL} strokeWidth="1.5" />
    <rect x="15.95" y="13.94" width="10.58" height="17.63" rx="1" fill={CLARO} stroke={AZUL} strokeWidth="1.5" />
    <rect x="18.75" y="15.73" width="4.99" height="13.04" stroke={AZUL} strokeWidth="1.05" />
    <circle cx="21.25" cy="21.25" r="3.02" fill={AZUL} />{pesos(21.25, 23.1, 0.55)}
  </>),
  comprobantes: (<>
    <path d="M32.58 9.91V32.22L27.57 30.22L27.29 30.10L27.01 30.22L21.24 32.52L15.48 30.22L15.20 30.10L14.92 30.22L9.91 32.22V9.91H32.58Z" stroke={AZUL} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14.5 15.5h13.5M14.5 20h13.5M14.5 24.5h13.5" stroke={AZUL} strokeWidth="1.5" strokeLinecap="round" />
  </>),
  prestamos: (<>
    <path d="M9.16 32.32L15.20 25.27H23.26L25.27 27.29L23.26 29.30M16.21 32.32H25.27L33.33 24.27L31.31 22.25L23.26 29.30H17.22" stroke={AZUL} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="20.74" cy="15.71" r="4.78" stroke={AZUL} strokeWidth="1.5" />
    <text x="20.74" y="18.9" fontSize="9" fontWeight="700" fontFamily="Roboto, sans-serif" textAnchor="middle" fill={AZUL}>$</text>
  </>),
  fondos: <path d="M19.23 9.16H25.27V19.05M25.27 9.16C17.22 19.05 17.22 26.74 26.28 33.33M27.29 22.34H33.33M30.31 19.05V25.64M12.18 12.46V19.05M9.16 15.75H15.20M12.18 25.64V32.23M9.16 28.93H15.20" stroke={AZUL} strokeWidth="1.5" strokeLinecap="round" />,
  plazo: (<>
    <rect x="12.93" y="14.95" width="16.62" height="15.61" rx="1" stroke={AZUL} strokeWidth="1.5" />
    <rect x="12.18" y="19.23" width="18.12" height="1.5" fill={AZUL} />
    <rect x="16.21" y="10.17" width="1.5" height="7.04" rx="0.75" fill={AZUL} /><rect x="26.28" y="10.17" width="1.5" height="7.04" rx="0.75" fill={AZUL} />
    <circle cx="28.29" cy="29.30" r="4.78" fill={AZUL} stroke={CLARO} strokeWidth="0.5" />{pesos(28.29, 32.3, 0.9)}
  </>),
  mas: <path d="M21.25 9.16V33.33M9.16 21.25H33.33" stroke={AZUL} strokeWidth="1.5" strokeLinecap="round" />,
};

function Tile({ icon, size = 42, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 42 42" fill="none" aria-hidden="true">
      <rect width="42" height="42" rx="11.67" fill={CLARO} />
      {TILE[icon]}{children}
    </svg>
  );
}

const ACCESOS = [
  ['servicios', 'Pagar servicios'], ['recargar', 'Recargar'], ['extraer', 'Extraer efectivo'], ['comprobantes', 'Mis\ncomprobantes'],
  ['prestamos', 'Préstamos'], ['fondos', 'Macro\nfondos'], ['plazo', 'Plazo fijo'], ['mas', 'Más accesos'],
];

// Íconos exportados de Figma (Cuentas · 36:19613).
const ACCION = {
  transferir: <path d="M9.67 22V6.04M13.3 10.03L9.67 6.04L6.04 10.03M18.37 6.04V22M22 18.01L18.37 22L14.75 18.01" stroke={AZUL} strokeWidth="1.5" strokeLinecap="round" />,
  usd: <text x="4.33" y="17.08" fill={AZUL} fontFamily="Roboto, sans-serif" fontSize="10" fontWeight="700">U$D</text>,
  alias: (<>
    <path d="M6.71 8.04V21.33H17.34" stroke={AZUL} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15.70 7.46L19.25 11.01V19.92H10.12V7.46H15.70Z" stroke={AZUL} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16.01 6.71V10.70H20.00" stroke={AZUL} strokeWidth="1.5" strokeLinecap="round" />
  </>),
};
const Accion = ({ icon }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><rect width="27.5" height="27.5" rx="7.5" fill={CLARO} />{ACCION[icon]}</svg>
);
const Buscar = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><circle cx="5.60" cy="5.60" r="3.67" stroke="#fff" strokeWidth="1.5" /><path d="M8.85 8.85L12.98 12.98" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
);
const Ojo = () => (
  <svg width="19" height="12" viewBox="0 0 19 12" fill="none" aria-hidden="true"><path d="M0.72 5.62C4.68 -1.04 13.64 -1.04 17.61 5.62C13.64 12.29 4.68 12.29 0.72 5.62Z" stroke="#fff" strokeWidth="1.25" strokeLinecap="round" /><circle cx="9.17" cy="5.62" r="2.2" stroke="#fff" strokeWidth="1.25" /></svg>
);

function Cuenta({ titulo, saldo, acciones }) {
  return (
    <div className="home-account">
      <p className="t-body-sm" style={{ color: '#777C7D' }}>{titulo}</p>
      <div className="home-account-row">
        <p className="home-balance">{saldo}</p>
        <Icon name="chevron-right" color="#111" />
      </div>
      <div className="home-account-actions">
        {acciones.map(([icon, label]) => (
          <div key={label} className="home-mini">
            <Accion icon={icon} />
            <span className="home-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Carrusel horizontal: en touch/trackpad scrollea nativo (con snap); con mouse se arrastra.
// Al soltar proyecta la inercia del gesto, elige la tarjeta más cercana y llega con desaceleración.
// Un arrastre no dispara el tap.
function Carrusel({ className, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let x0 = 0, s0 = 0, k = 1, activo = false, movio = false, raf = 0;
    let muestras = []; // [tiempo, x] de los últimos 100 ms para medir velocidad

    const destinos = () => {
      const base = el.firstElementChild?.offsetLeft ?? 0;
      const max = el.scrollWidth - el.clientWidth;
      return [...el.children].map((c) => Math.min(max, Math.max(0, c.offsetLeft - base)));
    };
    const animar = (to) => {
      cancelAnimationFrame(raf);
      const from = el.scrollLeft, d = to - from;
      const fin = () => { el.style.scrollSnapType = ''; };
      if (reduce || Math.abs(d) < 1) { el.scrollLeft = to; fin(); return; }
      const dur = Math.min(520, 260 + Math.abs(d) * 0.6), t0 = performance.now();
      const paso = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        el.scrollLeft = from + d * (1 - Math.pow(1 - p, 3)); // ease-out cúbico
        if (p < 1) raf = requestAnimationFrame(paso); else fin();
      };
      raf = requestAnimationFrame(paso);
    };

    const down = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      cancelAnimationFrame(raf);
      activo = true; movio = false; x0 = e.clientX; s0 = el.scrollLeft;
      k = el.getBoundingClientRect().width / el.offsetWidth || 1; // el teléfono simulado puede estar escalado
      muestras = [[performance.now(), e.clientX]];
    };
    const move = (e) => {
      if (!activo) return;
      const dx = (e.clientX - x0) / k;
      if (!movio && Math.abs(dx) > 4) { movio = true; el.style.scrollSnapType = 'none'; el.classList.add('dragging'); }
      if (!movio) return;
      el.scrollLeft = s0 - dx;
      const t = performance.now();
      muestras.push([t, e.clientX]);
      while (muestras.length > 2 && t - muestras[0][0] > 100) muestras.shift();
    };
    const up = () => {
      if (!activo) return;
      activo = false;
      if (!movio) return;
      el.classList.remove('dragging');
      const [ta, xa] = muestras[0], [tb, xb] = muestras[muestras.length - 1];
      const v = tb > ta ? (xb - xa) / k / (tb - ta) : 0; // px por ms (positivo = arrastre a la derecha)
      const ds = destinos();
      const cerca = (x) => ds.reduce((m, d, i) => (Math.abs(d - x) < Math.abs(ds[m] - x) ? i : m), 0);
      const i0 = cerca(s0);
      // Inercia: la velocidad suma desplazamiento proyectado; como en las apps, avanza de a una tarjeta.
      let i = cerca(el.scrollLeft - v * 220);
      const arrastre = el.scrollLeft - s0;
      if (i === i0 && (Math.abs(arrastre) > 30 || Math.abs(v) > 0.3)) i = i0 + (arrastre > 0 ? 1 : -1);
      i = Math.max(0, Math.min(ds.length - 1, Math.max(i0 - 1, Math.min(i0 + 1, i))));
      const destino = ds[i];
      animar(destino);
    };
    const click = (e) => { if (movio) { e.stopPropagation(); e.preventDefault(); movio = false; } };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    el.addEventListener('click', click, true);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      el.removeEventListener('click', click, true);
    };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

// Cambio de pestaña: la pantalla que entra hace "fade through" (Material) y la barra queda quieta.
let ultimoCambioDeTab = 0;
export const useEntradaDeTab = () => useState(() => (Date.now() - ultimoCambioDeTab < 600 ? 'tab-in' : ''))[0];

// Barra de navegación principal (exportada de Figma, 36:19641). Solo Inicio e Inversiones navegan.
export function NavPrincipal({ activa, nav }) {
  const ir = (destino) => {
    if (destino === activa) return;
    ultimoCambioDeTab = Date.now();
    if (destino === 'inicio') nav.inicio(); else nav.push('inversiones');
  };
  return (
    <nav className="home-tabs" aria-label="Navegación principal">
      <div className="home-tabs-inner">
        <img draggable={false} src={`${IMG}${activa === 'inversiones' ? 'nav-inversiones' : 'nav'}.webp`} alt="" />
        <button className="home-tab-hit" style={{ left: 16, width: 64 }} aria-current={activa === 'inicio' ? 'page' : undefined} onClick={() => ir('inicio')}><span className="sr-only">Inicio</span></button>
        <button className="home-tab-hit" style={{ left: 216, width: 64 }} aria-current={activa === 'inversiones' ? 'page' : undefined} onClick={() => ir('inversiones')}><span className="sr-only">Inversiones</span></button>
      </div>
    </nav>
  );
}

export function Inicio({ set, nav }) {
  const irAPlazoFijo = () => { track('pf_entry', { origen: 'acceso_rapido' }); nav.push('plazoFijo'); };
  const simular = () => {
    track('pf_entry', { origen: 'para_vos' });
    nav.goto(['inicio', 'plazoFijo', 'elegirTipo'], { tipoDraft: null });
  };
  const entrada = useEntradaDeTab();
  return (
    <div className="screen home-screen">
      <main className={`content home-scroll ${entrada}`}>
        <header className="home-hero">
          <div className="home-top">
            <span className="home-avatar"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#0A2E6E" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" /></svg></span>
            <p className="home-hello">Hola, RICARDO ANTONIO</p>
            <span className="home-icon-btn"><Buscar /></span>
          </div>
          <div className="home-accounts-head">
            <p className="home-hello">Cuentas</p>
            <Ojo />
          </div>
          <Carrusel className="home-accounts">
            <Cuenta titulo="Caja de Ahorro $...3643" saldo="$ 1.000,00" acciones={[['transferir', 'Transferir'], ['usd', 'Comprar'], ['alias', 'Alias/CBU']]} />
            <Cuenta titulo="Cuenta de Ahorro" saldo="USD 0,00" acciones={[['transferir', 'Transferir'], ['usd', 'Vender'], ['alias', 'Alias/CBU']]} />
          </Carrusel>
        </header>

        <section className="home-panel">
          <div className="home-grid">
            {ACCESOS.map(([icon, label]) => {
              const activo = icon === 'plazo';
              const Tag = activo ? 'button' : 'div';
              return (
                <Tag key={icon} className={`home-access ${activo ? 'is-link' : ''}`} onClick={activo ? irAPlazoFijo : undefined}>
                  <Tile icon={icon} />
                  <span className="home-label pre-line">{label}</span>
                </Tag>
              );
            })}
          </div>

          <img draggable={false} className="home-img home-debit" src={`${IMG}debito.webp`} alt="Tarjeta de débito terminada en 5017" />

          <div className="home-section">
            <p className="home-title">Beneficios</p>
            <Carrusel className="home-hscroll">
              <img draggable={false} className="home-img home-promo" src={`${IMG}modo.webp`} alt="Pagando con MODO tenés más beneficios. Conocer más" />
              <img draggable={false} className="home-img home-promo light" src={`${IMG}tienda.webp`} alt="Tienda Macro: comprá en cuotas sin interés. Conocer más" />
            </Carrusel>
          </div>

          <div className="home-section">
            <p className="home-title">Para vos</p>
            <Carrusel className="home-hscroll">
              <button className="home-service is-link" onClick={simular} aria-label="Hacé rendir tus ahorros. Simular plazo fijo">
                <img draggable={false} className="home-img" src={`${IMG}s1.webp`} alt="" />
              </button>
              <img draggable={false} className="home-img home-service" src={`${IMG}s2.webp`} alt="¡Recargá todo desde la app! Ir a Recargar" />
              <img draggable={false} className="home-img home-service" src={`${IMG}s3.webp`} alt="Pagá tus servicios desde acá. Ir a pagar" />
              <img draggable={false} className="home-img home-service" src={`${IMG}s4.webp`} alt="Asegurá tu hogar. Ir a pagar" />
            </Carrusel>
          </div>
        </section>
      </main>

      <NavPrincipal activa="inicio" nav={nav} />
    </div>
  );
}
