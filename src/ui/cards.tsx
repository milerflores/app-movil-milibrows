import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { assetUrl } from '@/lib/api';
import {
  appointmentDateRef,
  appointmentStylists,
  appointmentTimeRange,
  dateLabel,
  money,
  states,
  studioZone,
} from '@/lib/dates';
import type { Appointment, Service } from '@/lib/types';
import { Badge, Card, Divider, Icon, T } from './components';
import { palette } from './theme';

export function ServicePhoto({ service, height = 190 }: { service: Service; height?: number }) {
  return service.imagen_url ? (
    <Image
      source={{ uri: assetUrl(service.imagen_url) }}
      style={{ height, width: '100%', backgroundColor: palette.sand }}
      contentFit="cover"
      transition={180}
      accessibilityLabel={service.nombre}
    />
  ) : (
    <View style={{ height }} className="bg-sand items-center justify-center">
      <Icon name="flower-outline" size={40} color={palette.caramel} />
    </View>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${service.nombre}`}
      onPress={() => router.push({ pathname: '/servicio/[id]', params: { id: service.id } })}
      className="rounded-[22px] overflow-hidden border border-line bg-white"
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
        shadowColor: '#1A1A1A',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
      })}
    >
      <View className="relative">
        <ServicePhoto service={service} />
        <View className="absolute top-3 right-3 bg-ivory/95 px-3 py-1 rounded-full flex-row items-center gap-1 border border-line">
          <Icon name="time-outline" size={13} color={palette.caramelDark} />
          <T variant="label" tone="graphite" style={{ fontSize: 11 }}>
            {service.duracion_minutos} min
          </T>
        </View>
      </View>
      <View className="p-5 gap-2">
        <T variant="heading" tone="black">
          {service.nombre}
        </T>
        {service.descripcion && (
          <T tone="stone" numberOfLines={2}>
            {service.descripcion}
          </T>
        )}
        <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-line">
          <View>
            <T variant="small" tone="stone">
              Tarifa del estudio
            </T>
            <T variant="label" tone="black" style={{ fontSize: 16 }}>
              {money(service.precio)}
            </T>
          </View>
          <View className="flex-row items-center gap-1.5 bg-sand px-3.5 py-2 rounded-full">
            <T variant="label" tone="caramelDark">
              Ver detalle
            </T>
            <Icon name="arrow-forward" size={15} color={palette.caramelDark} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const a = appointment;
  const dateRef = appointmentDateRef(a);
  const parsedDate = new Date(dateRef.length === 10 ? `${dateRef}T12:00:00-05:00` : dateRef);
  const total = a.servicios.reduce((sum, s) => sum + Number(s.precio_acordado), 0);
  const balance = Number(a.saldo_pendiente ?? 0);
  const stateTone =
    a.estado === 'confirmada'
      ? 'sage'
      : a.estado === 'completada'
        ? 'gold'
        : a.estado === 'cancelada'
          ? 'sand'
          : 'danger';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Cita del ${dateLabel(dateRef)}`}
      onPress={() => router.push({ pathname: '/cita/[id]', params: { id: a.id } })}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <Card>
        <View className="flex-row justify-between items-center gap-3">
          <View className="flex-row gap-3 items-center flex-1">
            <View className="bg-sand rounded-2xl px-3.5 py-2 items-center min-w-[56px]">
              <T variant="heading" tone="black">
                {new Intl.DateTimeFormat('es-PE', {
                  timeZone: studioZone,
                  day: '2-digit',
                }).format(parsedDate)}
              </T>
              <T variant="small" tone="caramelDark" style={{ textTransform: 'uppercase' }}>
                {new Intl.DateTimeFormat('es-PE', {
                  timeZone: studioZone,
                  month: 'short',
                }).format(parsedDate)}
              </T>
            </View>
            <View className="flex-1 gap-0.5">
              <T variant="label" tone="black" style={{ fontSize: 13 }}>
                {appointmentTimeRange(a)}
              </T>
              <T variant="small" tone="stone" numberOfLines={1}>
                Con {appointmentStylists(a)}
              </T>
            </View>
          </View>
          <Icon name="chevron-forward" size={18} color={palette.stone} />
        </View>
        <Divider />
        <T variant="label" tone="graphite" style={{ fontSize: 14 }}>
          {a.servicios.map((s) => s.nombre_servicio_acordado).join(' + ')}
        </T>
        <View className="flex-row justify-between items-center gap-2">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Badge label={states[a.estado]} tone={stateTone} />
            {balance > 0 && a.estado !== 'cancelada' && (
              <Badge label={`Saldo ${money(balance)}`} tone="caramel" />
            )}
          </View>
          <T variant="label" tone="black" style={{ fontSize: 14 }}>
            {money(total)}
          </T>
        </View>
      </Card>
    </Pressable>
  );
}
