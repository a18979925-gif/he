import React from "react";
import { 
  Sparkles, 
  UploadCloud, 
  FileArchive, 
  GitBranch, 
  FolderOpen, 
  History, 
  Terminal, 
  Settings, 
  Search, 
  FileCode, 
  Play, 
  Code,
  ArrowRight,
  ExternalLink,
  Cpu,
  HelpCircle
} from "lucide-react";

interface UploadZoneProps {
  isDragging: boolean;
  setIsDragging: (val: boolean) => void;
  gitRepoUrl: string;
  setGitRepoUrl: (url: string) => void;
  handleZipUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleGitImport: (e: React.FormEvent) => void;
  recentProjects: Array<{ projectName: string; healthScore: number; issuesCount: number; lastUpdated: string }>;
  handleSelectRecentProject: (name: string) => Promise<void>;
  handleLoadSampleProject: (sampleName: 'ecommerce' | 'microservice' | 'fintech') => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  isDragging,
  setIsDragging,
  gitRepoUrl,
  setGitRepoUrl,
  handleZipUpload,
  handleGitImport,
  recentProjects,
  handleSelectRecentProject,
  handleLoadSampleProject,
}) => {
  return (
    <div className="flex-1 flex bg-[#181818] text-[#cccccc] font-sans overflow-hidden select-none relative" style={{ height: "calc(100vh - 48px)" }}>
      {/* Background Decorative Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        background: "radial-gradient(circle at 70% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 40%)"
      }} />

      {/* 1. VS Code Left Activity Bar */}
      <div className="w-12 bg-[#333333] border-r border-[#2b2b2b] flex flex-col justify-between py-3 items-center shrink-0 z-10">
        <div className="flex flex-col gap-5 items-center w-full">
          {/* Explorer Icon (Active) */}
          <div className="relative group cursor-pointer w-full flex justify-center py-1 border-l-2 border-[#007acc]">
            <FolderOpen className="h-5 w-5 text-white transition-transform group-hover:scale-105" />
            <span className="absolute left-14 bg-[#252526] text-xs text-white px-2.5 py-1 rounded shadow-lg border border-[#3c3c3c] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none transform translate-x-2 group-hover:translate-x-0 font-sans">
              Explorer (Ctrl+Shift+E)
            </span>
          </div>
          {/* Search Icon */}
          <div className="relative group cursor-pointer w-full flex justify-center py-1 text-[#858585] hover:text-white transition-colors">
            <Search className="h-5 w-5 transition-transform group-hover:scale-105" />
            <span className="absolute left-14 bg-[#252526] text-xs text-white px-2.5 py-1 rounded shadow-lg border border-[#3c3c3c] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none transform translate-x-2 group-hover:translate-x-0 font-sans">
              Search (Ctrl+Shift+F)
            </span>
          </div>
          {/* Source Control Icon */}
          <div className="relative group cursor-pointer w-full flex justify-center py-1 text-[#858585] hover:text-white transition-colors">
            <GitBranch className="h-5 w-5 transition-transform group-hover:scale-105" />
            <span className="absolute left-14 bg-[#252526] text-xs text-white px-2.5 py-1 rounded shadow-lg border border-[#3c3c3c] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none transform translate-x-2 group-hover:translate-x-0 font-sans">
              Source Control (Ctrl+Shift+G)
            </span>
          </div>
          {/* Run & Debug */}
          <div className="relative group cursor-pointer w-full flex justify-center py-1 text-[#858585] hover:text-white transition-colors">
            <Play className="h-5 w-5 transition-transform group-hover:scale-105" />
            <span className="absolute left-14 bg-[#252526] text-xs text-white px-2.5 py-1 rounded shadow-lg border border-[#3c3c3c] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none transform translate-x-2 group-hover:translate-x-0 font-sans">
              Run and Debug (Ctrl+Shift+D)
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4 items-center w-full">
          {/* SQL Terminal Icon */}
          <div className="relative group cursor-pointer w-full flex justify-center py-1 text-[#858585] hover:text-white transition-colors">
            <Terminal className="h-5 w-5 transition-transform group-hover:scale-105" />
            <span className="absolute left-14 bg-[#252526] text-xs text-white px-2.5 py-1 rounded shadow-lg border border-[#3c3c3c] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none transform translate-x-2 group-hover:translate-x-0 font-sans">
              SQL Sandbox Playground
            </span>
          </div>
          {/* Settings Icon */}
          <div className="relative group cursor-pointer w-full flex justify-center py-1 text-[#858585] hover:text-white transition-colors">
            <Settings className="h-5 w-5 transition-transform group-hover:scale-105" />
            <span className="absolute left-14 bg-[#252526] text-xs text-white px-2.5 py-1 rounded shadow-lg border border-[#3c3c3c] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none transform translate-x-2 group-hover:translate-x-0 font-sans">
              Settings (Ctrl+,)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Side Explorer Pane (Welcome Menu) */}
      <div className="w-60 bg-[#252526] border-r border-[#2b2b2b] flex flex-col shrink-0 font-mono text-[11px] text-[#bbbbbb] z-10">
        <div className="p-3 border-b border-[#2b2b2b] flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#858585] select-none">
          <span>Explorer: Workspace</span>
        </div>
        <div className="p-3.5 leading-relaxed flex-1 flex flex-col justify-between">
          <div>
            <div className="font-bold text-[#858585] flex items-center gap-1.5 uppercase text-[9px] tracking-widest mb-2 font-mono">
              NO FOLDER OPENED
            </div>
            <div className="text-[#858585] mb-4 text-xs font-sans">
              You have not opened a workspace project yet. Upload a ZIP archive or clone a repository.
            </div>
            <div>
              <label className="block w-full text-center bg-[#0e639c] hover:bg-[#1177bb] text-white font-sans py-1.5 px-3 rounded font-semibold cursor-pointer transition-all hover:shadow-md hover:shadow-sky-500/10 active:scale-[0.98] text-xs">
                Open ZIP Archive...
                <input type="file" accept=".zip" onChange={handleZipUpload} className="hidden" />
              </label>
            </div>
          </div>
          
          <div className="border-t border-[#3c3c3c] pt-3 text-[10px] text-zinc-500 font-sans">
            <div className="flex justify-between mb-1">
              <span>Engine Status</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
            <div className="flex justify-between">
              <span>SonarQube Level</span>
              <span className="text-indigo-400 font-semibold font-mono">Lvl 10</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-y-auto relative pb-8 z-10"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file && file.name.endsWith(".zip")) {
            const mockEvent = {
              target: { files: [file] }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            await handleZipUpload(mockEvent);
          }
        }}
      >
        {/* Editor Tab Headers */}
        <div className="h-9 bg-[#2d2d2d] flex border-b border-[#252526] shrink-0">
          <div className="bg-[#1e1e1e] text-white px-4 flex items-center gap-2 border-r border-[#252526] text-xs font-sans h-full cursor-default border-t border-t-indigo-500">
            <Code className="h-3.5 w-3.5 text-indigo-400" />
            <span>Welcome - CodeScope</span>
            <span className="text-[10px] text-zinc-500 hover:text-white cursor-pointer ml-2">×</span>
          </div>
        </div>

        {/* VS Code Welcome Page Contents */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-8 py-10 flex flex-col justify-between">
          <div>
            {/* Header Title */}
            <div className="border-b border-[#3c3c3c] pb-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
              <div>
                <h1 className="text-3xl font-light text-white font-sans mb-1.5 flex items-center gap-2">
                  Visual Studio Code
                  <span className="text-xs bg-[#0e639c]/20 text-[#007acc] px-2 py-0.5 rounded border border-[#007acc]/30 font-semibold">
                    CodeScope v2.4
                  </span>
                </h1>
                <p className="text-sm text-[#858585] font-sans">
                  Enterprise-grade static codebase analysis and OWASP-10 vulnerability engine.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs bg-[#252526] px-3.5 py-2 rounded-lg border border-[#3c3c3c] text-indigo-400 font-mono self-start sm:self-auto shadow-md">
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
                <span>SonarQube Rules Enabled</span>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Column: Start Options */}
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-semibold text-white mb-3 font-sans">Start</h3>
                  
                  <div className="flex flex-col gap-3 font-sans">
                    {/* Open ZIP Link */}
                    <label className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#252526] group cursor-pointer transition-all border border-transparent hover:border-[#3c3c3c] hover:shadow-lg active:scale-[0.99]">
                      <div className="bg-[#2a2a2a] group-hover:bg-[#0e639c]/10 group-hover:text-[#007acc] text-indigo-400 p-3 rounded-lg transition-colors shadow-inner">
                        <FolderOpen className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[#0e639c] group-hover:text-[#1177bb] font-semibold text-sm block transition-colors">Open Folder (Upload ZIP)</span>
                        <span className="text-xs text-[#858585] mt-0.5 block leading-relaxed">Select a local project zip repository archive to analyze</span>
                      </div>
                      <input type="file" accept=".zip" onChange={handleZipUpload} className="hidden" />
                    </label>

                    {/* Clone Repository Option */}
                    <div className="p-4 rounded-xl bg-[#252526] border border-[#3c3c3c] flex flex-col gap-3.5 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#1e1e1e] text-emerald-400 p-3 rounded-lg shadow-inner">
                          <GitBranch className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-[#007acc] font-semibold text-sm block">Clone Git Repository</span>
                          <span className="text-xs text-[#858585] mt-0.5 block">Analyze static code straight from GitHub/GitLab</span>
                        </div>
                      </div>
                      <form onSubmit={handleGitImport} className="flex gap-1.5 mt-1">
                        <input 
                          type="url" 
                          placeholder="https://github.com/username/repository.git"
                          value={gitRepoUrl}
                          onChange={(e) => setGitRepoUrl(e.target.value)}
                          className="flex-1 bg-[#1e1e1e] border border-[#3c3c3c] focus:border-[#007acc] rounded-md px-3.5 py-2 text-xs text-white outline-none font-mono transition-colors"
                          required
                        />
                        <button 
                          type="submit"
                          className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-4 py-2 rounded-md text-xs font-semibold transition-all hover:shadow-md hover:shadow-sky-500/10 active:scale-[0.98] shrink-0 cursor-pointer"
                        >
                          Clone
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Samples Section */}
                <div>
                  <h3 className="text-xs font-bold text-[#858585] uppercase tracking-wider mb-3 font-mono">Start with a Sample</h3>
                  <div className="grid grid-cols-1 gap-3 font-sans">
                    <button 
                      onClick={() => handleLoadSampleProject('ecommerce')}
                      className="w-full text-left p-3.5 bg-[#252526] hover:bg-[#2e2e2e] border border-[#3c3c3c] hover:border-[#555555] rounded-xl transition-all flex justify-between items-center group cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex gap-3 items-center">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        <div>
                          <span className="text-white text-xs font-bold block">Spring Boot E-Commerce Sandbox</span>
                          <span className="text-[10px] text-[#858585] font-mono mt-0.5 block">Java • Domain-Driven Design (DDD)</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
                    </button>

                    <button 
                      onClick={() => handleLoadSampleProject('microservice')}
                      className="w-full text-left p-3.5 bg-[#252526] hover:bg-[#2e2e2e] border border-[#3c3c3c] hover:border-[#555555] rounded-xl transition-all flex justify-between items-center group cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex gap-3 items-center">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <div>
                          <span className="text-white text-xs font-bold block">Laravel CMS Backend Core</span>
                          <span className="text-[10px] text-[#858585] font-mono mt-0.5 block">PHP • Model-View-Controller (MVC)</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
                    </button>

                    <button 
                      onClick={() => handleLoadSampleProject('fintech')}
                      className="w-full text-left p-3.5 bg-[#252526] hover:bg-[#2e2e2e] border border-[#3c3c3c] hover:border-[#555555] rounded-xl transition-all flex justify-between items-center group cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex gap-3 items-center">
                        <span className="h-2 w-2 rounded-full bg-teal-500" />
                        <div>
                          <span className="text-white text-xs font-bold block">Express + Prisma Fintech API</span>
                          <span className="text-[10px] text-[#858585] font-mono mt-0.5 block">TypeScript • Tiered Architecture</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Recent Workspaces */}
              <div className="flex flex-col gap-6 font-sans">
                <div>
                  <h3 className="text-base font-semibold text-white mb-3">Recent Workspaces</h3>
                  
                  {recentProjects && recentProjects.length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                      {recentProjects.map((p) => (
                        <div 
                          key={p.projectName}
                          onClick={() => handleSelectRecentProject(p.projectName)}
                          className="p-3.5 bg-[#252526] hover:bg-[#2d2d2d] border border-[#3c3c3c] hover:border-[#007acc]/50 rounded-xl transition-all flex items-center justify-between group cursor-pointer hover:shadow-lg"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="bg-[#1e1e1e] group-hover:bg-[#007acc]/10 group-hover:text-[#007acc] text-indigo-400 p-2.5 rounded-lg shrink-0 transition-colors shadow-inner">
                              <FileArchive className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-white text-xs font-bold block truncate transition-colors group-hover:text-white">{p.projectName}</span>
                              <span className="text-[10px] text-[#858585] block mt-0.5 truncate font-mono">
                                Health Score: <strong className="text-indigo-400 font-bold">{p.healthScore}%</strong> • {p.issuesCount} issues
                              </span>
                            </div>
                          </div>
                          <span className="text-[9.5px] font-bold font-mono bg-[#1e1e1e] border border-[#3c3c3c] text-[#858585] px-2.5 py-1 rounded group-hover:bg-[#0e639c] group-hover:text-white group-hover:border-[#0e639c] transition-all">
                            LOAD
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-[#3c3c3c] border-dashed rounded-xl p-8 text-center text-[#858585] text-xs bg-[#252526]/30">
                      <History className="h-9 w-9 mx-auto mb-2.5 opacity-55 text-indigo-400 animate-pulse" />
                      No recent project logs found. Upload your first workspace to register cache profiles here.
                    </div>
                  )}
                </div>

                {/* Capabilities Info Board */}
                <div className="border border-[#3c3c3c] bg-[#252526]/35 p-5 rounded-xl flex flex-col gap-4 shadow-sm">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                    <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                    Engine Capabilities
                  </h4>
                  <div className="grid grid-cols-1 gap-3 text-xs text-[#b8b8b8]">
                    <div className="flex gap-2.5">
                      <div className="text-indigo-450 font-bold font-mono shrink-0 select-none bg-indigo-950/40 px-1 rounded h-fit">01</div>
                      <p className="leading-relaxed">
                        <strong>Architecture Mapper:</strong> Automatically detects DDD, Clean, MVC layouts and constructs visual call graphs.
                      </p>
                    </div>
                    <div className="flex gap-2.5">
                      <div className="text-[#0e639c] font-bold font-mono shrink-0 select-none bg-sky-950/45 px-1 rounded h-fit">02</div>
                      <p className="leading-relaxed">
                        <strong>Swagger API Explorer:</strong> Extracts controller endpoints and launches fully simulated HTTP runtime pipelines.
                      </p>
                    </div>
                    <div className="flex gap-2.5">
                      <div className="text-emerald-450 font-bold font-mono shrink-0 select-none bg-emerald-950/40 px-1 rounded h-fit">03</div>
                      <p className="leading-relaxed">
                        <strong>Diagnostics & Autofix:</strong> Discovers OWASP Top 10 vulnerabilities, N+1 leaks, and applies localized code repairs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips / Bottom Section */}
          <div className="mt-12 pt-6 border-t border-[#3c3c3c] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#858585]">
            <div className="flex items-center gap-2 bg-[#252526] py-1.5 px-3 rounded-full border border-[#3c3c3c]">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              <span>Looking for help? Drag a zip folder here to initiate scanning.</span>
            </div>
            <div className="flex gap-4 font-mono text-[10px] text-zinc-500">
              <span>[v2.4.0-SonarGrade]</span>
              <span>[NodeJS Static Engine]</span>
            </div>
          </div>
        </div>

        {/* Drag Over Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-[#0e639c]/25 border-4 border-dashed border-[#0e639c] flex flex-col items-center justify-center pointer-events-none z-45 animate-pulse">
            <UploadCloud className="h-16 w-16 text-[#0e639c] mb-2 animate-bounce" />
            <h3 className="text-xl font-bold text-white">Drop ZIP here to Open Folder</h3>
            <p className="text-xs text-slate-350">Extracts AST tree and initializes dynamic analysis</p>
          </div>
        )}
      </div>

      {/* 4. VS Code bottom Blue Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[22px] bg-[#007acc] text-white flex justify-between items-center px-2 text-[11px] select-none font-sans z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#1f8ad2] px-2 h-full hover:bg-[#2496e3] cursor-pointer transition-colors">
            <Cpu className="h-3 w-3" />
            <span>AST: Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GitBranch className="h-3 w-3" />
            <span>main</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span>TypeScript JSX</span>
        </div>
      </div>
    </div>
  );
};
