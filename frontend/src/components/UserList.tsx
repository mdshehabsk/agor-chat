"use client";

import { useAgoraChatState } from "@/state/useAgoraChatState";
import useUserState from "@/state/useUserState";
import { ExternalLink, X, Send, MessageCircle, Pin } from "lucide-react";
import toast from "react-hot-toast";
import agoraChat, { AgoraChat } from "agora-chat";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import { useAgoraConversations } from "@/state/useAgoraConversation";
import { useParams } from "next/navigation";

// Helper function to format timestamp
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// the whole array type:

const UserList = () => {
  const [isPopup, setIsPopUp] = useState(false);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const { connection } = useAgoraChatState();
  const userId = useUserState((state) => state?.userId);
  const { conversations, setConversations } = useAgoraConversations();

  const { name } = useParams();

  const sortedConversations =
    conversations?.sort((a, b) => {
      // Then sort by last message time
      const bTime =
        b?.lastMessage?.type == "txt" || b?.lastMessage?.type == "img"
          ? b?.lastMessage?.time
          : 0;
      const aTime =
        a?.lastMessage?.type == "txt" || a?.lastMessage?.type == "img"
          ? a?.lastMessage?.time
          : 0;
      return bTime - aTime;
    }) || [];
  const handleSubmit = async () => {
    // Basic validation
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }
    const res = agoraChat?.message?.create({
      to: username,
      from: userId,
      type: "txt",
      chatType: "singleChat",
      msg: "hello world",
    });
    connection?.send(res).then((res) => console.log(res));
    toast.success("Message sent successfully!");

    // Reset form and close popup
    setUsername("");
    setMessage("");
    setIsPopUp(false);
    getServerConversations()
  };
  const truncateMessage = (msg: string, maxLength: number = 50) => {
    return msg.length > maxLength ? msg.substring(0, maxLength) + "..." : msg;
  };

  const getDisplayName = (conversation: AgoraChat.ConversationItem) => {
    const { lastMessage } = conversation;
    // If the message is from the current user, show recipient's name, otherwise show sender's name
    return lastMessage?.from === userId ? lastMessage.to : lastMessage?.from;
  };

  const closePopup = () => {
    setIsPopUp(false);
    setUsername("");
    setMessage("");
  };
  async function getServerConversations() {
    try {
      const res = await connection?.getServerConversations({ cursor: "" });
      const conversationItems = res?.data?.conversations;
      if (conversationItems) {
        setConversations(conversationItems);
      }
    } catch  {}
  }
  useEffect(() => {
    connection?.addEventHandler("globalMsgHandler", {
      onTextMessage: (msg) => {
        const from = msg?.from;

        const newConversations = conversations?.map((item) => {
          if (item?.conversationId == from) {
            return {
              ...item,
              lastMessage: msg,
            };
          }
          return item;
        });
        setConversations(newConversations);
      },
      onDeliveredMessage(msg) {
        console.log(`message delivered successfully`, msg);
      },
      onReadMessage(msg) {
        console.log(`message read by receiver`, msg);
      },
    });

    return () => {};
  }, [connection, conversations]);
  useEffect(() => {
    getServerConversations();
  }, [connection]);


  return (
    <div className="h-screen bg-white flex flex-col  mx-auto w-full border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Messages</h1>
        <div className="flex justify-between items-center">
          <p className=" capitalize text-gray-600">{userId}</p>
          <button
            onClick={() => setIsPopUp(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ExternalLink className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations === null ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Loading conversations...</p>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a new conversation</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedConversations?.map((conversation) => (
              <Link
                href={`/user/${conversation?.conversationId}`}
                key={conversation.conversationId}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors block relative ${
                  name === conversation.conversationId
                    ? "bg-blue-50 border-r-2 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-2">
                    <Avatar
                      name={conversation?.conversationId}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {getDisplayName(conversation)}
                        </h3>
                        {conversation.isPinned && (
                          <Pin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation?.lastMessage?.from === userId && (
                          <span className="text-gray-500">You: </span>
                        )}
                        {truncateMessage(
                          conversation?.lastMessage?.type == "txt"
                            ? conversation?.lastMessage?.msg
                            : ""
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-3">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTime(
                        conversation?.lastMessage?.type == "txt"
                          ? conversation?.lastMessage?.time
                          : 0
                      )}
                    </span>
                    {conversation.unReadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                        {conversation.unReadCount > 99
                          ? "99+"
                          : conversation.unReadCount}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Popup Modal */}
      {isPopup && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Send Message
              </h2>
              <button
                onClick={closePopup}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter recipient username"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Type your message here..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closePopup}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
