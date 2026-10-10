import { useEffect, useRef } from 'react';
import {
  AppBar, Button, CurrencySelector, Tag, Alert, SelectField, AmountField, TermChip, ListOption,
  DataRow, EditableRow, AccountCard, Card, EmptyState, Screen, Icon,
} from '../components/ui.jsx';
import { TIPOS, MONEDAS, CUENTAS, dinero, fecha, simular, montoNumero, errorMonto, track, tnaTexto } from '../logic.js';

const fmtMiles = (s) => {
  const n = montoNumero(s);
  return n ? new Intl.NumberFormat('es-AR').format(n) : '';
};

export function PlazoFijo({ s, set, nav }) {
  const lista = s.inversiones.filter((i) => TIPOS[i.tipo].moneda === s.monedaHome);
  const m = MONEDAS[s.monedaHome];
  return (
    <Screen header={<AppBar title="Plazo fijo" onHelp={() => nav.sheet('ayuda')} />}>
      <CurrencySelector value={s.monedaHome} onChange={(v) => set({ monedaHome: v })} />
      {lista.length === 0 ? (
        <EmptyState title={`No tenés plazos fijos en ${m.nombre}`} description="Cuando los tengas los vas a encontrar acá." />
      ) : (
        <div className="stack-sm">
          <p className="t-title-md c-primary">Activos ({lista.length})</p>
          {lista.map((i) => (
            <Card key={i.id}>
              <DataRow label={TIPOS[i.tipo].nombre} value={dinero(i.total ?? i.monto, TIPOS[i.tipo].moneda)} emphasis="strong" />
              <DataRow label="Vence" value={fecha(new Date(i.vence))} />
              <DataRow label="Tasa" last><Tag tone="exito" icon="trending-up">{tnaTexto(TIPOS[i.tipo])}</Tag></DataRow>
            </Card>
          ))}
        </div>
      )}
      <div className="stack-sm">
        <p className="t-title-md c-primary">Simulá tu próximo plazo fijo</p>
        <EmptyState
          illustration title="Hacé rendir tus ahorros" description="Descubrí cuánto podrías ganar con un plazo fijo."
          action="Simular"
          onAction={() => {
            const t = s.monedaHome === 'USD' ? 'trad-usd' : s.tipo && TIPOS[s.tipo].moneda === 'ARS' ? s.tipo : 'trad-ars';
            set({ tipoDraft: t });
            track('pf_simulation_started', { origen: 'plazo_fijo', moneda: s.monedaHome });
            nav.push('elegirTipo');
          }}
        />
      </div>
    </Screen>
  );
}

