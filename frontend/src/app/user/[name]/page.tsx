"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Send, Search, MoreVertical, Phone, Video, Smile } from "lucide-react";
import useUserState from "@/state/useUserState";
import AC, { AgoraChat } from "agora-chat";
import { useAgoraChatState } from "@/state/useAgoraChatState";
import { useGetUser, useGetUsers } from "@/api/user/userApi";
import { useParams } from "next/navigation";
import { useCreateMessage, useGetMessages } from "@/api/message/messageApi";
import { v4 as uuidv4 } from "uuid";
import { IMessage } from "@/api/message/message.types";
const getUserAvatar = (username: string) => {
  return username.slice(0, 2).toUpperCase();
};

// Helper function to format timestamp
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const page = () => {
  const { name } = useParams();

  const [newMessage, setNewMessage] = useState("");
  const [inputFile, setInputFile] = useState<File>();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const { token, userId } = useUserState();
  const { connection, setConnection, disconnect, isConnected } =
    useAgoraChatState();

  const { data } = useGetUser(name as string);
  const { data: messages } = useGetMessages(name as string);
  const { mutate } = useCreateMessage();
  // Mock conversation data - in real app, this would come from Agora Chat
  const [conversations, setConversations] = useState<
    Record<
      string,
      Array<{
        id: number;
        sender: string;
        message: string;
        time: string;
        isOwn: boolean;
      }>
    >
  >({
    rakib: [
      {
        id: 12,
        sender: "shehab",
        message: "hello kemon acho",
        time: Date.now().toString(),
        isOwn: true,
      },
    ],
  });

  const handleSendMessage = async () => {
    // if (newMessage.trim() && selectedUser !== null) {
    //   const selectedUserData = users[selectedUser];
    //   if (selectedUserData) {
    //     const localMessage = {
    //       id: 13,
    //       sender: userId,
    //       message: newMessage,
    //       time: Date.now().toString(),
    //       isOwn: true,
    //     };

    //     let msg = AC.message.create({
    //       chatType: "singleChat",
    //       type: "img",
    //       to: selectedUserData?.username,
    //       from: userId,
    //       file: {},
    //     });
    //     try {
    //       const res = await connection?.send(msg);
    //       console.log(res);
    //       if (res) {
    //         // ✅ update conversations
    //         setConversations((prev) => ({
    //           ...prev,
    //           [selectedUserData.username]: [
    //             ...(prev[selectedUserData.username] || []),
    //             localMessage,
    //           ],
    //         }));
    //       }
    //       setNewMessage("");
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   }
    // }

    mutate({
      message: newMessage,
      messageType: "text",
      receiverName: data?.username || "",
      senderName:  userId ,
      uuid: uuidv4(),
    }, {
      onSuccess : () => {
        setNewMessage("")
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Initialize Agora Chat connection
  const initializeAgoraChat = async () => {
    if (!token || !userId || connection) return;

    try {
      const conn = new AC.connection({
        appKey: process.env.NEXT_PUBLIC_AGORA_APP_ID || "",
      });

      await conn.open({
        user: userId,
        accessToken: token,
      });

      let val = await conn.subscribePresence({
        usernames: ["shehab", "miraz", "riaz"],
        expiry: 86400,
      });

      console.log(val);
      // Store the connection in Zustand store
      setConnection(conn);

      // Set up event handlers
      conn.addEventHandler("messageHandler", {
        onTextMessage: (message) => {
          const selectedUserData =
            conversations?.rakib?.[selectedUser as number];

          const localMessage = {
            id: Date.now(),
            sender: message?.from ?? "",
            message: message?.msg,
            time: Date.now().toString(),
            isOwn: false,
          };
          setConversations((prev) => ({
            ...prev,
            [selectedUserData?.username]: [
              ...(prev[selectedUserData?.username] || []),
              localMessage,
            ],
          }));
        },
        onImageMessage: (message) => {
          console.log(message);
        },
        onConnected: () => {
          console.log("Connected to Agora Chat");
        },
        onDisconnected: () => {
          console.log("Disconnected from Agora Chat");
        },
      });

      // Test presence
    } catch (error) {
      console.error("Failed to initialize Agora Chat:", error);
    }
  };

  // Clean up on component unmount
  // useEffect(() => {
  //   return () => {
  //     disconnect(); // Only call if you want to disconnect when component unmounts
  //   };
  // }, []);

  // useEffect(() => {
  //   initializeAgoraChat();
  // }, [token, userId, selectedUser]);

  useEffect(() => {
    connection?.addEventHandler("messageHandler", {
      onTextMessage: (message) => {
        const selectedUserData = conversations?.rakib?.[selectedUser as number];
        if (selectedUserData) {
          const localMessage = {
            id: Date.now(),
            sender: message?.from ?? "",
            message: message?.msg,
            time: Date.now().toString(),
            isOwn: false,
          };
          setConversations((prev) => ({
            ...prev,
            [selectedUserData?.username]: [
              ...(prev[selectedUserData?.username] || []),
              localMessage,
            ],
          }));
        }

        // Handle incoming messages here
        // You might want to update your messages state
      },
      onConnected: () => {
        console.log("Connected to Agora Chat");
      },
      onDisconnected: () => {
        console.log("Disconnected from Agora Chat");
      },
    });
  }, [connection, selectedUser]);
  // Helper function to get user avatar initials
    const scrollRef = useRef<HTMLDivElement>(null);
     useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  return (
    <div className="flex-1 flex flex-col">
      <>
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                {getUserAvatar(data?.username || "")}
              </div>
              {true && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h2 className="font-medium text-gray-900">{data?.username}</h2>
              <p className="text-sm text-gray-500">
                {true ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>
        {/* Messages */}

        <div    ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages?.map((message: IMessage) => {
            const isOwn =
              (message.senderName === userId && message.receiverName === data?.username) 
        

            return (
              <div
                key={message.uuid}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {message.messageType === "text" ? (
                    <p className="text-sm">{message.message}</p>
                  ) : message.messageType === "image" ? (
                    <img
                      src={message.message}
                      alt="sent image"
                      className="max-w-full rounded-lg"
                    />
                  ) : null}
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Smile className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type a message to ${conversations?.rakib?.[selectedUser]?.username}...`}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
              />
            </div>

            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setInputFile(file);
              }}
            />

            <button
              onClick={handleSendMessage}
              className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </>
    </div>
  );
};

export default page;
