import { router } from 'expo-router';
import { Button, Empty, Screen } from '@/ui/components';
export default function NotFound() {
  return (
    <Screen back>
      <Empty
        title="Busquemos otro camino"
        message="Esta pantalla no está disponible."
        action={<Button title="Volver al inicio" onPress={() => router.replace('/')} />}
      />
    </Screen>
  );
}
