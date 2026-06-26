/**
 * Purpose: Chat message bubble for nFamily group chat screen.
 *          Extracted from ChatScreen.tsx to keep that file under 300 lines.
 *
 * Inputs:
 *   message — ChatMessage to render.
 *   isMe    — true when the message was sent by the current user.
 *
 * Outputs: Right-aligned (me) or left-aligned (them) message bubble with
 *          sender name, optional photo placeholder, content, and timestamp.
 *
 * Constraints:
 *   - Purely presentational — no state, no side effects.
 *   - Text ≥14sp and ≥4.5:1 contrast (WCAG 2.1 AA).
 *
 * SPORT: MASTER-ROUTES.md
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BrandColors } from '../constants/theme';
import type { ChatMessage } from '../types';

export interface BubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

export function Bubble({ message, isMe }: BubbleProps): React.ReactElement {
  return (
    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
      {!isMe && (
        <Text style={styles.bubbleSender}>{message.senderName}</Text>
      )}
      {message.photoUrl && (
        <Text style={styles.photoPlaceholder}>📷 Photo</Text>
      )}
      <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
        {message.content}
      </Text>
      <Text style={styles.bubbleTime}>
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    padding: 10,
    marginBottom: 8,
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: BrandColors.surface,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: BrandColors.primary,
  },
  bubbleSender: { color: BrandColors.primary, fontSize: 11, fontWeight: '600', marginBottom: 2 },
  bubbleText: { color: BrandColors.textPrimary, fontSize: 14, lineHeight: 19 },
  bubbleTextMe: { color: '#fff' },
  photoPlaceholder: { color: BrandColors.textSecondary, fontSize: 12, marginBottom: 4 },
  bubbleTime: { color: BrandColors.textSecondary, fontSize: 10, marginTop: 4, textAlign: 'right' },
});
