import React, { useState } from "react";
import { 
  ShieldAlert, 
  TrendingUp, 
  Bug, 
  Eye, 
  Settings, 
  FileCode, 
  CheckCircle, 
  RefreshCw,
  Terminal,
  Sparkles,
  AlertCircle,
  Check,
  Activity
} from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface UnifiedIssue {
  id: string;
  type: "security" | "performance" | "bug" | "smell";
  category: string;
  file: string;
  line?: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  solution: string;
  oldCode?: string;
  newCode?: string;
  isFixed?: boolean;
}

interface DiagnosticsTabProps {
  activeProject: CodeScopeAnalysis;
  onFixIssue: (filePath: string, oldCode: string, newCode: string) => Promise<void>;
  setActiveTab: (tab: string) => void;
  setSelectedFile: (file: string) => void;
}

export const DiagnosticsTab: React.FC<DiagnosticsTabProps> = ({
  activeProject,
  onFixIssue,
  setActiveTab,
  setSelectedFile,
}) => {
  const [filterType, setFilterType] = useState<string>("All");
  const [filterSeverity, setFilterSeverity] = useState<string>("All");
  const [fixingId, setFixingId] = useState<string | null>(null);

  // Unified list of all issues
  const allIssues: UnifiedIssue[] = [];

  // 1. Security
  activeProject.security?.forEach((issue, idx) => {
    allIssues.push({
      id: `sec-${idx}`,
      type: "security",
      category: issue.category,
      file: issue.file,
      line: issue.line,
      severity: issue.severity,
      description: issue.description,
      solution: issue.solution,
      oldCode: issue.oldCode,
      newCode: issue.newCode,
      isFixed: (issue as any).isFixed || false,
    });
  });

  // 2. Performance
  activeProject.performance?.forEach((issue, idx) => {
    allIssues.push({
      id: `perf-${idx}`,
      type: "performance",
      category: issue.issue,
      file: issue.file,
      line: issue.line,
      severity: issue.severity,
      description: issue.description,
      solution: issue.suggestedOptimization,
      oldCode: issue.oldCode,
      newCode: issue.newCode,
      isFixed: (issue as any).isFixed || false,
    });
  });

  // 3. Bugs
  activeProject.bugs?.forEach((issue, idx) => {
    allIssues.push({
      id: `bug-${idx}`,
      type: "bug",
      category: issue.category,
      file: issue.file,
      line: issue.line,
      severity: issue.severity,
      description: issue.description,
      solution: issue.solution,
      oldCode: issue.oldCode,
      newCode: issue.newCode,
      isFixed: (issue as any).isFixed || false,
    });
  });

  // 4. Code Smells
  activeProject.codeSmells?.forEach((issue, idx) => {
    allIssues.push({
      id: `smell-${idx}`,
      type: "smell",
      category: issue.category,
      file: issue.file,
      line: issue.line,
      severity: issue.severity,
      description: issue.description,
      solution: issue.solution,
      oldCode: issue.oldCode,
      newCode: issue.newCode,
      isFixed: (issue as any).isFixed || false,
    });
  });

  // Filter issues
  const filteredIssues = allIssues.filter((issue) => {
    const typeMatch = filterType === "All" || issue.type === filterType;
    const severityMatch = filterSeverity === "All" || issue.severity === filterSeverity;
    return typeMatch && severityMatch;
  });

  const handleFix = async (issue: UnifiedIssue) => {
    if (!issue.oldCode || !issue.newCode) return;
    try {
      setFixingId(issue.id);
      await onFixIssue(issue.file, issue.oldCode, issue.newCode);
    } catch (err) {
      console.error(err);
    } finally {
      setFixingId(null);
    }
  };

  const inspectInExplorer = (filePath: string) => {
    setSelectedFile(filePath);
    setActiveTab("files");
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-950/40 text-rose-400 border border-rose-500/30";
      case "High":
        return "bg-orange-950/40 text-orange-400 border border-orange-500/30";
      case "Medium":
        return "bg-amber-950/40 text-amber-450 border border-amber-500/30";
      default:
        return "bg-sky-950/40 text-sky-400 border border-sky-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "security":
        return <ShieldAlert className="h-4 w-4 text-rose-400" />;
      case "performance":
        return <TrendingUp className="h-4 w-4 text-orange-400" />;
      case "bug":
        return <Bug className="h-4 w-4 text-red-400" />;
      case "smell":
        return <Settings className="h-4 w-4 text-yellow-400" />;
      default:
        return <FileCode className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 text-left" id="diagnostics-tab-view">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white font-sans bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              Diagnostics & Autofix Hub
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              AST Scan
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-sans leading-relaxed max-w-2xl">
            SonarQube-grade source code diagnostics center. Select any issue to view details or click to automatically patch files on your local computer.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 px-3.5 py-2 rounded-xl text-xs font-bold font-sans self-start sm:self-center shadow-[0_0_15px_rgba(99,102,241,0.07)] hover:border-indigo-500/40 transition-all duration-300">
          <span className="relative flex h-2 w-2 mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
          <span>{allIssues.length} Diagnostics Active</span>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between shadow-inner">
        {/* Issue Type Filters */}
        <div className="flex flex-col gap-2 w-full lg:w-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Issue Categories</span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "All", label: "All Types", icon: Activity },
              { id: "security", label: "Security", icon: ShieldAlert },
              { id: "performance", label: "Performance", icon: TrendingUp },
              { id: "bug", label: "Bugs", icon: Bug },
              { id: "smell", label: "Code Smell", icon: Settings },
            ].map((type) => {
              const IconComp = type.icon;
              const isActive = filterType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer select-none border ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] border-indigo-500/50"
                      : "bg-slate-950/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/60 hover:text-slate-200 hover:border-slate-700/80"
                  }`}
                >
                  <IconComp className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Severity Filters */}
        <div className="flex flex-col gap-2 w-full lg:w-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Severity Tier</span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "All", label: "All Severities" },
              { id: "Critical", label: "Critical" },
              { id: "High", label: "High" },
              { id: "Medium", label: "Medium" },
              { id: "Low", label: "Low" }
            ].map((sev) => {
              const isActive = filterSeverity === sev.id;
              
              // Custom active styles for severity
              let activeStyle = "bg-slate-800 text-slate-100 border border-slate-700";
              if (isActive) {
                switch(sev.id) {
                  case "Critical":
                    activeStyle = "bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.15)]";
                    break;
                  case "High":
                    activeStyle = "bg-orange-500/20 text-orange-300 border border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.15)]";
                    break;
                  case "Medium":
                    activeStyle = "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]";
                    break;
                  case "Low":
                    activeStyle = "bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-[0_0_12px_rgba(14,165,233,0.15)]";
                    break;
                }
              }

              return (
                <button
                  key={sev.id}
                  onClick={() => setFilterSeverity(sev.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none border ${
                    isActive
                      ? activeStyle
                      : "bg-slate-950/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/60 hover:text-slate-200 hover:border-slate-700/80"
                  }`}
                >
                  {sev.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => {
          const isResolved = issue.isFixed;
          
          // Severity indicators
          let severityColor = "border-l-slate-700";
          let badgeStyle = "bg-slate-500/10 text-slate-400 border-slate-500/20";
          
          if (!isResolved) {
            switch (issue.severity) {
              case "Critical":
                severityColor = "border-l-rose-500";
                badgeStyle = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                break;
              case "High":
                severityColor = "border-l-orange-500";
                badgeStyle = "bg-orange-500/10 text-orange-400 border-orange-500/20";
                break;
              case "Medium":
                severityColor = "border-l-amber-500";
                badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                break;
              case "Low":
                severityColor = "border-l-sky-500";
                badgeStyle = "bg-sky-500/10 text-sky-400 border-sky-500/20";
                break;
            }
          } else {
            severityColor = "border-l-emerald-500";
            badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
          }

          return (
            <div
              key={issue.id}
              className={`bg-slate-900/40 p-5 md:p-6 rounded-xl border border-l-4 border-slate-800/80 ${severityColor} shadow-md flex flex-col lg:flex-row gap-5 items-start justify-between hover:border-slate-700/80 hover:bg-slate-900/60 transition-all duration-300`}
            >
              {/* Left Info Column */}
              <div className="flex-1 space-y-3.5 w-full min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="p-1.5 bg-slate-950/60 border border-slate-800 rounded-lg shrink-0">
                    {getTypeIcon(issue.type)}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                    {issue.type}
                  </span>
                  
                  {isResolved ? (
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1 font-mono">
                      <Check className="h-3 w-3 shrink-0" />
                      Resolved
                    </span>
                  ) : (
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeStyle} font-mono`}>
                      {issue.severity}
                    </span>
                  )}
                  
                  {/* File Location styled as an IDE tab */}
                  <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px] bg-slate-950/40 border border-slate-800/50 px-2 py-0.5 rounded-md truncate max-w-full">
                    <Terminal className="h-3 w-3 text-indigo-400 shrink-0" />
                    <span className="text-slate-350 truncate">{issue.file}</span>
                    {issue.line && (
                      <>
                        <span className="text-slate-600">:</span>
                        <span className="text-cyan-400 font-bold">{issue.line}</span>
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-100 font-sans tracking-tight">{issue.category}</h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans max-w-4xl">
                    {issue.description}
                  </p>
                </div>

                {/* Solution banner */}
                <div className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-lg text-xs text-slate-300 font-sans flex items-start gap-2">
                  <span className="font-semibold text-indigo-400 mt-0.5 uppercase tracking-wider text-[10px] bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded shrink-0">
                    Fix
                  </span>
                  <div className="flex-1">
                    <strong className="text-slate-200">Solution:</strong> {issue.solution}
                  </div>
                </div>

                {/* Code Diff Display if available */}
                {issue.oldCode && issue.newCode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5">
                    {/* Original Pane */}
                    <div className="flex flex-col rounded-lg overflow-hidden border border-rose-900/30">
                      <div className="bg-rose-950/40 border-b border-rose-900/30 px-3 py-1.5 flex items-center justify-between text-[10px] text-rose-350 font-bold font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          ORIGINAL CODE
                        </span>
                        <span className="text-rose-500/80 font-semibold font-sans">- REMOVE</span>
                      </div>
                      <pre className="bg-rose-950/15 text-rose-300/90 text-[11px] p-3.5 font-mono overflow-x-auto whitespace-pre max-w-full leading-normal min-h-[80px]">
                        {issue.oldCode}
                      </pre>
                    </div>

                    {/* Proposed Pane */}
                    <div className="flex flex-col rounded-lg overflow-hidden border border-emerald-900/30">
                      <div className="bg-emerald-950/40 border-b border-emerald-900/30 px-3 py-1.5 flex items-center justify-between text-[10px] text-emerald-350 font-bold font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          PROPOSED SECURE FIX
                        </span>
                        <span className="text-emerald-500/80 font-semibold font-sans">+ ADD</span>
                      </div>
                      <pre className="bg-emerald-950/15 text-emerald-300/90 text-[11px] p-3.5 font-mono overflow-x-auto whitespace-pre max-w-full leading-normal min-h-[80px]">
                        {issue.newCode}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Action Column */}
              <div className="flex flex-row lg:flex-col gap-2.5 shrink-0 w-full lg:w-48 pt-3 lg:pt-0 border-t border-slate-800 lg:border-t-0 font-sans">
                {isResolved ? (
                  <div className="w-full text-center text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Fixed & Secured</span>
                  </div>
                ) : issue.oldCode && issue.newCode ? (
                  <button
                    disabled={fixingId !== null}
                    onClick={() => handleFix(issue)}
                    className={`w-full text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer border select-none ${
                      fixingId === issue.id
                        ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-violet-500/30 shadow-[0_4px_12px_rgba(99,102,241,0.15)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)] active:scale-[0.98]"
                    }`}
                  >
                    {fixingId === issue.id ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin text-slate-400" />
                        <span>Fixing File...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-violet-200" />
                        <span>Autofix Code</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full text-center text-[10px] text-slate-400 bg-slate-950/60 p-3 rounded-lg border border-dashed border-slate-800/80 flex flex-col items-center justify-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500/70" />
                    <span className="font-semibold text-slate-400">Manual Refactoring</span>
                  </div>
                )}

                <button
                  onClick={() => inspectInExplorer(issue.file)}
                  className="w-full bg-slate-950/40 hover:bg-slate-800/60 text-slate-300 hover:text-slate-100 text-xs font-semibold py-2 px-3 rounded-lg border border-slate-800 hover:border-slate-700/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
                >
                  <Eye className="h-3.5 w-3.5 shrink-0" />
                  <span>Inspect Code</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredIssues.length === 0 && (
          <div className="bg-slate-900/40 p-10 rounded-xl border border-emerald-500/20 text-center max-w-lg mx-auto space-y-4 shadow-xl shadow-black/10">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/5 animate-pulse"></span>
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-slate-200">Workspace is fully optimized!</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                No active warnings, vulnerabilities, or code smells detected inside the current analysis scope.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

