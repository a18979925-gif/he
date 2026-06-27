import React, { useRef } from "react";
import { highlightText } from "./CodeViewer";
import { SecurityIssue } from "../../types";
import { Trash2, ShieldCheck, ArrowRightLeft } from "lucide-react";

interface DiffItem {
  leftLine?: string;
  leftNum?: number;
  rightLine?: string;
  rightNum?: number;
  type: 'equal' | 'delete' | 'insert' | 'modified';
}

interface DiffViewerProps {
  originalContent: string;
  securedContent: string;
  currentFileIssue: SecurityIssue | null;
  codeSearchQuery: string;
}

const getDiffData = (originalStr: string, securedStr: string, issue: SecurityIssue | null): DiffItem[] => {
  const originalLines = originalStr.split('\n');
  const securedLines = securedStr.split('\n');
  
  if (!issue || !issue.oldCode || !issue.newCode) {
    return originalLines.map((line, idx) => ({
      leftLine: line,
      leftNum: idx + 1,
      rightLine: line,
      rightNum: idx + 1,
      type: 'equal'
    }));
  }

  const oldCodeLines = issue.oldCode.split('\n');
  const newCodeLines = issue.newCode.split('\n');

  let startIdx = -1;
  for (let i = 0; i <= originalLines.length - oldCodeLines.length; i++) {
    let match = true;
    for (let j = 0; j < oldCodeLines.length; j++) {
      if (originalLines[i + j].trim() !== oldCodeLines[j].trim()) {
        match = false;
        break;
      }
    }
    if (match) {
      startIdx = i;
      break;
    }
  }

  const diffItems: DiffItem[] = [];

  if (startIdx === -1) {
    const maxLen = Math.max(originalLines.length, securedLines.length);
    for (let i = 0; i < maxLen; i++) {
      const left = originalLines[i];
      const right = securedLines[i];
      diffItems.push({
        leftLine: left,
        leftNum: left !== undefined ? i + 1 : undefined,
        rightLine: right,
        rightNum: right !== undefined ? i + 1 : undefined,
        type: left === right ? 'equal' : 'modified'
      });
    }
    return diffItems;
  }

  for (let i = 0; i < startIdx; i++) {
    diffItems.push({
      leftLine: originalLines[i],
      leftNum: i + 1,
      rightLine: originalLines[i],
      rightNum: i + 1,
      type: 'equal'
    });
  }

  const maxDiffLen = Math.max(oldCodeLines.length, newCodeLines.length);
  for (let j = 0; j < maxDiffLen; j++) {
    const leftLine = j < oldCodeLines.length ? oldCodeLines[j] : undefined;
    const rightLine = j < newCodeLines.length ? newCodeLines[j] : undefined;
    
    diffItems.push({
      leftLine: leftLine,
      leftNum: leftLine !== undefined ? startIdx + j + 1 : undefined,
      rightLine: rightLine,
      rightNum: rightLine !== undefined ? startIdx + j + 1 : undefined,
      type: leftLine !== undefined && rightLine !== undefined ? 'modified' : (leftLine !== undefined ? 'delete' : 'insert')
    });
  }

  const originalRemainingStart = startIdx + oldCodeLines.length;
  const securedRemainingStart = startIdx + newCodeLines.length;
  const remainingCount = originalLines.length - originalRemainingStart;

  for (let i = 0; i < remainingCount; i++) {
    diffItems.push({
      leftLine: originalLines[originalRemainingStart + i],
      leftNum: originalRemainingStart + i + 1,
      rightLine: securedLines[securedRemainingStart + i],
      rightNum: securedRemainingStart + i + 1,
      type: 'equal'
    });
  }

  return diffItems;
};

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalContent,
  securedContent,
  currentFileIssue,
  codeSearchQuery,
}) => {
  const diffItems = getDiffData(originalContent, securedContent, currentFileIssue);

  // Synchronized scrolling refs and handlers
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  const handleLeftScroll = () => {
    if (isSyncingRight.current) return;
    isSyncingLeft.current = true;
    if (leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
      rightScrollRef.current.scrollLeft = leftScrollRef.current.scrollLeft;
    }
    isSyncingLeft.current = false;
  };

  const handleRightScroll = () => {
    if (isSyncingLeft.current) return;
    isSyncingRight.current = true;
    if (leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
      leftScrollRef.current.scrollLeft = rightScrollRef.current.scrollLeft;
    }
    isSyncingRight.current = false;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-850 border-t border-slate-900 bg-slate-950/20 text-xs overflow-hidden flex-1 relative min-h-[460px]">
      
      {/* Decorative center sync icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden lg:flex items-center justify-center h-8 w-8 rounded-full bg-slate-900 border border-slate-800 text-slate-500 shadow-2xl backdrop-blur-sm">
        <ArrowRightLeft className="h-3.5 w-3.5" />
      </div>

      {/* Left Column: Original Code (Deletions) */}
      <div 
        ref={leftScrollRef}
        onScroll={handleLeftScroll}
        className="flex flex-col h-[460px] overflow-y-auto custom-scrollbar bg-slate-950/30"
      >
        <div className="sticky top-0 bg-slate-900/90 border-b border-red-950/20 px-3.5 py-2 flex items-center justify-between text-[10px] font-mono text-red-300 font-bold tracking-wide select-none z-10 backdrop-blur-md">
          <span className="flex items-center gap-1.5">
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
            VULNERABLE SOURCE
          </span>
          <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 uppercase text-[9px] font-sans font-bold">
            - Deletions
          </span>
        </div>
        <div className="py-4 min-w-max">
          <pre className="text-xs font-mono leading-relaxed whitespace-pre font-medium text-slate-400 text-left">
            {diffItems.map((item, idx) => {
              const isDeleted = item.type === 'delete' || item.type === 'modified';
              return (
                <div 
                  key={idx} 
                  className={`flex w-full transition-all pr-4 ${isDeleted ? 'bg-red-500/10 text-red-150 border-l-2 border-red-500' : 'hover:bg-slate-900/40'}`}
                >
                  <span className={`text-right w-11 select-none pr-3 border-r ${isDeleted ? 'border-red-500/30 text-red-400/80 font-semibold bg-red-500/5' : 'border-slate-900 text-slate-650'} shrink-0 font-light font-mono text-[10px]`}>
                    {item.leftNum || " "}
                  </span>
                  
                  {item.leftLine !== undefined ? (
                    <span className={`pl-6 font-mono ${isDeleted ? 'text-red-200 font-medium' : 'text-slate-350'}`}>
                      <span className="text-red-500/60 mr-1.5 select-none font-bold inline-block w-2">{isDeleted ? "-" : " "}</span>
                      {highlightText(item.leftLine, codeSearchQuery)}
                    </span>
                  ) : (
                    /* Aligned Spacer with premium IDE grid-line styling */
                    <span className="flex-1 bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%,transparent_50%,#1e293b_50%,#1e293b_75%,transparent_75%,transparent)] bg-[size:10px_10px] opacity-10 h-5" />
                  )}
                </div>
              );
            })}
          </pre>
        </div>
      </div>

      {/* Right Column: Secured Code (Insertions) */}
      <div 
        ref={rightScrollRef}
        onScroll={handleRightScroll}
        className="flex flex-col h-[460px] overflow-y-auto custom-scrollbar bg-slate-950/30"
      >
        <div className="sticky top-0 bg-slate-900/90 border-b border-emerald-950/20 px-3.5 py-2 flex items-center justify-between text-[10px] font-mono text-emerald-300 font-bold tracking-wide select-none z-10 backdrop-blur-md">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            REMEDIATED SOURCE
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase text-[9px] font-sans font-bold">
            + Insertions
          </span>
        </div>
        <div className="py-4 min-w-max">
          <pre className="text-xs font-mono leading-relaxed whitespace-pre font-medium text-slate-300 text-left">
            {diffItems.map((item, idx) => {
              const isInserted = item.type === 'insert' || item.type === 'modified';
              return (
                <div 
                  key={idx} 
                  className={`flex w-full transition-all pr-4 ${isInserted ? 'bg-emerald-500/10 text-emerald-150 border-l-2 border-emerald-500' : 'hover:bg-slate-900/40'}`}
                >
                  <span className={`text-right w-11 select-none pr-3 border-r ${isInserted ? 'border-emerald-500/30 text-emerald-400/80 font-semibold bg-emerald-500/5' : 'border-slate-900 text-slate-650'} shrink-0 font-light font-mono text-[10px]`}>
                    {item.rightNum || " "}
                  </span>

                  {item.rightLine !== undefined ? (
                    <span className={`pl-6 font-mono ${isInserted ? 'text-emerald-100 font-medium' : 'text-slate-300'}`}>
                      <span className="text-emerald-500 mr-1.5 select-none font-bold inline-block w-2">{isInserted ? "+" : " "}</span>
                      {highlightText(item.rightLine, codeSearchQuery)}
                    </span>
                  ) : (
                    /* Aligned Spacer with premium IDE grid-line styling */
                    <span className="flex-1 bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%,transparent_50%,#1e293b_50%,#1e293b_75%,transparent_75%,transparent)] bg-[size:10px_10px] opacity-10 h-5" />
                  )}
                </div>
              );
            })}
          </pre>
        </div>
      </div>

    </div>
  );
};
