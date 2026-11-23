import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useAction } from '@/lib/use-action';
import { destination, validateEmail } from '@/lib/validation';
import { Brand, Button, Card, Feedback, Field, Screen, T } from '@/ui/components';

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
      <View className="items-center py-4">
        <Brand />
      </View>
      <View>
        <T variant="title">Qué lindo{'\n'}verte de nuevo.</T>
        <T tone="stone" className="mt-3">
          Tu próximo momento de cuidado empieza aquí.
        </T>
      </View>
      <Card>
        <Field
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
          label="Contraseña"
          password
          autoCapitalize="none"
          autoComplete="current-password"
          value={password}
          onChangeText={setPassword}
          editable={!action.busy}
        />
        <Feedback error={action.error} />
        <Button title="Iniciar sesión" busy={action.busy || auth.loading} onPress={submit} />
        <Button
          title="Olvidé mi contraseña"
          variant="secondary"
          disabled={action.busy}
          onPress={() => router.push('/recuperar')}
        />
      </Card>
      <T tone="stone" style={{ textAlign: 'center' }}>
        ¿Es tu primera visita?
      </T>
      <Button
        title="Crear mi cuenta"
        variant="secondary"
        onPress={() => router.push({ pathname: '/registro', params: { next } })}
      />
      <T variant="small" tone="stone" style={{ textAlign: 'center' }}>
        Usa la misma cuenta del portal de clientes.
      </T>
    </Screen>
  );
}
