import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";
import remarkGfm from "remark-gfm";

const Dashboard = () => {
  const chat = useChat();
  const [chatInput, setChatInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(false); 
  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, currentChatId]);

  const handleSubmitMessage = (event) => {
    event.preventDefault();
    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage) return;

    chat.handleSendMessage({
      message: trimmedMessage,
      chatId: currentChatId || null,
    });

    setChatInput("");
  };

  return (
    <main className="flex h-screen w-full bg-[#0b0f19] text-white">

      {/* ✅ MOBILE OVERLAY */}
      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full w-72 bg-[#0d111c]/95 backdrop-blur-xl p-5 border-r border-white/5 transition-transform duration-300
        ${showSidebar ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Close button (mobile) */}
        <button
          onClick={() => setShowSidebar(false)}
          className="md:hidden absolute top-4 right-4 text-white/60"
        >
          ✕
        </button>

        <h1 className="mb-4 text-xl font-semibold tracking-tight text-white/90">
          Crypto AI
        </h1>

        <button
          onClick={() => {
            chat.handleNewChat();
            setShowSidebar(false); // ✅ close on mobile
          }}
          className="mb-5 w-full rounded-lg bg-blue-600/90 px-4 py-2 text-sm font-medium hover:bg-blue-500 transition"
        >
          + New Chat
        </button>

        <div className="flex flex-col gap-1 overflow-y-auto pr-1">
          {Object.values(chats).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                chat.handleOpenChat(item.id, chats);
                setShowSidebar(false); // ✅ close on mobile
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                currentChatId === item.id
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="truncate block">
                {item.title || "Untitled Chat"}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Section */}
      <section className="flex flex-1 flex-col relative">

        {/* ✅ HAMBURGER BUTTON (mobile) */}
        <button
          onClick={() => setShowSidebar(true)}
          className="md:hidden absolute top-4 left-4 z-50 bg-white/10 backdrop-blur-md p-2 rounded-lg"
        >
          ☰
        </button>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6 space-y-6 pb-36">

          {!currentChatId && (
            <div className="flex h-full items-center justify-center text-white/40">
              <div className="text-center">
                <h2 className="text-xl font-medium">Start a conversation</h2>
                <p className="text-sm mt-1">Ask anything to begin</p>
              </div>
            </div>
          )}

          {chats[currentChatId]?.messages?.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] md:max-w-[70%] px-5 py-3 rounded-2xl text-sm leading-relaxed transition ${
                  message.role === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white/5 text-white/90 border border-white/10 rounded-bl-md"
                }`}
              >
                {message.role === "ai" && (
                  <div className="text-[10px] mb-1 text-blue-400 uppercase tracking-wide">
                    Assistant
                  </div>
                )}

                {message.isTyping ? (
                  <div className="flex gap-1 mt-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-300"></span>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="absolute bottom-0 w-full px-4 md:px-10 pb-6">
          <form onSubmit={handleSubmitMessage} className="mx-auto max-w-3xl">
            <div className="flex items-center bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2 shadow-lg">
              
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40 px-2 py-2"
              />

              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="ml-2 rounded-lg bg-blue-600 px-3 py-2 text-sm hover:bg-blue-500 disabled:opacity-30 transition"
              >
                →
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;