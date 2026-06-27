import React, { useState, useEffect } from "react";
import { 
  GitCompare, 
  GitCommit, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Search,
  FileCode,
  Copy,
  Check,
  Sparkles,
  ArrowUpRight,
  History
} from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface GitInsightsTabProps {
  activeProject: CodeScopeAnalysis;
}

export const GitInsightsTab: React.FC<GitInsightsTabProps> = ({ activeProject }) => {
  const insights = activeProject.gitInsights || [];
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Sync selectedFile when project insights change or initially
  useEffect(() => {
    if (insights.length > 0) {
      // Find matching index or select first
      const hasSelected = insights.some(i => i.file === selectedFile);
      if (!hasSelected) {
        setSelectedFile(insights[0].file);
      }
    } else {
      setSelectedFile("");
    }
  }, [activeProject, insights]);

  const filteredInsights = insights.filter(item => 
    item.file.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeInsight = filteredInsights.find(i => i.file === selectedFile) || filteredInsights[0] || insights[0];

  // High fidelity simulated commits data connected to active files
  const simulatedCommits: Record<string, Array<{ hash: string; msg: string; author: string; date: string }>> = {
    "default": [
      { hash: "b5c12f4", msg: "refactor: simplify cognitive complexity patterns", author: "alex_dev", date: "2 hours ago" },
      { hash: "a8e38d1", msg: "security: parameterize raw SQL queries in repo module", author: "jane_mgr", date: "1 day ago" },
      { hash: "f3b9c02", msg: "feat: register Swagger endpoints definitions", author: "andrzej_qa", date: "3 days ago" },
      { hash: "e204c88", msg: "infra: configure multi-stage Docker builds", author: "alex_dev", date: "1 week ago" }
    ]
  };

  const getCommitsForFile = (filePath: string) => {
    // Generate some contextual commits based on file names
    const baseName = filePath.split("/").pop() || "";
    if (baseName.includes("Order")) {
      return [
        { hash: "f921ab0", msg: "refactor: extract order transaction verification logic", author: "alex_dev", date: "3 hours ago" },
        { hash: "c3d8ef4", msg: "perf: mitigate hibernate N+1 queries in queryService", author: "jane_mgr", date: "2 days ago" },
        { hash: "b21e04a", msg: "feat: add secure Stripe payments check context", author: "alex_dev", date: "5 days ago" }
      ];
    }
    if (baseName.includes("User")) {
      return [
        { hash: "d8ef312", msg: "security: fix parameter values interpolation SQL injection", author: "jane_mgr", date: "1 day ago" },
        { hash: "a3e81ff", msg: "feat: validate request credentials syntax using Zod schema", author: "andrzej_qa", date: "4 days ago" }
      ];
    }
    return simulatedCommits["default"];
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (author: string) => {
    const name = author.replace("@", "");
    const parts = name.split(/[_-]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarGradient = (author: string) => {
    const name = author.replace("@", "");
    const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
    const gradients = [
      "from-indigo-500 to-purple-650 shadow-[0_0_8px_rgba(99,102,241,0.25)]",
      "from-pink-500 to-rose-600 shadow-[0_0_8px_rgba(244,63,94,0.25)]",
      "from-emerald-400 to-teal-600 shadow-[0_0_8px_rgba(16,185,129,0.25)]",
      "from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.25)]",
      "from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
    ];
    return gradients[code % gradients.length];
  };

  const parseCommitMsg = (msg: string) => {
    const parts = msg.split(":");
    if (parts.length > 1) {
      const type = parts[0].trim().toLowerCase();
      const cleanMsg = parts.slice(1).join(":").trim();
      
      const categories: Record<string, { label: string; color: string }> = {
        refactor: { label: "refactor", color: "bg-purple-500/10 text-purple-300 border-purple-500/20" },
        security: { label: "security", color: "bg-rose-500/10 text-rose-300 border-rose-500/20" },
        feat: { label: "feat", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
        perf: { label: "perf", color: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
        infra: { label: "infra", color: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
        fix: { label: "fix", color: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" },
        test: { label: "test", color: "bg-pink-500/10 text-pink-300 border-pink-500/20" },
        docs: { label: "docs", color: "bg-slate-500/10 text-slate-350 border-slate-500/20" }
      };

      if (categories[type]) {
        return {
          ...categories[type],
          cleanMsg
        };
      }
    }
    return {
      label: "",
      color: "",
      cleanMsg: msg
    };
  };

  const getRiskStatus = (score: number) => {
    if (score >= 75) {
      return { 
        label: "CRITICAL", 
        color: "text-rose-450 bg-rose-500/10 border-rose-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]", 
        bar: "bg-gradient-to-r from-orange-500 to-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
      };
    }
    if (score >= 50) {
      return { 
        label: "HIGH RISK", 
        color: "text-amber-450 bg-amber-500/10 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]", 
        bar: "bg-gradient-to-r from-yellow-550 to-amber-550 shadow-[0_0_8px_rgba(245,158,11,0.4)]" 
      };
    }
    if (score >= 25) {
      return { 
        label: "MODERATE", 
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", 
        bar: "bg-gradient-to-r from-blue-500 to-indigo-500" 
      };
    }
    return { 
      label: "STABLE", 
      color: "text-emerald-450 bg-emerald-500/10 border-emerald-500/20", 
      bar: "bg-gradient-to-r from-teal-500 to-emerald-500" 
    };
  };

  const getChurnStyle = (churn: number) => {
    if (churn > 60) return "text-rose-400 bg-rose-500/10 border border-rose-500/20";
    if (churn > 30) return "text-amber-450 bg-amber-500/10 border border-amber-500/20";
    return "text-emerald-450 bg-emerald-500/10 border border-emerald-500/20";
  };

  const renderFilePath = (file: string) => {
    const parts = file.split("/");
    const filename = parts.pop() || "";
    const directory = parts.join("/");
    return (
      <div className="flex items-center gap-2 min-w-0">
        <FileCode className="h-4 w-4 text-indigo-400 shrink-0" />
        <div className="truncate text-xs font-mono">
          {directory && <span className="text-slate-500 font-sans">{directory}/</span>}
          <span className="text-slate-200 font-bold group-hover:text-indigo-300 transition-colors duration-150">{filename}</span>
        </div>
      </div>
    );
  };

  // KPI Calculations
  const totalCommits = insights.reduce((acc, curr) => acc + curr.commitsCount, 0);
  
  // Calculate unique authors count based on commits
  const allAuthors = new Set<string>();
  insights.forEach(item => {
    getCommitsForFile(item.file).forEach(c => {
      allAuthors.add(c.author);
    });
  });
  const totalCollaborators = allAuthors.size || 3;

  const maxRisk = insights.length ? Math.max(...insights.map(i => i.riskScore)) : 0;
  const avgRisk = insights.length ? Math.round(insights.reduce((sum, item) => sum + item.riskScore, 0) / insights.length) : 0;

  if (insights.length === 0) {
    return (
      <div className="space-y-6 text-left p-8 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 flex flex-col items-center justify-center min-h-[350px]">
        <GitCompare className="h-12 w-12 text-slate-600 animate-pulse mb-3" />
        <h3 className="text-lg font-bold text-slate-250">No Git Insights Found</h3>
        <p className="text-xs text-slate-500 max-w-sm text-center mt-1">
          We couldn't detect git metadata or history logs for this project. Ensure you upload a repository with complete git history logs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left" id="git-insights-tab-view">
      {/* Intro Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 p-6 md:p-8 rounded-3xl text-white border border-indigo-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl shadow-slate-950/50">
        {/* Glow Effects */}
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        {/* Blueprint background grid effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="banner-grid-git" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#banner-grid-git)" />
          </svg>
        </div>

        <div className="max-w-xl relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Sparkles className="h-3 w-3 text-indigo-450" />
              Git Analytics Hub
            </span>
            <span className="text-slate-700 text-xs">•</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-455 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              History Stream Connected
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3 flex items-center gap-2.5 font-sans">
            <GitCompare className="h-7 w-7 text-indigo-400" />
            Git Churn & Hotspots
          </h2>
          <p className="text-slate-450 text-xs md:text-sm leading-relaxed font-normal">
            Visualizes commit frequency, team collaborations, code churn rates, and hotspot risk factors to isolate regression vulnerability components.
          </p>
        </div>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-4.5 rounded-2xl flex flex-col justify-between group hover:border-slate-700/60 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Monitored Files</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-450 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <FileCode className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-200">{insights.length}</div>
            <p className="text-[10px] text-slate-550 mt-1">Codebase files tracked in history</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-4.5 rounded-2xl flex flex-col justify-between group hover:border-slate-700/60 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Commit Volume</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-450 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <GitCommit className="h-4 w-4 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-200">{totalCommits}</div>
            <p className="text-[10px] text-slate-550 mt-1">Aggregate tracked changes</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-4.5 rounded-2xl flex flex-col justify-between group hover:border-slate-700/60 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Collaborators</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-450 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-200">{totalCollaborators}</div>
            <p className="text-[10px] text-slate-550 mt-1">Active engineers detected</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-4.5 rounded-2xl flex flex-col justify-between group hover:border-slate-700/60 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Hotspot Risk Index</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-450 border border-rose-500/20 group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-slate-200 flex items-baseline gap-1">
              <span>{maxRisk}%</span>
              <span className="text-[10px] text-slate-500 font-sans font-medium">peak / {avgRisk}% avg</span>
            </div>
            <p className="text-[10px] text-slate-550 mt-1">Highest vulnerability zone score</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Churn List Table */}
        <div className="bg-slate-900/40 backdrop-blur-md p-5.5 rounded-2xl border border-slate-800/80 shadow-xl space-y-4 xl:col-span-7 2xl:col-span-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-sans">Repository Hotspots Map</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Filter and select files to inspect git history logs</p>
              </div>
              
              {/* Search filter input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by file path..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950/65 border border-slate-800/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 w-full sm:w-56 focus:outline-none focus:border-indigo-500 transition-colors focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-slate-850/60 bg-slate-950/20">
              <table className="w-full text-xs text-slate-350 text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400 text-[10px] uppercase font-bold tracking-wider bg-slate-950/40">
                    <th className="py-3 px-4 font-sans font-semibold">File Path</th>
                    <th className="py-3 px-3 text-center font-sans font-semibold">Commits</th>
                    <th className="py-3 px-3 text-center font-sans font-semibold">Authors</th>
                    <th className="py-3 px-3 text-center font-sans font-semibold">Churn Rate</th>
                    <th className="py-3 px-4 text-right font-sans font-semibold">Hotspot Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/30 font-mono">
                  {filteredInsights.length > 0 ? (
                    filteredInsights.map((item, idx) => {
                      const isSelected = selectedFile === item.file;
                      const risk = getRiskStatus(item.riskScore);
                      
                      return (
                        <tr 
                          key={idx}
                          onClick={() => setSelectedFile(item.file)}
                          className={`group cursor-pointer transition-all duration-150 ${
                            isSelected 
                              ? "bg-indigo-500/10 text-white" 
                              : "hover:bg-slate-800/30 hover:text-slate-200"
                          }`}
                        >
                          <td className="py-3.5 px-4 min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <div className={`w-1 h-5 rounded-full shrink-0 transition-all duration-300 ${isSelected ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-transparent'}`} />
                              {renderFilePath(item.file)}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className="font-mono bg-slate-900/60 border border-slate-800/50 px-2 py-0.5 rounded text-[11px] font-medium text-slate-300">
                              {item.commitsCount}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className="font-mono bg-slate-900/60 border border-slate-800/50 px-2 py-0.5 rounded text-[11px] font-medium text-slate-300">
                              {item.authorsCount}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${getChurnStyle(item.churnRate)}`}>
                              {item.churnRate}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-3.5">
                              <div className="flex flex-col items-end">
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border font-sans tracking-wide leading-none mb-1.5 ${risk.color}`}>
                                  {risk.label}
                                </span>
                                <span className="font-mono font-black text-slate-200 text-xs leading-none">{item.riskScore}%</span>
                              </div>
                              <div className="w-16 h-1.5 bg-slate-950 rounded-full overflow-hidden shrink-0 border border-slate-850">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${risk.bar}`}
                                  style={{ width: `${item.riskScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                        No files matching selection. Try resetting filter input.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Commit Stream Details & Helper Churn Explanation */}
        <div className="xl:col-span-5 2xl:col-span-4 flex flex-col justify-between gap-6">
          {activeInsight ? (
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl text-white space-y-5 relative overflow-hidden flex-1 flex flex-col justify-between">
              {/* Background gradient decorative glow */}
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
              
              <div>
                {/* Panel Header */}
                <div className="border-b border-slate-800/80 pb-4 text-left relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-indigo-400 font-mono text-[9px] uppercase font-bold tracking-wider block">
                      Git History Tracing
                    </span>
                    <button
                      onClick={() => handleCopyPath(activeInsight.file)}
                      className="text-slate-500 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-800 cursor-pointer"
                      title="Copy file path"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1.5">
                    <h4 className="text-sm font-bold text-white font-mono truncate max-w-[200px]" title={activeInsight.file}>
                      {activeInsight.file.split("/").pop()}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-sans font-normal truncate max-w-[120px]" title={activeInsight.file}>
                      ({activeInsight.file.substring(0, activeInsight.file.lastIndexOf("/")) || "."})
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap mt-2.5">
                    <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                      <Users className="h-3 w-3 text-slate-550" />
                      Authors: <strong className="text-slate-200 font-bold">{activeInsight.authorsCount}</strong>
                    </span>
                    <span className="text-slate-700">•</span>
                    <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-rose-500 animate-pulse" />
                      Risk Index: <strong className="text-rose-455 font-bold">{activeInsight.riskScore}%</strong>
                    </span>
                  </div>
                </div>

                {/* Commits logs stream */}
                <div className="space-y-4 text-left mt-5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block font-sans">
                    Recent Commit Messages
                  </span>

                  <div className="relative pl-8 space-y-6 max-h-[350px] overflow-y-auto custom-scrollbar pr-1.5 py-1">
                    {/* The timeline track line */}
                    <div className="absolute left-[13px] top-2.5 bottom-2.5 w-[2px] bg-gradient-to-b from-indigo-500 via-purple-550 to-slate-800/30" />
                    
                    {getCommitsForFile(activeInsight.file).map((c, i) => {
                      const initials = getInitials(c.author);
                      const grad = getAvatarGradient(c.author);
                      const parsed = parseCommitMsg(c.msg);
                      
                      return (
                        <div key={i} className="relative group">
                          {/* Timeline Node Icon */}
                          <div className={`absolute left-0 top-1 w-6.5 h-6.5 rounded-full flex items-center justify-center border border-slate-950 z-10 transition-transform duration-200 group-hover:scale-110 ${
                            i === 0 
                              ? "bg-indigo-650 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]" 
                              : "bg-slate-900 text-slate-450 border-slate-800"
                          }`}>
                            <GitCommit className={`h-3.5 w-3.5 ${i === 0 ? "animate-pulse text-white" : "text-slate-500"}`} />
                          </div>

                          {/* Commit content container */}
                          <div className="pl-9 space-y-2">
                            <div className="bg-slate-950/45 border border-slate-850/65 hover:border-slate-800/80 rounded-xl p-3 transition-all duration-200 shadow-inner">
                              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[9px] font-bold text-indigo-405 bg-indigo-950/50 border border-indigo-900/40 px-1.5 py-0.5 rounded shadow-sm">
                                    {c.hash}
                                  </span>
                                  {parsed.label && (
                                    <span className={`text-[8.5px] uppercase font-extrabold px-1.5 py-0.2 rounded border tracking-wider ${parsed.color}`}>
                                      {parsed.label}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] text-slate-500 font-medium flex items-center gap-0.5">
                                  <History className="h-2.5 w-2.5" />
                                  {c.date}
                                </span>
                              </div>
                              
                              <p className="text-[11.5px] text-slate-205 leading-relaxed font-sans mt-2" title={c.msg}>
                                {parsed.cleanMsg}
                              </p>

                              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-900/50">
                                <div className={`h-5.5 w-5.5 rounded-full bg-gradient-to-tr ${grad} flex items-center justify-center text-[8px] font-black text-white`}>
                                  {initials}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  @{c.author}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/85 p-6 rounded-2xl text-slate-450 text-xs text-center flex flex-col justify-center items-center h-64 font-sans flex-1">
              <Users className="h-8 w-8 text-slate-700 mb-2" />
              Select a file row to inspect complete commit logs.
            </div>
          )}

          {/* Advisory Explanation Card */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl text-xs text-slate-450 font-sans space-y-4 text-left relative overflow-hidden group">
            <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="font-sans">Predictive Advisor: Code Churn</span>
              </div>
              <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400 font-bold">
                PREDICTIVE DATA
              </span>
            </div>
            
            <p className="leading-relaxed text-slate-350 font-normal">
              Code Churn measures the frequency of edits, deletions, and additions on a file over time. 
              High churn combined with multiple developers indicate complex hotspot zones susceptible to regressions.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/50">
              <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-900/60">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-0.5">Risk Threshold</span>
                <span className="text-xs font-bold text-slate-250 font-mono">Churn &gt; 50%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-900/60">
                <span className="text-[10px] text-slate-550 uppercase tracking-wider block font-bold mb-0.5">Action Plan</span>
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-0.5">
                  Refactor Modules <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
