import { useMemo, useState } from 'react';
import { View } from 'react-native';
import type { Service } from '@/lib/types';
import { useResource } from '@/lib/use-resource';
import { ServiceCard } from '@/ui/cards';
import { Empty, Feedback, Field, Screen, T } from '@/ui/components';

export default function Catalog() {
  const catalog = useResource<Service[]>('/servicios');
  const [search, setSearch] = useState('');

  const shown = useMemo(() => {
    const query = search.toLocaleLowerCase().trim();
    return (catalog.data || []).filter(
      (s) => !query || `${s.nombre} ${s.descripcion || ''}`.toLocaleLowerCase().includes(query),
    );
  }, [catalog.data, search]);

  return (
    <Screen onRefresh={catalog.reload} refreshing={catalog.loading && !!catalog.data}>
      <View className="pt-1">
        <T variant="hero" tone="ivory">
          Catálogo
        </T>
      </View>

      <Field
        leadingIcon="search-outline"
        placeholder="Buscar cejas, pestañas, laminado…"
        value={search}
        onChangeText={setSearch}
      />

      <Feedback
        loading={catalog.loading && !catalog.data}
        error={catalog.error}
        onRetry={catalog.reload}
      />
      <View className="gap-3.5">
        {shown.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </View>
      {!catalog.loading && !catalog.error && !shown.length && (
        <Empty
          icon="flower-outline"
          title="Sin resultados por ahora"
          message={
            search
              ? 'Prueba con otra búsqueda.'
              : 'Pronto encontrarás nuestros servicios aquí.'
          }
        />
      )}
    </Screen>
  );
}
