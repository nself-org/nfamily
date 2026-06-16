/**
 * Purpose: Family tree viewer — renders a recursive generational tree with member profiles.
 * Inputs:  family members from Hasura (np_family_members), auth state
 * Outputs: Scrollable tree view; tap member → MemberProfileScreen; add member → InviteScreen
 * Constraints: 7-state screen. Recursive component handles ≥3 generations.
 *   Empty state: 'Start your family tree — add your first member'.
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { ScreenStateView } from '../components/ScreenStateView';
import type { FamilyMember, ScreenState } from '../types';
import { useFamily } from '../hooks/useFamily';
import { useAuth } from '../hooks/useAuth';
import { useNetworkState } from '../hooks/useNetworkState';

// ─── Tree node component ──────────────────────────────────────────────────────

interface TreeNodeProps {
  member: FamilyMember;
  allMembers: FamilyMember[];
  depth: number;
  onSelect: (member: FamilyMember) => void;
}

function TreeNode({ member, allMembers, depth, onSelect }: TreeNodeProps): React.ReactElement {
  const children = allMembers.filter((m) => m.parentIds?.includes(member.id));

  return (
    <View style={[styles.nodeWrapper, { marginLeft: depth * 20 }]}>
      <Pressable
        style={styles.memberCard}
        onPress={() => onSelect(member)}
        accessibilityLabel={`View profile of ${member.displayName}`}
        accessibilityRole="button"
      >
        <View style={styles.memberAvatar}>
          <Text style={styles.avatarText}>
            {member.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.displayName}</Text>
          <Text style={styles.memberRel}>{member.relationship}</Text>
          {member.geniPersonId && (
            <Text style={styles.geniBadge}>Geni ✓</Text>
          )}
        </View>
      </Pressable>

      {children.length > 0 && (
        <View style={styles.childrenContainer}>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              member={child}
              allMembers={allMembers}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Root screen ─────────────────────────────────────────────────────────────

interface Props {
  onSelectMember?: (member: FamilyMember) => void;
  onInvite?: () => void;
}

export function FamilyTreeScreen({ onSelectMember, onInvite }: Props): React.ReactElement {
  const { authState } = useAuth();
  const { members, isLoading, error, refetch } = useFamily(authState.serverUrl, authState.token);
  const { isOnline } = useNetworkState();
  const [refreshing, setRefreshing] = useState(false);

  // Derive roots: members with no parent listed OR whose parents are not in the set
  const memberIds = new Set(members.map((m) => m.id));
  const roots = members.filter(
    (m) => !m.parentIds || m.parentIds.length === 0 || !m.parentIds.some((pid) => memberIds.has(pid))
  );

  const screenState: ScreenState = (() => {
    if (!isOnline && members.length === 0) return 'offline';
    if (!authState.token) return 'unauthorized';
    if (isLoading && members.length === 0) return 'loading';
    if (refreshing) return 'refreshing';
    if (error && members.length === 0) return 'error';
    if (members.length === 0) return 'empty';
    return 'data';
  })();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refetch();
    // Give the fetch time to settle
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Tree</Text>
        {onInvite && (
          <Pressable
            style={styles.inviteBtn}
            onPress={onInvite}
            accessibilityLabel="Add family member"
            accessibilityRole="button"
          >
            <Text style={styles.inviteBtnText}>+ Add Member</Text>
          </Pressable>
        )}
      </View>

      <ScreenStateView
        state={screenState}
        onRetry={refetch}
        emptyMessage="Start your family tree — add your first member."
        errorMessage={error ?? 'Failed to load family tree.'}
      >
        <ScrollView
          style={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={BrandColors.primary}
            />
          }
        >
          {roots.map((root) => (
            <TreeNode
              key={root.id}
              member={root}
              allMembers={members}
              depth={0}
              onSelect={onSelectMember ?? (() => {})}
            />
          ))}
          <View style={styles.bottomPad} />
        </ScrollView>
      </ScreenStateView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerTitle: {
    color: BrandColors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  inviteBtn: {
    backgroundColor: BrandColors.primary,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  inviteBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  scroll: { flex: 1 },
  nodeWrapper: { marginVertical: 4 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  memberInfo: { flex: 1 },
  memberName: { color: BrandColors.textPrimary, fontSize: 15, fontWeight: '600' },
  memberRel: { color: BrandColors.textSecondary, fontSize: 13, marginTop: 2 },
  geniBadge: { color: BrandColors.primary, fontSize: 11, marginTop: 2 },
  childrenContainer: { marginTop: 2 },
  bottomPad: { height: 32 },
});
