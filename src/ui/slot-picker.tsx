import { Pressable, View } from 'react-native';
import { startTimes, timeLabel } from '@/lib/dates';
import type { Availability } from '@/lib/types';
import { Chip, Empty, Icon, SectionTitle, T } from './components';
import { palette } from './theme';

export function chosenEmployee(data: Availability[] | null, id: number | null) {
  return id !== null
    ? data?.find((e) => e.id_empleado === id)
    : data?.find((e) => startTimes(e).length > 0);
}

export function SlotPicker({
  employees,
  employee,
  onEmployee,
  time,
  onTime,
  preferred,
}: {
  employees: Availability[];
  employee?: Availability;
  onEmployee: (id: number) => void;
  time: string;
  onTime: (value: string) => void;
  preferred?: string;
}) {
  const times = startTimes(employee, preferred);
  return (
    <View className="gap-5">
      <SectionTitle title="Tu estilista" />
      <View className="gap-3">
        {employees.map((e) => {
          const count = startTimes(e, preferred).length;
          const selected = employee?.id_empleado === e.id_empleado;
          return (
            <Pressable
              key={e.id_empleado}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onEmployee(e.id_empleado)}
              className={`flex-row items-center gap-3.5 p-4 rounded-2xl border ${selected ? 'bg-goldSoft border-gold' : 'bg-white border-line'}`}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <View
                className={`w-11 h-11 rounded-full items-center justify-center ${selected ? 'bg-black' : 'bg-sand'}`}
              >
                <T variant="label" tone={selected ? 'champagne' : 'caramelDark'}>
                  {e.nombre_completo
                    .split(' ')
                    .slice(0, 2)
                    .map((s) => s[0])
                    .join('')}
                </T>
              </View>
              <View className="flex-1">
                <T variant="label" tone="black" style={{ fontSize: 14 }}>
                  {e.nombre_completo}
                </T>
                <T variant="small" tone={count ? 'sageDark' : 'stone'}>
                  {count
                    ? `${count} ${count === 1 ? 'horario disponible' : 'horarios disponibles'}`
                    : 'Sin horarios en esta fecha'}
                </T>
              </View>
              <Icon
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                color={selected ? palette.caramelDark : palette.line}
              />
            </Pressable>
          );
        })}
      </View>
      {!employees.length && (
        <Empty
          icon="calendar-outline"
          title="Busquemos otro día"
          message="No hay estilistas habilitadas para esta combinación de servicios en esta fecha."
        />
      )}
      {employee && (
        <View className="gap-3">
          <SectionTitle title="Elige tu hora" />
          <View className="flex-row flex-wrap gap-2">
            {times.map((slot) => (
              <Chip
                key={slot}
                title={timeLabel(slot)}
                selected={time === slot}
                onPress={() => onTime(slot)}
              />
            ))}
          </View>
          {!times.length && (
            <T tone="stone">No quedan horas disponibles. Prueba con otra estilista o fecha.</T>
          )}
        </View>
      )}
    </View>
  );
}
