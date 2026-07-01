import React from 'react';
import { HelpCircle, Sparkles, Terminal, FileCode } from 'lucide-react';

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
    },
    {
      label: 'Defensive Fix',
      icon: Sparkles,
      text: `Provide a safe, production-ready refactored version of this exact code following defensive coding standards.`,
    },
    {
      label: 'Unit Test Case',
      icon: Terminal,
      text: `How can I write a robust unit test case to verify both safe and malicious input behaviors for this code?`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 px-3.5 pb-2">
      {prompts.map((p, index) => {
        const Icon = p.icon;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelectPrompt(p.text)}
            className="flex items-center gap-1 text-[9px] bg-white border border-gray-150 hover:border-blue-400 hover:text-blue-600 px-2 py-1 rounded-full text-gray-500 font-medium transition-all shadow-3xs cursor-pointer select-none"
          >
            <Icon size={10} className="text-gray-400 group-hover:text-blue-500" />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
