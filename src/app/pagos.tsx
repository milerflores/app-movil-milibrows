import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { dateLabel, money } from '@/lib/dates';
import { useAppTheme } from '@/lib/theme';
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

export default function Payments() {
  const { palette } = useAppTheme();
  const { profile } = useAuth();
  const payments = useResource<ClientPayment[]>(profile ? '/mi-perfil/pagos' : null, true);
  const confirmed = (payments.data || []).filter((p) => p.estado === 'registrado');
  const totalPaid = confirmed.reduce((sum, p) => sum + Number(p.importe), 0);

  return (
    <Screen
      back
      title="Mis pagos"
      eyebrow="Historial de cobros"
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
          <View
            className="rounded-[22px] p-5 gap-2"
            style={{
              backgroundColor: '#1D1B18',
              shadowColor: '#1A1A1A',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.16,
              shadowRadius: 18,
              elevation: 4,
            }}
          >
            <T
              variant="small"
              style={{ letterSpacing: 1.5, fontSize: 10, color: 'rgba(250,248,245,0.65)' }}
            >
              TOTAL REGISTRADO
            </T>
            <T variant="hero" style={{ color: '#F3E5B5' }}>
              {money(totalPaid)}
            </T>
            <T variant="small" style={{ color: 'rgba(250,248,245,0.75)' }}>
              {confirmed.length}{' '}
              {confirmed.length === 1 ? 'pago confirmado' : 'pagos confirmados'}
            </T>
          </View>
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
                  tone="champagne"
                  style={{ textTransform: 'capitalize', flex: 1 }}
                >
                  {dateLabel(p.fecha_cobro)}
                </T>
                <Icon name="chevron-forward" size={17} color={palette.muted} />
              </View>
              <View className="flex-row justify-between items-center gap-3">
                <View className="flex-1 gap-0.5">
                  <T variant="heading" tone="ivory" style={{ fontSize: 17 }}>
                    {p.metodo?.nombre || 'Pago en estudio'}
                  </T>
                  <T variant="small" tone="stone">
                    Reserva #{p.id_cita}
                    {p.referencia_pago ? ` · Ref. ${p.referencia_pago}` : ''}
                  </T>
                </View>
                <T variant="heading" tone="champagne" style={{ fontSize: 18 }}>
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
