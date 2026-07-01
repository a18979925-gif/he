import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { AuditIssue, ChatMessage } from '../types';
import AIPresetPrompts from './AIPresetPrompts';

interface AiRemediationChatProps {
  issue: AuditIssue;
}

export default function AiRemediationChat({ issue }: AiRemediationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Hello! I am your AI Remediation Assistant. I've audited this code line and identified a **${issue.category}** issue with **${issue.severity}** severity: *"${issue.title}"*.\n\nAsk me anything! For example:
- *Why is this pattern insecure or sub-optimal?*
- *Can you write a detailed step-by-step fix?*
- *How can I test if this issue is exploitable?*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of discussion
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        sender: m.sender,
        content: m.content,
      }));

      const res = await fetch('/api/analysis/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issue,
          history: chatHistory.slice(0, -1),
          userMessage: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          sender: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to communicate with AI');
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        content: `⚠️ Stalled: ${err?.message || 'Check your Gemini key configuration.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');
    await sendMessage(userText);
  };

  return (
    <div className="mt-4 border border-blue-100 bg-blue-50/20 rounded-xl flex flex-col overflow-hidden shadow-xs">
      {/* Header bar */}
      <div className="bg-blue-600 px-3.5 py-2 flex items-center justify-between text-white">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider">AI Remediation Assistant</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] bg-blue-500/50 px-2 py-0.5 rounded font-mono font-bold uppercase">
          <MessageSquare size={10} /> Live session
        </div>
      </div>

      {/* Messages area */}
      <div className="p-3 space-y-3 max-h-60 overflow-y-auto text-xs flex flex-col">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-left leading-relaxed ${
                isUser
                  ? 'bg-blue-600 text-white self-end rounded-br-none shadow-xs'
                  : 'bg-white border border-gray-150 text-gray-800 self-start rounded-bl-none shadow-2xs'
              }`}
            >
              {/* Parse basic markdown format (bold/code) in content simply */}
              <div className="whitespace-pre-wrap break-words">
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1' : ''}>
                    {line.split('**').map((chunk, j) => {
                      if (j % 2 === 1) return <strong key={j} className="font-extrabold">{chunk}</strong>;
                      
                      // Also support inline code snippets formatting
                      return chunk.split('`').map((subchunk, k) => {
                        if (k % 2 === 1) {
                          return (
                            <code key={k} className={`font-mono text-[10px] px-1 py-0.5 rounded ${isUser ? 'bg-blue-700 text-blue-100' : 'bg-gray-100 text-rose-600'}`}>
                              {subchunk}
                            </code>
                          );
                        }
                        return subchunk;
                      });
                    })}
                  </p>
                ))}
              </div>
              <div className={`text-[8px] mt-1 text-right ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
                {msg.timestamp}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="bg-white border border-gray-150 text-gray-800 self-start rounded-xl rounded-bl-none px-3 py-2 flex items-center gap-1.5 shadow-2xs max-w-[85%]">
            <Loader2 size={12} className="animate-spin text-blue-500" />
            <span className="text-[10px] text-gray-500 font-medium">Assistant is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset assistant quick triggers */}
      <AIPresetPrompts onSelectPrompt={sendMessage} category={issue.category} />

      {/* Input bar */}
      <form onSubmit={handleSend} className="border-t border-gray-100 bg-white p-2 flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Ask AI why this is flagged, or how to fix it..."
          className="flex-1 bg-gray-50 border border-gray-150 rounded-lg px-3 py-1 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-all shadow-xs"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
