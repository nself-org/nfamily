/**
 * Purpose: Feed tab — social feed + activity feed switcher.
 * Inputs:  auth state
 * Outputs: Toggle between SocialFeedScreen and ActivityFeedScreen
 * Constraints: Uses 7-state screens from screens/ directory.
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BrandColors } from '../../constants/theme';
import { SocialFeedScreen } from '../../screens/SocialFeedScreen';
import { ActivityFeedScreen } from '../../screens/ActivityFeedScreen';

type FeedTab = 'social' | 'activity';

export default function FeedTabScreen(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<FeedTab>('social');

  return (
    <View style={styles.container}>
      {/* Sub-tab toggle */}
      <View style={styles.subTabBar}>
        <Pressable
          style={[styles.subTab, activeTab === 'social' && styles.subTabActive]}
          onPress={() => setActiveTab('social')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'social' }}
        >
          <Text style={[styles.subTabText, activeTab === 'social' && styles.subTabTextActive]}>
            Posts
          </Text>
        </Pressable>
        <Pressable
          style={[styles.subTab, activeTab === 'activity' && styles.subTabActive]}
          onPress={() => setActiveTab('activity')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'activity' }}
        >
          <Text style={[styles.subTabText, activeTab === 'activity' && styles.subTabTextActive]}>
            Activity
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'social' ? <SocialFeedScreen /> : <ActivityFeedScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: BrandColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  subTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabActive: { borderBottomColor: BrandColors.primary },
  subTabText: { color: BrandColors.textSecondary, fontSize: 14, fontWeight: '500' },
  subTabTextActive: { color: BrandColors.primary, fontWeight: '700' },
  content: { flex: 1 },
});
