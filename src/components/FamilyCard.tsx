/**
 * Purpose: Displays a single family member's name, relationship, and avatar.
 * Inputs:  member (FamilyMember) — the member to render
 * Outputs: React Native View with member info
 * Constraints: avatarUrl optional; falls back to initials. Single responsibility.
 * SPORT: MASTER-COMPONENTS.md
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BrandColors } from '../constants/theme';
import type { FamilyMember } from '../types';

interface FamilyCardProps {
  member: FamilyMember;
}

export function FamilyCard({ member }: FamilyCardProps): React.ReactElement {
  const initials = member.displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.card} accessibilityLabel={`Family member: ${member.displayName}`}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{member.displayName}</Text>
        <Text style={styles.relationship}>{member.relationship}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: BrandColors.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    color: BrandColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  relationship: {
    color: BrandColors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});
