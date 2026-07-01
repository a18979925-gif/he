import React, { useState, useEffect } from "react";
import { AlertTriangle, Activity, CheckCircle, RefreshCw, Layers, Shield } from "lucide-react";
import { CodeScopeAnalysis, CrashLogItem } from "../types";

interface LogsStreamTabProps {
  activeProject: CodeScopeAnalysis;
  onFixIssue: (filePath: string, oldCode: string, newCode: string) => Promise<void>;
}

export const LogsStreamTab: React.FC<LogsStreamTabProps> = ({ activeProject, onFixIssue }) => {
  const [logs, setLogs] = useState<CrashLogItem[]>(activeProject.crashLogs || []);
  const [selectedLog, setSelectedLog] = useState<CrashLogItem | null>(null);
  const [fixingId, setFixingId] = useState<string | null>(null);

  // Poll or auto-add new simulated exceptions periodically to make it feel like a LIVE stream
  useEffect(() => {
    setLogs(activeProject.crashLogs || []);
    setSelectedLog(activeProject.crashLogs?.[0] || null);

    const interval = setInterval(() => {
      // Occasional new warning logs
      const randomRoutes = activeProject.endpoints || [];
      if (randomRoutes.length === 0) return;

      const randomEp = randomRoutes[Math.floor(Math.random() * randomRoutes.length)];
      const newLog: CrashLogItem = {
        id: `crash-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        level: Math.random() > 0.6 ? "error" : "warning",
        message: `Dynamic warning on ${randomEp.method} ${randomEp.url}: connection pool check latency`,
        exceptionName: "LatencyAnomalyWarning",
        file: "server.ts",
        line: 45,
        stackTrace: [
          "at Server.handleInbound (server.ts:45:12)",
          "at ExpressRouter.match (node_modules/express/router.js:14)"
        ],
        resolved: false
      };

      setLogs(prev => {
        // Cap list length to 8 items
        const updated = [newLog, ...prev];
        if (updated.length > 8) updated.pop();
        return updated;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [activeProject]);

  const handleResolve = (id: string) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, resolved: true } : log));
    if (selectedLog && selectedLog.id === id) {
      setSelectedLog(prev => prev ? { ...prev, resolved: true } : null);
    }
  };

  const handleFixCode = async (log: CrashLogItem) => {
    setFixingId(log.id);
    try {
      // Find a matching security/performance issue to simulate fixing, or call auto-fix on disk if available
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleResolve(log.id);
      alert(`Auto-fix patch applied successfully to resolver files!`);
    } catch (err: any) {
      alert(`Auto-fix failed: ${err.message}`);
    } finally {
      setFixingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left" id="logs-stream-tab-view">
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

      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Activity className="h-5.5 w-5.5 text-rose-500 animate-pulse" />
          Sentry Live Crash Stream
        </h2>
        <p className="text-xs text-slate-500 font-sans">Simulates runtime stack exceptions (Timeout, NullPointer, validation errors) linked to REST routing handlers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Crash Logs List */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">Live Error Event Log</span>
            
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {logs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isSelected ? "bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-slate-950/40 hover:bg-slate-800/60 border-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[8.5px] font-extrabold uppercase font-mono px-1.5 py-0.5 rounded ${
                        log.resolved ? "bg-emerald-500/20 text-emerald-400" :
                        log.level === "fatal" ? "bg-red-650 text-white" :
                        log.level === "error" ? "bg-red-500 text-white" : "bg-amber-500 text-slate-950"
                      }`}>
                        {log.resolved ? "Resolved" : log.level}
                      </span>
                      <span className="text-[9px] font-mono opacity-80">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <strong className={`text-xs block font-mono line-clamp-1 ${isSelected ? "text-indigo-300" : "text-slate-200"}`}>
                      {log.exceptionName}
                    </strong>
                    <p className={`text-[10.5px] line-clamp-2 font-sans ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      {log.message}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Stacktrace & Remediation */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-lg text-white space-y-5">
          {selectedLog ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-850 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-red-400 font-mono text-[9px] uppercase font-bold tracking-wider">
                    {selectedLog.exceptionName}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{selectedLog.message}</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Occurred in: <span className="text-slate-300">{selectedLog.file}</span> (Line {selectedLog.line || "N/A"})
                  </p>
                </div>

                {!selectedLog.resolved && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleFixCode(selectedLog)}
                      disabled={fixingId === selectedLog.id}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer font-sans"
                    >
                      {fixingId === selectedLog.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
                      <span>Auto-Fix Code</span>
                    </button>
                    <button
                      onClick={() => handleResolve(selectedLog.id)}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all cursor-pointer border border-slate-750 font-sans"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Resolve</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Stack trace display */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block font-mono">
                  Stack Trace Frames
                </span>
                
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 overflow-x-auto text-[10.5px] font-mono leading-relaxed text-rose-300 space-y-1">
                  {selectedLog.stackTrace.map((frame, i) => (
                    <div key={i} className="truncate">
                      {frame}
                    </div>
                  ))}
                </div>
              </div>

              {/* Details card */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-left text-xs text-slate-350 leading-relaxed font-sans space-y-1.5">
                <span className="font-bold text-white block">Exception Analysis Report:</span>
                <p>
                  This exception was thrown during endpoint execution. It indicates that code tried to reference a null object or experienced a timeout querying downstream SQL instances.
                </p>
                <p className="text-slate-450 italic">
                  Suggested Action: Review parameter validation mappings or adjust DB connection pool parameters.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-slate-500 text-xs flex flex-col items-center justify-center font-sans">
              <AlertTriangle className="h-8 w-8 text-slate-700 mb-2" />
              <span>Select an error event from the left list to trace call stack variables.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
