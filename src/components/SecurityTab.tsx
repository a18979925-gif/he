import React from "react";
import { 
  ShieldAlert, 
  Info, 
  Check, 
  ShieldCheck, 
  Flame, 
  ArrowDownCircle, 
  RefreshCw,
  Terminal,
  FileCode,
  Lock,
  Binary,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Copy,
  Cpu,
  FileText,
  CheckCircle2,
  ShieldAlert as AlertOctagon,
  ExternalLink,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Zap,
  X
} from "lucide-react";
import { CodeScopeAnalysis, SecurityIssue } from "../types";

// Extended interface to safely access runtime isFixed property
interface SecurityIssueExtended extends SecurityIssue {
  isFixed?: boolean;
}

interface SecurityTabProps {
  activeProject: CodeScopeAnalysis;
  selectedSecurityIssue: SecurityIssue | null;
  setSelectedSecurityIssue: (issue: SecurityIssue | null) => void;
  securityFixed: boolean;
  setSecurityFixed: (fixed: boolean) => void;
  onFixIssue?: (filePath: string, oldCode: string, newCode: string) => Promise<void>;
}

// Custom code highlighting helper to render rich, stylized tokens without unsafe html parsing
const HighlightCodeLine: React.FC<{ line: string }> = ({ line }) => {
  if (!line.trim()) return <span className="opacity-0">.</span>;

  // Entire line is a comment
  if (line.trim().startsWith("//")) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  // Tokenize using regex preserving spaces, punctuation and quotes
  const parts = line.split(/(\s+|[=()\[\]{}:.,;"'<>!+\-*/%&|^~?])/);
  let isComment = false;
  let isString = false;
  let stringChar: string | null = null;

  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null;

        // Comment mode
        if (isComment) {
          return <span key={idx} className="text-slate-500 italic">{part}</span>;
        }
        if (part === "//" || part.startsWith("//")) {
          isComment = true;
          return <span key={idx} className="text-slate-500 italic">{part}</span>;
        }

        // String mode
        if (isString) {
          if (part === stringChar) {
            isString = false;
            stringChar = null;
            return <span key={idx} className="text-amber-400 font-mono">{part}</span>;
          }
          return <span key={idx} className="text-amber-200/90 font-mono">{part}</span>;
        }

        if (part === '"' || part === "'" || part === "`") {
          isString = true;
          stringChar = part;
          return <span key={idx} className="text-amber-400 font-mono">{part}</span>;
        }

        const lower = part.toLowerCase();
        // Standard code keywords
        const keywords = new Set([
          "select", "from", "where", "insert", "update", "delete", "into", "values", "join",
          "const", "let", "var", "function", "return", "import", "await", "async", "export",
          "class", "interface", "extends", "implements", "public", "private", "protected",
          "try", "catch", "finally", "throw", "new", "if", "else", "for", "while", "do", "switch", "case"
        ]);

        if (keywords.has(lower)) {
          return <span key={idx} className="text-violet-400 font-bold font-mono">{part}</span>;
        }

        // Database methods / high risk invocations
        if (["query", "execute", "eval", "run", "db", "sql"].includes(lower)) {
          return <span key={idx} className="text-rose-400 font-bold font-mono">{part}</span>;
        }

        // Operators
        if (/[=+\-*/%&|!<>?]/.test(part)) {
          return <span key={idx} className="text-indigo-400/90 font-mono">{part}</span>;
        }

        return <span key={idx} className="font-mono">{part}</span>;
      })}
    </>
  );
};

