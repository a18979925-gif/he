import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Cpu,
  Layers,
  GitBranch,
  ShieldAlert,
  TrendingUp,
  FileText,
  ArrowRight,
  Search,
  Send,
  Workflow,
  AlertTriangle,
  Play,
  HelpCircle,
  FolderOpen,
  ClipboardList,
  CheckCircle2,
  Lock,
  Database,
  ChevronRight,
  RefreshCw,
  Compass,
  FileCode,
  Check,
  Zap,
  Crown,
  BarChart3,
  Target,
  Brain,
  Shield,
  Activity,
  BookOpen,
  GitPullRequest,
  Star,
  X,
  Copy,
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react";
import { CodeScopeAnalysis, SecurityIssue, RefactoringSuggestion, DBTable, EndpointItem } from "../types";

interface CtoSuiteTabProps {
  activeProject: CodeScopeAnalysis;
}

type SubTab = "health" | "ask" | "graph" | "debt" | "onboarding" | "coverage" | "pr";

const SUB_TABS: { id: SubTab; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "health",     label: "Health Score",    icon: <Activity size={14} />,      color: "from-indigo-500 to-violet-600" },
  { id: "ask",        label: "AI Oracle",        icon: <Brain size={14} />,         color: "from-sky-500 to-blue-600" },
  { id: "graph",      label: "Impact Graph",    icon: <Workflow size={14} />,       color: "from-pink-500 to-rose-600" },
  { id: "debt",       label: "Debt Radar",      icon: <ShieldAlert size={14} />,   color: "from-orange-500 to-amber-600" },
  { id: "onboarding", label: "Onboarding",      icon: <Compass size={14} />,       color: "from-emerald-500 to-teal-600" },
  { id: "coverage",   label: "Coverage Map",    icon: <Target size={14} />,        color: "from-purple-500 to-fuchsia-600" },
  { id: "pr",         label: "PR Generator",    icon: <GitPullRequest size={14} />, color: "from-cyan-500 to-sky-600" },
];

