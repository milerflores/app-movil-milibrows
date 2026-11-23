import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { request } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useAction } from '@/lib/use-action';
import { destination, validateEmail, validatePassword } from '@/lib/validation';
import { Button, Card, Feedback, Field, Screen, T } from '@/ui/components';

export default function Register() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const auth = useAuth();
  const action = useAction();
  const [form, setForm] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    dni: '',
    telefono: '',
    correo: '',
    contrasena: '',
    contrasena_confirmacion: '',
  });
  const [created, setCreated] = useState(false);
  const change = (key: keyof typeof form) => (value: string) =>
    setForm((old) => ({ ...old, [key]: value }));

  if (auth.profile) return <Redirect href={destination(next)} />;

  async function submit() {
    await action.run(async () => {
      if (!form.nombre.trim()) throw new Error('Ingresa tu nombre.');
      if (!form.apellido_paterno.trim()) throw new Error('Ingresa tu apellido paterno.');
      if (!/^\d{8}$/.test(form.dni)) throw new Error('El DNI debe contener 8 dígitos.');
      validateEmail(form.correo);
      validatePassword(form.contrasena, form.contrasena_confirmacion);
      await request('/acceso/registro', {
        method: 'POST',
        anonymous: true,
        body: {
          nombre: form.nombre.trim(),
          apellido_paterno: form.apellido_paterno.trim(),
          apellido_materno: form.apellido_materno.trim() || null,
          dni: form.dni.trim(),
          telefono: form.telefono.trim() || null,
          correo: form.correo.trim().toLowerCase(),
          contrasena: form.contrasena,
          contrasena_confirmacion: form.contrasena_confirmacion,
        },
      });
      setCreated(true);
      try {
        await auth.signIn(form.correo, form.contrasena);
        setForm((old) => ({ ...old, contrasena: '', contrasena_confirmacion: '' }));
        router.replace(destination(next));
      } catch {
        setForm((old) => ({ ...old, contrasena: '', contrasena_confirmacion: '' }));
      }
    });
  }

  return (
    <Screen back title="Tu espacio de belleza." eyebrow="Bienvenida a MiliBrows">
      <T tone="stone">Crea tu cuenta y lleva tus citas, pagos y puntos contigo.</T>
      {created ? (
        <Card>
          <Feedback notice="Tu cuenta ya está creada. Inicia sesión para continuar." />
          <Button
            title="Ir a iniciar sesión"
            onPress={() =>
              router.replace({ pathname: '/acceso', params: { correo: form.correo, next } })
            }
          />
        </Card>
      ) : (
        <Card>
          <Field
            label="Nombre"
            autoComplete="given-name"
            value={form.nombre}
            onChangeText={change('nombre')}
            maxLength={100}
            editable={!action.busy}
            placeholder="Ej. María"
          />
          <Field
            label="Apellido paterno"
            autoComplete="family-name"
            value={form.apellido_paterno}
            onChangeText={change('apellido_paterno')}
            maxLength={100}
            editable={!action.busy}
            placeholder="Ej. Torres"
          />
          <Field
            label="Apellido materno (opcional)"
            value={form.apellido_materno}
            onChangeText={change('apellido_materno')}
            maxLength={100}
            editable={!action.busy}
            placeholder="Ej. Quispe"
          />
          <Field
            label="DNI"
            keyboardType="number-pad"
            value={form.dni}
            onChangeText={change('dni')}
            maxLength={8}
            editable={!action.busy}
            hint="Si ya nos visitaste, vincularemos tu historial con este DNI."
          />
          <Field
            label="Teléfono (opcional)"
            keyboardType="phone-pad"
            value={form.telefono}
            onChangeText={change('telefono')}
            maxLength={30}
            editable={!action.busy}
          />
          <Field
            label="Correo electrónico"
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            value={form.correo}
            onChangeText={change('correo')}
            maxLength={255}
            editable={!action.busy}
          />
          <Field
            label="Contraseña"
            password
            autoComplete="new-password"
            autoCapitalize="none"
            value={form.contrasena}
            onChangeText={change('contrasena')}
            editable={!action.busy}
            hint="Mínimo 10 caracteres, con mayúsculas, minúsculas y números."
          />
          <Field
            label="Confirmar contraseña"
            password
            autoComplete="new-password"
            autoCapitalize="none"
            value={form.contrasena_confirmacion}
            onChangeText={change('contrasena_confirmacion')}
            editable={!action.busy}
          />
          <Feedback error={action.error} />
          <Button title="Crear mi cuenta" busy={action.busy} onPress={submit} />
        </Card>
      )}
      <Button
        title="Ya tengo una cuenta"
        variant="secondary"
        disabled={action.busy}
        onPress={() => router.replace({ pathname: '/acceso', params: { next } })}
      />
    </Screen>
  );
}
