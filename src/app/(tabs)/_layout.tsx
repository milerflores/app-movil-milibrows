import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Icon } from '@/ui/components';
import { palette } from '@/ui/theme';

function TabIcon({
  active,
  outline,
  focused,
}: {
  active: Parameters<typeof Icon>[0]['name'];
  outline: Parameters<typeof Icon>[0]['name'];
  focused: boolean;
}) {
  return (
    <View
      className={`px-3 py-1 rounded-full items-center justify-center ${focused ? 'bg-sand' : ''}`}
    >
      <Icon
        name={focused ? active : outline}
        size={20}
        color={focused ? palette.caramelDark : palette.stone}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.caramelDark,
        tabBarInactiveTintColor: palette.stone,
        tabBarStyle: {
          backgroundColor: palette.ivory,
          borderTopColor: palette.line,
          borderTopWidth: 1,
          paddingTop: 8,
          height: 66,
        },
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 10, marginBottom: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <TabIcon active="home" outline="home-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="servicios"
        options={{
          title: 'Servicios',
          tabBarIcon: ({ focused }) => (
            <TabIcon active="flower" outline="flower-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="citas"
        options={{
          title: 'Mis citas',
          tabBarIcon: ({ focused }) => (
            <TabIcon active="calendar" outline="calendar-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="club"
        options={{
          title: 'Mi club',
          tabBarIcon: ({ focused }) => (
            <TabIcon active="sparkles" outline="sparkles-outline" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon active="person" outline="person-outline" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
