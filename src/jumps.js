// Accesos directos a pantallas y estados (parámetro ?pantalla=).
const SIM = ['inicio', 'plazoFijo', 'elegirTipo', 'simular'];
const base = { tipo: 'trad-ars', tipoDraft: 'trad-ars', montoTexto: '1000', dias: 30, montoTocado: true, escenario: { banco: 'ok', red: 'ok' } };

export const JUMPS = [
  ['Flujo principal', [
    ['00', '00 · Inicio', { stack: ['inicio'], patch: {} }],
    ['IN', 'Inversiones', { stack: ['inicio', 'inversiones'], patch: {} }],
    ['01', '01 · Plazo fijo', { stack: ['inicio', 'plazoFijo'], patch: { montoTexto: '', dias: null, inversiones: [] } }],
    ['02', '02 · Elegir tipo', { stack: ['inicio', 'plazoFijo', 'elegirTipo'], patch: { tipoDraft: null } }],
    ['03', '03 · Simular (vacío)', { stack: SIM, patch: { ...base, montoTexto: '', dias: null, montoTocado: false } }],
    ['05', '05 · Simular (resultado)', { stack: SIM, patch: base }],
    ['06', '06 · Cambiar tipo (hoja)', { stack: SIM, patch: base, sheet: 'tipo' }],
    ['07', '07 · Elegir cuenta', { stack: [...SIM, 'elegirCuenta'], patch: { ...base, cuenta: 'ca-3643' } }],
    ['08', '08 · Revisar datos', { stack: [...SIM, 'elegirCuenta', 'revisar'], patch: { ...base, cuenta: 'ca-3643' } }],
    ['09', '09 · Plazo fijo constituido', { stack: ['inicio', 'plazoFijo', 'resultado'], patch: { ...base, cuenta: 'ca-3643', resultado: 'ok', demoInversion: true } }],
  ]],
  ['Estados alternativos', [
    ['A', 'A · Monto menor al mínimo', { stack: SIM, patch: { ...base, montoTexto: '500', dias: null } }],
    ['B', 'B · Saldo insuficiente', { stack: [...SIM, 'elegirCuenta'], patch: { ...base, montoTexto: '5000', cuenta: null } }],
    ['C', 'C · Error de conexión', { stack: SIM, patch: { ...base, escenario: { banco: 'ok', red: 'error' } } }],
    ['D', 'D · Operación pendiente', { stack: ['inicio', 'plazoFijo', 'resultado'], patch: { ...base, cuenta: 'ca-3643', resultado: 'pendiente', demoInversion: true } }],
  ]],
];

export const JUMP_BY_KEY = Object.fromEntries(JUMPS.flatMap(([, items]) => items.map(([k, , j]) => [k, j])));
