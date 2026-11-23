import { useLocalSearchParams } from 'expo-router';
import { RescheduleForm } from '@/features/reschedule';
import { useAuth } from '@/lib/auth';
import { canManage } from '@/lib/dates';
import type { Appointment } from '@/lib/types';
import { useResource } from '@/lib/use-resource';
import { AuthGate, Empty, Feedback, Screen } from '@/ui/components';
export default function Reschedule() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const a = useResource<Appointment>(profile && /^\d+$/.test(id || '') ? `/citas/${id}` : null);
  return (
    <Screen back title="Hagamos espacio para ti." eyebrow="Reprograma tu cita">
      <AuthGate>
        <Feedback loading={a.loading} error={a.error} onRetry={a.reload} />
        {a.data &&
          (canManage(a.data) ? (
            <RescheduleForm key={a.data.id} appointment={a.data} />
          ) : (
            <Empty
              title="Esta cita ya no puede cambiarse"
              message="Solo puedes reprogramar citas confirmadas que todavía no han comenzado."
            />
          ))}
      </AuthGate>
    </Screen>
  );
}
