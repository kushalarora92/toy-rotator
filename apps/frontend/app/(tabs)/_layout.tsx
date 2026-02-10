import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, usePathname } from 'expo-router';
import { Platform } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAnalytics } from '@/hooks/useAnalytics';
import WebNavigationBar from '@/components/WebNavigationBar';
import { useIsDesktop } from '@/utils/responsive';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const { trackEvent } = useAnalytics();

  // Track screen width for responsive layout (768px breakpoint for tablet/desktop)
  const isDesktop = useIsDesktop('md');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        headerTitleAlign: 'center',
        // Hide tab bar on desktop web (navigation is in header instead)
        // Show tab bar on mobile web and native
        tabBarStyle: (Platform.OS === 'web' && isDesktop)
          ? { display: 'none' }
          : {
              shadowColor: Colors[colorScheme ?? 'light'].text,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 8,
              borderTopWidth: 0,
            },
        // Custom header title component for desktop web (shows navigation)
        // On mobile web and native, use default title
        headerTitle: (Platform.OS === 'web' && isDesktop) ? () => <WebNavigationBar /> : undefined,
        // Add subtle shadow/elevation to header
        headerStyle: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
