import { router } from 'expo-router';
import { useState } from 'react';
import { request } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Profile } from '@/lib/types';
import { useAction } from '@/lib/use-action';
import { validateEmail } from '@/lib/validation';
import { AuthGate, Button, Card, Feedback, Field, Screen, T } from '@/ui/components';

function Editor({ initial }: { initial: Profile }) {
  const auth = useAuth();
  const action = useAction();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nombre: initial.persona?.nombre || '',
    apellido_paterno: initial.persona?.apellido_paterno || '',
    apellido_materno: initial.persona?.apellido_materno || '',
    telefono: initial.persona?.telefono || '',
    correo_contacto: initial.persona?.correo_contacto || '',
    preferencias: initial.persona?.cliente?.preferencias || '',
  });
  const change = (key: keyof typeof form) => (value: string) => {
    setSaved(false);
    setForm((old) => ({ ...old, [key]: value }));
  };

  return (
    <Card>
      <Field
        label="Nombre"
        value={form.nombre}
        onChangeText={change('nombre')}
        autoComplete="given-name"
        maxLength={100}
        editable={!action.busy}
      />
      <Field
        label="Apellido paterno"
        value={form.apellido_paterno}
        onChangeText={change('apellido_paterno')}
        autoComplete="family-name"
        maxLength={100}
        editable={!action.busy}
      />
      <Field
        label="Apellido materno (opcional)"
        value={form.apellido_materno}
        onChangeText={change('apellido_materno')}
        maxLength={100}
        editable={!action.busy}
      />
      <Field
        label="Teléfono"
        value={form.telefono}
        onChangeText={change('telefono')}
        keyboardType="phone-pad"
        maxLength={30}
        editable={!action.busy}
      />
      <Field
        label="Correo de contacto"
        value={form.correo_contacto}
        onChangeText={change('correo_contacto')}
        autoCapitalize="none"
        keyboardType="email-address"
        maxLength={255}
        editable={!action.busy}
      />
      <Field
        label="Preferencias para tu atención"
        value={form.preferencias}
        onChangeText={change('preferencias')}
        multiline
        numberOfLines={4}
        maxLength={2000}
        editable={!action.busy}
        hint="Cuéntanos si hay algo que debamos tener en cuenta."
      />
      <T variant="small" tone="stone">
        El correo de contacto puede ser distinto del correo que usas para iniciar sesión. Tu DNI y
        correo de acceso se conservan.
      </T>
      <Feedback
        error={action.error}
        notice={saved ? 'Tus datos se guardaron correctamente.' : ''}
      />
      <Button
        title="Guardar mis datos"
        busy={action.busy}
        onPress={() =>
          action.run(async () => {
            if (!form.nombre.trim()) throw new Error('Ingresa tu nombre.');
            if (!form.apellido_paterno.trim()) throw new Error('Ingresa tu apellido paterno.');
            if (form.correo_contacto.trim()) validateEmail(form.correo_contacto);
            const result = await request<Profile>('/mi-perfil', {
              method: 'PATCH',
              body: {
                nombre: form.nombre.trim(),
                apellido_paterno: form.apellido_paterno.trim(),
                apellido_materno: form.apellido_materno.trim() || null,
                telefono: form.telefono.trim() || null,
                correo_contacto: form.correo_contacto.trim() || null,
                preferencias: form.preferencias.trim() || null,
              },
            });
            auth.updateProfile(result.datos);
            setSaved(true);
          })
        }
      />
      {saved && (
        <Button
          title="Volver a mi perfil"
          variant="secondary"
          onPress={() => router.replace('/perfil')}
        />
      )}
    </Card>
  );
}

export default function EditProfile() {
  const { profile } = useAuth();
  return (
    <Screen back title="Cuidamos de ti." eyebrow="Mis datos">
      <AuthGate>{profile && <Editor key={profile.id} initial={profile} />}</AuthGate>
    </Screen>
  );
}
