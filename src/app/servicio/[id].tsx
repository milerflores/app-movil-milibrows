import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { money } from '@/lib/dates';
import type { Service } from '@/lib/types';
import { useResource } from '@/lib/use-resource';
import { ServicePhoto } from '@/ui/cards';
import { Badge, Button, Card, Empty, Eyebrow, Feedback, Icon, Screen, T } from '@/ui/components';
import { palette } from '@/ui/theme';

export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const catalog = useResource<Service[]>('/servicios');
  const service = catalog.data?.find((s) => s.id === Number(id));

  return (
    <Screen back>
      <Feedback loading={catalog.loading} error={catalog.error} onRetry={catalog.reload} />
      {service ? (
        <>
          <View className="rounded-[24px] overflow-hidden border border-line">
            <ServicePhoto service={service} height={300} />
          </View>
          <View className="gap-1">
            <Eyebrow>MiliBrows Studio</Eyebrow>
            <T variant="title" tone="black">
              {service.nombre}
            </T>
          </View>
          <Card>
            <View className="flex-row justify-between items-center gap-3">
              <View>
                <T variant="small" tone="stone">
                  Tarifa del estudio
                </T>
                <T variant="heading" tone="black" style={{ fontSize: 22 }}>
                  {money(service.precio)}
                </T>
              </View>
              <Badge
                label={`${service.duracion_minutos} minutos`}
                tone="sand"
                icon="time-outline"
              />
            </View>
          </Card>
          <T tone="stone">
            {service.descripcion ||
              'Una atención personalizada para realzar tu belleza. Consulta con tu estilista los detalles de este servicio durante tu visita.'}
          </T>
          <Card tone="sand">
            <View className="flex-row items-center gap-2.5">
              <Icon name="sparkles-outline" size={18} color={palette.caramelDark} />
              <T variant="small" tone="graphite" className="flex-1">
                Si tienes descuento por nivel en MiliBrows Club, se aplicará automáticamente al
                reservar.
              </T>
            </View>
          </Card>
          <Button
            title="Elegir este servicio"
            icon="arrow-forward"
            onPress={() => router.push({ pathname: '/reservar', params: { servicio: service.id } })}
          />
          <T variant="small" tone="stone" style={{ textAlign: 'center' }}>
            Podrás elegir la fecha, hora y tu estilista antes de confirmar.
          </T>
        </>
      ) : !catalog.loading && !catalog.error ? (
        <Empty
          title="Servicio no disponible"
          message="Este servicio ya no forma parte del catálogo actual."
        />
      ) : null}
    </Screen>
  );
}
