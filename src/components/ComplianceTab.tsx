import React, { useState } from "react";
import { 
  Check, 
  ShieldAlert, 
  AlertCircle, 
  Info, 
  Sparkles, 
  Shield, 
  ShieldCheck, 
  Scale, 
  Globe, 
  Lock, 
  CreditCard, 
  Terminal, 
  ChevronRight, 
  CheckCircle2, 
  PlayCircle, 
  FileCode 
} from "lucide-react";
import { CodeScopeAnalysis, ComplianceIssue } from "../types";

interface ComplianceTabProps {
  activeProject: CodeScopeAnalysis;
}

export const ComplianceTab: React.FC<ComplianceTabProps> = ({ activeProject }) => {
  const [selectedIssue, setSelectedIssue] = useState<ComplianceIssue | null>(
    activeProject.compliance?.[0] || null
  );
  const [remediated, setRemediated] = useState<Record<string, boolean>>({});

  const handleRemediate = (category: string) => {
    setRemediated(prev => ({ ...prev, [category]: true }));
  };

  const issues = activeProject.compliance || [];

  const hasGdpr = issues.some(i => i.category.includes("GDPR"));
  const hasPci = issues.some(i => i.category.includes("PCI"));
  const hasGpl = issues.some(i => i.category.includes("GPL"));
  const hasIp = issues.some(i => i.category.includes("IP"));

  return (
    <div className="space-y-6 text-left" id="compliance-tab-view">
      {/* Premium UI Polish Status Header */}
      <div className="flex justify-between items-center bg-slate-900/35 border border-slate-800/80 px-4 py-2.5 rounded-xl mb-4 hover:scale-[1.002] transition-transform duration-300">
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-sans">Module: AST-Inferred Source Intelligence</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] bg-slate-950 text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-850 select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          AI Oracle Connected
        </div>
      </div>

      {/* Premium Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900/60 to-slate-950/60 border border-slate-800/80 rounded-2xl p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Shield className="h-4.5 w-4.5 animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-100 font-sans">
                GDPR & License Compliance Auditor
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl font-sans leading-relaxed">
              Scans database configurations, variables naming conventions, and package lists for GDPR, PCI-DSS, and Viral License leaks.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-2.5 py-1 rounded-md">
              v1.4.2-compliance
            </span>
          </div>
        </div>
      </div>

      {/* Compliance Checklist Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: GDPR */}
        <div className="relative group overflow-hidden bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between h-[110px] transition-all duration-300 hover:border-slate-700/60 hover:bg-slate-900/50">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-450 uppercase tracking-wider font-semibold font-mono block">GDPR Status</span>
              <span className="text-[9px] text-slate-500 font-sans block">PII leakage checks</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-850 text-slate-400 group-hover:text-indigo-400 transition-colors">
              <Lock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            {hasGdpr ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-red-950/40 text-red-400 border border-red-900/40 px-2 py-0.5 rounded-md shadow-[0_0_12px_rgba(239,68,68,0.06)]">
                <ShieldAlert className="h-3 w-3" /> VIOLATION
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-md shadow-[0_0_12px_rgba(16,185,129,0.06)]">
                <Check className="h-3 w-3" /> SECURE
              </span>
            )}
            <span className="text-[9px] font-mono text-slate-500">Scope: DB/PII</span>
          </div>
        </div>

        {/* Card 2: PCI-DSS */}
        <div className="relative group overflow-hidden bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between h-[110px] transition-all duration-300 hover:border-slate-700/60 hover:bg-slate-900/50">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-450 uppercase tracking-wider font-semibold font-mono block">PCI-DSS Status</span>
              <span className="text-[9px] text-slate-500 font-sans block">Cardholder credentials</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-850 text-slate-400 group-hover:text-indigo-400 transition-colors">
              <CreditCard className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            {hasPci ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-red-950/40 text-red-400 border border-red-900/40 px-2 py-0.5 rounded-md shadow-[0_0_12px_rgba(239,68,68,0.06)]">
                <ShieldAlert className="h-3 w-3" /> VIOLATION
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-md shadow-[0_0_12px_rgba(16,185,129,0.06)]">
                <Check className="h-3 w-3" /> SECURE
              </span>
            )}
            <span className="text-[9px] font-mono text-slate-500">Scope: Variables</span>
          </div>
        </div>

        {/* Card 3: License Audit */}
        <div className="relative group overflow-hidden bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between h-[110px] transition-all duration-300 hover:border-slate-700/60 hover:bg-slate-900/50">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-450 uppercase tracking-wider font-semibold font-mono block">License Audit</span>
              <span className="text-[9px] text-slate-500 font-sans block">Viral copyleft licenses</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-850 text-slate-400 group-hover:text-indigo-400 transition-colors">
              <Scale className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            {hasGpl ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-950/40 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded-md shadow-[0_0_12px_rgba(245,158,11,0.06)]">
                <AlertCircle className="h-3 w-3" /> WARNING
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-md shadow-[0_0_12px_rgba(16,185,129,0.06)]">
                <Check className="h-3 w-3" /> SECURE
              </span>
            )}
            <span className="text-[9px] font-mono text-slate-500">Scope: Packages</span>
          </div>
        </div>

        {/* Card 4: IP Disclosures */}
        <div className="relative group overflow-hidden bg-slate-900/30 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between h-[110px] transition-all duration-300 hover:border-slate-700/60 hover:bg-slate-900/50">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-455 uppercase tracking-wider font-semibold font-mono block">IP Disclosures</span>
              <span className="text-[9px] text-slate-500 font-sans block">Hardcoded host IPs</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-850 text-slate-400 group-hover:text-indigo-400 transition-colors">
              <Globe className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            {hasIp ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-red-950/40 text-red-400 border border-red-900/40 px-2 py-0.5 rounded-md shadow-[0_0_12px_rgba(239,68,68,0.06)]">
                <ShieldAlert className="h-3 w-3" /> VIOLATION
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-md shadow-[0_0_12px_rgba(16,185,129,0.06)]">
                <Check className="h-3 w-3" /> SECURE
              </span>
            )}
            <span className="text-[9px] font-mono text-slate-500">Scope: AST scan</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of violations */}
        <div className="space-y-3 lg:col-span-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest font-mono block">
              Compliance Anomaly Log
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {issues.length} Issues Detected
            </span>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
            {issues.map((issue, idx) => {
              const isSelected = selectedIssue?.category === issue.category;
              const isDone = remediated[issue.category];

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedIssue(issue)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-250 flex flex-col gap-2.5 cursor-pointer relative group ${
                    isSelected
                      ? "bg-indigo-950/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20"
                      : "bg-[#141417]/40 hover:bg-[#141417]/80 border-slate-800/80 hover:border-slate-700/60"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span
                      className={`text-[9px] font-mono font-bold border px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isDone
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50"
                          : issue.severity === "Critical"
                          ? "bg-red-950/40 text-red-400 border-red-900/50"
                          : "bg-amber-950/40 text-amber-400 border-amber-900/50"
                      }`}
                    >
                      {isDone ? "Remediated" : issue.severity}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 bg-slate-900/60 border border-slate-800/85 px-1.5 py-0.5 rounded">
                      Line {issue.line || "1"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4
                      className={`text-xs font-bold font-sans tracking-tight ${
                        isDone
                          ? "text-slate-500 line-through"
                          : "text-slate-200 group-hover:text-indigo-300 transition-colors"
                      }`}
                    >
                      {issue.category}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-sans line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-t border-slate-800/50 pt-2.5 mt-0.5 font-sans">
                    <span className="truncate max-w-[190px] font-mono text-slate-500 flex items-center gap-1">
                      <FileCode className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                      {issue.file.split('/').pop()}
                    </span>
                    <span
                      className={`font-semibold flex items-center gap-0.5 transition-colors ${
                        isDone ? "text-emerald-400" : "text-indigo-400 group-hover:text-indigo-300"
                      }`}
                    >
                      {isDone ? (
                        <>
                          <Check className="h-3 w-3" /> Patched
                        </>
                      ) : (
                        <>
                          Review <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {issues.length === 0 && (
            <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-350 p-8 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">All Checks Passed</h4>
                <p className="text-xs text-slate-400 mt-1">No compliance anomalies or copyleft licensing issues were identified.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Detail comparison */}
        <div className="lg:col-span-7">
          {selectedIssue ? (
            <div className="bg-[#141417]/50 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-5 relative overflow-hidden">
              {/* Subtle decorative glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />

              {/* Detail Header */}
              <div className="border-b border-slate-800/80 pb-4 flex justify-between items-center">
                <div className="flex items-center gap-2.5 text-left">
                  <div className={`p-1.5 rounded-lg border ${
                    remediated[selectedIssue.category]
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50"
                      : selectedIssue.severity === "Critical"
                      ? "bg-red-950/40 text-red-400 border-red-900/50"
                      : "bg-amber-950/40 text-amber-400 border-amber-900/50"
                  }`}>
                    {remediated[selectedIssue.category] ? (
                      <ShieldCheck className="h-4.5 w-4.5" />
                    ) : (
                      <ShieldAlert className="h-4.5 w-4.5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 font-sans tracking-wide">
                      {selectedIssue.category}
                    </h4>
                    <span className="text-[9px] text-slate-500 font-mono">
                      Severity Rating: {selectedIssue.severity}
                    </span>
                  </div>
                </div>
                <span className="bg-indigo-950/40 border border-indigo-900/50 text-indigo-400 text-[9px] font-mono px-2.5 py-1 rounded-md shadow-[0_0_10px_rgba(99,102,241,0.05)]">
                  AST Match Diff
                </span>
              </div>

              {/* Location Info Card */}
              <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest block">
                    File Location & Scope
                  </span>
                  <span className="text-[9px] text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded font-mono">
                    Line {selectedIssue.line || "1"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-200 text-xs font-mono break-all">
                  <Terminal className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  {selectedIssue.file}
                </div>
              </div>

              {/* Description box */}
              <div className="text-xs text-slate-300 bg-slate-900/20 border border-slate-850/60 p-4 rounded-xl space-y-1.5">
                <span className="text-[9px] text-slate-450 uppercase font-mono tracking-widest block font-bold">
                  Description & Anomaly Signature
                </span>
                <p className="leading-relaxed font-sans">{selectedIssue.description}</p>
              </div>

              {/* AST Code Snippet Comparison */}
              <div className="space-y-4 text-left">
                {selectedIssue.oldCode && (
                  <div className="border border-red-900/30 rounded-lg overflow-hidden bg-red-950/5">
                    <div className="bg-red-950/20 border-b border-red-900/20 px-3 py-2 flex justify-between items-center text-[10px] text-red-455 font-mono tracking-wider">
                      <span className="font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-ping" />
                        NON-COMPLIANT PATTERN
                      </span>
                      <span className="bg-red-950/60 border border-red-900/40 px-1.5 py-0.5 rounded text-[9px] text-red-450 font-bold">- REMOVE</span>
                    </div>
                    <pre className="font-mono text-[11px] p-4 text-red-300/90 overflow-x-auto leading-relaxed bg-red-950/5 select-all">
                      <code>{selectedIssue.oldCode}</code>
                    </pre>
                  </div>
                )}

                {selectedIssue.newCode && (
                  <div className="border border-emerald-900/30 rounded-lg overflow-hidden bg-emerald-950/5">
                    <div className="bg-emerald-950/20 border-b border-emerald-900/20 px-3 py-2 flex justify-between items-center text-[10px] text-emerald-455 font-mono tracking-wider">
                      <span className="font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        REMEDIATED COMPLIANT CODE
                      </span>
                      <span className="bg-emerald-950/60 border border-emerald-900/40 px-1.5 py-0.5 rounded text-[9px] text-emerald-450 font-bold">+ APPLY</span>
                    </div>
                    <pre className="font-mono text-[11px] p-4 text-emerald-300/90 overflow-x-auto leading-relaxed bg-emerald-950/5 select-all">
                      <code>{selectedIssue.newCode}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Solution Card with Sparkles */}
              <div className="bg-indigo-950/10 border border-indigo-900/20 p-4 rounded-xl text-xs text-slate-350 flex gap-3 items-start">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shrink-0 text-indigo-400 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block font-mono">
                    Compliance Fix Action
                  </span>
                  <p className="leading-relaxed font-sans text-slate-400">{selectedIssue.solution}</p>
                </div>
              </div>

              {/* Action Remediation button */}
              <div className="pt-2">
                {remediated[selectedIssue.category] ? (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0 animate-pulse" />
                    Compliance Patch Applied Successfully!
                  </div>
                ) : (
                  <button
                    onClick={() => handleRemediate(selectedIssue.category)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-450 active:scale-[0.99] text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer font-sans shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.35)] border border-indigo-455/20"
                  >
                    <PlayCircle className="h-4.5 w-4.5 text-indigo-200" />
                    Apply Compliance Patch
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#141417]/20 border border-dashed border-slate-800/80 text-slate-500 text-xs text-center flex flex-col justify-center items-center p-8 rounded-2xl h-80 lg:col-span-1 space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-900/40 border border-slate-800/85 flex items-center justify-center text-slate-400">
                <Info className="h-5 w-5" />
              </div>
              <div className="space-y-1 max-w-[280px]">
                <h4 className="text-xs font-semibold text-slate-350">No Anomaly Selected</h4>
                <p className="text-[11px] text-slate-455 leading-normal">
                  Select a compliance issue from the log on the left to inspect signature pattern, AST diffs, and remediation steps.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
