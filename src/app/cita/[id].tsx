import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { request } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  appointmentDateRef,
  appointmentStylists,
  appointmentTimeRange,
  canManage,
  dateLabel,
  money,
  serviceStates,
  states,
  timeLabel,
} from '@/lib/dates';
import type { Appointment } from '@/lib/types';
import { useAction } from '@/lib/use-action';
import { useResource } from '@/lib/use-resource';
import {
  AuthGate,
  Badge,
  Button,
  Card,
  Dialog,
  Divider,
  Feedback,
  Field,
  Icon,
  Screen,
  T,
} from '@/ui/components';

export default function AppointmentDetail() {
  const { id, creada, actualizada } = useLocalSearchParams<{
    id: string;
    creada?: string;
    actualizada?: string;
  }>();
  const { profile } = useAuth();
  const resource = useResource<Appointment>(
    profile && /^\d+$/.test(id || '') ? `/citas/${id}` : null,
  );
  const [saved, setSaved] = useState<Appointment | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [reason, setReason] = useState('');
  const action = useAction();

  const a = saved?.id === Number(id) ? saved : resource.data;
  const manageable = a && canManage(a);

  async function cancel() {
    await action.run(async () => {
      const result = await request<Appointment>(`/citas/${id}/cancelar`, {
        method: 'POST',
        body: { motivo: reason.trim() || null },
      });
      setSaved(result.datos);
      setConfirm(false);
      setReason('');
    });
  }

  const totalAgreed = a
    ? a.servicios.reduce((n, s) => n + Number(s.precio_acordado), 0)
    : 0;
  const totalPaid = Number(a?.total_pagado ?? 0);
  const balance = Number(a?.saldo_pendiente ?? 0);
  const activePayments = (a?.cobros || []).filter((c) => c.estado === 'registrado');

  return (
    <Screen back title="Detalle de tu cita" eyebrow={`Reserva #${id}`}>
      <AuthGate>
        <Feedback
          notice={
            saved
              ? 'Tu cita fue cancelada.'
              : creada
                ? 'Tu cita está confirmada. ¡Te esperamos!'
                : actualizada
                  ? 'Tu cita fue reprogramada correctamente.'
                  : ''
          }
        />
        <Feedback
          loading={resource.loading && !a}
          error={resource.error}
          onRetry={resource.reload}
        />
        {a && (
          <>
            <View
              className="rounded-[22px] p-5 gap-4"
              style={{
                backgroundColor: '#1D1B18',
                shadowColor: '#1A1A1A',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.16,
                shadowRadius: 18,
                elevation: 4,
              }}
            >
              <View className="flex-row items-center gap-3.5">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Icon name="calendar-outline" color="#F3E5B5" />
                </View>
                <View className="flex-1 gap-1">
                  <Badge
                    label={states[a.estado]}
                    tone={
                      a.estado === 'confirmada'
                        ? 'gold'
                        : a.estado === 'completada'
                          ? 'sage'
                          : a.estado === 'cancelada'
                            ? 'danger'
                            : 'graphite'
                    }
                  />
                  <T
                    variant="heading"
                    style={{ fontSize: 17, textTransform: 'capitalize', color: '#FAF8F5' }}
                  >
                    {dateLabel(appointmentDateRef(a))}
                  </T>
                </View>
              </View>
              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.12)' }} />
              <T variant="heading" style={{ color: '#F3E5B5' }}>
                {appointmentTimeRange(a)}
              </T>
              <T style={{ color: 'rgba(250,248,245,0.82)' }}>
                Con {appointmentStylists(a)} ·{' '}
                {a.servicios.reduce((n, s) => n + s.duracion_minutos, 0)} minutos
              </T>
            </View>

            <Card>
              <T variant="heading" tone="ivory">
                Tu selección
              </T>
              {a.servicios.map((s, idx) => {
                const autoDiscount = Number(s.monto_descuento_automatico || 0);
                const manualDiscount = Number(s.descuento_manual?.monto || 0);
                return (
                  <View key={s.id} className="gap-1.5">
                    {idx > 0 && <Divider />}
                    <View className="flex-row justify-between gap-4 pt-1">
                      <T tone="ivory" className="flex-1">
                        {s.nombre_servicio_acordado}
                      </T>
                      <T variant="label" tone="champagne">
                        {money(s.precio_acordado)}
                      </T>
                    </View>
                    <T variant="small" tone="stone">
                      {s.hora_inicio ? `${timeLabel(s.hora_inicio)} · ` : ''}
                      {s.duracion_minutos} min
                      {s.estilista ? ` · ${s.estilista}` : ''}
                      {a.estado !== 'confirmada' || s.estado_servicio !== 'pendiente'
                        ? ` · ${serviceStates[s.estado_servicio]}`
                        : ''}
                    </T>
                    {autoDiscount > 0 && (
                      <T variant="small" tone="sageLight">
                        Descuento MiliBrows Club: -{money(autoDiscount)} (lista{' '}
                        {money(s.precio_lista)})
                      </T>
                    )}
                    {manualDiscount > 0 && (
                      <T variant="small" tone="caramelLight">
                        Ajuste aplicado: -{money(manualDiscount)}
                        {s.descuento_manual?.motivo ? ` (${s.descuento_manual.motivo})` : ''}
                      </T>
                    )}
                    {s.motivo_estado_servicio && (
                      <T variant="small" tone="muted">
                        {s.motivo_estado_servicio}
                      </T>
                    )}
                  </View>
                );
              })}
              <Divider />
              <View className="flex-row justify-between items-center">
                <T variant="label" tone="stone">
                  Importe acordado
                </T>
                <T variant="heading" tone="champagne">
                  {money(totalAgreed)}
                </T>
              </View>
            </Card>

            {(activePayments.length > 0 || totalPaid > 0 || balance > 0) && (
              <Card tone="graphite">
                <T variant="heading" tone="ivory">
                  Pagos de esta cita
                </T>
                <View className="flex-row justify-between">
                  <T tone="stone">Pagado</T>
                  <T variant="label" tone="sageLight">
                    {money(totalPaid)}
                  </T>
                </View>
                {balance > 0 && a.estado !== 'cancelada' && (
                  <View className="flex-row justify-between">
                    <T tone="stone">Saldo pendiente</T>
                    <T variant="label" tone="caramelLight">
                      {money(balance)}
                    </T>
                  </View>
                )}
                {activePayments.length > 0 && (
                  <>
                    <Divider />
                    {activePayments.map((payment) => (
                      <View key={payment.id} className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <T variant="label" tone="ivory">
                            {payment.metodo || 'Pago registrado'}
                          </T>
                          <T variant="small" tone="stone">
                            {dateLabel(payment.fecha_cobro, true)}
                            {payment.referencia_pago ? ` · Ref. ${payment.referencia_pago}` : ''}
                          </T>
                        </View>
                        <T variant="label" tone="champagne">
                          {money(payment.importe)}
                        </T>
                      </View>
                    ))}
                  </>
                )}
              </Card>
            )}

            {a.motivo_cancelacion && (
              <Card>
                <T variant="label" tone="ivory">
                  Motivo de cancelación
                </T>
                <T tone="stone">{a.motivo_cancelacion}</T>
              </Card>
            )}

            {manageable ? (
              <>
                <Button
                  title="Cambiar fecha u hora"
                  icon="calendar-outline"
                  onPress={() => router.push({ pathname: '/reprogramar/[id]', params: { id } })}
                />
                <Button
                  title="Cancelar mi cita"
                  variant="secondary"
                  onPress={() => setConfirm(true)}
                />
              </>
            ) : (
              <Button
                title="Reservar un nuevo momento"
                icon="arrow-forward"
                onPress={() => router.push('/reservar')}
              />
            )}
          </>
        )}

        <Dialog
          visible={confirm && !!manageable}
          title="¿Cancelar este momento?"
          onClose={() => {
            if (!action.busy) setConfirm(false);
          }}
        >
          <T tone="stone">
            La cita se cancelará y su horario quedará disponible. Puedes reservar de nuevo cuando lo
            desees.
          </T>
          <Field
            label="Motivo (opcional)"
            multiline
            numberOfLines={3}
            maxLength={2000}
            value={reason}
            onChangeText={setReason}
            editable={!action.busy}
          />
          <Feedback error={action.error} />
          <Button
            title="Sí, cancelar mi cita"
            variant="danger"
            busy={action.busy}
            onPress={cancel}
          />
          <Button
            title="Conservar mi cita"
            variant="secondary"
            disabled={action.busy}
            onPress={() => setConfirm(false)}
          />
        </Dialog>
      </AuthGate>
    </Screen>
  );
}
