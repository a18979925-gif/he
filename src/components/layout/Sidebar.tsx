import React from "react";
import {
  Layout,
  Cpu,
  Layers,
  GitBranch,
  Play,
  Globe,
  Database,
  Terminal,
  FileCode,
  Activity,
  ShieldAlert,
  TrendingUp,
  FileText,
  Settings
} from "lucide-react";
import { CodeScopeAnalysis } from "../../types";

interface SidebarProps {
  activeProject: CodeScopeAnalysis;
  projectSource: 'sample' | 'uploaded';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeProject,
  projectSource,
  activeTab,
  setActiveTab,
  showSettings,
  setShowSettings,
}) => {
  return (
    <aside className="lg:w-64 bg-slate-900 text-slate-400 border-r border-slate-800 flex flex-col justify-between shrink-0">
      <div className="p-4 flex-1">
        {/* Project status card */}
        <div className="mb-4">
          <span className="text-slate-600 uppercase tracking-widest text-[10px] font-bold block mb-2 px-3">Project Status</span>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${projectSource === 'sample' ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`}></div>
              <span className="text-white text-xs font-semibold truncate block max-w-[170px]">{activeProject.projectName}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Source: {projectSource === 'sample' ? 'Local Pack' : 'User Upload'}</span>
              <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono text-[9px]">
                {activeProject.projectDNA.languages[0]?.name || "AST"}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Insight Navigation links */}
        <nav className="space-y-1">
          <span className="text-slate-600 uppercase tracking-widest text-[10px] font-bold block mb-2 mt-4 px-3">Primary Insights</span>
          
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "dashboard" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Layout className="h-4 w-4 text-indigo-400" />
              <span>Dashboard (Overview)</span>
            </div>
            <span className="bg-indigo-950/80 text-indigo-400 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono">
              {activeProject.healthScore}%
            </span>
          </button>

          <button
            onClick={() => setActiveTab("code-helper")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "code-helper" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <span>Interactive Code Helper</span>
            </div>
            <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
              AST
            </span>
          </button>

          <button
            onClick={() => setActiveTab("architecture")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "architecture" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="h-4 w-4 text-pink-400" />
              <span>Architecture Explorer</span>
            </div>
            <span className="text-slate-600 text-[10px]">Graph</span>
          </button>

          <button
            onClick={() => setActiveTab("dependency")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "dependency" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <GitBranch className="h-4 w-4 text-teal-400" />
              <span>Dependency Explorer</span>
            </div>
            <span className="bg-teal-950 text-teal-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
              {activeProject.dependencyGraph.nodes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("runtime")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "runtime" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Play className="h-4 w-4 text-emerald-400" />
              <span>Runtime Simulator</span>
            </div>
            <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">Live</span>
          </button>

          <span className="text-slate-600 uppercase tracking-widest text-[10px] font-bold block mb-2 mt-4 px-3">Module Inspectors</span>

          <button
            onClick={() => setActiveTab("api")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "api" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 text-sky-400" />
              <span>API Inspector (Swagger)</span>
            </div>
            <span className="bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
              {activeProject.endpoints.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("database")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "database" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Database className="h-4 w-4 text-amber-400" />
              <span>Database Reverse ERD</span>
            </div>
            <span className="text-slate-600 text-[10px]">SQL</span>
          </button>

          <button
            onClick={() => setActiveTab("sql-terminal")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "sql-terminal" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>SQL Terminal Playground</span>
            </div>
            <span className="bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">RAW</span>
          </button>

          <button
            onClick={() => setActiveTab("files")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "files" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <FileCode className="h-4 w-4 text-violet-400" />
              <span>Code Explorer & Search</span>
            </div>
            <span className="text-slate-600 text-[10px]">SRC</span>
          </button>

          <span className="text-slate-600 uppercase tracking-widest text-[10px] font-bold block mb-2 mt-4 px-3">Quality & Reports</span>

          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "diagnostics" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              <span>Diagnostics & Autofix</span>
            </div>
            <span className="bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
              {(activeProject.security?.length || 0) + (activeProject.performance?.length || 0) + (activeProject.bugs?.length || 0) + (activeProject.codeSmells?.length || 0)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("analysis")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "analysis" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>Import Coupling Explorer</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "security" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-red-400" />
              <span>Security Vulnerabilities</span>
            </div>
            <span className="bg-red-950 text-red-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
              {activeProject.security?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("performance")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "performance" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              <span>Performance Radar</span>
            </div>
            <span className="bg-orange-950 text-orange-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
              {activeProject.performance?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("complexity")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "complexity" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="h-4 w-4 text-yellow-400" />
              <span>Refactor Radar</span>
            </div>
            <span className="text-slate-600 text-[10px]">LOC</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "reports" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-purple-400" />
              <span>Executive Reports</span>
            </div>
            <span className="text-slate-600 text-[10px]">PDF</span>
          </button>

          <span className="text-slate-600 uppercase tracking-widest text-[10px] font-bold block mb-2 mt-4 px-3">Advanced Diagnostics</span>

          <button
            onClick={() => setActiveTab("compliance")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "compliance" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              <span>Compliance Auditing</span>
            </div>
            <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
              {activeProject.compliance?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("logs-stream")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "logs-stream" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="h-4 w-4 text-rose-400 animate-pulse" />
              <span>Sentry Exception Logs</span>
            </div>
            <span className="bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
              {activeProject.crashLogs?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("git-insights")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "git-insights" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <GitBranch className="h-4 w-4 text-indigo-400" />
              <span>Git Churn Hotspots</span>
            </div>
            <span className="text-slate-650 text-[10px]">GIT</span>
          </button>

          <button
            onClick={() => setActiveTab("benchmark")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "benchmark" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="h-4 w-4 text-amber-400" />
              <span>JS Microbenchmarks</span>
            </div>
            <span className="text-slate-650 text-[10px] font-mono">JS</span>
          </button>

          <button
            onClick={() => setActiveTab("dead-code")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "dead-code" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="h-4 w-4 text-rose-500 animate-bounce" />
              <span>Dead Code Detector</span>
            </div>
            <span className="bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
              🔥
            </span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "timeline" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Architecture Timeline</span>
            </div>
            <span className="text-slate-600 text-[10px]">DIFF</span>
          </button>
        </nav>
      </div>

      {/* Settings configuration trigger footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="hover:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Settings className="h-3.5 w-3.5" /> Configure Scope
          </button>
          <span>v2.4.0</span>
        </div>
      </div>
    </aside>
  );
};
