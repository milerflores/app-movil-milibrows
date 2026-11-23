export function validateEmail(value: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
    throw new Error('Ingresa un correo electrónico válido.');
}
export function validatePassword(value: string, confirmation: string) {
  if (value.length < 10 || !/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value))
    throw new Error(
      'La contraseña necesita al menos 10 caracteres, mayúsculas, minúsculas y números.',
    );
  if (value !== confirmation) throw new Error('Las contraseñas no coinciden.');
}
export function destination(value?: string) {
  const selected = value?.match(/^\/reservar\?servicio=([1-9]\d*)$/);
  if (selected) return { pathname: '/reservar' as const, params: { servicio: selected[1] } };
  const appointment = value?.match(/^\/(cita|reprogramar)\/([1-9]\d*)$/);
  if (appointment)
    return {
      pathname:
        appointment[1] === 'cita' ? ('/cita/[id]' as const) : ('/reprogramar/[id]' as const),
      params: { id: appointment[2] },
    };
  return value === '/reservar' ||
    value === '/citas' ||
    value === '/club' ||
    value === '/perfil' ||
    value === '/historial' ||
    value === '/pagos' ||
    value === '/perfil/editar'
    ? value
    : '/';
}
