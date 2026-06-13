/**
 * Purpose: Tab navigator — Family, Notifications, Profile tabs.
 * Inputs:  none
 * Outputs: Expo Router Tabs with sky-500 active tint
 * Constraints: Three tabs matching original Flutter scaffold intent.
 * SPORT: MASTER-ROUTES.md
 */

import { Tabs } from 'expo-router';
import { BrandColors } from '../../constants/theme';

export default function TabLayout(): React.ReactElement {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BrandColors.primary,
        tabBarInactiveTintColor: BrandColors.textSecondary,
        tabBarStyle: { backgroundColor: BrandColors.surface, borderTopColor: '#1F2937' },
        headerStyle: { backgroundColor: BrandColors.background },
        headerTintColor: BrandColors.textPrimary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Family', tabBarLabel: 'Family' }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ title: 'Notifications', tabBarLabel: 'Alerts' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />
    </Tabs>
  );
}
