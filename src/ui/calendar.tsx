import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { dayKey, dateLabel } from '@/lib/dates';
import { IconButton, T } from './components';

export function Calendar({ value, onChange }: { value: string; onChange: (day: string) => void }) {
  const [month, setMonth] = useState(value.slice(0, 7));
  const [year, number] = month.split('-').map(Number);
  const today = dayKey();
  const first = new Date(Date.UTC(year, number - 1, 1, 12));
  const offset = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate();
  function shift(delta: number) {
    const date = new Date(Date.UTC(year, number - 1 + delta, 1, 12));
    setMonth(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return (
    <View className="bg-white rounded-[22px] border border-line p-4 gap-4">
      <View className="flex-row justify-between items-center">
        {month > today.slice(0, 7) ? (
          <IconButton name="chevron-back" label="Mes anterior" onPress={() => shift(-1)} />
        ) : (
          <View className="w-11" />
        )}
        <T variant="label" style={{ textTransform: 'capitalize', fontSize: 14 }}>
          {new Intl.DateTimeFormat('es-PE', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          }).format(first)}
        </T>
        <IconButton name="chevron-forward" label="Mes siguiente" onPress={() => shift(1)} />
      </View>
      <View className="flex-row">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
          <View key={i} style={{ width: '14.2857%', alignItems: 'center' }}>
            <T variant="small" tone="stone">
              {day}
            </T>
          </View>
        ))}
      </View>
      <View className="flex-row flex-wrap">
        {Array.from({ length: offset + count }, (_, i) => {
          if (i < offset)
            return <View key={`blank${i}`} style={{ width: '14.2857%', height: 44 }} />;
          const n = i - offset + 1;
          const day = `${month}-${String(n).padStart(2, '0')}`;
          const selected = value === day;
          return (
            <Pressable
              key={day}
              accessibilityRole="button"
              accessibilityLabel={dateLabel(day)}
              accessibilityState={{ selected, disabled: day < today }}
              disabled={day < today}
              onPress={() => onChange(day)}
              style={{ width: '14.2857%', height: 44, padding: 2, opacity: day < today ? 0.25 : 1 }}
            >
              <View
                className={`flex-1 rounded-full items-center justify-center ${selected ? 'bg-graphite' : day === today ? 'bg-sand' : ''}`}
              >
                <T variant="label" tone={selected ? 'white' : 'graphite'}>
                  {n}
                </T>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
