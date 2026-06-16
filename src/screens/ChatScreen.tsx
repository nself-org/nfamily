/**
 * Purpose: Family group chat screen — send/receive text + photos via nchat plugin.
 * Inputs:  auth state; Hasura subscription on np_chat_messages (family room)
 * Outputs: Live-updating chat thread; send message via mutation
 * Constraints: 7-state screen. Text + photo messages. Room = family-level group chat.
 *   Built on nchat plugin (chat port 3401, shared with nchat app).
 * SPORT: MASTER-ROUTES.md
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { BrandColors } from '../constants/theme';
import { ScreenStateView } from '../components/ScreenStateView';
import { useAuth } from '../hooks/useAuth';
import { useNetworkState } from '../hooks/useNetworkState';
import type { ChatMessage, ScreenState } from '../types';

interface BubbleProps {
  message: ChatMessage;
  isMe: boolean;
}

function Bubble({ message, isMe }: BubbleProps): React.ReactElement {
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

export function ChatScreen(): React.ReactElement {
  const { authState } = useAuth();
  const { isOnline } = useNetworkState();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [screenState, setScreenState] = useState<ScreenState>('loading');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const FAMILY_ROOM = 'family-group';

  const loadMessages = useCallback(async () => {
    if (!authState.token) { setScreenState('unauthorized'); return; }
    if (!isOnline && messages.length === 0) { setScreenState('offline'); return; }

    try {
      const resp = await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          query: `query GetChatMessages($room: String!) {
            np_chat_messages(
              where: { room_id: { _eq: $room } }
              order_by: { created_at: asc }
              limit: 100
            ) {
              id sender_id sender { display_name } content photo_url created_at
            }
          }`,
          variables: { room: FAMILY_ROOM },
        }),
      });

      if (resp.status === 401) { setScreenState('unauthorized'); return; }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json = await resp.json() as {
        data?: {
          np_chat_messages: Array<{
            id: string; sender_id: string;
            sender: { display_name: string };
            content: string; photo_url?: string; created_at: string;
          }>;
        };
      };

      const mapped: ChatMessage[] = (json.data?.np_chat_messages ?? []).map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        senderName: m.sender.display_name,
        content: m.content,
        photoUrl: m.photo_url,
        createdAt: m.created_at,
      }));

      setMessages(mapped);
      setScreenState(mapped.length === 0 ? 'empty' : 'data');
    } catch {
      if (messages.length === 0) setScreenState('error');
    }
  }, [authState, isOnline, messages.length]);

  useEffect(() => {
    void loadMessages();
    const interval = setInterval(() => void loadMessages(), 5000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages.length]);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot send messages while offline.');
      return;
    }

    setIsSending(true);
    const localId = `local-${Date.now()}`;

    // Optimistic update
    const optimistic: ChatMessage = {
      id: localId,
      senderId: authState.email,
      senderName: 'You',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInputText('');

    try {
      await fetch(`${authState.serverUrl}/v1/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          query: `mutation SendMessage($room: String!, $content: String!) {
            insert_np_chat_messages_one(object: {
              room_id: $room content: $content
            }) { id }
          }`,
          variables: { room: FAMILY_ROOM, content: text },
        }),
      });
      // Replace optimistic message with real on next poll
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== localId));
      setInputText(text);
      Alert.alert('Error', 'Could not send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handlePhotoSend = () => {
    Alert.alert('Photos in Chat', 'Photo sharing in chat is coming soon.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Family Chat</Text>
        {!isOnline && <Text style={styles.offlineBadge}>Offline</Text>}
      </View>

      <ScreenStateView
        state={screenState}
        onRetry={loadMessages}
        emptyMessage="No messages yet. Say hi to your family!"
        errorMessage="Could not load chat messages."
      >
        <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {messages.map((m) => (
            <Bubble key={m.id} message={m} isMe={m.senderId === authState.email} />
          ))}
        </ScrollView>
      </ScreenStateView>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <Pressable style={styles.photoBtn} onPress={handlePhotoSend} accessibilityLabel="Attach photo">
          <Text style={styles.photoBtnText}>📷</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message your family…"
          placeholderTextColor={BrandColors.textSecondary}
          multiline
          maxLength={1000}
          accessibilityLabel="Chat message input"
        />
        <Pressable
          style={[styles.sendBtn, (!inputText.trim() || isSending) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isSending}
          accessibilityLabel="Send message"
        >
          {isSending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendBtnText}>↑</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
  headerTitle: { color: BrandColors.textPrimary, fontSize: 18, fontWeight: '700' },
  offlineBadge: {
    backgroundColor: '#78350f',
    color: '#fde68a',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 8 },
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
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    gap: 8,
  },
  photoBtn: { paddingBottom: 8 },
  photoBtnText: { fontSize: 22 },
  input: {
    flex: 1,
    backgroundColor: BrandColors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: BrandColors.textPrimary,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 18 },
});
