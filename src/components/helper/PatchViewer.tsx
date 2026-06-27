import React, { useState } from "react";
import { 
  Activity, 
  AlertTriangle, 
  Cpu, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Terminal, 
  Database, 
  FileCode, 
  Network, 
  ArrowRight,
  Sparkles,
  BookOpen
} from "lucide-react";
import { CodeScopeAnalysis } from "../../types";

interface PatchViewerProps {
  activeProject: CodeScopeAnalysis;
  helperSearchQuery: string;
  setHelperSearchQuery: (query: string) => void;
}

export const PatchViewer: React.FC<PatchViewerProps> = ({
  activeProject,
  helperSearchQuery,
  setHelperSearchQuery,
}) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const toggleModule = (name: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Get color for HTTP method
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET": return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "POST": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "PUT": return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "DELETE": return "bg-red-500/10 text-red-400 border border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const coupling = activeProject.importAnalysis?.packageCouplingScore || 0;
  
  // Decide coupling risk colors
  const couplingColor = coupling < 40 ? "text-emerald-400" : coupling < 70 ? "text-amber-400" : "text-red-400";
  const couplingBarColor = coupling < 40 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : coupling < 70 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
  const couplingBg = coupling < 40 ? "bg-emerald-500/10" : coupling < 70 ? "bg-amber-500/10" : "bg-red-500/10";
  const couplingBorder = coupling < 40 ? "border-emerald-500/20" : coupling < 70 ? "border-amber-500/20" : "border-red-500/20";

  // Filter modules based on query
  const filteredModules = activeProject.modules?.filter(mod => {
    if (!helperSearchQuery) return true;
    const query = helperSearchQuery.toLowerCase();
    return (
      mod.name.toLowerCase().includes(query) ||
      mod.type.toLowerCase().includes(query) ||
      mod.classes?.some(c => c.toLowerCase().includes(query)) ||
      mod.interfaces?.some(i => i.toLowerCase().includes(query)) ||
      mod.entities?.some(e => e.toLowerCase().includes(query)) ||
      mod.endpoints?.some(ep => ep.toLowerCase().includes(query))
    );
  }) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans text-white" id="patch-viewer-ast-panel">
      {/* Left Side: Search & Stats */}
      <div className="space-y-5">
        {/* Metrics Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-slate-950/20 space-y-5">
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-left border-b border-slate-805 pb-3">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span>Metryki Zależności Projektu</span>
          </h4>
          
          <div className="space-y-5 text-xs text-slate-350 font-sans text-left">
            {/* Coupling Score Meter */}
            <div className={`p-4 rounded-xl border ${couplingBg} ${couplingBorder} space-y-2`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-300">Coupling Score:</span>
                <strong className={`font-mono text-sm px-2 py-0.5 rounded ${couplingColor}`}>
                  {coupling} / 100
                </strong>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${couplingBarColor}`}
                  style={{ width: `${coupling}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal mt-1 font-sans">
                Współczynnik sprzężenia modułów. Im niższy, tym łatwiejsze utrzymanie i rozbudowa systemu.
              </p>
            </div>

            {/* Circular Dependencies Info */}
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
              <span className="text-slate-400">Circular Dependencies:</span>
              <strong className={`font-mono px-2 py-0.5 rounded text-[11px] ${
                activeProject.importAnalysis?.circularDependencies && activeProject.importAnalysis?.circularDependencies?.length > 0
                  ? "text-red-400 bg-red-950/30 border border-red-500/20"
                  : "text-emerald-400 bg-emerald-950/30 border border-emerald-500/20"
              }`}>
                {activeProject.importAnalysis?.circularDependencies?.length || 0} wykrytych
              </strong>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <span className="text-slate-400 block">Użyte Technologie:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeProject.projectDNA?.languages?.map((lang, lIdx) => (
                  <span 
                    key={lIdx} 
                    className="text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    {lang.name} ({lang.percentage}%)
                  </span>
                )) || (
                  <span className="text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300 px-2 py-1 rounded-md">
                    TypeScript
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Decoupling Tips */}
          <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl text-[11px] leading-relaxed text-slate-400 text-left space-y-2.5 font-sans relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Jak obniżyć Coupling Score?</span>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="text-emerald-400 font-mono">1.</span>
                <p><strong>Dependency Inversion:</strong> Wstrzykuj zależności przez interfejsy zamiast twardych importów klas.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-400 font-mono">2.</span>
                <p><strong>Shared Types:</strong> Przenieś współdzielone interfejsy i enumy do dedykowanego pliku types.ts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Circular Dependencies Info Box */}
        {activeProject.importAnalysis?.circularDependencies && activeProject.importAnalysis?.circularDependencies?.length > 0 && (
          <div className="bg-red-950/20 border border-red-900/40 p-5 rounded-2xl shadow-lg space-y-3 text-left">
            <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>Zapętlenia importów (Circular)</span>
            </h5>
            <p className="text-[11px] text-red-300 font-sans leading-relaxed">
              Wykryto zapętlone referencje między modułami, które mogą powodować błędy inicjalizacji w czasie wykonania:
            </p>
            <div className="bg-slate-950 border border-red-900/20 p-3 rounded-xl text-[10px] font-mono text-red-400 space-y-1.5">
              {activeProject.importAnalysis.circularDependencies.map((cycle, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-red-500 rounded-full shrink-0"></span>
                  <span className="truncate block max-w-full font-mono">{cycle}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Interactive AST modules tree */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-950/20 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="text-left">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <span>Drzewo Modułów AST</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 font-sans">Eksploruj rzeczywiste deklaracje, klasy, interfejsy i routing wyodrębnione z AST.</p>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={helperSearchQuery}
              onChange={(e) => setHelperSearchQuery(e.target.value)}
              placeholder="Filtruj klasy i funkcje..."
              className="pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-805 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all w-full font-sans"
            />
          </div>
        </div>

        {/* Modules tree list */}
        <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {filteredModules.map((mod, idx) => {
            const isExpanded = expandedModules[mod.name] || false;
            return (
              <div 
                key={idx} 
                className={`bg-slate-950/40 rounded-xl border transition-all duration-300 ${
                  isExpanded ? "border-emerald-500/30 bg-slate-950/70" : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
                }`}
              >
                {/* Module Header Bar */}
                <div 
                  onClick={() => toggleModule(mod.name)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-slate-550 hover:text-white transition-colors">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-emerald-400 animate-fade-in" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <Terminal className="h-4 w-4 text-indigo-400 shrink-0" />
                      <strong className="text-xs font-bold text-slate-200 font-mono truncate">{mod.name}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[9px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      {mod.type}
                    </span>
                  </div>
                </div>

                {/* Module Details (Accordion Panel) */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-left">
                    
                    {/* Left: Classes and Interfaces */}
                    <div className="space-y-3">
                      {/* Classes list */}
                      <div>
                        <span className="font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">
                          <FileCode className="h-3.5 w-3.5 text-amber-400" />
                          <span>Zdefiniowane Klasy ({mod.classes?.length || 0}):</span>
                        </span>
                        {mod.classes && mod.classes.length > 0 ? (
                          <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                            {mod.classes.map((cls, cIdx) => (
                              <div key={cIdx} className="bg-slate-900 border border-slate-800 text-slate-350 px-2 py-0.5 rounded font-mono">
                                <span className="text-amber-500 font-bold">class </span>{cls}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[10px] block pl-5">Brak zdefiniowanych klas</span>
                        )}
                      </div>

                      {/* Interfaces list */}
                      <div>
                        <span className="font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-blue-405" />
                          <span>Interfejsy ({mod.interfaces?.length || 0}):</span>
                        </span>
                        {mod.interfaces && mod.interfaces.length > 0 ? (
                          <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                            {mod.interfaces.map((inf, iIdx) => (
                              <div key={iIdx} className="bg-slate-900 border border-slate-800 text-slate-355 px-2 py-0.5 rounded font-mono">
                                <span className="text-blue-400 font-bold">interface </span>{inf}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[10px] block pl-5">Brak interfejsów</span>
                        )}
                      </div>

                      {/* Entities list */}
                      {mod.entities && mod.entities.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">
                            <Database className="h-3.5 w-3.5 text-emerald-404" />
                            <span>Encje Bazodanowe ({mod.entities.length}):</span>
                          </span>
                          <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                            {mod.entities.map((ent, entIdx) => (
                              <div key={entIdx} className="bg-slate-900 border border-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono">
                                <span className="text-slate-400 font-normal">@Entity </span>{ent}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: API Endpoints and Module Dependencies */}
                    <div className="space-y-3">
                      {/* API Endpoints */}
                      <div>
                        <span className="font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">
                          <Network className="h-3.5 w-3.5 text-pink-400" />
                          <span>Wystawione Endpointy ({mod.endpoints?.length || 0}):</span>
                        </span>
                        {mod.endpoints && mod.endpoints.length > 0 ? (
                          <div className="space-y-1.5 font-mono text-[10px]">
                            {mod.endpoints.map((ep, epIdx) => {
                              const [method, ...pathParts] = ep.split(" ");
                              const path = pathParts.join(" ");
                              return (
                                <div key={epIdx} className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
                                  <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] uppercase shrink-0 tracking-wider ${getMethodColor(method)}`}>
                                    {method}
                                  </span>
                                  <span className="text-slate-300 font-mono truncate">{path || ep}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[10px] block pl-5">Brak endpointów API</span>
                        )}
                      </div>

                      {/* Dependencies */}
                      {mod.dependencies && mod.dependencies.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-400 flex items-center gap-1.5 mb-1.5">
                            <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Importuje Moduły ({mod.dependencies.length}):</span>
                          </span>
                          <div className="space-y-1 text-[10px] font-mono">
                            {mod.dependencies.map((dep, dIdx) => (
                              <div key={dIdx} className="flex items-center gap-2 text-slate-400 pl-2">
                                <span className="h-1 w-2 bg-indigo-500 rounded-full"></span>
                                <span className="truncate">{dep}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
          {filteredModules.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-xs font-sans">
              Nie znaleziono modułów pasujących do zapytania "{helperSearchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
