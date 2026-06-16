/**
 * Purpose: Tab navigator — all 9 bundle plugin surfaces organized into 5 primary tabs.
 * Inputs:  none
 * Outputs: Expo Router Tabs with sky-500 active tint; 5 top-level tabs
 * Constraints: Tab names match the 9 bundle plugins: family+geni (Family tab),
 *   social+activity-feed (Feed tab), photos (Photos tab), chat (Chat tab),
 *   moderation+settings (Profile tab — admin + medical consent).
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
      {/* Family tab: tree + invite + Geni import (plugins: family, family-geni) */}
      <Tabs.Screen
        name="index"
        options={{ title: 'Family', tabBarLabel: 'Family' }}
      />
      {/* Feed tab: social posts + activity feed (plugins: social, activity-feed, realtime) */}
      <Tabs.Screen
        name="feed"
        options={{ title: 'Feed', tabBarLabel: 'Feed' }}
      />
      {/* Photos tab: albums + upload + viewer (plugin: photos) */}
      <Tabs.Screen
        name="photos"
        options={{ title: 'Photos', tabBarLabel: 'Photos' }}
      />
      {/* Chat tab: family group chat (plugin: chat) */}
      <Tabs.Screen
        name="chat"
        options={{ title: 'Chat', tabBarLabel: 'Chat' }}
      />
      {/* Profile tab: settings + moderation + medical consent (plugins: moderation, cms) */}
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarLabel: 'Profile' }}
      />
      {/* Hidden from tab bar — legacy notifications screen */}
      <Tabs.Screen
        name="notifications"
        options={{ href: null }}
      />
    </Tabs>
  );
}
