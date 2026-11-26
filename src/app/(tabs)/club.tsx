import { router } from 'expo-router';
import { View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { dateLabel, money } from '@/lib/dates';
import type { Loyalty, PointMovement } from '@/lib/types';
import { useResource } from '@/lib/use-resource';
import {
  Badge,
  Button,
  Card,
  Divider,
  Empty,
  Feedback,
  Icon,
  Screen,
  SectionTitle,
  T,
} from '@/ui/components';

const movementLabels: Record<PointMovement['tipo'], string> = {
  ganado: 'Puntos ganados',
  ajuste: 'Ajuste de puntos',
  reversion: 'Reversión de puntos',
};

const CLUB_TIERS = [
  {
    codigo: 'glow' as const,
    nombre: 'Glow',
    descuento: '5%',
    puntos: 'Desde 0 pts',
    tagline: 'Tu bienvenida al estudio desde el primer día.',
    perks: [
      '5% de descuento automático en tus citas',
      '1 punto por cada S/ 1 pagado en el estudio',
    ],
  },
  {
    codigo: 'golden' as const,
    nombre: 'Golden',
    descuento: '10%',
    puntos: 'Desde 400 pts',
    tagline: 'Beneficios preferenciales por tu constancia.',
    perks: [
      '10% de descuento automático en cada servicio',
      'Ascenso inmediato al llegar a 400 puntos',
    ],
  },
  {
    codigo: 'vip' as const,
    nombre: 'VIP',
    descuento: '15%',
    puntos: 'Desde 800 pts',
    tagline: 'Nuestra membresía más exclusiva del estudio.',
    perks: [
      '15% de descuento permanente en todos tus servicios',
      'El máximo reconocimiento en MiliBrows Studio',
    ],
  },
];

const tierStyles = {
  glow: {
    bg: '#E3E9D8',
    border: '#B8C4A6',
    title: '#1A1A1A',
    sub: '#484D3D',
    badgeBg: '#666B54',
    badgeText: '#FAF8F5',
    track: 'rgba(255,255,255,0.85)',
    fill: '#666B54',
    boxBg: 'rgba(255,255,255,0.72)',
    boxBorder: 'rgba(102,107,84,0.22)',
  },
  golden: {
    bg: '#9A7442',
    border: '#7C5A30',
    title: '#FAF8F5',
    sub: 'rgba(250,248,245,0.85)',
    badgeBg: '#F3E5B5',
    badgeText: '#1A1A1A',
    track: 'rgba(26,26,26,0.26)',
    fill: '#F3E5B5',
    boxBg: 'rgba(26,26,26,0.18)',
    boxBorder: 'rgba(255,255,255,0.18)',
  },
  vip: {
    bg: '#1D1B18',
    border: '#C9A24B',
    title: '#FAF8F5',
    sub: 'rgba(250,248,245,0.75)',
    badgeBg: '#F3E5B5',
    badgeText: '#1A1A1A',
    track: 'rgba(255,255,255,0.16)',
    fill: '#F3E5B5',
    boxBg: 'rgba(255,255,255,0.08)',
    boxBorder: 'rgba(201,162,75,0.3)',
  },
} as const;

export default function Club() {
  const { profile } = useAuth();
  const loyalty = useResource<Loyalty>(profile ? '/mi-perfil/fidelizacion' : null);
  const data = loyalty.data;

  const discount = Math.trunc(Number(data?.nivel?.porcentaje_descuento || 0));
  const tierCode =
    data?.nivel?.codigo === 'vip' || data?.nivel?.codigo === 'golden' ? data.nivel.codigo : 'glow';
  const tier = tierStyles[tierCode];
  const progress =
    data && data.siguiente_nivel && data.siguiente_nivel.puntos_minimos > 0
      ? Math.min(100, Math.max(4, Math.round((data.puntos / data.siguiente_nivel.puntos_minimos) * 100)))
      : 100;

  const otherTiers = CLUB_TIERS.filter((item) => item.codigo !== tierCode);

  return (
    <Screen refreshing={loyalty.loading && !!data} onRefresh={profile ? loyalty.reload : undefined}>
      <View className="pt-1 gap-1.5">
        <T variant="hero" tone="ivory">
          MiliBrows Club
        </T>
        {!profile && (
          <T tone="stone">
            Acumula 1 punto por cada S/ 1 pagado y desbloquea descuentos permanentes en cada
            visita.
          </T>
        )}
      </View>

      {!profile ? (
        <View className="gap-4">
          {CLUB_TIERS.map((item) => {
            const style = tierStyles[item.codigo];
            return (
              <View
                key={item.codigo}
                className="rounded-[24px] p-5 gap-3.5 border"
                style={{ backgroundColor: style.bg, borderColor: style.border }}
              >
                <View className="flex-row items-center justify-between gap-2">
                  <View
                    className="flex-row items-center gap-1.5 rounded-full px-3 py-1"
                    style={{ backgroundColor: style.badgeBg }}
                  >
                    <Icon name="diamond-outline" size={12} color={style.badgeText} />
                    <T variant="label" style={{ fontSize: 11, color: style.badgeText }}>
                      NIVEL {item.nombre.toUpperCase()}
                    </T>
                  </View>
                  <T variant="small" style={{ color: style.sub }}>
                    {item.puntos}
                  </T>
                </View>

                <View className="flex-row items-baseline gap-2">
                  <T variant="hero" style={{ fontSize: 34, lineHeight: 38, color: style.title }}>
                    {item.descuento}
                  </T>
                  <T variant="small" style={{ color: style.sub }}>
                    de descuento automático
                  </T>
                </View>

                <T variant="small" style={{ color: style.sub }}>
                  {item.tagline}
                </T>

                <View
                  className="pt-3 gap-2"
                  style={{ borderTopWidth: 1, borderTopColor: style.boxBorder }}
                >
                  {item.perks.map((perk) => (
                    <View key={perk} className="flex-row items-center gap-2">
                      <Icon name="checkmark-circle" size={15} color={style.badgeBg} />
                      <T variant="small" style={{ color: style.title, flex: 1 }}>
                        {perk}
                      </T>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          <View className="gap-3 pt-2">
            <Button
              title="Crear cuenta gratis"
              icon="arrow-forward"
              onPress={() => router.push('/registro')}
            />
            <Button
              title="Ya tengo cuenta"
              variant="secondary"
              onPress={() => router.push('/acceso')}
            />
          </View>
        </View>
      ) : (
        <>
          <Feedback
            loading={loyalty.loading && !data}
            error={loyalty.error}
            onRetry={loyalty.reload}
          />
          {data && (
          <>
            <View
              className="rounded-[24px] p-5 gap-5 border"
              style={{ backgroundColor: tier.bg, borderColor: tier.border }}
            >
              <View className="flex-row items-center justify-between gap-2">
                <View
                  className="flex-row items-center gap-1.5 rounded-full px-3 py-1"
                  style={{ backgroundColor: tier.badgeBg }}
                >
                  <Icon name="sparkles-outline" size={13} color={tier.badgeText} />
                  <T variant="label" style={{ fontSize: 11, color: tier.badgeText }}>
                    {discount > 0 ? `${discount}% de descuento` : 'Beneficio inicial'}
                  </T>
                </View>
                <T variant="small" style={{ color: tier.sub }}>
                  1 pt / {money(data.monto_por_punto)}
                </T>
              </View>

              <View className="flex-row items-end justify-between gap-4">
                <View className="flex-1">
                  <T variant="small" style={{ letterSpacing: 1.5, fontSize: 10, color: tier.sub }}>
                    TU NIVEL ACTUAL
                  </T>
                  <T variant="hero" style={{ marginTop: 4, color: tier.title }}>
                    {data.nivel.nombre}
                  </T>
                </View>
                <View className="items-end">
                  <T variant="hero" style={{ fontSize: 32, lineHeight: 36, color: tier.title }}>
                    {data.puntos}
                  </T>
                  <T variant="small" style={{ color: tier.sub }}>
                    puntos
                  </T>
                </View>
              </View>

              <View
                className="rounded-2xl p-4 gap-2.5 border"
                style={{ backgroundColor: tier.boxBg, borderColor: tier.boxBorder }}
              >
                {data.siguiente_nivel ? (
                  <>
                    <View
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: tier.track }}
                    >
                      <View
                        style={{
                          width: `${progress}%`,
                          height: 8,
                          backgroundColor: tier.fill,
                          borderRadius: 999,
                        }}
                      />
                    </View>
                    <T variant="small" style={{ color: tier.sub }}>
                      Te faltan{' '}
                      <T variant="label" style={{ color: tier.title }}>
                        {data.siguiente_nivel.puntos_faltantes} pts
                      </T>{' '}
                      para{' '}
                      <T variant="label" style={{ color: tier.title }}>
                        {data.siguiente_nivel.nombre}
                      </T>{' '}
                      ({Math.trunc(Number(data.siguiente_nivel.porcentaje_descuento))}% de
                      descuento).
                    </T>
                  </>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Icon name="checkmark-circle" size={17} color={tier.badgeBg} />
                    <T variant="small" style={{ color: tier.title }}>
                      Has alcanzado el nivel más alto de MiliBrows Club.
                    </T>
                  </View>
                )}
              </View>

              <View className="flex-row justify-between items-center pt-1">
                {[
                  { codigo: 'glow', label: 'Glow' },
                  { codigo: 'golden', label: 'Golden' },
                  { codigo: 'vip', label: 'VIP' },
                ].map((item) => {
                  const active = item.codigo === data.nivel.codigo;
                  return (
                    <View
                      key={item.codigo}
                      className="flex-row items-center gap-1.5 px-3 py-1 rounded-full"
                      style={active ? { backgroundColor: tier.badgeBg } : undefined}
                    >
                      <T
                        variant="label"
                        style={{ color: active ? tier.badgeText : tier.sub }}
                      >
                        {item.label}
                      </T>
                    </View>
                  );
                })}
              </View>
            </View>

            <View className="flex-row gap-2.5">
              <View className="flex-1 bg-surface rounded-2xl p-4 gap-0.5">
                <T variant="heading" tone="ivory">
                  {data.visitas}
                </T>
                <T variant="small" tone="stone">
                  Visitas
                </T>
              </View>
              <View className="flex-1 bg-surface rounded-2xl p-4 gap-0.5">
                <T variant="heading" tone="ivory">
                  {data.servicios_realizados}
                </T>
                <T variant="small" tone="stone">
                  Servicios
                </T>
              </View>
              <View className="flex-1 bg-surface rounded-2xl p-4 gap-0.5">
                <T variant="heading" tone="champagne" style={{ fontSize: 16 }}>
                  {money(data.monto_pagado)}
                </T>
                <T variant="small" tone="stone">
                  Acumulado
                </T>
              </View>
            </View>

            <SectionTitle title="Movimientos de puntos" />
            {data.movimientos.length ? (
              <Card>
                {data.movimientos.map((mov, index) => {
                  const positive = mov.puntos >= 0;
                  return (
                    <View key={mov.id} className="gap-3">
                      {index > 0 && <Divider />}
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1 gap-1">
                          <T variant="label" tone="ivory" style={{ fontSize: 13 }}>
                            {movementLabels[mov.tipo]}
                          </T>
                          {mov.motivo && (
                            <T variant="small" tone="stone">
                              {mov.motivo}
                            </T>
                          )}
                          <T variant="small" tone="muted">
                            {dateLabel(mov.fecha_creacion, true)}
                          </T>
                        </View>
                        <Badge
                          label={`${positive ? '+' : ''}${mov.puntos} pts`}
                          tone={positive ? 'sage' : 'danger'}
                        />
                      </View>
                    </View>
                  );
                })}
              </Card>
            ) : (
              <Empty
                icon="sparkles-outline"
                title="Tus primeros puntos te esperan"
                message="Cuando completes tu primera visita y pago en el estudio, verás aquí tu historial de puntos."
              />
            )}

            <View className="gap-2.5 pt-1">
              <T variant="small" tone="stone" style={{ letterSpacing: 1.2, fontSize: 11 }}>
                OTROS NIVELES DEL CLUB
              </T>
              <View className="rounded-[20px] bg-surface px-4 py-1">
                {otherTiers.map((item, idx) => {
                  const style = tierStyles[item.codigo];
                  return (
                    <View key={item.codigo}>
                      {idx > 0 && <Divider />}
                      <View className="flex-row items-center justify-between gap-3 py-3">
                        <View className="flex-row items-center gap-2.5 flex-1">
                          <View
                            className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
                            style={{ backgroundColor: style.bg }}
                          >
                            <Icon name="diamond-outline" size={11} color={style.title} />
                            <T variant="label" style={{ fontSize: 11, color: style.title }}>
                              {item.nombre}
                            </T>
                          </View>
                          <T variant="small" tone="stone">
                            {item.puntos}
                          </T>
                        </View>
                        <T variant="label" tone="ivory" style={{ fontSize: 13 }}>
                          {item.descuento} dto.
                        </T>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            <Button
              title="Reservar mi siguiente visita"
              icon="arrow-forward"
              onPress={() => router.push('/reservar')}
            />
          </>
        )}
        </>
      )}
    </Screen>
  );
}
