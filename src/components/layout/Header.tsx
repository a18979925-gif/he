import React from "react";
import { Layers, Zap, UploadCloud, RotateCcw } from "lucide-react";
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
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="bg-slate-950 text-white p-2 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/10">
          <Layers className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">CodeScope</h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              <Zap className="h-3 w-3" /> v2.4 AI Powered
            </span>
          </div>
          <p className="text-xs text-slate-500">Static Source Intelligence & Architecture Modeling Platform</p>
        </div>
      </div>

      {activeProject ? (
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {projectSource === 'sample' && handleLoadSampleProject && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold font-sans">Active Sample:</span>
              <select
                value={activeProject.projectName.includes("Spring") ? "ecommerce" : activeProject.projectName.includes("Laravel") ? "microservice" : "fintech"}
                onChange={(e) => handleLoadSampleProject(e.target.value as any)}
                className="bg-transparent border-none outline-none font-bold text-slate-800 cursor-pointer font-sans"
              >
                <option value="ecommerce">Spring Boot E-Commerce</option>
                <option value="microservice">Laravel CMS Core</option>
                <option value="fintech">Express + Prisma API</option>
              </select>
            </div>
          )}
          
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-xs font-bold text-slate-950 truncate max-w-[200px]">
              {activeProject.projectName}
            </span>
            <span className="text-[10px] text-slate-400">
              Score: {activeProject.healthScore}% • Style: {activeProject.architecture?.style || "Static"}
            </span>
          </div>
          
          <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm shadow-indigo-600/10 active:scale-95">
            <UploadCloud className="h-4 w-4" />
            <span>Upload ZIP</span>
            <input type="file" accept=".zip" onChange={handleZipUpload} className="hidden" />
          </label>

          <button
            onClick={() => setActiveProject(null)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-slate-300"></div>
          <span>No active workspace. Upload project ZIP below</span>
        </div>
      )}
    </header>
  );
};
