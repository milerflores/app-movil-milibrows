import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ApiError, request } from '@/lib/api';
import { addMinutesToHHMM, dateLabel, dayKey, money, startTimes, timeLabel } from '@/lib/dates';
import { useAppTheme } from '@/lib/theme';
import type { Appointment, Availability, Service } from '@/lib/types';
import { useAction } from '@/lib/use-action';
import { useResource } from '@/lib/use-resource';
import { Calendar } from '@/ui/calendar';
import { Badge, Button, Card, Divider, Empty, Feedback, Icon, T } from '@/ui/components';
import { chosenEmployee, SlotPicker } from '@/ui/slot-picker';

export function BookingForm({
  initialService,
  onStepChange,
}: {
  initialService?: string;
  onStepChange?: () => void;
}) {
  const { palette } = useAppTheme();
  const catalog = useResource<Service[]>('/servicios');
  const [ids, setIds] = useState<number[]>(
    initialService && /^\d+$/.test(initialService) ? [Number(initialService)] : [],
  );
  const [step, setStep] = useState(1);
  const [day, setDay] = useState(dayKey());
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [time, setTime] = useState('');
  const action = useAction();

  const services = useMemo(
    () => (catalog.data || []).filter((s) => ids.includes(s.id)),
    [catalog.data, ids],
  );
  const total = services.reduce((n, s) => n + Number(s.precio), 0);
  const duration = services.reduce((n, s) => n + s.duracion_minutos, 0);
  const query = `/disponibilidad?fecha=${day}${services.map((s) => `&ids_servicios[]=${s.id}`).join('')}`;
  const availability = useResource<Availability[]>(step >= 2 && services.length ? query : null);
  const employee = chosenEmployee(availability.data, employeeId);
  const validTime = startTimes(employee).includes(time);

  const scheduledServices = useMemo(() => {
    if (!time) return [];
    let cursor = timeLabel(time);
    return services.map((service) => {
      const start = cursor;
      cursor = addMinutesToHHMM(cursor, service.duracion_minutos);
      return { service, hora_inicio: start, hora_fin: cursor };
    });
  }, [services, time]);

  function changeStep(value: number) {
    setStep(value);
    onStepChange?.();
  }

  function changeDate(value: string) {
    setDay(value);
    setTime('');
    setEmployeeId(null);
  }

  async function book() {
    await action.run(async () => {
      if (!employee || !validTime || availability.loading || availability.error)
        throw new Error('Elige un horario disponible para continuar.');
      try {
        const result = await request<Appointment>('/citas', {
          method: 'POST',
          body: {
            fecha: day,
            servicios: scheduledServices.map((item) => ({
              id_servicio: item.service.id,
              id_empleado: employee.id_empleado,
              hora_inicio: item.hora_inicio,
            })),
          },
        });
        router.replace({ pathname: '/cita/[id]', params: { id: result.datos.id, creada: '1' } });
      } catch (error) {
        if (error instanceof ApiError && (error.status === 409 || error.status === 422)) {
          setTime('');
          availability.reload();
          catalog.reload();
          changeStep(2);
        }
        if (!(error instanceof ApiError))
          throw new Error(
            'La conexión se interrumpió. Revisa Mis citas antes de volver a reservar para comprobar si tu cita se confirmó.',
          );
        throw error;
      }
    });
  }

  return (
    <View className="gap-5">
      <View className="flex-row items-center gap-2">
        {['Servicios', 'Fecha y hora', 'Confirmar'].map((label, i) => (
          <View key={label} className="flex-1 gap-2">
            <View className={`h-1 rounded-full ${step > i ? 'bg-champagne' : 'bg-line'}`} />
            <T
              variant="small"
              tone={step === i + 1 ? 'champagne' : 'stone'}
              style={step === i + 1 ? { fontFamily: 'Inter_600SemiBold' } : undefined}
            >
              {i + 1}. {label}
            </T>
          </View>
        ))}
      </View>

      <Feedback error={action.error} />
      {action.error && (
        <Button
          title="Revisar Mis citas"
          variant="secondary"
          onPress={() => router.push('/citas')}
        />
      )}

      {step === 1 && (
        <>
          <T tone="stone">
            Selecciona uno o más tratamientos. Organizamos los tiempos de forma continua para tu
            comodidad.
          </T>
          <Feedback loading={catalog.loading} error={catalog.error} onRetry={catalog.reload} />
          <View className="gap-3">
            {catalog.data?.map((s) => {
              const selected = ids.includes(s.id);
              return (
                <Pressable
                  key={s.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  onPress={() =>
                    setIds((old) =>
                      old.includes(s.id)
                        ? old.filter((id) => id !== s.id)
                        : old.length < 20
                          ? [...old, s.id]
                          : old,
                    )
                  }
                  className={`rounded-2xl p-4 border flex-row items-center gap-4 ${selected ? 'border-gold bg-goldSoft' : 'border-line bg-surface'}`}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                >
                  <View className="flex-1 gap-1">
                    <T variant="label" tone="ivory" style={{ fontSize: 14 }}>
                      {s.nombre}
                    </T>
                    <T variant="small" tone="stone">
                      {s.duracion_minutos} min · {money(s.precio)}
                    </T>
                  </View>
                  <Icon
                    name={selected ? 'checkmark-circle' : 'add-circle-outline'}
                    size={24}
                    color={selected ? palette.champagne : palette.stone}
                  />
                </Pressable>
              );
            })}
          </View>
          {catalog.data?.length === 0 && (
            <Empty
              title="El catálogo se está preparando"
              message="Vuelve pronto para elegir tu servicio."
            />
          )}
        </>
      )}

      {step === 2 && (
        <>
          <Calendar value={day} onChange={changeDate} />
          <Feedback
            loading={availability.loading}
            error={availability.error}
            onRetry={availability.reload}
          />
          {!availability.loading && !availability.error && availability.data && (
            <SlotPicker
              employees={availability.data}
              employee={employee}
              onEmployee={(id) => {
                setEmployeeId(id);
                setTime('');
              }}
              time={time}
              onTime={setTime}
            />
          )}
        </>
      )}

      {step === 3 && (
        <Card tone="gold">
          <Badge label="Resumen de tu visita" tone="gold" icon="sparkles-outline" />
          <View className="gap-1">
            <T variant="heading" tone="ivory">
              Tu momento está casi listo.
            </T>
            <T tone="stone">Revisa los detalles antes de confirmar tu reserva.</T>
          </View>
          <Divider />
          <View className="gap-1.5">
            <T variant="label" tone="ivory" style={{ textTransform: 'capitalize' }}>
              {dateLabel(day)}
            </T>
            <T tone="sand">
              {time && timeLabel(time)}
              {scheduledServices.length
                ? ` — ${scheduledServices[scheduledServices.length - 1].hora_fin}`
                : ''}{' '}
              · {duration} minutos
            </T>
            <T tone="stone">Con {employee?.nombre_completo}</T>
          </View>
          <Divider />
          <View className="gap-3">
            {scheduledServices.map(({ service, hora_inicio }) => (
              <View key={service.id} className="flex-row justify-between items-start gap-4">
                <View className="flex-1">
                  <T tone="ivory">{service.nombre}</T>
                  <T variant="small" tone="stone">
                    {hora_inicio} · {service.duracion_minutos} min
                  </T>
                </View>
                <T variant="label" tone="champagne">
                  {money(service.precio)}
                </T>
              </View>
            ))}
          </View>
          <Divider />
          <View className="flex-row justify-between items-center">
            <T variant="label" tone="stone">
              Total estimado
            </T>
            <T variant="heading" tone="champagne">
              {money(total)}
            </T>
          </View>
          <T variant="small" tone="stone">
            Si tienes descuento por nivel en MiliBrows Club, se aplicará automáticamente al
            confirmar. El pago se realiza en el estudio.
          </T>
        </Card>
      )}

      {services.length > 0 && step !== 3 && (
        <View
          className="rounded-2xl p-5 flex-row justify-between items-center"
          style={{
            backgroundColor: '#1D1B18',
            shadowColor: '#1A1A1A',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.14,
            shadowRadius: 14,
            elevation: 3,
          }}
        >
          <View>
            <T variant="label" style={{ color: '#FAF8F5' }}>
              {services.length} {services.length === 1 ? 'servicio' : 'servicios'}
            </T>
            <T variant="small" style={{ color: 'rgba(250,248,245,0.7)' }}>
              {duration} minutos en total
            </T>
          </View>
          <T variant="heading" style={{ color: '#F3E5B5' }}>
            {money(total)}
          </T>
        </View>
      )}

      {step < 3 ? (
        <Button
          title={step === 1 ? 'Elegir fecha y hora' : 'Revisar mi reserva'}
          icon="arrow-forward"
          disabled={
            step === 1
              ? !services.length || catalog.loading || !!catalog.error
              : !validTime || availability.loading || !!availability.error
          }
          onPress={() => {
            action.setError('');
            changeStep(step + 1);
          }}
        />
      ) : (
        <Button title="Confirmar mi reserva" icon="checkmark" busy={action.busy} onPress={book} />
      )}
      {step > 1 && (
        <Button
          title="Volver al paso anterior"
          variant="secondary"
          disabled={action.busy}
          onPress={() => changeStep(step - 1)}
        />
      )}
    </View>
  );
}
