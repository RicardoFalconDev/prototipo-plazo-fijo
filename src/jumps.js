// Accesos directos a pantallas y estados (parámetro ?pantalla=).
const SIM = ['inicio', 'plazoFijo', 'elegirTipo', 'simular'];
const base = { tipo: 'trad-ars', tipoDraft: 'trad-ars', montoTexto: '1000', dias: 30, montoTocado: true, escenario: { banco: 'ok', red: 'ok' } };

export const JUMPS = [
  ['Flujo principal (numeración de Figma)', [
    ['01', '01 · Inicio · Intersticial de bienvenida', { stack: ['inicio'], patch: {}, sheet: 'intersticial' }],
    ['02', '02 · Inicio', { stack: ['inicio'], patch: {} }],
    ['03', '03 · Inversiones', { stack: ['inicio', 'inversiones'], patch: {} }],
    ['04', '04 · Plazo fijo · Sin inversiones', { stack: ['inicio', 'plazoFijo'], patch: { montoTexto: '', dias: null, inversiones: [] } }],
    ['05', '05 · Elegir tipo de plazo fijo', { stack: ['inicio', 'plazoFijo', 'elegirTipo'], patch: { tipoDraft: null } }],
    ['06', '06 · Simular · Vacío', { stack: SIM, patch: { ...base, montoTexto: '', dias: null, montoTocado: false } }],
    ['08', '08 · Simular · Resultado', { stack: SIM, patch: base }],
    ['09', '09 · Cambiar tipo (hoja inferior)', { stack: SIM, patch: base, sheet: 'tipo' }],
    ['10', '10 · Elegir cuenta', { stack: [...SIM, 'elegirCuenta'], patch: { ...base, cuenta: 'ca-3643' } }],
    ['11', '11 · Revisar datos', { stack: [...SIM, 'elegirCuenta', 'revisar'], patch: { ...base, cuenta: 'ca-3643' } }],
    ['12', '12 · Plazo fijo constituido', { stack: ['inicio', 'plazoFijo', 'resultado'], patch: { ...base, cuenta: 'ca-3643', resultado: 'ok', demoInversion: true } }],
    ['13', '13 · Plazo fijo · Con inversiones', { stack: ['inicio', 'plazoFijo'], patch: { ...base, cuenta: 'ca-3643', resultado: 'ok', demoInversion: true } }],
  ]],
  ['Estados alternativos', [
    ['A', 'A · Monto menor al mínimo', { stack: SIM, patch: { ...base, montoTexto: '500', dias: null } }],
    ['B', 'B · Saldo insuficiente', { stack: [...SIM, 'elegirCuenta'], patch: { ...base, montoTexto: '5000', cuenta: null } }],
    ['C', 'C · Error de conexión', { stack: SIM, patch: { ...base, escenario: { banco: 'ok', red: 'error' } } }],
    ['D', 'D · Operación pendiente', { stack: ['inicio', 'plazoFijo', 'resultado'], patch: { ...base, cuenta: 'ca-3643', resultado: 'pendiente', demoInversion: true } }],
  ]],
];

export const JUMP_BY_KEY = Object.fromEntries(JUMPS.flatMap(([, items]) => items.map(([k, , j]) => [k, j])));
