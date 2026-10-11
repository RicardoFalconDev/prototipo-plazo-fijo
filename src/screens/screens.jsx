import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { stagger, fadeUp, SPRING, DUR, EASE, haptic } from '../motion.js';
import {
  AppBar, Button, CurrencySelector, Tag, Alert, SelectField, AmountField, TermChip, ListOption,
  DataRow, EditableRow, AccountCard, Card, EmptyState, Screen, Icon, AnimatedNumber,
} from '../components/ui.jsx';
import { TIPOS, MONEDAS, CUENTAS, dinero, fecha, simular, montoNumero, errorMonto, track, tnaTexto } from '../logic.js';

// Fuerza animación por JS: la acelerada (WAAPI) deja un cuadro en el valor inicial al terminar.
const noopMotion = () => {};

const fmtMiles = (s) => {
  const n = montoNumero(s);
  return n ? new Intl.NumberFormat('es-AR').format(n) : '';
};

export function PlazoFijo({ s, set, nav }) {
  const lista = s.inversiones.filter((i) => TIPOS[i.tipo].moneda === s.monedaHome);
  const m = MONEDAS[s.monedaHome];
  const empezar = (origen) => {
    set({ tipoDraft: null }); // En Figma (02) ninguna opción viene preseleccionada.
    track('pf_simulation_started', { origen, moneda: s.monedaHome });
    nav.push('elegirTipo');
  };
  const header = <AppBar title="Plazo fijo" onBack={nav.back} onHelp={() => nav.sheet('ayuda')} />;

  if (lista.length === 0) {
    return (
      <Screen gap="lg" header={header}>
        <CurrencySelector value={s.monedaHome} onChange={(v) => set({ monedaHome: v })} />
        <EmptyState title={`No tenés plazos fijos en ${m.nombre}`} description="Cuando los tengas los vas a encontrar acá." />
        <div className="stack-sm">
          <p className="t-title-md c-primary">Simulá tu próximo plazo fijo</p>
          <EmptyState
            illustration title="Hacé rendir tus ahorros" description={'Descubrí cuánto podrías ganar\ncon un plazo fijo.'}
            action="Simular" onAction={() => empezar('plazo_fijo')}
          />
        </div>
      </Screen>
    );
  }

  // Tenencias: igual a Figma "10 · Plazo fijo · Con inversiones" (36:15204).
  const total = lista.reduce((a, i) => a + (i.total ?? i.monto), 0);
  const ganancias = lista.reduce((a, i) => a + ((i.total ?? i.monto) - i.monto), 0);
  return (
    <Screen gap="md" header={header}>
      <div className="stack-xs">
        <CurrencySelector value={s.monedaHome} onChange={(v) => set({ monedaHome: v })} />
        <div className="holding-card holding-total">
          <p className="t-body-sm c-secondary">Monto total (capital + ganancias)</p>
          <p className="t-amount-20 c-primary">{dinero(total, s.monedaHome)}</p>
          <p className="t-body-md c-secondary">Ganancias: <span className="c-success">+ {dinero(ganancias, s.monedaHome)}</span></p>
        </div>
      </div>
      <div className="stack-sm">
        <p className="t-body-lg c-primary">Simulá tu próximo plazo fijo</p>
        <div className="holding-card simulate-card">
          <div className="simulate-head">
            <img src={`${import.meta.env.BASE_URL}ilustracion-ahorro.svg`} width="72" height="77" alt="" />
            <div className="simulate-text">
              <p className="t-title-md c-primary">Hacé rendir tus ahorros</p>
              <p className="t-body-md c-secondary pre-line">{'Descubrí cuánto podrías ganar\ncon un plazo fijo.'}</p>
            </div>
          </div>
          <Button onClick={() => empezar('tenencias')}>Simular</Button>
        </div>
      </div>
      <div className="stack-sm">
        <p className="t-body-lg c-primary">Activos ({lista.length})</p>
        {lista.map((i) => (
          <div key={i.id} className="holding-card holding">
            <p className="t-body-lg c-primary">{TIPOS[i.tipo].nombre}</p>
            <p className="t-body-sm c-secondary">Vence el {fecha(new Date(i.vence))}</p>
            <div className="holding-row">
              <p className="t-body-lg c-primary">{dinero(i.total ?? i.monto, TIPOS[i.tipo].moneda)}</p>
              <Tag tone="exito">{tnaTexto(TIPOS[i.tipo])}</Tag>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

export function ElegirTipo({ s, set, nav }) {
  const ids = Object.keys(TIPOS);
  return (
    <Screen
      gap="lg"
      header={<AppBar title="Simular" onBack={nav.back} onHelp={() => nav.sheet('ayuda')} />}
      footer={<Button disabled={!s.tipoDraft} onClick={() => {
        const t = TIPOS[s.tipoDraft];
        const cambiaMoneda = TIPOS[s.tipo].moneda !== t.moneda;
        set({ tipo: s.tipoDraft, dias: t.plazos.includes(s.dias) ? s.dias : null, plazoPersonalizado: false, ...(cambiaMoneda ? { montoTexto: '', montoTocado: false } : {}) });
        nav.push('simular');
      }}>Continuar</Button>}
    >
      <h2 className="t-title-md c-primary">¿Qué tipo de plazo fijo querés simular?</h2>
      <Card className="list" role="radiogroup">
        {ids.map((id, i) => (
          <ListOption key={id} selected={s.tipoDraft === id} title={TIPOS[id].nombre} description={TIPOS[id].descripcion}
            featured={id === 'trad-ars' ? 'Más elegido' : null}
            divider={i < ids.length - 1} onClick={() => set({ tipoDraft: id })} />
        ))}
      </Card>
    </Screen>
  );
}

export function Simular({ s, set, nav, dispatch }) {
  const t = TIPOS[s.tipo];
  const moneda = t.moneda;
  const monto = montoNumero(s.montoTexto);
  const err = s.montoTocado ? errorMonto(monto, s.tipo) : null;
  const valido = monto >= MONEDAS[moneda].minimo && s.dias;
  const inputRef = useRef(null);

  // Recalcular: esqueleto inmediato (feedback < 100 ms) y respuesta simulada del servicio en 2 s.
  // Clave de la simulación: los números solo se muestran si corresponden exactamente a estos datos.
  const claveCalculo = `${s.tipo}|${monto}|${s.dias}|${s.reintento || 0}`;
  const listo = s.calculo === 'ok' && s.calcKey === claveCalculo;
  useEffect(() => {
    if (!valido) { if (s.calculo !== 'idle') set({ calculo: 'idle' }); return; }
    if (listo) return; // ya calculado (por ejemplo, al volver de "Elegir cuenta")
    set({ calculo: 'loading' });
    const id = setTimeout(() => {
      if (s.escenario.red === 'error') { set({ calculo: 'error' }); return; }
      set({ calculo: 'ok', calcKey: claveCalculo });
      track('pf_simulation_completed', { tipo: s.tipo, monto, plazo_dias: s.dias });
    }, 2000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monto, s.dias, s.tipo, s.escenario.red, s.reintento]);

  useEffect(() => { if (s.focoMonto && inputRef.current) { inputRef.current.focus(); set({ focoMonto: false }); } });

  const r = valido ? simular({ tipo: s.tipo, monto, dias: s.dias }) : null;
  const personalizado = s.dias && !t.plazos.includes(s.dias);

  return (
    <Screen
      header={<AppBar title="Simular" onBack={nav.back} onHelp={() => nav.sheet('ayuda')} />}
      footer={s.calculo === 'error'
        ? <Button onClick={() => set({ reintento: (s.reintento || 0) + 1 })}>Reintentar</Button>
        : <Button disabled={!valido || !listo || !!err} onClick={() => {
            track('pf_constitution_started', { tipo: s.tipo, plazo_dias: s.dias });
            const ok = CUENTAS[moneda].filter((c) => c.saldo >= monto).sort((a, b) => b.saldo - a.saldo)[0];
            set({ cuenta: ok ? ok.id : null });
            nav.push('elegirCuenta');
          }}>Constituir</Button>}
      footerSecondary={s.calculo === 'error' || err ? null : <Button variant="secondary" onClick={nav.home}>Volver a Plazo Fijo</Button>}
    >
      {s.calculo === 'error' && (
        <Alert tone="error" title="Tuvimos un inconveniente al cargar la información">Por favor, volvé a intentar más tarde.</Alert>
      )}
      <SelectField label="Tipo de plazo fijo" value={t.nombre} onClick={() => { set({ tipoDraft: s.tipo }); nav.sheet('tipo'); }} />
      <AmountField
        label="¿Cuánto querés invertir?" simbolo={MONEDAS[moneda].simbolo} inputRef={inputRef}
        value={fmtMiles(s.montoTexto)} onChange={(v) => set({ montoTexto: v, montoTocado: false })}
        onBlur={() => { set({ montoTocado: true }); if (errorMonto(monto, s.tipo)) track('pf_validation_error', { error: 'monto_minimo' }); }}
        error={err} help={`El monto mínimo es de ${dinero(MONEDAS[moneda].minimo, moneda, false)}`}
      />
      <div className="field" role="group" aria-labelledby="plazo-titulo">
        <p id="plazo-titulo" className="t-title-md c-primary">¿En qué plazo?</p>
        <div className="chips">
          {t.plazos.map((d) => (
            <TermChip key={d} selected={s.dias === d} onClick={() => set({ dias: d })} sub="días" subStyle="t-label-md">
              <span className="t-title-md">{d}</span>
            </TermChip>
          ))}
          <TermChip selected={!!personalizado} onClick={() => nav.sheet('fecha')} sub={personalizado ? 'días · editar' : 'Elegir fecha'} subStyle={personalizado ? 't-label-md' : 't-label-sm'}>
            {personalizado ? <span className="t-title-md">{s.dias}</span> : <Icon name="calendar" size={20} color="currentColor" />}
          </TermChip>
        </div>
      </div>
      <Result fase={!valido || s.calculo === 'error' ? 'vacio' : listo ? 'datos' : 'esqueleto'} t={t} r={r} />
    </Screen>
  );
}

const noop = () => {};

// fase: 'vacio' | 'esqueleto' (el servicio todavía no respondió) | 'datos' (respuesta para los datos actuales).
function Result({ fase, t, r }) {
  const moneda = t.moneda;
  const loading = fase === 'esqueleto';
  const fmt = (v) => dinero(v, moneda);
  const fmtGan = (v) => `+ ${dinero(v, moneda)}`;
  const filas = ['Total a recibir', 'Ganancia', 'Tasa aplicable', ...(t.precancelable ? ['Podés retirarlo desde'] : []), 'Fecha de vencimiento'];
  const aclaracion = `${t.uva ? 'La ganancia final depende de la inflación (UVA). ' : ''}La simulación no mueve dinero de tu cuenta.`;
  const esqueleto = (
    <>
      {filas.map((f, i) => <DataRow key={f} label={f} emphasis="loading" last={i === filas.length - 1} />)}
      <p className="t-body-sm c-tertiary disclaimer">{aclaracion}</p>
    </>
  );
  return (
    // Tamaño fijo: todas las fases ocupan la misma celda y la tarjeta toma el alto del resultado.
    // Así el componente nunca cambia de tamaño; solo cambia el contenido con un fundido cruzado.
    <Card className="result-shell" aria-busy={loading}>
      <div className="result-stack">
        <div className="result-inner result-ghost" aria-hidden="true">{esqueleto}</div>
        {/* Secuencial (sin superposición): sale una fase y recién entra la otra.
            Los datos salen al instante para no mostrar valores viejos debajo del esqueleto. */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={fase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: fase === 'datos' ? 0.3 : 0.2, ease: EASE.enter } }}
            exit={{ opacity: 0, transition: { duration: fase === 'datos' ? 0 : 0.15, ease: EASE.exit } }}
            // onUpdate fuerza la animación por JS: la versión acelerada (WAAPI) deja un cuadro en opacidad 0 al terminar.
            onUpdate={noop}
            className={fase === 'vacio' ? 'result-empty-inner' : 'result-inner'}
          >
            {fase === 'vacio' && (
              <>
                <p className="t-title-md c-primary">Rendimiento de tu plazo fijo</p>
                <p className="t-body-md c-secondary">Ingresá un monto y elegí el plazo para ver el rendimiento estimado y la fecha de vencimiento.</p>
              </>
            )}
            {fase === 'esqueleto' && esqueleto}
            {fase === 'datos' && (
              <>
                <DataRow label="Total a recibir" emphasis="strong" value={t.uva ? 'Variable' : <AnimatedNumber value={r.total} format={fmt} />} />
                <DataRow label="Ganancia" emphasis={t.uva ? 'strong' : 'positive'} value={t.uva ? 'Según inflación' : <AnimatedNumber value={r.ganancia} format={fmtGan} />} />
                <DataRow label="Tasa aplicable"><Tag tone="exito" icon="trending-up">{tnaTexto(t)}</Tag></DataRow>
                {t.precancelable && <DataRow label="Podés retirarlo desde" value={fecha(r.retiroDesde)} />}
                <DataRow label="Fecha de vencimiento" value={fecha(r.fecha)} last />
                <p className="t-body-sm c-tertiary disclaimer">{aclaracion}</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}

export function ElegirCuenta({ s, set, nav }) {
  const t = TIPOS[s.tipo];
  const monto = montoNumero(s.montoTexto);
  const cuentas = CUENTAS[t.moneda];
  const alguna = cuentas.some((c) => c.saldo >= monto);
  const r = simular({ tipo: s.tipo, monto, dias: s.dias });
  useEffect(() => { if (!alguna) track('pf_validation_error', { error: 'saldo_insuficiente' }); }, [alguna]);
  return (
    <Screen
      header={<AppBar title="Elegir cuenta" onBack={nav.back} onHelp={() => nav.sheet('ayuda')} />}
      footer={alguna
        ? <Button disabled={!s.cuenta} onClick={() => nav.push('revisar')}>Continuar</Button>
        : <Button onClick={() => { set({ focoMonto: true }); nav.back(); }}>Cambiar monto</Button>}
    >
      <h2 className="t-title-md c-primary">Plazo fijo {t.nombre.charAt(0).toLowerCase() + t.nombre.slice(1)}</h2>
      <Card className="card-stack">
        <EditableRow compact label="Ganancia" value={t.uva ? 'Según inflación' : dinero(r.ganancia, t.moneda)} last />
        <EditableRow compact label="Plazo" value={`${s.dias} días · vence el ${fecha(r.fecha)}`} last />
        <div className="card-divider" />
        <EditableRow compact label="Invertís" value={dinero(monto, t.moneda)} action="Modificar" onEdit={() => { set({ focoMonto: true }); nav.back(); }} last />
      </Card>
      <div className="stack-xs" role="radiogroup" aria-label="Cuenta a debitar">
        <p className="t-title-md c-primary">¿Desde qué cuenta querés invertir?</p>
        {cuentas.map((c) => {
          const falta = c.saldo < monto;
          return (
            <AccountCard key={c.id} name={c.nombre} balance={dinero(c.saldo, t.moneda)} selected={s.cuenta === c.id}
              disabled={falta} note={falta && alguna ? 'Saldo insuficiente para este monto' : null} onClick={() => set({ cuenta: c.id })} />
          );
        })}
        {!alguna && (
          <Alert tone="error" title="Tus cuentas no tienen saldo suficiente">
            Elegí un monto menor o ingresá dinero en una de tus cuentas.
          </Alert>
        )}
      </div>
    </Screen>
  );
}

export function Revisar({ s, set, nav, confirmar }) {
  const t = TIPOS[s.tipo];
  const monto = montoNumero(s.montoTexto);
  const r = simular({ tipo: s.tipo, monto, dias: s.dias });
  const cuenta = CUENTAS[t.moneda].find((c) => c.id === s.cuenta);
  return (
    <Screen
      header={<AppBar title="Revisar datos" onBack={nav.back} onHelp={() => nav.sheet('ayuda')} />}
      footer={<Button loading={s.confirmando} onClick={confirmar}>Confirmar plazo fijo</Button>}
    >
      <Card className="hero">
        <p className="t-body-md c-secondary">Vas a recibir</p>
        <p className="t-display-amount c-primary">{t.uva ? 'Según inflación' : dinero(r.total, t.moneda)}</p>
      </Card>
      <Card className="padded">
        <DataRow size="md" label="Modalidad" value={t.corto} />
        <DataRow size="md" label="Ganancia" emphasis={t.uva ? 'normal' : 'positive'} value={t.uva ? 'Según inflación' : `+ ${dinero(r.ganancia, t.moneda)}`} />
        <DataRow size="md" label="Tasa aplicable"><Tag tone="exito" icon="trending-up">{tnaTexto(t)}</Tag></DataRow>
        <DataRow size="md" label="Fecha de vencimiento" value={fecha(r.fecha)} />
        <DataRow size="md" label="Cuenta débito/crédito" value={cuenta?.nombre} />
        <DataRow size="md" label="Invertís" value={dinero(monto, t.moneda)} last />
      </Card>
    </Screen>
  );
}

export function Resultado({ s, nav, consultar }) {
  const inv = s.inversiones[s.inversiones.length - 1] || s.pendiente;
  const t = TIPOS[inv.tipo];
  const ok = s.resultado === 'ok';
  return (
    <Screen
      header={<AppBar title="" onClose={nav.home} />}
      footer={ok ? (
        <>
          <Button onClick={() => { nav.home(); }}>Ver mi plazo fijo</Button>
          <Button variant="secondary" onClick={() => nav.sheet('comprobante')}>Ver comprobante</Button>
        </>
      ) : (
        <>
          <Button loading={s.confirmando} onClick={consultar}>Consultar estado</Button>
          <Button variant="secondary" onClick={nav.home}>Ir al inicio</Button>
        </>
      )}
    >
      <motion.div className="result-head" variants={stagger} initial="initial" animate="animate">
        {ok ? <SuccessMark /> : (
          <motion.span className="badge-icon wait" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING.pop} onUpdate={noopMotion}>
            <motion.span animate={{ opacity: [1, 0.55, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} style={{ display: 'grid' }} onUpdate={noopMotion}>
              <Icon name="schedule" size={48} color="var(--color-icon-info)" />
            </motion.span>
          </motion.span>
        )}
        <motion.h2 variants={fadeUp} onUpdate={noopMotion} className="t-headline-sm c-primary">{ok ? 'Creaste tu Plazo fijo' : 'Estamos procesando tu plazo fijo'}</motion.h2>
        <motion.p variants={fadeUp} onUpdate={noopMotion} className="t-body-md c-secondary">
          {ok
            ? (t.uva
              ? <>El <b>{fecha(new Date(inv.vence))}</b> vas a recibir tu capital ajustado por inflación más los intereses.</>
              : <>El <b>{fecha(new Date(inv.vence))}</b> vas a recibir <b>{dinero(inv.total, t.moneda)}</b> en tu {inv.cuentaNombre}.</>)
            : 'Todavía no tenemos la confirmación del banco. Te avisamos apenas termine.'}
        </motion.p>
      </motion.div>
      {!ok && <Alert tone="advertencia" title="No lo vuelvas a intentar">Así evitamos constituir un plazo fijo duplicado.</Alert>}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.medium, ease: EASE.enter, delay: 0.2 }} onUpdate={noopMotion}>
      <Card className={ok ? 'padded' : ''}>
        {ok ? (
          <>
            <DataRow label="Monto invertido" value={dinero(inv.monto, t.moneda, false)} />
            {!t.uva && <DataRow label="Ganancia" emphasis="positive" value={`+ ${dinero(inv.ganancia, t.moneda)}`} />}
            {!t.uva && <DataRow label="Total a recibir" emphasis="strong" strongBold value={dinero(inv.total, t.moneda)} />}
            <DataRow label="Fecha de constitución" value={fecha(new Date(inv.creado))} />
            <DataRow label="Fecha de vencimiento" value={fecha(new Date(inv.vence))} last />
          </>
        ) : (
          <>
            <DataRow label="Monto" value={dinero(inv.monto, t.moneda, false)} />
            <DataRow label="Estado" value="En proceso" />
            <DataRow label="N.º de solicitud" value={inv.solicitud} last />
          </>
        )}
      </Card>
      </motion.div>
    </Screen>
  );
}

// Ícono "Inversión confirmada" de Figma, animado: aparece con resorte, el anillo y el check se dibujan.
function SuccessMark() {
  useEffect(() => { haptic([12, 40, 12]); }, []);
  const draw = (delay, duration = 0.45) => ({
    initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { delay, duration, ease: EASE.standard },
  });
  return (
    <motion.svg width="76" height="76" viewBox="0 0 77 77" fill="none" aria-hidden="true"
      initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING.pop} onUpdate={noopMotion}>
      <circle cx="38.09" cy="38.09" r="38.09" fill="var(--prim-sky-50)" />
      <circle cx="38.09" cy="38.09" r="24.6" fill="var(--color-bg-surface)" />
      <motion.path {...draw(0.1)} d="M13.49 37.29C13.49 44.03 16.08 50.49 20.69 55.25C25.31 60.01 31.56 62.69 38.09 62.69C44.61 62.69 50.87 60.01 55.48 55.25C60.09 50.49 62.69 44.03 62.69 37.29" stroke="var(--prim-blue-500)" strokeWidth="3.17" />
      <motion.path {...draw(0.1)} d="M13.49 38.09C13.49 31.35 16.08 24.89 20.69 20.13C25.31 15.37 31.56 12.7 38.09 12.7C44.61 12.7 50.87 15.37 55.48 20.13C60.09 24.89 62.69 31.35 62.69 38.09" stroke="var(--color-icon-success)" strokeWidth="3.17" />
      <motion.path {...draw(0.4, 0.3)} d="M25.39 36.85L33.86 45.31L50.78 26.98" stroke="var(--color-icon-success)" strokeWidth="3.57" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}
