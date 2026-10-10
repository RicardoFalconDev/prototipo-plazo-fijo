import { useCallback, useEffect, useReducer, useRef } from 'react';
import { reducer, estadoInicial, simular, montoNumero, CUENTAS, TIPOS, track } from './logic.js';
import { PlazoFijo, ElegirTipo, Simular, ElegirCuenta, Revisar, Resultado } from './screens/screens.jsx';
import { Sheets } from './screens/sheets.jsx';
import { DeviceShell } from './device/DeviceShell.jsx';

const SCREENS = { plazoFijo: PlazoFijo, elegirTipo: ElegirTipo, simular: Simular, elegirCuenta: ElegirCuenta, revisar: Revisar, resultado: Resultado };

export default function App() {
  const [s, dispatch] = useReducer(reducer, estadoInicial);
  const sRef = useRef(s);
  sRef.current = s;
  const depth = useRef(0);
  const ignorePop = useRef(false);
  const pending = useRef(0);

  const set = useCallback((patch) => dispatch({ type: 'set', patch }), []);

  const pushHistory = () => { depth.current += 1; history.pushState({ d: depth.current }, ''); };
  const flushPending = () => { while (pending.current > 0) { pending.current -= 1; pushHistory(); } };

  // Navegación conectada al historial: el botón atrás del navegador/Android cierra hojas y vuelve de pantalla.
  useEffect(() => {
    history.replaceState({ d: 0 }, '');
    const onPop = () => {
      if (ignorePop.current) { ignorePop.current = false; flushPending(); return; }
      depth.current = Math.max(0, depth.current - 1);
      dispatch({ type: 'back' });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Vuelve el historial al inicio y luego agrega `n` entradas (para saltos directos a una pantalla).
  const resetHistory = (n) => {
    pending.current = n;
    if (depth.current > 0) { ignorePop.current = true; history.go(-depth.current); depth.current = 0; }
    else flushPending();
  };

  const nav = {
    push: (screen) => { pushHistory(); dispatch({ type: 'push', screen }); },
    sheet: (sheet) => { pushHistory(); dispatch({ type: 'sheet', sheet }); },
    back: () => { if (depth.current > 0) history.back(); else dispatch({ type: 'back' }); },
    home: () => { resetHistory(0); dispatch({ type: 'home' }); },
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
      nav.goto(['plazoFijo', 'resultado']);
    }, 1200);
  };

  const consultar = () => {
    set({ confirmando: true });
    setTimeout(() => finalizarOk(sRef.current.pendiente), 1200);
  };

  const Current = SCREENS[s.stack[s.stack.length - 1]];
  const app = (
    <div className="app">
      <Current s={s} set={set} nav={nav} dispatch={dispatch} confirmar={confirmar} consultar={consultar} />
      <Sheets s={s} set={set} nav={nav} />
    </div>
  );

  return <DeviceShell s={s} set={set} dispatch={dispatch} nav={nav}>{app}</DeviceShell>;
}
