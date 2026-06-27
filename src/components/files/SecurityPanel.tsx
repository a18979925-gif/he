import React from "react";
import { AlertTriangle, ShieldAlert, CheckCircle, EyeOff, Eye, RotateCcw, ShieldCheck } from "lucide-react";
import { SecurityIssue } from "../../types";

interface SecurityPanelProps {
  selectedFile: string;
  currentFileIssue: SecurityIssue | null;
  isFixApplied: boolean;
  isDiffActive: boolean;
  setAppliedSecurityFixes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setDiffViewActive: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({
  selectedFile,
  currentFileIssue,
  isFixApplied,
  isDiffActive,
  setAppliedSecurityFixes,
  setDiffViewActive,
}) => {
  if (!selectedFile || !currentFileIssue) return null;

  const isHighSeverity = currentFileIssue.severity.toLowerCase() === 'high';

  return !isFixApplied ? (
    <div className={`mx-4 mt-4 bg-slate-900 border ${
      isHighSeverity 
        ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
        : 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
      } p-4 rounded-xl text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans animate-fade-in relative overflow-hidden group`}>
      
      {/* Decorative accent background line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isHighSeverity ? 'bg-red-500' : 'bg-amber-500'}`} />

      <div className="flex items-start gap-3">
        <AlertTriangle className={`h-5 w-5 ${isHighSeverity ? 'text-red-400' : 'text-amber-400'} shrink-0 mt-0.5 animate-pulse`} />
        <div className="space-y-1 text-left">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-bold text-slate-105">AST Auditor: {currentFileIssue.category} Detected</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono tracking-wider border ${
              isHighSeverity 
                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {currentFileIssue.severity} Severity
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
            {currentFileIssue.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <button
          onClick={() => {
            setAppliedSecurityFixes(prev => ({ ...prev, [selectedFile]: true }));
            setDiffViewActive(prev => ({ ...prev, [selectedFile]: true }));
          }}
          className={`font-semibold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer text-white ${
            isHighSeverity 
              ? 'bg-red-650 hover:bg-red-550 hover:shadow-red-600/10' 
              : 'bg-amber-600 hover:bg-amber-500 hover:shadow-amber-500/10'
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Apply Remediation
        </button>
      </div>
    </div>
  ) : (
    <div className="mx-4 mt-4 bg-slate-900 border border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.05)] p-4 rounded-xl text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans animate-fade-in relative overflow-hidden group">
      
      {/* Decorative accent background line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />

      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-left">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-bold text-slate-105">Security Fix Applied Successfully</span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono tracking-wider">
              OWASP REMEDIATED
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
            The vulnerability has been patched in-memory using AST rewrites. All SQL execution profiles and external references are now fully parameterized and sanitized.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto font-sans">
        <button
          onClick={() => {
            setDiffViewActive(prev => ({ ...prev, [selectedFile]: !prev[selectedFile] }));
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/10 active:scale-95 cursor-pointer"
        >
          {isDiffActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {isDiffActive ? "Hide Diff" : "View Diff"}
        </button>
        <button
          onClick={() => {
            setAppliedSecurityFixes(prev => ({ ...prev, [selectedFile]: false }));
            setDiffViewActive(prev => ({ ...prev, [selectedFile]: false }));
          }}
          className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold px-3.5 py-2 rounded-lg text-xs transition-all flex items-center gap-1 border border-slate-800 active:scale-95 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400 animate-spin-once" />
          Revert
        </button>
      </div>
    </div>
  );
};
