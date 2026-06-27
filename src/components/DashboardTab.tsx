import React from "react";
import { Activity, Code, Zap, Layers, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface DashboardTabProps {
  activeProject: CodeScopeAnalysis;
  projectSource: 'sample' | 'uploaded';
  setActiveTab: (tab: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  activeProject,
  projectSource,
  setActiveTab,
}) => {
  // Determine color for health indicator
  const getHealthColor = (score: number) => {
    if (score > 85) return {
      stroke: "stroke-emerald-400",
      text: "text-emerald-400",
      glow: "rgba(52,211,153,0.4)",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10"
    };
    if (score > 65) return {
      stroke: "stroke-amber-400",
      text: "text-amber-400",
      glow: "rgba(251,191,36,0.4)",
      border: "border-amber-500/20",
      bg: "bg-amber-500/10"
    };
    return {
      stroke: "stroke-rose-500",
      text: "text-rose-500",
      glow: "rgba(244,63,94,0.4)",
      border: "border-rose-500/20",
      bg: "bg-rose-500/10"
    };
  };

  const healthStyle = getHealthColor(activeProject.healthScore);
  const totalIssues = (activeProject.security?.length || 0) + (activeProject.bugs?.length || 0);

  return (
    <div className="space-y-6" id="dashboard-tab-view">
      {/* Introduction Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 p-6 md:p-8 rounded-3xl text-white border border-indigo-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl shadow-slate-950/50">
        {/* Glow Effects */}
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        {/* Blueprint background grid effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="banner-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#banner-grid)" />
          </svg>
        </div>

        <div className="max-w-xl relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              AST Scanning Suite
            </span>
            <span className="text-slate-650 text-xs">•</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Dynamic Analysis Offline Fallback Active
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
            Project Blueprint: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-cyan-200 to-emerald-300">{activeProject.projectName}</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-normal">
            CodeScope has parsed this codebase, mapped dependencies, and reverse-engineered architecture schemas. Switch samples above or upload any project ZIP file to scan.
          </p>
        </div>

        {/* Info & score box */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 self-start lg:self-auto shadow-xl">
          <div className="flex items-center gap-3 pr-2">
            <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Secondary track for glow effect */}
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  className="stroke-slate-800/80"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  className={`transition-all duration-1000 ${healthStyle.stroke}`}
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={2 * Math.PI * 26 * (1 - activeProject.healthScore / 100)}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${healthStyle.glow})` }}
                />
              </svg>
              <span className="absolute text-sm font-extrabold font-mono text-white">{activeProject.healthScore}%</span>
            </div>
            <div className="text-left font-sans">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Health Score</div>
              <div className="text-[9px] text-slate-500 font-medium">AST Quality Index</div>
            </div>
          </div>

          <div className="hidden sm:block w-[1px] bg-slate-800/80 my-2"></div>

          <div className="flex justify-around gap-6 sm:px-2 py-2 sm:py-0">
            <div className="text-center flex flex-col justify-center min-w-[50px] group cursor-default">
              <div className="text-base font-extrabold font-mono text-indigo-400 group-hover:scale-110 transition-transform duration-200">
                {activeProject.endpoints.length}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">APIs</div>
            </div>
            
            <div className="w-[1px] bg-slate-800/80 sm:hidden"></div>

            <div className="text-center flex flex-col justify-center min-w-[50px] group cursor-pointer" onClick={() => setActiveTab("security")}>
              <div className="text-base font-extrabold font-mono text-rose-400 group-hover:scale-110 transition-transform duration-200">
                {totalIssues}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Bugs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 1: Health score breakdown & Project DNA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Health Score breakdown */}
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col justify-between hover:border-slate-700/40 transition-all duration-300 group">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">System Quality</h3>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            
            <div className="space-y-4">
              {activeProject.healthReasons.map((hr, idx) => {
                const isHigh = hr.score >= 80;
                const isMedium = hr.score >= 60;
                
                const scoreColorClass = isHigh 
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                  : isMedium 
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/20" 
                    : "text-rose-400 bg-rose-500/10 border-rose-500/20";

                const leftBorderColor = isHigh
                  ? "border-l-emerald-500/30"
                  : isMedium
                    ? "border-l-amber-500/30"
                    : "border-l-rose-500/30";

                const hoverBorderColor = isHigh
                  ? "hover:border-l-emerald-400"
                  : isMedium
                    ? "hover:border-l-amber-400"
                    : "hover:border-l-rose-400";

                return (
                  <div 
                    key={idx} 
                    className={`pl-3 border-l-2 ${leftBorderColor} ${hoverBorderColor} transition-colors duration-200 pb-3 last:pb-0`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-200 leading-tight">{hr.category}</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${scoreColorClass}`}>
                        {hr.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{hr.description}</p>
                    <div className="bg-indigo-950/20 border border-indigo-500/10 p-2 rounded-xl text-[10px] text-indigo-300 font-mono flex items-start gap-2 shadow-inner">
                      <Zap className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-400" />
                      <span><strong className="text-indigo-200">Action:</strong> {hr.recommendation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Project DNA (Tech detected) */}
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl hover:border-slate-700/40 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Detected Tech DNA</h3>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <Code className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-5">
            {/* Languages breakdown */}
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2.5">Source Languages</span>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-950 my-2 p-0.5 border border-slate-800">
                {activeProject.projectDNA.languages.map((l, idx) => {
                  const colors = [
                    "bg-gradient-to-r from-indigo-500 to-indigo-600",
                    "bg-gradient-to-r from-pink-500 to-rose-500",
                    "bg-gradient-to-r from-emerald-400 to-teal-400"
                  ];
                  return (
                    <div
                      key={idx}
                      style={{ width: `${l.percentage}%` }}
                      className={`${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                      title={`${l.name}: ${l.percentage}%`}
                    ></div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5">
                {activeProject.projectDNA.languages.map((l, idx) => {
                  const dotColors = ["bg-indigo-400", "bg-pink-400", "bg-emerald-400"];
                  return (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[idx % dotColors.length]}`}></span>
                      <span>{l.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">({l.percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Frameworks, Database, Infra */}
            <div className="border-t border-slate-800/80 pt-4 space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Application Frameworks</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.projectDNA.frameworks.map((f, i) => (
                    <span key={i} className="bg-indigo-500/10 text-indigo-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-400/40 transition-colors duration-150">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Database Engine</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.projectDNA.databases.map((db, i) => (
                    <span key={i} className="bg-amber-500/10 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-400/40 transition-colors duration-150">
                      {db}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Infrastructure & Containers</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.projectDNA.infrastructure.map((inf, i) => (
                    <span key={i} className="bg-slate-800/50 text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-slate-700/30 hover:bg-slate-700/50 hover:border-slate-600/40 transition-colors duration-150">
                      {inf}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Security Auth System</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.projectDNA.authentication.map((a, i) => (
                    <span key={i} className="bg-emerald-500/10 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-400/40 transition-colors duration-150">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Detection summary */}
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col justify-between hover:border-slate-700/40 transition-all duration-300 group">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Architecture Modeling</h3>
              <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform duration-300">
                <Layers className="h-4 w-4" />
              </div>
            </div>

            {/* Futuristic blueprint card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-pink-950/20 to-slate-950/90 p-4 rounded-xl border border-pink-500/20 mb-4 shadow-inner">
              {/* Grid background pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="arch-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                      <path d="M 16 0 L 0 0 0 16" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#arch-grid)" />
                </svg>
              </div>

              <div className="relative z-10 flex items-center justify-between gap-3 mb-1.5">
                <div className="text-pink-400 font-extrabold text-sm tracking-widest uppercase">
                  {activeProject.architecture.style}
                </div>
                <div className="bg-pink-500/10 text-pink-300 border border-pink-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight">
                  {activeProject.architecture.confidence}% Confidence
                </div>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Inferred Topography</div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              {activeProject.architecture.explanation}
            </p>

            <div className="border-t border-slate-800/80 pt-3 text-[11px] text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Circular import loops</span>
                <span className={`font-mono font-bold text-xs ${activeProject.importAnalysis.circularDependencies.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {activeProject.importAnalysis.circularDependencies.length > 0 ? "Detected" : "None"}
                </span>
              </div>
              
              <div className="flex justify-between items-center gap-4">
                <span>Package Coupling Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/50">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-indigo-500 h-full"
                      style={{ width: `${activeProject.importAnalysis.packageCouplingScore}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-200 font-semibold font-mono text-[10px]">
                    {activeProject.importAnalysis.packageCouplingScore}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("architecture")}
            className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/20 hover:shadow-indigo-500/10 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-indigo-500/15"
          >
            Explore Blueprint Diagram <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* Dynamic Quick Actions Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 border border-rose-500/15 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl border border-rose-500/25 relative flex items-center justify-center shrink-0">
            <span className="absolute inset-0 rounded-xl bg-rose-500/5 animate-ping opacity-75"></span>
            <ShieldAlert className="h-5 w-5 relative z-10" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Security Scan Findings</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Found <strong className="text-rose-400 font-bold">{activeProject.security?.length || 0}</strong> vulnerability signatures in static codebase context.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("security")}
          className="relative z-10 w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-rose-950/20 hover:shadow-rose-500/10 hover:-translate-y-0.5 cursor-pointer text-center"
        >
          Inspect Vulnerabilities
        </button>
      </div>

    </div>
  );
};