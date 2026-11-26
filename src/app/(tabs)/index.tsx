import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { appointmentDateRef, appointmentTimeRange, canManage, dateLabel } from '@/lib/dates';
import { useAppTheme } from '@/lib/theme';
import type { Appointment, PublicStylist, Service } from '@/lib/types';
import { useResource } from '@/lib/use-resource';
import { ServiceCard, StylistCard } from '@/ui/cards';
import {
  Brand,
  Button,
  Card,
  Feedback,
  Icon,
  IconButton,
  Screen,
  SectionTitle,
  T,
} from '@/ui/components';

export default function Home() {
  const { palette } = useAppTheme();
  const { profile } = useAuth();
  const services = useResource<Service[]>('/servicios');
  const stylists = useResource<PublicStylist[]>('/estilistas');
  const appointments = useResource<Appointment[]>(
    profile ? '/citas?estado=confirmada' : null,
    true,
  );
  const upcoming = (appointments.data ?? [])
    .filter(canManage)
    .sort((a, b) =>
      appointmentDateRef(a).localeCompare(appointmentDateRef(b)) ||
      (a.fecha_inicio ?? '').localeCompare(b.fecha_inicio ?? ''),
    );
  const next = upcoming[0] ?? null;
  const firstName =
    profile?.persona?.nombre || profile?.persona?.nombre_completo?.split(' ')[0] || 'bienvenida';

  return (
    <Screen
      onRefresh={() => {
        services.reload();
        stylists.reload();
        if (profile) appointments.reload();
      }}
      refreshing={services.loading && !!services.data}
    >
      <View className="flex-row justify-between items-center pt-1">
        <Brand />
        <IconButton
          name="person-outline"
          label="Mi perfil"
          onPress={() => router.push('/perfil')}
        />
      </View>

      <View className="gap-4">
        {!profile && (
          <View className="rounded-[24px] overflow-hidden bg-surface">
            <Image
              source={require('../../../assets/brand/hero.jpg')}
              style={{ width: '100%', height: 205 }}
              contentFit="cover"
            />
          </View>
        )}
        <View className="gap-2">
          <T variant="hero" tone="ivory">
            {profile ? `Hola, ${firstName}.` : 'La belleza está en cada detalle.'}
          </T>
          <T tone="stone">
            {profile
              ? 'Tu próximo momento de cuidado te espera en MiliBrows.'
              : 'Un espacio íntimo para realzar tu mirada con intención.'}
          </T>
        </View>
        {!profile && (
          <Button
            title="Reservar mi momento"
            icon="arrow-forward"
            onPress={() => router.push('/reservar')}
          />
        )}
      </View>

      {profile &&
        (next ? (
          <View className="gap-3">
            <View
              className="rounded-[22px] p-5 gap-4"
              style={{
                backgroundColor: '#1D1B18',
                shadowColor: '#1A1A1A',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.16,
                shadowRadius: 18,
                elevation: 4,
              }}
            >
              <View className="flex-row items-center justify-between gap-2">
                <T variant="small" style={{ fontSize: 12, color: 'rgba(250,248,245,0.68)' }}>
                  Próxima cita
                </T>
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: '#F3E5B5' }}
                >
                  <T variant="label" style={{ fontSize: 11, color: '#1A1A1A' }}>
                    Confirmada
                  </T>
                </View>
              </View>
              <T variant="heading" style={{ fontSize: 19, color: '#FAF8F5' }}>
                {next.servicios.map((s) => s.nombre_servicio_acordado).join(' + ')}
              </T>
              <View className="flex-row items-center gap-2">
                <Icon name="calendar-outline" size={16} color="#F3E5B5" />
                <T style={{ textTransform: 'capitalize', color: 'rgba(250,248,245,0.82)' }}>
                  {dateLabel(appointmentDateRef(next), true)} · {appointmentTimeRange(next)}
                </T>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/cita/[id]', params: { id: next.id } })}
                className="rounded-xl py-2.5 px-4 flex-row items-center justify-center gap-1.5"
                style={({ pressed }) => ({
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  opacity: pressed ? 0.78 : 1,
                })}
              >
                <T variant="label" style={{ fontSize: 13, color: '#FAF8F5' }}>
                  Ver cita
                </T>
                <Icon name="chevron-forward" size={15} color="#F3E5B5" />
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/citas')}
              className="self-center py-1 flex-row items-center gap-1"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <T variant="label" tone="champagne" style={{ fontSize: 13 }}>
                {upcoming.length > 1
                  ? `Ver más citas (${upcoming.length - 1} más)`
                  : 'Ver más citas'}
              </T>
              <Icon name="chevron-forward" size={14} color={palette.champagne} />
            </Pressable>
            <Button
              title="Reservar nueva cita"
              icon="arrow-forward"
              onPress={() => router.push('/reservar')}
            />
          </View>
        ) : (
          <Card tone="graphite">
            <View className="gap-1.5">
              <T variant="heading" tone="ivory" style={{ fontSize: 20 }}>
                Tu próximo momento te espera
              </T>
              <T tone="stone">
                Aún no tienes citas próximas. Elige tu tratamiento y el horario ideal para ti.
              </T>
            </View>
            <Button
              title="Reservar mi momento"
              icon="arrow-forward"
              onPress={() => router.push('/reservar')}
            />
          </Card>
        ))}

      <View className="gap-3.5">
        <SectionTitle
          title="Tratamientos"
          action="Catálogo"
          onPress={() => router.push('/servicios')}
        />
        <Feedback
          loading={services.loading && !services.data}
          error={services.error}
          onRetry={services.reload}
        />
        {services.data?.slice(0, 3).map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </View>

      {!profile && (
        <View
          className="rounded-[24px] p-5 gap-4"
          style={{
            backgroundColor: '#1D1B18',
            shadowColor: '#1A1A1A',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.16,
            shadowRadius: 18,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center gap-2">
            <Icon name="diamond-outline" size={18} color="#F3E5B5" />
            <T variant="heading" style={{ color: '#FAF8F5' }}>
              MiliBrows Club
            </T>
          </View>
          <T variant="small" style={{ color: 'rgba(250,248,245,0.78)' }}>
            Empieza con 5% de descuento desde tu primera cuenta y sube hasta 15% permanente en cada
            visita.
          </T>
          <View className="flex-row flex-wrap gap-2">
            {[
              { label: 'Glow 5%', bg: '#E3E9D8', text: '#1A1A1A', border: 'transparent' },
              { label: 'Golden 10%', bg: '#9A7442', text: '#FAF8F5', border: 'transparent' },
              { label: 'VIP 15%', bg: '#2A2621', text: '#F3E5B5', border: 'rgba(201,162,75,0.55)' },
            ].map((chip) => (
              <View
                key={chip.label}
                className="rounded-full px-3 py-1.5"
                style={{
                  backgroundColor: chip.bg,
                  borderWidth: chip.border === 'transparent' ? 0 : 1,
                  borderColor: chip.border,
                }}
              >
                <T variant="label" style={{ fontSize: 11, color: chip.text }}>
                  {chip.label}
                </T>
              </View>
            ))}
          </View>
          <Button
            title="Ver beneficios del club"
            icon="arrow-forward"
            onPress={() => router.push('/club')}
          />
        </View>
      )}

      {!!stylists.data?.length && (
        <View className="gap-3.5">
          <SectionTitle title="Nuestro equipo" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 4 }}
          >
            {stylists.data.map((stylist) => (
              <StylistCard
                key={stylist.id}
                stylist={stylist}
                services={services.data ?? []}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </Screen>
  );
}
