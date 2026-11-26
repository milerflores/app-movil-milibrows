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
import type { Appointment, PublicStylist, Service } from '@/lib/types';
import { useAppTheme } from '@/lib/theme';
import { Badge, Divider, Icon, T } from './components';

export function ServicePhoto({
  service,
  height = 196,
  width,
  borderRadius = 0,
}: {
  service: Service;
  height?: number;
  width?: number;
  borderRadius?: number;
}) {
  const { palette } = useAppTheme();
  return service.imagen_url ? (
    <Image
      source={{ uri: assetUrl(service.imagen_url) }}
      style={{
        height,
        width: width ?? '100%',
        borderRadius,
        backgroundColor: palette.graphite,
      }}
      contentFit="cover"
      transition={180}
      accessibilityLabel={service.nombre}
    />
  ) : (
    <View
      style={{ height, width: width ?? '100%', borderRadius }}
      className="bg-graphite items-center justify-center"
    >
      <Icon name="flower-outline" size={30} color={palette.muted} />
    </View>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  const { palette } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${service.nombre}`}
      onPress={() => router.push({ pathname: '/servicio/[id]', params: { id: service.id } })}
      className="rounded-[22px] bg-surface p-3.5 flex-row gap-4 items-center"
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.992 : 1 }],
      })}
    >
      <ServicePhoto service={service} height={96} width={96} borderRadius={16} />
      <View className="flex-1 gap-2">
        <T variant="heading" tone="ivory" numberOfLines={2} style={{ fontSize: 16, lineHeight: 21 }}>
          {service.nombre}
        </T>
        <View className="flex-row items-center gap-1.5">
          <Icon name="time-outline" size={13} color={palette.stone} />
          <T variant="small" tone="stone">
            {service.duracion_minutos} min
          </T>
        </View>
        <View className="flex-row items-center justify-between gap-2 pt-0.5">
          <T variant="label" tone="champagne" style={{ fontSize: 14 }}>
            {money(service.precio)}
          </T>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Reservar ${service.nombre}`}
            onPress={() => router.push({ pathname: '/reservar', params: { servicio: service.id } })}
            className="bg-primaryBg rounded-full py-1.5 px-3.5 items-center justify-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <T variant="label" tone="black" style={{ fontSize: 12 }}>
              Reservar
            </T>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const { palette } = useAppTheme();
  const a = appointment;
  const dateRef = appointmentDateRef(a);
  const parsedDate = new Date(dateRef.length === 10 ? `${dateRef}T12:00:00-05:00` : dateRef);
  const total = a.servicios.reduce((sum, s) => sum + Number(s.precio_acordado), 0);
  const balance = Number(a.saldo_pendiente ?? 0);
  const stateTone =
    a.estado === 'confirmada'
      ? 'gold'
      : a.estado === 'completada'
        ? 'sage'
        : a.estado === 'cancelada'
          ? 'danger'
          : 'graphite';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Cita del ${dateLabel(dateRef)}`}
      onPress={() => router.push({ pathname: '/cita/[id]', params: { id: a.id } })}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View
        className="rounded-[22px] bg-graphite p-5 gap-4"
        style={{
          shadowColor: '#1A1A1A',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.06,
          shadowRadius: 14,
          elevation: 2,
        }}
      >
        <View className="flex-row justify-between items-center gap-3.5">
          <View className="flex-row gap-3.5 items-center flex-1">
            <View className="bg-surface rounded-2xl px-3.5 py-2.5 items-center min-w-[58px]">
              <T variant="heading" tone="ivory" style={{ lineHeight: 22 }}>
                {new Intl.DateTimeFormat('es-PE', {
                  timeZone: studioZone,
                  day: '2-digit',
                }).format(parsedDate)}
              </T>
              <T
                variant="small"
                tone="champagne"
                style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: 1 }}
              >
                {new Intl.DateTimeFormat('es-PE', {
                  timeZone: studioZone,
                  month: 'short',
                }).format(parsedDate)}
              </T>
            </View>
            <View className="flex-1 gap-0.5">
              <T variant="label" tone="ivory" style={{ fontSize: 13 }}>
                {appointmentTimeRange(a)}
              </T>
              <T variant="small" tone="stone" numberOfLines={1}>
                Con {appointmentStylists(a)}
              </T>
            </View>
          </View>
          <Icon name="chevron-forward" size={17} color={palette.muted} />
        </View>
        <Divider />
        <T variant="label" tone="sand" style={{ fontSize: 14 }}>
          {a.servicios.map((s) => s.nombre_servicio_acordado).join(' + ')}
        </T>
        <View className="flex-row justify-between items-center gap-2">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Badge label={states[a.estado]} tone={stateTone} />
            {balance > 0 && a.estado !== 'cancelada' && (
              <Badge label={`Saldo ${money(balance)}`} tone="caramel" />
            )}
          </View>
          <T variant="label" tone="champagne" style={{ fontSize: 14 }}>
            {money(total)}
          </T>
        </View>
      </View>
    </Pressable>
  );
}

export function StylistCard({
  stylist,
  services,
}: {
  stylist: PublicStylist;
  services: Service[];
}) {
  const { palette } = useAppTheme();
  const initial = (stylist.nombre_completo.trim().charAt(0) || 'M').toUpperCase();
  const serviceIds = stylist.ids_servicios ?? [];
  const specialties = services
    .filter((s) => serviceIds.includes(s.id))
    .slice(0, 2)
    .map((s) => s.nombre);

  return (
    <View className="w-[210px] overflow-hidden rounded-[22px] bg-surface">
      {stylist.imagen_url ? (
        <Image
          source={{ uri: assetUrl(stylist.imagen_url) }}
          style={{ width: '100%', height: 150, backgroundColor: palette.graphite }}
          contentFit="cover"
          transition={180}
          accessibilityLabel={stylist.nombre_completo}
        />
      ) : (
        <View
          style={{ width: '100%', height: 150, backgroundColor: palette.graphite }}
          className="items-center justify-center"
        >
          <T variant="hero" tone="champagne" style={{ fontSize: 42 }}>
            {initial}
          </T>
        </View>
      )}
      <View className="p-3.5 gap-1.5">
        <T variant="heading" tone="ivory" numberOfLines={1} style={{ fontSize: 16, lineHeight: 21 }}>
          {stylist.nombre_completo}
        </T>
        <T variant="small" tone="stone" numberOfLines={2}>
          {specialties.length ? specialties.join(' · ') : 'Especialista MiliBrows Studio'}
        </T>
      </View>
    </View>
  );
}
