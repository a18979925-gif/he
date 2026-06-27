import React, { useState } from "react";
import { Activity, RefreshCw, RotateCcw, Terminal, Check, Copy, ChevronUp, ChevronDown, Database } from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface RuntimeTabProps {
  activeProject: CodeScopeAnalysis;
  fetchSandboxConfig: () => Promise<void>;
  handleSandboxReset: () => Promise<void>;
  sandboxDbState: Record<string, Array<Record<string, any>>>;
  sandboxLogs: any[];
  activeSandboxTable: string;
  setActiveSandboxTable: (tbl: string) => void;
  expandedLogIndex: number | null;
  setExpandedLogIndex: (idx: number | null) => void;
  copyFeedback: string | null;
  copyTextToClipboard: (text: string, label: string) => void;
}

export const RuntimeTab: React.FC<RuntimeTabProps> = ({
  activeProject,
  fetchSandboxConfig,
  handleSandboxReset,
  sandboxDbState,
  sandboxLogs,
  activeSandboxTable,
  setActiveSandboxTable,
  expandedLogIndex,
  setExpandedLogIndex,
  copyFeedback,
  copyTextToClipboard,
}) => {
  // Local states for advanced log search and filtering
  const [logMethodFilter, setLogMethodFilter] = useState<'ALL' | 'GET' | 'POST' | 'PUT' | 'DELETE'>('ALL');
  const [logStatusFilter, setLogStatusFilter] = useState<'ALL' | 'SUCCESS' | 'ERROR'>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [dbSearchQuery, setDbSearchQuery] = useState<string>('');
  const [logDetailTabs, setLogDetailTabs] = useState<Record<number, 'sql' | 'request' | 'response'>>({});
  const [addressBarTab, setAddressBarTab] = useState<'url' | 'curl-get' | 'curl-post'>('url');

  // Find endpoints in project analysis for dynamic cURL helper queries
  const firstGetEndpoint = activeProject?.endpoints?.find(e => e.method === 'GET') || { url: '/users' };
  const firstPostEndpoint = activeProject?.endpoints?.find(e => e.method === 'POST') || { url: '/users' };
  
  let firstPostPayload = '{"name": "John Doe", "email": "john@example.com"}';
  if (firstPostEndpoint.requestDto) {
    try {
      const parsed = JSON.parse(firstPostEndpoint.requestDto);
      firstPostPayload = JSON.stringify(parsed);
    } catch (_) {
      firstPostPayload = firstPostEndpoint.requestDto.replace(/\s+/g, ' ');
    }
  }

  // Syntax highlighting for SQL statements
  const highlightSQL = (sqlVal: any) => {
    const sql = typeof sqlVal === 'string' ? sqlVal : String(sqlVal || '');
    if (!sql.trim()) return <span className="text-slate-500 italic">No SQL statement executed.</span>;

    const keywords = [
      "SELECT", "FROM", "WHERE", "INSERT INTO", "INSERT", "VALUES", "UPDATE", "SET", 
      "DELETE", "JOIN", "ON", "AND", "OR", "LIMIT", "ORDER BY", "GROUP BY",
      "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "AS", "IN", "IS", "NULL", "NOT", "LIKE",
      "DESC", "ASC", "CREATE TABLE", "DROP TABLE"
    ];

    const regex = new RegExp(
      `\\b(${keywords.join("|")})\\b|('[^']*')|(\\b\\d+\\b)|([\\(\\),;\\=\\<\\>])`,
      "gi"
    );

    const tokens: React.ReactNode[] = [];
    let lastIndex = 0;

    sql.replace(regex, (match, keyword, str, num, symbol, offset) => {
      if (offset > lastIndex) {
        tokens.push(sql.substring(lastIndex, offset));
      }

      if (keyword) {
        tokens.push(
          <span key={offset} className="text-indigo-400 font-semibold uppercase">
            {match}
          </span>
        );
      } else if (str) {
        tokens.push(
          <span key={offset} className="text-emerald-300 font-mono">
            {match}
          </span>
        );
      } else if (num) {
        tokens.push(
          <span key={offset} className="text-amber-400 font-mono">
            {match}
          </span>
        );
      } else if (symbol) {
        tokens.push(
          <span key={offset} className="text-purple-300 font-bold">
            {match}
          </span>
        );
      } else {
        tokens.push(match);
      }

      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < sql.length) {
      tokens.push(sql.substring(lastIndex));
    }

    return <span className="font-mono text-xs">{tokens.length > 0 ? tokens : sql}</span>;
  };

  // Syntax highlighting for JSON request/response payloads
  const highlightJSON = (jsonVal: any) => {
    if (jsonVal === null || jsonVal === undefined) {
      return <pre className="font-mono text-xs text-slate-500 italic">Empty body</pre>;
    }
    let pretty = "";
    try {
      const obj = typeof jsonVal === 'string' ? JSON.parse(jsonVal) : jsonVal;
      pretty = JSON.stringify(obj, null, 2);
    } catch (e) {
      pretty = String(jsonVal);
    }

    if (!pretty.trim() || pretty === "{}" || pretty === "[]") {
      return <pre className="font-mono text-xs text-slate-500 italic">Empty object/array</pre>;
    }

    const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    pretty.replace(regex, (match, ...args) => {
      const offset = args[args.length - 2] as number;
      if (offset > lastIndex) {
        parts.push(pretty.substring(lastIndex, offset));
      }

      let cls = "text-slate-350";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "text-indigo-300 font-semibold";
        } else {
          cls = "text-emerald-300";
        }
      } else if (/true|false/.test(match)) {
        cls = "text-amber-400 font-bold";
      } else if (/null/.test(match)) {
        cls = "text-rose-400 italic font-medium";
      } else {
        cls = "text-sky-400";
      }

      parts.push(<span key={offset} className={cls}>{match}</span>);
      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < pretty.length) {
      parts.push(pretty.substring(lastIndex));
    }

    return (
      <pre className="font-mono text-[11px] overflow-x-auto select-text whitespace-pre-wrap break-all leading-relaxed max-h-48 scrollbar">
        {parts.length > 0 ? parts : pretty}
      </pre>
    );
  };

  // Filter and map incoming logs
  const filteredLogs = sandboxLogs
    .map((log, index) => ({ log, originalIndex: index }))
    .filter(({ log }) => {
      if (logSearchQuery.trim()) {
        const q = logSearchQuery.toLowerCase();
        const urlMatches = log.url?.toLowerCase().includes(q);
        const queryMatches = log.query?.toLowerCase().includes(q);
        const payloadMatches = log.payload?.toLowerCase().includes(q);
        const responseMatches = log.response?.toLowerCase().includes(q);
        const methodMatches = log.method?.toLowerCase().includes(q);
        const statusMatches = String(log.status).includes(q);
        if (!urlMatches && !queryMatches && !payloadMatches && !responseMatches && !methodMatches && !statusMatches) {
          return false;
        }
      }
      if (logMethodFilter !== 'ALL' && log.method !== logMethodFilter) {
        return false;
      }
      if (logStatusFilter !== 'ALL') {
        const isSuccess = log.status >= 200 && log.status < 400;
        if (logStatusFilter === 'SUCCESS' && !isSuccess) return false;
        if (logStatusFilter === 'ERROR' && isSuccess) return false;
      }
      return true;
    });

  // Filter rows inside database table view
  const activeTableRows = (activeSandboxTable && sandboxDbState[activeSandboxTable]) || [];
  const filteredTableRows = activeTableRows.filter(row => {
    if (!dbSearchQuery.trim()) return true;
    const q = dbSearchQuery.toLowerCase();
    return Object.values(row).some(val => {
      const strVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
      return strVal.toLowerCase().includes(q);
    });
  });

  return (
    <div className="space-y-6 text-left font-sans" id="runtime-tab-view">
      {/* Title Header with telemetry action controls */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[#141417] p-5 rounded-xl border border-[#222228]">
        <div className="text-left space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Activity className="h-5 w-5 text-indigo-500 animate-pulse" />
            Live SQL & HTTP Sandbox Runtime
          </h2>
          <p className="text-xs text-slate-400">
            A fully-functional sandbox executing dynamic code controllers with automatic memory state updates and SQL logging.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSandboxConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1f] hover:bg-[#22222a] text-slate-200 border border-[#2d2d37] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
            Refresh Telemetry
          </button>
          <button
            onClick={handleSandboxReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 hover:text-rose-350 border border-rose-900/60 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset SQL State
          </button>
        </div>
      </div>

      {/* Telemetry Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#141417] rounded-xl border border-[#222228] text-xs font-mono">
        <div className="flex items-center gap-2.5 p-2 bg-[#1a1a1f] rounded-lg border border-[#262630]">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-sans font-semibold">SERVER STATUS</div>
            <div className="text-emerald-400 font-bold">ONLINE (v22.2)</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-2 bg-[#1a1a1f] rounded-lg border border-[#262630]">
          <Activity className="h-4 w-4 text-indigo-400 animate-pulse" />
          <div>
            <div className="text-[10px] text-slate-500 font-sans font-semibold">ACTIVE TRACES</div>
            <div className="text-indigo-300 font-bold">{sandboxLogs.length} traces</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-2 bg-[#1a1a1f] rounded-lg border border-[#262630]">
          <Database className="h-4 w-4 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-500 font-sans font-semibold">SQL ENGINE</div>
            <div className="text-cyan-300 font-bold">SQLite In-Memory</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-2 bg-[#1a1a1f] rounded-lg border border-[#262630]">
          <span className="text-amber-400 font-bold font-sans text-xs">⚡</span>
          <div>
            <div className="text-[10px] text-slate-500 font-sans font-semibold">LATENCY (AVG)</div>
            <div className="text-amber-300 font-bold">
              {sandboxLogs.length > 0
                ? `${Math.round(sandboxLogs.reduce((acc, log) => acc + (log.responseTime || 0), 0) / sandboxLogs.length)}ms`
                : "0ms"}
            </div>
          </div>
        </div>
      </div>

      {/* Address Bar & Quick cURL Generator */}
      <div className="bg-[#141417] p-5 rounded-xl border border-[#222228] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#222228] pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Sandbox Endpoint Router</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-[#1a1a1f] border border-[#222228] px-2 py-0.5 rounded">
            Base Path: /api/sandbox/{activeProject?.projectName.toLowerCase()}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex border-b border-[#222228] gap-2">
            <button
              onClick={() => setAddressBarTab('url')}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                addressBarTab === 'url' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              API Base URL
            </button>
            <button
              onClick={() => setAddressBarTab('curl-get')}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                addressBarTab === 'curl-get' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              cURL GET Test
            </button>
            <button
              onClick={() => setAddressBarTab('curl-post')}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                addressBarTab === 'curl-post' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              cURL POST Test
            </button>
          </div>

          {addressBarTab === 'url' && (
            <div className="flex items-center gap-2 bg-[#0f0f13] p-2.5 rounded-lg border border-[#1e1e24] font-mono text-xs text-indigo-300 justify-between">
              <span className="select-all overflow-x-auto truncate pr-2">
                {window.location.origin}/api/sandbox/{activeProject?.projectName.toLowerCase()}
              </span>
              <button
                onClick={() => copyTextToClipboard(`${window.location.origin}/api/sandbox/${activeProject?.projectName.toLowerCase()}`, 'baseUrl')}
                className="text-slate-400 hover:text-white transition-colors ml-4 p-1.5 rounded bg-[#1a1a1f] border border-[#262630] hover:bg-[#22222a] shrink-0 cursor-pointer"
              >
                {copyFeedback === 'baseUrl' ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          )}

          {addressBarTab === 'curl-get' && (
            <div className="flex items-center gap-2 bg-[#0f0f13] p-2.5 rounded-lg border border-[#1e1e24] font-mono text-xs text-amber-300 justify-between">
              <span className="select-all overflow-x-auto truncate pr-2">
                curl -X GET "{window.location.origin}/api/sandbox/{activeProject?.projectName.toLowerCase()}{firstGetEndpoint.url}"
              </span>
              <button
                onClick={() => copyTextToClipboard(`curl -X GET "${window.location.origin}/api/sandbox/${activeProject?.projectName.toLowerCase()}${firstGetEndpoint.url}"`, 'curl-get')}
                className="text-slate-400 hover:text-white transition-colors ml-4 p-1.5 rounded bg-[#1a1a1f] border border-[#262630] hover:bg-[#22222a] shrink-0 cursor-pointer"
              >
                {copyFeedback === 'curl-get' ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          )}

          {addressBarTab === 'curl-post' && (
            <div className="flex items-center gap-2 bg-[#0f0f13] p-2.5 rounded-lg border border-[#1e1e24] font-mono text-xs text-emerald-300 justify-between">
              <span className="select-all overflow-x-auto truncate pr-2">
                curl -X POST "{window.location.origin}/api/sandbox/{activeProject?.projectName.toLowerCase()}{firstPostEndpoint.url}" -H "Content-Type: application/json" -d '{firstPostPayload}'
              </span>
              <button
                onClick={() => copyTextToClipboard(`curl -X POST "${window.location.origin}/api/sandbox/${activeProject?.projectName.toLowerCase()}${firstPostEndpoint.url}" -H "Content-Type: application/json" -d '${firstPostPayload}'`, 'curl-post')}
                className="text-slate-400 hover:text-white transition-colors ml-4 p-1.5 rounded bg-[#1a1a1f] border border-[#262630] hover:bg-[#22222a] shrink-0 cursor-pointer"
              >
                {copyFeedback === 'curl-post' ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          )}

          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            To manipulate the relational sandbox database, trigger live HTTP client calls directly from your CLI, browser, or local workspace scripts. The server will dynamically execute simulated controllers and record SQL statements.
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live HTTP Request Console (Real-time logs debugger) */}
        <div className="lg:col-span-5 bg-[#141417] p-5 rounded-xl border border-[#222228] space-y-4 flex flex-col h-[650px]">
          <div className="flex justify-between items-center border-b border-[#222228] pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Live Request Console</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-mono">Telemetry Active</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="space-y-2.5 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter logs by URL, SQL, or JSON..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#1a1a1f] border border-[#262630] rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <div className="absolute left-2.5 top-2.5 text-slate-500">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {logSearchQuery && (
                <button
                  onClick={() => setLogSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 gap-1 flex-wrap">
              <div className="flex gap-1">
                {(['ALL', 'GET', 'POST', 'PUT', 'DELETE'] as const).map((method) => {
                  let activeStyle = "bg-indigo-950 text-indigo-400 font-bold border-indigo-900";
                  let inactiveStyle = "bg-[#1a1a1f] text-slate-400 border-[#262630] hover:text-slate-200 hover:bg-[#22222a]";
                  
                  return (
                    <button
                      key={method}
                      onClick={() => setLogMethodFilter(method)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                        logMethodFilter === method ? activeStyle : inactiveStyle
                      }`}
                    >
                      {method}
                    </button>
                  );
                })}
              </div>
              
              <select
                value={logStatusFilter}
                onChange={(e: any) => setLogStatusFilter(e.target.value)}
                className="px-2 py-0.5 bg-[#1a1a1f] border border-[#262630] rounded text-[10px] font-mono text-slate-350 focus:outline-none"
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="SUCCESS">2xx/3xx SUCCESS</option>
                <option value="ERROR">4xx/5xx ERRORS</option>
              </select>
            </div>
          </div>

          {/* Logs list container */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 border border-dashed border-[#262630] rounded-xl space-y-3 bg-[#1a1a1f]/30">
                <div className="bg-[#1a1a1f] text-slate-500 p-3 rounded-full h-10 w-10 flex items-center justify-center">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300">No incoming network traces</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed mt-1">
                    {sandboxLogs.length === 0 
                      ? 'Use the Swagger API Inspector to trigger simulated traffic, or curl the sandbox base URL.'
                      : 'Try clearing your filters or query to show all traces.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredLogs.map(({ log, originalIndex }) => {
                const isExpanded = expandedLogIndex === originalIndex;
                const isSuccess = log.status >= 200 && log.status < 400;
                const isPost = log.method === "POST";
                const isDelete = log.method === "DELETE";
                const isPut = log.method === "PUT";

                let methodBadge = "bg-sky-950/40 text-sky-400 border-sky-900/60";
                if (isPost) methodBadge = "bg-emerald-950/40 text-emerald-400 border-emerald-900/60";
                if (isDelete) methodBadge = "bg-rose-950/40 text-rose-400 border-rose-900/60";
                if (isPut) methodBadge = "bg-amber-950/40 text-amber-400 border-amber-900/60";

                const activeDetailTab = logDetailTabs[originalIndex] || 'sql';

                return (
                  <div
                    key={originalIndex}
                    className={`border rounded-lg transition-all overflow-hidden bg-[#1a1a1f]/50 text-left ${
                      isExpanded ? 'border-indigo-900 bg-[#16161c]' : 'border-[#222228] hover:border-[#2d2d38] hover:bg-[#1a1a1f]/80'
                    }`}
                  >
                    {/* Log Header */}
                    <div
                      onClick={() => setExpandedLogIndex(isExpanded ? null : originalIndex)}
                      className="p-2.5 flex items-center justify-between cursor-pointer text-xs font-mono select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${methodBadge} tracking-wide`}>
                          {log.method}
                        </span>
                        <span className="text-slate-200 font-bold truncate text-[11px] max-w-[130px] sm:max-w-[180px]" title={log.url}>
                          {log.url}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSuccess ? 'bg-emerald-950/30 text-emerald-400' : 'bg-rose-950/30 text-rose-400'
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {log.responseTime}ms
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Log Details */}
                    {isExpanded && (
                      <div className="border-t border-[#222228] bg-[#0c0c0f]">
                        <div className="flex border-b border-[#222228] bg-[#141417]/80 px-2 pt-1 text-[10px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogDetailTabs(prev => ({ ...prev, [originalIndex]: 'sql' }));
                            }}
                            className={`px-3 py-1 font-mono font-semibold border-b-2 transition-colors cursor-pointer ${
                              activeDetailTab === 'sql' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            SQL Query
                          </button>
                          {log.payload && log.payload !== "{}" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLogDetailTabs(prev => ({ ...prev, [originalIndex]: 'request' }));
                              }}
                              className={`px-3 py-1 font-mono font-semibold border-b-2 transition-colors cursor-pointer ${
                                activeDetailTab === 'request' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              Request Payload
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogDetailTabs(prev => ({ ...prev, [originalIndex]: 'response' }));
                            }}
                            className={`px-3 py-1 font-mono font-semibold border-b-2 transition-colors cursor-pointer ${
                              activeDetailTab === 'response' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Response Body
                          </button>
                        </div>

                        <div className="p-3 text-[11px] text-left">
                          {activeDetailTab === 'sql' && (
                            <div className="space-y-1.5 relative">
                              <div className="flex justify-between items-center text-[9px] text-slate-500">
                                <span>PERSISTENCE LAYER QUERY</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyTextToClipboard(log.query || "No query", `log-query-${originalIndex}`);
                                  }}
                                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer bg-[#141417] border border-[#222228] px-1.5 py-0.5 rounded text-slate-400"
                                >
                                  {copyFeedback === `log-query-${originalIndex}` ? (
                                    <>
                                      <Check className="h-2.5 w-2.5 text-emerald-400" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-2.5 w-2.5" />
                                      Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="bg-[#0f0f13] border border-[#1e1e24] p-2.5 rounded-lg overflow-x-auto text-[11px] leading-relaxed">
                                {highlightSQL(log.query)}
                              </div>
                            </div>
                          )}

                          {activeDetailTab === 'request' && (
                            <div className="space-y-1.5 relative">
                              <div className="flex justify-between items-center text-[9px] text-slate-500">
                                <span>HTTP REQUEST PAYLOAD (JSON)</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyTextToClipboard(log.payload || "{}", `log-payload-${originalIndex}`);
                                  }}
                                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer bg-[#141417] border border-[#222228] px-1.5 py-0.5 rounded text-slate-400"
                                >
                                  {copyFeedback === `log-payload-${originalIndex}` ? (
                                    <>
                                      <Check className="h-2.5 w-2.5 text-emerald-400" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-2.5 w-2.5" />
                                      Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="bg-[#0f0f13] border border-[#1e1e24] p-2.5 rounded-lg overflow-x-auto text-[11px]">
                                {highlightJSON(log.payload)}
                              </div>
                            </div>
                          )}

                          {activeDetailTab === 'response' && (
                            <div className="space-y-1.5 relative">
                              <div className="flex justify-between items-center text-[9px] text-slate-500">
                                <span>HTTP RESPONSE BODY (JSON)</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyTextToClipboard(log.response || "{}", `log-response-${originalIndex}`);
                                  }}
                                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer bg-[#141417] border border-[#222228] px-1.5 py-0.5 rounded text-slate-400"
                                >
                                  {copyFeedback === `log-response-${originalIndex}` ? (
                                    <>
                                      <Check className="h-2.5 w-2.5 text-emerald-400" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-2.5 w-2.5" />
                                      Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="bg-[#0f0f13] border border-[#1e1e24] p-2.5 rounded-lg overflow-x-auto text-[11px]">
                                {highlightJSON(log.response)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Database Table Inspector (DBeaver style DB client) */}
        <div className="lg:col-span-7 bg-[#141417] p-5 rounded-xl border border-[#222228] space-y-4 flex flex-col h-[650px]">
          <div className="flex justify-between items-center border-b border-[#222228] pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">In-Memory SQL Tables</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono bg-[#1a1a1f] border border-[#222228] px-2 py-0.5 rounded">
                Active Schemas: {Object.keys(sandboxDbState || {}).length}
              </span>
            </div>
          </div>

          {/* Table Tab Selector */}
          <div className="flex flex-wrap gap-1.5 bg-[#1a1a1f] p-1.5 rounded-lg border border-[#262630] justify-start shrink-0">
            {Object.keys(sandboxDbState || {}).length === 0 ? (
              <span className="text-xs text-slate-400 p-2 font-sans italic">No active tables found in this project's database model.</span>
            ) : (
              Object.keys(sandboxDbState).map(tbl => (
                <button
                  key={tbl}
                  onClick={() => setActiveSandboxTable(tbl)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    activeSandboxTable === tbl
                      ? "bg-[#141417] text-indigo-400 border-indigo-900 shadow-sm"
                      : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#22222a]"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                  {tbl}
                  <span className="ml-1 text-[10px] bg-[#22222a] border border-[#2d2d37] text-slate-350 px-1.5 py-0.25 rounded-full font-mono">
                    {sandboxDbState[tbl]?.length || 0}
                  </span>
                </button>
              ))
            )}
          </div>

          {activeSandboxTable && sandboxDbState[activeSandboxTable] && (
            <div className="flex-1 flex flex-col min-h-0 space-y-3">
              {/* Table Toolbar controls: Search and JSON exports */}
              <div className="flex justify-between items-center gap-2 shrink-0">
                <div className="relative flex-1 max-w-xs sm:max-w-sm">
                  <input
                    type="text"
                    placeholder={`Search rows in ${activeSandboxTable}...`}
                    value={dbSearchQuery}
                    onChange={(e) => setDbSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#1a1a1f] border border-[#262630] rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="absolute left-2.5 top-2.5 text-slate-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {dbSearchQuery && (
                    <button
                      onClick={() => setDbSearchQuery("")}
                      className="absolute right-2.5 top-2.5 text-slate-450 hover:text-white text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(sandboxDbState[activeSandboxTable], null, 2);
                    copyTextToClipboard(dataStr, `table-csv-${activeSandboxTable}`);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1f] hover:bg-[#22222a] border border-[#262630] text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {copyFeedback === `table-csv-${activeSandboxTable}` ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied JSON!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Table JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* Database Grid view */}
              <div className="flex-1 border border-[#222228] bg-[#0c0c0f] rounded-lg overflow-hidden flex flex-col min-h-0">
                {sandboxDbState[activeSandboxTable].length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
                    <Database className="h-8 w-8 text-slate-600 mb-2.5 opacity-60 animate-pulse" />
                    <span>Table <strong className="font-mono text-indigo-400">{activeSandboxTable}</strong> is currently empty.</span>
                    <span className="text-[10px] text-slate-500 mt-1 max-w-xs">Run a POST or PUT API request from the swagger client to populate records here automatically!</span>
                  </div>
                ) : filteredTableRows.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
                    <svg className="h-8 w-8 text-slate-600 mb-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>No records found matching "{dbSearchQuery}"</span>
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-[#222228] font-mono text-xs text-left relative">
                      <thead className="bg-[#141417] sticky top-0 z-10 border-b border-[#222228]">
                        <tr>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                            #
                          </th>
                          {Object.keys(sandboxDbState[activeSandboxTable][0]).map(key => {
                            const isPK = key.toLowerCase() === 'id' || key.toLowerCase().endsWith('_id');
                            return (
                              <th
                                key={key}
                                className="px-4 py-2.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono"
                              >
                                <div className="flex items-center gap-1">
                                  {isPK && <span className="text-cyan-400">🔑</span>}
                                  {key}
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e1e24] bg-[#0c0c0f]">
                        {filteredTableRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#1a1a24]/30 transition-colors">
                            <td className="px-4 py-2 text-slate-500 font-mono text-[11px] border-r border-[#1e1e24]">
                              {idx + 1}
                            </td>
                            {Object.entries(row).map(([key, val]: any) => {
                              const isPK = key.toLowerCase() === 'id' || key.toLowerCase().endsWith('_id');
                              let strVal = String(val);
                              if (typeof val === "object" && val !== null) {
                                strVal = JSON.stringify(val);
                              }
                              
                              let cellStyle = "text-slate-300";
                              if (isPK) cellStyle = "text-cyan-400 font-bold";
                              else if (typeof val === 'number') cellStyle = "text-sky-400";
                              else if (typeof val === 'boolean') cellStyle = "text-amber-400";
                              else if (val === null) cellStyle = "text-slate-500 italic";
                              
                              return (
                                <td
                                  key={key}
                                  className={`px-4 py-2 font-mono text-[11px] truncate max-w-[220px] ${cellStyle}`}
                                  title={strVal}
                                >
                                  {val === null ? 'NULL' : strVal}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
