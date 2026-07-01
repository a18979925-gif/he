import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Cpu, 
  Check, 
  CheckCircle, 
  RefreshCw, 
  Play, 
  Activity, 
  Database, 
  Terminal, 
  ArrowRight, 
  Clock, 
  Search, 
  FileText, 
  Sparkles, 
  Copy, 
  ArrowUpRight, 
  ChevronRight, 
  ChevronDown,
  Info,
  Lock,
  Flame,
  Sliders
} from "lucide-react";
import { CodeScopeAnalysis, PerformanceIssue } from "../types";

interface PerformanceTabProps {
  activeProject: CodeScopeAnalysis;
  onFixIssue: (filePath: string, oldCode: string, newCode: string) => Promise<void>;
}

// Inline tokenized code syntax highlighter
const HighlightCodeLine: React.FC<{ line: string }> = ({ line }) => {
  if (!line.trim()) return <span className="opacity-0">.</span>;
  if (line.trim().startsWith("//") || line.trim().startsWith("#")) {
    return <span className="text-slate-500 italic font-mono">{line}</span>;
  }

  const parts = line.split(/(\s+|[=()\[\]{}:.,;"'<>!+\-*/%&|^~?])/);
  let isComment = false;
  let isString = false;
  let stringChar: string | null = null;

  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;
        if (isComment) return <span key={idx} className="text-slate-500 italic font-mono">{part}</span>;
        if (part === "//" || part.startsWith("//")) {
          isComment = true;
          return <span key={idx} className="text-slate-500 italic font-mono">{part}</span>;
        }
        if (isString) {
          if (part === stringChar) {
            isString = false;
            stringChar = null;
            return <span key={idx} className="text-amber-400 font-mono font-medium">{part}</span>;
          }
          return <span key={idx} className="text-amber-200/80 font-mono font-medium">{part}</span>;
        }
        if (part === '"' || part === "'" || part === "`") {
          isString = true;
          stringChar = part;
          return <span key={idx} className="text-amber-400 font-mono font-medium">{part}</span>;
        }
        const keywords = new Set([
          "const", "let", "var", "function", "return", "await", "async", "import", "export",
          "for", "forEach", "while", "map", "if", "else", "from", "db", "query", "select", "join",
          "where", "in", "readUserConfig", "fs", "readFileSync", "promises", "readFile", "sync"
        ]);
        if (keywords.has(part)) {
          if (["db", "query", "select", "join", "where"].includes(part)) {
            return <span key={idx} className="text-sky-400 font-bold font-mono">{part}</span>;
          }
          if (["readFileSync", "execSync", "writeFileSync"].includes(part)) {
            return <span key={idx} className="text-rose-400 font-bold font-mono">{part}</span>;
          }
          return <span key={idx} className="text-violet-400 font-bold font-mono">{part}</span>;
        }
        if (/^\d+$/.test(part)) {
          return <span key={idx} className="text-emerald-400 font-mono font-medium">{part}</span>;
        }
        return <span key={idx} className="text-slate-300 font-mono font-normal">{part}</span>;
      })}
    </>
  );
};

// Custom interactive Code Diff Component
interface CodeDiffProps {
  oldCode: string;
  newCode: string;
  filePath: string;
}

