import React from "react";
import { Layers, Zap, UploadCloud, RotateCcw, Download, Sparkles } from "lucide-react";
import { CodeScopeAnalysis } from "../../types";

interface HeaderProps {
  activeProject: CodeScopeAnalysis | null;
  handleZipUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  setActiveProject: (project: CodeScopeAnalysis | null) => void;
  handleLoadSampleProject?: (sampleName: 'ecommerce' | 'microservice' | 'fintech') => void;
  projectSource?: 'sample' | 'uploaded';
}

export const Header: React.FC<HeaderProps> = ({
  activeProject,
  handleZipUpload,
  setActiveProject,
  handleLoadSampleProject,
  projectSource,
}) => {
  const handleQuickDownload = () => {
    if (!activeProject) return;
    const content = `# CodeScope Static Analysis Report: ${activeProject.projectName}
Health Score: ${activeProject.healthScore}/100
Style: ${activeProject.architecture?.style || "Modular Monolith"}
Confidence: ${activeProject.architecture?.confidence || 80}%

## DNA Tech Stack
- Languages: ${activeProject.projectDNA.languages.map(l => `${l.name} (${l.percentage}%)`).join(", ")}
- Databases: ${activeProject.projectDNA.databases.join(", ")}
- Frameworks: ${activeProject.projectDNA.frameworks.join(", ")}

## Key Summary Findings
- Total Security Issues: ${activeProject.security?.length || 0}
- Performance Issues: ${activeProject.performance?.length || 0}
- Code Smells: ${activeProject.codeSmells?.length || 0}
`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codescope-quick-report-${activeProject.projectName.toLowerCase().replace(/\s+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="border-b border-indigo-500/10 bg-[#0c0e14]/80 backdrop-blur-xl sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-white p-2.5 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)] group cursor-pointer hover:bg-indigo-500/20 transition-all">
          <Layers className="h-6 w-6 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-white">CodeScope</h1>
            <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1.5 shadow-sm uppercase tracking-widest">
              <Zap className="h-3 w-3" /> v2.4 Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Static Source Intelligence & Architecture Modeling Platform</p>
        </div>
      </div>

      {activeProject ? (
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {projectSource === 'sample' && handleLoadSampleProject && (
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/60 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 shadow-inner">
              <span className="text-slate-500 text-[10px] uppercase font-bold font-sans">Active Sample:</span>
              <select
                value={activeProject.projectName.includes("Spring") ? "ecommerce" : activeProject.projectName.includes("Laravel") ? "microservice" : "fintech"}
                onChange={(e) => handleLoadSampleProject(e.target.value as any)}
                className="bg-transparent border-none outline-none font-bold text-indigo-300 cursor-pointer font-sans appearance-none pr-4"
              >
                <option value="ecommerce" className="bg-slate-900">Spring Boot E-Commerce</option>
                <option value="microservice" className="bg-slate-900">Laravel CMS Core</option>
                <option value="fintech" className="bg-slate-900">Express + Prisma API</option>
              </select>
            </div>
          )}

          {/* Pulse LED Status Indicator */}
          <div className="hidden md:flex items-center gap-2.5 bg-slate-900/60 border border-indigo-500/20 px-3.5 py-2 rounded-xl text-[10px] font-bold text-slate-300 shadow-sm uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Sparkles size={12} className="text-indigo-400 shrink-0" />
            <span>AI Oracle Connected</span>
          </div>
          
          <div className="hidden lg:flex flex-col items-end text-right px-2">
            <span className="text-xs font-bold text-white truncate max-w-[150px]">
              {activeProject.projectName}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Score: <span className="text-emerald-400">{activeProject.healthScore}%</span> • Style: {activeProject.architecture?.style || "Static"}
            </span>
          </div>

          {/* Download summary button */}
          <button
            onClick={handleQuickDownload}
            className="bg-slate-900/60 hover:bg-indigo-500/10 text-slate-300 hover:text-indigo-300 border border-slate-700/60 hover:border-indigo-500/30 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm"
            title="Download Quick Markdown Report Summary"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <label className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-[0_4px_15px_-3px_rgba(99,102,241,0.4)] active:scale-95 border border-indigo-400/20">
            <UploadCloud className="h-4 w-4" />
            <span>Upload ZIP</span>
            <input type="file" accept=".zip" onChange={handleZipUpload} className="hidden" />
          </label>

          <button
            onClick={() => setActiveProject(null)}
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-400/40 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-left shadow-inner">
          <div className="h-2 w-2 rounded-full bg-slate-600 animate-pulse"></div>
          <span>No active workspace. Upload project ZIP</span>
        </div>
      )}
    </header>
  );
};
