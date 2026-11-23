import { router } from 'expo-router';
import { useState } from 'react';
import { request } from '@/lib/api';
import { useAction } from '@/lib/use-action';
import { validateEmail } from '@/lib/validation';
import { Button, Card, Feedback, Field, Screen, T } from '@/ui/components';

export default function Recovery() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const action = useAction();
  return (
    <Screen back title="Volvamos a conectar." eyebrow="Recupera tu cuenta">
      <T tone="stone">Te enviaremos un enlace para elegir una nueva contraseña.</T>
      <Card>
        {sent ? (
          <>
            <Feedback notice="Si el correo está registrado y activo, recibirás un enlace temporal. Revisa también tu carpeta de spam." />
            <T tone="stone">
              Abre el enlace de tu correo, cambia la contraseña y vuelve a iniciar sesión en la app.
            </T>
            <Button title="Volver a iniciar sesión" onPress={() => router.replace('/acceso')} />
          </>
        ) : (
          <>
            <Field
              label="Correo electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              maxLength={255}
            />
            <Feedback error={action.error} />
            <Button
              title="Enviar enlace"
              busy={action.busy}
              onPress={() =>
                action.run(async () => {
                  validateEmail(email);
                  await request('/acceso/solicitar-restablecimiento', {
                    method: 'POST',
                    anonymous: true,
                    body: { correo: email.trim().toLowerCase() },
                  });
                  setSent(true);
                })
              }
            />
          </>
        )}
      </Card>
    </Screen>
  );
}
