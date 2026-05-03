import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { useRef } from "react";
import * as api from "../service/chat.api";
import { 
  setChats, setCurrentChatId, setLoading, 
  createNewChat, addMessages 
} from "../chat.slice";

export const useChat = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  const initializeSocketConnection = (userId) => {
    console.log("INIT SOCKET USER:", userId);
    if (!socketRef.current) {
      socketRef.current = io("https://crypto-ai-gq4m.onrender.com", { withCredentials: true,transports: ["websocket"],autoConnect: true,forceNew: true, });

      socketRef.current.on("connect", () => {
  console.log("✅ SOCKET CONNECTED");

  socketRef.current.emit("join", userId);
  console.log("Joining room:", userId);
});

      socketRef.current.on("newMessage", (data) => {
        const { chatId, aiMessage, title } = data;

        dispatch(createNewChat({ chatId, title }));

        // ✅ Only AI message (user already added locally)
        dispatch(addMessages({
          chatId,
          messages: [aiMessage]
        }));
      });
    }
  };

  const handleSendMessage = async ({ message, chatId }) => {
    if (!chatId) return;

    dispatch(setLoading(true));

    // ✅ Instant UI update
    dispatch(addMessages({
      chatId,
      messages: [{ content: message, role: "user" }]
    }));

    try {
      await api.sendMessage({ message, chatId });
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetChats = async () => {
    dispatch(setLoading(true));
    try {
      const data = await api.getChats();
      const formatted = data.chats.reduce((acc, chat) => {
        acc[chat._id] = { 
          id: chat._id, 
          title: chat.title, 
          messages: [], 
          lastUpdated: chat.updatedAt 
        };
        return acc;
      }, {});
      dispatch(setChats(formatted));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleOpenChat = async (chatId, chats) => {
  if (socketRef.current) {
    socketRef.current.emit("join", chatId);
    console.log("Joined chat room:", chatId);
  }

  if (chats[chatId]?.messages.length === 0) {
    const data = await api.getMessages(chatId);
    dispatch(addMessages({ chatId, messages: data.messages }));
  }

  dispatch(setCurrentChatId(chatId));
};

  return { 
    initializeSocketConnection,
    handleSendMessage, 
    handleGetChats, 
    handleOpenChat,
    socketRef // optional (for cleanup)
  };
};