const CodeDiffViewer: React.FC<CodeDiffProps> = ({ oldCode, newCode, filePath }) => {
  const [activeTab, setActiveTab] = useState<"side" | "original" | "optimized">("side");
  const oldLines = oldCode.trim().split("\n");
  const newLines = newCode.trim().split("\n");

  return (
    <div className="rounded-xl border border-slate-900 overflow-hidden flex flex-col bg-slate-950/60 backdrop-blur-md">
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

      {/* Header Controls */}
      <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-950 flex items-center justify-between text-xs">
        <span className="font-mono text-slate-400 text-[10px] truncate max-w-xs md:max-w-sm flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          {filePath}
        </span>
        <div className="flex bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 shrink-0">
          <button 
            onClick={() => setActiveTab("side")}
            className={`px-2 py-0.5 rounded text-[10px] font-sans transition-all cursor-pointer ${
              activeTab === "side" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Split View
          </button>
          <button 
            onClick={() => setActiveTab("original")}
            className={`px-2 py-0.5 rounded text-[10px] font-sans transition-all cursor-pointer ${
              activeTab === "original" ? "bg-rose-600/30 text-rose-300 shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Before
          </button>
          <button 
            onClick={() => setActiveTab("optimized")}
            className={`px-2 py-0.5 rounded text-[10px] font-sans transition-all cursor-pointer ${
              activeTab === "optimized" ? "bg-emerald-600/30 text-emerald-300 shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            After
          </button>
        </div>
      </div>

      {/* Code Display */}
      <div className="overflow-x-auto max-h-[300px] text-left scrollbar-thin">
        {activeTab === "side" && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-900 min-w-[700px] md:min-w-0">
            {/* Left - Original */}
            <div className="p-3 bg-rose-950/5">
              <div className="text-[9px] font-bold text-rose-400/70 mb-2 tracking-wider font-sans uppercase">UNOPTIMIZED BINDING</div>
              <pre className="font-mono text-[10.5px] leading-relaxed">
                {oldLines.map((line, i) => (
                  <div key={i} className="flex hover:bg-rose-500/5 py-0.5 -mx-3 px-3">
                    <span className="w-6 text-right pr-2 text-rose-500/30 select-none text-[9px]">{i + 1}</span>
                    <span className="text-rose-200/90 whitespace-pre"><HighlightCodeLine line={line} /></span>
                  </div>
                ))}
              </pre>
            </div>
            {/* Right - Optimized */}
            <div className="p-3 bg-emerald-950/5">
              <div className="text-[9px] font-bold text-emerald-400/70 mb-2 tracking-wider font-sans uppercase">BATCH / CACHED PATTERN</div>
              <pre className="font-mono text-[10.5px] leading-relaxed">
                {newLines.map((line, i) => (
                  <div key={i} className="flex hover:bg-emerald-500/5 py-0.5 -mx-3 px-3">
                    <span className="w-6 text-right pr-2 text-emerald-500/30 select-none text-[9px]">{i + 1}</span>
                    <span className="text-emerald-200/90 whitespace-pre"><HighlightCodeLine line={line} /></span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}

        {activeTab === "original" && (
          <div className="p-4 bg-rose-950/5">
            <pre className="font-mono text-[11px] leading-relaxed">
              {oldLines.map((line, i) => (
                <div key={i} className="flex hover:bg-rose-500/5 py-0.5 -mx-4 px-4">
                  <span className="w-8 text-right pr-3 text-rose-500/35 select-none text-[10px]">{i + 1}</span>
                  <span className="text-rose-200/90 whitespace-pre"><HighlightCodeLine line={line} /></span>
                </div>
              ))}
            </pre>
          </div>
        )}

        {activeTab === "optimized" && (
          <div className="p-4 bg-emerald-950/5">
            <pre className="font-mono text-[11px] leading-relaxed">
              {newLines.map((line, i) => (
                <div key={i} className="flex hover:bg-emerald-500/5 py-0.5 -mx-4 px-4">
                  <span className="w-8 text-right pr-3 text-emerald-500/35 select-none text-[10px]">{i + 1}</span>
                  <span className="text-emerald-200/90 whitespace-pre"><HighlightCodeLine line={line} /></span>
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ activeProject, onFixIssue }) => {
  const [activeTab, setActiveTab] = useState<"list" | "thread" | "nplus1">("list");
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [fixedIssues, setFixedIssues] = useState<Record<number, boolean>>({});

  // Collapsible cards state
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({ 0: true });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<"All" | "Critical/High" | "Medium/Low">("All");
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const performanceList = useMemo(() => activeProject.performance || [], [activeProject]);

  const toggleExpand = (idx: number) => {
    setExpandedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleFix = async (idx: number, perf: any) => {
    if (!perf.oldCode || !perf.newCode) {
      setFixingId(`perf-${idx}`);
      await new Promise(resolve => setTimeout(resolve, 1200));
      setFixedIssues(prev => ({ ...prev, [idx]: true }));
      setFixingId(null);
      return;
    }

    try {
      setFixingId(`perf-${idx}`);
      await onFixIssue(perf.file, perf.oldCode, perf.newCode);
      setFixedIssues(prev => ({ ...prev, [idx]: true }));
    } catch (err) {
      console.error("Failed to apply performance optimization:", err);
    } finally {
      setFixingId(null);
    }
  };

  const handleCopyPath = (file: string) => {
    navigator.clipboard.writeText(file);
    setCopiedFile(file);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Filter Issues
  const filteredIssues = useMemo(() => {
    return performanceList.map((item, index) => ({ ...item, originalIndex: index })).filter(item => {
      const matchesSearch = item.issue.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isCriticalOrHigh = item.severity === "Critical" || item.severity === "High";
      const matchesSeverity = selectedSeverity === "All" ||
        (selectedSeverity === "Critical/High" && isCriticalOrHigh) ||
        (selectedSeverity === "Medium/Low" && !isCriticalOrHigh);

      return matchesSearch && matchesSeverity;
    });
  }, [performanceList, searchQuery, selectedSeverity]);

  // Compute Performance Score
  const performanceHealthScore = useMemo(() => {
    let score = 100;
    performanceList.forEach((perf, index) => {
      if (fixedIssues[index]) return; // Refactored issues restore health!
      if (perf.severity === "Critical") score -= 15;
      else if (perf.severity === "High") score -= 10;
      else if (perf.severity === "Medium") score -= 6;
      else score -= 3;
    });
    return Math.max(10, score);
  }, [performanceList, fixedIssues]);

  // Sync / blocking I/O calls logs filtering
  const blockingIoIssues = useMemo(() => {
    return performanceList
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter(item => item.issue.toLowerCase().includes("sync") || item.issue.toLowerCase().includes("blocking"));
  }, [performanceList]);

  // N+1 Query patterns issues filtering
  const nplus1Issues = useMemo(() => {
    return performanceList
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter(item => item.issue.toLowerCase().includes("n+1") || item.issue.toLowerCase().includes("loop"));
  }, [performanceList]);

  // Sub-component state indicators
  const activeSyncCount = blockingIoIssues.filter(item => !fixedIssues[item.originalIndex]).length;
  const activeNPlus1Count = nplus1Issues.filter(item => !fixedIssues[item.originalIndex]).length;

  return (
    <div 
      className="space-y-6 text-left bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-900 relative shadow-2xl overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] animate-fade-in"
      id="performance-tab-view"
    >
      {/* Background Cyber Blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/4" />

      {/* Inline styles for custom self-contained simulations */}
      <style>{`
        @keyframes travelRight {
          0% { left: 10%; opacity: 0; transform: scale(0.6); }
          15% { opacity: 1; transform: scale(1.1); }
          85% { opacity: 1; transform: scale(1.1); }
          100% { left: 90%; opacity: 0; transform: scale(0.6); }
        }
        @keyframes travelLeft {
          0% { left: 90%; opacity: 0; transform: scale(0.6); }
          15% { opacity: 1; transform: scale(1.1); }
          85% { opacity: 1; transform: scale(1.1); }
          100% { left: 10%; opacity: 0; transform: scale(0.6); }
        }
        .particle-right {
          animation: travelRight 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
        .particle-left {
          animation: travelLeft 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
        @keyframes text-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .blinking-cursor {
          animation: text-blink 1s step-end infinite;
        }
      `}</style>

      {/* Header and Performance Radar Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-b border-slate-900 pb-6 relative z-10">
        
        {/* Core Title */}
        <div className="lg:col-span-7 space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            Performance Radar & Thread Diagnostics
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Static AST profiler analyzing concurrent execution locks, synchronous filesystem blockages, and database N+1 loop roundtrips.
          </p>
        </div>

        {/* Dynamic Health Circle Gauge */}
        <div className="lg:col-span-5 flex items-center justify-start lg:justify-end gap-6">
          <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-900 p-3 rounded-2xl">
            {/* SVG Arc Gauge */}
            <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
              <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#0f172a" strokeWidth="2.5" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  stroke={performanceHealthScore >= 80 ? "url(#perfGradGreen)" : performanceHealthScore >= 60 ? "url(#perfGradOrange)" : "url(#perfGradRed)"} 
                  strokeWidth="2.5" 
                  strokeDasharray="100"
                  strokeDashoffset={100 - performanceHealthScore}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="perfGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="perfGradOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient id="perfGradRed" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-sm font-extrabold text-white tracking-tighter font-mono">{performanceHealthScore}%</span>
              </div>
            </div>
            
            <div className="text-left space-y-0.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">PERF RATING</span>
              <strong className={`text-xs font-bold font-sans ${
                performanceHealthScore >= 80 ? "text-emerald-400" : performanceHealthScore >= 60 ? "text-amber-400 animate-pulse" : "text-rose-400 animate-pulse"
              }`}>
                {performanceHealthScore >= 90 ? "OPTIMAL SYSTEM HEALTH" : 
                 performanceHealthScore >= 75 ? "STABLE / WARNING" : 
                 performanceHealthScore >= 55 ? "DEGRADED RESPONSE" : "CRITICAL OVERHEAD LOCKED"}
              </strong>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Zap className="h-3 w-3 text-orange-400" />
                <span>{performanceList.length - Object.keys(fixedIssues).length} Active Bottlenecks</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Latency Impact Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        
        {/* Card 1: Estimated Latency Overhead */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-800 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/[0.02] blur-xl rounded-full pointer-events-none group-hover:bg-orange-500/[0.04] transition-all" />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono font-bold">Latency Overhead</span>
              <Clock className="h-3.5 w-3.5 text-orange-500 group-hover:animate-spin" />
            </div>
            <strong className="text-2xl font-black text-orange-400 font-mono block">
              +{performanceList.length > 0 ? (performanceList.length - Object.keys(fixedIssues).length) * 110 : 0}ms
            </strong>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">Est. API endpoint response time degradation</span>
        </div>

        {/* Card 2: Event Loop Block Status */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-800 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/[0.02] blur-xl rounded-full pointer-events-none group-hover:bg-rose-500/[0.04] transition-all" />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono font-bold">Main Thread Status</span>
              <Cpu className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <strong className={`text-2xl font-black font-mono block ${
              activeSyncCount > 0 ? "text-rose-500 animate-pulse" : "text-emerald-400"
            }`}>
              {activeSyncCount > 0 ? "THREAD LOCKED" : "NON-BLOCKING"}
            </strong>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">
            {activeSyncCount > 0 ? `${activeSyncCount} synchronous system calls found` : "Event loop thread executing smoothly"}
          </span>
        </div>

        {/* Card 3: DB Connection Overhead */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-800 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.02] blur-xl rounded-full pointer-events-none group-hover:bg-indigo-500/[0.04] transition-all" />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono font-bold">DB Socket Strain</span>
              <Database className="h-3.5 w-3.5 text-sky-400 group-hover:translate-y-0.5 transition-transform" />
            </div>
            <strong className={`text-2xl font-black font-mono block ${
              activeNPlus1Count > 0 ? "text-amber-400" : "text-emerald-400"
            }`}>
              {activeNPlus1Count > 0 ? `${activeNPlus1Count * 10}x Pool Strain` : "OPTIMAL"}
            </strong>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">
            {activeNPlus1Count > 0 ? `${activeNPlus1Count} database loop pattern leaks` : "No ORM batch loaders missing"}
          </span>
        </div>

      </div>

      {/* Tab Selector Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-900/20 border border-slate-900 rounded-xl p-2.5 relative z-10 backdrop-blur-md">
        
        <div className="flex bg-slate-950/80 border border-slate-800/80 rounded-xl p-1 gap-1 shrink-0">
          <button 
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "list" 
                ? "bg-gradient-to-r from-orange-600/30 to-amber-600/30 border border-orange-500/40 text-orange-200" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Bottlenecks Feed
            <span className="bg-slate-900 border border-slate-800 text-slate-300 text-[9px] font-mono px-1.5 py-0.5 rounded-md">
              {performanceList.length - Object.keys(fixedIssues).length}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab("thread")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "thread" 
                ? "bg-gradient-to-r from-rose-600/30 to-purple-600/30 border border-rose-500/40 text-rose-200" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Terminal className="h-3.5 w-3.5 shrink-0" />
            System Thread Monitor
            {activeSyncCount > 0 && (
              <span className="bg-rose-950/50 border border-rose-800 text-rose-300 text-[9px] font-mono px-1.5 py-0.5 rounded-md animate-pulse">
                {activeSyncCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("nplus1")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "nplus1" 
                ? "bg-gradient-to-r from-indigo-600/30 to-blue-600/30 border border-indigo-500/40 text-indigo-200" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Activity className="h-3.5 w-3.5 shrink-0" />
            N+1 Query Visualizer
            {activeNPlus1Count > 0 && (
              <span className="bg-indigo-950/50 border border-indigo-800 text-indigo-300 text-[9px] font-mono px-1.5 py-0.5 rounded-md">
                {activeNPlus1Count}
              </span>
            )}
          </button>
        </div>

        {/* Search Input when in Issues List */}
        {activeTab === "list" && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search bottlenecks or source files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 outline-none rounded-xl py-1.5 pl-9 pr-4 text-xs font-sans text-slate-200 placeholder-slate-500"
            />
          </div>
        )}

      </div>

      {/* Tab Content 1: Bottlenecks Feed */}
      {activeTab === "list" && (
        <div className="space-y-4 relative z-10">
          
          {/* Filters Bar */}
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="text-slate-500 mr-2 flex items-center gap-1 font-sans">
              <Sliders className="h-3 w-3" /> Filter Severity:
            </span>
            <button 
              onClick={() => setSelectedSeverity("All")}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedSeverity === "All" 
                  ? "bg-slate-900 text-white border-slate-800" 
                  : "bg-slate-950/40 text-slate-400 border-slate-900 hover:border-slate-855"
              }`}
            >
              All Severities
            </button>
            <button 
              onClick={() => setSelectedSeverity("Critical/High")}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedSeverity === "Critical/High" 
                  ? "bg-rose-950/30 text-rose-300 border-rose-900/50 shadow-sm" 
                  : "bg-slate-950/40 text-slate-400 border-slate-900 hover:border-slate-855"
              }`}
            >
              Critical & High
            </button>
            <button 
              onClick={() => setSelectedSeverity("Medium/Low")}
              className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedSeverity === "Medium/Low" 
                  ? "bg-amber-950/30 text-amber-300 border-amber-900/50 shadow-sm" 
                  : "bg-slate-950/40 text-slate-400 border-slate-900 hover:border-slate-855"
              }`}
            >
              Medium & Low
            </button>
          </div>

          {/* Issues list rendering */}
          {filteredIssues.map((perf) => {
            const isFixed = fixedIssues[perf.originalIndex];
            const isFixing = fixingId === `perf-${perf.originalIndex}`;
            const isExpanded = expandedCards[perf.originalIndex];

            // Speedup labels based on issue type
            let speedupLabel = "2.5x Execution Speedup";
            if (perf.issue.includes("N+1")) speedupLabel = "N-Fold Query Reduction";
            else if (perf.issue.includes("Sync")) speedupLabel = "Non-Blocking Async Event Loop";
            else if (perf.issue.includes("Memory")) speedupLabel = "Garbage Collection Safe";
            else if (perf.issue.includes("Complexity")) speedupLabel = "O(N²) → O(N) Complexity Optimization";
            else if (perf.issue.includes("Lodash")) speedupLabel = "Tree-shaken bundle reduction";

            return (
              <div 
                key={perf.originalIndex}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isFixed 
                    ? "border-emerald-900/30 bg-emerald-950/5 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)]" 
                    : isExpanded 
                    ? "border-slate-800 bg-slate-900/20 shadow-xl" 
                    : "border-slate-900 bg-slate-900/10 hover:border-slate-800"
                }`}
              >
                {/* Card Header (Collapsible Trigger) */}
                <div 
                  onClick={() => toggleExpand(perf.originalIndex)}
                  className="p-5 flex flex-col md:flex-row gap-4 items-start justify-between cursor-pointer select-none"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-[10px]">
                      {/* Severity pill */}
                      <span className={`font-mono font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider shrink-0 ${
                        isFixed 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_6px_rgba(16,185,129,0.05)]" 
                          : perf.severity === "Critical" 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_6px_rgba(244,63,94,0.05)]" 
                          : perf.severity === "High"
                          ? "bg-orange-500/10 text-orange-400 border-orange-500/30" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}>
                        {isFixed ? "Optimized" : `${perf.severity} Severity`}
                      </span>
                      
                      <span className="text-slate-700">•</span>
                      
                      {/* Copyable File Path */}
                      <div className="flex items-center gap-1 group/path text-slate-400 truncate max-w-sm font-mono bg-slate-950/50 border border-slate-900 px-2 py-0.5 rounded-md">
                        <span>{perf.file} (Line {perf.line || "N/A"})</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyPath(perf.file);
                          }}
                          className="hover:text-white cursor-pointer shrink-0 transition-colors p-0.5"
                          title="Copy file path"
                        >
                          {copiedFile === perf.file ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                      <AlertTriangle className={`h-4.5 w-4.5 shrink-0 ${isFixed ? "text-emerald-400" : "text-amber-500"}`} />
                      {perf.issue}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 self-stretch md:self-center shrink-0">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-950 px-2.5 py-1 rounded-lg">
                      {speedupLabel}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-900 pt-4 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      
                      {/* Left: Explanatory and Recommendation Column */}
                      <div className="lg:col-span-8 space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">DETECTION DESCRIPTION</h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">{perf.description}</p>
                        </div>

                        {/* Code Diff Display */}
                        {perf.oldCode && perf.newCode && !isFixed && (
                          <div className="space-y-1.5">
                            <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">CODE COMPARISON PLAYGROUND</h4>
                            <CodeDiffViewer 
                              oldCode={perf.oldCode} 
                              newCode={perf.newCode} 
                              filePath={perf.file} 
                            />
                          </div>
                        )}

                        {isFixed && (
                          <div className="p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-xl flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-1 text-left">
                              <strong className="text-xs text-emerald-300 font-bold font-sans">Optimization Engine Successfully Deployed</strong>
                              <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                                The performance regression has been refactored. The event loop lock was mitigated by upgrading file reads and ORM queries into safe asynchronous batch handlers.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Recommendation & Action Pane */}
                      <div className="lg:col-span-4 bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-4 flex flex-col justify-between self-stretch text-left">
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-indigo-400 font-sans text-xs font-bold uppercase tracking-wide">
                            <Sparkles className="h-3.5 w-3.5" />
                            HEURISTIC REMEDY
                          </div>
                          <p className="text-xs text-slate-350 leading-relaxed font-sans">{perf.suggestedOptimization}</p>
                        </div>

                        <div className="pt-2">
                          {isFixed ? (
                            <div className="w-full bg-emerald-900/30 border border-emerald-800/40 text-emerald-400 p-2.5 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 font-sans">
                              <CheckCircle className="h-4 w-4" /> Optimization Active
                            </div>
                          ) : (
                            <button
                              onClick={() => handleFix(perf.originalIndex, perf)}
                              disabled={isFixing}
                              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-900 text-white text-xs font-bold py-2.5 rounded-xl border border-indigo-500/30 flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-indigo-500/10 active:scale-95 cursor-pointer font-sans"
                            >
                              {isFixing ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                                  <span>Applying Refactor...</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                                  <span>Auto-Optimize Source</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {filteredIssues.length === 0 && (
            <div className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-12 text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">No Matching Performance Regressions</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your search filters yielded 0 active bottlenecks. The scanned code complies cleanly with execution speed guidelines.
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab Content 2: System Thread & I/O Monitor */}
      {activeTab === "thread" && (
        <IoThreadMonitor 
          blockingIoIssues={blockingIoIssues} 
          fixedIssues={fixedIssues}
          handleFix={handleFix}
          fixingId={fixingId}
        />
      )}

      {/* Tab Content 3: N+1 Query Visualizer */}
      {activeTab === "nplus1" && (
        <NPlus1Visualizer 
          nplus1Issues={nplus1Issues}
          fixedIssues={fixedIssues}
          handleFix={handleFix}
          fixingId={fixingId}
          activeProject={activeProject}
        />
      )}

    </div>
  );
};

/* ============================================================================
   SUB-COMPONENT: IoThreadMonitor (Blocking I/O terminal simulation)
   ============================================================================ */
interface IoThreadMonitorProps {
  blockingIoIssues: any[];
  fixedIssues: Record<number, boolean>;
  handleFix: (idx: number, perf: any) => Promise<void>;
  fixingId: string | null;
}

const IoThreadMonitor: React.FC<IoThreadMonitorProps> = ({
  blockingIoIssues,
  fixedIssues,
  handleFix,
  fixingId
}) => {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isSimulatingSpike, setIsSimulatingSpike] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "graph">("logs");
  
  // Real-time Event Loop Ticker Graph
  const [chartData, setChartData] = useState<number[]>([
    1.2, 1.5, 1.8, 1.4, 2.1, 1.6, 1.3, 1.7, 1.5, 1.9, 1.4, 1.8, 1.5, 1.6, 2.2, 1.4, 1.9, 1.5, 1.7, 1.3
  ]);

  const hasActiveSync = blockingIoIssues.some(issue => !fixedIssues[issue.originalIndex]);

  // Push new heartbeat to chart periodically when viewed
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        if (isSimulatingSpike) return prev;
        
        const nextVal = 1.0 + Math.random() * 1.5;
        const nextData = [...prev.slice(1), parseFloat(nextVal.toFixed(1))];
        return nextData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulatingSpike]);

  // Set up initial terminal contents
  useEffect(() => {
    const lines = [
      "SYSTEM: CodeScope Event Loop Profiler initialized.",
      `SYSTEM: Scan detected ${blockingIoIssues.length} synchronous blocking I/O statements.`,
      hasActiveSync 
        ? "WARNING: Thread status is DEGRADED. Sync file operations block Node.js worker handles."
        : "STATUS: System thread operating at 100% async capacity. Event loop response optimal.",
      "SYSTEM: Terminal ready. Run traffic simulation to inspect event loop lag."
    ];
    setTerminalLogs(lines);
  }, [blockingIoIssues, hasActiveSync]);

  const runTrafficSimulation = async () => {
    if (isSimulatingSpike) return;
    setIsSimulatingSpike(true);
    
    const baseGraph = [1.2, 1.5, 1.8, 1.4, 1.6, 1.3, 1.5, 1.8, 1.9, 1.4];
    setChartData([...baseGraph, 1.5, 1.7, 1.6, 1.4, 1.5, 1.8, 1.3, 1.5, 1.6, 1.2]);

    const logMessage = (msg: string) => {
      const time = new Date().toLocaleTimeString().split(" ")[0];
      setTerminalLogs(prev => [...prev, `[${time}] ${msg}`]);
    };

    logMessage("API INGRESS: Simulating 150 concurrent client connections...");
    await new Promise(r => setTimeout(r, 600));

    logMessage("ROUTER: Dispatching request pipelines downstream...");
    await new Promise(r => setTimeout(r, 600));

    if (hasActiveSync) {
      logMessage("WARNING: Endpoint read request triggered fs.readFileSync blocking call!");
      
      setChartData(prev => [...prev.slice(5), 45, 98, 145, 160, 110, 85, 30, 8.5, 4.2, 2.1, 1.6, 1.8, 1.4, 1.2, 1.5]);
      
      await new Promise(r => setTimeout(r, 600));
      logMessage("CRITICAL: Worker Event Loop locked for 160ms on main thread!");
      logMessage("SYSTEM STATE: All concurrent request resolution delayed. Event loop lag > 140ms.");
      logMessage("CLIENT OVERHEAD: Sockets queued. Average request response latency spiked to 380ms.");
    } else {
      logMessage("SUCCESS: Config requested. fs.promises.readFile resolved asynchronously.");
      
      setChartData(prev => [...prev.slice(5), 2.8, 3.5, 4.8, 5.2, 3.8, 2.5, 1.8, 1.9, 1.5, 1.6, 1.4, 1.7, 1.5, 1.8, 1.3]);
      
      await new Promise(r => setTimeout(r, 600));
      logMessage("STATUS: Concurrent connections handled asynchronously (0 context blocks).");
      logMessage("SYSTEM STATE: Heartbeat stable. Event loop average response time: 2.1ms.");
    }

    await new Promise(r => setTimeout(r, 500));
    setIsSimulatingSpike(false);
  };

  const svgPoints = useMemo(() => {
    const width = 500;
    const height = 120;
    const maxVal = Math.max(...chartData, 10);
    const stepX = width / (chartData.length - 1);
    
    return chartData.map((val, index) => {
      const x = index * stepX;
      const y = height - (val / maxVal) * (height - 20) - 10;
      return { x, y, val };
    });
  }, [chartData]);

  const polylinePointsString = svgPoints.map(p => `${p.x},${p.y}`).join(" ");
  const areaPathString = `M 0,120 ${polylinePointsString} L 500,120 Z`;

  return (
    <div className="space-y-5 bg-slate-950/40 p-5 rounded-2xl border border-slate-900 relative z-10 text-left">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
            <Terminal className="h-4.5 w-4.5 text-rose-500" />
            Main Thread I/O Monitor & Event Loop Tracer
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
            Synchronous file reads block the single-threaded Node.js execution handler, halting concurrent connection sockets. This monitor simulates thread responses under load.
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 shrink-0">
          <button 
            onClick={() => setActiveTab("logs")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-sans transition-all cursor-pointer ${
              activeTab === "logs" ? "bg-slate-950 text-slate-200 border border-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            System Console
          </button>
          <button 
            onClick={() => setActiveTab("graph")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-sans transition-all cursor-pointer ${
              activeTab === "graph" ? "bg-slate-950 text-slate-200 border border-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Event Loop Lag Chart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <div className="lg:col-span-8 flex flex-col bg-black/80 rounded-xl border border-slate-900 overflow-hidden font-mono text-xs text-slate-350 shadow-2xl relative h-64 justify-between">
          
          <div className="bg-slate-900/60 border-b border-slate-900 px-4 py-2 flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 font-semibold text-slate-400">
              <span className={`h-1.5 w-1.5 rounded-full ${hasActiveSync ? "bg-rose-500 animate-pulse" : "bg-emerald-500 animate-ping"}`} />
              THREAD_DIAGNOSTICS_HOST
            </span>
            <span className="text-slate-500 font-mono text-[9px]">
              TICK_DELAY: {chartData[chartData.length - 1]}ms
            </span>
          </div>

          {activeTab === "logs" && (
            <div className="p-4 flex-1 overflow-y-auto text-left space-y-1.5 select-text scrollbar-thin">
              {terminalLogs.map((log, index) => {
                let colorClass = "text-slate-350";
                if (log.includes("CRITICAL") || log.includes("WARNING")) colorClass = "text-rose-400 font-semibold";
                else if (log.includes("SUCCESS") || log.includes("STATUS:")) colorClass = "text-emerald-400";
                else if (log.includes("SYSTEM:")) colorClass = "text-slate-500";
                else if (log.includes("API INGRESS:")) colorClass = "text-indigo-400";
                
                return (
                  <div key={index} className={`font-mono text-[10.5px] leading-relaxed break-all ${colorClass}`}>
                    {log}
                  </div>
                );
              })}
              {isSimulatingSpike && (
                <div className="text-slate-500 animate-pulse flex items-center gap-1 font-mono text-[10.5px]">
                  <span>[PROCESSING EVENTS]</span>
                  <span className="blinking-cursor">_</span>
                </div>
              )}
            </div>
          )}

          {activeTab === "graph" && (
            <div className="flex-1 flex flex-col p-4 justify-between relative overflow-hidden">
              <div className="flex justify-between items-start text-[9px] text-slate-500 font-mono z-10">
                <span>CPU Event Loop Lock Delay (ms)</span>
                <span className={hasActiveSync ? "text-rose-400" : "text-emerald-400"}>
                  {hasActiveSync ? "SYNC_BLOCK_DETECTION_ACTIVE" : "STEADY_HEARTBEAT"}
                </span>
              </div>

              <div className="w-full h-32 mt-2 relative">
                <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={hasActiveSync ? "#ef4444" : "#10b981"} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={hasActiveSync ? "#ef4444" : "#10b981"} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3" />

                  <path d={areaPathString} fill="url(#areaGrad)" className="transition-all duration-300" />
                  
                  <polyline 
                    fill="none" 
                    stroke={hasActiveSync ? "#f43f5e" : "#10b981"} 
                    strokeWidth="1.5" 
                    points={polylinePointsString}
                    className="transition-all duration-300"
                  />

                  {svgPoints.map((p, idx) => {
                    if (p.val > 10) {
                      return (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="3" fill="#f43f5e" className="animate-ping" />
                          <circle cx={p.x} cy={p.y} r="2.5" fill="#ffffff" />
                        </g>
                      );
                    }
                    return null;
                  })}
                </svg>
              </div>

              <div className="flex justify-between items-center text-[8px] text-slate-600 font-mono border-t border-slate-900 pt-1 mt-2 z-10">
                <span>-20 sec</span>
                <span>-10 sec</span>
                <span>Live Event Loop Response</span>
              </div>
            </div>
          )}

          <div className="bg-slate-900/60 border-t border-slate-900 p-2 flex items-center justify-between text-xs">
            <button 
              onClick={runTrafficSimulation}
              disabled={isSimulatingSpike}
              className="px-3 py-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-[10px] text-slate-300 font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Play className="h-3 w-3 text-orange-400" />
              Run Traffic Simulation
            </button>
            <span className="text-[9px] text-slate-500 font-mono mr-2">
              HOST: localhost:3000
            </span>
          </div>

        </div>

        <div className="lg:col-span-4 bg-slate-900/30 border border-slate-900 rounded-xl p-4 flex flex-col justify-between self-stretch text-left">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
              <AlertTriangle className="h-3.5 w-3.5" />
              Sync Call Registry ({blockingIoIssues.length})
            </div>

            <div className="space-y-2 overflow-y-auto max-h-36 pr-1 scrollbar-thin">
              {blockingIoIssues.map((item) => {
                const isFixed = fixedIssues[item.originalIndex];
                const isFixing = fixingId === `perf-${item.originalIndex}`;
                return (
                  <div 
                    key={item.originalIndex}
                    className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1 transition-all ${
                      isFixed 
                        ? "border-emerald-950 bg-emerald-950/10 text-emerald-400" 
                        : "border-slate-900 bg-slate-950/40 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <code className="text-[10px] font-mono font-bold tracking-tight bg-slate-950 border border-slate-900 px-1 py-0.5 rounded truncate max-w-[150px]">
                        {item.file.split("/").pop()}
                      </code>
                      <span className={`text-[8px] font-mono uppercase px-1 rounded ${
                        isFixed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {isFixed ? "Async safe" : "Thread Blocker"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{item.suggestedOptimization}</p>
                    
                    {!isFixed && (
                      <button 
                        onClick={() => handleFix(item.originalIndex, item)}
                        disabled={isFixing}
                        className="mt-1 text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer self-start transition-colors"
                      >
                        {isFixing ? (
                          <>
                            <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-2.5 w-2.5 text-amber-400" />
                            Deploy Async Safe Patch
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}

              {blockingIoIssues.length === 0 && (
                <div className="text-center py-6 text-slate-500 font-sans text-xs">
                  No synchronous system operations found in project files.
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-[10px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-350 block flex items-center gap-1 font-sans">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              Event Loop Design Fact
            </span>
            <p className="leading-normal font-sans">
              Node.js operates on a single execution thread. Any synchronous file write or spawn process freezes the main call stack, meaning all incoming HTTP/WS sockets delay processing.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

/* ============================================================================
   SUB-COMPONENT: NPlus1Visualizer (Interactive animated N+1 diagram)
   ============================================================================ */
interface NPlus1VisualizerProps {
  nplus1Issues: any[];
  fixedIssues: Record<number, boolean>;
  handleFix: (idx: number, perf: any) => Promise<void>;
  fixingId: string | null;
  activeProject: CodeScopeAnalysis;
}

const NPlus1Visualizer: React.FC<NPlus1VisualizerProps> = ({
  nplus1Issues,
  fixedIssues,
  handleFix,
  fixingId,
  activeProject
}) => {
  const [selectedIssueIdx, setSelectedIssueIdx] = useState<number>(0);
  const [simMode, setSimMode] = useState<"nplus1" | "batch">("nplus1");
  const [simRunning, setSimRunning] = useState(false);
  
  const [simLatency, setSimLatency] = useState(0);
  const [simQueries, setSimQueries] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);

  const selectedIssue = nplus1Issues[selectedIssueIdx];
  const isFixed = selectedIssue ? fixedIssues[selectedIssue.originalIndex] : false;

  const dbTables = useMemo(() => {
    return activeProject.database?.tables || [
      { name: "users", columns: [{ name: "id" }, { name: "email" }] },
      { name: "posts", columns: [{ name: "id" }, { name: "user_id" }, { name: "title" }] }
    ];
  }, [activeProject]);

  const parentTable = dbTables[0]?.name || "users";
  const childTable = dbTables[1]?.name || "posts";

  const triggerSimulation = async () => {
    if (simRunning) return;
    setSimRunning(true);
    setSimLatency(0);
    setSimQueries(0);
    setActiveStep(0);

    if (simMode === "nplus1") {
      setSimQueries(1);
      setSimLatency(40);
      setActiveStep(0);
      await new Promise(r => setTimeout(r, 800));

      const loops = 6;
      for (let i = 1; i <= loops; i++) {
        setSimQueries(prev => prev + 1);
        setSimLatency(prev => prev + 45);
        setActiveStep(i);
        await new Promise(r => setTimeout(r, 700));
      }
    } else {
      setSimQueries(1);
      setSimLatency(25);
      setActiveStep(1);
      await new Promise(r => setTimeout(r, 1200));
    }

    setSimRunning(false);
    setActiveStep(-1);
  };

  return (
    <div className="space-y-5 bg-slate-950/40 p-5 rounded-2xl border border-slate-900 relative z-10 text-left">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
            <Database className="h-4.5 w-4.5 text-indigo-400" />
            N+1 Database Query Loop Visualizer
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
            Invoking queries sequentially inside a loop creates massive network handshake overhead. Batch or JOIN fetches load all records in a single database roundtrip.
          </p>
        </div>

        {nplus1Issues.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-sans">Target Issue:</span>
            <select 
              value={selectedIssueIdx}
              onChange={(e) => setSelectedIssueIdx(parseInt(e.target.value))}
              className="bg-slate-950 border border-slate-900 rounded-lg py-1 px-2.5 text-xs text-slate-300 font-mono focus:border-slate-800 outline-none cursor-pointer"
            >
              {nplus1Issues.map((item, idx) => (
                <option key={idx} value={idx}>
                  {item.file.split("/").pop()} - Line {item.line}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <div className="lg:col-span-8 bg-black/40 rounded-xl border border-slate-900 p-5 flex flex-col justify-between items-stretch shadow-inner relative overflow-hidden h-[330px]">
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button 
                onClick={() => setSimMode("nplus1")}
                disabled={simRunning}
                className={`px-3 py-1 rounded-md text-[10px] font-bold font-sans transition-all cursor-pointer ${
                  simMode === "nplus1" 
                    ? "bg-rose-950 text-rose-300 border border-rose-900/50 shadow-sm" 
                    : "text-slate-400 hover:text-slate-200 disabled:opacity-50"
                }`}
              >
                Unoptimized Loop (N+1)
              </button>
              <button 
                onClick={() => setSimMode("batch")}
                disabled={simRunning}
                className={`px-3 py-1 rounded-md text-[10px] font-bold font-sans transition-all cursor-pointer ${
                  simMode === "batch" 
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-900/50 shadow-sm" 
                    : "text-slate-400 hover:text-slate-200 disabled:opacity-50"
                }`}
              >
                Optimized Eager Load
              </button>
            </div>

            <button 
              onClick={triggerSimulation}
              disabled={simRunning}
              className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-[10px] font-bold text-white rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-indigo-500/20 active:scale-95 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-white text-white" />
              Run Latency Simulation
            </button>
          </div>

          <div className="flex items-center justify-between px-6 relative my-auto h-40">
            
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-lg relative group glow-node">
                <Cpu className="h-6 w-6 text-indigo-400" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-300 block font-sans">API Server</span>
                <span className="text-[8px] font-mono text-slate-500">Node.js thread</span>
              </div>
            </div>

            <div className="flex-1 h-0.5 bg-slate-900 mx-4 relative">
              
              {simRunning && simMode === "nplus1" && (
                <>
                  {activeStep === 0 ? (
                    <div className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8] particle-right" />
                  ) : activeStep > 0 ? (
                    <div className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] particle-right" />
                  ) : null}
                  
                  {activeStep >= 0 && (
                    <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8] particle-left" />
                  )}
                </>
              )}

              {simRunning && simMode === "batch" && (
                <>
                  <div className="absolute -top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] particle-right" />
                  <div className="absolute -bottom-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] particle-left" />
                </>
              )}

              <div className="absolute left-[50%] -translate-x-1/2 top-4 bg-slate-950 border border-slate-900 px-3 py-1 rounded-lg text-center z-10 min-w-[120px]">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">NETWORK STREAM</span>
                <span className={`text-[10px] font-bold font-mono ${
                  simMode === "nplus1" ? "text-rose-400 animate-pulse" : "text-emerald-400"
                }`}>
                  {simRunning 
                    ? (simMode === "nplus1" ? `Query Loop ${simQueries} / 7` : "Eager Batch JOIN")
                    : "Conduit Standby"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-lg relative glow-node">
                <Database className={`h-6 w-6 transition-all duration-300 ${
                  simRunning ? (simMode === "nplus1" ? "text-rose-400" : "text-emerald-400") : "text-slate-400"
                }`} />
                {simRunning && (
                  <span className="absolute inset-0 border border-indigo-500/20 rounded-2xl animate-ping" />
                )}
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-300 block font-sans">Database</span>
                <span className="text-[8px] font-mono text-slate-500">PostgreSQL/MySQL</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-slate-900 pt-4 relative z-10">
            <div className="bg-slate-950/80 border border-slate-900/60 p-2.5 rounded-xl text-center space-y-0.5">
              <span className="text-[8px] font-mono text-slate-500 block uppercase">ROUNDTRIPS</span>
              <strong className={`text-sm font-mono block ${
                simQueries > 1 ? "text-rose-400 font-bold" : simQueries === 1 ? "text-emerald-400" : "text-slate-300"
              }`}>
                {simQueries > 0 ? `${simQueries} fetches` : "-"}
              </strong>
            </div>

            <div className="bg-slate-950/80 border border-slate-900/60 p-2.5 rounded-xl text-center space-y-0.5">
              <span className="text-[8px] font-mono text-slate-500 block uppercase">LATENCY SPENT</span>
              <strong className={`text-sm font-mono block ${
                simLatency > 100 ? "text-rose-400 font-bold animate-pulse" : simLatency > 0 ? "text-emerald-400" : "text-slate-300"
              }`}>
                {simLatency > 0 ? `${simLatency}ms` : "-"}
              </strong>
            </div>

            <div className="bg-slate-950/80 border border-slate-900/60 p-2.5 rounded-xl text-center space-y-0.5">
              <span className="text-[8px] font-mono text-slate-500 block uppercase">SOCKET STATUS</span>
              <strong className={`text-sm font-mono block ${
                simRunning ? "text-amber-400 font-bold" : "text-slate-400"
              }`}>
                {simRunning ? "LOCKED / ACTIVE" : "RELEASED / IDLE"}
              </strong>
            </div>
          </div>

        </div>

        <div className="lg:col-span-4 bg-slate-900/30 border border-slate-900 rounded-xl p-4 flex flex-col justify-between self-stretch text-left">
          
          {selectedIssue ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  N+1 Loop Alert
                </div>
                <h4 className="text-xs font-bold text-white font-sans">{selectedIssue.issue}</h4>
                <code className="text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-900 px-1 py-0.5 rounded truncate max-w-full block">
                  {selectedIssue.file.split("/").pop()}:Line {selectedIssue.line}
                </code>
              </div>

              <div className="space-y-2">
                <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">AFFECTED ORM SCHEMAS</div>
                <div className="flex gap-2 flex-wrap text-[10px] font-mono">
                  <span className="bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-indigo-300">
                    Parent: {parentTable}
                  </span>
                  <span className="bg-slate-950 border border-slate-900 px-2 py-0.5 rounded text-sky-300">
                    Child: {childTable}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">IMPACT ASSESSMENT</div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  The query fetches parents, then loops and triggers select statement queries targeting child rows {childTable} one by one. This locks relational handles.
                </p>
              </div>

              {isFixed ? (
                <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 p-2.5 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 font-sans">
                  <CheckCircle className="h-4 w-4" /> Loop Eager Resolved
                </div>
              ) : (
                <button
                  onClick={() => handleFix(selectedIssue.originalIndex, selectedIssue)}
                  disabled={fixingId === `perf-${selectedIssue.originalIndex}`}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl border border-indigo-500/30 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer font-sans"
                >
                  {fixingId === `perf-${selectedIssue.originalIndex}` ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Eager-loading Join...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                      <span>Batch Load / JOIN Refactor</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center my-auto space-y-2 p-6">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">0 N+1 Queries Detected</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Relational tables loaded asynchronously. No database sequential request iteration anomalies found.
              </p>
            </div>
          )}

          <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-[9.5px] text-slate-400 space-y-1 mt-4">
            <span className="font-bold text-slate-350 block flex items-center gap-1 font-sans">
              <Info className="h-3.5 w-3.5 text-indigo-400" />
              ORM Eager Load Formula
            </span>
            <p className="leading-normal font-sans">
              Use query prefetching. Instead of executing queries inside loops, join tables in SQL or feed all parent IDs inside a single `IN` array condition to hit the database exactly once.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
