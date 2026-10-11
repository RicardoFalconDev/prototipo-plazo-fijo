import { useCallback, useEffect, useReducer, useRef } from 'react';
import { MotionConfig } from 'framer-motion';
import { reducer, estadoInicial, simular, montoNumero, CUENTAS, TIPOS, track } from './logic.js';
import { Inicio } from './screens/Inicio.jsx';
import { Inversiones } from './screens/Inversiones.jsx';
import { PlazoFijo, ElegirTipo, Simular, ElegirCuenta, Revisar, Resultado } from './screens/screens.jsx';
import { Sheets } from './screens/sheets.jsx';
import { DeviceShell } from './device/DeviceShell.jsx';
import { JUMP_BY_KEY } from './jumps.js';

const SCREENS = { inicio: Inicio, inversiones: Inversiones, plazoFijo: PlazoFijo, elegirTipo: ElegirTipo, simular: Simular, elegirCuenta: ElegirCuenta, revisar: Revisar, resultado: Resultado };

export default function App() {
  const [s, dispatch] = useReducer(reducer, estadoInicial);
  const sRef = useRef(s);
  sRef.current = s;
  const depth = useRef(0);

  const set = useCallback((patch) => dispatch({ type: 'set', patch }), []);

  const pushHistory = () => { depth.current += 1; history.pushState({ d: depth.current }, ''); };

  // Navegación conectada al historial: el botón atrás del navegador/Android cierra hojas y vuelve de pantalla.
  useEffect(() => {
    history.replaceState({ d: 0 }, '');
    const onPop = () => {
      depth.current = Math.max(0, depth.current - 1);
      dispatch({ type: 'back' });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Saltos directos (inicio, ?pantalla=): agrega `n` entradas propias para que "atrás" recorra el stack.
  // Nunca usa history.go: rebobinar podía salir del prototipo si la pestaña venía de otra página.
  const resetHistory = (n) => {
    depth.current = 0;
    for (let i = 0; i < n; i++) pushHistory();
  };

  const nav = {
    push: (screen) => { pushHistory(); dispatch({ type: 'push', screen }); },
    sheet: (sheet) => { pushHistory(); dispatch({ type: 'sheet', sheet }); },
    back: () => { if (depth.current > 0) history.back(); else dispatch({ type: 'back' }); },
    // "home" vuelve al hub de Plazo fijo (con Inicio debajo); "inicio" vuelve a la pantalla de inicio.
    home: () => { resetHistory(1); dispatch({ type: 'home' }); },
    inicio: () => { resetHistory(0); dispatch({ type: 'inicio' }); },
    goto: (stack, patch = {}, sheet = null) => {
      resetHistory(stack.length - 1 + (sheet ? 1 : 0));
      dispatch({ type: 'goto', stack, patch, sheet });
    },
  };

  const finalizarOk = (base) => {
    const inv = { ...base, id: String(2000800010000000 + Math.floor(Math.random() * 999999)), creado: Date.now() };
    set({ inversiones: [...sRef.current.inversiones, inv], resultado: 'ok', confirmando: false, pendiente: null, monedaHome: TIPOS[inv.tipo].moneda });
    track('pf_constitution_result', { resultado: 'ok' });
  };

  const confirmar = () => {
    const st = sRef.current;
    if (st.confirmando) return;
    set({ confirmando: true });
    const monto = montoNumero(st.montoTexto);
    const r = simular({ tipo: st.tipo, monto, dias: st.dias });
    const cuenta = CUENTAS[TIPOS[st.tipo].moneda].find((c) => c.id === st.cuenta);
    const base = { tipo: st.tipo, monto, ganancia: r.ganancia, total: r.total, vence: r.fecha.getTime(), cuentaNombre: cuenta?.nombre };
    setTimeout(() => {
      if (sRef.current.escenario.banco === 'pendiente') {
        set({ resultado: 'pendiente', confirmando: false, pendiente: { ...base, solicitud: 'SOL-' + Math.floor(10000 + Math.random() * 89999) } });
        track('pf_constitution_result', { resultado: 'pendiente' });
      } else finalizarOk(base);
      nav.goto(['inicio', 'plazoFijo', 'resultado']);
    }, 1200);
  };

  const consultar = () => {
    set({ confirmando: true });
    setTimeout(() => finalizarOk(sRef.current.pendiente), 1200);
  };

  // Salto directo a una pantalla o estado (?pantalla=05).
  const jump = (key) => {
    const j = JUMP_BY_KEY[key];
    if (!j) return;
    const patch = { ...j.patch };
    if (patch.demoInversion) {
      const monto = montoNumero(patch.montoTexto);
      const r = simular({ tipo: patch.tipo, monto, dias: patch.dias });
      const cuenta = CUENTAS[TIPOS[patch.tipo].moneda].find((c) => c.id === patch.cuenta);
      const inv = { tipo: patch.tipo, monto, ganancia: r.ganancia, total: r.total, vence: r.fecha.getTime(), cuentaNombre: cuenta?.nombre, creado: Date.now() };
      if (patch.resultado === 'ok') { patch.inversiones = [{ ...inv, id: '2000800010122196' }]; patch.pendiente = null; }
      else { patch.inversiones = []; patch.pendiente = { ...inv, solicitud: 'SOL-48213' }; }
      delete patch.demoInversion;
    }
    nav.goto(j.stack, patch, j.sheet || null);
  };

  useEffect(() => {
    const k = new URLSearchParams(location.search).get('pantalla');
    if (k) jump(k.toUpperCase());
    // Intersticial de bienvenida al encender el prototipo (no al entrar directo a una pantalla).
    else { const id = setTimeout(() => nav.sheet('intersticial'), 500); return () => clearTimeout(id); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const top = s.stack[s.stack.length - 1];
  const Current = SCREENS[top];
  const app = (
    <MotionConfig reducedMotion="user">
      <div className="app">
        {/* Cambio de pantalla instantáneo (sin transición). */}
        <div key={`${s.stack.length}-${top}`} className="screen-layer">
          <Current s={s} set={set} nav={nav} dispatch={dispatch} confirmar={confirmar} consultar={consultar} />
        </div>
        <Sheets s={s} set={set} nav={nav} />
      </div>
    </MotionConfig>
  );

  return <DeviceShell s={s} nav={nav}>{app}</DeviceShell>;
}
