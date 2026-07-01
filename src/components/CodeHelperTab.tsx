import React from "react";
import { Cpu, ShieldAlert, Code } from "lucide-react";
import { CodeScopeAnalysis, SecurityIssue, RefactoringSuggestion } from "../types";
import { SecurityAssistant } from "./helper/SecurityAssistant";
import { RefactorAssistant } from "./helper/RefactorAssistant";
import { PatchViewer } from "./helper/PatchViewer";

interface CodeHelperTabProps {
  activeProject: CodeScopeAnalysis;
  helperSubTab: string;
  setHelperSubTab: (tab: string) => void;
  selectedHelperSecurity: SecurityIssue | null;
  setSelectedHelperSecurity: (issue: SecurityIssue | null) => void;
  selectedHelperRefactor: RefactoringSuggestion | null;
  setSelectedHelperRefactor: (ref: RefactoringSuggestion | null) => void;
  helperSearchQuery: string;
  setHelperSearchQuery: (query: string) => void;
  simulatedDiffApplied: boolean;
  setSimulatedDiffApplied: (applied: boolean) => void;
  copyFeedback: string | null;
  setCopyFeedback: (label: string | null) => void;
  onFixIssue: (filePath: string, oldCode: string, newCode: string) => Promise<void>;
}

export const CodeHelperTab: React.FC<CodeHelperTabProps> = ({
  activeProject,
  helperSubTab,
  setHelperSubTab,
  selectedHelperSecurity,
  setSelectedHelperSecurity,
  selectedHelperRefactor,
  setSelectedHelperRefactor,
  helperSearchQuery,
  setHelperSearchQuery,
  simulatedDiffApplied,
  setSimulatedDiffApplied,
  copyFeedback,
  setCopyFeedback,
  onFixIssue,
}) => {
  return (
    <div className="space-y-6 font-sans text-white" id="code-helper-tab-view">
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

      {/* Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-slate-950/30">
        {/* Glow ambient spots */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-left">
            <div className="bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 p-3 rounded-2xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Cpu className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Interactive Code Helper & AST Auditor
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xl leading-relaxed">
                Zautomatyzowane, w 100% deterministyczne środowisko analizy statycznej kodu. Badaj i eliminuj luki bezpieczeństwa, generuj gotowe patche refaktoryzacyjne i eksploruj strukturę klas oraz interfejsów bez używania modeli AI.
              </p>
            </div>
          </div>
          
          {/* Stats Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-2xl text-center shadow-inner min-w-[110px]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Zagrożenia</span>
              <strong className="text-red-400 font-mono text-lg block mt-0.5">{activeProject.security?.length || 0}</strong>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-2xl text-center shadow-inner min-w-[110px]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Refaktoryzacja</span>
              <strong className="text-indigo-400 font-mono text-lg block mt-0.5">{activeProject.refactoring?.length || 0}</strong>
            </div>
          </div>
        </div>

        {/* Sub-tabs selector bar */}
        <div className="bg-slate-950/50 border border-slate-850 p-1 rounded-2xl flex gap-1.5 mt-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setHelperSubTab("security-fixes");
              setSelectedHelperSecurity(activeProject.security?.[0] || null);
            }}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 shrink-0 cursor-pointer border ${
              helperSubTab === "security-fixes"
                ? "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
                : "text-slate-450 hover:text-slate-200 border-transparent hover:bg-slate-850/40"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Audytor Zabezpieczeń & Poprawek</span>
          </button>
          <button
            onClick={() => {
              setHelperSubTab("refactor-recipes");
              setSelectedHelperRefactor(activeProject.refactoring?.[0] || null);
            }}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 shrink-0 cursor-pointer border ${
              helperSubTab === "refactor-recipes"
                ? "bg-indigo-500/10 text-indigo-450 border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.1)]"
                : "text-slate-450 hover:text-slate-200 border-transparent hover:bg-slate-850/40"
            }`}
          >
            <Code className="h-4 w-4" />
            <span>Kreator Patchy Refaktoryzacji</span>
          </button>
          <button
            onClick={() => {
              setHelperSubTab("ast-explorer");
            }}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 shrink-0 cursor-pointer border ${
              helperSubTab === "ast-explorer"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                : "text-slate-450 hover:text-slate-200 border-transparent hover:bg-slate-850/40"
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>Eksplorator Struktur AST</span>
          </button>
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="transition-all duration-300">
        {helperSubTab === "security-fixes" && (
          <SecurityAssistant
            activeProject={activeProject}
            selectedHelperSecurity={selectedHelperSecurity}
            setSelectedHelperSecurity={setSelectedHelperSecurity}
            simulatedDiffApplied={simulatedDiffApplied}
            setSimulatedDiffApplied={setSimulatedDiffApplied}
            onFixIssue={onFixIssue}
          />
        )}

        {helperSubTab === "refactor-recipes" && (
          <RefactorAssistant
            activeProject={activeProject}
            selectedHelperRefactor={selectedHelperRefactor}
            setSelectedHelperRefactor={setSelectedHelperRefactor}
            copyFeedback={copyFeedback}
            setCopyFeedback={setCopyFeedback}
          />
        )}

        {helperSubTab === "ast-explorer" && (
          <PatchViewer
            activeProject={activeProject}
            helperSearchQuery={helperSearchQuery}
            setHelperSearchQuery={setHelperSearchQuery}
          />
        )}
      </div>
    </div>
  );
};
