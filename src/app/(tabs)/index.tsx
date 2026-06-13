/**
 * Purpose: Family tab — lists all family members using FamilyCard.
 * Inputs:  auth state from useAuth, family members from useFamily
 * Outputs: Scrollable list of FamilyCard components with pull-to-refresh
 * Constraints: Empty state shown when no members. Refresh calls useFamily.refetch.
 * SPORT: MASTER-ROUTES.md
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';
import { FamilyCard } from '../../components/FamilyCard';
import { BrandColors } from '../../constants/theme';

export default function FamilyScreen(): React.ReactElement {
  const { authState } = useAuth();
  const { members, isLoading, error, refetch } = useFamily(
    authState.serverUrl,
    authState.token
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={BrandColors.primary}
          />
        }
      >
        {isLoading && members.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={BrandColors.primary}
            style={styles.loader}
          />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : members.length === 0 ? (
          <Text style={styles.empty}>No family members yet. Invite someone!</Text>
        ) : (
          members.map((m) => <FamilyCard key={m.id} member={m} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
  scroll: { padding: 16 },
  loader: { marginTop: 48 },
  error: { color: BrandColors.error, textAlign: 'center', marginTop: 32 },
  empty: { color: BrandColors.textSecondary, textAlign: 'center', marginTop: 48 },
});
