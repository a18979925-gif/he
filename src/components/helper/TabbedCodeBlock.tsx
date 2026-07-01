import React, { useState } from "react";
import { CodeHighlight } from "./SyntaxHighlighter";
import { Copy, Check } from "lucide-react";

interface Snippet {
  tab: string;
  code: string;
  language: string;
}

interface TabbedCodeBlockProps {
  snippets: Snippet[];
  title?: string;
}

export const TabbedCodeBlock: React.FC<TabbedCodeBlockProps> = ({ snippets, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!snippets || snippets.length === 0) return null;

  const activeSnippet = snippets[activeIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80 shadow-2xl backdrop-blur-md text-left w-full my-4">
      {/* Header bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {title ? (
          <span className="text-xs font-bold text-slate-300 tracking-wide uppercase font-sans">
            {title}
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-400 font-sans">
            Code Example
          </span>
        )}

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-slate-400 font-mono uppercase text-[9px] bg-slate-950 px-2.5 py-1 rounded border border-slate-850 active:scale-95 font-sans"
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy size={11} />
              Copy Code
            </>
          )}
        </button>
      </div>

      {/* Tab selectors bar */}
      <div className="bg-slate-950 border-b border-slate-900 px-4 flex gap-1 overflow-x-auto scrollbar-none">
        {snippets.map((snip, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`py-2 px-3 text-[11px] font-bold transition-all border-b-2 cursor-pointer select-none active:scale-95 whitespace-nowrap font-sans ${
                isActive
                  ? "border-indigo-500 text-indigo-400 bg-slate-900/40"
                  : "border-transparent text-slate-500 hover:text-slate-350 hover:bg-slate-900/20"
              }`}
            >
              {snip.tab}
            </button>
          );
        })}
      </div>

      {/* Code preview area */}
      <div className="relative">
        <CodeHighlight 
          code={activeSnippet.code} 
          language={activeSnippet.language} 
          className="border-none rounded-none !max-h-[350px] !bg-transparent"
        />
      </div>
    </div>
  );
};
