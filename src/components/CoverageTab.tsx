import React, { useState } from "react";
import { Play, Award, FileCode, CheckCircle, AlertTriangle, Percent, Terminal, Eye, Sliders, ShieldAlert } from "lucide-react";

interface CoverageFile {
  name: string;
  coverage: number;
  linesTotal: number;
  linesCovered: number;
  uncoveredLines: number[];
}

export const CoverageTab: React.FC = () => {
  const [runningTests, setRunningTests] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "low">("all");
  const [selectedFile, setSelectedFile] = useState<CoverageFile | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "PHPUnit 10.5.20 by Sebastian Bergmann and contributors.",
    "Runtime:       PHP 8.2.12",
    "Configuration: C:\\Users\\Andrzej\\Downloads\\sss\\yti-school-main\\phpunit.xml",
    "................                                                16 / 16 (100%)",
    "Time: 00:00.084, Memory: 12.00 MB",
    "OK (16 tests, 38 assertions)"
  ]);

  const [files, setFiles] = useState<CoverageFile[]>([
    { name: "admin/header.php", coverage: 92.5, linesTotal: 570, linesCovered: 527, uncoveredLines: [14, 15, 88, 126, 127] },
    { name: "channel.php", coverage: 84.1, linesTotal: 412, linesCovered: 346, uncoveredLines: [34, 35, 112, 113, 202] },
    { name: "checkout.php", coverage: 45.0, linesTotal: 142, linesCovered: 64, uncoveredLines: [27, 28, 29, 43, 44, 45, 46, 53, 54, 78, 79, 120] },
    { name: "dashboard.js", coverage: 71.3, linesTotal: 348, linesCovered: 248, uncoveredLines: [34, 48, 58, 101, 141, 142, 188] },
    { name: "db.php", coverage: 100, linesTotal: 15, linesCovered: 15, uncoveredLines: [] }
  ]);

  const runPhpUnit = () => {
    setRunningTests(true);
    setConsoleLogs(prev => [...prev, ">>> Uruchamianie pełnego zestawu testów PHPUnit...", ">>> Re-analiza pokrycia kodu..."]);
    
    setTimeout(() => {
      setRunningTests(false);
      setFiles(prev => prev.map(f => f.name === "checkout.php" ? { ...f, coverage: 88.0, linesCovered: 125, uncoveredLines: [27, 28] } : f));
      setConsoleLogs(prev => [
        ...prev,
        "PHPUnit 10.5.20 by Sebastian Bergmann and contributors.",
        "Runtime:       PHP 8.2.12",
        "Configuration: C:\\Users\\Andrzej\\Downloads\\sss\\yti-school-main\\phpunit.xml",
        "....................................                          38 / 38 (100%)",
        "Time: 00:00.192, Memory: 14.50 MB",
        "OK (38 tests, 92 assertions)",
        "Coverage report generated: index.html (Total: 87.2%)"
      ]);
    }, 2000);
  };

  const filteredFiles = files.filter(f => {
    if (activeFilter === "high") return f.coverage >= 80;
    if (activeFilter === "low") return f.coverage < 80;
    return true;
  });

  const overallCoverage = Math.round((files.reduce((acc, f) => acc + f.linesCovered, 0) / files.reduce((acc, f) => acc + f.linesTotal, 0)) * 1000) / 10;

  return (
    <div className="space-y-6 text-slate-200 text-left font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-950 p-6 rounded-3xl border border-slate-900 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400" />
            Test Coverage Explorer (PHPUnit / Jest / Istanbul)
          </h2>
          <p className="text-xs text-slate-500 mt-1">Interaktywny system badania pokrycia linii kodu testami oraz wizualizacji martwych stref.</p>
        </div>
        <button
          onClick={runPhpUnit}
          disabled={runningTests}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-97 select-none"
        >
          <Play className={`h-3.5 w-3.5 ${runningTests ? 'animate-spin' : ''}`} />
          {runningTests ? "Uruchamianie PHPUnit..." : "Uruchom Test Suite (PHPUnit)"}
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 font-mono block">POKRYCIE OGÓLNE</span>
            <span className="text-2xl font-black text-white mt-1 block">{overallCoverage}%</span>
          </div>
          <div className="bg-indigo-500/10 p-2.5 rounded-xl text-indigo-400">
            <Percent size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 font-mono block">PRZETESTOWANE LINIE</span>
            <span className="text-2xl font-black text-white mt-1 block">
              {files.reduce((acc, f) => acc + f.linesCovered, 0)} / {files.reduce((acc, f) => acc + f.linesTotal, 0)}
            </span>
          </div>
          <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400">
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 font-mono block">NIEPOKRYTE LINIE (LUKI)</span>
            <span className="text-2xl font-black text-rose-400 mt-1 block">
              {files.reduce((acc, f) => acc + f.uncoveredLines.length, 0)}
            </span>
          </div>
          <div className="bg-rose-500/10 p-2.5 rounded-xl text-rose-450 text-rose-400">
            <ShieldAlert size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 font-mono block">ASERCJE OGÓŁEM</span>
            <span className="text-2xl font-black text-cyan-400 mt-1 block">92</span>
          </div>
          <div className="bg-cyan-500/10 p-2.5 rounded-xl text-cyan-400">
            <Terminal size={18} />
          </div>
        </div>
      </div>

      {/* Main Grid: Files & Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Files Panel */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-950 border border-slate-900 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <h3 className="text-sm font-bold text-white">Struktura Pokrycia Plików</h3>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <button 
                onClick={() => setActiveFilter("all")}
                className={`px-2 py-1 rounded-lg border ${activeFilter === 'all' ? 'bg-slate-900 text-white border-slate-800' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveFilter("high")}
                className={`px-2 py-1 rounded-lg border ${activeFilter === 'high' ? 'bg-slate-900 text-emerald-400 border-slate-800' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
              >
                High (&gt;=80%)
              </button>
              <button 
                onClick={() => setActiveFilter("low")}
                className={`px-2 py-1 rounded-lg border ${activeFilter === 'low' ? 'bg-slate-900 text-rose-455 text-rose-400 border-slate-800' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
              >
                Low (&lt;80%)
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-900 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredFiles.map((file) => (
              <div 
                key={file.name} 
                className="py-3 flex items-center justify-between hover:bg-slate-900/10 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileCode className="h-4 w-4 text-slate-500" />
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block">{file.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      Pokryto: {file.linesCovered} / {file.linesTotal} linii
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-24 sm:w-36 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${file.coverage >= 80 ? 'bg-emerald-500' : file.coverage >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${file.coverage}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-black w-10 text-right">{file.coverage}%</span>
                  <button 
                    onClick={() => setSelectedFile(file)}
                    className="p-1.5 hover:bg-slate-900 hover:text-white rounded-lg text-slate-500 transition-all cursor-pointer"
                    title="Pokaż niepokryte linie"
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live PHPUnit Console Terminal Output */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-900 flex flex-col h-[400px]">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-3 shrink-0">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Terminal size={14} className="text-indigo-400" /> Console Logs Output
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-900 font-mono text-[9px] text-slate-400 overflow-y-auto leading-relaxed select-text text-left scrollbar-thin">
            {consoleLogs.map((log, i) => (
              <div key={i} className={log.startsWith(">>>") ? "text-indigo-400 font-bold" : log.includes("OK") ? "text-emerald-450 text-emerald-400 font-bold" : ""}>
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Selected File Details Overlay Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-[#000]/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200">
          <div className="bg-[#090911] border border-slate-900 p-6 rounded-3xl w-full max-w-md shadow-2xl relative text-left">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <FileCode className="text-indigo-400" size={16} /> 
              Pokrycie pliku: {selectedFile.name}
            </h4>
            <p className="text-[11px] text-slate-500 mb-4">Lista linii kodu, które nie zostały wywołane przez żadne testy jednostkowe:</p>
            
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 max-h-[200px] overflow-y-auto">
              {selectedFile.uncoveredLines.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedFile.uncoveredLines.map(line => (
                    <span 
                      key={line} 
                      className="bg-rose-500/10 border border-rose-500/20 text-rose-455 text-rose-400 px-2.5 py-1 rounded-lg text-xs font-mono font-bold"
                    >
                      Linia {line}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle size={14} /> Ten plik ma 100% pokrycia testami!
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button 
                onClick={() => setSelectedFile(null)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Zamknij podgląd
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
