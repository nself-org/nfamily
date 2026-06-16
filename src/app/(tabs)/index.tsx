/**
 * Purpose: Family tab — family tree, member profiles, invite flow, Geni import.
 * Inputs:  auth state from useAuth
 * Outputs: FamilyTreeScreen with sub-navigation to Invite and Geni import
 * Constraints: 7-state screen delegated to FamilyTreeScreen.
 *   Plugins covered: family, family-geni.
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BrandColors } from '../../constants/theme';
import { FamilyTreeScreen } from '../../screens/FamilyTreeScreen';
import { InviteScreen } from '../../screens/InviteScreen';
import { GeniImportScreen } from '../../screens/GeniImportScreen';
import type { FamilyMember } from '../../types';

type FamilySubView = 'tree' | 'invite' | 'geni_import';

export default function FamilyScreen(): React.ReactElement {
  const [subView, setSubView] = useState<FamilySubView>('tree');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  return (
    <View style={styles.container}>
      {subView === 'tree' && (
        <FamilyTreeScreen
          onSelectMember={(m) => {
            setSelectedMember(m);
            // Future: navigate to MemberProfileScreen
          }}
          onInvite={() => setSubView('invite')}
        />
      )}

      {subView === 'invite' && (
        <InviteScreen
          onSuccess={() => setSubView('tree')}
          onCancel={() => setSubView('tree')}
        />
      )}

      {subView === 'geni_import' && (
        <GeniImportScreen
          onDone={() => setSubView('tree')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
});
