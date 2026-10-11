import { useEffect, useState } from 'react';
import { AppBar } from '../components/ui.jsx';
import { NavPrincipal, useEntradaDeTab } from './Inicio.jsx';
import { track } from '../logic.js';

// Pantalla "Inversiones" según Figma (89:20814). Las tarjetas son exportaciones de Figma.
// Mantiene la barra de navegación principal con Inversiones activo.
// Las tarjetas 2 a 4 dependen de servicios: muestran un esqueleto con su misma forma y tamaño
// (sin saltos de layout) y aparecen con un fundido cuando "llegan" los datos.
// Plazo fijo: toda la tarjeta lleva al home de Plazo fijo; "Simular" entra directo al flujo.
const IMG = `${import.meta.env.BASE_URL}inversiones/`;
const CARGA_MS = 1400;

// Formas del esqueleto en coordenadas de Figma (px de la card de 332 de ancho).
const ESQUELETOS = {
  dolares: { h: 152, partes: [[12, 13, 150, 14], [12, 50, 52, 52, 'circ'], [79, 54, 70, 16], [79, 79, 90, 11], [79, 97, 90, 11], [12, 119, 149, 21], [173, 119, 149, 21]] },
  plazo: { h: 139, partes: [[12, 13, 70, 14], [12, 43, 52, 52, 'circ'], [72, 55, 220, 11], [72, 73, 150, 11], [12, 106, 149, 21], [173, 106, 149, 21]] },
  fondos: { h: 139, partes: [[12, 13, 100, 14], [12, 42, 54, 54, 'circ'], [74, 55, 218, 11], [74, 73, 120, 11], [12, 106, 309, 21]] },
};

function Esqueleto({ forma }) {
  const { h, partes } = ESQUELETOS[forma];
  return (
    <div className="inv-skel" aria-hidden="true">
      {partes.map(([x, y, w, alto, tipo], i) => (
        <span key={i} className={`skeleton ${tipo === 'circ' ? 'circ' : ''}`}
          style={{ left: `${(x / 332) * 100}%`, top: `${(y / h) * 100}%`, width: `${(w / 332) * 100}%`, height: `${(alto / h) * 100}%` }} />
      ))}
    </div>
  );
}

// Reserva el tamaño exacto de la card (aspect-ratio) y superpone esqueleto y contenido.
function Ranura({ forma, listo, children }) {
  return (
    <div className={`inv-slot ${listo ? 'listo' : ''}`} style={{ aspectRatio: `332 / ${ESQUELETOS[forma].h}` }} aria-busy={!listo}>
      <Esqueleto forma={forma} />
      <div className="inv-content">{children}</div>
    </div>
  );
}

export function Inversiones({ nav }) {
  const entrada = useEntradaDeTab();
  const [listo, setListo] = useState(false);
  useEffect(() => { const id = setTimeout(() => setListo(true), CARGA_MS); return () => clearTimeout(id); }, []);

  const abrirPlazoFijo = () => { track('pf_entry', { origen: 'inversiones_card' }); nav.push('plazoFijo'); };
  const simular = (e) => {
    e.stopPropagation();
    track('pf_entry', { origen: 'inversiones_simular' });
    nav.goto(['inicio', 'inversiones', 'elegirTipo'], { tipoDraft: null });
  };
  return (
    <div className="screen">
      <AppBar title="Inversiones" />
      <main className={`content ${entrada}`}><div className="content-inner"><div className="inv-list">
        <img draggable={false} className="inv-card pionero" src={`${IMG}pionero.webp`} alt="Cuenta Pionero: obtené rendimientos diarios y tené tu dinero siempre disponible para realizar transferencias." />
        <Ranura forma="dolares" listo={listo}>
          <img draggable={false} className="inv-card" src={`${IMG}dolares.webp`} alt="Comprar y vender dólares. USD 0,00. Compra: $ 1.540. Venta: $ 1.480." />
        </Ranura>
        <Ranura forma="plazo" listo={listo}>
          <div
            className="inv-card inv-link" role="button" tabIndex={listo ? 0 : -1} onClick={abrirPlazoFijo}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirPlazoFijo(); } }}
            aria-label="Plazo fijo. Simulá un plazo fijo y conocé cuánto podrías ganar antes de invertir."
          >
            <img draggable={false} src={`${IMG}plazo-fijo.webp`} alt="" />
            <button className="inv-hit" style={{ left: '3.61%', top: '76.26%', width: '44.88%', height: '15.11%' }} onClick={simular} tabIndex={listo ? 0 : -1}>
              <span className="sr-only">Simular</span>
            </button>
          </div>
        </Ranura>
        <Ranura forma="fondos" listo={listo}>
          <img draggable={false} className="inv-card" src={`${IMG}fondos.webp`} alt="Macro fondos: accedé a inversiones colectivas hechas a tu medida." />
        </Ranura>
      </div></div></main>
      <NavPrincipal activa="inversiones" nav={nav} />
    </div>
  );
}
