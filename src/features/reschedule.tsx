import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ApiError, request } from '@/lib/api';
import {
  addMinutesToHHMM,
  appointmentDateRef,
  appointmentStylists,
  appointmentTimeRange,
  dateLabel,
  dayKey,
  startTimes,
  timeLabel,
} from '@/lib/dates';
import type { Appointment, Availability } from '@/lib/types';
import { useAction } from '@/lib/use-action';
import { useResource } from '@/lib/use-resource';
import { Calendar } from '@/ui/calendar';
import { Button, Card, Feedback, T } from '@/ui/components';
import { chosenEmployee, SlotPicker } from '@/ui/slot-picker';

export function RescheduleForm({ appointment: a }: { appointment: Appointment }) {
  const initialDate = a.fecha || dayKey(appointmentDateRef(a));
  const initialEmployeeId = a.servicios[0]?.id_empleado ?? null;
  const preferredStart = a.fecha_inicio ?? undefined;

  const [day, setDay] = useState(initialDate);
  const [employeeId, setEmployeeId] = useState<number | null>(initialEmployeeId);
  const [time, setTime] = useState(preferredStart ? new Date(preferredStart).toISOString() : '');
  const availability = useResource<Availability[]>(`/citas/${a.id}/disponibilidad?fecha=${day}`);
  const employee = chosenEmployee(availability.data, employeeId);
  const valid = startTimes(employee, preferredStart).includes(time);
  const action = useAction();

  return (
    <View className="gap-5">
      <Card tone="sand">
        <T variant="label" tone="caramelDark">
          Tu cita actual
        </T>
        <T tone="black" style={{ textTransform: 'capitalize' }}>
          {dateLabel(appointmentDateRef(a))} · {appointmentTimeRange(a)}
        </T>
        <T tone="stone">Con {appointmentStylists(a)}</T>
        <T variant="small" tone="stone">
          Conservaremos tus servicios, precios y la duración acordada de{' '}
          {a.servicios.reduce((n, s) => n + s.duracion_minutos, 0)} minutos.
        </T>
      </Card>

      <Calendar
        value={day}
        onChange={(value) => {
          setDay(value);
          setTime('');
          setEmployeeId(null);
        }}
      />

      <Feedback
        loading={availability.loading}
        error={availability.error}
        onRetry={availability.reload}
      />

      {!availability.loading && !availability.error && availability.data && (
        <SlotPicker
          employees={availability.data}
          employee={employee}
          preferred={preferredStart}
          onEmployee={(id) => {
            setEmployeeId(id);
            setTime('');
          }}
          time={time}
          onTime={setTime}
        />
      )}

      {valid && (
        <Card>
          <T variant="label" tone="sageDark">
            Nuevo horario seleccionado
          </T>
          <T tone="black" style={{ textTransform: 'capitalize' }}>
            {dateLabel(day)} · {timeLabel(time)}
          </T>
          <T tone="stone">Con {employee?.nombre_completo}</T>
        </Card>
      )}

      <Feedback error={action.error} />
      <Button
        title="Confirmar nuevo horario"
        icon="checkmark"
        disabled={!valid || availability.loading || !!availability.error}
        busy={action.busy}
        onPress={() =>
          action.run(async () => {
            if (!valid || !employee) throw new Error('Selecciona un horario disponible.');
            let cursor = timeLabel(time);
            const servicios = a.servicios
              .filter((s) => s.estado_servicio === 'pendiente')
              .map((s) => {
                const start = cursor;
                cursor = addMinutesToHHMM(cursor, s.duracion_minutos);
                return {
                  id_servicio_cita: s.id,
                  id_empleado: employee.id_empleado,
                  hora_inicio: start,
                };
              });
            try {
              await request(`/citas/${a.id}/reprogramar`, {
                method: 'POST',
                body: { fecha: day, servicios },
              });
              router.replace({ pathname: '/cita/[id]', params: { id: a.id, actualizada: '1' } });
            } catch (error) {
              if (error instanceof ApiError && (error.status === 409 || error.status === 422)) {
                setTime('');
                availability.reload();
              }
              throw error;
            }
          })
        }
      />
      <T variant="small" tone="stone">
        La disponibilidad se comprobará nuevamente al confirmar. Todos los horarios corresponden al
        estudio en Perú.
      </T>
    </View>
  );
}
