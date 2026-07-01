import { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface DiffViewerProps {
  diffText: string;
}

export default function DiffViewer({ diffText }: DiffViewerProps) {
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => {
    if (!diffText) return [];
    return diffText.split('\n');
  }, [diffText]);

  const stats = useMemo(() => {
    if (!diffText) return { added: 0, deleted: 0 };
    const added = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).length;
    const deleted = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).length;
    return { added, deleted };
  }, [lines, diffText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!diffText) return null;

  return (
    <div id="diff-viewer" className="font-mono text-xs rounded-lg border border-slate-800 overflow-hidden bg-slate-950">
      <div className="bg-slate-900 px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-800 flex justify-between items-center select-none font-mono">
        <div className="flex items-center gap-2">
          <span>Proposed Diff Patch</span>
          <span className="flex items-center gap-1 font-mono font-bold text-[9px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
            <span className="text-emerald-500 font-mono">+{stats.added}</span>
            <span className="text-slate-650 font-mono">/</span>
            <span className="text-rose-500 font-mono">-{stats.deleted}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-slate-400 font-mono uppercase text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 active:scale-95"
          >
            {copied ? (
              <>
                <Check size={10} className="text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy size={10} />
                Copy Patch
              </>
            )}
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto p-3 space-y-0.5 whitespace-pre select-text font-mono">
        {lines.map((line, idx) => {
          let lineClass = 'text-slate-400';
          let bgClass = 'hover:bg-slate-900/60';

          if (line.startsWith('+') && !line.startsWith('+++')) {
            lineClass = 'text-emerald-300 font-medium';
            bgClass = 'bg-emerald-950/20 hover:bg-emerald-900/30 border-l-2 border-emerald-500 pl-2 -ml-2';
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            lineClass = 'text-rose-350 line-through decoration-rose-900/30';
            bgClass = 'bg-rose-950/20 hover:bg-rose-900/30 border-l-2 border-rose-500 pl-2 -ml-2';
          } else if (line.startsWith('@@')) {
            lineClass = 'text-indigo-400 font-semibold';
            bgClass = 'bg-slate-900/40 font-semibold text-[10px] py-1 border-y border-slate-900/60 pl-2 -ml-2';
          }

          return (
            <div
              key={idx}
              className={`px-2 py-0.5 rounded transition-colors flex items-start gap-2 ${bgClass}`}
            >
              <span className="text-[9px] select-none text-slate-650 w-6 text-right shrink-0 font-mono">
                {line.startsWith('@@') ? '::' : idx + 1}
              </span>
              <span className={`${lineClass} break-all font-mono`}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
