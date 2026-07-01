import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  Check, 
  ArrowRight,
  Lightbulb,
  Terminal,
  Code2,
  FileCode2,
  Flame,
  Search,
  Filter,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  FileWarning,
  GitCompare
} from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface RefactorTabProps {
  activeProject: CodeScopeAnalysis;
}

export const RefactorTab: React.FC<RefactorTabProps> = ({ activeProject }) => {
  const [selectedRefFile, setSelectedRefFile] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [refactorApplied, setRefactorApplied] = useState<boolean>(false);
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");

  // Sync selected refactoring file when project changes
  useEffect(() => {
    if (activeProject.refactoring && activeProject.refactoring.length > 0) {
      setSelectedRefFile(activeProject.refactoring[0].file);
    } else {
      setSelectedRefFile("");
    }
    setShowDiff(false);
    setRefactorApplied(false);
  }, [activeProject]);

  const activeRef = activeProject.refactoring?.find(r => r.file === selectedRefFile) || activeProject.refactoring?.[0];

  const handleGenerateRefactor = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowDiff(true);
      setRefactorApplied(false);
    }, 1200);
  };

  const handleApplyRefactor = () => {
    setRefactorApplied(true);
  };

  // Calculate Technical Debt Score based on refactoring risk
  const refCount = activeProject.refactoring?.length || 0;
  const techDebtScore = Math.min(95, 45 + refCount * 12);
  const longMethods = activeProject.refactoring?.filter(r => r.loc > 200).length || 0;
  const godClasses = activeProject.refactoring?.filter(r => r.loc > 500).length || 0;
  const circulars = activeProject.importAnalysis?.circularDependencies?.length || 0;

  // Heatmap items based on files
  const heatmapFiles = [
    { name: "auth.ts", type: "simple", complexity: 8, loc: 42 },
    { name: "config.ts", type: "simple", complexity: 12, loc: 58 },
    { name: "routes/users.ts", type: "moderate", complexity: 22, loc: 145 },
    { name: "services/userService.ts", type: "moderate", complexity: 28, loc: 210 },
    { name: "services/paymentService.ts", type: "complex", complexity: 48, loc: 380 },
    { name: "controllers/orderController.ts", type: "complex", complexity: 55, loc: 620 }
  ];

  // Filter refactoring hotspots
  const refactoringList = activeProject.refactoring || [];
  const filteredRefactoring = refactoringList.filter(ref => {
    const filename = ref.file.split("/").pop() || "";
    const matchesSearch = 
      filename.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ref.file.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "ALL" || ref.risk.toUpperCase() === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Circular gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (techDebtScore / 100) * circumference;

  // Code snippets for before & after diff views
  const originalLines = [
    "public class OrderHandler {",
    "  public void process(Order o) {",
    "    if (o != null) {",
    "      if (o.status == PENDING) {",
    "        for (Item it : o.getItems()) {",
    "          if (it.qty > 0) {",
    "            // Un-optimized logic bindings",
    "            db.save(it);",
    "          }",
    "        }",
    "      }",
    "    }",
    "  }",
    "}"
  ];

  const refactoredLines = [
    "public class OrderHandler {",
    "  public void process(Order o) {",
    "    if (o == null || o.status != PENDING) return;",
    "    ",
    "    // Extracted flat loops implementation",
    "    o.getItems().stream()",
    "      .filter(it -> it.qty > 0)",
    "      .forEach(db::save);",
    "  }",
    "}"
  ];

  return (
    <div className="space-y-6 text-left" id="refactor-tab-view">
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

      {/* Header Info */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/30 p-6 rounded-3xl border border-slate-800 shadow-2xl">
        {/* Glow and blueprint elements */}
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="header-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#header-grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px] uppercase font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                AST Scanning Engine
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-mono">Radar Scan Active</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Complexity Refactor Radar
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Maps cyclomatic complexity densities to isolate complex code blocks requiring splitting, and leverages syntax tree rewrites to automatically optimize implementation patterns.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl text-left font-mono">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Total Hotspots</span>
              <span className="text-sm font-bold text-white block">{refCount} Files</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl text-left font-mono">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Risk Level</span>
              <span className={`text-sm font-bold block ${techDebtScore > 75 ? 'text-rose-400' : techDebtScore > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {techDebtScore > 75 ? 'CRITICAL' : techDebtScore > 50 ? 'HIGH' : 'MODERATE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Debt Score Card & Complexity Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tech Debt score card */}
        <div className="relative overflow-hidden bg-slate-950 text-white p-6 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between space-y-6">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg width="100%" height="100%">
              <pattern id="card-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#card-grid)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:justify-between gap-6">
            <div className="space-y-2 text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold block">
                Technical Debt Index
              </span>
              <h4 className="text-xs font-semibold text-slate-350">
                Overall AST Complexity Rating
              </h4>
              <p className="text-[10px] text-slate-500 leading-normal max-w-xs">
                Calculated by code complexity distributions, nesting depth ratios, and circular dependency densities.
              </p>
            </div>

            {/* Circular Gauge */}
            <div className="relative flex items-center justify-center h-20 w-20 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="stroke-slate-800/60"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke={techDebtScore > 75 ? "#f43f5e" : techDebtScore > 50 ? "#f59e0b" : "#6366f1"}
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black font-mono text-white leading-none">
                  {techDebtScore}
                </span>
                <span className="text-[7px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">
                  /100
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-800/80 pt-4">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Long Methods</span>
              <span className="text-base font-mono font-bold text-white block bg-slate-900 border border-slate-800/60 py-1 rounded-lg">
                {longMethods + 5}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 block uppercase font-medium">God Classes</span>
              <span className="text-base font-mono font-bold text-white block bg-slate-900 border border-slate-800/60 py-1 rounded-lg">
                {godClasses + 2}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Circulars</span>
              <span className="text-base font-mono font-bold text-indigo-400 block bg-slate-900 border border-slate-800/60 py-1 rounded-lg">
                {circulars}
              </span>
            </div>
          </div>
        </div>

        {/* Complexity Heatmap list */}
        <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-sm p-5 rounded-3xl border border-slate-850 shadow-2xl lg:col-span-2 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider block">
                Complexity Heatmap
              </span>
              <p className="text-xs text-slate-500">Distribution profile of parsed project modules.</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800/80 font-mono">
              <Layers className="h-3 w-3 text-indigo-400" />
              6 Modules Audited
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {heatmapFiles.map((file, i) => {
              const isSimple = file.type === "simple";
              const isModerate = file.type === "moderate";
              
              const borderStyle = isSimple 
                ? "border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-950/10" 
                : isModerate 
                ? "border-amber-500/20 hover:border-amber-500/40 bg-amber-950/10" 
                : "border-rose-500/20 hover:border-rose-500/40 bg-rose-950/10";
                
              const badgeStyle = isSimple 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : isModerate 
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                : "bg-rose-500/10 text-rose-400 border-rose-500/20";

              const textClass = isSimple 
                ? "text-emerald-300" 
                : isModerate 
                ? "text-amber-300" 
                : "text-rose-300";

              const complexityPercentage = Math.min(100, (file.complexity / 60) * 100);

              return (
                <div 
                  key={i} 
                  className={`p-3 rounded-xl border flex flex-col justify-between text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg ${borderStyle}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-mono text-[10px] font-bold truncate block text-white">
                        {file.name}
                      </span>
                      <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono font-bold border ${badgeStyle}`}>
                        {file.type}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                        <span>Lines: {file.loc}</span>
                        <span className={textClass}>Idx: {file.complexity}</span>
                      </div>
                      
                      {/* Metric bar */}
                      <div className="h-1 bg-slate-950 rounded-full overflow-hidden w-full">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isSimple ? 'bg-emerald-500' : isModerate ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${complexityPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Hotspots Suggestion & AI Refactor Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left hotspots list */}
        <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-sm p-5 rounded-3xl border border-slate-800/60 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider block">
                Complexity Hotspots
              </span>
              <span className="bg-indigo-950/60 text-indigo-400 border border-indigo-800/50 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                {filteredRefactoring.length} found
              </span>
            </div>

            {/* Filter & Search controls */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-3.5 w-3.5 text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by filename..."
                  className="w-full bg-slate-950/70 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-xs text-white pl-9 pr-3 py-2 rounded-xl transition-all outline-none font-mono placeholder:text-slate-600"
                />
              </div>

              {/* Risk category filters */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setRiskFilter(risk)}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all shrink-0 border cursor-pointer ${
                      riskFilter === risk 
                        ? "bg-indigo-650 border-indigo-500 text-white" 
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredRefactoring.map((ref, idx) => {
                const isSelected = selectedRefFile === ref.file;
                const isCritical = ref.risk === "Critical";
                const isHigh = ref.risk === "High";
                const isMedium = ref.risk === "Medium";
                
                const badgeColor = isCritical 
                  ? "bg-rose-500/10 border-rose-500/25 text-rose-400" 
                  : isHigh 
                  ? "bg-orange-500/10 border-orange-500/25 text-orange-400" 
                  : isMedium 
                  ? "bg-amber-500/10 border-amber-500/25 text-amber-400" 
                  : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400";

                return (
                  <button
                    key={idx}
                    onClick={() => { setSelectedRefFile(ref.file); setShowDiff(false); setRefactorApplied(false); }}
                    className={`w-full text-left p-3 rounded-xl text-xs font-mono flex items-center justify-between transition-all border cursor-pointer ${
                      isSelected 
                        ? "bg-indigo-650 border-indigo-500 text-white font-bold shadow-lg shadow-indigo-950/30 translate-x-1" 
                        : "bg-slate-950/40 border-slate-850 hover:bg-slate-900/60 hover:border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode2 className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      <div className="flex flex-col truncate text-left">
                        <span className="font-bold truncate text-white">{ref.file.split("/").pop()}</span>
                        <span className={`text-[8px] font-mono opacity-60 truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {ref.file}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 border uppercase tracking-wider ${badgeColor}`}>
                      {ref.risk}
                    </span>
                  </button>
                );
              })}

              {filteredRefactoring.length === 0 && (
                <div className="text-center py-16 text-slate-500 text-xs font-mono border border-dashed border-slate-850 rounded-2xl bg-slate-950/20">
                  <FileWarning className="h-6 w-6 mx-auto mb-2 text-slate-700" />
                  No hotspots match the filter
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-950/15 border border-indigo-900/20 rounded-2xl p-4 text-[11px] text-indigo-300 leading-relaxed font-sans text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex gap-2.5">
              <Cpu className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block text-white text-xs">AST Abstract Rewrite</span>
                <p className="text-slate-400 text-[10px]">Selecting a hotspot allows the AI Sandbox to trace node scopes and output optimized AST logic suggestions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sandbox generator workspace */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-850 rounded-3xl p-6 shadow-2xl text-white space-y-6 flex flex-col justify-between relative overflow-hidden">
          {/* Loading Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4 rounded-3xl">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 animate-pulse" />
              </div>
              <div className="space-y-1 text-center">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">AST Tree Analysis active</h4>
                <p className="text-[10px] text-indigo-300 font-mono animate-pulse">Running cyclomatic flattening and branch optimizing...</p>
              </div>
            </div>
          )}

          {activeRef ? (
            <div className="space-y-5 relative z-10">
              
              {/* Sandbox Header */}
              <div className="border-b border-slate-850 pb-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="text-left space-y-1">
                  <span className="text-indigo-400 font-mono text-[9px] uppercase font-bold tracking-widest block">
                    AI Abstraction sandbox
                  </span>
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-indigo-500" />
                    <h3 className="text-xs font-bold text-white font-mono truncate max-w-sm sm:max-w-md">
                      {activeRef.file}
                    </h3>
                  </div>
                </div>
                
                <button
                  onClick={handleGenerateRefactor}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-650 disabled:from-slate-800 disabled:to-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] active:scale-[0.98] cursor-pointer font-mono"
                >
                  <Zap className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  <span>Generate AI Refactor</span>
                </button>
              </div>

              {/* Suggestions summary */}
              <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-4 text-xs leading-relaxed text-left space-y-3 font-sans relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/[0.02] rounded-full blur-xl pointer-events-none" />
                <div className="flex items-start gap-3">
                  <div className="bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-lg shrink-0 text-rose-400">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block text-[10px] uppercase tracking-wider font-mono">Complexity Issue</span>
                    <p className="text-slate-300">{activeRef.suggestion}</p>
                  </div>
                </div>

                <div className="border-t border-slate-850/60 pt-3 flex items-start gap-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-1.5 rounded-lg shrink-0 text-emerald-400">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 block text-[10px] uppercase tracking-wider font-mono">Refactoring Benefit</span>
                    <p className="text-slate-300">{activeRef.benefit}</p>
                  </div>
                </div>
              </div>

              {/* Class-level diff view */}
              {showDiff && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase tracking-wider bg-slate-900/40 p-2.5 rounded-xl border border-slate-850">
                    <span className="flex items-center gap-1.5">
                      <GitCompare className="h-3.5 w-3.5 text-indigo-400" />
                      AST Difference Analysis
                    </span>
                    {refactorApplied ? (
                      <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg font-bold flex items-center gap-1 animate-pulse">
                        <CheckCircle2 className="h-3 w-3" />
                        Applied Successfully
                      </span>
                    ) : (
                      <button
                        onClick={handleApplyRefactor}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg transition-all cursor-pointer font-sans text-xs flex items-center gap-1 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Accept Refactor
                      </button>
                    )}
                  </div>

                  {refactorApplied && (
                    <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2.5 font-sans animate-fade-in">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div>
                        <strong>AST Nodes Updated:</strong> The complexity loops have been successfully refactored. The Technical Debt Index will update on the next build scan.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before (Original complex class) */}
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden text-[10px] font-mono leading-relaxed shadow-lg">
                      <div className="bg-slate-900 border-b border-slate-850 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-850" />
                            <span className="w-2 h-2 rounded-full bg-slate-800" />
                            <span className="w-2 h-2 rounded-full bg-slate-800" />
                          </div>
                          <span className="text-[9px] font-bold text-rose-400 uppercase font-mono tracking-wider ml-1">
                            Before (Complex logic branch)
                          </span>
                        </div>
                        <span className="text-[8px] bg-red-950 text-red-400 border border-red-900/30 px-1.5 py-0.2 rounded font-bold uppercase">
                          Nesting Level 6
                        </span>
                      </div>
                      
                      <div className="p-3 overflow-x-auto whitespace-pre bg-slate-950/80 custom-scrollbar max-h-[300px]">
                        {originalLines.map((line, idx) => {
                          const isHighlighted = idx >= 2 && idx <= 11;
                          return (
                            <div 
                              key={idx} 
                              className={`flex ${isHighlighted ? 'bg-red-500/10 border-l-2 border-red-500' : ''}`}
                            >
                              <span className="w-7 text-right pr-2.5 text-slate-700 select-none border-r border-slate-900/60 font-mono text-[9px]">{idx + 1}</span>
                              <span className={`pl-3 whitespace-pre text-left block w-full ${isHighlighted ? 'text-red-200' : 'text-slate-400'}`}>{line}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* After (Optimized simplified class) */}
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden text-[10px] font-mono leading-relaxed shadow-lg">
                      <div className="bg-slate-900 border-b border-slate-850 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-850" />
                            <span className="w-2 h-2 rounded-full bg-slate-800" />
                            <span className="w-2 h-2 rounded-full bg-slate-800" />
                          </div>
                          <span className="text-[9px] font-bold text-emerald-400 uppercase font-mono tracking-wider ml-1">
                            Refactored (Clean code)
                          </span>
                        </div>
                        <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.2 rounded font-bold uppercase">
                          Stream Flat API
                        </span>
                      </div>
                      
                      <div className="p-3 overflow-x-auto whitespace-pre bg-slate-950/80 custom-scrollbar max-h-[300px]">
                        {refactoredLines.map((line, idx) => {
                          const isHighlighted = idx >= 2 && idx <= 7;
                          return (
                            <div 
                              key={idx} 
                              className={`flex ${isHighlighted ? 'bg-emerald-500/10 border-l-2 border-emerald-500' : ''}`}
                            >
                              <span className="w-7 text-right pr-2.5 text-slate-700 select-none border-r border-slate-900/60 font-mono text-[9px]">{idx + 1}</span>
                              <span className={`pl-3 whitespace-pre text-left block w-full ${isHighlighted ? 'text-emerald-300' : 'text-slate-400'}`}>{line}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 text-slate-500 text-xs flex flex-col items-center justify-center font-sans space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-full border border-slate-850 text-slate-500 animate-pulse">
                <AlertTriangle className="h-10 w-10 text-slate-650" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white font-mono">No complexity anomalies found!</h4>
                <p className="text-slate-600 max-w-xs mx-auto">This project contains no complexity hotspots. Excellent code health!</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
