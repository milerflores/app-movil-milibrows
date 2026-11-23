import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { dateLabel, money } from '@/lib/dates';
import type { ClientPayment } from '@/lib/types';
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

export default function Payments() {
  const { profile } = useAuth();
  const payments = useResource<ClientPayment[]>(profile ? '/mi-perfil/pagos' : null, true);
  const totalPaid = (payments.data || [])
    .filter((p) => p.estado === 'registrado')
    .reduce((sum, p) => sum + Number(p.importe), 0);

  return (
    <Screen
      back
      title="Tus pagos en el estudio."
      eyebrow="Mis pagos"
      onRefresh={payments.reload}
      refreshing={payments.loading && !!payments.data}
    >
      <AuthGate>
        <T tone="stone">
          Aquí puedes revisar el detalle de los cobros registrados por tus visitas.
        </T>
        <Feedback
          loading={payments.loading && !payments.data}
          error={payments.error}
          onRetry={payments.reload}
        />
        {payments.data && payments.data.length > 0 && (
          <Card tone="sand">
            <T variant="small" tone="stone">
              TOTAL REGISTRADO
            </T>
            <T variant="title" tone="black">
              {money(totalPaid)}
            </T>
            <T variant="small" tone="stone">
              {payments.data.filter((p) => p.estado === 'registrado').length}{' '}
              {payments.data.filter((p) => p.estado === 'registrado').length === 1
                ? 'pago confirmado'
                : 'pagos confirmados'}
            </T>
          </Card>
        )}
        {payments.data?.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/cita/[id]', params: { id: p.id_cita } })}
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Card>
              <View className="flex-row justify-between items-center gap-2">
                <T
                  variant="small"
                  tone="caramelDark"
                  style={{ textTransform: 'capitalize', flex: 1 }}
                >
                  {dateLabel(p.fecha_cobro)}
                </T>
                <Icon name="chevron-forward" size={17} color={palette.stone} />
              </View>
              <View className="flex-row justify-between items-center gap-3">
                <View className="flex-1 gap-0.5">
                  <T variant="heading" tone="black" style={{ fontSize: 17 }}>
                    {p.metodo?.nombre || 'Pago en estudio'}
                  </T>
                  <T variant="small" tone="stone">
                    Reserva #{p.id_cita}
                    {p.referencia_pago ? ` · Ref. ${p.referencia_pago}` : ''}
                  </T>
                </View>
                <T variant="heading" tone="black" style={{ fontSize: 18 }}>
                  {money(p.importe)}
                </T>
              </View>
              <Badge
                label={p.estado === 'registrado' ? 'Registrado' : 'Anulado'}
                tone={p.estado === 'registrado' ? 'sage' : 'danger'}
              />
            </Card>
          </Pressable>
        ))}
        {payments.data?.length === 0 && (
          <Empty
            icon="card-outline"
            title="Aún no tienes pagos registrados"
            message="Cuando realices tu primera atención en el estudio, tus pagos aparecerán aquí."
            action={<Button title="Reservar una cita" onPress={() => router.push('/reservar')} />}
          />
        )}
      </AuthGate>
    </Screen>
  );
}
