import { create } from 'zustand';
import { AgoraChat } from 'agora-chat';

interface AgoraChatState {
  connection: AgoraChat.Connection | null;
  setConnection: (conn: AgoraChat.Connection) => void;
  disconnect: () => void;
  isConnected: boolean;
}

export const useAgoraChatState = create<AgoraChatState>((set, get) => ({
  connection: null,
  isConnected: false,
  
  setConnection: (conn: AgoraChat.Connection) => {
    set({ connection: conn, isConnected: true });
  },
  
  disconnect: () => {
    const { connection } = get();
    if (connection) {
      connection.close();
    }
    set({ connection: null, isConnected: false });
  },
}));