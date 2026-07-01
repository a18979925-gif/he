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
  Settings,
  Sparkles,
  LogOut,
  Award,
  Copy,
  Lock,
  Scale,
  Shield,
  Users,
  MessageSquare,
  Crown,
  UserPlus
} from "lucide-react";
import { CodeScopeAnalysis } from "../../types";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { useAuthStore, apiFetch } from "../../stores/authStore";


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
  const [currentUser, setCurrentUser] = React.useState<FirebaseUser | null>(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <aside className="lg:w-64 bg-[#0a0a0f]/80 backdrop-blur-xl text-slate-400 border-r border-indigo-500/10 flex flex-col justify-between shrink-0">
      <div className="p-4 flex-1">
        {/* Project status card */}
        <div className="mb-4">
          <span className="text-slate-500 uppercase tracking-widest text-[10px] font-bold block mb-2 px-3">Project Status</span>
          <div className="bg-[#0c0e14]/60 backdrop-blur-md p-3 rounded-xl border border-indigo-500/10 shadow-lg">
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
            onClick={() => setActiveTab("cto-suite")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "cto-suite" ? "bg-slate-800 text-white font-semibold border-l-2 border-indigo-500 pl-2.5" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span className="font-bold text-white">CTO Suite (Premium)</span>
            </div>
            <span className="bg-indigo-955 text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
              AI
            </span>
          </button>

          <button
            onClick={() => setActiveTab("total-analyze")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "total-analyze" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Total Analyze</span>
            </div>
            <span className="bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
              AI+
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

          <span className="text-slate-600 uppercase tracking-widest text-[10px] font-bold block mb-2 mt-4 px-3">Team Mode</span>

          {/* Team Mode Section */}
          <TeamModeSection setActiveTab={setActiveTab} activeTab={activeTab} />

          <span className="text-slate-600 uppercase tracking-widest text-[10px] font-bold block mb-2 mt-4 px-3">Audit & Shields</span>

          <button
            onClick={() => setActiveTab("coverage")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "coverage" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Award className="h-4 w-4 text-emerald-400" />
              <span>Test Coverage Explorer</span>
            </div>
            <span className="bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">78%</span>
          </button>

          <button
            onClick={() => setActiveTab("duplication")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "duplication" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Copy className="h-4 w-4 text-cyan-400" />
              <span>Duplicate Code Detector</span>
            </div>
            <span className="bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">AST</span>
          </button>

          <button
            onClick={() => setActiveTab("secrets")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "secrets" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Lock className="h-4 w-4 text-amber-400" />
              <span>Secret Scanner</span>
            </div>
            <span className="bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">LOCK</span>
          </button>

          <button
            onClick={() => setActiveTab("license")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "license" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Scale className="h-4 w-4 text-sky-400" />
              <span>License Compliance</span>
            </div>
            <span className="bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">MIT</span>
          </button>

          <button
            onClick={() => setActiveTab("dep-vuln")}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${activeTab === "dep-vuln" ? "bg-slate-800 text-white font-semibold" : "hover:bg-slate-800/40 hover:text-slate-200"}`}
          >
            <div className="flex items-center gap-2.5">
              <Shield className="h-4 w-4 text-rose-400" />
              <span>Dependency Vulnerabilities</span>
            </div>
            <span className="bg-rose-950 text-rose-405 text-rose-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">CVE</span>
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

      {/* User Profile Card */}
      {currentUser && (
        <div className="p-3 mx-4 mb-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between gap-2.5 text-left shadow-lg shadow-slate-950/40 select-none">
          <div className="flex items-center gap-2 min-w-0">
            <img 
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.email || "")}`} 
              alt="User Avatar" 
              className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 shrink-0"
            />
            <div className="min-w-0">
              <span className="text-white text-xs font-bold block truncate">
                {currentUser.displayName || currentUser.email?.split("@")[0] || "User"}
              </span>
              <span className="text-[9px] text-slate-500 block truncate font-medium">
                {currentUser.email === "admin@codescope.com" ? "Administrator" : "Security Engineer"}
              </span>
            </div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="text-slate-500 hover:text-rose-450 hover:bg-slate-900/60 p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer shrink-0 border border-transparent hover:border-slate-800"
            title="Log Out"
          >
            <LogOut size={12} />
          </button>
        </div>
      )}

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

// ─── TeamModeSection ─────────────────────────────────────────────────────────
// Lazy import to avoid circular deps
const AuthModal = React.lazy(() => import("../auth/AuthModal"));
const TeamDashboard = React.lazy(() => import("../team/TeamDashboard"));

function TeamModeSection({ setActiveTab, activeTab }: { setActiveTab: (t: string) => void; activeTab: string }) {
  const { user, teams, logout } = useAuthStore();
  const [showAuth, setShowAuth] = React.useState(false);
  const [showTeam, setShowTeam] = React.useState<string | null>(null);
  const [showCreateTeam, setShowCreateTeam] = React.useState(false);
  const [newTeamName, setNewTeamName] = React.useState("");

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      const team = await apiFetch("/api/auth/teams", { method: "POST", body: JSON.stringify({ name: newTeamName.trim() }) });
      useAuthStore.getState().setTeams([...useAuthStore.getState().teams, team]);
      setNewTeamName("");
      setShowCreateTeam(false);
      setShowTeam(team.id);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <>
      {!user ? (
        <div className="px-3 space-y-1.5">
          <button
            onClick={() => setShowAuth(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-500/20 text-indigo-300 hover:from-indigo-500/25 hover:to-violet-500/25 transition-all"
          >
            <Users size={13} /> Login / Register
          </button>
          <p className="text-[9px] text-slate-600 text-center">Login to access Team Mode</p>
        </div>
      ) : (
        <div className="px-3 space-y-2">
          {/* User pill */}
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-2.5 py-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-white truncate">@{user.username}</div>
              <div className="text-[9px] text-slate-600">Solo mode</div>
            </div>
            <button onClick={logout} className="text-slate-600 hover:text-rose-400 transition-colors p-1" title="Logout">
              <LogOut size={11} />
            </button>
          </div>

          {/* Teams */}
          {teams.length > 0 && (
            <div className="space-y-1">
              {teams.map((t: any) => (
                <button key={t.id} onClick={() => window.open(`${window.location.origin}${window.location.pathname}?team=${t.id}`, '_blank')}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-[11px] rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all text-slate-300">
                  <Users size={12} className="text-indigo-400 shrink-0" />
                  <span className="truncate font-semibold">{t.name}</span>
                  <MessageSquare size={11} className="text-slate-600 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Create team */}
          {!showCreateTeam ? (
            <button onClick={() => setShowCreateTeam(true)}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-[10px] font-semibold rounded-lg border border-dashed border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all">
              <UserPlus size={12} /> New Team
            </button>
          ) : (
            <div className="space-y-1.5">
              <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                placeholder="Team name..."
                className="w-full bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
              />
              <div className="flex gap-1.5">
                <button onClick={handleCreateTeam} className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-bold py-1.5 rounded-lg hover:opacity-90 transition-all">Create</button>
                <button onClick={() => setShowCreateTeam(false)} className="text-slate-500 hover:text-slate-300 text-[10px] px-2 rounded-lg border border-white/8 hover:bg-white/5 transition-all">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <React.Suspense fallback={null}>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
        {showTeam && <TeamDashboard teamId={showTeam} onClose={() => setShowTeam(null)} />}
      </React.Suspense>
    </>
  );
}
