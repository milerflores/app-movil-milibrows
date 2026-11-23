import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useAction } from '@/lib/use-action';
import {
  AuthGate,
  Button,
  Card,
  Dialog,
  Divider,
  Feedback,
  Icon,
  Screen,
  T,
} from '@/ui/components';
import { palette } from '@/ui/theme';

export default function Profile() {
  const auth = useAuth();
  const [logout, setLogout] = useState(false);
  const action = useAction();
  const person = auth.profile?.persona;

  return (
    <Screen
      title="Un espacio muy tuyo."
      eyebrow="Mi perfil"
      onRefresh={() => {
        void auth.refresh();
      }}
    >
      <AuthGate>
        <Card>
          <View className="flex-row gap-4 items-center">
            <View className="w-16 h-16 rounded-full bg-black items-center justify-center">
              <T variant="heading" tone="champagne">
                {person?.nombre_completo
                  .split(' ')
                  .slice(0, 2)
                  .map((s) => s[0])
                  .join('') || 'MB'}
              </T>
            </View>
            <View className="flex-1">
              <T variant="heading" tone="black">
                {person?.nombre_completo}
              </T>
              <T variant="small" tone="stone">
                Clienta MiliBrows
              </T>
            </View>
          </View>
          <Divider />
          <View className="gap-1">
            <T variant="small" tone="stone">
              CORREO DE ACCESO
            </T>
            <T selectable tone="black">
              {auth.profile?.correo}
            </T>
          </View>
          <T variant="small" tone="stone">
            DNI · {person?.dni || 'Sin registrar'}
          </T>
        </Card>

        <Card>
          <T variant="heading" tone="black">
            Mis datos de contacto
          </T>
          <View className="gap-1">
            <T variant="small" tone="stone">
              Teléfono
            </T>
            <T tone="black">{person?.telefono || 'Sin registrar'}</T>
          </View>
          <Divider />
          <View className="gap-1">
            <T variant="small" tone="stone">
              Correo de contacto
            </T>
            <T selectable tone="black">
              {person?.correo_contacto || 'Sin registrar'}
            </T>
          </View>
          {person?.cliente?.preferencias ? (
            <>
              <Divider />
              <View className="gap-1">
                <T variant="small" tone="stone">
                  Preferencias para tu atención
                </T>
                <T tone="graphite">{person.cliente.preferencias}</T>
              </View>
            </>
          ) : null}
          <Button
            title="Editar mis datos"
            variant="secondary"
            icon="create-outline"
            onPress={() => router.push('/perfil/editar')}
          />
        </Card>

        <Card>
          {[
            {
              name: 'Mi historial de atenciones',
              subtitle: 'Servicios realizados en tus visitas',
              icon: 'time-outline' as const,
              path: '/historial' as const,
            },
            {
              name: 'Mis pagos',
              subtitle: 'Comprobantes y cobros registrados',
              icon: 'card-outline' as const,
              path: '/pagos' as const,
            },
            {
              name: 'Mi club y puntos',
              subtitle: 'Tu nivel y descuentos automáticos',
              icon: 'sparkles-outline' as const,
              path: '/club' as const,
            },
            {
              name: 'Mis citas',
              subtitle: 'Próximas reservas y citas anteriores',
              icon: 'calendar-outline' as const,
              path: '/citas' as const,
            },
          ].map((item, i) => (
            <View key={item.path}>
              {i > 0 && <Divider />}
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(item.path)}
                className="flex-row items-center gap-3.5 py-2.5"
                style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
              >
                <View className="w-10 h-10 rounded-full bg-sand items-center justify-center">
                  <Icon name={item.icon} size={19} color={palette.caramelDark} />
                </View>
                <View className="flex-1">
                  <T variant="label" tone="black" style={{ fontSize: 14 }}>
                    {item.name}
                  </T>
                  <T variant="small" tone="stone">
                    {item.subtitle}
                  </T>
                </View>
                <Icon name="chevron-forward" size={17} color={palette.stone} />
              </Pressable>
            </View>
          ))}
        </Card>

        <Feedback
          error={auth.sessionError}
          onRetry={() => {
            void auth.refresh();
          }}
        />
        <Button title="Cerrar sesión" variant="secondary" onPress={() => setLogout(true)} />
        <T variant="small" tone="stone" style={{ textAlign: 'center' }}>
          MiliBrows Studio · Tu belleza, con intención.
        </T>

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
