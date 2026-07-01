/**
 * TeamChatPanel.tsx — Real-time chat for team collaboration
 */
import React, { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare } from "lucide-react";

interface TeamChatPanelProps {
  teamId: string;
  onClose: () => void;
}

interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
}

export default function TeamChatPanel({ teamId, onClose }: TeamChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      // TODO: Implement actual API call
      const newMessage: Message = {
        id: Date.now().toString(),
        userId: "current",
        username: "You",
        content: input,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d18]">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <MessageSquare size={18} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Team Chat</h3>
            <p className="text-xs text-slate-500">Real-time collaboration</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.userId === "current" ? "justify-end" : "justify-start"}`}
              >
                {msg.userId !== "current" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {msg.username[0]}
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.userId === "current"
                      ? "bg-indigo-500/10 border border-indigo-500/20"
                      : "bg-white/[0.03] border border-white/5"
                  }`}
                >
                  {msg.userId !== "current" && (
                    <div className="text-xs font-bold text-indigo-400 mb-1">{msg.username}</div>
                  )}
                  <div className="text-sm text-slate-200">{msg.content}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-black/20">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
