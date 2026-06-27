import React, { useState } from "react";
import { Zap, Play, RefreshCw, AlertCircle, HelpCircle, Code, AlertTriangle } from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface BenchmarkTabProps {
  activeProject: CodeScopeAnalysis;
}

export const BenchmarkTab: React.FC<BenchmarkTabProps> = ({ activeProject }) => {
  const [activeTest, setActiveTest] = useState<string>("array-set");
  const [running, setRunning] = useState<boolean>(false);
  const [results, setResults] = useState<{
    leftTime: number;
    rightTime: number;
    multiplier: number;
    winner: string;
  } | null>(null);

  const runBenchmark = () => {
    setRunning(true);
    setResults(null);

    setTimeout(() => {
      let leftTime = 0;
      let rightTime = 0;

      if (activeTest === "array-set") {
        // Size of collection
        const size = 200000;
        const array = Array.from({ length: size }, (_, i) => i);
        const set = new Set(array);
        const target = size - 1;

        // 1. Array search (multiple runs to get readable latency)
        const startArr = performance.now();
        for (let r = 0; r < 200; r++) {
          array.includes(target);
        }
        const endArr = performance.now();
        leftTime = (endArr - startArr) / 200;

        // 2. Set search
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

        // 1. Object lookup
        const startObj = performance.now();
        for (let r = 0; r < 20000; r++) {
          const x = obj[target];
        }
        const endObj = performance.now();
        leftTime = (endObj - startObj) / 20000;

        // 2. Map lookup
        const startMap = performance.now();
        for (let r = 0; r < 20000; r++) {
          const y = map.get(target);
        }
        const endMap = performance.now();
        rightTime = (endMap - startMap) / 20000;
      }

      // Safe check to avoid divide by zero
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

  return (
    <div className="space-y-6 text-left" id="benchmark-tab-view font-sans">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
          <Zap className="h-5.5 w-5.5 text-amber-500 animate-pulse" />
          JavaScript Algorithm Benchmark
        </h2>
        <p className="text-xs text-slate-500 font-sans">Run local client-side Javascript microbenchmarks inside the browser runtime sandbox to audit performance efficiency.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side selectors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-[11px] font-sans mb-4">
              <button
                onClick={() => { setActiveTest("array-set"); setResults(null); }}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${activeTest === "array-set" ? "bg-white text-slate-900 font-bold shadow-sm" : "text-slate-550"}`}
              >
                Array vs Set Lookup
              </button>
              <button
                onClick={() => { setActiveTest("map-object"); setResults(null); }}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${activeTest === "map-object" ? "bg-white text-slate-900 font-bold shadow-sm" : "text-slate-550"}`}
              >
                Object vs Map Lookup
              </button>
            </div>

            <p className="text-xs text-slate-500 font-sans leading-relaxed mb-4">
              {testSnippets[activeTest].desc}
            </p>

            <button
              onClick={runBenchmark}
              disabled={running}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer font-sans"
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
        <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-lg text-white space-y-5 flex flex-col justify-between">
          
          {/* Results display */}
          {results ? (
            <div className="space-y-4 animate-fade-in text-left">
              <div className="border-b border-slate-850 pb-4">
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
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-450 uppercase block mb-1 font-sans">
                    {activeTest === "array-set" ? "Array lookup" : "Object lookup"}
                  </span>
                  <strong className="text-rose-400 text-[15px] font-bold block">{results.leftTime} ms</strong>
                  <span className="text-[9px] text-slate-500 font-sans block mt-1">Average latency per lookup</span>
                </div>
                <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-450 uppercase block mb-1 font-sans">
                    {activeTest === "array-set" ? "Set.has lookup" : "Map.get lookup"}
                  </span>
                  <strong className="text-emerald-400 text-[15px] font-bold block">{results.rightTime} ms</strong>
                  <span className="text-[9px] text-slate-500 font-sans block mt-1">Average latency per lookup</span>
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
              <div className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden text-[10px] font-mono leading-relaxed">
                <div className="bg-slate-950/60 px-3 py-1.5 border-b border-slate-850 text-[9px] font-bold text-slate-400 uppercase">
                  Approach A (Standard)
                </div>
                <pre className="p-3 text-slate-300 overflow-x-auto whitespace-pre bg-slate-950 font-mono text-[10.5px]">
                  {testSnippets[activeTest].left}
                </pre>
              </div>

              <div className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden text-[10px] font-mono leading-relaxed">
                <div className="bg-slate-950/60 px-3 py-1.5 border-b border-slate-850 text-[9px] font-bold text-indigo-400 uppercase">
                  Approach B (Optimized)
                </div>
                <pre className="p-3 text-indigo-300 overflow-x-auto whitespace-pre bg-slate-950 font-mono text-[10.5px]">
                  {testSnippets[activeTest].right}
                </pre>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
