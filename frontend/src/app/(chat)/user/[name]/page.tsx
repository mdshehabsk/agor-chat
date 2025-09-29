"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";
import useUserState from "@/state/useUserState";
import { useAgoraChatState } from "@/state/useAgoraChatState";
import { useParams } from "next/navigation";
import agoraChat, { AgoraChat } from "agora-chat";
import Avatar from "@/components/Avatar";
import { useAgoraConversations } from "@/state/useAgoraConversation";

const Page = () => {
  const { conversations, setConversations } = useAgoraConversations();
  const { name } = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [inputFile, setInputFile] = useState<File | null>(null);

  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<AgoraChat.MessagesType[]>([]);
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { userId } = useUserState();
  const { connection } = useAgoraChatState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check if message is from current user
  const isOwnMessage = (message: AgoraChat.MessagesType) =>
    message.from === userId;

  // Send typing indicator
  const sendTypingIndicator = () => {
    if (connection && name) {
      const typingMsg = agoraChat.message.create({
        from: userId,
        to: name.toString(),
        type: "cmd",
        chatType: "singleChat",
        action: "typing",
      });
      connection.send(typingMsg);
    }
  };

  // Send stop typing indicator
  const sendStopTypingIndicator = () => {
    if (connection && name) {
      const stopTypingMsg = agoraChat.message.create({
        from: userId,
        to: name.toString(),
        type: "cmd",
        chatType: "singleChat",
        action: "stopTyping",
      });
      connection.send(stopTypingMsg);
    }
  };

  const handleSendMessage = async (event: ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Send stop typing indicator before sending message
    sendStopTypingIndicator();

    if (newMessage) {
      // Send text message
      const msg = agoraChat.message.create({
        from: userId,
        to: name?.toString() ?? "",
        type: "txt",
        chatType: "singleChat",
        msg: newMessage,
      });
      const send = await connection?.send(msg);
      const message = send?.message;
      if (message) {
        setNewMessage("");
        const newConversations = conversations?.map((item) => {
          if (item?.conversationId == msg?.to) {
            return {
              ...item,
              lastMessage: msg,
            };
          }
          return item;
        });
        setConversations(newConversations);
        setMessages((prev) => [msg, ...prev]);
      }
    } else if (inputFile) {
      // Send image message
      const msg = agoraChat.message.create({
        from: userId,
        to: name?.toString() ?? "",
        type: "img",
        chatType: "singleChat",
        file: {
          url: inputFile?.webkitRelativePath,
          filename: inputFile?.name,
          filetype: inputFile?.type,
          data: inputFile,
        },
      });
      const send = await connection?.send(msg);
      const message = send?.message;
      if (message) {
        setInputFile(null);

        const newConversations = conversations?.map((item) => {
          if (item?.conversationId == msg?.to) {
            return {
              ...item,
              lastMessage: msg,
            };
          }
          return item;
        });
        setConversations(newConversations);
        setMessages((prev) => [msg, ...prev]);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value && inputFile) {
      setInputFile(null);
    }

    // Send typing indicator
    if (e.target.value) {
      sendTypingIndicator();

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputFile(file);
      setNewMessage("");
    }
  };

  const handleCancelImage = () => {
    setInputFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && !newMessage) {
      fileInputRef.current.click();
    }
  };

  const getMessage = async (loadMore = false) => {
    try {
      if (loadMore && isLoadingMore) return;

      if (loadMore) setIsLoadingMore(true);

      const res = await connection?.getHistoryMessages({
        chatType: "singleChat",
        targetId: name?.toString() ?? "",
        cursor: loadMore ? cursor : "",
        pageSize: 20,
        searchOptions: {
          msgTypes: ["txt", "img"],
        },
      });

      if (res?.messages) {
        if (loadMore) {
          setMessages((prev) => [...prev, ...res.messages]);
        } else {
          setMessages(res.messages);
        }
        setCursor(res.cursor || "");
        setHasMore(res.messages.length === 20);
      }

      if (loadMore) setIsLoadingMore(false);
    } catch (error) {
      console.log(error);
      if (loadMore) setIsLoadingMore(false);
    }
  };

  // Handle scroll to load more messages
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // When scrolled to bottom (in reverse flex direction, this means scrollTop is near 0)
      if (Math.abs(scrollTop) >= scrollHeight - clientHeight - 100) {
        if (hasMore && !isLoadingMore) {
          getMessage(true);
        }
      }
    }
  };

  useEffect(() => {
    getMessage();
  }, [connection]);

  useEffect(() => {
    connection?.addEventHandler("msgHandler", {
      onTextMessage: (msg) => {
        setMessages((prev) => [msg, ...prev]);
        const readMessageAck = agoraChat?.message?.create({
          from: userId,
          to: msg?.from!,
          type: "read",
          chatType: "singleChat",
          ackContent: "",
          id: msg?.id,
        });
        connection.send(readMessageAck);
      },
      onImageMessage(msg) {
        setMessages((prev) => [msg, ...prev]);
      },
      onDeliveredMessage(msg) {
        console.log(`message delivered successfully`, msg);
      },
      onReadMessage(msg) {
        console.log(`message read by receiver`, msg);
      },
      onCmdMessage(msg) {
        // Handle typing indicator
        if (msg.from === name?.toString()) {
          if (msg.action === "typing") {
            setIsTyping(true);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }

            // Hide typing indicator after 3 seconds
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
            }, 3000);
          } else if (msg.action === "stopTyping") {
            // Immediately hide typing indicator when user sends message
            setIsTyping(false);

            // Clear timeout
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
          }
        }
      },
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [connection, name]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, [hasMore, isLoadingMore, cursor]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar
              name={name?.toString() || ""}
              className="w-12 h-12 rounded-full"
            />
            {/* {true && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )} */}
          </div>
          <div>
            <p className="text-sm text-gray-500">
              {name}
            </p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 flex flex-col-reverse overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg rounded-bl-sm px-4 py-2 shadow-sm max-w-xs">
              <div className="flex space-x-1 items-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">typing...</span>
              </div>
            </div>
          </div>
        )}
        {messages?.map((message) => {
          const isOwn = isOwnMessage(message);
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md ${
                  isOwn ? "order-2" : "order-1"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg shadow-sm ${
                    isOwn && message?.type == "txt"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"
                  }`}
                >
                  {message.type === "txt" && (
                    <p className="text-sm leading-relaxed">{message.msg}</p>
                  )}
                  {message.type === "img" && (
                    <img src={message.url} alt="Uploaded" className="" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="text-sm text-gray-500">
              Loading more messages...
            </div>
          </div>
        )}
      </div>

      {/* Image Preview */}
      {inputFile && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="relative mx-auto">
            <img
              src={URL.createObjectURL(inputFile)}
              alt="Selected"
              className="w-[100px] h-[100px] shadow-sm"
            />
            <button
              type="button"
              onClick={handleCancelImage}
              className="absolute top-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <div className="flex-1 relative">
            <input
              value={newMessage}
              onChange={handleInputChange}
              placeholder={`Type a message to `}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={!!inputFile}
            />
          </div>

          <button
            type="button"
            onClick={triggerFileInput}
            className={`p-2 rounded-lg transition-colors ${
              newMessage
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-500 hover:text-blue-600"
            }`}
            disabled={!!newMessage}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="submit"
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            disabled={!newMessage && !inputFile}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
