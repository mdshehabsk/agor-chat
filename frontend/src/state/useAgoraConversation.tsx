

import { create } from 'zustand';
import { AgoraChat } from 'agora-chat';

interface ConversationsState {
  conversations :  AgoraChat.ConversationItem[]
  setConversations : (arg :  AgoraChat.ConversationItem[]) => void
}

export const useAgoraConversations = create<ConversationsState>((set) => ({
  conversations : [],

  setConversations : (conv) => {
    set({conversations : conv})
  }
}));
