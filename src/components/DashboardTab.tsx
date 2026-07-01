import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Code,
  Zap,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Play,
  FileDown,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
} from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface DashboardTabProps {
  activeProject: CodeScopeAnalysis;
  projectSource: 'sample' | 'uploaded';
  setActiveTab: (tab: string) => void;
}

/* ─── Animated counter hook ─── */
function useAnimatedCounter(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}

/* ─── Health Ring SVG component ─── */
const HealthRing: React.FC<{ score: number; size?: number }> = ({
  score,
  size = 120,
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference * (1 - score / 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const gradientId = `health-gradient-${score}`;
  let color1: string, color2: string;
  if (score >= 70) {
    color1 = "#34d399";
    color2 = "#10b981";
  } else if (score >= 40) {
    color1 = "#fbbf24";
    color2 = "#f59e0b";
  } else {
    color1 = "#f87171";
    color2 = "#ef4444";
  }

  const glowColor =
    score >= 70
      ? "rgba(52,211,153,0.35)"
      : score >= 40
      ? "rgba(251,191,36,0.35)"
      : "rgba(248,113,113,0.35)";

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        className="stroke-slate-800/60"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {/* Active ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)",
          filter: `drop-shadow(0 0 8px ${glowColor})`,
        }}
      />
    </svg>
  );
};

/* ─── Fake scan timeline events (derived from project data) ─── */
function generateTimelineEvents(project: CodeScopeAnalysis) {
  const secCount = project.security?.length || 0;
  const bugCount = project.bugs?.length || 0;
  const events = [
    {
      label: "Full AST Scan Complete",
      detail: `Parsed ${project.endpoints.length} endpoints, ${project.projectDNA.languages.length} languages detected`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      dotColor: "bg-emerald-400",
      time: "2 min ago",
    },
    {
      label: "Security Vulnerability Scan",
      detail: `${secCount} vulnerability signature${secCount !== 1 ? "s" : ""} identified in static analysis`,
      icon: ShieldAlert,
      color: "text-rose-400",
      dotColor: "bg-rose-400",
      time: "3 min ago",
    },
    {
      label: "Architecture Inference",
      detail: `${project.architecture.style} pattern detected at ${project.architecture.confidence}% confidence`,
      icon: Layers,
      color: "text-pink-400",
      dotColor: "bg-pink-400",
      time: "4 min ago",
    },
    {
      label: "Bug Pattern Detection",
      detail: `${bugCount} potential bug${bugCount !== 1 ? "s" : ""} flagged across codebase`,
      icon: AlertTriangle,
      color: "text-amber-400",
      dotColor: "bg-amber-400",
      time: "5 min ago",
    },
    {
      label: "Dependency Graph Mapping",
      detail: `Coupling score: ${project.importAnalysis.packageCouplingScore}/100`,
      icon: Search,
      color: "text-indigo-400",
      dotColor: "bg-indigo-400",
      time: "6 min ago",
    },
  ];
  return events.slice(0, 5);
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  activeProject,
  projectSource,
  setActiveTab,
}) => {
  // Determine color for health indicator
  const getHealthColor = (score: number) => {
    if (score > 85) return {
      stroke: "stroke-emerald-400",
      text: "text-emerald-400",
      glow: "rgba(52,211,153,0.4)",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10"
    };
    if (score > 65) return {
      stroke: "stroke-amber-400",
      text: "text-amber-400",
      glow: "rgba(251,191,36,0.4)",
      border: "border-amber-500/20",
      bg: "bg-amber-500/10"
    };
    return {
      stroke: "stroke-rose-500",
      text: "text-rose-500",
      glow: "rgba(244,63,94,0.4)",
      border: "border-rose-500/20",
      bg: "bg-rose-500/10"
    };
  };

  const healthStyle = getHealthColor(activeProject.healthScore);
  const totalIssues = (activeProject.security?.length || 0) + (activeProject.bugs?.length || 0);

  // Animated counters
  const animatedHealth = useAnimatedCounter(activeProject.healthScore, 1400);
  const animatedEndpoints = useAnimatedCounter(activeProject.endpoints.length, 1000);
  const animatedIssues = useAnimatedCounter(totalIssues, 1000);

  // Timeline events
  const timelineEvents = generateTimelineEvents(activeProject);

  return (
    <div className="space-y-6" id="dashboard-tab-view">
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

      {/* ─── Quick Actions Bar ─── */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 backdrop-blur-md p-3 rounded-2xl border border-slate-800/80 shadow-xl">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-2 hidden sm:block">Quick Actions</span>
        <div className="hidden sm:block w-[1px] h-6 bg-slate-800/80" />
        <button
          onClick={() => setActiveTab("architecture")}
          className="group flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 hover:border-indigo-400/40 text-[11px] font-bold px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
        >
          <Play className="h-3.5 w-3.5 group-hover:animate-pulse" />
          Run Full Scan
        </button>
        <button
          onClick={() => setActiveTab("endpoints")}
          className="group flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 hover:border-emerald-400/40 text-[11px] font-bold px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
        >
          <FileDown className="h-3.5 w-3.5 group-hover:animate-pulse" />
          Export Report
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className="group flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 hover:border-rose-400/40 text-[11px] font-bold px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-500/10 cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 group-hover:animate-pulse" />
          View Security Issues
        </button>
      </div>

      {/* ─── Introduction Banner ─── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 p-6 md:p-8 rounded-3xl text-white border border-indigo-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl shadow-slate-950/50 hover:scale-[1.003] transition-transform duration-500">
        {/* Glow Effects */}
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        {/* Blueprint background grid effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="banner-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#banner-grid)" />
          </svg>
        </div>

        <div className="max-w-xl relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              AST Scanning Suite
            </span>
            <span className="text-slate-650 text-xs">•</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Dynamic Analysis Offline Fallback Active
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">
            Project Blueprint: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-cyan-200 to-emerald-300">{activeProject.projectName}</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-normal">
            CodeScope has parsed this codebase, mapped dependencies, and reverse-engineered architecture schemas. Switch samples above or upload any project ZIP file to scan.
          </p>
        </div>

        {/* Info & score box with animated counters */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 self-start lg:self-auto shadow-xl">
          <div className="flex items-center gap-3 pr-2">
            <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Secondary track for glow effect */}
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  className="stroke-slate-800/80"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  className={`transition-all duration-1000 ${healthStyle.stroke}`}
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 26}
                  strokeDashoffset={2 * Math.PI * 26 * (1 - activeProject.healthScore / 100)}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 6px ${healthStyle.glow})` }}
                />
              </svg>
              <span className="absolute text-sm font-extrabold font-mono text-white">{animatedHealth}%</span>
            </div>
            <div className="text-left font-sans">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Health Score</div>
              <div className="text-[9px] text-slate-500 font-medium">AST Quality Index</div>
            </div>
          </div>

          <div className="hidden sm:block w-[1px] bg-slate-800/80 my-2"></div>

          <div className="flex justify-around gap-6 sm:px-2 py-2 sm:py-0">
            <div className="text-center flex flex-col justify-center min-w-[50px] group cursor-default">
              <div className="text-base font-extrabold font-mono text-indigo-400 group-hover:scale-110 transition-transform duration-200">
                {animatedEndpoints}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">APIs</div>
            </div>
            
            <div className="w-[1px] bg-slate-800/80 sm:hidden"></div>

            <div className="text-center flex flex-col justify-center min-w-[50px] group cursor-pointer" onClick={() => setActiveTab("security")}>
              <div className="text-base font-extrabold font-mono text-rose-400 group-hover:scale-110 transition-transform duration-200">
                {animatedIssues}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Bugs</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Large Health Score Ring + Recent Scan Timeline ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Score Gauge */}
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl hover:border-slate-700/40 hover:scale-[1.01] transition-all duration-300 group relative overflow-hidden">
          {/* Glow background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${
                activeProject.healthScore >= 70
                  ? "rgba(52,211,153,0.15)"
                  : activeProject.healthScore >= 40
                  ? "rgba(251,191,36,0.15)"
                  : "rgba(248,113,113,0.15)"
              }, transparent 70%)`,
            }}
          />
          <div className="flex items-center justify-between mb-5 relative z-10">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Health Gauge</h3>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:animate-pulse transition-transform duration-300">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center relative z-10">
            <div className="relative">
              <HealthRing score={activeProject.healthScore} size={140} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-3xl font-black font-mono ${
                    activeProject.healthScore >= 70
                      ? "text-emerald-400"
                      : activeProject.healthScore >= 40
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {animatedHealth}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">/ 100</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  activeProject.healthScore >= 70
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : activeProject.healthScore >= 40
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    activeProject.healthScore >= 70
                      ? "bg-emerald-400"
                      : activeProject.healthScore >= 40
                      ? "bg-amber-400"
                      : "bg-rose-400"
                  }`}
                />
                {activeProject.healthScore >= 70
                  ? "Healthy"
                  : activeProject.healthScore >= 40
                  ? "Needs Attention"
                  : "Critical"}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Scan Timeline */}
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl hover:border-slate-700/40 hover:scale-[1.01] transition-all duration-300 group relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Recent Scan Timeline</h3>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:animate-pulse transition-transform duration-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-indigo-500/40 via-slate-700/40 to-transparent" />

            <div className="space-y-4">
              {timelineEvents.map((event, idx) => {
                const IconComp = event.icon;
                return (
                  <div
                    key={idx}
                    className="relative pl-7 group/item"
                    style={{
                      animation: `fadeSlideIn 0.4s ease-out ${idx * 0.1}s both`,
                    }}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-slate-900 ${event.dotColor} shadow-lg`}
                      style={{
                        boxShadow: `0 0 8px ${
                          event.dotColor.includes("emerald")
                            ? "rgba(52,211,153,0.4)"
                            : event.dotColor.includes("rose")
                            ? "rgba(244,63,94,0.4)"
                            : event.dotColor.includes("pink")
                            ? "rgba(236,72,153,0.4)"
                            : event.dotColor.includes("amber")
                            ? "rgba(251,191,36,0.4)"
                            : "rgba(99,102,241,0.4)"
                        }`,
                      }}
                    />
                    <div className="bg-slate-950/50 backdrop-blur-sm border border-slate-800/60 rounded-xl p-3 hover:border-slate-700/60 transition-all duration-200">
                      <div className="flex items-center gap-2 mb-1">
                        <IconComp className={`h-3.5 w-3.5 ${event.color}`} />
                        <span className="text-[11px] font-bold text-slate-200">{event.label}</span>
                        <span className="ml-auto text-[9px] text-slate-500 font-mono">{event.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{event.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inline keyframes for timeline animation */}
          <style>{`
            @keyframes fadeSlideIn {
              from {
                opacity: 0;
                transform: translateY(8px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      </div>

      {/* ─── Grid 1: Health score breakdown & Project DNA ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Health Score breakdown */}
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl shadow-slate-950/30 flex flex-col justify-between hover:border-slate-700/40 hover:scale-[1.01] transition-all duration-300 group relative overflow-hidden">
          {/* Subtle glow border effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(52,211,153,0.03)' }} />
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">System Quality</h3>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:animate-pulse transition-transform duration-300">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            
            <div className="space-y-4">
              {activeProject.healthReasons.map((hr, idx) => {
                const isHigh = hr.score >= 80;
                const isMedium = hr.score >= 60;
                
                const scoreColorClass = isHigh 
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                  : isMedium 
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/20" 
                    : "text-rose-400 bg-rose-500/10 border-rose-500/20";

                const leftBorderColor = isHigh
                  ? "border-l-emerald-500/30"
                  : isMedium
                    ? "border-l-amber-500/30"
                    : "border-l-rose-500/30";

                const hoverBorderColor = isHigh
                  ? "hover:border-l-emerald-400"
                  : isMedium
                    ? "hover:border-l-amber-400"
                    : "hover:border-l-rose-400";

                return (
                  <div 
                    key={idx} 
                    className={`pl-3 border-l-2 ${leftBorderColor} ${hoverBorderColor} transition-colors duration-200 pb-3 last:pb-0`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-200 leading-tight">{hr.category}</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${scoreColorClass}`}>
                        {hr.score}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{hr.description}</p>
                    <div className="bg-indigo-950/20 border border-indigo-500/10 p-2 rounded-xl text-[10px] text-indigo-300 font-mono flex items-start gap-2 shadow-inner">
                      <Zap className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-400" />
                      <span><strong className="text-indigo-200">Action:</strong> {hr.recommendation}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Project DNA (Tech detected) */}
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl shadow-slate-950/30 hover:border-slate-700/40 hover:scale-[1.01] transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(99,102,241,0.03)' }} />
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Detected Tech DNA</h3>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:animate-pulse transition-transform duration-300">
              <Code className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-5">
            {/* Languages breakdown */}
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2.5">Source Languages</span>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-950 my-2 p-0.5 border border-slate-800">
                {activeProject.projectDNA.languages.map((l, idx) => {
                  const colors = [
                    "bg-gradient-to-r from-indigo-500 to-indigo-600",
                    "bg-gradient-to-r from-pink-500 to-rose-500",
                    "bg-gradient-to-r from-emerald-400 to-teal-400"
                  ];
                  return (
                    <div
                      key={idx}
                      style={{ width: `${l.percentage}%` }}
                      className={`${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                      title={`${l.name}: ${l.percentage}%`}
                    ></div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5">
                {activeProject.projectDNA.languages.map((l, idx) => {
                  const dotColors = ["bg-indigo-400", "bg-pink-400", "bg-emerald-400"];
                  return (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[idx % dotColors.length]}`}></span>
                      <span>{l.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">({l.percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Frameworks, Database, Infra */}
            <div className="border-t border-slate-800/80 pt-4 space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Application Frameworks</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.projectDNA.frameworks.map((f, i) => (
                    <span key={i} className="bg-indigo-500/10 text-indigo-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-400/40 transition-colors duration-150">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Database Engine</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.projectDNA.databases.map((db, i) => (
                    <span key={i} className="bg-amber-500/10 text-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-400/40 transition-colors duration-150">
                      {db}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Infrastructure & Containers</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.projectDNA.infrastructure.map((inf, i) => (
                    <span key={i} className="bg-slate-800/50 text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-slate-700/30 hover:bg-slate-700/50 hover:border-slate-600/40 transition-colors duration-150">
                      {inf}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Security Auth System</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.projectDNA.authentication.map((a, i) => (
                    <span key={i} className="bg-emerald-500/10 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-400/40 transition-colors duration-150">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Detection summary */}
        <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl shadow-slate-950/30 flex flex-col justify-between hover:border-slate-700/40 hover:scale-[1.01] transition-all duration-300 group relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(236,72,153,0.03)' }} />
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Architecture Modeling</h3>
              <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 group-hover:animate-pulse transition-transform duration-300">
                <Layers className="h-4 w-4" />
              </div>
            </div>

            {/* Futuristic blueprint card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-pink-950/20 to-slate-950/90 p-4 rounded-xl border border-pink-500/20 mb-4 shadow-inner">
              {/* Grid background pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="arch-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                      <path d="M 16 0 L 0 0 0 16" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#arch-grid)" />
                </svg>
              </div>

              <div className="relative z-10 flex items-center justify-between gap-3 mb-1.5">
                <div className="text-pink-400 font-extrabold text-sm tracking-widest uppercase">
                  {activeProject.architecture.style}
                </div>
                <div className="bg-pink-500/10 text-pink-300 border border-pink-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-tight">
                  {activeProject.architecture.confidence}% Confidence
                </div>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Inferred Topography</div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              {activeProject.architecture.explanation}
            </p>

            <div className="border-t border-slate-800/80 pt-3 text-[11px] text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Circular import loops</span>
                <span className={`font-mono font-bold text-xs ${activeProject.importAnalysis.circularDependencies.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {activeProject.importAnalysis.circularDependencies.length > 0 ? "Detected" : "None"}
                </span>
              </div>
              
              <div className="flex justify-between items-center gap-4">
                <span>Package Coupling Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/50">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-indigo-500 h-full"
                      style={{ width: `${activeProject.importAnalysis.packageCouplingScore}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-200 font-semibold font-mono text-[10px]">
                    {activeProject.importAnalysis.packageCouplingScore}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("architecture")}
            className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/20 hover:shadow-indigo-500/10 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border border-indigo-500/15"
          >
            Explore Blueprint Diagram <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* ─── Dynamic Quick Actions Section ─── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 border border-rose-500/15 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 hover:scale-[1.005] transition-transform duration-300">
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl border border-rose-500/25 relative flex items-center justify-center shrink-0">
            <span className="absolute inset-0 rounded-xl bg-rose-500/5 animate-ping opacity-75"></span>
            <ShieldAlert className="h-5 w-5 relative z-10" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Security Scan Findings</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Found <strong className="text-rose-400 font-bold">{activeProject.security?.length || 0}</strong> vulnerability signatures in static codebase context.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab("security")}
          className="relative z-10 w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-rose-950/20 hover:shadow-rose-500/10 hover:-translate-y-0.5 cursor-pointer text-center"
        >
          Inspect Vulnerabilities
        </button>
      </div>

    </div>
  );
};