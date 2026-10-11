// Datos ilustrativos del prototipo (no son condiciones reales del banco).
export const TIPOS = {
  'trad-ars': {
    id: 'trad-ars', corto: 'Tradicional en pesos', nombre: 'Tradicional en pesos', moneda: 'ARS', tna: 19.5, uva: false,
    descripcion: 'Es el plazo fijo más simple: conocés la ganancia exacta en pesos desde el comienzo.',
    corta: 'Sabés desde el comienzo cuánto vas a ganar.',
    etiquetas: [['exito', 'Ganancia fija'], ['marca', 'Desde 30 días']],
    plazos: [30, 60, 90], min: 30, max: 365,
  },
  'trad-usd': {
    id: 'trad-usd', corto: 'Tradicional en dólares', nombre: 'Tradicional en dólares', moneda: 'USD', tna: 1, uva: false,
    descripcion: 'Conocés la ganancia exacta en dólares desde el comienzo.',
    corta: 'Conocés la ganancia exacta en dólares desde el comienzo.',
    etiquetas: [['exito', 'Ganancia fija'], ['marca', 'Desde 30 días']],
    plazos: [30, 60, 90], min: 30, max: 365,
  },
  'pre-uva': {
    id: 'pre-uva', corto: 'Precancelable UVA', nombre: 'Precancelable UVA en pesos', moneda: 'ARS', tna: 1, uva: true, precancelable: true,
    descripcion: 'Se actualiza según la inflación. Podés retirarlo desde los 30 días de constituido.',
    corta: 'Se ajusta por inflación y podés retirarlo antes del vencimiento.',
    etiquetas: [['advertencia', 'Ajusta por inflación'], ['marca', 'Retiro desde el día 30']],
    plazos: [90, 180, 365], min: 90, max: 365,
  },
  'aj-uva': {
    id: 'aj-uva', corto: 'Ajustable por UVA', nombre: 'Ajustable por UVA en pesos', moneda: 'ARS', tna: 1, uva: true,
    descripcion: 'Ajusta tu capital todos los días según la inflación.',
    corta: 'Se ajusta por inflación hasta el vencimiento.',
    etiquetas: [['advertencia', 'Ajusta por inflación'], ['neutro', 'Sin retiro anticipado']],
    plazos: [90, 180, 365], min: 90, max: 365,
  },
};

export const MONEDAS = {
  ARS: { simbolo: '$', minimo: 1000, nombre: 'pesos' },
  USD: { simbolo: 'US$', minimo: 100, nombre: 'dólares' },
};

export const CUENTAS = {
  ARS: [
    { id: 'ca-3643', nombre: 'Caja de Ahorro $...3643', saldo: 1250600 },
    { id: 'ca-3843', nombre: 'Caja de Ahorro $...3843', saldo: 2000 },
  ],
  USD: [{ id: 'cu-1122', nombre: 'Caja de Ahorro US$...1122', saldo: 800 }],
};

const fmt2 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

export const dinero = (n, moneda = 'ARS', decimales = true) =>
  `${MONEDAS[moneda].simbolo} ${(decimales ? fmt2 : fmt0).format(n)}`;

export const fecha = (d) =>
  d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const fechaLarga = (d) =>
  d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

export const hoy = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const sumarDias = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const diasEntre = (a, b) => Math.round((b - a) / 86400000);

// Vencimiento: si cae sábado o domingo, se corre al lunes siguiente.
export function vencimiento(dias) {
  const base = sumarDias(hoy(), dias);
  let v = new Date(base);
  while (v.getDay() === 0 || v.getDay() === 6) v = sumarDias(v, 1);
  return { fecha: v, ajustado: v.getTime() !== base.getTime(), diasReales: diasEntre(hoy(), v) };
}

export function simular({ tipo, monto, dias }) {
  const t = TIPOS[tipo];
  const v = vencimiento(dias);
  const ganancia = t.uva ? null : Math.round(monto * (t.tna / 100) * (v.diasReales / 365) * 100) / 100;
  return {
    ...v,
    ganancia,
    total: t.uva ? null : Math.round((monto + ganancia) * 100) / 100,
    retiroDesde: t.precancelable ? vencimiento(30).fecha : null,
  };
}

export const tnaTexto = (t) => `TNA ${t.tna.toFixed(2).replace('.', ',')}%${t.uva ? ' + UVA' : ''}`;

export const montoNumero = (s) => Number(String(s).replace(/\D/g, '')) || 0;

export function errorMonto(monto, tipo) {
  const m = MONEDAS[TIPOS[tipo].moneda];
  if (!monto) return null;
  if (monto < m.minimo) return `El monto mínimo es de ${dinero(m.minimo, TIPOS[tipo].moneda, false)}. Ingresá un monto mayor.`;
  return null;
}

export function track(evento, props = {}) {
  // Analítica de demostración: ver página Handoff en Figma.
  console.info('[analytics]', evento, props);
}

export const estadoInicial = {
  stack: ['inicio'],
  sheet: null,
  monedaHome: 'ARS',
  tipo: 'trad-ars',
  tipoDraft: 'trad-ars',
  montoTexto: '',
  montoTocado: false,
  dias: null,
  plazoPersonalizado: false,
  calculo: 'idle', // idle | loading | ok | error
  cuenta: null,
  confirmando: false,
  resultado: null, // ok | pendiente
  inversiones: [],
  escenario: { banco: 'ok', red: 'ok' },
};

export function reducer(s, a) {
  switch (a.type) {
    case 'push':
      return { ...s, stack: [...s.stack, a.screen], sheet: null };
    case 'back':
      if (s.sheet) return { ...s, sheet: null };
      if (s.stack.length > 1) return { ...s, stack: s.stack.slice(0, -1) };
      return s;
    case 'home':
      return { ...s, stack: ['inicio', 'plazoFijo'], sheet: null };
    case 'inicio':
      return { ...s, stack: ['inicio'], sheet: null };
    case 'goto':
      return { ...s, ...a.patch, stack: a.stack, sheet: a.sheet ?? null };
    case 'sheet':
      return { ...s, sheet: a.sheet };
    case 'set':
      return { ...s, ...a.patch };
    case 'escenario':
      return { ...s, escenario: { ...s.escenario, ...a.patch } };
    case 'reset':
      return { ...estadoInicial, escenario: s.escenario };
    default:
      return s;
  }
}
