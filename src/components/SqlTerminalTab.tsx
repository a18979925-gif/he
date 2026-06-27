import React, { useState } from "react";
import { Play, RefreshCw, Terminal, AlertTriangle, CheckCircle, Database, Trash2, Key, Sparkles } from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface SqlTerminalTabProps {
  sqlQuery: string;
  setSqlQuery: (q: string) => void;
  handleExecuteSQLQuery: (queryToRun?: string) => Promise<void>;
  sqlLoading: boolean;
  sqlResults: Array<Record<string, any>> | null;
  sqlAffectedRows: number;
  sqlError: string;
  activeProject: CodeScopeAnalysis;
}

export const SqlTerminalTab: React.FC<SqlTerminalTabProps> = ({
  sqlQuery,
  setSqlQuery,
  handleExecuteSQLQuery,
  sqlLoading,
  sqlResults,
  sqlAffectedRows,
  sqlError,
  activeProject,
}) => {
  const [tableSearch, setTableSearch] = useState("");

  const lineCount = sqlQuery.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 5) }, (_, i) => i + 1);

  const filteredSchemaTables = activeProject.database?.tables?.filter((table: any) =>
    table.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
    table.columns.some((col: any) => col.name.toLowerCase().includes(tableSearch.toLowerCase()))
  ) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left animate-fade-in" id="sql-terminal-tab-view">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
          }
        }
        .sql-textarea::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .sql-textarea::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
        }
        .sql-textarea::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.4);
          border-radius: 4px;
        }
        .sql-textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.6);
        }
      `}} />

      {/* Terminal Code Workspace (Col span 3) */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Editor Top Control Bar */}
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500/80 block"></span>
                <span className="h-3 w-3 rounded-full bg-amber-500/80 block"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 block"></span>
              </div>
              <span className="text-slate-400 text-xs font-mono ml-2 hidden sm:inline">SQL Sandbox Terminal — raw query engine</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSqlQuery("")}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer font-sans"
                title="Wyczyść zapytanie"
              >
                <Trash2 className="h-3 w-3" />
                <span>Wyczyść</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteSQLQuery()}
                disabled={sqlLoading}
                className="relative group overflow-hidden bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] disabled:opacity-50 cursor-pointer font-sans"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                {sqlLoading ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Play className="h-3 w-3 fill-white text-white border-none" />
                )}
                <span>Wykonaj zapytanie</span>
              </button>
            </div>
          </div>

          {/* SQL text entry area with Line Numbers */}
          <div className="flex bg-slate-950/40 relative border-b border-slate-850">
            {/* Line Numbers */}
            <div className="flex flex-col text-right select-none pr-3 pl-4 py-4 text-[11px] font-mono text-slate-600 bg-slate-900/30 border-r border-slate-900/60 w-12 shrink-0">
              {lineNumbers.map((num) => (
                <span key={num} className="h-5 leading-5">{num}</span>
              ))}
            </div>

            {/* SQL textarea */}
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="Napisz zapytanie SQL np. SELECT * FROM users;"
              rows={5}
              wrap="off"
              className="flex-1 w-full bg-transparent text-emerald-400 font-mono text-xs p-4 outline-none resize-none focus:ring-0 leading-5 border-none block sql-textarea overflow-auto"
            />
          </div>

          {/* Helper suggestions bar */}
          <div className="bg-slate-900/50 border-t border-slate-900/60 px-4 py-2 flex flex-wrap items-center gap-2 justify-start">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold font-sans">Przykłady SQL:</span>
            <button
              type="button"
              onClick={() => setSqlQuery("SELECT * FROM users;")}
              className="bg-slate-950/60 hover:bg-cyan-500/10 border border-slate-850 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 text-[10.5px] font-mono px-2.5 py-1 rounded-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              SELECT Users
            </button>
            <button
              type="button"
              onClick={() => setSqlQuery("INSERT INTO users (username, email, role) VALUES ('tester_pro', 'test@codescope.io', 'DEVELOPER');")}
              className="bg-slate-950/60 hover:bg-emerald-500/10 border border-slate-850 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 text-[10.5px] font-mono px-2.5 py-1 rounded-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              INSERT User
            </button>
            <button
              type="button"
              onClick={() => setSqlQuery("UPDATE users SET role = 'LEAD' WHERE id = 1;")}
              className="bg-slate-950/60 hover:bg-amber-500/10 border border-slate-850 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 text-[10.5px] font-mono px-2.5 py-1 rounded-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              UPDATE User
            </button>
            <button
              type="button"
              onClick={() => setSqlQuery("CREATE TABLE logs (id INT, level TEXT, message TEXT);")}
              className="bg-slate-950/60 hover:bg-purple-500/10 border border-slate-850 hover:border-purple-500/30 text-slate-400 hover:text-purple-400 text-[10.5px] font-mono px-2.5 py-1 rounded-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              CREATE Table
            </button>
          </div>
        </div>

        {/* SQL Result Pane */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="px-5 py-4 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/40">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sqlLoading ? 'bg-cyan-400' : 'bg-slate-600'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${sqlLoading ? 'bg-cyan-500' : 'bg-slate-500'}`}></span>
              </span>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">Wyniki wykonania zapytania</h3>
            </div>
            <div className="text-[11px] text-slate-400 font-mono bg-slate-950/60 px-2 py-0.5 rounded border border-slate-855">
              {sqlResults ? (
                <>Zwrócono wierszy: <span className="text-cyan-400 font-bold">{sqlResults.length}</span></>
              ) : sqlAffectedRows > 0 ? (
                <>Zmieniono wierszy: <span className="text-emerald-400 font-bold">{sqlAffectedRows}</span></>
              ) : (
                "Brak danych"
              )}
            </div>
          </div>

          <div className="p-5">
            {sqlLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 text-cyan-500 animate-spin mb-2" />
                <span className="text-xs text-slate-400 font-sans">Przetwarzanie zapytania SQL...</span>
              </div>
            )}

            {sqlError && (
              <div className="bg-red-950/20 border border-red-900/35 text-red-200 p-4 rounded-xl text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5 font-sans text-red-400">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span>Błąd wykonania SQL</span>
                </div>
                <p className="font-mono text-red-300 bg-red-950/50 p-3 rounded-lg border border-red-900/20 mt-1.5 overflow-x-auto leading-relaxed sql-textarea">{sqlError}</p>
              </div>
            )}

            {!sqlLoading && !sqlError && sqlResults && sqlResults.length > 0 && (
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/30 sql-textarea">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-850">
                      {Object.keys(sqlResults[0]).map((key, i) => (
                        <th key={i} className="px-4 py-3 font-bold text-slate-350 font-mono tracking-wide">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sqlResults.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-855 hover:bg-slate-900/40 last:border-none transition-colors">
                        {Object.values(row).map((val: any, cellIdx) => (
                          <td key={cellIdx} className="px-4 py-3 font-mono text-slate-300">
                            {val === null || val === undefined ? (
                              <span className="text-slate-650 italic font-medium">NULL</span>
                            ) : typeof val === "object" ? (
                              <code className="text-cyan-400 text-[11px] bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800">{JSON.stringify(val)}</code>
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!sqlLoading && !sqlError && sqlResults && sqlResults.length === 0 && sqlAffectedRows === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center justify-center font-sans">
                <Terminal className="h-8 w-8 text-slate-600 mb-3 animate-pulse" />
                <span className="max-w-md leading-relaxed">Zapytanie nie zwróciło żadnych wyników. Wpisz polecenie SQL powyżej i kliknij <strong className="text-slate-300 font-semibold">Wykonaj zapytanie</strong>.</span>
              </div>
            )}

            {!sqlLoading && !sqlError && !sqlResults && sqlAffectedRows > 0 && (
              <div className="bg-emerald-950/20 border border-emerald-900/35 text-emerald-250 p-4 rounded-xl text-xs flex items-center gap-3 font-sans">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/25">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <strong className="text-emerald-300 font-bold block mb-0.5">Zapytanie wykonane pomyślnie</strong>
                  <span className="text-slate-400">Zmodyfikowano wierszy: <strong className="font-mono text-emerald-450 font-bold">{sqlAffectedRows}</strong>.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Schema Helper (Col span 1) */}
      <div className="space-y-4">
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-sans">
            <Database className="h-3.5 w-3.5 text-amber-550" />
            Baza danych projektu
          </h4>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-sans">
            Kliknij tabelę poniżej, aby automatycznie załadować dla niej zapytanie SELECT i sprawdzić jej dane w locie!
          </p>

          {/* Search bar inside Sidebar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Filtruj tabele..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full px-3 py-2 text-[11px] bg-slate-950/60 border border-slate-850 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500/40 text-slate-250 transition-all font-sans placeholder-slate-600"
            />
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 sql-textarea">
            {filteredSchemaTables.map((table: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950/40 hover:bg-indigo-950/30 rounded-xl border border-slate-850 hover:border-indigo-800/50 cursor-pointer transition-all duration-300 space-y-2 group shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.05)] relative overflow-hidden"
                onClick={() => {
                  setSqlQuery(`SELECT * FROM ${table.name};`);
                  handleExecuteSQLQuery(`SELECT * FROM ${table.name};`);
                }}
              >
                {/* Background gradient trace on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-xs font-bold text-slate-200 font-mono group-hover:text-white transition-colors">{table.name}</span>
                  </div>
                  <span className="bg-indigo-500/10 text-indigo-300 font-mono text-[9px] px-1.5 py-0.5 rounded-full border border-indigo-500/20 font-bold group-hover:bg-indigo-500/20 transition-all">
                    {table.columns.length} col
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 text-[9px] text-slate-450 justify-start relative z-10">
                  {table.columns.map((col: any, cIdx: number) => {
                    const isKey = col.name.toLowerCase().includes('id') || col.constraints?.includes('PRIMARY KEY');
                    return (
                      <span
                        key={cIdx}
                        className={`px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5 ${
                          isKey
                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            : "bg-slate-850 text-slate-400 border border-slate-800/80"
                        }`}
                      >
                        {isKey && <Key className="h-2.5 w-2.5 text-amber-400 shrink-0" />}
                        {col.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
            {(!activeProject.database?.tables || activeProject.database.tables.length === 0) && (
              <div className="text-center text-slate-550 text-xs py-6 font-sans">
                Brak schematów tabel. Napisz zapytanie CREATE TABLE w terminalu.
              </div>
            )}
            {activeProject.database?.tables && activeProject.database.tables.length > 0 && filteredSchemaTables.length === 0 && (
              <div className="text-center text-slate-550 text-xs py-6 font-sans">
                Brak wyników dla "{tableSearch}"
              </div>
            )}
          </div>
        </div>

        {/* Database Sandbox operations info */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 text-xs space-y-3 leading-relaxed shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-slate-200 font-bold uppercase tracking-wider text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-amber-550" />
            <span>Rekomendowane zapytania</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Szybkie szablony zapytań SQL do wypróbowania w piaskownicy (kliknij, aby wstawić):
          </p>
          <div className="space-y-2 mt-2">
            {[
              "SELECT * FROM users;",
              "SELECT * FROM products;",
              "SELECT * FROM orders;",
            ].map((query, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSqlQuery(query)}
                className="w-full text-left p-2 bg-slate-950/50 hover:bg-emerald-500/5 hover:border-emerald-500/20 rounded-lg border border-slate-850 transition-all font-mono text-[11px] text-slate-350 hover:text-emerald-400 flex items-center justify-between group cursor-pointer"
              >
                <span>{query}</span>
                <span className="text-[9px] text-slate-600 group-hover:text-emerald-400/80 transition-colors uppercase tracking-wider font-bold">Wstaw</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
