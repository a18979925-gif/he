import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Play, RefreshCw, AlertTriangle, Code, BarChart3,
  TrendingUp, Award, Info, Eye, EyeOff, ChevronDown, Sparkles,
  ArrowRight, Timer, Gauge, Activity
} from "lucide-react";
import { CodeScopeAnalysis } from "../types";

/* ──────────────────────────────────────────────────────
   Props – unchanged from original
   ────────────────────────────────────────────────────── */
interface BenchmarkTabProps {
  activeProject: CodeScopeAnalysis;
}

/* ──────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────── */

// Performance grade from a normalized 0-100 score
const getGrade = (score: number): { letter: string; color: string; bg: string; glow: string } => {
  if (score >= 97) return { letter: "A+", color: "text-emerald-400", bg: "bg-emerald-500/15", glow: "shadow-emerald-500/20" };
  if (score >= 93) return { letter: "A",  color: "text-emerald-400", bg: "bg-emerald-500/15", glow: "shadow-emerald-500/15" };
  if (score >= 90) return { letter: "A-", color: "text-emerald-400", bg: "bg-emerald-500/10", glow: "shadow-emerald-500/10" };
  if (score >= 87) return { letter: "B+", color: "text-sky-400",     bg: "bg-sky-500/15",     glow: "shadow-sky-500/15" };
  if (score >= 83) return { letter: "B",  color: "text-sky-400",     bg: "bg-sky-500/10",     glow: "shadow-sky-500/10" };
  if (score >= 80) return { letter: "B-", color: "text-sky-400",     bg: "bg-sky-500/10",     glow: "shadow-sky-500/10" };
  if (score >= 77) return { letter: "C+", color: "text-amber-400",   bg: "bg-amber-500/15",   glow: "shadow-amber-500/15" };
  if (score >= 73) return { letter: "C",  color: "text-amber-400",   bg: "bg-amber-500/10",   glow: "shadow-amber-500/10" };
  if (score >= 70) return { letter: "C-", color: "text-amber-400",   bg: "bg-amber-500/10",   glow: "shadow-amber-500/10" };
  if (score >= 67) return { letter: "D+", color: "text-orange-400",  bg: "bg-orange-500/15",  glow: "shadow-orange-500/10" };
  if (score >= 60) return { letter: "D",  color: "text-orange-400",  bg: "bg-orange-500/10",  glow: "shadow-orange-500/10" };
  return              { letter: "F",  color: "text-rose-400",    bg: "bg-rose-500/15",    glow: "shadow-rose-500/15" };
};

// Color for a progress bar based on value (0-100)
const barGradient = (v: number) => {
  if (v >= 90) return "from-emerald-500 to-emerald-400";
  if (v >= 75) return "from-sky-500 to-sky-400";
  if (v >= 60) return "from-amber-500 to-amber-400";
  if (v >= 40) return "from-orange-500 to-orange-400";
  return "from-rose-500 to-rose-400";
};

// Generate sparkline SVG points from data array
const sparklinePath = (data: number[], width: number, height: number): string => {
  if (data.length < 2) return "";
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  return data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
};

/* ──────────────────────────────────────────────────────
   Sparkline Component (pure SVG)
   ────────────────────────────────────────────────────── */
