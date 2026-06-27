import React from "react";
import { FileCode, ShieldAlert, CheckCircle } from "lucide-react";
import { SecurityIssue } from "../../types";

interface CodeViewerProps {
  selectedFile: string;
  fileContentToDisplay: string;
  codeSearchQuery: string;
  currentFileIssue?: SecurityIssue | null;
  isFixApplied?: boolean;
}

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return text;
  }
  const escaped = escapeRegExp(highlight);
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) => 
    part.toLowerCase() === highlight.toLowerCase() ? (
      <mark key={i} className="bg-emerald-500/30 text-emerald-100 font-semibold px-1 rounded shadow-sm border border-emerald-500/40 font-mono">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export const CodeViewer: React.FC<CodeViewerProps> = ({
  selectedFile,
  fileContentToDisplay,
  codeSearchQuery,
  currentFileIssue = null,
  isFixApplied = false,
}) => {
  if (!selectedFile) {
    return (
      <div className="flex flex-col justify-center items-center h-[420px] text-slate-500 text-xs font-sans bg-slate-950/20 border-t border-slate-900">
        <div className="relative mb-4 group">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full filter blur-xl group-hover:bg-indigo-500/20 transition-all duration-75" />
          <div className="relative border border-slate-800/80 bg-slate-900 p-4 rounded-2xl shadow-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
            <FileCode className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <span className="font-semibold text-slate-400 text-sm">No File Open</span>
        <span className="text-[11px] text-slate-550 max-w-xs mt-1 text-center">
          Select any source file from the workspace explorer to inspect code segments.
        </span>
      </div>
    );
  }

  // Determine line ranges for vulnerability or fix highlighting
  const getHighlightRanges = () => {
    if (!currentFileIssue) return null;
    const targetCode = isFixApplied ? currentFileIssue.newCode : currentFileIssue.oldCode;
    if (!targetCode) return null;

    const fileLines = fileContentToDisplay.split('\n');
    const targetLines = targetCode.split('\n');

    let startIdx = -1;
    for (let i = 0; i <= fileLines.length - targetLines.length; i++) {
      let match = true;
      for (let j = 0; j < targetLines.length; j++) {
        if (fileLines[i + j].trim() !== targetLines[j].trim()) {
          match = false;
          break;
        }
      }
      if (match) {
        startIdx = i;
        break;
      }
    }

    if (startIdx !== -1) {
      return {
        start: startIdx,
        end: startIdx + targetLines.length - 1
      };
    }
    return null;
  };

  const highlightRange = getHighlightRanges();
  const fileLines = fileContentToDisplay.split("\n");

  return (
    <div className="overflow-x-auto h-[460px] bg-slate-950/40 border-t border-slate-900 custom-scrollbar relative flex-1">
      <pre className="text-xs font-mono text-slate-350 leading-relaxed whitespace-pre font-medium text-left py-4 min-w-max">
        {fileLines.map((line, idx) => {
          const isVulnerableRange = highlightRange && idx >= highlightRange.start && idx <= highlightRange.end;
          const showWarningHighlight = isVulnerableRange && !isFixApplied;
          const showSuccessHighlight = isVulnerableRange && isFixApplied;

          let rowBgClass = "hover:bg-slate-900/40";
          let gutterBorderClass = "border-slate-900";
          let gutterTextClass = "text-slate-600";
          let contentTextClass = "text-slate-300";
          let prefixElement = null;

          if (showWarningHighlight) {
            const isHigh = currentFileIssue.severity.toLowerCase() === 'high';
            rowBgClass = isHigh ? "bg-red-500/10 hover:bg-red-500/15" : "bg-amber-500/10 hover:bg-amber-500/15";
            gutterBorderClass = isHigh ? "border-red-500/30" : "border-amber-500/30";
            gutterTextClass = isHigh ? "text-red-400 font-semibold" : "text-amber-400 font-semibold";
            contentTextClass = isHigh ? "text-red-200" : "text-amber-200";
            prefixElement = (
              <span className="absolute left-[54px] flex items-center z-15 select-none" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                <ShieldAlert className={`h-3 w-3 ${isHigh ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
              </span>
            );
          } else if (showSuccessHighlight) {
            rowBgClass = "bg-emerald-500/10 hover:bg-emerald-500/15";
            gutterBorderClass = "border-emerald-500/30";
            gutterTextClass = "text-emerald-450 font-semibold";
            contentTextClass = "text-emerald-100";
            prefixElement = (
              <span className="absolute left-[54px] flex items-center z-15 select-none" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                <CheckCircle className="h-3 w-3 text-emerald-400" />
              </span>
            );
          }

          return (
            <div key={idx} className={`flex w-full transition-all relative pr-4 ${rowBgClass}`}>
              <span className={`text-right w-11 select-none pr-3 border-r ${gutterBorderClass} shrink-0 font-light font-mono ${gutterTextClass} text-[10px]`}>
                {idx + 1}
              </span>
              {prefixElement}
              <span className={`pl-6 font-mono ${contentTextClass}`}>
                {highlightText(line, codeSearchQuery)}
              </span>
            </div>
          );
        })}
      </pre>
    </div>
  );
};
