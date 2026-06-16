/**
 * Purpose: Chat tab — family group chat via nchat plugin.
 * Inputs:  auth state
 * Outputs: ChatScreen with live-updating message thread
 * Constraints: Uses 7-state screen. Text + photo messages. Built on np_chat_messages.
 * SPORT: MASTER-ROUTES.md
 */

import React from 'react';
import { ChatScreen } from '../../screens/ChatScreen';

export default function ChatTabScreen(): React.ReactElement {
  return <ChatScreen />;
}
