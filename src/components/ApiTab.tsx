import React, { useState, useEffect, Fragment } from "react";
import { 
  RefreshCw, Play, ArrowRight, Layers, Layout, Server, Database, User,
  Search, Copy, Check, Globe, Shield, Terminal, Sliders, Cpu, Code, Zap
} from "lucide-react";
import { CodeScopeAnalysis, EndpointItem } from "../types";

interface ApiTabProps {
  activeProject: CodeScopeAnalysis;
  selectedEndpoint: EndpointItem | null;
  setSelectedEndpoint: (ep: EndpointItem | null) => void;
  swaggerRequestBody: string;
  setSwaggerRequestBody: (body: string) => void;
  executeSwaggerTryIt: () => Promise<void>;
  isSwaggerExecuting: boolean;
  simulatedExecutionTrace: string[];
  swaggerResponse: { status: number; headers: string; body: string } | null;
  setSwaggerResponse: (res: any) => void;
  setSimulatedExecutionTrace: (t: any) => void;
}

export const ApiTab: React.FC<ApiTabProps> = ({
  activeProject,
  selectedEndpoint,
  setSelectedEndpoint,
  swaggerRequestBody,
  setSwaggerRequestBody,
  executeSwaggerTryIt,
  isSwaggerExecuting,
  simulatedExecutionTrace,
  swaggerResponse,
  setSwaggerResponse,
  setSimulatedExecutionTrace,
}) => {
  // Sidebar Search & Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<string>("ALL");

  // Tab View Management
  const [activeLeftTab, setActiveLeftTab] = useState<"body" | "middlewares" | "dto">("body");
  const [activeRightTab, setActiveRightTab] = useState<"trace" | "response">("trace");

  // Copy Feedback State
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Auto-switch tabs based on simulation lifecycle
  useEffect(() => {
    if (swaggerResponse) {
      setActiveRightTab("response");
    }
  }, [swaggerResponse]);

  useEffect(() => {
    if (isSwaggerExecuting) {
      setActiveRightTab("trace");
    }
  }, [isSwaggerExecuting]);

  // Copy helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Prettify request JSON helper
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(swaggerRequestBody);
      setSwaggerRequestBody(JSON.stringify(parsed, null, 2));
    } catch (e) {
      alert("Invalid JSON syntax in request body.");
    }
  };

  // Safe JSON formatting & syntax highlighting helper
  const highlightJson = (jsonStr: string) => {
    if (!jsonStr) return "";
    try {
      const parsed = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
      const formatted = JSON.stringify(parsed, null, 2);

      return formatted
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(
          /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
          (match) => {
            let cls = "text-amber-400"; // numbers
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = "text-indigo-400 font-semibold"; // key
              } else {
                cls = "text-emerald-400"; // string
              }
            } else if (/true|false/.test(match)) {
              cls = "text-sky-400 font-semibold"; // boolean
            } else if (/null/.test(match)) {
              cls = "text-slate-500 italic"; // null
            }
            return `<span class="${cls}">${match}</span>`;
          }
        );
    } catch (e) {
      return jsonStr; // Fallback
    }
  };

  // Safe SQL syntax highlighting helper
  const highlightSql = (sql: string) => {
    if (!sql) return "";
    const keywords = [
      "SELECT", "FROM", "WHERE", "JOIN", "INNER", "LEFT", "ON", "AND", "OR", 
      "LIMIT", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", 
      "CREATE", "TABLE", "PRIMARY", "KEY", "ORDER", "BY", "DESC", "ASC",
      "AS", "ON", "IN", "GROUP", "HAVING", "COUNT", "SUM", "MIN", "MAX"
    ];
    let formatted = sql
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      formatted = formatted.replace(regex, `<span class="text-pink-400 font-bold">${keyword}</span>`);
    });
    
    // Highlight table strings (single quotes)
    formatted = formatted.replace(/'([^']*)'/g, `<span class="text-emerald-400">'$1'</span>`);
    return formatted;
  };

  // Filter routes based on search and method
  const filteredEndpoints = activeProject.endpoints.filter((ep) => {
    const matchesSearch = 
      ep.url.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ep.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = selectedMethodFilter === "ALL" || ep.method === selectedMethodFilter;
    return matchesSearch && matchesMethod;
  });

  // Dynamic Sequence Diagram Actors Mapping
  const getActorIndex = (stepName: string): number => {
    const lower = stepName.toLowerCase();
    if (lower.includes("client") || lower.includes("http")) return 0;
    if (lower.includes("gateway") || lower.includes("filter") || lower.includes("middleware")) return 1;
    if (lower.includes("controller") || lower.includes("handler")) return 2;
    if (lower.includes("service") || lower.includes("charge") || lower.includes("publisher")) return 3;
    if (lower.includes("repository") || lower.includes("client") || lower.includes("prisma")) return 4;
    if (lower.includes("database") || lower.includes("sql") || lower.includes("postgre") || lower.includes("mysql") || lower.includes("commit")) return 5;
    return 3; // Default to Service
  };

  const actors = [
    { label: "Client", icon: User },
    { label: "Gateway/Filter", icon: Server },
    { label: "Controller", icon: Layout },
    { label: "Service", icon: Layers },
    { label: "Repository", icon: Server },
    { label: "Database", icon: Database }
  ];

  // Trace active nodes and connections logic
  const activeActors = new Set<number>();
  let lastActiveActor = -1;

  if (simulatedExecutionTrace.length > 0) {
    const lastStep = simulatedExecutionTrace[simulatedExecutionTrace.length - 1];
    lastActiveActor = getActorIndex(lastStep);
    
    simulatedExecutionTrace.forEach(t => {
      activeActors.add(getActorIndex(t));
    });
  }

  return (
    <div className="space-y-6 text-slate-100" id="api-tab-view">
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

      {/* CSS Styles for scrollbars and diagrams */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
        
        @keyframes flow-dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .flow-line-anim {
          stroke-dasharray: 6 3;
          animation: flow-dash 1.2s linear infinite;
        }
        .flow-line-anim-fast {
          stroke-dasharray: 5 2;
          animation: flow-dash 0.6s linear infinite;
        }
      `}} />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4 text-left">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded tracking-widest uppercase">
              Sandbox Playground
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-500 font-mono">AST Engine Virtual Sandbox</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            HTTP API & Endpoint Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Construct code-mapped API requests, simulate routing execution flows, and run in-memory database queries.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Endpoint Collection Sidebar (lg:col-span-4) */}
        <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-sm lg:col-span-4 flex flex-col h-[650px] justify-between text-left">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block text-left">
                Mapped API Routes ({filteredEndpoints.length})
              </span>
            </div>

            {/* Search Route Input */}
            <div className="relative mb-3 shrink-0">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-500" />
              </span>
              <input
                type="text"
                placeholder="Search routes or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              />
            </div>

            {/* Method Pill Filters */}
            <div className="flex flex-wrap gap-1.5 mb-4 shrink-0">
              {["ALL", "GET", "POST", "PUT", "DELETE"].map((method) => (
                <button
                  key={method}
                  onClick={() => setSelectedMethodFilter(method)}
                  className={`text-[9px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer border ${
                    selectedMethodFilter === method
                      ? method === "GET" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : method === "POST" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                        : method === "PUT" ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : method === "DELETE" ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                      : "bg-slate-950/40 text-slate-400 border-slate-850 hover:bg-slate-800/40 hover:text-slate-300"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {/* Scrollable List */}
            <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {filteredEndpoints.length > 0 ? (
                filteredEndpoints.map((ep, idx) => {
                  const isSelected = selectedEndpoint?.url === ep.url && selectedEndpoint?.method === ep.method;
                  return (
                    <button
                      key={idx}
                      onClick={() => { 
                        setSelectedEndpoint(ep); 
                        setSwaggerResponse(null); 
                        setSimulatedExecutionTrace([]); 
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected 
                          ? "bg-slate-900 border-indigo-500/80 shadow-md shadow-indigo-500/5 border-l-4 border-l-indigo-500" 
                          : "bg-slate-950/40 hover:bg-slate-900/60 border-slate-850 border-l-4 border-l-transparent"
                      }`}
                    >
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded min-w-[55px] text-center shrink-0 border uppercase tracking-wider ${
                        ep.method === "GET" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : ep.method === "POST" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                        : ep.method === "PUT" ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}>
                        {ep.method}
                      </span>
                      <div className="truncate">
                        <span className="text-xs font-mono font-bold text-slate-200 block truncate">{ep.url}</span>
                        <span className="text-[10px] text-slate-400 block truncate leading-tight mt-0.5 font-sans">{ep.description}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col justify-center items-center py-16 text-slate-500 font-sans">
                  <Globe className="h-8 w-8 text-slate-700 stroke-1 mb-2" />
                  <span className="text-xs">No matching routes found</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sandbox Console panel (lg:col-span-8) */}
        {selectedEndpoint ? (
          <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm lg:col-span-8 space-y-6 text-left">
            
            {/* Simulated Address Bar Header */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-850/90 shrink-0">
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg border uppercase tracking-wider ${
                  selectedEndpoint.method === "GET" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : selectedEndpoint.method === "POST" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                  : selectedEndpoint.method === "PUT" ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}>
                  {selectedEndpoint.method}
                </span>
                
                <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                  selectedEndpoint.auth.toLowerCase().includes("public") 
                    ? "bg-slate-800/50 text-slate-400 border-slate-700/50" 
                    : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                }`}>
                  {selectedEndpoint.auth}
                </span>
              </div>
              
              {/* URL Address Read-only block */}
              <div className="flex-1 min-w-0 flex items-center bg-slate-900/80 rounded border border-slate-850 px-3 py-1.5">
                <span className="text-slate-500 text-xs shrink-0 select-none mr-1 font-mono">http://localhost:8080</span>
                <span className="text-slate-200 font-mono text-xs truncate font-bold">{selectedEndpoint.url}</span>
                <button
                  onClick={() => handleCopyText(`http://localhost:8080${selectedEndpoint.url}`, "url")}
                  className="ml-auto p-1 text-slate-500 hover:text-slate-350 hover:bg-slate-800/40 rounded transition-all cursor-pointer shrink-0"
                  title="Copy path"
                >
                  {copiedText === "url" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              
              {/* Trigger Button */}
              <button
                onClick={executeSwaggerTryIt}
                disabled={isSwaggerExecuting}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-855 disabled:to-slate-900 disabled:text-slate-550 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] shrink-0 cursor-pointer"
              >
                {isSwaggerExecuting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-200" />
                    <span>Tracing API...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Send API Request</span>
                  </>
                )}
              </button>
            </div>

            {/* Description Area */}
            <div className="bg-slate-955/20 p-4 rounded-xl border border-slate-850/50">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Route Context</span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedEndpoint.description}</p>
            </div>

            {/* Split Workspace Editor & Monitor panels */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* Left Column Workspace (Request inputs) */}
              <div className="xl:col-span-5 space-y-4">
                <div className="border border-slate-800/80 rounded-xl bg-slate-900/30 p-4 space-y-4">
                  {/* Left Tabs bar */}
                  <div className="flex border-b border-slate-800/80 pb-2">
                    <button 
                      onClick={() => setActiveLeftTab("body")}
                      className={`text-[11px] font-bold pb-2 px-1 relative transition-all cursor-pointer mr-4 flex items-center gap-1.5 ${
                        activeLeftTab === "body" ? "text-indigo-400" : "text-slate-400 hover:text-slate-350"
                      }`}
                    >
                      <Code className="h-3.5 w-3.5" />
                      Request Schema
                      {activeLeftTab === "body" && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 rounded"></span>}
                    </button>
                    <button 
                      onClick={() => setActiveLeftTab("middlewares")}
                      className={`text-[11px] font-bold pb-2 px-1 relative transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeLeftTab === "middlewares" ? "text-indigo-400" : "text-slate-400 hover:text-slate-355"
                      }`}
                    >
                      <Shield className="h-3.5 w-3.5" />
                      Interceptors
                      {activeLeftTab === "middlewares" && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 rounded"></span>}
                    </button>
                  </div>

                  {/* Left Tab Contents */}
                  {activeLeftTab === "body" && (
                    <div className="space-y-4">
                      {/* Body Editor (If method permits body parameters) */}
                      {selectedEndpoint.method !== "GET" && selectedEndpoint.method !== "DELETE" ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">JSON Request payload</span>
                            <button 
                              onClick={handleFormatJson}
                              className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-850 cursor-pointer"
                            >
                              Format JSON
                            </button>
                          </div>
                          
                          <div className="relative font-mono text-xs">
                            {/* Editor frame */}
                            <div className="flex bg-slate-950 rounded-lg border border-slate-850 overflow-hidden">
                              <div className="bg-slate-950/60 text-slate-600 px-2 py-3 text-right select-none border-r border-slate-900 text-[10px] flex flex-col gap-0.5 justify-start">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <span key={n}>{n}</span>)}
                              </div>
                              <textarea 
                                value={swaggerRequestBody}
                                onChange={(e) => setSwaggerRequestBody(e.target.value)}
                                rows={7}
                                className="flex-1 bg-transparent text-emerald-400 font-mono p-3 outline-none focus:ring-0 border-0 resize-none w-full"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Query Parameters mapping</span>
                          <div className="bg-slate-955/70 p-3 rounded-lg border border-slate-850 text-xs text-slate-450 space-y-2 font-mono">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                              <span className="text-indigo-400 font-bold">limit</span>
                              <span className="text-[9px] text-slate-500">Int (Default: 20)</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                              <span className="text-indigo-400 font-bold">page</span>
                              <span className="text-[9px] text-slate-500">Int (Default: 1)</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-indigo-400 font-bold">query</span>
                              <span className="text-[9px] text-slate-500">String (Optional query query)</span>
                            </div>
                            <div className="pt-2 text-[9px] text-slate-500 italic font-sans leading-tight border-t border-slate-900 mt-2">
                              {selectedEndpoint.requestDto || "Standard read pagination layout."}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Schema Response Spec */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Target Response Schema (DTO)</span>
                        <div className="bg-slate-955 p-3 rounded-lg border border-slate-855 font-mono text-indigo-300 text-xs h-[100px] overflow-y-auto custom-scrollbar">
                          {selectedEndpoint.responseDto || "Any standard JSON Object response"}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeLeftTab === "middlewares" && (
                    <div className="space-y-4">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Route Validation Guards</span>
                      
                      <div className="flex flex-col gap-2 font-mono">
                        {selectedEndpoint.middlewares.length > 0 ? (
                          selectedEndpoint.middlewares.map((mw, i) => (
                            <div key={i} className="flex items-center gap-3 bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-850/80">
                              <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-400 font-bold shrink-0">
                                {i + 1}
                              </div>
                              <div className="min-w-0">
                                <span className="text-slate-200 text-xs font-semibold block truncate">{mw}</span>
                                <span className="text-[9px] text-slate-500 block truncate">Intermediary route controller handler filter</span>
                              </div>
                              <Shield className="h-3.5 w-3.5 text-indigo-500/60 ml-auto shrink-0" />
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500 text-xs italic py-6 text-center">
                            No intermediate custom middleware validation mapped.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mapped Database Query display */}
                <div className="border border-slate-800/80 rounded-xl bg-slate-900/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                      Mapped SQL Query
                    </span>
                    {selectedEndpoint.sqlQuery && (
                      <button
                        onClick={() => handleCopyText(selectedEndpoint.sqlQuery || "", "sql")}
                        className="p-1 text-slate-500 hover:text-slate-350 rounded cursor-pointer"
                        title="Copy SQL Query"
                      >
                        {copiedText === "sql" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[10px] h-[95px] overflow-y-auto custom-scrollbar select-all">
                    {selectedEndpoint.sqlQuery ? (
                      <pre 
                        className="whitespace-pre-wrap leading-relaxed text-left" 
                        dangerouslySetInnerHTML={{ __html: highlightSql(selectedEndpoint.sqlQuery) }} 
                      />
                    ) : (
                      <span className="text-slate-600 italic">No persistent database query triggers mapped for this path.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column Workspace (Flows & Outputs) */}
              <div className="xl:col-span-7 space-y-4">
                <div className="border border-slate-800/80 rounded-xl bg-slate-900/30 p-4 flex flex-col min-h-[460px]">
                  {/* Right Tabs bar */}
                  <div className="flex border-b border-slate-800/80 pb-2 mb-4 shrink-0">
                    <button 
                      onClick={() => setActiveRightTab("trace")}
                      className={`text-[11px] font-bold pb-2 px-1 relative transition-all cursor-pointer mr-4 flex items-center gap-1.5 ${
                        activeRightTab === "trace" ? "text-indigo-400" : "text-slate-400 hover:text-slate-350"
                      }`}
                    >
                      <Zap className={`h-3.5 w-3.5 ${isSwaggerExecuting ? "text-amber-400 animate-bounce" : "text-indigo-400"}`} />
                      Execution Flow & Diagram
                      {activeRightTab === "trace" && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 rounded"></span>}
                    </button>
                    <button 
                      onClick={() => setActiveRightTab("response")}
                      className={`text-[11px] font-bold pb-2 px-1 relative transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeRightTab === "response" ? "text-indigo-400" : "text-slate-400 hover:text-slate-350"
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5 text-indigo-400" />
                      Response Sandbox
                      {swaggerResponse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                      {activeRightTab === "response" && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 rounded"></span>}
                    </button>
                  </div>

                  {/* Right Tab Contents */}
                  <div className="flex-grow flex flex-col justify-between">
                    
                    {/* Execution Flow Tab */}
                    {activeRightTab === "trace" && (
                      <div className="space-y-4 flex-grow flex flex-col justify-between">
                        {/* Simulated Execution Timeline */}
                        <div className="bg-slate-955 p-4 rounded-xl border border-slate-850 space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider block font-bold">
                              Trace Routing Steps
                            </span>
                            {simulatedExecutionTrace.length > 0 && (
                              <span className="text-[9px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-855 animate-pulse">
                                Live Simulation Active
                              </span>
                            )}
                          </div>
                          
                          <div className="custom-scrollbar overflow-x-auto pb-1">
                            {simulatedExecutionTrace.length > 0 ? (
                              <div className="flex items-center gap-2 text-[10px] font-mono py-1">
                                {simulatedExecutionTrace.map((step, idx) => {
                                  const isLast = idx === simulatedExecutionTrace.length - 1;
                                  return (
                                    <Fragment key={idx}>
                                      <div className={`px-2.5 py-1 rounded border transition-all flex items-center gap-1.5 shrink-0 ${
                                        isLast 
                                          ? "bg-indigo-950/50 text-indigo-300 border-indigo-500/50 font-bold shadow-sm animate-pulse" 
                                          : "bg-slate-900/60 text-slate-400 border-slate-850"
                                      }`}>
                                        {isLast && <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping"></span>}
                                        {step}
                                      </div>
                                      {idx < simulatedExecutionTrace.length - 1 && (
                                        <ArrowRight className="h-3 w-3 text-slate-700 shrink-0" />
                                      )}
                                    </Fragment>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-slate-500 text-[10px] italic py-1.5 text-left font-mono">
                                Click "Send API Request" to execute Route AST step resolution.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* UML Diagram */}
                        {selectedEndpoint.flow && selectedEndpoint.flow.length > 0 && (
                          <div className="space-y-2 flex-grow mt-3">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                              Dynamic UML sequence routing
                            </span>
                            
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-center items-center overflow-x-auto custom-scrollbar">
                              <svg 
                                viewBox={`0 0 620 ${80 + selectedEndpoint.flow.length * 40}`}
                                className="w-full max-w-full h-auto"
                              >
                                <defs>
                                  <linearGradient id="actor-grad-active" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#1e1b4b" />
                                    <stop offset="100%" stopColor="#311042" />
                                  </linearGradient>
                                  <linearGradient id="actor-grad-last" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#064e3b" />
                                    <stop offset="100%" stopColor="#022c22" />
                                  </linearGradient>
                                  <linearGradient id="actor-grad-inactive" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#0f172a" />
                                    <stop offset="100%" stopColor="#020617" />
                                  </linearGradient>
                                  
                                  {selectedEndpoint.flow.map((step, idx) => {
                                    const stepClean = step.split("(")[0].trim().toLowerCase();
                                    const isActive = simulatedExecutionTrace.some(t => t.split("(")[0].trim().toLowerCase() === stepClean);
                                    const isLastActive = simulatedExecutionTrace.length > 0 && 
                                      simulatedExecutionTrace[simulatedExecutionTrace.length - 1].split("(")[0].trim().toLowerCase() === stepClean;
                                    const markerColor = isLastActive ? "#10b981" : isActive ? "#818cf8" : "#334155";
                                    return (
                                      <marker 
                                        key={idx}
                                        id={`seq-arrow-${idx}`} 
                                        viewBox="0 0 10 10" 
                                        refX="6" 
                                        refY="5" 
                                        markerWidth="6" 
                                        markerHeight="6" 
                                        orient="auto-start-reverse"
                                      >
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill={markerColor} />
                                      </marker>
                                    );
                                  })}
                                </defs>

                                {/* Draw Lifelines */}
                                {actors.map((actor, idx) => {
                                  const x = 50 + idx * 100;
                                  const isActorActive = activeActors.has(idx);
                                  const isActorLast = lastActiveActor === idx;
                                  
                                  const boxStroke = isActorLast ? "#10b981" : isActorActive ? "#6366f1" : "#1e293b";
                                  const boxGrad = isActorLast ? "url(#actor-grad-last)" : isActorActive ? "url(#actor-grad-active)" : "url(#actor-grad-inactive)";
                                  const textFill = isActorLast ? "#34d399" : isActorActive ? "#a5b4fc" : "#64748b";
                                  
                                  return (
                                    <g key={idx}>
                                      <line 
                                        x1={x} 
                                        y1="35" 
                                        x2={x} 
                                        y2={60 + selectedEndpoint.flow.length * 40} 
                                        stroke={isActorLast ? "#10b981" : isActorActive ? "#6366f1" : "#1e293b"} 
                                        strokeWidth={isActorActive ? "2" : "1.5"} 
                                        strokeDasharray={isActorActive ? "none" : "4,4"} 
                                        opacity={isActorActive ? 1 : 0.4}
                                      />
                                      <rect 
                                        x={x - 42} 
                                        y="5" 
                                        width="84" 
                                        height="28" 
                                        rx="6" 
                                        fill={boxGrad} 
                                        stroke={boxStroke} 
                                        strokeWidth={isActorActive ? "2" : "1.5"} 
                                      />
                                      <text 
                                        x={x} 
                                        y="22" 
                                        fill={textFill} 
                                        fontSize="9.5" 
                                        fontFamily="monospace"
                                        textAnchor="middle"
                                        fontWeight="bold"
                                      >
                                        {actor.label}
                                      </text>
                                    </g>
                                  );
                                })}

                                {/* Draw Message Arrows */}
                                {selectedEndpoint.flow.map((step, idx) => {
                                  const y = 60 + idx * 40;
                                  
                                  // Guess message sequence (from step i-1 to step i)
                                  const fromActorIdx = idx === 0 ? 0 : getActorIndex(selectedEndpoint.flow[idx - 1]);
                                  const toActorIdx = getActorIndex(step);
                                  
                                  const fromX = 50 + fromActorIdx * 100;
                                  const toX = 50 + toActorIdx * 100;

                                  const stepClean = step.split("(")[0].trim().toLowerCase();
                                  const isActive = simulatedExecutionTrace.some(t => t.split("(")[0].trim().toLowerCase() === stepClean);
                                  const isLastActive = simulatedExecutionTrace.length > 0 && 
                                    simulatedExecutionTrace[simulatedExecutionTrace.length - 1].split("(")[0].trim().toLowerCase() === stepClean;

                                  const strokeColor = isLastActive ? "#10b981" : isActive ? "#818cf8" : "#1e293b";
                                  const strokeWidth = isActive ? "2" : "1.2";
                                  const textClass = isLastActive ? "fill-emerald-400 font-bold" : isActive ? "fill-indigo-300" : "fill-slate-650";
                                  
                                  let arrowClassName = "";
                                  if (isLastActive) arrowClassName = "flow-line-anim-fast";
                                  else if (isActive) arrowClassName = "flow-line-anim";

                                  return (
                                    <g key={idx} opacity={isActive ? 1 : 0.25}>
                                      {fromX !== toX ? (
                                        <path 
                                          d={`M ${fromX} ${y} L ${toX} ${y}`} 
                                          stroke={strokeColor} 
                                          strokeWidth={strokeWidth}
                                          className={arrowClassName}
                                          markerEnd={`url(#seq-arrow-${idx})`} 
                                        />
                                      ) : (
                                        // Self call loop
                                        <path 
                                          d={`M ${fromX} ${y - 8} C ${fromX + 30} ${y - 8}, ${fromX + 30} ${y + 8}, ${fromX + 6} ${y + 8}`} 
                                          stroke={strokeColor} 
                                          strokeWidth={strokeWidth}
                                          className={arrowClassName}
                                          fill="none"
                                          markerEnd={`url(#seq-arrow-${idx})`} 
                                        />
                                      )}
                                      <text 
                                        x={fromX === toX ? fromX + 35 : Math.min(fromX, toX) + Math.abs(fromX - toX) / 2} 
                                        y={y - 5} 
                                        className={`${textClass} font-mono text-[9px]`}
                                        textAnchor={fromX === toX ? "start" : "middle"}
                                      >
                                        {step.split("(")[0].substring(0, 22)}
                                      </text>
                                    </g>
                                  );
                                })}
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Response Console Tab */}
                    {activeRightTab === "response" && (
                      <div className="space-y-4 flex-grow flex flex-col justify-between">
                        {swaggerResponse ? (
                          <div className="space-y-4 flex-grow flex flex-col justify-between">
                            {/* Response Metadata Badge bar */}
                            <div className="grid grid-cols-3 gap-3 shrink-0">
                              <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                                swaggerResponse.status >= 200 && swaggerResponse.status < 300 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-md shadow-emerald-500/5" 
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-md shadow-rose-500/5"
                              }`}>
                                <span className="text-[9px] text-slate-500 font-sans block mb-0.5">Status Code</span>
                                <span className="text-xs font-bold font-mono">{swaggerResponse.status} {swaggerResponse.status >= 200 && swaggerResponse.status < 300 ? "OK" : "Error"}</span>
                              </div>
                              
                              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex flex-col items-center justify-center text-center">
                                <span className="text-[9px] text-slate-500 font-sans block mb-0.5">Duration</span>
                                <span className="text-xs font-bold font-mono text-sky-400">32 ms</span>
                              </div>
                              
                              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex flex-col items-center justify-center text-center">
                                <span className="text-[9px] text-slate-500 font-sans block mb-0.5">Payload Size</span>
                                <span className="text-xs font-bold font-mono text-amber-400">
                                  {Math.round(swaggerResponse.body.length / 100) / 10} KB
                                </span>
                              </div>
                            </div>
                            
                            {/* Response Headers */}
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1 shrink-0">
                              <span className="text-[9px] text-slate-500 font-sans block mb-1">Response Headers</span>
                              <pre className="text-[9.5px] leading-relaxed text-slate-400 font-mono max-h-16 overflow-y-auto custom-scrollbar select-all text-left">
                                {swaggerResponse.headers}
                              </pre>
                            </div>
                            
                            {/* Response Payload Code viewer */}
                            <div className="flex-grow flex flex-col space-y-2 mt-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">JSON Response Payload</span>
                                <button
                                  onClick={() => handleCopyText(swaggerResponse.body, "response")}
                                  className="text-[9px] text-indigo-400 hover:text-indigo-300 font-bold bg-slate-950 px-2 py-1.5 rounded border border-slate-850 cursor-pointer flex items-center gap-1.5 transition-all"
                                >
                                  {copiedText === "response" ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-400" />
                                      <span>Copied Payload</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copy Response</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              
                              <div className="bg-slate-955 p-4 rounded-xl border border-slate-850 font-mono text-[11px] overflow-y-auto max-h-[220px] custom-scrollbar flex-grow text-left">
                                <pre 
                                  className="whitespace-pre overflow-x-auto leading-relaxed text-left" 
                                  dangerouslySetInnerHTML={{ __html: highlightJson(swaggerResponse.body) }}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-grow flex flex-col justify-center items-center text-slate-500 border border-dashed border-slate-850 rounded-xl bg-slate-950/20 py-20">
                            <Globe className="h-10 w-10 text-slate-800 animate-pulse mb-3" />
                            <p className="text-xs font-semibold text-slate-400">Response Sandbox Idle</p>
                            <p className="text-[10px] text-slate-500 max-w-[250px] text-center mt-1">
                              Trigger a request trace session to see JSON payload inspect benchmarks.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
            </div>

          </div>
        ) : (
          /* Empty Sandbox Onboarding Frame (lg:col-span-8) */
          <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-8 shadow-xl backdrop-blur-sm lg:col-span-8 flex flex-col justify-center items-center text-center min-h-[500px]">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 animate-pulse shadow-inner">
              <Zap className="h-7 w-7 text-indigo-400" />
            </div>
            
            <h3 className="text-lg font-bold text-white tracking-tight">Interactive Sandbox Client</h3>
            <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed font-sans">
              Explore routes extracted from your codebase. Configure mock request schemas, trace intermediate middlewares, evaluate database transactions, and examine returned JSON bodies in real-time.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl text-left">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850/80 flex gap-3">
                <Globe className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">HTTP Route Catalog</span>
                  <span className="text-[10px] text-slate-500 leading-relaxed block mt-1">
                    Route scanners auto-map REST verbs, auth permissions, and request param validations dynamically.
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850/80 flex gap-3">
                <Shield className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Interceptor Security</span>
                  <span className="text-[10px] text-slate-500 leading-relaxed block mt-1">
                    Visualize authentication filters, security guards, and request rate-limiting middlewares.
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850/80 flex gap-3">
                <Terminal className="h-5 w-5 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">In-Memory Database Map</span>
                  <span className="text-[10px] text-slate-500 leading-relaxed block mt-1">
                    Inspect database transaction locks and query strings simulated in response runs.
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850/80 flex gap-3">
                <Cpu className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Sequence Life Tracing</span>
                  <span className="text-[10px] text-slate-500 leading-relaxed block mt-1">
                    Trace dynamic network arrows moving down sequence lifelines as execution runs.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
