import { useMemo } from 'react';

interface DiffViewerProps {
  diffText: string;
}

export default function DiffViewer({ diffText }: DiffViewerProps) {
  const lines = useMemo(() => {
    if (!diffText) return [];
    return diffText.split('\n');
  }, [diffText]);

  if (!diffText) return null;

  return (
    <div id="diff-viewer" className="font-mono text-xs rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
      <div className="bg-gray-100 px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-gray-500 border-b border-gray-200 flex justify-between items-center">
        <span>Proposed Diff Patch</span>
        <span className="text-emerald-600">Unified Format</span>
      </div>
      <div className="max-h-80 overflow-y-auto p-3 space-y-0.5 whitespace-pre select-text">
        {lines.map((line, idx) => {
          let lineClass = 'text-gray-700';
          let bgClass = 'hover:bg-gray-100';

          if (line.startsWith('+')) {
            lineClass = 'text-emerald-700 font-medium';
            bgClass = 'bg-emerald-50/70 hover:bg-emerald-100/70 border-l-2 border-emerald-500';
          } else if (line.startsWith('-')) {
            lineClass = 'text-rose-700';
            bgClass = 'bg-rose-50/70 hover:bg-rose-100/70 border-l-2 border-rose-500';
          } else if (line.startsWith('@@')) {
            lineClass = 'text-blue-600 font-semibold';
            bgClass = 'bg-blue-50/30 font-semibold text-[11px] py-1 border-y border-blue-50/50';
          }

          return (
            <div
              key={idx}
              className={`px-2 py-0.5 rounded transition-colors flex items-start gap-2 ${bgClass}`}
            >
              <span className="text-[10px] select-none text-gray-400 w-6 text-right">
                {line.startsWith('@@') ? '::' : idx + 1}
              </span>
              <span className={`${lineClass} break-all`}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
