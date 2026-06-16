/**
 * Purpose: COPPA age gate — displayed during signup if user enters DOB indicating age <13.
 * Inputs:  dateOfBirth (ISO date string); onProceed callback for age-verified users
 * Outputs: Block or allow account creation based on age check
 * Constraints: UI gate only — server MUST also enforce age check via Hasura/plugin.
 *   Children <13 cannot create standalone accounts (COPPA compliance).
 *   Parent creates account, marks child profile. No standalone child accounts.
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { checkCoppa, parseDobInput } from '../lib/coppa';

interface Props {
  /** Called when age check passes (user is 13+). */
  onProceed: (dateOfBirth: string) => void;
}

export function CoppaGateScreen({ onProceed }: Props): React.ReactElement {
  const [dobInput, setDobInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  const handleCheck = () => {
    setError(null);
    setBlocked(false);

    const parsed = parseDobInput(dobInput.trim());
    if (!parsed) {
      setError('Please enter a valid date (MM/DD/YYYY or YYYY-MM-DD).');
      return;
    }

    const { blocked: isBlocked } = checkCoppa(parsed);

    if (isBlocked) {
      setBlocked(true);
      return;
    }

    onProceed(parsed);
  };

  if (blocked) {
    return (
      <View style={styles.blockedContainer}>
        <Text style={styles.blockedIcon}>🛡️</Text>
        <Text style={styles.blockedTitle}>Ask a Parent to Create Your Account</Text>
        <Text style={styles.blockedBody}>
          Children under 13 need a parent or guardian to set up their nFamily account.{'\n\n'}
          A parent can create a family account and then add you as a child member — you'll
          use their account to participate in family activities.
        </Text>
        <Pressable
          style={styles.backBtn}
          onPress={() => { setBlocked(false); setDobInput(''); }}
          accessibilityLabel="Go back to date of birth entry"
          accessibilityRole="button"
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>What's your date of birth?</Text>
      <Text style={styles.subtitle}>
        We need this to keep younger family members safe.
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>Date of birth</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={dobInput}
        onChangeText={setDobInput}
        placeholder="MM/DD/YYYY"
        placeholderTextColor={BrandColors.textSecondary}
        keyboardType="numeric"
        accessibilityLabel="Date of birth"
        maxLength={10}
      />

      <Text style={styles.hint}>Format: MM/DD/YYYY or YYYY-MM-DD</Text>

      <Pressable
        style={styles.button}
        onPress={handleCheck}
        accessibilityLabel="Continue with date of birth"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>

      <Text style={styles.legalNote}>
        By continuing you confirm that you are 13 or older, or that a parent/guardian
        is completing this step on your behalf.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
  scroll: { padding: 24, paddingBottom: 48 },
  title: {
    color: BrandColors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: { color: BrandColors.textSecondary, fontSize: 15, marginBottom: 28, lineHeight: 22 },
  label: { color: BrandColors.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    color: BrandColors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 4,
  },
  inputError: { borderColor: BrandColors.error },
  hint: { color: BrandColors.textSecondary, fontSize: 12, marginBottom: 24 },
  error: {
    backgroundColor: '#450a0a',
    borderRadius: 8,
    padding: 12,
    color: BrandColors.error,
    marginBottom: 16,
    fontSize: 13,
  },
  button: {
    backgroundColor: BrandColors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  legalNote: {
    color: BrandColors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Blocked state
  blockedContainer: {
    flex: 1,
    backgroundColor: BrandColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  blockedIcon: { fontSize: 56, marginBottom: 16 },
  blockedTitle: {
    color: BrandColors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  blockedBody: {
    color: BrandColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  backBtn: {
    backgroundColor: BrandColors.surface,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  backBtnText: { color: BrandColors.textPrimary, fontWeight: '600', fontSize: 15 },
});
