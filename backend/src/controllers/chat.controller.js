import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { getIO } from "../sockets/server.socket.js";

export async function sendMessage(req, res) {
  const { message, chat: chatId } = req.body;
  let title = null,
    chat = null;

  if (!chatId) {
    title = await generateChatTitle(message);
    chat = await chatModel.create({
      user: req.user.id,
      title,
    });
  }

  const finalChatId = chatId || chat._id;

  // 1. Save user message
  const userMessage = await messageModel.create({
    chat: finalChatId,
    content: message,
    role: "user",
  });

  // 2. Fetch history and get AI response
  const messages = await messageModel.find({ chat: finalChatId });
  const result = await generateResponse(messages);

  // 3. Save AI message
  const aiMessage = await messageModel.create({
    chat: finalChatId,
    content: result,
    role: "ai",
  });

  // 4. REAL-TIME EMIT (Now getIO() is defined)
  try {
  const io = getIO(); 

  console.log("Emitting message to:", req.user.id);
  console.log("Message content:", {
    chatId: finalChatId,
    userMessage: userMessage.content,
    aiMessage: aiMessage.content,
    title: title || (chat ? chat.title : null),
  });
 setTimeout(() => {
  io.to(finalChatId.toString()).emit("newMessage", {
    chatId: finalChatId.toString(),
    aiMessage: {
      content: aiMessage.content,
      role: "ai",
    },
    title: title || (chat ? chat.title : null),
  });

  console.log("✅ EMITTED TO ROOM:", finalChatId.toString());
}, 200);
  } catch (error) {
    console.error("Socket error:", error.message);
  }

  res.status(201).json({
    title: title || (chat ? chat.title : null),
    chat,
    aiMessage,
    chatId: finalChatId,
  });
}

export async function getChats(req, res) {
  const user = req.user;

  const chats = await chatModel.find({ user: user.id });

  res.status(200).json({
    message: "Chats retrieved successfully",
    chats,
  });
}

export async function getMessages(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOne({
    _id: chatId,
    user: req.user.id,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  const messages = await messageModel.find({
    chat: chatId,
  });

  res.status(200).json({
    message: "Messages retrieved successfully",
    messages,
  });
}

export async function deleteChat(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id,
  });

  await messageModel.deleteMany({
    chat: chatId,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  res.status(200).json({
    message: "Chat deleted successfully",
  });
}
