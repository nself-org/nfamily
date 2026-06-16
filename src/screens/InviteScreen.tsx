/**
 * Purpose: Member invite screen — validated invite form that sends an invite to a new family member.
 * Inputs:  auth state, email + relationship input
 * Outputs: GraphQL mutation (np_family_invites insert); success/error feedback
 * Constraints: Uses validateMemberInvite schema. Shows inline field errors.
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { validateMemberInvite } from '../lib/validation';
import { toFamilyError } from '../lib/errors';
import { useAuth } from '../hooks/useAuth';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InviteScreen({ onSuccess, onCancel }: Props): React.ReactElement {
  const { authState } = useAuth();
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInvite = async () => {
    setSubmitError(null);
    const result = validateMemberInvite({ email, relationship });
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const e of result.errors ?? []) {
        errs[e.field] = e.message;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // POST to np_family_invites via Hasura
      const resp = await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          query: `
            mutation InviteFamilyMember($email: String!, $relationship: String!) {
              insert_np_family_invites_one(object: {
                email: $email
                relationship: $relationship
                status: "pending"
              }) { id }
            }
          `,
          variables: { email: result.data!.email, relationship: result.data!.relationship },
        }),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json() as { errors?: { message: string }[] };
      if (json.errors?.length) throw new Error(json.errors[0]?.message ?? 'GraphQL error');

      Alert.alert('Invite Sent', `Invitation sent to ${result.data!.email}.`);
      onSuccess?.();
    } catch (e) {
      const fe = toFamilyError(e);
      setSubmitError(fe.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Invite a Family Member</Text>
      <Text style={styles.subtitle}>They'll receive an email to join your family.</Text>

      {submitError && <Text style={styles.error}>{submitError}</Text>}

      {/* Email */}
      <Text style={styles.label}>Email address</Text>
      <TextInput
        style={[styles.input, fieldErrors['email'] ? styles.inputError : null]}
        value={email}
        onChangeText={setEmail}
        placeholder="family@example.com"
        placeholderTextColor={BrandColors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        accessibilityLabel="Email address"
      />
      {fieldErrors['email'] && <Text style={styles.fieldError}>{fieldErrors['email']}</Text>}

      {/* Relationship */}
      <Text style={styles.label}>Relationship</Text>
      <TextInput
        style={[styles.input, fieldErrors['relationship'] ? styles.inputError : null]}
        value={relationship}
        onChangeText={setRelationship}
        placeholder="e.g. Spouse, Child, Parent"
        placeholderTextColor={BrandColors.textSecondary}
        accessibilityLabel="Relationship"
      />
      {fieldErrors['relationship'] && (
        <Text style={styles.fieldError}>{fieldErrors['relationship']}</Text>
      )}

      {/* Actions */}
      <Pressable
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleInvite}
        disabled={isSubmitting}
        accessibilityLabel="Send invite"
        accessibilityRole="button"
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Invite</Text>
        )}
      </Pressable>

      {onCancel && (
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BrandColors.background },
  scroll: { padding: 20, paddingBottom: 48 },
  title: {
    color: BrandColors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: { color: BrandColors.textSecondary, fontSize: 14, marginBottom: 24 },
  label: {
    color: BrandColors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: BrandColors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    color: BrandColors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: { borderColor: BrandColors.error },
  fieldError: { color: BrandColors.error, fontSize: 12, marginTop: 4 },
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
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 10 },
  cancelText: { color: BrandColors.textSecondary, fontSize: 14 },
});
