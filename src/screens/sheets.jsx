import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BottomSheet, Button, ListOption, Alert, DataRow, Card, Icon } from '../components/ui.jsx';
import { TIPOS, dinero, fecha, fechaLarga, vencimiento, track } from '../logic.js';

export function Sheets({ s, set, nav }) {
  const close = nav.back;
  return (
    <>
      <AnimatePresence>{s.sheet === 'tipo' && (<BottomSheet key="tipo" title="¿Qué tipo de plazo fijo querés simular?" onClose={close}
        actions={<>
          <Button onClick={() => {
            const t = TIPOS[s.tipoDraft];
            const cambiaMoneda = TIPOS[s.tipo].moneda !== t.moneda;
            track('pf_type_changed', { tipo_anterior: s.tipo, tipo_nuevo: s.tipoDraft });
            set({ tipo: s.tipoDraft, dias: s.dias && s.dias >= t.min && s.dias <= t.max ? s.dias : null, ...(cambiaMoneda ? { montoTexto: '', montoTocado: false } : {}) });
            close();
          }}>Aplicar</Button>
          <Button variant="secondary" onClick={close}>Cancelar</Button>
        </>}>
        <div role="radiogroup">
          {Object.values(TIPOS).map((t, i, arr) => (
            <ListOption key={t.id} selected={s.tipoDraft === t.id} title={t.corto} description={t.corta}
              divider={i < arr.length - 1} onClick={() => set({ tipoDraft: t.id })} />
          ))}
        </div>
      </BottomSheet>)}</AnimatePresence>

      <AnimatePresence>{s.sheet === 'ayuda' && (<BottomSheet key="ayuda" title="¿Qué es un plazo fijo?" onClose={close}
        actions={<Button onClick={close}>Entendido</Button>}>
        <p className="t-body-md c-secondary">Es una forma de ahorrar: dejás un monto en el banco durante el tiempo que elegís y, al terminar, lo recibís de vuelta con una ganancia.</p>
        <div className="benefits">
          {[['check-circle', 'Sabés cuánto vas a ganar', 'En el tradicional, la tasa queda fija durante todo el plazo.'],
            ['calendar', 'Vos elegís el plazo', 'Desde 30 días, según cuándo vas a necesitar el dinero.'],
            ['trending-up', 'En pesos, dólares o UVA', 'Elegí la opción que mejor se ajuste a tus ahorros.']].map(([i, t, d]) => (
            <div className="benefit" key={t}>
              <span className="benefit-icon"><Icon name={i} size={20} color="var(--color-icon-brand)" /></span>
              <span className="list-text"><span className="t-title-md c-primary">{t}</span><span className="t-body-md c-secondary">{d}</span></span>
            </div>
          ))}
        </div>
        <Alert tone="info" title="A tener en cuenta">Tu dinero queda invertido hasta el vencimiento (salvo en el precancelable UVA).</Alert>
      </BottomSheet>)}</AnimatePresence>

      <AnimatePresence>{s.sheet === 'tna' && (<BottomSheet key="tna" title="¿Qué es la TNA?" onClose={close} actions={<Button onClick={close}>Entendido</Button>}>
        <p className="t-body-md c-secondary">La <strong>Tasa Nominal Anual</strong> es el porcentaje que usamos para calcular tu ganancia. Si invertís por menos de un año, se aplica la parte proporcional a los días.</p>
        <p className="t-body-md c-secondary">Ejemplo: con TNA 19,50% y $ 1.000 a 30 días, ganás aproximadamente $ 16.</p>
      </BottomSheet>)}</AnimatePresence>

      <AnimatePresence>{s.sheet === 'fecha' && <SheetFecha key="fecha" s={s} set={set} close={close} />}</AnimatePresence>

      <AnimatePresence>{s.sheet === 'comprobante' && (<BottomSheet key="comprobante" title="Comprobante" onClose={close}
        actions={<Button onClick={close}>Cerrar</Button>}>
        {s.inversiones.length > 0 && (() => {
          const inv = s.inversiones[s.inversiones.length - 1];
          const t = TIPOS[inv.tipo];
          return (
            <Card>
              <DataRow label="Operación" value="Constitución de plazo fijo" />
              <DataRow label="Modalidad" value={t.nombre} />
              <DataRow label="Monto" value={dinero(inv.monto, t.moneda)} />
              <DataRow label="Cuenta" value={inv.cuentaNombre} />
              <DataRow label="Vencimiento" value={fecha(new Date(inv.vence))} />
              <DataRow label="N.º de operación" value={inv.id} last />
            </Card>
          );
        })()}
        <p className="t-body-sm c-tertiary">Prototipo: el comprobante real se descarga en PDF.</p>
      </BottomSheet>)}</AnimatePresence>
    </>
  );
}

function SheetFecha({ s, set, close }) {
  const t = TIPOS[s.tipo];
  const [dias, setDias] = useState(s.dias || t.min);
  const valido = dias >= t.min && dias <= t.max;
  const v = valido ? vencimiento(dias) : null;
  const toISO = (d) => d.toISOString().slice(0, 10);
  const base = new Date(); base.setHours(0, 0, 0, 0);
  const minD = new Date(base); minD.setDate(minD.getDate() + t.min);
  const maxD = new Date(base); maxD.setDate(maxD.getDate() + t.max);
  const curD = new Date(base); curD.setDate(curD.getDate() + (Number(dias) || t.min));
  return (
    <BottomSheet title="Elegí tu plazo" onClose={close}
      actions={<>
        <Button disabled={!valido} onClick={() => { set({ dias: Number(dias), plazoPersonalizado: true }); close(); }}>Aplicar plazo</Button>
        <Button variant="secondary" onClick={close}>Cancelar</Button>
      </>}>
      <p className="t-body-md c-secondary">Ingresá la cantidad de días o elegí la fecha en que querés recuperar tu dinero.</p>
      <div className="field">
        <label className="t-title-md c-primary" htmlFor="dias">Cantidad de días</label>
        <div className={`amount-box ${valido ? 'is-focus' : 'is-error'}`}>
          <input id="dias" className="t-display-input" inputMode="numeric" value={dias} onChange={(e) => setDias(e.target.value.replace(/\D/g, '').slice(0, 3))} />
          <span className="t-body-lg c-tertiary">días</span>
        </div>
        <p className={`help t-body-sm ${valido ? 'c-tertiary' : 'c-error'}`}>{valido ? `Entre ${t.min} y ${t.max} días` : `Elegí un plazo de entre ${t.min} y ${t.max} días.`}</p>
      </div>
      <label className="date-pick">
        <Icon name="calendar" size={20} color="var(--color-icon-brand)" />
        <span className="t-label-lg-underline c-link">Elegir fecha en el calendario</span>
        <input type="date" min={toISO(minD)} max={toISO(maxD)} value={toISO(curD)}
          onChange={(e) => { const d = new Date(e.target.value + 'T00:00:00'); setDias(Math.round((d - base) / 86400000)); }} />
      </label>
      {v && (
        <div className="preview">
          <p className="t-body-md c-secondary">Tu dinero vuelve a estar disponible el</p>
          <p className="t-title-lg c-brand">{fechaLarga(v.fecha)}</p>
          {v.ajustado && <p className="t-body-sm c-secondary">Cae en un día no hábil: se acredita el siguiente día hábil.</p>}
        </div>
      )}
    </BottomSheet>
  );
}
