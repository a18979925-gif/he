import React, { useState } from "react";
import { Settings, Sparkles, ShieldCheck, Cpu, Sliders, Play, Trash2, Eye, ShieldAlert } from "lucide-react";

interface SettingsDrawerProps {
  settingsSeverity: string;
  setSettingsSeverity: (sev: string) => void;
  settingsArchMatch: number;
  setSettingsArchMatch: (match: number) => void;
  setShowSettings: (show: boolean) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  settingsSeverity,
  setSettingsSeverity,
  settingsArchMatch,
  setSettingsArchMatch,
  setShowSettings,
}) => {
  // AI Engine Settings
  const [aiOracleEnabled, setAiOracleEnabled] = useState(true);
  const [strictOwaspMode, setStrictOwaspMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  // Scan Scopes
  const [scanSecurity, setScanSecurity] = useState(true);
  const [scanPerformance, setScanPerformance] = useState(true);
  const [scanQuality, setScanQuality] = useState(true);
  const [scanDeadCode, setScanDeadCode] = useState(true);
  const [scanApiSchema, setScanApiSchema] = useState(true);

  // File Paths & Rulesets
  const [excludePaths, setExcludePaths] = useState("node_modules, dist, build, .git, vendor, target, bin, obj");
  const [maxFileSizeKb, setMaxFileSizeKb] = useState(500);

  // Engine System Limits
  const [maxThreads, setMaxThreads] = useState(4);
  const [memoryLimitMb, setMemoryLimitMb] = useState(1024);
  const [analysisTimeoutSec, setAnalysisTimeoutSec] = useState(30);

  const handleApplySettings = () => {
    // Save to local storage for persistence across reloads
    localStorage.setItem("codescope_selected_model", selectedModel);
    localStorage.setItem("codescope_scan_security", String(scanSecurity));
    localStorage.setItem("codescope_scan_performance", String(scanPerformance));
    localStorage.setItem("codescope_scan_quality", String(scanQuality));
    localStorage.setItem("codescope_scan_deadcode", String(scanDeadCode));
    localStorage.setItem("codescope_scan_apischema", String(scanApiSchema));
    localStorage.setItem("codescope_exclude_paths", excludePaths);
    localStorage.setItem("codescope_max_threads", String(maxThreads));
    localStorage.setItem("codescope_memory_limit", String(memoryLimitMb));
    localStorage.setItem("codescope_timeout", String(analysisTimeoutSec));
    
    setShowSettings(false);
  };

  return (
    <div className="bg-slate-950 border border-slate-900 p-6 rounded-3xl shadow-2xl mb-8 relative overflow-hidden text-slate-200">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-900">
        <div className="text-left">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 font-sans tracking-tight">
            <Sliders className="h-4 w-4 text-indigo-400" /> 
            CodeScope Configuration Center (A-Z Ruleset)
          </h3>
          <p className="text-[11px] text-slate-550 mt-1">Configure advanced static scan scopes, environment options, and resource allocation.</p>
        </div>
        <span className="text-[9px] font-mono font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest">
          Advanced Mode
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Analysis Target & Severity */}
        <div className="space-y-5 text-left border-r border-slate-900 pr-0 lg:pr-6">
          <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1.5 mb-3">
            <ShieldAlert size={12} className="text-indigo-400" />
            1. Zakres & Czułość Skanera
          </h4>

          {/* Severity filter option */}
          <div className="flex flex-col">
            <label className="text-slate-400 mb-1.5 font-bold text-[10px] uppercase font-mono tracking-wider">Minimalny Poziom Ryzyka</label>
            <select 
              value={settingsSeverity}
              onChange={(e) => setSettingsSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-semibold focus:border-indigo-500 outline-none cursor-pointer w-full transition-all"
            >
              <option value="All">Wszystkie anomalie (Zalecane)</option>
              <option value="High">Tylko wysokie & krytyczne (High & Critical)</option>
              <option value="Critical">Tylko błędy krytyczne (Critical)</option>
            </select>
          </div>

          {/* Architecture Matching threshold */}
          <div className="flex flex-col">
            <label className="text-slate-400 mb-1.5 font-bold text-[10px] uppercase font-mono tracking-wider">Zgodność Architektoniczna</label>
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl">
              <input 
                type="range" 
                min="50" 
                max="95" 
                value={settingsArchMatch}
                onChange={(e) => setSettingsArchMatch(Number(e.target.value))}
                className="accent-indigo-500 h-1 cursor-pointer flex-1"
              />
              <span className="font-mono font-black text-xs text-slate-300 min-w-[30px] text-right">{settingsArchMatch}%</span>
            </div>
            <span className="text-[9px] text-slate-550 mt-1">Próg akceptowalnego podobieństwa grafu zależności.</span>
          </div>

          {/* Max File Size */}
          <div className="flex flex-col">
            <label className="text-slate-400 mb-1.5 font-bold text-[10px] uppercase font-mono tracking-wider">Maks. Wielkość Pliku Skanu</label>
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl">
              <input 
                type="range" 
                min="100" 
                max="2000" 
                step="50"
                value={maxFileSizeKb}
                onChange={(e) => setMaxFileSizeKb(Number(e.target.value))}
                className="accent-indigo-500 h-1 cursor-pointer flex-1"
              />
              <span className="font-mono font-black text-xs text-slate-300 min-w-[50px] text-right">{maxFileSizeKb} KB</span>
            </div>
          </div>
        </div>

        {/* Column 2: Engine Scopes & Exclusions */}
        <div className="space-y-4 text-left border-r border-slate-900 pr-0 lg:pr-6">
          <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1.5 mb-3">
            <Cpu size={12} className="text-cyan-400" />
            2. Moduły Silnika Badawczego
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl hover:border-slate-850 transition-colors select-none">
              <input 
                type="checkbox"
                checked={scanSecurity}
                onChange={(e) => setScanSecurity(e.target.checked)}
                className="rounded accent-indigo-500 h-3.5 w-3.5 cursor-pointer"
              />
              <span>Bezpieczeństwo</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl hover:border-slate-850 transition-colors select-none">
              <input 
                type="checkbox"
                checked={scanPerformance}
                onChange={(e) => setScanPerformance(e.target.checked)}
                className="rounded accent-indigo-500 h-3.5 w-3.5 cursor-pointer"
              />
              <span>Wydajność</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl hover:border-slate-850 transition-colors select-none">
              <input 
                type="checkbox"
                checked={scanQuality}
                onChange={(e) => setScanQuality(e.target.checked)}
                className="rounded accent-indigo-500 h-3.5 w-3.5 cursor-pointer"
              />
              <span>Jakość & Styl</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl hover:border-slate-850 transition-colors select-none">
              <input 
                type="checkbox"
                checked={scanDeadCode}
                onChange={(e) => setScanDeadCode(e.target.checked)}
                className="rounded accent-indigo-500 h-3.5 w-3.5 cursor-pointer"
              />
              <span>Martwy Kod</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl hover:border-slate-850 transition-colors select-none sm:col-span-2">
              <input 
                type="checkbox"
                checked={scanApiSchema}
                onChange={(e) => setScanApiSchema(e.target.checked)}
                className="rounded accent-indigo-500 h-3.5 w-3.5 cursor-pointer"
              />
              <span>Weryfikacja API HTTP / SQL Schema</span>
            </label>
          </div>

          {/* Paths to Exclude */}
          <div className="flex flex-col">
            <label className="text-slate-400 mb-1.5 font-bold text-[10px] uppercase font-mono tracking-wider">Ścieżki Wykluczone ze Skanu (Globs)</label>
            <input 
              type="text" 
              value={excludePaths}
              onChange={(e) => setExcludePaths(e.target.value)}
              className="bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none w-full transition-colors"
              placeholder="e.g. node_modules, dist"
            />
          </div>
        </div>

        {/* Column 3: AI Engine & System limits */}
        <div className="space-y-4 text-left">
          <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1.5 mb-3">
            <Sparkles size={12} className="text-purple-400" />
            3. AI Oracle & System Resource Limits
          </h4>

          {/* AI Settings */}
          <div className="flex items-center gap-3">
            <label className="flex flex-1 items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl hover:border-slate-850 transition-colors select-none text-xs font-semibold">
              <input 
                type="checkbox"
                checked={aiOracleEnabled}
                onChange={(e) => setAiOracleEnabled(e.target.checked)}
                className="rounded accent-indigo-500 h-3.5 w-3.5 cursor-pointer"
              />
              <Sparkles size={12} className="text-indigo-400" />
              <span>AI Oracle Active</span>
            </label>

            <label className="flex flex-1 items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl hover:border-slate-850 transition-colors select-none text-xs font-semibold">
              <input 
                type="checkbox"
                checked={strictOwaspMode}
                onChange={(e) => setStrictOwaspMode(e.target.checked)}
                className="rounded accent-rose-500 h-3.5 w-3.5 cursor-pointer"
              />
              <ShieldCheck size={12} className="text-rose-400" />
              <span>Strict OWASP</span>
            </label>
          </div>

          {/* Model selection */}
          <div className="flex flex-col">
            <label className="text-slate-400 mb-1.5 font-bold text-[10px] uppercase font-mono tracking-wider">Silnik LLM AI Oracle</label>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-semibold focus:border-indigo-500 outline-none cursor-pointer w-full transition-all"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Szybki skan)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Głęboki audyt logiczny)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro Legacy</option>
            </select>
          </div>

          {/* System Limits Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="flex flex-col text-left">
              <label className="text-slate-500 mb-1 text-[9px] uppercase font-mono tracking-wider">Wątki CPU</label>
              <select 
                value={maxThreads}
                onChange={(e) => setMaxThreads(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="1">1 Wątek</option>
                <option value="2">2 Wątki</option>
                <option value="4">4 Wątki</option>
                <option value="8">8 Wątków</option>
              </select>
            </div>

            <div className="flex flex-col text-left">
              <label className="text-slate-500 mb-1 text-[9px] uppercase font-mono tracking-wider">Limit RAM</label>
              <select 
                value={memoryLimitMb}
                onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="512">512 MB</option>
                <option value="1024">1.0 GB</option>
                <option value="2048">2.0 GB</option>
                <option value="4096">4.0 GB</option>
              </select>
            </div>

            <div className="flex flex-col text-left">
              <label className="text-slate-500 mb-1 text-[9px] uppercase font-mono tracking-wider">Timeout API</label>
              <select 
                value={analysisTimeoutSec}
                onChange={(e) => setAnalysisTimeoutSec(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="10">10 sek</option>
                <option value="30">30 sek</option>
                <option value="60">60 sek</option>
                <option value="120">120 sek</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Footer controls inside settings block */}
      <div className="mt-6 pt-5 border-t border-slate-900 flex justify-between items-center gap-4">
        <button
          onClick={() => setShowSettings(false)}
          className="text-xs text-slate-500 hover:text-slate-350 font-semibold px-4 py-2 hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
        >
          Zamknij bez zapisywania
        </button>
        <button
          onClick={handleApplySettings}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-950/20 active:scale-97 cursor-pointer"
        >
          Apply & Save Configurations
        </button>
      </div>

    </div>
  );
};
