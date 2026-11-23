import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { dateLabel, money, serviceStates, timeLabel } from '@/lib/dates';
import type { HistoryEntry } from '@/lib/types';
import { useResource } from '@/lib/use-resource';
import {
  AuthGate,
  Badge,
  Button,
  Card,
  Empty,
  Feedback,
  Icon,
  Screen,
  T,
} from '@/ui/components';
import { palette } from '@/ui/theme';

export default function History() {
  const { profile } = useAuth();
  const history = useResource<HistoryEntry[]>(profile ? '/mi-perfil/historial' : null, true);

  return (
    <Screen
      back
      title="Tu historia de cuidado."
      eyebrow="Mis atenciones"
      onRefresh={history.reload}
      refreshing={history.loading && !!history.data}
    >
      <AuthGate>
        <T tone="stone">Los servicios que disfrutaste en tus visitas a MiliBrows.</T>
        <Feedback
          loading={history.loading && !history.data}
          error={history.error}
          onRetry={history.reload}
        />
        {history.data?.map((h) => {
          const autoDiscount = Number(h.monto_descuento_automatico || 0);
          return (
            <Pressable
              key={h.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/cita/[id]', params: { id: h.id_cita } })}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <Card>
                <View className="flex-row justify-between items-center gap-2">
                  <T
                    variant="small"
                    tone="caramelDark"
                    style={{ textTransform: 'capitalize', flex: 1 }}
                  >
                    {dateLabel(h.cita.fecha)}
                    {h.hora_inicio ? ` · ${timeLabel(h.hora_inicio)}` : ''}
                  </T>
                  <Icon name="chevron-forward" size={17} color={palette.stone} />
                </View>
                <T variant="heading" tone="black" style={{ fontSize: 17 }}>
                  {h.nombre_servicio_acordado}
                </T>
                {h.estilista && (
                  <T variant="small" tone="stone">
                    Con {h.estilista} · {h.duracion_minutos} min
                  </T>
                )}
                <View className="flex-row justify-between items-center gap-2">
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <Badge
                      label={serviceStates[h.estado_servicio] || 'Realizado'}
                      tone="sage"
                      icon="checkmark-circle-outline"
                    />
                    {autoDiscount > 0 && (
                      <Badge label={`Dto. -${money(autoDiscount)}`} tone="gold" />
                    )}
                  </View>
                  <T variant="label" tone="black" style={{ fontSize: 14 }}>
                    {money(h.precio_acordado)}
                  </T>
                </View>
              </Card>
            </Pressable>
          );
        })}
        {history.data?.length === 0 && (
          <Empty
            icon="flower-outline"
            title="Tu historia empieza aquí"
            message="Después de tu primera atención, encontrarás aquí los servicios realizados."
            action={
              <Button title="Reservar mi primera visita" onPress={() => router.push('/reservar')} />
            }
          />
        )}
      </AuthGate>
    </Screen>
  );
}
