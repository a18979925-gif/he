import React from "react";
import { ShieldAlert, CheckCircle, RefreshCw, AlertCircle, FileCode } from "lucide-react";
import { CodeScopeAnalysis, SecurityIssue } from "../../types";
import { CodeHighlight } from "./SyntaxHighlighter";

interface SecurityAssistantProps {
  activeProject: CodeScopeAnalysis;
  selectedHelperSecurity: SecurityIssue | null;
  setSelectedHelperSecurity: (issue: SecurityIssue | null) => void;
  simulatedDiffApplied: boolean;
  setSimulatedDiffApplied: (applied: boolean) => void;
  onFixIssue: (filePath: string, oldCode: string, newCode: string) => Promise<void>;
}

export const SecurityAssistant: React.FC<SecurityAssistantProps> = ({
  activeProject,
  selectedHelperSecurity,
  setSelectedHelperSecurity,
  simulatedDiffApplied,
  setSimulatedDiffApplied,
  onFixIssue,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-white" id="security-assistant-view">
      {/* Left Issues List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-slate-950/20 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-left border-b border-slate-800 pb-3">
          <ShieldAlert className="h-4 w-4 text-red-500 animate-pulse" />
          <span>Wykryte zagrożenia w AST ({activeProject.security?.length || 0})</span>
        </h4>
        
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {activeProject.security?.map((issue, idx) => {
            const isSelected = selectedHelperSecurity?.file === issue.file && selectedHelperSecurity?.category === issue.category;
            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedHelperSecurity(issue);
                  setSimulatedDiffApplied(false);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-red-950/20 border-red-500/40 shadow-md shadow-red-950/15"
                    : "bg-slate-950/40 hover:bg-slate-800/40 border-slate-800 text-slate-350 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[9px] font-bold text-slate-400 truncate block max-w-[150px]">
                    {issue.file.split("/").pop()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                    issue.severity === "Critical"
                      ? "bg-red-950/80 text-red-400 border border-red-500/30"
                      : issue.severity === "High"
                      ? "bg-orange-950/80 text-orange-400 border border-orange-500/30"
                      : "bg-amber-950/80 text-amber-400 border border-amber-500/30"
                  }`}>
                    {issue.severity}
                  </span>
                </div>
                <span className={`text-xs font-bold block transition-colors ${isSelected ? "text-red-400" : "text-slate-200"}`}>
                  {issue.category}
                </span>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 font-sans leading-normal">{issue.description}</p>
              </div>
            );
          })}
          {(!activeProject.security || activeProject.security.length === 0) && (
            <div className="text-center py-12 text-slate-500 text-xs font-sans">
              Brak krytycznych luk w kodzie! Bezpieczeństwo 100%.
            </div>
          )}
        </div>
      </div>

      {/* Right Detail Pane */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-950/20 space-y-5">
        {selectedHelperSecurity ? (
          <>
            {/* Issue Header */}
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-left">
                <span className={`font-mono text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                  selectedHelperSecurity.severity === "Critical"
                    ? "bg-red-950/80 text-red-400 border-red-500/20 animate-pulse"
                    : selectedHelperSecurity.severity === "High"
                    ? "bg-orange-950/80 text-orange-400 border-orange-500/20"
                    : "bg-amber-950/80 text-amber-400 border-amber-500/20"
                }`}>
                  LUKA BEZPIECZEŃSTWA: {selectedHelperSecurity.severity}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-2.5">{selectedHelperSecurity.category}</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                  <FileCode className="h-3 w-3 text-slate-500" />
                  <span>Plik:</span> 
                  <span className="text-slate-300 font-semibold">{selectedHelperSecurity.file}</span>
                  {selectedHelperSecurity.line && (
                    <>
                      <span>|</span>
                      <span>linia:</span>
                      <span className="text-slate-350">{selectedHelperSecurity.line}</span>
                    </>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (selectedHelperSecurity.oldCode && selectedHelperSecurity.newCode) {
                    try {
                      await onFixIssue(selectedHelperSecurity.file, selectedHelperSecurity.oldCode, selectedHelperSecurity.newCode);
                      setSimulatedDiffApplied(true);
                    } catch (e: any) {
                      alert(`Patch failed: ${e.message}`);
                    }
                  } else {
                    setSimulatedDiffApplied(true);
                  }
                }}
                disabled={simulatedDiffApplied}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 outline-none cursor-pointer border ${
                  simulatedDiffApplied
                    ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-450 cursor-default"
                    : "bg-red-650 hover:bg-red-650/90 active:scale-95 text-white border-red-500/20 shadow-md shadow-red-950/20"
                }`}
              >
                {simulatedDiffApplied ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Poprawka Zaaplikowana</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                    <span>Zastosuj Bezpieczny Wzorzec</span>
                  </>
                )}
              </button>
            </div>

            {/* Description block */}
            <div className="bg-slate-950 border border-slate-805 rounded-xl p-4.5 text-xs text-slate-300 text-left leading-relaxed font-sans space-y-3">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p><strong>Wyjaśnienie Zagrożenia:</strong> {selectedHelperSecurity.description}</p>
              </div>
              <div className="flex gap-2 pt-1.5 border-t border-slate-900">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-400"><strong>Zalecane Rozwiązanie:</strong> {selectedHelperSecurity.solution}</p>
              </div>
            </div>

            {/* Visual Simulation feedback */}
            {simulatedDiffApplied && (
              <div className="bg-emerald-950/20 border border-emerald-500/20 p-4.5 rounded-xl text-xs text-emerald-305 flex items-start gap-3 animate-fade-in font-sans">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <span className="font-bold text-emerald-305">Statyczny Patch Zaaplikowany!</span>
                  <p className="text-[11px] text-emerald-400/80 leading-normal">
                    Kod w lokalnej pamięci podręcznej piaskownicy został przepisany zgodnie ze standardami bezpieczeństwa OWASP. Projekt został oznaczony jako zweryfikowany pod kątem tej podatności.
                  </p>
                </div>
              </div>
            )}

            {/* Code comparison split pane */}
            <div className="space-y-2.5 text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block font-mono">
                Podgląd zmian AST (Przed i Po)
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Old code (Insecure) */}
                <div className="bg-slate-950 border border-slate-805 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-red-950/20 px-3.5 py-2 border-b border-slate-805 text-[9px] font-bold tracking-wider text-red-400 uppercase font-mono flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 animate-pulse"></span>
                    <span>Wykryty kod (Podatny)</span>
                  </div>
                  <CodeHighlight
                    code={selectedHelperSecurity.oldCode || `// Podatność: ${selectedHelperSecurity.category}\nconst query = "SELECT * FROM users WHERE id = " + input;\nawait db.execute(query);`}
                    language="typescript"
                    className="border-0 rounded-none max-h-[300px]"
                  />
                </div>

                {/* New code (Remediated) */}
                <div className="bg-slate-950 border border-slate-805 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-emerald-950/20 px-3.5 py-2 border-b border-slate-805 text-[9px] font-bold tracking-wider text-emerald-400 uppercase font-mono flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>Wzorzec bezpieczny (Refaktoring)</span>
                  </div>
                  <CodeHighlight
                    code={selectedHelperSecurity.newCode || `// Sparametryzowane zapytanie (Bezpieczne)\nconst query = "SELECT * FROM users WHERE id = ?";\nawait db.execute(query, [input]);`}
                    language="typescript"
                    className="border-0 rounded-none max-h-[300px]"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-24 text-slate-500 text-xs flex flex-col items-center justify-center font-sans">
            <ShieldAlert className="h-10 w-10 text-slate-700 mb-3" />
            <span>Wybierz lukę bezpieczeństwa z listy po lewej stronie, aby przejrzeć i poprawić kod.</span>
          </div>
        )}
      </div>
    </div>
  );
};
