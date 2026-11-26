import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { canManage } from '@/lib/dates';
import type { Appointment } from '@/lib/types';
import { useResource } from '@/lib/use-resource';
import { AppointmentCard } from '@/ui/cards';
import { AuthGate, Button, Chip, Empty, Feedback, Screen, T } from '@/ui/components';

export default function Appointments() {
  const { profile } = useAuth();
  const [upcoming, setUpcoming] = useState(true);
  const citas = useResource<Appointment[]>(profile ? '/citas' : null, true);
  const upcomingList = (citas.data || []).filter(canManage);
  const pastList = (citas.data || []).filter((a) => !canManage(a)).reverse();
  const shown = upcoming ? upcomingList : pastList;

  return (
    <Screen refreshing={citas.loading && !!citas.data} onRefresh={citas.reload}>
      <View className="pt-1">
        <T variant="hero" tone="ivory">
          Mis citas
        </T>
      </View>

      <AuthGate>
        <View className="flex-row gap-2">
          <Chip
            title={`Próximas (${upcomingList.length})`}
            selected={upcoming}
            onPress={() => setUpcoming(true)}
          />
          <Chip
            title={`Anteriores (${pastList.length})`}
            selected={!upcoming}
            onPress={() => setUpcoming(false)}
          />
        </View>
        <Feedback
          loading={citas.loading && !citas.data}
          error={citas.error}
          onRetry={citas.reload}
        />
        {shown.map((a) => (
          <AppointmentCard key={a.id} appointment={a} />
        ))}
        {!shown.length && !citas.loading && !citas.error && (
          <Empty
            icon="calendar-outline"
            title={upcoming ? 'Tu próximo momento te espera' : 'Cada visita cuenta'}
            message={
              upcoming
                ? 'Elige un servicio y encuentra el horario perfecto para ti.'
                : 'Aquí verás tus citas anteriores y su estado.'
            }
          />
        )}
        <Button title="Reservar una cita" icon="add" onPress={() => router.push('/reservar')} />
      </AuthGate>
    </Screen>
  );
}