export function ElegirTipo({ s, set, nav }) {
  const ids = Object.keys(TIPOS);
  return (
    <Screen
      header={<AppBar title="Simular" onBack={nav.back} onHelp={() => nav.sheet('ayuda')} />}
      footer={<Button onClick={() => {
        const t = TIPOS[s.tipoDraft];
        const cambiaMoneda = TIPOS[s.tipo].moneda !== t.moneda;
        set({ tipo: s.tipoDraft, dias: t.plazos.includes(s.dias) ? s.dias : null, plazoPersonalizado: false, ...(cambiaMoneda ? { montoTexto: '', montoTocado: false } : {}) });
        nav.push('simular');
      }}>Continuar</Button>}
    >
      <h2 className="t-title-lg c-primary">¿Qué tipo de plazo fijo querés simular?</h2>
      <Card className="list" role="radiogroup">
        {ids.map((id, i) => (
          <ListOption key={id} selected={s.tipoDraft === id} title={TIPOS[id].nombre} description={TIPOS[id].descripcion}
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

  // Recalcular con debounce de 300 ms + 500 ms de "cálculo".
  useEffect(() => {
    if (!valido) { if (s.calculo !== 'idle') set({ calculo: 'idle' }); return; }
    set({ calculo: 'loading' });
    const id = setTimeout(() => {
      if (s.escenario.red === 'error') { set({ calculo: 'error' }); return; }
      set({ calculo: 'ok' });
      track('pf_simulation_completed', { tipo: s.tipo, monto, plazo_dias: s.dias });
    }, 800);
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
        : <Button disabled={!valido || s.calculo !== 'ok' || !!err} onClick={() => {
            track('pf_constitution_started', { tipo: s.tipo, plazo_dias: s.dias });
            const ok = CUENTAS[moneda].filter((c) => c.saldo >= monto).sort((a, b) => b.saldo - a.saldo)[0];
            set({ cuenta: ok ? ok.id : null });
            nav.push('elegirCuenta');
          }}>Constituir</Button>}
    >
      {s.calculo === 'error' && (
        <Alert tone="error" title="No pudimos calcular la simulación">Revisá tu conexión. Guardamos el monto y el plazo que elegiste.</Alert>
      )}
      <SelectField label="Tipo de plazo fijo" value={t.nombre} onClick={() => { set({ tipoDraft: s.tipo }); nav.sheet('tipo'); }} />
      <AmountField
        label="¿Cuánto querés invertir?" simbolo={MONEDAS[moneda].simbolo} inputRef={inputRef}
        value={fmtMiles(s.montoTexto)} onChange={(v) => set({ montoTexto: v, montoTocado: false })}
        onBlur={() => { set({ montoTocado: true }); if (errorMonto(monto, s.tipo)) track('pf_validation_error', { error: 'monto_minimo' }); }}
        error={err} help={`El monto mínimo es de ${dinero(MONEDAS[moneda].minimo, moneda, false)}`}
      />
      <fieldset className="stack-xs">
        <legend className="t-title-md c-primary">¿En qué plazo?</legend>
        <div className="chips">
          {t.plazos.map((d) => (
            <TermChip key={d} selected={s.dias === d} onClick={() => set({ dias: d })} sub="días">
              <span className="t-title-md">{d}</span>
            </TermChip>
          ))}
          <TermChip selected={!!personalizado} onClick={() => nav.sheet('fecha')} sub={personalizado ? 'días · editar' : 'Elegir fecha'}>
            {personalizado ? <span className="t-title-md">{s.dias}</span> : <Icon name="calendar" size={20} color="currentColor" />}
          </TermChip>
        </div>
      </fieldset>
      <Result s={s} t={t} r={r} nav={nav} />
    </Screen>
  );
}

function Result({ s, t, r, nav }) {
  const moneda = t.moneda;
  if (s.calculo === 'idle' || s.calculo === 'error' || !r) {
    return (
      <Card className="result-empty">
        <p className="t-title-md c-primary">Rendimiento de tu plazo fijo</p>
        <p className="t-body-md c-secondary">Ingresá un monto y elegí el plazo para ver el rendimiento estimado y la fecha de vencimiento.</p>
      </Card>
    );
  }
  const loading = s.calculo === 'loading';
  const tasa = tnaTexto(t);
  return (
    <Card aria-busy={loading}>
      <DataRow label="Ganancia" emphasis={loading ? 'loading' : t.uva ? 'strong' : 'positive'} value={t.uva ? 'Según inflación' : `+ ${dinero(r.ganancia, moneda)}`} />
      <DataRow label="Fecha de vencimiento" emphasis={loading ? 'loading' : 'normal'} value={fecha(r.fecha)} />
      {t.precancelable && <DataRow label="Podés retirarlo desde" emphasis={loading ? 'loading' : 'normal'} value={fecha(r.retiroDesde)} />}
      <DataRow label="Total a recibir" emphasis={loading ? 'loading' : 'strong'} value={t.uva ? 'Variable' : dinero(r.total, moneda)} />
      <DataRow label="Tasa aplicable" emphasis={loading ? 'loading' : undefined} last>
        <span className="row-end"><Tag tone="exito" icon="trending-up">{tasa}</Tag><button className="link t-label-md-underline" onClick={() => nav.sheet('tna')}>¿Qué es?</button></span>
      </DataRow>
      {!loading && <p className="t-body-sm c-tertiary disclaimer">{t.uva ? 'La ganancia final depende de la inflación (UVA). ' : ''}Simulación estimada con la tasa vigente. No mueve dinero de tu cuenta.</p>}
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
      <Card>
        <EditableRow label="Monto" value={dinero(monto, t.moneda, false)} onEdit={() => { set({ focoMonto: true }); nav.back(); }} />
        <EditableRow label="Plazo" value={`${s.dias} días · vence el ${fecha(r.fecha)}`} onEdit={nav.back} />
        <EditableRow label="Modalidad" value={t.nombre} last />
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
          <Alert tone="error" title="Saldo insuficiente">
            Ninguna de tus cuentas tiene {dinero(monto, t.moneda, false)}. Cambiá el monto o ingresá dinero a tu cuenta.
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
        <p className="t-display-amount c-brand">{t.uva ? 'Según inflación' : dinero(r.total, t.moneda)}</p>
        <p className="t-body-sm c-tertiary">el {fecha(r.fecha)} en tu {cuenta?.nombre}</p>
      </Card>
      {r.ajustado && <Alert tone="info" title="Vencimiento ajustado">El plazo terminaba en un día no hábil: vence el próximo día hábil.</Alert>}
      <Card>
        <DataRow label="Modalidad" value={t.nombre} />
        <DataRow label="Ganancia" emphasis={t.uva ? 'strong' : 'positive'} value={t.uva ? 'Según inflación' : `+ ${dinero(r.ganancia, t.moneda)}`} />
        <DataRow label="Fecha de vencimiento" value={fecha(r.fecha)} />
        <DataRow label="Cuenta débito/crédito" value={cuenta?.nombre} />
        <DataRow label="Invertís" value={dinero(monto, t.moneda)} />
        <DataRow label="Tasa aplicable" last>
          <span className="row-end"><Tag tone="exito" icon="trending-up">{tnaTexto(t)}</Tag><button className="link t-label-md-underline" onClick={() => nav.sheet('tna')}>¿Qué es?</button></span>
        </DataRow>
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
      <div className="result-head">
        <span className={`badge-icon ${ok ? 'ok' : 'wait'}`}><Icon name={ok ? 'check-circle' : 'schedule'} size={48} color={ok ? 'var(--color-icon-success)' : 'var(--color-icon-info)'} /></span>
        <h2 className="t-headline-sm c-primary">{ok ? '¡Tu plazo fijo está constituido!' : 'Estamos procesando tu plazo fijo'}</h2>
        <p className="t-body-md c-secondary">
          {ok
            ? (t.uva ? `El ${fecha(new Date(inv.vence))} vas a recibir tu capital ajustado por inflación más los intereses.` : `El ${fecha(new Date(inv.vence))} vas a recibir ${dinero(inv.total, t.moneda)} en tu ${inv.cuentaNombre}.`)
            : 'Todavía no tenemos la confirmación del banco. Te avisamos apenas termine.'}
        </p>
      </div>
      {!ok && <Alert tone="advertencia" title="No lo vuelvas a intentar">Así evitamos constituir un plazo fijo duplicado.</Alert>}
      <Card>
        {ok ? (
          <>
            <DataRow label="Monto invertido" value={dinero(inv.monto, t.moneda, false)} />
            {!t.uva && <DataRow label="Ganancia" emphasis="positive" value={`+ ${dinero(inv.ganancia, t.moneda)}`} />}
            {!t.uva && <DataRow label="Total a recibir" emphasis="strong" value={dinero(inv.total, t.moneda)} />}
            <DataRow label="Fecha de constitución" value={fecha(new Date(inv.creado))} />
            <DataRow label="Fecha de vencimiento" value={fecha(new Date(inv.vence))} />
            <DataRow label="N.º de operación" value={inv.id} last />
          </>
        ) : (
          <>
            <DataRow label="Monto" value={dinero(inv.monto, t.moneda, false)} />
            <DataRow label="Estado" value="En proceso" />
            <DataRow label="N.º de solicitud" value={inv.solicitud} last />
          </>
        )}
      </Card>
    </Screen>
  );
}
