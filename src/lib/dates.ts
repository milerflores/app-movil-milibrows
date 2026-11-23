import type { Appointment, Availability, ServiceExecutionState } from './types';

export const studioZone = 'America/Lima';

export function dayKey(value: Date | string = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: studioZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value));
  const p = (type: string) => parts.find((v) => v.type === type)?.value;
  return `${p('year')}-${p('month')}-${p('day')}`;
}

export function addDays(day: string, count: number) {
  return dayKey(new Date(new Date(`${day}T12:00:00-05:00`).getTime() + count * 86_400_000));
}

export function dateLabel(value: string, short = false) {
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: studioZone,
    day: 'numeric',
    month: short ? 'short' : 'long',
    ...(!short ? { weekday: 'long' as const } : {}),
  }).format(new Date(value.length === 10 ? `${value}T12:00:00-05:00` : value));
}

export function timeLabel(value: string) {
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return new Intl.DateTimeFormat('es-PE', {
    timeZone: studioZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value));
}

export function addMinutesToHHMM(hhmm: string, minutes: number) {
  const [h, m] = timeLabel(hhmm).split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor((total % 1440) / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function money(value: number | string) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

export function canManage(cita: Pick<Appointment, 'estado' | 'fecha_inicio' | 'fecha'>) {
  if (cita.estado !== 'confirmada') return false;
  if (cita.fecha_inicio) return new Date(cita.fecha_inicio).getTime() > Date.now();
  return Boolean(cita.fecha && cita.fecha >= dayKey());
}

export function appointmentDateRef(cita: Pick<Appointment, 'fecha' | 'fecha_inicio'>) {
  return cita.fecha_inicio || cita.fecha;
}

export function appointmentStylists(cita: Pick<Appointment, 'servicios'>) {
  const names = [
    ...new Set(cita.servicios.map((s) => s.estilista?.trim()).filter((v): v is string => !!v)),
  ];
  return names.length ? names.join(' · ') : 'Equipo MiliBrows';
}

export function appointmentTimeRange(
  cita: Pick<Appointment, 'fecha_inicio' | 'fecha_fin' | 'servicios'>,
) {
  if (cita.fecha_inicio && cita.fecha_fin) {
    return `${timeLabel(cita.fecha_inicio)} — ${timeLabel(cita.fecha_fin)}`;
  }
  const active = cita.servicios.filter((s) => s.hora_inicio);
  if (!active.length) return 'Horario por confirmar';
  const sorted = [...active].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return `${timeLabel(first.hora_inicio)} — ${addMinutesToHHMM(last.hora_inicio, last.duracion_minutos)}`;
}

export const states = {
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
  no_asistio: 'No asistió',
};

export const serviceStates: Record<ServiceExecutionState, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  no_realizado: 'No realizado',
};

export function startTimes(employee: Availability | undefined, preferred?: string): string[] {
  return startTimesForDuration(employee, employee?.duracion_minutos ?? 0, preferred);
}

export function startTimesForDuration(
  employee: Availability | undefined,
  durationMinutes: number,
  preferred?: string,
): string[] {
  if (!employee || durationMinutes <= 0) return [];
  const slots = new Set<string>();
  const duration = durationMinutes * 60_000;
  const previous = preferred ? new Date(preferred).getTime() : NaN;
  for (const interval of employee.intervalos) {
    const from = Math.max(new Date(interval.fecha_inicio).getTime(), Date.now());
    const until = new Date(interval.fecha_fin).getTime();
    for (
      let time = Math.ceil(from / 60_000) * 60_000;
      time + duration <= until;
      time += 30 * 60_000
    )
      slots.add(new Date(time).toISOString());
    if (previous >= from && previous + duration <= until)
      slots.add(new Date(previous).toISOString());
  }
  return [...slots].sort();
}
