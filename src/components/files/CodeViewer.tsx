import React, { useState, useEffect } from "react";
import { FileCode, ShieldAlert, CheckCircle, Sparkles, Check, RefreshCw, Save, Edit } from "lucide-react";
import { SecurityIssue } from "../../types";

interface CodeViewerProps {
  selectedFile: string;
  fileContentToDisplay: string;
  codeSearchQuery: string;
  currentFileIssue?: SecurityIssue | null;
  isFixApplied?: boolean;
  onFixIssue?: (filePath: string, oldCode: string, newCode: string) => Promise<void>;
  setActiveFixIssue?: (issue: any) => void;
  onSaveFile?: (filePath: string, content: string) => Promise<void>;
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
  onFixIssue,
  setActiveFixIssue,
  onSaveFile,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCode, setEditedCode] = useState(fileContentToDisplay);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setEditedCode(fileContentToDisplay);
    setIsEditMode(false);
    setSaveStatus('idle');
  }, [fileContentToDisplay]);
  const [showFixActionLine, setShowFixActionLine] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyFix = async () => {
    if (!currentFileIssue || !onFixIssue) return;
    try {
      setIsApplying(true);
      await onFixIssue(currentFileIssue.file, currentFileIssue.oldCode, currentFileIssue.newCode);
      setShowFixActionLine(null);
      if (setActiveFixIssue) {
        setActiveFixIssue(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplying(false);
    }
  };
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

  if (isEditMode) {
    return (
      <div className="flex flex-col h-[460px] bg-slate-950 border-t border-slate-900 overflow-hidden relative flex-1 text-left font-sans">
        {/* Editor controls bar */}
        <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Edycja w toku (Manual Edit Mode)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsEditMode(false);
                setEditedCode(fileContentToDisplay);
              }}
              className="px-3 py-1 border border-slate-700 hover:bg-slate-850 text-slate-400 rounded-lg text-xs font-medium cursor-pointer"
            >
              Anuluj
            </button>
            <button
              onClick={async () => {
                if (!onSaveFile) return;
                setSaveStatus('saving');
                try {
                  await onSaveFile(selectedFile, editedCode);
                  setSaveStatus('saved');
                  setTimeout(() => {
                    setIsEditMode(false);
                    setSaveStatus('idle');
                  }, 800);
                } catch (err) {
                  console.error(err);
                  setSaveStatus('idle');
                }
              }}
              disabled={saveStatus === 'saving'}
              className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
            >
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  Zapisywanie...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check size={12} />
                  Zapisano!
                </>
              ) : (
                <>
                  <Save size={12} />
                  Zapisz Plik
                </>
              )}
            </button>
          </div>
        </div>

        {/* Text area and line numbers layout */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-950 font-mono text-xs">
          {/* Virtual Gutter for line numbers */}
          <div className="w-11 select-none pr-3 border-r border-slate-900/60 shrink-0 text-slate-700 text-[10px] text-right py-4 font-mono font-light bg-slate-950/40 overflow-hidden">
            {editedCode.split('\n').map((_, idx) => (
              <div key={idx} className="h-5 leading-5">{idx + 1}</div>
            ))}
          </div>
          <textarea
            value={editedCode}
            onChange={(e) => setEditedCode(e.target.value)}
            className="flex-1 bg-transparent text-slate-250 text-slate-200 p-4 border-0 focus:outline-none focus:ring-0 font-mono text-xs leading-5 resize-none overflow-y-auto select-text custom-scrollbar h-full w-full"
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto h-[460px] bg-slate-950/40 border-t border-slate-900 custom-scrollbar relative flex-1">
      {/* Floating Edit Button */}
      {selectedFile && (
        <button
          onClick={() => {
            setIsEditMode(true);
            setEditedCode(fileContentToDisplay);
          }}
          className="absolute right-4 top-4 bg-slate-900/95 hover:bg-slate-800 text-slate-350 hover:text-slate-100 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg z-20 cursor-pointer active:scale-97 select-none"
        >
          <Edit size={12} />
          Edytuj plik
        </button>
      )}

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
            rowBgClass = isHigh ? "bg-red-500/10 hover:bg-red-500/15 cursor-pointer" : "bg-amber-500/10 hover:bg-amber-500/15 cursor-pointer";
            gutterBorderClass = isHigh ? "border-red-500/30" : "border-amber-500/30";
            gutterTextClass = isHigh ? "text-red-400 font-semibold" : "text-amber-400 font-semibold";
            contentTextClass = isHigh ? "text-red-200" : "text-amber-200";
            prefixElement = (
              <span className="absolute left-[54px] flex items-center z-15 select-none animate-bounce" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                <ShieldAlert className={`h-3 w-3 ${isHigh ? 'text-red-400' : 'text-amber-400'}`} />
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

          const handleRowClick = () => {
            if (showWarningHighlight && highlightRange) {
              setShowFixActionLine(prev => prev === highlightRange.end ? null : highlightRange.end);
            }
          };

          return (
            <React.Fragment key={idx}>
              <div 
                onClick={handleRowClick}
                className={`flex w-full transition-all relative pr-4 ${rowBgClass}`}
              >
                <span className={`text-right w-11 select-none pr-3 border-r ${gutterBorderClass} shrink-0 font-light font-mono ${gutterTextClass} text-[10px]`}>
                  {idx + 1}
                </span>
                {prefixElement}
                <span className={`pl-6 font-mono ${contentTextClass}`}>
                  {highlightText(line, codeSearchQuery)}
                </span>
              </div>
              
              {showFixActionLine === idx && showWarningHighlight && currentFileIssue && (
                <div className="bg-slate-900/90 border border-indigo-500/40 p-4 rounded-xl mx-6 my-3 text-left space-y-3 shadow-xl max-w-2xl select-text leading-normal whitespace-normal">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <Sparkles size={12} className="text-indigo-400 animate-pulse" /> Diagnostics & Proposed Repair
                    </span>
                    <span className="text-[9px] bg-slate-950 text-slate-500 px-2 py-0.5 rounded font-mono">
                      Linia: {highlightRange ? `${highlightRange.start + 1}-${highlightRange.end + 1}` : idx + 1}
                    </span>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">{currentFileIssue.category}</h5>
                    <p className="text-xs text-slate-400 mt-1">
                      {currentFileIssue.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Proponowana poprawka (Proposed Fix)</span>
                    <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[10.5px] text-emerald-400 whitespace-pre overflow-x-auto">
                      {currentFileIssue.newCode}
                    </pre>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {isApplying ? (
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2 bg-indigo-900/60 text-slate-400 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-not-allowed animate-pulse"
                      >
                        <RefreshCw size={12} className="animate-spin text-indigo-400" />
                        Aplikowanie poprawki...
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleApplyFix}
                          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={12} /> Zastosuj Poprawkę (Apply Fix)
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFixActionLine(null)}
                          className="px-3.5 py-2 border border-slate-700 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-medium cursor-pointer"
                        >
                          Anuluj
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </pre>
    </div>
  );
};
