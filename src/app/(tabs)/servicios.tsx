import { useMemo, useState } from 'react';
import { View } from 'react-native';
import type { Service } from '@/lib/types';
import { useResource } from '@/lib/use-resource';
import { ServiceCard } from '@/ui/cards';
import { Chip, Empty, Feedback, Field, Screen, T } from '@/ui/components';

type FilterMode = 'all' | 'quick' | 'price';

export default function Catalog() {
  const catalog = useResource<Service[]>('/servicios');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');

  const shown = useMemo(() => {
    const query = search.toLocaleLowerCase().trim();
    const list = (catalog.data || []).filter((s) => {
      const matchesSearch =
        !query || `${s.nombre} ${s.descripcion || ''}`.toLocaleLowerCase().includes(query);
      const matchesQuick = filter !== 'quick' || s.duracion_minutos <= 30;
      return matchesSearch && matchesQuick;
    });
    if (filter === 'price') {
      return [...list].sort((a, b) => Number(a.precio) - Number(b.precio));
    }
    return list;
  }, [catalog.data, search, filter]);

  return (
    <Screen
      title="Un cuidado a tu medida."
      eyebrow="Nuestros servicios"
      onRefresh={catalog.reload}
      refreshing={catalog.loading && !!catalog.data}
    >
      <T tone="stone">Elige lo que te hace sentir bien. Nosotras cuidamos cada detalle.</T>
      <Field
        label="Buscar un servicio"
        placeholder="Cejas, pestañas, laminado, cuidado…"
        value={search}
        onChangeText={setSearch}
      />
      <View className="flex-row flex-wrap gap-2">
        <Chip title="Todos" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip
          title="Express (≤ 30 min)"
          selected={filter === 'quick'}
          onPress={() => setFilter('quick')}
        />
        <Chip
          title="Menor precio"
          selected={filter === 'price'}
          onPress={() => setFilter('price')}
        />
      </View>
      {!catalog.loading && !catalog.error && catalog.data && catalog.data.length > 0 && (
        <T variant="small" tone="stone">
          Mostrando {shown.length} de {catalog.data.length}{' '}
          {catalog.data.length === 1 ? 'tratamiento' : 'tratamientos'}
        </T>
      )}
      <Feedback
        loading={catalog.loading && !catalog.data}
        error={catalog.error}
        onRetry={catalog.reload}
      />
      {shown.map((s) => (
        <ServiceCard key={s.id} service={s} />
      ))}
      {!catalog.loading && !catalog.error && !shown.length && (
        <Empty
          icon="flower-outline"
          title="Sin resultados por ahora"
          message={
            search || filter !== 'all'
              ? 'Prueba con otra búsqueda o cambia el filtro.'
              : 'Pronto encontrarás nuestros servicios aquí.'
          }
        />
      )}
    </Screen>
  );
}
