import { create } from 'zustand';
import { AgoraChat } from 'agora-chat';

interface AgoraChatState {
  connection: AgoraChat.Connection | null;
  isConnected: boolean;
  presenceMap: Record<string, boolean>;
  setConnection: (conn: AgoraChat.Connection) => void;
  disconnect: () => void;
  updatePresence: (username: string, isOnline: boolean) => void;
}

export const useAgoraChatState = create<AgoraChatState>((set, get) => ({
  connection: null,
  isConnected: false,
  presenceMap: {},

  setConnection: (conn: AgoraChat.Connection) => {
    set({ connection: conn, isConnected: true });
  },

  disconnect: () => {
    const { connection } = get();
    if (connection) {
      connection.publishPresence({ description: "offline" });
      connection.close();
    }
    set({ connection: null, isConnected: false, presenceMap: {} });
  },

  updatePresence: (username: string, isOnline: boolean) => {
    set((state) => ({
      presenceMap: { ...state.presenceMap, [username]: isOnline },
    }));
  },
}));