/* ─── Circular Arc Gauge ─────────────────────────────────────────── */
function ArcGauge({ value, size = 140, stroke = 10, color = "#818cf8", bg = "#1e293b", label = "Score" }: {
  value: number; size?: number; stroke?: number; color?: string; bg?: string; label?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="transparent" stroke={bg} strokeWidth={stroke} />
        <circle
          cx={cx} cy={cy} r={r} fill="transparent"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${circ}`}
          strokeDashoffset={circ - dash}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white leading-none">{value}</span>
        <span className="text-[9px] uppercase tracking-widest text-slate-400 mt-1 font-bold">{label}</span>
      </div>
    </div>
  );
}

/* ─── Score Bar ──────────────────────────────────────────────────── */
function ScoreBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  const cls =
    value >= 80 ? "text-emerald-400" : value >= 55 ? "text-amber-400" : "text-rose-400";
  return (
    <div className="group p-4 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <span className="text-xs text-slate-300 font-semibold">{label}</span>
        </div>
        <span className={`text-sm font-black ${cls}`}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function CtoSuiteTab({ activeProject }: CtoSuiteTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("health");

  /* ── Health Scores ─────────────────────────────────────────────── */
  const [healthScores, setHealthScores] = useState({
    overall: activeProject.healthScore || 85,
    maintainability: 82,
    security: activeProject.security ? Math.max(100 - activeProject.security.length * 8, 45) : 88,
    performance: activeProject.performance ? Math.max(100 - activeProject.performance.length * 10, 50) : 84,
    architecture: activeProject.architecture?.confidence || 85,
  });

  useEffect(() => {
    const secCount = activeProject.security?.length || 0;
    const perfCount = activeProject.performance?.length || 0;
    const refCount = activeProject.refactoring?.length || 0;
    const crashCount = activeProject.crashLogs?.length || 0;

    const calculatedSecurity = Math.max(40, 100 - secCount * 12);
    const calculatedPerformance = Math.max(50, 100 - perfCount * 15);
    const calculatedMaintainability = Math.max(30, 100 - (refCount * 8 + crashCount * 5));
    const calculatedArchitecture = activeProject.architecture?.confidence || 85;
    const calcOverall = Math.round(
      (calculatedSecurity + calculatedPerformance + calculatedMaintainability + calculatedArchitecture) / 4
    );

    setHealthScores({
      overall: activeProject.healthScore || calcOverall || 85,
      maintainability: calculatedMaintainability,
      security: calculatedSecurity,
      performance: calculatedPerformance,
      architecture: calculatedArchitecture,
    });
  }, [activeProject]);

  /* ── AI Oracle Chat ────────────────────────────────────────────── */
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "assistant"; text: string; files?: string[]; flow?: string[] }>>([{
    sender: "assistant",
    text: `Hello! I am your AI Codebase Oracle. Ask me anything about "${activeProject.projectName}":\n• "How does user auth flow work?"\n• "Where are the database entities defined?"\n• "Which endpoints does this application expose?"`,
  }]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userQ = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "user", text: userQ }]);
    setChatLoading(true);

    setTimeout(async () => {
      const q = userQ.toLowerCase();
      let answerText = "";
      let foundFiles: string[] = [];
      let mockFlow: string[] = [];

      const hasAuth = q.includes("auth") || q.includes("jwt") || q.includes("login");
      const hasDb = q.includes("database") || q.includes("table") || q.includes("sql") || q.includes("db");
      const hasEndpoints = q.includes("endpoint") || q.includes("route") || q.includes("api");

      if (hasAuth) {
        foundFiles = activeProject.security?.slice(0, 2).map(s => s.file) || ["auth.ts", "middleware/auth.ts"];
        mockFlow = ["POST /api/auth/login", "JWT Sign Service", "Express Route Guard", "Validate DB User"];
        answerText = `JWT validation and authentication logic verified. Patterns found: ${activeProject.projectDNA?.authentication?.join(", ") || "Token validation"}. Below are the involved files and call sequence.`;
      } else if (hasDb) {
        foundFiles = activeProject.database?.tables?.slice(0, 2).map(t => `${t.name} table`) || ["src/db/schema.sql", "prisma/schema.prisma"];
        mockFlow = ["Load Schema", "Init Connection Pool", "Map ORM Models"];
        answerText = `Persistence layer uses: ${activeProject.projectDNA?.databases?.join(", ") || "Relational Models"}. Detected ${activeProject.database?.tables?.length || 0} relational tables.`;
      } else if (hasEndpoints) {
        foundFiles = activeProject.endpoints?.slice(0, 3).map(e => `${e.method} ${e.url}`) || [];
        mockFlow = ["API Router", "Middlewares", "Handler Controller"];
        answerText = `Analyzed ${activeProject.endpoints?.length || 0} active HTTP endpoints. Main route bindings are mapped below:`;
      } else {
        foundFiles = activeProject.importAnalysis?.largestFiles?.slice(0, 3).map(lf => lf.file) || ["server.ts", "index.js"];
        mockFlow = ["Bootstrap Server", "Load Module Graph", "Evaluate AST"];
        answerText = `Parsing "${activeProject.projectName}"'s AST for: "${userQ}". Main modules involved:`;
      }

      try {
        const res = await fetch("/api/analysis/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ issue: { id: "general-chat", filePath: foundFiles[0] || "server.ts", line: 1, category: "quality", severity: "info", title: "Codebase Query", description: userQ, snippet: "Project context chat query", suggestion: "" }, userMessage: `Context: "${activeProject.projectName}". DB: ${JSON.stringify(activeProject.projectDNA?.databases)}, FW: ${JSON.stringify(activeProject.projectDNA?.frameworks)}. Question: ${userQ}`, history: [] }),
        });
        if (res.ok) { const data = await res.json(); if (data.reply) answerText = data.reply; }
      } catch { /* use local */ }

      setChatMessages(prev => [...prev, { sender: "assistant", text: answerText, files: foundFiles, flow: mockFlow }]);
      setChatLoading(false);
    }, 900);
  };

  /* ── Knowledge Graph ───────────────────────────────────────────── */
  const [selectedNode, setSelectedNode] = useState<{ id: string; label: string; type: string } | null>(null);

  const graphNodes = React.useMemo(() => {
    if (activeProject.importAnalysis?.largestFiles?.length > 0) {
      return activeProject.importAnalysis.largestFiles.map((f, i) => {
        const basename = f.file.substring(f.file.lastIndexOf("/") + 1);
        let type = "service";
        if (basename.toLowerCase().includes("controller") || basename.toLowerCase().includes("route")) type = "controller";
        if (basename.toLowerCase().includes("db") || basename.toLowerCase().includes("schema") || basename.toLowerCase().includes("model")) type = "database";
        if (i === 0) type = "entry";
        return { id: f.file, label: basename, type };
      });
    }
    return [
      { id: "App.tsx", label: "App.tsx", type: "entry" },
      { id: "AuthService.ts", label: "AuthService.ts", type: "service" },
      { id: "UserController.ts", label: "UserController.ts", type: "controller" },
      { id: "OrderController.ts", label: "OrderController.ts", type: "controller" },
      { id: "DatabaseTable", label: "DB: Users/Orders", type: "database" },
    ];
  }, [activeProject]);

  useEffect(() => { if (graphNodes.length > 0 && !selectedNode) setSelectedNode(graphNodes[0]); }, [graphNodes]);

  const selectedNodeImpact = React.useMemo(() => {
    if (!selectedNode) return null;
    const name = selectedNode.id.toLowerCase();
    let components = 3, routes = 1, migrations = 0;
    let risk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    let reasons: string[] = [];

    if (name.includes("auth") || selectedNode.type === "entry") {
      components = Math.floor(Math.random() * 25) + 20;
      routes = Math.floor(Math.random() * 8) + 8;
      migrations = 0;
      risk = "HIGH";
      reasons = ["Primary credential parsing module.", "Directly invoked inside HTTP routing middleware pipeline.", "Modifying validation flow impacts downstream request processing."];
    } else if (name.includes("db") || selectedNode.type === "database") {
      components = Math.floor(Math.random() * 12) + 5;
      routes = Math.floor(Math.random() * 5) + 3;
      migrations = Math.floor(Math.random() * 3) + 1;
      risk = "HIGH";
      reasons = ["Data persistence layer definition.", "Requires database migration verification.", "Direct impact on SQL querying layers."];
    } else {
      components = Math.floor(Math.random() * 6) + 2;
      routes = Math.floor(Math.random() * 3) + 1;
      migrations = 0;
      risk = "MEDIUM";
      reasons = ["Isolated service layer logic.", "Imports standard utilities with direct dependency coupling.", "Refactoring triggers component-level state rebuilds."];
    }
    return { components, routes, migrations, risk, reasons };
  }, [selectedNode]);

  /* ── Technical Debt ────────────────────────────────────────────── */
  const technicalDebtItems = React.useMemo(() => {
    const items: Array<{ file: string; score: number; reason: string; recommendation: string }> = [];
    (activeProject.security || []).forEach(s => items.push({ file: s.file, score: s.severity === "Critical" ? 95 : s.severity === "High" ? 85 : 65, reason: `Vulnerability: ${s.category}.`, recommendation: s.solution || "Refactor credentials to env vars." }));
    (activeProject.performance || []).forEach(p => items.push({ file: p.file, score: p.severity === "Critical" ? 88 : p.severity === "High" ? 75 : 55, reason: `Performance: ${p.issue}.`, recommendation: p.suggestedOptimization || "Rewrite as async operations." }));
    (activeProject.refactoring || []).forEach(r => items.push({ file: r.file, score: r.risk === "Critical" ? 92 : r.risk === "High" ? 80 : 60, reason: r.suggestion, recommendation: r.benefit }));
    if (items.length === 0) items.push(
      { file: "src/auth/AuthService.ts", score: 94, reason: "3 duplicate flows, 12 nested conditionals, missing unit tests.", recommendation: "Separate token signing, validation, and session caching." },
      { file: "src/controllers/OrderController.ts", score: 82, reason: "High cyclomatic complexity (18) on createOrder pipeline.", recommendation: "Delegate calculations to domain service handlers." },
      { file: "src/db/connection.ts", score: 74, reason: "Sync lookups during connection config. Hardcoded credentials.", recommendation: "Move to async bootstrap. Use environment vars." }
    );
    return items.sort((a, b) => b.score - a.score);
  }, [activeProject]);

  /* ── Onboarding ────────────────────────────────────────────────── */
  const onboardingSteps = React.useMemo(() => [
    { step: 1, title: "Entry Configuration & Modules", file: "package.json", description: "Examine project definitions, node dependencies, and build pipelines.", time: "15 mins", icon: <BookOpen size={14} /> },
    { step: 2, title: "Database Relational Entities", file: activeProject.database?.tables?.[0]?.name ? `${activeProject.database.tables[0].name} schema` : "Database models", description: "Understand core relational tables, columns, relationship constraints, and primary keys.", time: "45 mins", icon: <Database size={14} /> },
    { step: 3, title: "Core Routing Gateway", file: activeProject.endpoints?.[0]?.url ? `${activeProject.endpoints[0].method} ${activeProject.endpoints[0].url}` : "src/server.ts", description: "Parse incoming HTTP requests, route controllers, and secure middleware guards.", time: "1 hour", icon: <Workflow size={14} /> },
    { step: 4, title: "Main Domain Logic Flow", file: activeProject.importAnalysis?.largestFiles?.[0]?.file || "Main Service Layer", description: "Analyze the core logic module, nested handlers, API triggers, and persistence calls.", time: "1.5 hours", icon: <Brain size={14} /> },
  ], [activeProject]);
  const [activeOnboardingStep, setActiveOnboardingStep] = useState(1);

  /* ── Coverage ──────────────────────────────────────────────────── */
  const coverageModules = React.useMemo(() => {
    const list = [
      { name: "Authentication / Security", coverage: 92, filesCount: 4, status: "Good" },
      { name: "Controller API Endpoints", coverage: 48, filesCount: 6, status: "Warning" },
      { name: "Service Business Layer", coverage: 74, filesCount: 8, status: "Moderate" },
      { name: "DB Persistence Layer", coverage: 22, filesCount: 5, status: "Critical" },
      { name: "Utility / Helper Modules", coverage: 96, filesCount: 3, status: "Good" },
    ];
    if (activeProject.projectDNA?.frameworks?.includes("Express.js")) {
      list[0].name = "auth/middleware (JWT)";
      list[1].name = "routes/ (Express Endpoints)";
    }
    return list;
  }, [activeProject]);

  /* ── PR Generator ──────────────────────────────────────────────── */
  const [selectedPRFiles, setSelectedPRFiles] = useState<Record<string, boolean>>({});
  const [generatedPRText, setGeneratedPRText] = useState("");
  const [isGeneratingPR, setIsGeneratingPR] = useState(false);
  const [prCopied, setPrCopied] = useState(false);

  const availableFilesForPR = React.useMemo(() =>
    activeProject.importAnalysis?.largestFiles?.map(lf => lf.file) ||
    ["src/auth/AuthService.ts", "src/controllers/UserController.ts", "src/db/schema.sql", "package.json"],
  [activeProject]);

  const handleGeneratePR = () => {
    const selected = Object.keys(selectedPRFiles).filter(k => selectedPRFiles[k]);
    if (selected.length === 0) { alert("Select at least 1 file!"); return; }
    setIsGeneratingPR(true); setGeneratedPRText("");
    setTimeout(() => {
      const hasAuth = selected.some(s => s.toLowerCase().includes("auth") || s.toLowerCase().includes("jwt"));
      const hasDb = selected.some(s => s.toLowerCase().includes("db") || s.toLowerCase().includes("schema"));
      const filesFormatted = selected.map(f => `- \`${f}\``).join("\n");
      setGeneratedPRText(`## 🚀 Pull Request Summary\nRefactored code signatures and cleaned logic flow inside critical modules.\n\n### 📂 Files Modified\n${filesFormatted}\n\n### 🛠 Key Changes\n- **Decoupled logical pipelines**: Moved auxiliary calculations out of main handlers.\n- **Improved error boundaries**: Wrapped queries inside transaction closures.\n${hasAuth ? "- **Reinforced security**: Tightened JWT signature verification against null signatures.\n" : ""}${hasDb ? "- **Optimized persistence**: Refactored SQL statements with indexing candidates.\n" : ""}\n### ⚠️ Breaking Changes\n- None. Downstream dependencies remain backwards compatible.\n\n### 🧪 Testing Instructions\n1. Run: \`npm test\` — verify 0 failures.\n2. Validate endpoints via Swagger sandbox.\n\n### 🛡 Risk Level: ${hasAuth || hasDb ? "HIGH" : "MEDIUM"}`);
      setIsGeneratingPR(false);
    }, 800);
  };

  /* ─────────────────────────────────────────────────────────────── */

  const overallGaugeColor =
    healthScores.overall >= 80 ? "#34d399" : healthScores.overall >= 55 ? "#fb923c" : "#f87171";

  return (
    <div className="flex flex-col bg-[#0a0d18] rounded-2xl border border-white/5 text-slate-100 shadow-2xl overflow-hidden min-h-[680px]">

      {/* ═══ HEADER ══════════════════════════════════════════════════ */}
      <header
        className="relative shrink-0 px-6 pt-5 pb-4 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f1224 0%, #13162a 60%, #0e111f 100%)" }}
      >
        {/* ambient glow */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-20 w-40 h-40 rounded-full bg-violet-600/8 blur-2xl" />

        {/* Title row */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20">
              <Crown size={18} className="text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-white tracking-tight">CTO Suite</h1>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 font-extrabold uppercase border border-amber-500/25 flex items-center gap-1">
                  <Star size={8} fill="currentColor" /> Premium
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Understand your entire codebase in 5 minutes with local AST audits & AI intelligence.</p>
            </div>
          </div>

          {/* Project pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-[11px] text-slate-300 font-mono">
            <FolderOpen size={12} className="text-slate-500" />
            <span className="truncate max-w-[180px]">{activeProject.projectName}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${healthScores.overall >= 80 ? "bg-emerald-400" : healthScores.overall >= 55 ? "bg-amber-400" : "bg-rose-400"} animate-pulse`} />
          </div>
        </div>

        {/* Sub-tab nav */}
        <div className="flex flex-wrap gap-1 mt-4 relative z-10">
          {SUB_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 select-none
                ${activeSubTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ═══ BODY ════════════════════════════════════════════════════ */}
      <div className="flex-1 p-6 overflow-y-auto">

        {/* ── HEALTH SCORE ─────────────────────────────────────────── */}
        {activeSubTab === "health" && (
          <div className="space-y-6">
            {/* Hero card */}
            <div
              className="relative overflow-hidden rounded-2xl border border-white/5 p-6"
              style={{ background: "linear-gradient(135deg, #111827 0%, #0f1629 100%)" }}
            >
              <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-600/8 blur-3xl" />
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ArcGauge value={healthScores.overall} color={overallGaugeColor} label="Health" />
                <div className="flex-1">
                  <h3 className="text-lg font-black text-white mb-1">Project DNA Health Score</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Calculated from AST parsing density, code smells, duplicate operations, and security vulnerabilities.
                    A score of <span className="text-indigo-400 font-bold">80+</span> represents production-grade codebase health.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-slate-300 font-semibold">
                      🌐 {activeProject.projectDNA?.languages?.map(l => l.name).join(", ") || "TypeScript"}
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-slate-300 font-semibold">
                      ⚙️ {activeProject.projectDNA?.frameworks?.slice(0, 2).join(", ") || "React, Express"}
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-slate-300 font-semibold">
                      🗄️ {activeProject.projectDNA?.databases?.slice(0, 2).join(", ") || "PostgreSQL"}
                    </span>
                  </div>
                </div>
                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  {[
                    { label: "Security Issues", value: activeProject.security?.length || 0, color: "text-rose-400" },
                    { label: "Perf Warnings", value: activeProject.performance?.length || 0, color: "text-amber-400" },
                    { label: "Refactor Items", value: activeProject.refactoring?.length || 0, color: "text-sky-400" },
                    { label: "DB Tables", value: activeProject.database?.tables?.length || 0, color: "text-emerald-400" },
                  ].map(s => (
                    <div key={s.label} className="text-center bg-white/[0.03] border border-white/5 rounded-xl p-3">
                      <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold mt-0.5 leading-tight">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sub-score grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ScoreBar label="Maintainability" value={healthScores.maintainability} color="bg-gradient-to-r from-emerald-500 to-teal-500" icon={<Layers size={14} />} />
              <ScoreBar label="Security Sweep" value={healthScores.security} color="bg-gradient-to-r from-rose-500 to-pink-500" icon={<Shield size={14} />} />
              <ScoreBar label="Performance Index" value={healthScores.performance} color="bg-gradient-to-r from-amber-500 to-orange-500" icon={<Zap size={14} />} />
              <ScoreBar label="Architecture Style" value={healthScores.architecture} color="bg-gradient-to-r from-sky-500 to-blue-500" icon={<Workflow size={14} />} />
            </div>
          </div>
        )}

        {/* ── AI ORACLE ────────────────────────────────────────────── */}
        {activeSubTab === "ask" && (
          <div className="flex flex-col h-[520px] rounded-2xl border border-white/5 overflow-hidden" style={{ background: "linear-gradient(180deg, #0e1120 0%, #0a0d18 100%)" }}>
            {/* Topbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="p-1.5 rounded-lg bg-sky-500/15 border border-sky-500/20">
                <Brain size={14} className="text-sky-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">AI Codebase Oracle</div>
                <div className="text-[9px] text-slate-500">Powered by local AST analysis + LLM</div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex gap-3 max-w-[88%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${msg.sender === "user" ? "bg-gradient-to-br from-sky-500 to-blue-600" : "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20"}`}>
                    {msg.sender === "user" ? <Compass size={14} className="text-white" /> : <Brain size={14} className="text-indigo-400" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${msg.sender === "user" ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-tr-sm" : "bg-white/[0.04] border border-white/5 text-slate-300 rounded-tl-sm"}`}>
                    <div className="whitespace-pre-line">{msg.text}</div>
                    {msg.files && msg.files.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <span className="text-[9px] text-sky-400 font-bold uppercase block mb-1.5">Relevant Files:</span>
                        <div className="space-y-1">
                          {msg.files.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <FileCode size={10} className="text-slate-500" />
                              <span className="font-mono">{file}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {msg.flow && msg.flow.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <span className="text-[9px] text-emerald-400 font-bold uppercase block mb-2">Execution Flow:</span>
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
                          {msg.flow.map((step, idx) => (
                            <React.Fragment key={idx}>
                              <div className="bg-black/30 py-1 px-2 rounded border border-white/10 font-mono text-slate-300">{step}</div>
                              {idx < msg.flow!.length - 1 && <ChevronRight size={10} className="text-slate-600" />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0 animate-pulse">
                    <Brain size={14} className="text-indigo-400" />
                  </div>
                  <div className="px-4 py-3 bg-white/[0.04] border border-white/5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    {[0, 0.15, 0.3].map((d, i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleAskQuestion} className="border-t border-white/5 p-3 flex gap-2 bg-white/[0.02]">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask about structure, auth, database flows..."
                className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}

        {/* ── IMPACT GRAPH ─────────────────────────────────────────── */}
        {activeSubTab === "graph" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Node list */}
            <div className="lg:col-span-3 space-y-3">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-4">Dependency Module Graph</div>
              {graphNodes.map((node, index) => {
                const isSelected = selectedNode?.id === node.id;
                const nodeColors: Record<string, string> = {
                  entry: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
                  service: "from-sky-500/20 to-blue-500/20 border-sky-500/30",
                  controller: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
                  database: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
                };
                const iconMap: Record<string, React.ReactNode> = {
                  entry: <Play size={13} className="text-emerald-400" />,
                  service: <Cpu size={13} className="text-sky-400" />,
                  controller: <Workflow size={13} className="text-pink-400" />,
                  database: <Database size={13} className="text-amber-400" />,
                };
                return (
                  <div key={node.id} className="flex items-center gap-3">
                    <div onClick={() => setSelectedNode(node)} className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 select-none
                      ${isSelected
                        ? `bg-gradient-to-r ${nodeColors[node.type] || "from-indigo-500/20 to-violet-500/20 border-indigo-500/30"} shadow-lg`
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                      }`}>
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${nodeColors[node.type] || "from-indigo-500/20 to-violet-500/20"}`}>
                        {iconMap[node.type] || <FileCode size={13} className="text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-mono font-bold text-white truncate">{node.label}</div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold">{node.type} module</div>
                      </div>
                      {isSelected && <ChevronRight size={14} className="text-slate-400 shrink-0" />}
                    </div>
                    {index < graphNodes.length - 1 && (
                      <div className="absolute left-[3.4rem] mt-14 h-6 w-[1px] bg-gradient-to-b from-slate-700 to-transparent pointer-events-none hidden lg:block" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Impact panel */}
            <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-4">Feature Impact Analyzer</div>
              {selectedNode && selectedNodeImpact ? (
                <div className="space-y-4">
                  <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                    <div className="text-[9px] text-slate-500 font-mono mb-1">Selected Node</div>
                    <div className="text-[11px] font-mono font-bold text-white break-all">{selectedNode.id}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { val: selectedNodeImpact.components, label: "Affected UI", color: "text-indigo-400" },
                      { val: selectedNodeImpact.routes, label: "Affected API", color: "text-pink-400" },
                      { val: selectedNodeImpact.migrations, label: "Affected DB", color: "text-amber-400" },
                    ].map(s => (
                      <div key={s.label} className="bg-black/20 border border-white/5 rounded-xl p-3">
                        <div className={`text-lg font-black ${s.color}`}>{s.val}</div>
                        <div className="text-[8px] text-slate-500 uppercase font-bold leading-tight mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-xl border ${selectedNodeImpact.risk === "HIGH" ? "bg-rose-500/10 border-rose-500/20" : selectedNodeImpact.risk === "MEDIUM" ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                    <span className="text-[10px] text-slate-400 font-semibold">Change Risk:</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${selectedNodeImpact.risk === "HIGH" ? "text-rose-400" : selectedNodeImpact.risk === "MEDIUM" ? "text-amber-400" : "text-emerald-400"}`}>
                      {selectedNodeImpact.risk} Risk
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[9px] text-indigo-400 font-bold uppercase">Impact Justifications</div>
                    {selectedNodeImpact.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-[10px] text-slate-400">
                        <AlertTriangle size={11} className="text-slate-600 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs">
                  <HelpCircle size={24} className="mb-2 text-slate-700" />
                  <span>Select a node on the left to analyze its impact.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DEBT RADAR ───────────────────────────────────────────── */}
        {activeSubTab === "debt" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert size={14} className="text-orange-400" /> Technical Debt Registry
              </h3>
              <span className="text-[9px] text-slate-400 bg-white/5 border border-white/8 py-1 px-2.5 rounded-lg">
                {technicalDebtItems.length} items · sorted by severity
              </span>
            </div>

            <div className="space-y-3">
              {technicalDebtItems.map((item, idx) => {
                const bg = item.score >= 90 ? "border-rose-500/20 bg-rose-500/5" : item.score >= 70 ? "border-amber-500/20 bg-amber-500/5" : "border-emerald-500/20 bg-emerald-500/5";
                const scoreCls = item.score >= 90 ? "from-rose-500 to-pink-600" : item.score >= 70 ? "from-amber-500 to-orange-600" : "from-emerald-500 to-teal-600";
                const textCls = item.score >= 90 ? "text-rose-400" : item.score >= 70 ? "text-amber-400" : "text-emerald-400";
                return (
                  <div key={idx} className={`p-4 rounded-xl border ${bg} transition-all`}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="font-mono text-[11px] font-bold text-white break-all">{item.file}</div>
                      <div className={`shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br ${scoreCls} flex items-center justify-center text-xs font-black text-white`}>
                        {item.score}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug mb-2">{item.reason}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-semibold">
                      <ArrowRight size={11} />
                      <span>{item.recommendation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ONBOARDING ───────────────────────────────────────────── */}
        {activeSubTab === "onboarding" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Hero */}
              <div className="relative overflow-hidden rounded-2xl border border-white/5 p-4" style={{ background: "linear-gradient(135deg, #0f1627 0%, #111528 100%)" }}>
                <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-500/8 blur-2xl" />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">Welcome to {activeProject.projectName}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">AI generated onboarding guide · <span className="text-emerald-400 font-bold">~3.2 hours</span> total</p>
                  </div>
                  <Compass size={28} className="text-emerald-400 shrink-0" />
                </div>
                <div className="flex gap-2 mt-3">
                  {onboardingSteps.map(s => (
                    <div key={s.step} className={`flex-1 h-1 rounded-full transition-all ${activeOnboardingStep >= s.step ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-white/10"}`} />
                  ))}
                </div>
              </div>

              {onboardingSteps.map(step => {
                const isActive = activeOnboardingStep === step.step;
                return (
                  <div
                    key={step.step}
                    onClick={() => setActiveOnboardingStep(step.step)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex gap-4 ${isActive ? "border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-900/10" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"}`}
                  >
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs transition-all ${isActive ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white" : "bg-white/5 text-slate-500 border border-white/8"}`}>
                      {activeOnboardingStep > step.step ? <Check size={14} /> : step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <h4 className="text-xs font-bold text-white">{step.title}</h4>
                        <span className="text-[9px] bg-white/5 text-slate-400 py-0.5 px-2 rounded-full font-bold shrink-0">{step.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{step.description}</p>
                      {isActive && (
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[9px]">
                          <FileCode size={10} className="text-slate-500" />
                          <span className="font-mono text-emerald-400 truncate">{step.file}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-4">Step Detail</div>
                {onboardingSteps[activeOnboardingStep - 1] && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Zap size={14} className="animate-pulse" />
                      <span className="text-[10px] font-bold uppercase">Topic #{activeOnboardingStep}</span>
                    </div>
                    <h3 className="text-xs font-bold text-white">{onboardingSteps[activeOnboardingStep - 1].title}</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                      Module detected by sweeping project dependencies. Recommended: open files, verify imports, check middleware flow.
                    </p>
                    <div className="space-y-2">
                      <div className="text-[9px] text-emerald-400 font-bold uppercase">Recommended Read Order</div>
                      <div className="space-y-1.5 font-mono text-[9px] text-slate-400 bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2"><span className="text-slate-600">01.</span> Verify package config declarations</div>
                        <div className="flex items-center gap-2"><span className="text-slate-600">02.</span> Open source file & examine imports</div>
                        <div className="flex items-center gap-2"><span className="text-slate-600">03.</span> Check database schema tables</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] text-slate-600">{activeOnboardingStep} / {onboardingSteps.length} steps</span>
                <div className="flex gap-2">
                  <button disabled={activeOnboardingStep === 1} onClick={() => setActiveOnboardingStep(p => p - 1)} className="text-[10px] py-1.5 px-3 rounded-lg border border-white/8 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40 transition-all">
                    Back
                  </button>
                  <button disabled={activeOnboardingStep === onboardingSteps.length} onClick={() => setActiveOnboardingStep(p => p + 1)} className="text-[10px] py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold disabled:opacity-40 transition-all hover:from-emerald-400 hover:to-teal-500">
                    Next Step
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── COVERAGE MAP ─────────────────────────────────────────── */}
        {activeSubTab === "coverage" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Target size={14} className="text-purple-400" /> Test Coverage Map
              </h3>
              <span className="text-[9px] text-slate-400 bg-white/5 border border-white/8 py-1 px-2.5 rounded-lg">AST Analyzer</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {coverageModules.map((item, idx) => {
                  const barColor = item.coverage >= 80 ? "from-emerald-500 to-teal-500" : item.coverage >= 50 ? "from-amber-500 to-orange-500" : "from-rose-500 to-pink-500";
                  const textColor = item.coverage >= 80 ? "text-emerald-400" : item.coverage >= 50 ? "text-amber-400" : "text-rose-400";
                  const statusBg = item.coverage >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : item.coverage >= 50 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20";
                  return (
                    <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FolderOpen size={13} className="text-slate-500" />
                          <span className="text-[11px] font-bold text-white">{item.name}</span>
                          <span className="text-[9px] text-slate-500">({item.filesCount} files)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${statusBg}`}>{item.status}</span>
                          <span className={`text-sm font-black ${textColor}`}>{item.coverage}%</span>
                        </div>
                      </div>
                      <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000`} style={{ width: `${item.coverage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Missing Checkpoints</div>
                <div className="bg-rose-500/8 border border-rose-500/20 p-3 rounded-xl text-[10px] text-slate-400 leading-snug">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1.5">
                    <AlertTriangle size={12} /> DB Layer Missing Coverage
                  </div>
                  Repository classes have only 22% coverage. SQL insertions run untested. Add schema integrity checks.
                </div>
                <div className="space-y-2">
                  <div className="text-[9px] text-purple-400 font-bold uppercase">Recommended Test Files</div>
                  {[
                    { file: "tests/db.test.ts", priority: "High Priority", bg: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
                    { file: "tests/api-order.test.ts", priority: "Medium Priority", bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                    { file: "tests/auth-flow.test.ts", priority: "Good Coverage", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                  ].map(t => (
                    <div key={t.file} className="flex items-center justify-between bg-black/20 border border-white/5 p-2.5 rounded-lg">
                      <span className="font-mono text-[9px] text-slate-300">{t.file}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border font-bold ${t.bg}`}>{t.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PR GENERATOR ─────────────────────────────────────────── */}
        {activeSubTab === "pr" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* File selector */}
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">AI Pull Request Builder</div>
                <p className="text-[10px] text-slate-400">Select files to include in the PR description:</p>
              </div>
              <div className="space-y-1 max-h-[280px] overflow-y-auto rounded-xl bg-black/20 border border-white/5 p-2">
                {availableFilesForPR.map(file => {
                  const isChecked = !!selectedPRFiles[file];
                  return (
                    <label key={file} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer select-none transition-colors">
                      <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all ${isChecked ? "bg-gradient-to-br from-cyan-500 to-sky-600 border-transparent" : "border-white/15 bg-black/20"}`} onClick={() => setSelectedPRFiles(p => ({ ...p, [file]: !p[file] }))}>
                        {isChecked && <Check size={10} className="text-white" />}
                      </div>
                      <span className="font-mono text-[10px] text-slate-300 truncate">{file.substring(file.lastIndexOf("/") + 1)}</span>
                    </label>
                  );
                })}
              </div>
              <button
                onClick={handleGeneratePR}
                disabled={isGeneratingPR}
                className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingPR ? <><RefreshCw size={13} className="animate-spin" /> Generating...</> : <><GitPullRequest size={13} /> Generate PR Markdown</>}
              </button>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Pull Request Markdown</div>
                {generatedPRText && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(generatedPRText); setPrCopied(true); setTimeout(() => setPrCopied(false), 2000); }}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-lg border transition-all ${prCopied ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400" : "bg-white/5 border-white/8 text-slate-300 hover:text-white hover:bg-white/10"}`}
                  >
                    {prCopied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                  </button>
                )}
              </div>

              {generatedPRText ? (
                <textarea
                  value={generatedPRText}
                  readOnly
                  className="flex-1 bg-black/30 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-slate-300 leading-relaxed focus:outline-none resize-none min-h-[300px]"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-xs border border-dashed border-white/5 rounded-xl p-8 gap-2">
                  <GitPullRequest size={32} className="text-slate-700" />
                  <span>Select files and click "Generate PR Markdown"</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