// Sub-component for beautiful code diff windows
interface CodeBlockProps {
  code: string;
  type: "vulnerable" | "secure";
  title: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, type, title }) => {
  const lines = code.trim().split("\n");
  const isVulnerable = type === "vulnerable";

  return (
    <div className={`rounded-xl border overflow-hidden flex flex-col transition-all duration-300 ${
      isVulnerable 
        ? "bg-rose-950/10 border-rose-900/30 shadow-[inset_0_0_12px_rgba(244,63,94,0.03)]" 
        : "bg-emerald-950/10 border-emerald-900/30 shadow-[inset_0_0_12px_rgba(16,185,129,0.03)]"
    }`}>
      {/* Header of code block */}
      <div className={`px-4 py-2 border-b flex items-center justify-between font-mono text-[10px] tracking-wider uppercase font-bold ${
        isVulnerable 
          ? "bg-rose-950/40 border-rose-900/30 text-rose-400" 
          : "bg-emerald-950/40 border-emerald-900/30 text-emerald-400"
      }`}>
        <span className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${isVulnerable ? "bg-rose-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
          {title}
        </span>
        <span className="text-[9px] opacity-75">{isVulnerable ? "DETECTOR FINDING" : "MITIGATOR PATTERN"}</span>
      </div>

      {/* Code Container */}
      <div className="p-4 overflow-x-auto max-h-[300px] scrollbar-thin">
        <pre className="font-mono text-[11px] leading-relaxed text-left flex flex-col min-w-full font-normal">
          {lines.map((line, idx) => (
            <div key={idx} className={`flex items-start py-0.5 -mx-4 px-4 min-w-max transition-colors duration-150 ${
              isVulnerable ? "hover:bg-rose-500/5" : "hover:bg-emerald-500/5"
            }`}>
              {/* Line Number Column */}
              <span className={`w-8 select-none text-right pr-3 font-mono text-[10px] shrink-0 ${
                isVulnerable ? "text-rose-500/40" : "text-emerald-500/40"
              }`}>
                {idx + 1}
              </span>
              {/* Highlighted text */}
              <span className={`font-mono ${isVulnerable ? "text-rose-200/90" : "text-emerald-200/90"}`}>
                <HighlightCodeLine line={line} />
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

// ─── Severity Breakdown Summary Bar ─────────────────────────────────────────
interface SeverityCount {
  label: string;
  count: number;
  color: string;
  bgColor: string;
  borderColor: string;
  barColor: string;
  pulseColor?: string;
}

const SeverityBreakdownBar: React.FC<{ issues: SecurityIssueExtended[] }> = ({ issues }) => {
  const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  issues.forEach(i => { counts[i.severity] = (counts[i.severity] || 0) + 1; });
  const total = issues.length || 1;

  const severities: SeverityCount[] = [
    { label: "Critical", count: counts.Critical, color: "text-rose-400", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/30", barColor: "bg-rose-500", pulseColor: "bg-rose-400" },
    { label: "High", count: counts.High, color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30", barColor: "bg-orange-500" },
    { label: "Medium", count: counts.Medium, color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30", barColor: "bg-amber-500" },
    { label: "Low", count: counts.Low, color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30", barColor: "bg-blue-500" },
  ];

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-xl p-4 relative z-10">
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

      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="h-4 w-4 text-rose-400" />
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Severity Breakdown</span>
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap gap-2 mb-3">
        {severities.map(s => (
          <div
            key={s.label}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${s.bgColor} ${s.borderColor} transition-all duration-300 hover:scale-105`}
          >
            {/* Pulsing dot for critical */}
            {s.label === "Critical" && s.count > 0 ? (
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${s.pulseColor} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${s.barColor}`} />
              </span>
            ) : (
              <span className={`h-2 w-2 rounded-full ${s.barColor} ${s.count > 0 ? "opacity-100" : "opacity-30"}`} />
            )}
            <span className={`text-[10px] font-bold font-mono uppercase tracking-wider ${s.color} ${s.count === 0 ? "opacity-40" : ""}`}>
              {s.label}
            </span>
            <span className={`text-xs font-black font-mono ${s.color} ${s.count === 0 ? "opacity-40" : ""}`}>
              {s.count}
            </span>
          </div>
        ))}
      </div>

      {/* Stacked progress bar */}
      <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
        {severities.map(s => (
          s.count > 0 ? (
            <div
              key={s.label}
              className={`${s.barColor} transition-all duration-700 ease-out relative overflow-hidden`}
              style={{ width: `${(s.count / total) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-[shimmer_2s_infinite]" />
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
};

// ─── Filter/Search Bar ──────────────────────────────────────────────────────
interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  severityFilter: string;
  setSeverityFilter: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  categories: string[];
}

const FilterSearchBar: React.FC<FilterBarProps> = ({
  searchQuery, setSearchQuery,
  severityFilter, setSeverityFilter,
  categoryFilter, setCategoryFilter,
  categories
}) => {
  const hasActiveFilters = searchQuery || severityFilter !== "All" || categoryFilter !== "All";

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 relative z-10 space-y-2">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by file path, category, description..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-300 placeholder:text-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-3 w-3 text-slate-500 shrink-0" />

        {/* Severity filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-400 font-mono uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer appearance-none hover:border-slate-700 transition-colors"
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-400 font-mono uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer appearance-none hover:border-slate-700 transition-colors max-w-[180px] truncate"
        >
          <option value="All">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => { setSearchQuery(""); setSeverityFilter("All"); setCategoryFilter("All"); }}
            className="text-[9px] text-indigo-400 hover:text-indigo-300 font-mono uppercase tracking-wider flex items-center gap-1 px-2 py-1 bg-indigo-950/30 border border-indigo-900/30 rounded-lg transition-all duration-200 hover:bg-indigo-950/50 cursor-pointer"
          >
            <X className="h-2.5 w-2.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Expandable Issue Detail Panel (inside card) ────────────────────────────
const IssueExpandedDetail: React.FC<{ issue: SecurityIssueExtended; isExpanded: boolean }> = ({ issue, isExpanded }) => {
  return (
    <div
      className={`overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? "max-h-[200px] opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
      }`}
    >
      <div className="bg-slate-950/60 border border-slate-800/50 rounded-lg p-3 space-y-1.5">
        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
          <strong className="text-slate-300">Solution:</strong> {issue.solution}
        </p>
        {issue.oldCode && (
          <p className="text-[10px] text-slate-500 font-mono truncate">
            <strong className="text-slate-400">Affected pattern:</strong> {issue.oldCode.split("\n")[0]}...
          </p>
        )}
      </div>
    </div>
  );
};

export const SecurityTab: React.FC<SecurityTabProps> = ({
  activeProject,
  selectedSecurityIssue,
  setSelectedSecurityIssue,
  securityFixed,
  setSecurityFixed,
  onFixIssue,
}) => {
  const [fixing, setFixing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [bulkFixing, setBulkFixing] = React.useState(false);
  const [expandedCards, setExpandedCards] = React.useState<Set<number>>(new Set());

  // Filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState("All");
  const [categoryFilter, setCategoryFilter] = React.useState("All");

  const handleFix = async () => {
    if (!selectedSecurityIssue || !onFixIssue) return;
    try {
      setFixing(true);
      await onFixIssue(selectedSecurityIssue.file, selectedSecurityIssue.oldCode || "", selectedSecurityIssue.newCode || "");
      setSecurityFixed(true);
    } catch (err) {
      console.error("Vulnerability refactoring fix failed:", err);
    } finally {
      setFixing(false);
    }
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCardExpand = (idx: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Cast selected issue to extended type to handle custom checks
  const selectedIssueExtended = selectedSecurityIssue as (SecurityIssueExtended | null);

  // Calculate dynamic security score based on active vulnerabilities
  const issues = (activeProject.security || []) as SecurityIssueExtended[];
  let baseScore = 100;
  const subtractions: Array<{ name: string; amount: number; count: number }> = [];

  if (issues.length > 0) {
    const categoriesMap: Record<string, number> = {};
    issues.forEach(issue => {
      categoriesMap[issue.category] = (categoriesMap[issue.category] || 0) + 1;
    });

    Object.entries(categoriesMap).forEach(([category, count]) => {
      let penalty = 5;
      if (category.toLowerCase().includes("xml") || category.toLowerCase().includes("deserial") || category.toLowerCase().includes("xxe")) {
        penalty = 15;
      } else if (category.toLowerCase().includes("sql") || category.toLowerCase().includes("injection")) {
        penalty = 12;
      } else if (category.toLowerCase().includes("xss") || category.toLowerCase().includes("scripting")) {
        penalty = 8;
      } else if (category.toLowerCase().includes("secret") || category.toLowerCase().includes("key") || category.toLowerCase().includes("credential")) {
        penalty = 10;
      } else if (category.toLowerCase().includes("csrf") || category.toLowerCase().includes("request forgery")) {
        penalty = 6;
      }
      baseScore -= (penalty * count);
      subtractions.push({ name: category, amount: penalty, count });
    });
  }

  const securityScore = Math.max(10, baseScore);

  // Generate ASCII-style bar progress display: e.g. ████████░░ for 80%
  const solidBlocksCount = Math.round(securityScore / 10);
  const emptyBlocksCount = 10 - solidBlocksCount;
  const asciiBar = "█".repeat(solidBlocksCount) + "░".repeat(emptyBlocksCount);

  // Score SVG Arc metrics
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (securityScore / 100) * circumference;

  // Custom icon mapping based on categories
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("sql") || cat.includes("injection")) {
      return <Terminal className="h-4 w-4 text-rose-400" />;
    }
    if (cat.includes("xss") || cat.includes("scripting")) {
      return <FileCode className="h-4 w-4 text-amber-400" />;
    }
    if (cat.includes("secret") || cat.includes("key") || cat.includes("credential")) {
      return <Lock className="h-4 w-4 text-violet-400" />;
    }
    if (cat.includes("xml") || cat.includes("deserial") || cat.includes("xxe")) {
      return <Binary className="h-4 w-4 text-sky-400" />;
    }
    return <ShieldAlert className="h-4 w-4 text-orange-400" />;
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-500/10 text-rose-400 border-rose-500/35 shadow-[0_0_8px_rgba(244,63,94,0.06)]";
      case "High":
        return "bg-orange-500/10 text-orange-400 border-orange-500/35 shadow-[0_0_8px_rgba(249,115,22,0.06)]";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/35 shadow-[0_0_8px_rgba(245,158,11,0.06)]";
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/35 shadow-[0_0_8px_rgba(59,130,246,0.06)]";
    }
  };

  // Severity-based left border color for enhanced cards
  const getSeverityBorderColor = (severity: string, isFixed: boolean) => {
    if (isFixed) return "border-l-emerald-500";
    switch (severity) {
      case "Critical": return "border-l-rose-500";
      case "High": return "border-l-orange-500";
      case "Medium": return "border-l-amber-500";
      default: return "border-l-blue-500";
    }
  };

  // Count auto-fixable issues (issues with both oldCode and newCode that are not fixed)
  const fixableIssues = issues.filter(i => i.oldCode && i.newCode && !i.isFixed);
  const fixableCount = fixableIssues.length;

  // Unique categories for filter dropdown
  const uniqueCategories = Array.from(new Set(issues.map(i => i.category)));

  // Apply filters
  const filteredIssues = issues.filter(issue => {
    // Severity filter
    if (severityFilter !== "All" && issue.severity !== severityFilter) return false;
    // Category filter
    if (categoryFilter !== "All" && issue.category !== categoryFilter) return false;
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesFile = issue.file.toLowerCase().includes(q);
      const matchesCategory = issue.category.toLowerCase().includes(q);
      const matchesDescription = issue.description.toLowerCase().includes(q);
      const matchesSeverity = issue.severity.toLowerCase().includes(q);
      if (!matchesFile && !matchesCategory && !matchesDescription && !matchesSeverity) return false;
    }
    return true;
  });

  // Bulk fix all handler
  const handleBulkFix = async () => {
    if (!onFixIssue || fixableCount === 0) return;
    setBulkFixing(true);
    try {
      for (const issue of fixableIssues) {
        await onFixIssue(issue.file, issue.oldCode || "", issue.newCode || "");
        (issue as SecurityIssueExtended).isFixed = true;
      }
      setSecurityFixed(true);
    } catch (err) {
      console.error("Bulk fix failed:", err);
    } finally {
      setBulkFixing(false);
    }
  };

  return (
    <div 
      className="space-y-6 text-left bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-900 relative shadow-2xl overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" 
      id="security-tab-view"
    >
      {/* Shimmer keyframes injected via style tag */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-in {
          animation: fadeSlideIn 0.3s ease-out forwards;
        }
      `}</style>

      {/* Visual cyber glow background grids */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-rose-500/5 blur-3xl rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Control Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5 relative z-10">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            Cyber-Security Threat Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time AST heuristic engine mapping vulnerabilities, cryptographic exposures, and unsafe SQL patterns.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-[10px] text-slate-400">
          <Cpu className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>SCAN STATUS: IDLE / COMPLETED</span>
        </div>
      </div>

      {/* ─── NEW: Severity Breakdown Summary Bar ─────────────────────────── */}
      {issues.length > 0 && (
        <SeverityBreakdownBar issues={issues} />
      )}

      {/* ─── NEW: Filter/Search Bar ──────────────────────────────────────── */}
      {issues.length > 0 && (
        <FilterSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={uniqueCategories}
        />
      )}

      {/* Upgraded Cyber Security Score Panel */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Radial dial score representation */}
        <div className="flex items-center gap-6 flex-1">
          <div className="relative flex items-center justify-center h-24 w-24 shrink-0 bg-slate-950/60 rounded-full border border-slate-800/50 shadow-inner">
            <svg className="w-full h-full transform -rotate-90">
              {/* Grid Background Circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="6"
                fill="none"
              />
              {/* Glowing compliance ring */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className={`transition-all duration-1000 ease-out ${
                  securityScore > 85 ? "stroke-emerald-500" : securityScore > 65 ? "stroke-amber-500" : "stroke-rose-500"
                }`}
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            {/* Value Indicator */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white font-mono leading-none tracking-tighter">
                {securityScore}
              </span>
              <span className="text-[8px] text-slate-500 font-bold font-mono uppercase tracking-wider mt-0.5">
                INDEX
              </span>
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">
                Threat Compliance Rating
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-sans">
              Score Assessment:{" "}
              <span className={`font-extrabold ${
                securityScore > 85 ? "text-emerald-400" : securityScore > 65 ? "text-amber-400" : "text-rose-400"
              }`}>
                {securityScore > 85 ? "SECURE" : securityScore > 65 ? "WARNING" : "CRITICAL"}
              </span>
            </h3>
            
            {/* Custom styled progress meter and ASCII widget */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="h-2 bg-slate-950 rounded-full flex-1 overflow-hidden border border-slate-800 max-w-xs">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    securityScore > 85 ? "bg-emerald-500" : securityScore > 65 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${securityScore}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-indigo-400 font-mono tracking-widest bg-slate-950/80 px-2.5 py-0.5 border border-slate-800 rounded">
                {asciiBar}
              </span>
            </div>
          </div>
        </div>

        {/* Penalty breakdowns Console */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl shrink-0 min-w-[300px] shadow-inner font-mono">
          <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Vulnerability Penalties</span>
          </div>
          <div className="space-y-2 text-[11px]">
            {subtractions.map((sub, i) => (
              <div key={i} className="flex justify-between items-center font-mono">
                <span className="text-slate-300 truncate max-w-[190px] flex items-center gap-1.5" title={sub.name}>
                  <span className="h-1 w-1 rounded-full bg-rose-500" />
                  {sub.name}
                </span>
                <span className="text-rose-400 font-bold shrink-0 bg-rose-950/30 px-1.5 py-0.5 rounded border border-rose-900/30">
                  -{sub.amount * sub.count} ({sub.count}x)
                </span>
              </div>
            ))}
            {subtractions.length === 0 && (
              <div className="text-emerald-400 text-[10px] italic flex items-center gap-1.5 py-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Zero threat violations. Safe rating!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Columns: Threat Feed */}
        <div className="space-y-3 lg:col-span-5 flex flex-col">
          {/* ─── Header with Bulk Fix All Button ─────────────────────────── */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-rose-500" />
              Detected Vector Feeds ({filteredIssues.length}{filteredIssues.length !== issues.length ? ` / ${issues.length}` : ""})
            </span>

            {/* Bulk Fix All Button */}
            {fixableCount > 0 && onFixIssue && (
              <button
                onClick={handleBulkFix}
                disabled={bulkFixing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600/80 to-violet-600/80 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white text-[9px] font-mono font-bold uppercase tracking-wider rounded-lg border border-indigo-500/20 transition-all duration-300 cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.15)] hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] active:scale-[0.97]"
              >
                {bulkFixing ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Fixing...
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3" />
                    Bulk Fix All ({fixableCount})
                  </>
                )}
              </button>
            )}
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1.5 scrollbar-thin">
            {filteredIssues.map((issue, idx) => {
              const originalIdx = issues.indexOf(issue);
              const isFixed = issue.isFixed || (selectedSecurityIssue?.category === issue.category && selectedSecurityIssue?.file === issue.file && securityFixed);
              const isSelected = selectedSecurityIssue?.category === issue.category && selectedSecurityIssue?.file === issue.file;
              const isExpanded = expandedCards.has(originalIdx);

              return (
                <div
                  key={originalIdx}
                  className="animate-fade-slide-in"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <button
                    onClick={() => { 
                      setSelectedSecurityIssue(issue); 
                      setSecurityFixed(issue.isFixed || false); 
                    }}
                    className={`w-full text-left p-4 rounded-xl border-l-4 border border-t border-r border-b transition-all duration-300 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden group ${
                      getSeverityBorderColor(issue.severity, isFixed || false)
                    } ${
                      isFixed 
                        ? "bg-emerald-950/5 border-t-emerald-950/40 border-r-emerald-950/40 border-b-emerald-950/40 hover:bg-emerald-950/10" 
                        : isSelected
                          ? "bg-slate-900/90 border-t-slate-700 border-r-slate-700 border-b-slate-700 shadow-[0_0_20px_rgba(244,63,94,0.06)] shadow-lg" 
                          : "bg-slate-900/30 hover:bg-slate-900/50 border-t-slate-900 border-r-slate-900 border-b-slate-900 hover:border-t-slate-800 hover:border-r-slate-800 hover:border-b-slate-800 hover:shadow-md"
                    }`}
                  >
                    {/* Ambient glow for critical severity */}
                    {issue.severity === "Critical" && !isFixed && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-2xl rounded-full pointer-events-none" />
                    )}

                    {/* Header info */}
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        {isFixed ? (
                          <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider font-mono flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Mitigated
                          </span>
                        ) : (
                          <span className={`${getSeverityStyle(issue.severity)} px-2 py-0.5 rounded border flex items-center gap-1.5`}>
                            {/* Animated pulsing dot for Critical severity */}
                            {issue.severity === "Critical" && (
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                              </span>
                            )}
                            <SeverityBadge severity={issue.severity} />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-950/80 px-2 py-0.5 border border-slate-900 rounded">
                          Line {issue.line || "N/A"}
                        </span>
                        {/* Expand/Collapse toggle */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCardExpand(originalIdx); }}
                          className="text-slate-500 hover:text-slate-300 p-0.5 transition-colors cursor-pointer"
                          title={isExpanded ? "Collapse" : "Expand preview"}
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Category Title */}
                    <div className="space-y-1">
                      <h4 className={`text-xs font-bold font-sans flex items-center gap-1.5 ${
                        isFixed ? "text-slate-500 line-through" : "text-white"
                      }`}>
                        {getCategoryIcon(issue.category)}
                        {issue.category}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                        {issue.description}
                      </p>
                    </div>

                    {/* Expandable Detail Section */}
                    <IssueExpandedDetail issue={issue} isExpanded={isExpanded} />

                    {/* File Metadata footer */}
                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900/60 pt-2.5 mt-1 font-mono">
                      <span className="truncate max-w-[200px] text-slate-400 flex items-center gap-1">
                        <FileText className="h-3 w-3 text-slate-500 shrink-0" />
                        {issue.file.split(/[\\/]/).pop()}
                      </span>
                      <span className={`text-[10px] font-bold transition-all flex items-center gap-0.5 ${
                        isFixed 
                          ? "text-emerald-400" 
                          : isSelected 
                            ? "text-rose-400" 
                            : "text-indigo-400 group-hover:translate-x-0.5"
                      }`}>
                        {isFixed ? "Mitigated" : isSelected ? "Inspecting" : "Mitigate"} 
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}

            {/* Empty state when filters yield no results */}
            {filteredIssues.length === 0 && issues.length > 0 && (
              <div className="bg-slate-900/30 text-slate-400 p-6 rounded-xl border border-slate-900/60 text-xs text-center font-sans space-y-2">
                <Search className="h-6 w-6 text-slate-600 mx-auto" />
                <p className="font-bold text-slate-300">No matching issues found</p>
                <p className="text-slate-500 text-[11px]">Try adjusting your filters or search query.</p>
              </div>
            )}

            {issues.length === 0 && (
              <div className="bg-emerald-950/15 text-emerald-400 p-8 rounded-xl border border-emerald-900/30 text-xs text-center font-sans space-y-2">
                <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto animate-bounce" />
                <p className="font-bold">No security anomalies identified!</p>
                <p className="text-emerald-500/70 text-[11px]">The scanner heuristics has evaluated all code blocks as secure.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Security Sandbox Terminal & Code Diff */}
        <div className="lg:col-span-7">
          {selectedIssueExtended ? (
            <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800/90 shadow-2xl space-y-5 flex flex-col relative overflow-hidden animate-fade-slide-in">
              
              {/* Window Controls Decorator */}
              <div className="border-b border-slate-950/60 pb-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-slate-500 text-[10px] font-mono ml-2 border-l border-slate-800 pl-3">
                    sandbox-terminal://vulnerability-mitigator
                  </span>
                </div>
                <span className="bg-indigo-950/40 text-indigo-400 border border-indigo-900/50 text-[9px] font-mono px-2 py-0.5 rounded tracking-wide uppercase">
                  Mitigate IDE
                </span>
              </div>

              {/* Vulnerability Meta information */}
              <div className="text-xs text-slate-350 leading-relaxed font-sans space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400 font-bold block">Target File:</span>
                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 border border-slate-850 rounded text-slate-300 font-mono text-[10px] break-all">
                    <span>{selectedIssueExtended.file}</span>
                    <button 
                      onClick={() => handleCopyPath(selectedIssueExtended.file)}
                      className="hover:text-white p-0.5 transition-colors cursor-pointer"
                      title="Copy path"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  {copied && (
                    <span className="text-[9px] text-emerald-400 font-mono">Copied!</span>
                  )}
                </div>

                <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
                    <h4 className="text-xs font-bold text-white font-sans">{selectedIssueExtended.category}</h4>
                    {/* Severity badge in detail panel */}
                    <span className={`${getSeverityStyle(selectedIssueExtended.severity)} px-1.5 py-0.5 rounded border ml-auto flex items-center gap-1`}>
                      {selectedIssueExtended.severity === "Critical" && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
                        </span>
                      )}
                      <span className="text-[9px] font-extrabold font-mono uppercase tracking-wider">{selectedIssueExtended.severity}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {selectedIssueExtended.description}
                  </p>
                </div>
              </div>

              {/* Side-by-side / Stacked code sandbox editor views */}
              <div className="space-y-4">
                {/* Vulnerable Original Code Box */}
                <CodeBlock 
                  code={selectedIssueExtended.oldCode || "Direct execution query references."} 
                  type="vulnerable" 
                  title="Detector Findings (Unsafe Code Block)" 
                />

                {/* Safe Suggested Refactoring Box */}
                <CodeBlock 
                  code={selectedIssueExtended.newCode || "Parameterized implementation syntax."} 
                  type="secure" 
                  title="Suggested Secure Refactoring" 
                />
              </div>

              {/* AI advisory solution component */}
              <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-900/30 text-[11px] text-indigo-300 font-sans flex items-start gap-2.5">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-0.5 text-left">
                  <strong className="text-white font-semibold">Security Advisory:</strong>
                  <p className="text-slate-400 mt-1 leading-normal">{selectedIssueExtended.solution}</p>
                </div>
              </div>

              {/* Mitigation Button Actions */}
              {selectedIssueExtended.isFixed || securityFixed ? (
                <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 font-mono border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400 animate-pulse" /> 
                  SECURITY MITIGATION APPLIED SUCCESSFULLY
                </div>
              ) : (
                <button
                  onClick={handleFix}
                  disabled={fixing}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:border-slate-700 text-white text-xs font-mono font-bold tracking-wide py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.2)] active:scale-[0.99] border border-indigo-500/20"
                >
                  {fixing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      COMPILING & APPLYING AST REFACTOR FIX...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4.5 w-4.5" />
                      EXECUTE MITIGATION REFACTOR FIX
                    </>
                  )}
                </button>
              )}

            </div>
          ) : (
            <div className="bg-slate-900/30 p-12 rounded-2xl border border-slate-900/80 text-slate-500 text-xs text-center flex flex-col justify-center items-center h-[520px] font-sans relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03),transparent_60%)] pointer-events-none" />
              <div className="relative flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-slate-950 flex items-center justify-center border border-slate-900 shadow-xl mb-4 group hover:border-slate-800 transition-all duration-300">
                  <Info className="h-8 w-8 text-slate-700 group-hover:text-slate-500 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-300 mb-1">Security Sandbox Deactivated</h3>
                <p className="max-w-xs text-slate-500 text-[11px] leading-relaxed">
                  Select a threat vulnerability vector from the detected anomalies stream on the left panel to inspect AST diagnostics and recommended secure refactoring patterns.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Internal sub-badge component to cleanly label severity ratings
const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  return (
    <span className="font-extrabold uppercase font-mono tracking-wider text-[9px]">
      {severity}
    </span>
  );
};
