import { useLocalSearchParams } from 'expo-router';
import { useRef, type ComponentRef } from 'react';
import { ScrollView } from 'react-native';
import { BookingForm } from '@/features/booking';
import { AuthGate, Screen } from '@/ui/components';
export default function Booking() {
  const { servicio } = useLocalSearchParams<{ servicio?: string }>();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  return (
    <Screen back scrollRef={scroll} title="Un momento para ti." eyebrow="Reserva tu cita">
      <AuthGate
        returnTo={
          servicio && /^\d+$/.test(servicio) ? `/reservar?servicio=${servicio}` : '/reservar'
        }
      >
        <BookingForm
          initialService={servicio}
          onStepChange={() => scroll.current?.scrollTo({ y: 0, animated: true })}
        />
      </AuthGate>
    </Screen>
  );
}
