import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { canManage } from '@/lib/dates';
import type { Appointment, Service } from '@/lib/types';
import { useResource } from '@/lib/use-resource';
import { AppointmentCard, ServiceCard } from '@/ui/cards';
import {
  Badge,
  Brand,
  Button,
  Card,
  Eyebrow,
  Feedback,
  Icon,
  IconButton,
  Screen,
  SectionTitle,
  T,
} from '@/ui/components';
import { palette } from '@/ui/theme';

export default function Home() {
  const { profile } = useAuth();
  const services = useResource<Service[]>('/servicios');
  const appointments = useResource<Appointment[]>(
    profile ? '/citas?estado=confirmada' : null,
    true,
  );
  const next = appointments.data?.find(canManage);
  const firstName =
    profile?.persona?.nombre || profile?.persona?.nombre_completo?.split(' ')[0] || 'bienvenida';

  return (
    <Screen
      onRefresh={() => {
        services.reload();
        appointments.reload();
      }}
      refreshing={services.loading && !!services.data}
    >
      <View className="flex-row justify-between items-center">
        <Brand />
        <IconButton
          name="person-outline"
          label="Mi perfil"
          onPress={() => router.push('/perfil')}
        />
      </View>

      <View className="rounded-[26px] overflow-hidden bg-black" style={{ minHeight: 390 }}>
        <Image
          source={require('../../../assets/brand/hero.jpg')}
          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.42 }}
          contentFit="cover"
        />
        <View className="p-7 pt-8 gap-5 justify-between" style={{ minHeight: 390 }}>
          <View>
            <T variant="label" tone="champagne" style={{ letterSpacing: 2.5, fontSize: 10 }}>
              TU MOMENTO, TU ESENCIA
            </T>
            <T variant="title" tone="white" style={{ fontSize: 36, lineHeight: 44, marginTop: 16 }}>
              La belleza está{'\n'}en cada detalle.
            </T>
            <T tone="white" className="mt-3" style={{ maxWidth: 255, opacity: 0.9 }}>
              Un espacio pensado para cuidarte y realzar lo que te hace única.
            </T>
          </View>
          <Button
            title="Reservar mi momento"
            icon="arrow-forward"
            onPress={() => router.push('/reservar')}
          />
        </View>
      </View>

      {profile && (
        <Card tone="sand">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Eyebrow>Bienvenida de nuevo</Eyebrow>
              <T variant="heading" tone="black">
                Hola, {firstName}.
              </T>
              <T tone="stone" className="mt-0.5">
                Qué lindo tenerte por aquí.
              </T>
            </View>
            <Badge label="Clienta" tone="gold" icon="sparkles-outline" />
          </View>
          <View className="flex-row gap-2.5">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/citas')}
              className="flex-1 bg-white border border-line rounded-2xl px-3.5 py-3 flex-row items-center gap-2.5"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Icon name="calendar-outline" size={18} color={palette.caramelDark} />
              <T variant="label" tone="black">
                Mis citas
              </T>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/club')}
              className="flex-1 bg-white border border-line rounded-2xl px-3.5 py-3 flex-row items-center gap-2.5"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <Icon name="sparkles-outline" size={18} color={palette.gold} />
              <T variant="label" tone="black">
                Mis puntos
              </T>
            </Pressable>
          </View>
        </Card>
      )}

      {next && (
        <View className="gap-3.5">
          <SectionTitle
            title="Tu próxima visita"
            action="Mis citas"
            onPress={() => router.push('/citas')}
          />
          <AppointmentCard appointment={next} />
        </View>
      )}

      <View className="gap-4">
        <SectionTitle
          title="Encuentra tu ritual"
          action="Ver todos"
          onPress={() => router.push('/servicios')}
        />
        <T tone="stone">Cejas, pestañas y cuidados diseñados para realzar tu mirada.</T>
        <Feedback
          loading={services.loading && !services.data}
          error={services.error}
          onRetry={services.reload}
        />
        {services.data?.slice(0, 3).map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </View>

      <Card tone="dark">
        <View className="flex-row gap-2.5 items-center">
          <Icon name="sparkles-outline" color={palette.gold} size={20} />
          <T variant="label" tone="champagne" style={{ letterSpacing: 2 }}>
            MILIBROWS CLUB
          </T>
        </View>
        <T variant="heading" tone="white" style={{ fontSize: 22, lineHeight: 30 }}>
          Cuidarte también{'\n'}tiene sus recompensas.
        </T>
        <T tone="white" style={{ opacity: 0.8 }}>
          Cada atención pagada suma puntos. Sube de nivel entre Glow, Golden y VIP para disfrutar
          descuentos automáticos en tus próximas citas.
        </T>
        <Button
          title="Conocer mis beneficios"
          icon="arrow-forward"
          onPress={() => router.push('/club')}
        />
      </Card>

      <View className="items-center py-4 gap-2">
        <Brand />
        <T variant="small" tone="stone">
          Belleza con intención. Cuidado en cada detalle.
        </T>
      </View>
    </Screen>
  );
}
