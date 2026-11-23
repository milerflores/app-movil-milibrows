const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  dayKey,
  addDays,
  addMinutesToHHMM,
  appointmentStylists,
  appointmentTimeRange,
  timeLabel,
  startTimes,
  canManage,
} = require('../src/lib/dates.ts');

test('las fechas usan la zona del estudio incluso al cambiar de dia UTC', () => {
  assert.equal(dayKey('2026-11-17T02:00:00Z'), '2026-11-16');
  assert.equal(timeLabel('2026-11-17T02:00:00Z'), '21:00');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});
test('los horarios contienen la duracion completa y respetan las pausas', () => {
  const employee = {
    duracion_minutos: 90,
    intervalos: [
      { fecha_inicio: '2099-01-05T10:00:00-05:00', fecha_fin: '2099-01-05T12:00:00-05:00' },
      { fecha_inicio: '2099-01-05T13:00:00-05:00', fecha_fin: '2099-01-05T14:00:00-05:00' },
    ],
  };
  assert.deepEqual(startTimes(employee).map(timeLabel), ['10:00', '10:30']);
});
test('la reprogramacion permite conservar una hora historica que cabe en el intervalo', () => {
  const employee = {
    duracion_minutos: 90,
    intervalos: [
      { fecha_inicio: '2099-01-05T10:00:00-05:00', fecha_fin: '2099-01-05T12:00:00-05:00' },
    ],
  };
  assert(startTimes(employee, '2099-01-05T10:15:00-05:00').map(timeLabel).includes('10:15'));
  assert(!startTimes(employee, '2099-01-05T11:00:00-05:00').map(timeLabel).includes('11:00'));
});
test('no se ofrecen intervalos pasados ni acciones sobre estados finales', () => {
  assert.deepEqual(
    startTimes({
      duracion_minutos: 30,
      intervalos: [
        { fecha_inicio: '2000-01-01T10:00:00-05:00', fecha_fin: '2000-01-01T22:00:00-05:00' },
      ],
    }),
    [],
  );
  assert.equal(
    canManage({ estado: 'confirmada', fecha_inicio: '2099-01-01T10:00:00-05:00' }),
    true,
  );
  assert.equal(
    canManage({ estado: 'confirmada', fecha_inicio: '2000-01-01T10:00:00-05:00' }),
    false,
  );
  assert.equal(
    canManage({ estado: 'completada', fecha_inicio: '2099-01-01T10:00:00-05:00' }),
    false,
  );
});
test('encadena horarios y deduce estilistas para citas multi-servicio', () => {
  assert.equal(addMinutesToHHMM('10:15', 45), '11:00');
  assert.equal(timeLabel('09:30:00'), '09:30');
  assert.equal(
    appointmentStylists({
      servicios: [{ estilista: 'Ana' }, { estilista: 'Lucía' }, { estilista: 'Ana' }],
    }),
    'Ana · Lucía',
  );
  assert.equal(
    appointmentTimeRange({
      fecha_inicio: null,
      fecha_fin: null,
      servicios: [
        { hora_inicio: '10:00', duracion_minutos: 45 },
        { hora_inicio: '10:45', duracion_minutos: 30 },
      ],
    }),
    '10:00 — 11:15',
  );
});
