import React, { useState } from "react";
import { Code, Download, Check, Copy, Sparkles, FileCode, Cpu, Layers } from "lucide-react";
import { CodeScopeAnalysis, RefactoringSuggestion } from "../../types";
import { CodeHighlight } from "./SyntaxHighlighter";

interface RefactorAssistantProps {
  activeProject: CodeScopeAnalysis;
  selectedHelperRefactor: RefactoringSuggestion | null;
  setSelectedHelperRefactor: (ref: RefactoringSuggestion | null) => void;
  copyFeedback: string | null;
  setCopyFeedback: (label: string | null) => void;
}

export const RefactorAssistant: React.FC<RefactorAssistantProps> = ({
  activeProject,
  selectedHelperRefactor,
  setSelectedHelperRefactor,
  copyFeedback,
  setCopyFeedback,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<"pattern" | "patch">("pattern");

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Critical": return "bg-red-950/80 text-red-400 border border-red-500/30";
      case "High": return "bg-orange-950/80 text-orange-400 border border-orange-500/30";
      case "Medium": return "bg-amber-950/80 text-amber-400 border border-amber-500/30";
      default: return "bg-slate-950/80 text-slate-400 border border-slate-800";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-white" id="refactor-assistant-view">
      {/* Left recipes list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-slate-950/20 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-left border-b border-slate-800 pb-3">
          <Code className="h-4 w-4 text-indigo-400" />
          <span>Sugestie struktury kodu ({activeProject.refactoring?.length || 0})</span>
        </h4>
        
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {activeProject.refactoring?.map((item, idx) => {
            const isSelected = selectedHelperRefactor?.file === item.file && selectedHelperRefactor?.suggestion === item.suggestion;
            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedHelperRefactor(item);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-indigo-950/20 border-indigo-500/40 shadow-md shadow-indigo-950/15"
                    : "bg-slate-950/40 hover:bg-slate-800/40 border-slate-800 text-slate-350 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[9px] font-bold text-indigo-400 truncate block max-w-[150px]">
                    {item.file.split("/").pop()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${getRiskColor(item.risk)}`}>
                    {item.risk} Risk
                  </span>
                </div>
                <span className={`text-xs font-semibold block line-clamp-1 transition-colors ${isSelected ? "text-indigo-400" : "text-slate-200"}`}>
                  {item.suggestion}
                </span>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/60 text-[9px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-slate-500" />
                    <span>{item.loc} LOC</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-slate-500" />
                    <span>Złożoność: {item.complexity}</span>
                  </span>
                </div>
              </div>
            );
          })}
          {(!activeProject.refactoring || activeProject.refactoring.length === 0) && (
            <div className="text-center py-12 text-slate-500 text-xs font-sans">
              Brak sugerowanych plików do refaktoryzacji.
            </div>
          )}
        </div>
      </div>

      {/* Right patch generator */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-950/20 space-y-5">
        {selectedHelperRefactor ? (
          <>
            {/* Recipe Header */}
            <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-indigo-400 font-mono text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-950/40">
                  Receptura refaktoryzacji
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-2.5">
                  Uprość strukturę w {selectedHelperRefactor.file.split("/").pop()}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <FileCode className="h-3.5 w-3.5 text-slate-500" />
                    <span>Rozmiar pliku:</span>
                    <strong className="text-indigo-300 font-semibold">{selectedHelperRefactor.loc} linii</strong>
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3.5 w-3.5 text-slate-500" />
                    <span>Złożoność:</span>
                    <strong className="text-amber-450 font-semibold">{selectedHelperRefactor.complexity} (skala AST)</strong>
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const patchContent = `diff --git a/${selectedHelperRefactor.file} b/${selectedHelperRefactor.file}
--- a/${selectedHelperRefactor.file}
+++ b/${selectedHelperRefactor.file}
@@ -${Math.max(1, selectedHelperRefactor.loc - 5)},10 +${Math.max(1, selectedHelperRefactor.loc - 5)},12 @@
// Refactoring proposal generated by CodeScope AST Auditor
// Suggestion: ${selectedHelperRefactor.suggestion}
// Benefit: ${selectedHelperRefactor.benefit}
- // Old complex method blocks
+ // Optimized refactored block
+ export function optimizedHelperMethod() {
+   // Deterministic AST pattern applied to resolve excessive nesting
+ }
`;
                  const blob = new Blob([patchContent], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `codescope_refactor_${selectedHelperRefactor.file.split("/").pop()}.patch`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  
                  setCopyFeedback("Patched!");
                  setTimeout(() => setCopyFeedback(null), 2000);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-250 active:scale-95 border border-indigo-500/30 shadow-md shadow-indigo-950/20 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>{copyFeedback === "Patched!" ? "Pobrano patch!" : "Pobierz .patch Git"}</span>
              </button>
            </div>

            {/* Recommendation block */}
            <div className="bg-slate-950 border border-slate-805 rounded-xl p-4.5 text-xs text-slate-350 leading-relaxed font-sans text-left space-y-2.5">
              <h4 className="text-white font-bold flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Analiza statyczna i plan działania</span>
              </h4>
              <p><strong>Zdiagnozowany problem:</strong> {selectedHelperRefactor.suggestion}</p>
              <p className="text-slate-400"><strong>Zysk z optymalizacji:</strong> {selectedHelperRefactor.benefit}</p>
            </div>

            {/* Code Tabs & Action Block */}
            <div className="space-y-3 text-left">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-800 gap-1.5 pb-2">
                <button
                  onClick={() => setActiveCodeTab("pattern")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    activeCodeTab === "pattern"
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Wzorzec Implementacji
                </button>
                <button
                  onClick={() => setActiveCodeTab("patch")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                    activeCodeTab === "patch"
                      ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Podgląd Patcha Git
                </button>

                {/* Right side copy button */}
                <button
                  onClick={() => {
                    const snippet = activeCodeTab === "pattern" 
                      ? `// Optymalizacja modularności kodu\n// Suggestion: ${selectedHelperRefactor.suggestion}\n// Benefit: ${selectedHelperRefactor.benefit}`
                      : `diff --git a/${selectedHelperRefactor.file} b/${selectedHelperRefactor.file}\n--- a/${selectedHelperRefactor.file}\n+++ b/${selectedHelperRefactor.file}\n// Optimized via CodeScope`;
                    navigator.clipboard.writeText(snippet);
                    setCopyFeedback("Snippet!");
                    setTimeout(() => setCopyFeedback(null), 2000);
                  }}
                  className="ml-auto text-slate-500 hover:text-slate-300 flex items-center gap-1 text-[9px] transition-all cursor-pointer font-semibold font-mono"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copyFeedback === "Snippet!" ? "Skopiowano!" : "Skopiuj kod"}</span>
                </button>
              </div>

              {/* Code Preview Panels */}
              <div className="bg-slate-950 border border-slate-805 rounded-xl overflow-hidden shadow-lg">
                {activeCodeTab === "pattern" ? (
                  <CodeHighlight
                    code={`// 1. Rozbij duży moduł na mniejsze funkcje pomocnicze
// 2. Wyciągnij typy i interfejsy do osobnego pliku (np. types.ts)
// 3. Usuń nadmiarowe zagnieżdżone instrukcje warunkowe za pomocą klauzul guard:

function checkProcess(req: Request) {
  if (!req.body) return false;
  if (!req.params.id) return false;
  
  // Poprawna deterministyczna logika wywołań
  return processRequest(req);
}`}
                    language="typescript"
                    className="border-0 rounded-none max-h-[320px]"
                  />
                ) : (
                  <CodeHighlight
                    code={`diff --git a/${selectedHelperRefactor.file} b/${selectedHelperRefactor.file}
--- a/${selectedHelperRefactor.file}
+++ b/${selectedHelperRefactor.file}
@@ -${Math.max(1, selectedHelperRefactor.loc - 5)},10 +${Math.max(1, selectedHelperRefactor.loc - 5)},12 @@
 // Proposal: ${selectedHelperRefactor.suggestion}
 // Benefit: ${selectedHelperRefactor.benefit}
- // Old complex method blocks that trigger AST warnings
+ // Optimized refactored block using guard clauses
+ export function optimizedHelperMethod() {
+   // Deterministic AST pattern applied to resolve excessive nesting
+ }`}
                    language="typescript"
                    isDiff={true}
                    className="border-0 rounded-none max-h-[320px]"
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-24 text-slate-500 text-xs flex flex-col items-center justify-center font-sans">
            <Code className="h-10 w-10 text-slate-700 mb-3" />
            <span>Wybierz sugestię refaktoryzacji po lewej stronie, aby wyświetlić przepis poprawy.</span>
          </div>
        )}
      </div>
    </div>
  );
};
