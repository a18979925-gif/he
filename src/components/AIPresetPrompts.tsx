import React from 'react';
import { HelpCircle, Sparkles, Terminal, Zap, Layers } from 'lucide-react';

interface AIPresetPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  category: string;
}

export default function AIPresetPrompts({ onSelectPrompt, category }: AIPresetPromptsProps) {
  const prompts = [
    {
      label: 'OWASP Impact',
      icon: HelpCircle,
      text: `Explain how this relates to the OWASP Top 10 vulnerabilities list. What is the theoretical impact?`,
      color: 'text-rose-450 hover:bg-rose-500/10'
    },
    {
      label: 'Defensive Fix',
      icon: Sparkles,
      text: `Provide a safe, production-ready refactored version of this exact code following defensive coding standards.`,
      color: 'text-amber-455 hover:bg-amber-500/10'
    },
    {
      label: 'Unit Test Case',
      icon: Terminal,
      text: `How can I write a robust unit test case to verify both safe and malicious input behaviors for this code?`,
      color: 'text-sky-400 hover:bg-sky-500/10'
    },
    {
      label: 'Performance Review',
      icon: Zap,
      text: `Analyze the potential latency and memory usage of this block. Are there any O(N^2) loops or resource leaks?`,
      color: 'text-violet-400 hover:bg-violet-500/10'
    },
    {
      label: 'Architecture Fit',
      icon: Layers,
      text: `Does this code snippet violate clean code principles or the MVC/DDD structure? How can we make it more modular?`,
      color: 'text-emerald-450 hover:bg-emerald-500/10'
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 px-3.5 pb-3">
      {prompts.map((p, index) => {
        const Icon = p.icon;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelectPrompt(p.text)}
            className={`flex items-center gap-1.5 text-[9px] bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900 px-3 py-1.5 rounded-full font-bold transition-all duration-150 shadow-md cursor-pointer select-none active:scale-95 text-slate-300 hover:text-white hover:scale-[1.02] ${p.color}`}
          >
            <Icon size={11} className="shrink-0" />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