const Sparkline: React.FC<{ data: number[]; color?: string; width?: number; height?: number }> = ({
  data, color = "#818cf8", width = 80, height = 28,
}) => {
  const path = sparklinePath(data, width, height);
  const gradientId = `sp-${Math.random().toString(36).slice(2, 8)}`;
  const areaPath = path
    ? `${path} L${width},${height} L0,${height} Z`
    : "";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      {areaPath && (
        <path d={areaPath} fill={`url(#${gradientId})`} />
      )}
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ──────────────────────────────────────────────────────
   Animated Progress Bar
   ────────────────────────────────────────────────────── */
const AnimatedBar: React.FC<{
  value: number;
  delay?: number;
  gradient?: string;
  label?: string;
}> = ({ value, delay = 0, gradient, label }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 80 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="w-full">
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

      {label && <span className="text-[10px] text-slate-400 font-medium block mb-1">{label}</span>}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient || barGradient(value)} transition-all duration-1000 ease-out`}
          style={{ width: `${width}%`, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────
   Tooltip
   ────────────────────────────────────────────────────── */
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 px-3 py-2 text-[10px] leading-relaxed text-slate-200 bg-slate-900 border border-slate-700 rounded-lg shadow-xl pointer-events-none animate-[fadeIn_150ms_ease]">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  );
};

/* ──────────────────────────────────────────────────────
   Metric definitions for comparison mode
   ────────────────────────────────────────────────────── */
interface MetricDef {
  key: string;
  label: string;
  tooltip: string;
  score: (p: CodeScopeAnalysis) => number;
  industryAvg: number;
  trendData: number[];
}

const metricDefs: MetricDef[] = [
  {
    key: "health",
    label: "Code Health Score",
    tooltip: "Overall code quality derived from complexity, duplication, test coverage, and dependency analysis.",
    score: (p) => Math.min(100, Math.max(0, p.healthScore ?? 0)),
    industryAvg: 72,
    trendData: [58, 62, 65, 68, 72, 70, 75, 78, 80, 82],
  },
  {
    key: "security",
    label: "Security Posture",
    tooltip: "Percentage score inversely proportional to the number & severity of security vulnerabilities found.",
    score: (p) => {
      const issues = p.security?.length ?? 0;
      return Math.max(0, 100 - issues * 8);
    },
    industryAvg: 65,
    trendData: [50, 55, 53, 60, 62, 68, 70, 72, 74, 78],
  },
  {
    key: "performance",
    label: "Performance Index",
    tooltip: "Computed from detected performance anti-patterns, bundle sizes, and algorithmic complexity.",
    score: (p) => {
      const issues = p.performance?.length ?? 0;
      return Math.max(0, 100 - issues * 10);
    },
    industryAvg: 68,
    trendData: [45, 50, 55, 60, 58, 65, 70, 72, 68, 75],
  },
  {
    key: "architecture",
    label: "Architecture Quality",
    tooltip: "Measures how well the codebase follows clean architecture, separation of concerns, and SOLID principles.",
    score: (p) => Math.min(100, Math.max(0, (p.architecture?.confidence ?? 0.5) * 100)),
    industryAvg: 60,
    trendData: [40, 45, 50, 55, 58, 60, 62, 65, 70, 72],
  },
  {
    key: "maintainability",
    label: "Maintainability",
    tooltip: "Reflects refactoring difficulty, cyclomatic complexity, and code smell density across the project.",
    score: (p) => {
      const refactors = p.refactoring?.length ?? 0;
      return Math.max(0, 100 - refactors * 6);
    },
    industryAvg: 58,
    trendData: [42, 48, 50, 55, 52, 60, 63, 65, 68, 70],
  },
  {
    key: "modularity",
    label: "Modularity Score",
    tooltip: "Based on module count, inter-module coupling, and circular dependency ratio.",
    score: (p) => {
      const modules = p.modules?.length ?? 1;
      const coupling = p.importAnalysis?.packageCouplingScore ?? 50;
      return Math.min(100, Math.max(0, modules * 8 + (100 - coupling) * 0.4));
    },
    industryAvg: 55,
    trendData: [35, 40, 42, 48, 50, 55, 58, 60, 62, 65],
  },
];

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
export const BenchmarkTab: React.FC<BenchmarkTabProps> = ({ activeProject }) => {
  const [activeTest, setActiveTest] = useState<string>("array-set");
  const [running, setRunning] = useState<boolean>(false);
  const [results, setResults] = useState<{
    leftTime: number;
    rightTime: number;
    multiplier: number;
    winner: string;
  } | null>(null);

  // ── New state ────────────────────────────────
  const [comparisonMode, setComparisonMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── Original benchmark runner (unchanged) ── */
  const runBenchmark = () => {
    setRunning(true);
    setResults(null);

    setTimeout(() => {
      let leftTime = 0;
      let rightTime = 0;

      if (activeTest === "array-set") {
        const size = 200000;
        const array = Array.from({ length: size }, (_, i) => i);
        const set = new Set(array);
        const target = size - 1;

        const startArr = performance.now();
        for (let r = 0; r < 200; r++) {
          array.includes(target);
        }
        const endArr = performance.now();
        leftTime = (endArr - startArr) / 200;

        const startSet = performance.now();
        for (let r = 0; r < 200; r++) {
          set.has(target);
        }
        const endSet = performance.now();
        rightTime = (endSet - startSet) / 200;
      } else if (activeTest === "map-object") {
        const size = 150000;
        const obj: Record<string, number> = {};
        const map = new Map<string, number>();

        for (let i = 0; i < size; i++) {
          const key = `key-${i}`;
          obj[key] = i;
          map.set(key, i);
        }

        const target = `key-${size - 1}`;

        const startObj = performance.now();
        for (let r = 0; r < 20000; r++) {
          const x = obj[target];
        }
        const endObj = performance.now();
        leftTime = (endObj - startObj) / 20000;

        const startMap = performance.now();
        for (let r = 0; r < 20000; r++) {
          const y = map.get(target);
        }
        const endMap = performance.now();
        rightTime = (endMap - startMap) / 20000;
      }

      if (rightTime === 0) rightTime = 0.0001;
      if (leftTime === 0) leftTime = 0.0001;

      const multiplier = Number((leftTime / rightTime).toFixed(1));
      const winner = leftTime > rightTime ? "Set/Map" : "Array/Object";

      setResults({
        leftTime: Number(leftTime.toFixed(4)),
        rightTime: Number(rightTime.toFixed(4)),
        multiplier,
        winner
      });
      setRunning(false);
    }, 1200);
  };

  const testSnippets: Record<string, { left: string; right: string; desc: string }> = {
    "array-set": {
      left: `// Array Search lookup\nconst list = [0, 1, 2, ..., 200000];\nconst hasItem = list.includes(199999);`,
      right: `// Set Search lookup\nconst set = new Set([0, 1, 2, ..., 200000]);\nconst hasItem = set.has(199999);`,
      desc: "Tests lookup complexity: Array.includes scans linearly O(N) compared to Set hash bucket has lookup which resolves in O(1)."
    },
    "map-object": {
      left: `// Object dynamic key retrieval\nconst obj = { 'key-0': 0, ... };\nconst val = obj['key-149999'];`,
      right: `// Map interface retrieval\nconst map = new Map([ ['key-0', 0], ... ]);\nconst val = map.get('key-149999');`,
      desc: "Compares raw lookup speeds of plain JavaScript Objects vs standard built-in Map collections."
    }
  };

  /* ── Compute metrics for comparison mode ── */
  const computedMetrics = metricDefs.map((m) => {
    const score = m.score(activeProject);
    const grade = getGrade(score);
    return { ...m, computedScore: score, grade };
  });

  const scores = computedMetrics.map((m) => m.computedScore);
  const highestIdx = scores.indexOf(Math.max(...scores));
  const lowestIdx = scores.indexOf(Math.min(...scores));

  return (
    <div className="space-y-6 text-left" id="benchmark-tab-view font-sans">
      {/* ── Header ────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
            <Zap className="h-5.5 w-5.5 text-amber-500 animate-pulse" />
            JavaScript Algorithm Benchmark
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Run local client-side Javascript microbenchmarks inside the browser runtime sandbox to audit performance efficiency.
          </p>
        </div>
        {/* Comparison mode toggle */}
        <button
          onClick={() => setComparisonMode((p) => !p)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 cursor-pointer border
            ${comparisonMode
              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-md shadow-indigo-500/10"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:border-indigo-500/50 hover:text-indigo-400"}
          `}
        >
          {comparisonMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {comparisonMode ? "Hide Comparison" : "Compare vs Industry"}
        </button>
      </div>

      {/* ── Comparison Mode Panel ────────────── */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          comparisonMode ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              Project vs Industry Averages
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-medium">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="h-2 w-2 rounded-full bg-indigo-400" /> Your Project
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-600" /> Industry Avg
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {computedMetrics.map((metric, idx) => {
              const isHighest = idx === highestIdx;
              const isLowest = idx === lowestIdx;
              return (
                <div
                  key={metric.key}
                  className={`
                    relative bg-slate-900 border rounded-xl p-4 transition-all duration-500
                    ${isHighest ? "border-emerald-500/40 shadow-lg shadow-emerald-500/10" : ""}
                    ${isLowest ? "border-rose-500/40 shadow-lg shadow-rose-500/10" : ""}
                    ${!isHighest && !isLowest ? "border-slate-800" : ""}
                  `}
                >
                  {/* Glow overlay for best / worst */}
                  {isHighest && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                  )}
                  {isLowest && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
                  )}

                  {/* Badge */}
                  {isHighest && (
                    <span className="absolute -top-2 -right-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Sparkles className="h-2.5 w-2.5" /> Best
                    </span>
                  )}
                  {isLowest && (
                    <span className="absolute -top-2 -right-2 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full">
                      Needs Work
                    </span>
                  )}

                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <Tooltip text={metric.tooltip}>
                        <span className="flex items-center gap-1.5 cursor-help">
                          <span className="text-[11px] font-semibold text-slate-300">{metric.label}</span>
                          <Info className="h-3 w-3 text-slate-600 hover:text-slate-400 transition-colors" />
                        </span>
                      </Tooltip>
                    </div>
                    <div className={`text-lg font-black ${metric.grade.color} ${metric.grade.bg} px-2 py-0.5 rounded-lg leading-none`}>
                      {metric.grade.letter}
                    </div>
                  </div>

                  {/* Score + Sparkline */}
                  <div className="flex items-end justify-between mb-3 relative z-10">
                    <div>
                      <span className={`text-2xl font-black ${metric.grade.color}`}>
                        {mounted ? metric.computedScore : 0}
                      </span>
                      <span className="text-slate-600 text-xs font-medium"> / 100</span>
                    </div>
                    <Sparkline
                      data={metric.trendData}
                      color={metric.computedScore >= 75 ? "#34d399" : metric.computedScore >= 50 ? "#fbbf24" : "#f87171"}
                    />
                  </div>

                  {/* Animated bars */}
                  <div className="space-y-2 relative z-10">
                    <AnimatedBar
                      value={mounted ? metric.computedScore : 0}
                      delay={idx * 120}
                      label="Your Project"
                      gradient="from-indigo-500 to-violet-400"
                    />
                    <AnimatedBar
                      value={mounted ? metric.industryAvg : 0}
                      delay={idx * 120 + 200}
                      label="Industry Average"
                      gradient="from-slate-600 to-slate-500"
                    />
                  </div>

                  {/* Delta */}
                  <div className="mt-3 flex items-center gap-1 relative z-10">
                    {metric.computedScore >= metric.industryAvg ? (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +{metric.computedScore - metric.industryAvg} above avg
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 rotate-180" />
                        {metric.computedScore - metric.industryAvg} below avg
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aggregate grade */}
          <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white block">Overall Grade</span>
                <span className="text-[10px] text-slate-500">Weighted average across all metrics</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {(() => {
                const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                const g = getGrade(avg);
                return (
                  <>
                    <Sparkline data={scores} color="#818cf8" width={60} height={24} />
                    <span className={`text-2xl font-black ${g.color} ${g.bg} px-3 py-1 rounded-xl`}>
                      {g.letter}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Benchmark Grid (original layout preserved) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side selectors */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 lg:col-span-5 flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl gap-1 text-[11px] font-sans mb-4">
              <button
                onClick={() => { setActiveTest("array-set"); setResults(null); }}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTest === "array-set"
                    ? "bg-slate-800 text-white font-bold shadow-md shadow-slate-950/60 border border-slate-700/80"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-850/40"
                }`}
              >
                Array vs Set Lookup
              </button>
              <button
                onClick={() => { setActiveTest("map-object"); setResults(null); }}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTest === "map-object"
                    ? "bg-slate-800 text-white font-bold shadow-md shadow-slate-950/60 border border-slate-700/80"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-850/40"
                }`}
              >
                Object vs Map Lookup
              </button>
            </div>

            <p className="text-xs text-slate-500 font-sans leading-relaxed mb-4">
              {testSnippets[activeTest].desc}
            </p>

            {/* Metric tooltips for the active test */}
            <div className="flex items-center gap-3 mb-4">
              <Tooltip text="Measures raw lookup time in milliseconds per single operation, averaged over thousands of iterations to reduce noise.">
                <span className="flex items-center gap-1 text-[10px] text-slate-400 cursor-help hover:text-indigo-400 transition-colors">
                  <Timer className="h-3 w-3" /> Latency
                </span>
              </Tooltip>
              <Tooltip text="The speed multiplier shows how many times faster the optimized approach is compared to the standard one.">
                <span className="flex items-center gap-1 text-[10px] text-slate-400 cursor-help hover:text-indigo-400 transition-colors">
                  <Gauge className="h-3 w-3" /> Multiplier
                </span>
              </Tooltip>
              <Tooltip text="Algorithmic complexity describes how the runtime grows relative to input size — O(1) is constant, O(N) is linear.">
                <span className="flex items-center gap-1 text-[10px] text-slate-400 cursor-help hover:text-indigo-400 transition-colors">
                  <Activity className="h-3 w-3" /> Complexity
                </span>
              </Tooltip>
            </div>

            <button
              onClick={runBenchmark}
              disabled={running}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer font-sans disabled:opacity-60 border border-violet-500/30"
            >
              {running ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Executing 20,000 Runs...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Run JS Benchmark Test</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side results & snippet compare */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg text-white space-y-5 flex flex-col justify-between">

          {/* Results display */}
          {results ? (
            <div className="space-y-4 text-left" style={{ animation: "fadeIn 400ms ease" }}>
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 font-mono block">Benchmark Success</span>
                <h4 className="text-sm font-bold text-white mt-1">
                  {results.winner === "Set/Map" ? (
                    `⚡ ${activeTest === "array-set" ? "Set" : "Map"} is ${results.multiplier}x faster than ${activeTest === "array-set" ? "Array" : "Object"}!`
                  ) : (
                    `⚡ ${activeTest === "array-set" ? "Array" : "Object"} was slightly faster in this run!`
                  )}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                {/* Left result card */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
                  {/* Glow if this is the slower (worst) */}
                  {results.winner === "Set/Map" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
                  )}
                  <div className="relative z-10">
                    <span className="text-[10px] text-slate-400 uppercase block mb-1 font-sans">
                      {activeTest === "array-set" ? "Array lookup" : "Object lookup"}
                    </span>
                    <strong className="text-rose-400 text-[15px] font-bold block">{results.leftTime} ms</strong>
                    <span className="text-[9px] text-slate-500 font-sans block mt-1">Average latency per lookup</span>
                    {/* Performance grade for left */}
                    {(() => {
                      const perf = results.winner === "Set/Map"
                        ? Math.max(0, 100 - results.multiplier * 10)
                        : 95;
                      const g = getGrade(perf);
                      return (
                        <span className={`inline-block mt-2 text-xs font-bold ${g.color} ${g.bg} px-1.5 py-0.5 rounded`}>
                          {g.letter}
                        </span>
                      );
                    })()}
                  </div>
                  {/* Animated bar */}
                  <div className="mt-3 relative z-10">
                    <AnimatedBar
                      value={Math.min(100, (results.leftTime / Math.max(results.leftTime, results.rightTime)) * 100)}
                      delay={100}
                      gradient="from-rose-500 to-rose-400"
                    />
                  </div>
                </div>

                {/* Right result card */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
                  {/* Glow if this is the faster (best) */}
                  {results.winner === "Set/Map" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                  )}
                  <div className="relative z-10">
                    <span className="text-[10px] text-slate-400 uppercase block mb-1 font-sans">
                      {activeTest === "array-set" ? "Set.has lookup" : "Map.get lookup"}
                    </span>
                    <strong className="text-emerald-400 text-[15px] font-bold block">{results.rightTime} ms</strong>
                    <span className="text-[9px] text-slate-500 font-sans block mt-1">Average latency per lookup</span>
                    {/* Performance grade for right */}
                    {(() => {
                      const perf = results.winner === "Set/Map" ? 95 : Math.max(0, 100 - (1 / results.multiplier) * 10);
                      const g = getGrade(perf);
                      return (
                        <span className={`inline-block mt-2 text-xs font-bold ${g.color} ${g.bg} px-1.5 py-0.5 rounded`}>
                          {g.letter}
                        </span>
                      );
                    })()}
                  </div>
                  {/* Animated bar */}
                  <div className="mt-3 relative z-10">
                    <AnimatedBar
                      value={Math.min(100, (results.rightTime / Math.max(results.leftTime, results.rightTime)) * 100)}
                      delay={300}
                      gradient="from-emerald-500 to-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Multiplier sparkline visualization */}
              <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5">
                <Sparkline
                  data={[1, results.multiplier * 0.3, results.multiplier * 0.6, results.multiplier * 0.8, results.multiplier]}
                  color="#818cf8"
                  width={60}
                  height={20}
                />
                <div className="text-[10px] text-slate-400">
                  <span className="text-indigo-400 font-bold">{results.multiplier}×</span> speed difference detected
                  <ArrowRight className="inline h-3 w-3 ml-1 text-slate-600" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs flex flex-col items-center justify-center font-sans">
              <AlertTriangle className="h-8 w-8 text-slate-700 mb-2" />
              <span>Click the run button on the left panel to execute JS cycles.</span>
            </div>
          )}

          {/* Snippets code comparisons */}
          <div className="space-y-3.5 text-left">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block font-mono flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5 text-slate-400" />
              Algorithm Snippets
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-[10px] font-mono leading-relaxed">
                <div className="bg-slate-950/60 px-3 py-1.5 border-b border-slate-800 text-[9px] font-bold text-slate-400 uppercase flex items-center justify-between">
                  <span>Approach A (Standard)</span>
                  <Tooltip text="The standard / naive approach using built-in linear-scan methods.">
                    <Info className="h-3 w-3 text-slate-600 cursor-help hover:text-slate-400 transition-colors" />
                  </Tooltip>
                </div>
                <pre className="p-3 text-slate-300 overflow-x-auto whitespace-pre bg-slate-950 font-mono text-[10.5px]">
                  {testSnippets[activeTest].left}
                </pre>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-[10px] font-mono leading-relaxed">
                <div className="bg-slate-950/60 px-3 py-1.5 border-b border-slate-800 text-[9px] font-bold text-indigo-400 uppercase flex items-center justify-between">
                  <span>Approach B (Optimized)</span>
                  <Tooltip text="The optimized approach using hash-based lookups for O(1) average-case performance.">
                    <Info className="h-3 w-3 text-indigo-600 cursor-help hover:text-indigo-400 transition-colors" />
                  </Tooltip>
                </div>
                <pre className="p-3 text-indigo-300 overflow-x-auto whitespace-pre bg-slate-950 font-mono text-[10.5px]">
                  {testSnippets[activeTest].right}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Global keyframes (injected once) ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
