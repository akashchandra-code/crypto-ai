import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { useRef } from "react";
import * as api from "../service/chat.api";
import {
  setChats,
  setCurrentChatId,
  setLoading,
  createNewChat,
  addMessages,
  deleteChatLocal,
  removeTyping
} from "../chat.slice";

export const useChat = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  // ✅ INIT SOCKET (ONLY ONCE)
  const initializeSocketConnection = () => {
    if (!socketRef.current) {
      socketRef.current = io("https://crypto-ai-gq4m.onrender.com", {
        withCredentials: true,
      });

      socketRef.current.on("connect", () => {
        console.log("✅ SOCKET CONNECTED");
      });

      // ✅ RECEIVE AI MESSAGE
      socketRef.current.on("newMessage", (data) => {
  const { chatId, aiMessage, title } = data;

  // ✅ ensure chat exists
  dispatch(createNewChat({ chatId, title }));

  // 🔥 REMOVE "Thinking..." BEFORE adding real message
  dispatch(removeTyping(chatId));

  // ✅ Add AI message
  dispatch(addMessages({
    chatId,
    messages: [aiMessage],
  }));
});
    }
  };

  // ✅ SEND MESSAGE
const handleSendMessage = async ({ message, chatId }) => {
  dispatch(setLoading(true));

  let activeChatId = chatId;
  let isNewChat = false;

  // ✅ STEP 1: If no chat → create temp UI chat
  if (!chatId) {
    activeChatId = "temp-" + Date.now();
    isNewChat = true;

    dispatch(createNewChat({
      chatId: activeChatId,
      title: "New Chat",
    }));

    dispatch(setCurrentChatId(activeChatId));
  }

  // ✅ STEP 2: Show user message instantly
  dispatch(addMessages({
    chatId: activeChatId,
    messages: [{ content: message, role: "user" }]
  }));

  // ✅ STEP 3: Optional (Typing indicator 🔥)
  dispatch(addMessages({
    chatId: activeChatId,
    messages: [{ content: "Thinking...", role: "ai" }]
  }));

  try {
    const res = await api.sendMessage({
      message,
      chatId: chatId || null,
    });

    const realChatId = res.chatId;

    // ✅ STEP 4: Replace temp chat with real chat
    if (isNewChat && realChatId) {

      // Create real chat
      dispatch(createNewChat({
        chatId: realChatId,
        title: res.title,
      }));

      // Move messages (without "Thinking...")
      const oldMessages = [
        { content: message, role: "user" }
      ];

      dispatch(addMessages({
        chatId: realChatId,
        messages: oldMessages
      }));

      // Switch to real chat
      dispatch(setCurrentChatId(realChatId));

      // Delete temp chat
      dispatch(deleteChatLocal(activeChatId));
    }

    // ✅ Join room AFTER real chat
    if (socketRef.current) {
      socketRef.current.emit("join", realChatId);
    }

  } catch (err) {
    console.error("Failed:", err);
  } finally {
    dispatch(setLoading(false));
  }
};

  // ✅ GET CHATS
  const handleGetChats = async () => {
    dispatch(setLoading(true));
    try {
      const data = await api.getChats();

      const formatted = data.chats.reduce((acc, chat) => {
        acc[chat._id] = {
          id: chat._id,
          title: chat.title,
          messages: [],
          lastUpdated: chat.updatedAt,
        };
        return acc;
      }, {});

      dispatch(setChats(formatted));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ✅ OPEN CHAT + JOIN ROOM
  const handleOpenChat = async (chatId, chats) => {
  if (socketRef.current) {
    socketRef.current.emit("join", chatId);
    console.log("✅ Joined room:", chatId);
  }

  if (chats[chatId]?.messages.length === 0) {
    const data = await api.getMessages(chatId);
    dispatch(addMessages({ chatId, messages: data.messages }));
  }

  dispatch(setCurrentChatId(chatId));
};
const handleNewChat = () => {
  dispatch(setCurrentChatId(null));
};

  return {
    initializeSocketConnection,
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
    handleNewChat,
  };
};