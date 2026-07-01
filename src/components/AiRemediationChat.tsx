import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { AuditIssue, ChatMessage } from '../types';
import AIPresetPrompts from './AIPresetPrompts';

interface AiRemediationChatProps {
  issue: AuditIssue;
}

const CodeBlock: React.FC<{ code: string; language: string; isUser: boolean }> = ({ code, language, isUser }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden font-mono text-[10px] text-slate-300 w-full text-left">
      <div className="bg-slate-900/60 px-3 py-1 flex justify-between items-center text-[9px] text-slate-500 border-b border-slate-850">
        <span className="font-bold tracking-wider">{language.toUpperCase()}</span>
        <button 
          type="button" 
          onClick={handleCopy}
          className="hover:text-slate-200 transition-colors cursor-pointer bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-bold active:scale-95"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto whitespace-pre font-mono leading-relaxed">{code}</pre>
    </div>
  );
};

export default function AiRemediationChat({ issue }: AiRemediationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Hello! I am your AI Remediation Assistant. I've audited this code line and identified a **${issue.category}** issue with **${issue.severity}** severity: *"${issue.title}"*.\n\nAsk me anything! For example:\n- *Why is this pattern insecure or sub-optimal?*\n- *Can you write a detailed step-by-step fix?*\n- *How can I test if this issue is exploitable?*`,
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

  const parseMarkdown = (content: string, isUser: boolean) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeLines = part.slice(3, -3).trim().split('\n');
        let language = 'javascript';
        let codeText = part.slice(3, -3).trim();
        if (codeLines[0] && !codeLines[0].includes(' ') && codeLines[0].length < 15) {
          language = codeLines[0];
          codeText = codeLines.slice(1).join('\n');
        }
        return (
          <CodeBlock key={index} code={codeText} language={language} isUser={isUser} />
        );
      }

      return (
        <div key={index} className="space-y-1.5 w-full">
          {part.split('\n').map((line, i) => {
            const cleanLine = line.trim();
            const isBullet = cleanLine.startsWith('- ') || cleanLine.startsWith('* ');
            const isNumList = /^\d+\.\s/.test(cleanLine);
            
            let displayLine = cleanLine;
            if (isBullet) {
              displayLine = cleanLine.replace(/^[-*]\s+/, '');
            } else if (isNumList) {
              displayLine = cleanLine.replace(/^\d+\.\s+/, '');
            }

            const parsedLineContent = displayLine.split('**').map((chunk, j) => {
              if (j % 2 === 1) return <strong key={j} className="font-extrabold text-white">{chunk}</strong>;
              return chunk.split('`').map((subchunk, k) => {
                if (k % 2 === 1) {
                  return (
                    <code key={k} className={`font-mono text-[10px] px-1 py-0.5 rounded ${isUser ? 'bg-indigo-850 text-indigo-150' : 'bg-slate-950 text-emerald-400 border border-slate-800'}`}>
                      {subchunk}
                    </code>
                  );
                }
                return subchunk;
              });
            });

            if (isBullet) {
              return (
                <ul key={i} className="list-disc pl-4 space-y-1 text-slate-300">
                  <li>{parsedLineContent}</li>
                </ul>
              );
            }
            if (isNumList) {
              const num = line.match(/^\d+/)?.[0] || '1';
              return (
                <ol key={i} className="list-decimal pl-4 space-y-1 text-slate-300">
                  <li value={parseInt(num)}>{parsedLineContent}</li>
                </ol>
              );
            }

            return <p key={i} className={`${isUser ? 'text-indigo-100' : 'text-slate-300'} leading-relaxed`}>{parsedLineContent}</p>;
          })}
        </div>
      );
    });
  };

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
    <div className="mt-4 border border-slate-800 bg-slate-900/60 backdrop-blur-md rounded-xl flex flex-col overflow-hidden shadow-xl">
      {/* Header bar */}
      <div className="bg-slate-950 px-3.5 py-2 flex items-center justify-between text-slate-100 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="animate-pulse text-indigo-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">AI Remediation Assistant</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase">
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
              className={`max-w-[90%] rounded-xl px-3 py-2 text-left leading-relaxed ${
                isUser
                  ? 'bg-indigo-650 text-white self-end rounded-br-none shadow-md border border-indigo-500/20'
                  : 'bg-slate-950/60 border border-slate-800/80 text-slate-200 self-start rounded-bl-none shadow-md backdrop-blur-sm'
              }`}
            >
              <div className="w-full">
                {parseMarkdown(msg.content, isUser)}
              </div>
              <div className={`text-[8px] mt-1 text-right ${isUser ? 'text-indigo-350' : 'text-slate-500'}`}>
                {msg.timestamp}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="bg-slate-800/80 border border-slate-700 text-slate-300 self-start rounded-xl rounded-bl-none px-3 py-2 flex items-center gap-1.5 shadow-md max-w-[85%] backdrop-blur-sm">
            <Loader2 size={12} className="animate-spin text-indigo-400" />
            <span className="text-[10px] text-slate-400 font-medium">Assistant is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset assistant quick triggers */}
      <AIPresetPrompts onSelectPrompt={sendMessage} category={issue.category} />

      {/* Input bar */}
      <form onSubmit={handleSend} className="border-t border-slate-800 bg-slate-950/50 p-2 flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder="Ask AI why this is flagged, or how to fix it..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs focus:outline-hidden focus:border-indigo-500 focus:bg-slate-800 text-slate-200 transition-colors placeholder:text-slate-600"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg transition-all shadow-md border border-indigo-500/30"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
