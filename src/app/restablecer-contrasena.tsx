import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { request } from '@/lib/api';
import { useAction } from '@/lib/use-action';
import { validateEmail, validatePassword } from '@/lib/validation';
import { Button, Card, Feedback, Field, Screen, T } from '@/ui/components';

export default function ResetPassword() {
  const { correo, token } = useLocalSearchParams<{ correo?: string; token?: string }>();
  const [email, setEmail] = useState(correo || '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [done, setDone] = useState(false);
  const action = useAction();
  return (
    <Screen back title="Un nuevo comienzo." eyebrow="Nueva contraseña">
      <Card>
        {done ? (
          <>
            <Feedback notice="Tu contraseña fue actualizada. Inicia sesión nuevamente." />
            <Button title="Iniciar sesión" onPress={() => router.replace('/acceso')} />
          </>
        ) : !token ? (
          <>
            <T>Este enlace está incompleto. Solicita uno nuevo para recuperar tu cuenta.</T>
            <Button title="Solicitar otro enlace" onPress={() => router.replace('/recuperar')} />
          </>
        ) : (
          <>
            <Field
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Field
              label="Nueva contraseña"
              password
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              hint="Mínimo 10 caracteres, mayúsculas, minúsculas y números."
            />
            <Field
              label="Confirmar contraseña"
              password
              value={confirmation}
              onChangeText={setConfirmation}
              autoCapitalize="none"
            />
            <Feedback error={action.error} />
            <Button
              title="Guardar contraseña"
              busy={action.busy}
              onPress={() =>
                action.run(async () => {
                  validateEmail(email);
                  validatePassword(password, confirmation);
                  await request('/acceso/restablecer-contrasena', {
                    method: 'POST',
                    anonymous: true,
                    body: {
                      correo: email.trim().toLowerCase(),
                      token,
                      contrasena: password,
                      contrasena_confirmacion: confirmation,
                    },
                  });
                  setPassword('');
                  setConfirmation('');
                  setDone(true);
                })
              }
            />
          </>
        )}
      </Card>
    </Screen>
  );
}
