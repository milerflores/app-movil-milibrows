import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useAction } from '@/lib/use-action';
import { destination, validateEmail } from '@/lib/validation';
import { Brand, Button, Feedback, Field, Screen, T } from '@/ui/components';

export default function SignIn() {
  const { next, correo: initialEmail } = useLocalSearchParams<{ next?: string; correo?: string }>();
  const auth = useAuth();
  const action = useAction();
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');

  if (auth.profile) return <Redirect href={destination(next)} />;

  const submit = () =>
    action.run(async () => {
      validateEmail(email);
      if (!password) throw new Error('Ingresa tu contraseña.');
      await auth.signIn(email, password);
      setPassword('');
      router.replace(destination(next));
    });

  return (
    <Screen back>
      <View className="items-center gap-2 pt-4 pb-2">
        <Brand centered />
        <T variant="hero" tone="ivory" style={{ textAlign: 'center', marginTop: 8 }}>
          Iniciar sesión
        </T>
        <T tone="stone" style={{ textAlign: 'center' }}>
          Nos alegra que estés de vuelta.
        </T>
      </View>

      <View className="gap-3.5">
        <Field
          leadingIcon="mail-outline"
          label="Correo electrónico"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          maxLength={255}
          editable={!action.busy}
          placeholder="tu@correo.com"
        />
        <Field
          leadingIcon="lock-closed-outline"
          label="Contraseña"
          password
          autoCapitalize="none"
          autoComplete="current-password"
          value={password}
          onChangeText={setPassword}
          editable={!action.busy}
          placeholder="••••••••"
        />
        <Pressable
          accessibilityRole="button"
          disabled={action.busy}
          onPress={() => router.push('/recuperar')}
          className="self-end py-1"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <T variant="small" tone="champagne">
            ¿Olvidaste tu contraseña?
          </T>
        </Pressable>

        <Feedback error={action.error} />

        <Button title="Iniciar sesión" busy={action.busy || auth.loading} onPress={submit} />
      </View>

      <View className="flex-row justify-center items-center gap-1.5 pt-2">
        <T variant="body" tone="stone">
          ¿Primera visita?
        </T>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/registro', params: { next } })}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <T variant="label" tone="champagne" style={{ fontSize: 14 }}>
            Crear cuenta
          </T>
        </Pressable>
      </View>
    </Screen>
  );
}
