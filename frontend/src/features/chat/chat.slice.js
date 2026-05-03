import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: {},
    currentChatId: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    createNewChat: (state, action) => {
      const { chatId, title } = action.payload;
      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          id: chatId,
          title,
          messages: [],
          lastUpdated: new Date().toISOString(),
        };
      }
    },
    // ✅ Renamed to addMessages (plural) to match your imports
    addMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      if (!state.chats[chatId]) return;
      
      const existingMessages = state.chats[chatId].messages;
      
      // Deduplication logic: prevents double messages from Socket + HTTP
      const newMessages = messages.filter(
        (m) => !existingMessages.some((em) => em.content === m.content && em.role === m.role)
      );
      
      state.chats[chatId].messages.push(...newMessages);
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    deleteChatLocal: (state, action) => {
  delete state.chats[action.payload];
},
removeTyping: (state, action) => {
  const chatId = action.payload;
  if (!state.chats[chatId]) return;

  state.chats[chatId].messages =
    state.chats[chatId].messages.filter(
      (msg) => msg.content !== "Thinking..."
    );
},
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  }
});

// ✅ Make sure these names match the reducers above exactly
export const { 
  setChats, 
  setCurrentChatId, 
  setLoading, 
  createNewChat, 
  addMessages ,
  deleteChatLocal,
  removeTyping
} = chatSlice.actions;

export default chatSlice.reducer;