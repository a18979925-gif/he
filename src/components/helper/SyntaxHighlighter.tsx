import React from "react";

interface CodeHighlightProps {
  code: string;
  language?: string;
  className?: string;
  isDiff?: boolean;
}

export const CodeHighlight: React.FC<CodeHighlightProps> = ({
  code,
  language = "typescript",
  className = "",
  isDiff = false,
}) => {
  const lines = code.split("\n");

  const highlightLine = (line: string) => {
    if (!line.trim()) return <span>&nbsp;</span>;

    // Check if it's a diff line
    let lineClass = "";
    let cleanLine = line;
    if (isDiff) {
      if (line.startsWith("+")) {
        lineClass = "bg-emerald-950/50 text-emerald-300 border-l-2 border-emerald-500 pl-2 -mx-2 block font-medium";
        cleanLine = line.substring(1);
      } else if (line.startsWith("-")) {
        lineClass = "bg-rose-950/40 text-rose-350 border-l-2 border-rose-500 pl-2 -mx-2 block line-through decoration-rose-500/50";
        cleanLine = line.substring(1);
      } else if (line.startsWith("@@")) {
        lineClass = "text-indigo-400 font-semibold bg-slate-900/60 py-0.5 -mx-2 block text-[10px] tracking-wide select-none";
      }
    }

    // Treat pure comments specially
    if (cleanLine.trim().startsWith("//") || cleanLine.trim().startsWith("/*") || cleanLine.trim().startsWith("*") || cleanLine.trim().startsWith("#")) {
      return (
        <span className={lineClass}>
          <span className="text-slate-500 italic">{cleanLine}</span>
        </span>
      );
    }

    // Token regex for common keywords, strings, types, numbers, functions, and operators
    const tokenRegex = /(\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:const|let|var|function|return|class|interface|implements|extends|import|export|from|default|public|private|protected|static|new|async|await|try|catch|throw|if|else|for|while|do|switch|case|break|continue|select|insert|update|delete|where|join|on|into|values|and|or|not|null|true|false)\b|\b\d+\b|[a-zA-Z_]\w*(?=\()|[+\-*\/=<>!&|^%]+)/g;

    const parts = cleanLine.split(tokenRegex);
    const matches = cleanLine.match(tokenRegex) || [];

    let matchIdx = 0;
    const elements = parts.map((part, idx) => {
      // Even indices are non-matched text, odd are matches
      if (idx % 2 === 0) {
        return <span key={idx}>{part}</span>;
      }
      
      const token = matches[matchIdx++];
      
      if (token.startsWith("//")) {
        return <span key={idx} className="text-slate-500 italic">{token}</span>;
      }
      if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
        return <span key={idx} className="text-amber-300">{token}</span>;
      }
      if (/^(const|let|var|function|return|class|interface|implements|extends|import|export|from|default|public|private|protected|static|new|async|await|try|catch|throw|if|else|for|while|do|switch|case|break|continue|select|insert|update|delete|where|join|on|into|values|and|or|not|null|true|false)$/.test(token)) {
        return <span key={idx} className="text-pink-400 font-semibold">{token}</span>;
      }
      if (/^(void|string|number|boolean|any|unknown|never)$/.test(token)) {
        return <span key={idx} className="text-teal-400 font-medium">{token}</span>;
      }
      if (/^\d+$/.test(token)) {
        return <span key={idx} className="text-violet-400">{token}</span>;
      }
      if (token.endsWith("(")) {
        return <span key={idx} className="text-cyan-300">{token}</span>;
      }
      if (/^[+\-*\/=<>!&|^%]+$/.test(token)) {
        return <span key={idx} className="text-sky-400">{token}</span>;
      }
      // Check if it's a function call (matches parenthesis in regex)
      if (cleanLine.substring(cleanLine.indexOf(token) + token.length).trim().startsWith("(")) {
        return <span key={idx} className="text-cyan-300">{token}</span>;
      }
      
      return <span key={idx}>{token}</span>;
    });

    return <span className={lineClass}>{elements}</span>;
  };

  return (
    <pre className={`font-mono text-left leading-relaxed text-slate-350 overflow-x-auto whitespace-pre bg-slate-950 p-4 border border-slate-800 rounded-xl max-h-[450px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent ${className}`}>
      <code>
        {lines.map((line, idx) => (
          <div key={idx} className="table-row">
            <span className="table-cell text-right pr-4 text-slate-600 select-none text-[10px] w-6 font-mono text-opacity-50">
              {idx + 1}
            </span>
            <span className="table-cell font-mono text-xs">
              {highlightLine(line)}
            </span>
          </div>
        ))}
      </code>
    </pre>
  );
};
