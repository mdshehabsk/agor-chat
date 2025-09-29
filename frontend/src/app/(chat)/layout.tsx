"use client";

import UserList from "@/components/UserList";
import useUserState from "@/state/useUserState";
import React, { useEffect } from "react";
import AC from "agora-chat";
import { ReactNode } from "react";
import { useAgoraChatState } from "@/state/useAgoraChatState";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { connection, setConnection, disconnect } =
    useAgoraChatState();
  const initializeAgoraChat = async () => {
    if (!token || !userId || connection) return;

    try {
      const conn = new AC.connection({
        appKey: process.env.NEXT_PUBLIC_AGORA_APP_ID || "",
        delivery: true,
      });

      await conn.open({
        user: userId,
        accessToken: token,
      });
      conn.publishPresence({ description: "online" });
      setConnection(conn);
      return conn;
      // Test presence
    } catch (error) {
      console.error("Failed to initialize Agora Chat:", error);
    }
  };

  const { userId, token } = useUserState();

  useEffect(() => {
    initializeAgoraChat();
    return () => {
      disconnect();
    };
  }, [disconnect]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      connection?.publishPresence({ description: "offline" });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [connection]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - User List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <UserList />
      </div>
      {children}
    </div>
  );
};

export default Layout;
