import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useAppTheme } from '@/lib/theme';
import { useAction } from '@/lib/use-action';
import {
  AuthGate,
  Button,
  Dialog,
  Divider,
  Feedback,
  Icon,
  MenuRow,
  Screen,
  T,
} from '@/ui/components';

export default function Profile() {
  const auth = useAuth();
  const { isDark, toggleMode } = useAppTheme();
  const [logout, setLogout] = useState(false);
  const action = useAction();
  const person = auth.profile?.persona;

  return (
    <Screen
      onRefresh={() => {
        void auth.refresh();
      }}
    >
      <View className="pt-1">
        <T variant="hero" tone="ivory">
          Mi perfil
        </T>
      </View>

      <AuthGate returnTo="/">
        <View
          className="flex-row items-center gap-4 rounded-[22px] p-5"
          style={{
            backgroundColor: '#1D1B18',
            shadowColor: '#1A1A1A',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.16,
            shadowRadius: 18,
            elevation: 4,
          }}
        >
          <View
            className="rounded-full items-center justify-center"
            style={{ width: 64, height: 64, backgroundColor: '#F3E5B5' }}
          >
            <T variant="heading" style={{ fontSize: 20, color: '#1A1A1A' }}>
              {person?.nombre_completo
                .split(' ')
                .slice(0, 2)
                .map((s) => s[0])
                .join('') || 'MB'}
            </T>
          </View>
          <View className="flex-1 gap-1">
            <T variant="heading" style={{ fontSize: 19, color: '#FAF8F5' }}>
              {person?.nombre_completo}
            </T>
            <T variant="small" numberOfLines={1} style={{ color: 'rgba(250,248,245,0.7)' }}>
              {auth.profile?.correo}
            </T>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/perfil/editar')}
              className="flex-row items-center gap-1.5 self-start pt-0.5"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Icon name="create-outline" size={15} color="#F3E5B5" />
              <T variant="label" style={{ fontSize: 12, color: '#F3E5B5' }}>
                Editar perfil
              </T>
            </Pressable>
          </View>
        </View>

        <View className="rounded-[22px] bg-surface px-4">
          <MenuRow
            icon="person-outline"
            title="Datos personales"
            subtitle={person?.telefono || auth.profile?.correo}
            onPress={() => router.push('/perfil/editar')}
          />
          <Divider />
          <MenuRow
            icon="calendar-outline"
            title="Historial de atenciones"
            subtitle="Servicios realizados en tus visitas"
            onPress={() => router.push('/historial')}
          />
          <Divider />
          <MenuRow
            icon="card-outline"
            title="Mis pagos"
            subtitle="Comprobantes y cobros registrados"
            onPress={() => router.push('/pagos')}
          />
          <Divider />
          <MenuRow
            icon={isDark ? 'sunny-outline' : 'moon-outline'}
            title="Apariencia"
            subtitle={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            onPress={toggleMode}
          />
        </View>

        <View className="rounded-[22px] bg-dangerSoft px-4">
          <MenuRow
            icon="log-out-outline"
            title="Cerrar sesión"
            tone="danger"
            onPress={() => setLogout(true)}
          />
        </View>

        <Feedback
          error={auth.sessionError}
          onRetry={() => {
            void auth.refresh();
          }}
        />

        <Dialog
          visible={logout}
          title="¿Cerrar tu sesión?"
          onClose={() => {
            if (!action.busy) setLogout(false);
          }}
        >
          <T tone="stone">
            Tu cuenta y tus citas seguirán esperándote. Cerraremos el acceso de este dispositivo.
          </T>
          <Feedback error={action.error} />
          <Button
            title="Cerrar sesión"
            busy={action.busy}
            onPress={() =>
              action.run(async () => {
                await auth.signOut();
                setLogout(false);
                router.replace('/');
              })
            }
          />
          <Button
            title="Seguir aquí"
            variant="secondary"
            disabled={action.busy}
            onPress={() => setLogout(false)}
          />
        </Dialog>
      </AuthGate>
    </Screen>
  );
}
