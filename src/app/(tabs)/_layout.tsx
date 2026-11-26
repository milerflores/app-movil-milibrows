import { Tabs } from 'expo-router';
import { Icon } from '@/ui/components';

const BAR_BG = '#1D1B18';
const BAR_ACTIVE = '#F3E5B5';
const BAR_INACTIVE = 'rgba(250,248,245,0.52)';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BAR_ACTIVE,
        tabBarInactiveTintColor: BAR_INACTIVE,
        tabBarStyle: {
          backgroundColor: BAR_BG,
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          height: 68,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 10,
          letterSpacing: 0.2,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={focused ? BAR_ACTIVE : BAR_INACTIVE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="servicios"
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? 'grid' : 'grid-outline'}
              size={22}
              color={focused ? BAR_ACTIVE : BAR_INACTIVE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="citas"
        options={{
          title: 'Mis citas',
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? 'calendar' : 'calendar-outline'}
              size={22}
              color={focused ? BAR_ACTIVE : BAR_INACTIVE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="club"
        options={{
          title: 'Club',
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? 'diamond' : 'diamond-outline'}
              size={22}
              color={focused ? BAR_ACTIVE : BAR_INACTIVE}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <Icon
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={focused ? BAR_ACTIVE : BAR_INACTIVE}
            />
          ),
        }}
      />
    </Tabs>
  );
}
