import { router } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { dateLabel, money } from '@/lib/dates';
import type { Loyalty, PointMovement } from '@/lib/types';
import { useResource } from '@/lib/use-resource';
import {
  AuthGate,
  Badge,
  Button,
  Card,
  Divider,
  Empty,
  Feedback,
  Icon,
  Screen,
  SectionTitle,
  T,
} from '@/ui/components';
import { palette } from '@/ui/theme';

const movementLabels: Record<PointMovement['tipo'], string> = {
  ganado: 'Puntos ganados',
  ajuste: 'Ajuste de puntos',
  reversion: 'Reversión de puntos',
};

export default function Club() {
  const { profile } = useAuth();
  const loyalty = useResource<Loyalty>(profile ? '/mi-perfil/fidelizacion' : null);
  const data = loyalty.data;

  const discount = Number(data?.nivel?.porcentaje_descuento || 0);
  const progress =
    data && data.siguiente_nivel && data.siguiente_nivel.puntos_minimos > 0
      ? Math.min(100, Math.max(4, Math.round((data.puntos / data.siguiente_nivel.puntos_minimos) * 100)))
      : 100;

  return (
    <Screen
      title="Cada visita, más especial."
      eyebrow="MiliBrows Club"
      refreshing={loyalty.loading && !!data}
      onRefresh={loyalty.reload}
    >
      <AuthGate>
        <Feedback
          loading={loyalty.loading && !data}
          error={loyalty.error}
          onRetry={loyalty.reload}
        />
        {data && (
          <>
            <View className="bg-black rounded-[26px] p-7 gap-6 overflow-hidden">
              <View className="flex-row items-center justify-between">
                <T variant="label" tone="champagne" style={{ letterSpacing: 2.2 }}>
                  MILIBROWS CLUB
                </T>
                <Icon name="sparkles-outline" color={palette.gold} size={26} />
              </View>

              <View className="flex-row items-end justify-between gap-4">
                <View className="flex-1">
                  <T variant="small" tone="white" style={{ opacity: 0.65 }}>
                    TU NIVEL ACTUAL
                  </T>
                  <T
                    variant="title"
                    tone="champagne"
                    style={{ fontSize: 36, lineHeight: 42, marginTop: 6 }}
                  >
                    {data.nivel.nombre}
                  </T>
                </View>
                <View className="items-end">
                  <T variant="heading" tone="white" style={{ fontSize: 28, lineHeight: 34 }}>
                    {data.puntos}
                  </T>
                  <T variant="small" tone="champagne">
                    puntos
                  </T>
                </View>
              </View>

              <View className="bg-white/10 rounded-2xl p-4 gap-2.5">
                <View className="flex-row items-center justify-between gap-2">
                  <T variant="label" tone="champagne">
                    {discount > 0
                      ? `${discount}% de descuento automático`
                      : 'Beneficio de bienvenida'}
                  </T>
                  <T variant="small" tone="white" style={{ opacity: 0.75 }}>
                    1 pt / {money(data.monto_por_punto)}
                  </T>
                </View>
                {data.siguiente_nivel ? (
                  <>
                    <View className="h-2 rounded-full bg-white/15 overflow-hidden">
                      <View
                        style={{
                          width: `${progress}%`,
                          height: 8,
                          backgroundColor: palette.gold,
                          borderRadius: 999,
                        }}
                      />
                    </View>
                    <T variant="small" tone="white" style={{ opacity: 0.82 }}>
                      Te faltan {data.siguiente_nivel.puntos_faltantes} pts para{' '}
                      {data.siguiente_nivel.nombre} (
                      {Number(data.siguiente_nivel.porcentaje_descuento)}% de descuento).
                    </T>
                  </>
                ) : (
                  <T variant="small" tone="champagne">
                    Has alcanzado el nivel más alto de MiliBrows Club.
                  </T>
                )}
              </View>

              <View className="flex-row gap-5">
                {[
                  { codigo: 'glow', label: 'Glow' },
                  { codigo: 'golden', label: 'Golden' },
                  { codigo: 'vip', label: 'VIP' },
                ].map((tier) => {
                  const active = tier.codigo === data.nivel.codigo;
                  return (
                    <T
                      key={tier.codigo}
                      variant="small"
                      tone={active ? 'champagne' : 'white'}
                      style={{ opacity: active ? 1 : 0.45 }}
                    >
                      {active ? '● ' : ''}
                      {tier.label}
                    </T>
                  );
                })}
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-sand rounded-2xl p-4 gap-1">
                <T variant="heading" tone="black">
                  {data.visitas}
                </T>
                <T variant="small" tone="stone">
                  Visitas
                </T>
              </View>
              <View className="flex-1 bg-sand rounded-2xl p-4 gap-1">
                <T variant="heading" tone="black">
                  {data.servicios_realizados}
                </T>
                <T variant="small" tone="stone">
                  Servicios
                </T>
              </View>
              <View className="flex-1 bg-sand rounded-2xl p-4 gap-1">
                <T variant="heading" tone="black" style={{ fontSize: 16 }}>
                  {money(data.monto_pagado)}
                </T>
                <T variant="small" tone="stone">
                  Acumulado
                </T>
              </View>
            </View>

            <Card tone="sand">
              <T variant="label" tone="caramelDark">
                ¿Cómo funcionan tus puntos?
              </T>
              <T tone="stone">
                Cada pago registrado en el estudio suma 1 punto por cada{' '}
                {money(data.monto_por_punto)}. Cuando subes de nivel, tu porcentaje de descuento se
                aplica automáticamente al reservar tus citas.
              </T>
            </Card>

            <SectionTitle title="Movimientos de puntos" />
            {data.movimientos.length ? (
              <Card>
                {data.movimientos.map((mov, index) => {
                  const positive = mov.puntos >= 0;
                  return (
                    <View key={mov.id} className="gap-3">
                      {index > 0 && <Divider />}
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1 gap-1">
                          <T variant="label" tone="black" style={{ fontSize: 13 }}>
                            {movementLabels[mov.tipo]}
                          </T>
                          {mov.motivo && (
                            <T variant="small" tone="stone">
                              {mov.motivo}
                            </T>
                          )}
                          <T variant="small" tone="stone">
                            {dateLabel(mov.fecha_creacion, true)}
                          </T>
                        </View>
                        <Badge
                          label={`${positive ? '+' : ''}${mov.puntos} pts`}
                          tone={positive ? 'sage' : 'danger'}
                        />
                      </View>
                    </View>
                  );
                })}
              </Card>
            ) : (
              <Empty
                icon="sparkles-outline"
                title="Tus primeros puntos te esperan"
                message="Cuando completes tu primera visita y pago en el estudio, verás aquí tu historial de puntos."
              />
            )}

            <Button
              title="Reservar mi siguiente visita"
              icon="arrow-forward"
              onPress={() => router.push('/reservar')}
            />
          </>
        )}
      </AuthGate>
    </Screen>
  );
}
