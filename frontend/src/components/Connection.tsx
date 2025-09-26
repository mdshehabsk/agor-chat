"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Send, Search, MoreVertical, Phone, Video, Smile } from "lucide-react";
import useUserState from "@/state/useUserState";
import AC, { AgoraChat } from "agora-chat";
import Axios from "@/api/Axios";
import { useAgoraChatState } from "@/state/useAgoraChatState";
import { useGetUsers } from "@/api/user/userApi";
import UserList from "./UserList";


export default function ChatUI() {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - User List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
   
       <UserList/>
      </div>

      {/* Right Side - Conversation */}
      <div className="flex-1 flex flex-col">

          /* No User Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to Chat
              </h3>
              <p className="text-gray-500">
                Select a user from the list to start messaging
              </p>
            </div>
          </div>
   
      </div>
    </div>
  );
}
