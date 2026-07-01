import React, { useState, useEffect, useRef } from "react";
import { 
  Database, 
  Lock, 
  ExternalLink, 
  ArrowRight, 
  Search, 
  Key, 
  Network, 
  ChevronRight, 
  Info, 
  Layers,
  HelpCircle,
  Hash,
  Copy,
  Check,
  FileCode
} from "lucide-react";
import { CodeScopeAnalysis, DBTable } from "../types";

interface DatabaseTabProps {
  activeProject: CodeScopeAnalysis;
  selectedTable: DBTable | null;
  setSelectedTable: (table: DBTable | null) => void;
}

export const DatabaseTab: React.FC<DatabaseTabProps> = ({
  activeProject,
  selectedTable,
  setSelectedTable,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [connections, setConnections] = useState<Array<{ id: string; d: string; type: string; label: string }>>([]);
  const [detailSubTab, setDetailSubTab] = useState<'fields' | 'sql'>('fields');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Filter tables by name or column names
  const filteredTables = activeProject.database?.tables?.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.columns.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Compute incoming connections: tables referencing the selectedTable
  const incomingTables = selectedTable
    ? activeProject.database?.tables?.filter(t => 
        t.name !== selectedTable.name && 
        t.relationships?.some(rel => rel.targetTable === selectedTable.name)
      ) || []
    : [];

  // Compute unique outgoing tables
  const uniqueOutgoingTables = selectedTable
    ? Array.from(new Set(
        selectedTable.relationships
          ?.map(rel => rel.targetTable)
          .filter(name => name !== selectedTable.name)
      ))
      .map(name => activeProject.database?.tables?.find(t => t.name === name))
      .filter((t): t is DBTable => !!t)
    : [];

  // Calculate layout connections
  const updatePaths = () => {
    if (!canvasRef.current || !selectedTable) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newConnections: Array<{ id: string; d: string; type: string; label: string }> = [];

    // 1. Outgoing relationships (Selected table -> Target tables)
    selectedTable.relationships?.forEach((rel) => {
      const srcEl = document.getElementById(`erd-col-${selectedTable.name}-${rel.foreignKey}`);
      
      const targetTableObj = activeProject.database?.tables?.find(t => t.name === rel.targetTable);
      const targetPk = targetTableObj?.columns.find(c => c.constraints?.includes("PRIMARY KEY")) || targetTableObj?.columns[0];
      
      const dstEl = targetPk 
        ? document.getElementById(`erd-col-${rel.targetTable}-${targetPk.name}`)
        : null;
        
      const targetEl = dstEl || document.getElementById(`erd-header-${rel.targetTable}`);

      if (srcEl && targetEl) {
        const srcRect = srcEl.getBoundingClientRect();
        const dstRect = targetEl.getBoundingClientRect();
        
        const x1 = srcRect.right - canvasRect.left;
        const y1 = srcRect.top + srcRect.height / 2 - canvasRect.top;
        const x2 = dstRect.left - canvasRect.left;
        const y2 = dstRect.top + dstRect.height / 2 - canvasRect.top;
        
        const dx = Math.min(Math.abs(x2 - x1) * 0.5, 120);
        const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
        
        newConnections.push({
          id: `${selectedTable.name}-${rel.foreignKey}-${rel.targetTable}`,
          d,
          type: rel.type,
          label: `${rel.foreignKey} → ${rel.targetTable}`
        });
      }
    });

    // 2. Incoming relationships (Incoming tables -> Selected table)
    incomingTables.forEach((incTable) => {
      incTable.relationships?.forEach((rel) => {
        if (rel.targetTable === selectedTable.name) {
          const srcEl = document.getElementById(`erd-col-${incTable.name}-${rel.foreignKey}`);
          
          const selectedPk = selectedTable.columns.find(c => c.constraints?.includes("PRIMARY KEY")) || selectedTable.columns[0];
          
          const dstEl = selectedPk 
            ? document.getElementById(`erd-col-${selectedTable.name}-${selectedPk.name}`)
            : null;
            
          const targetEl = dstEl || document.getElementById(`erd-header-${selectedTable.name}`);

          if (srcEl && targetEl) {
            const srcRect = srcEl.getBoundingClientRect();
            const dstRect = targetEl.getBoundingClientRect();
            
            const x1 = srcRect.right - canvasRect.left;
            const y1 = srcRect.top + srcRect.height / 2 - canvasRect.top;
            const x2 = dstRect.left - canvasRect.left;
            const y2 = dstRect.top + dstRect.height / 2 - canvasRect.top;
            
            const dx = Math.min(Math.abs(x2 - x1) * 0.5, 120);
            const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
            
            newConnections.push({
              id: `${incTable.name}-${rel.foreignKey}-${selectedTable.name}`,
              d,
              type: rel.type,
              label: `${incTable.name}.${rel.foreignKey} → ${selectedTable.name}`
            });
          }
        }
      });
    });

    setConnections(newConnections);
  };

  // Trigger path updates on change/observer/resize
  useEffect(() => {
    updatePaths();
    
    window.addEventListener('resize', updatePaths);
    window.addEventListener('scroll', updatePaths);
    
    let observer: MutationObserver | null = null;
    if (canvasRef.current) {
      observer = new MutationObserver(() => {
        updatePaths();
      });
      observer.observe(canvasRef.current, { childList: true, subtree: true, attributes: true });
    }

    const timer = setTimeout(updatePaths, 120);

    return () => {
      window.removeEventListener('resize', updatePaths);
      window.removeEventListener('scroll', updatePaths);
      if (observer) observer.disconnect();
      clearTimeout(timer);
    };
  }, [selectedTable, activeProject, searchQuery]);

  // Compute database wide statistics
  const totalTables = activeProject.database?.tables?.length || 0;
  const totalColumns = activeProject.database?.tables?.reduce((acc, t) => acc + t.columns.length, 0) || 0;
  const totalRelations = activeProject.database?.tables?.reduce((acc, t) => acc + (t.relationships?.length || 0), 0) || 0;

  // Helper: Get key columns vs regular columns for compact card rendering
  const getVisibleColumns = (table: DBTable) => {
    const pks = table.columns.filter(c => c.constraints?.includes("PRIMARY KEY"));
    const fks = table.columns.filter(c => table.relationships?.some(r => r.foreignKey === c.name));
    
    const keyCols = Array.from(new Set([...pks, ...fks]));
    const otherCols = table.columns.filter(c => !keyCols.includes(c));
    
    const combined = [...keyCols, ...otherCols];
    const maxToShow = 6;
    const visible = combined.slice(0, maxToShow);
    const hiddenCount = table.columns.length - visible.length;
    
    return { visible, hiddenCount };
  };

  // Helper: Data Type styles
  const getDataTypeBadgeStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("varchar") || t.includes("text") || t.includes("string") || t.includes("char")) {
      return "text-purple-400 bg-purple-950/40 border border-purple-800/40";
    }
    if (t.includes("int") || t.includes("number") || t.includes("float") || t.includes("decimal") || t.includes("double") || t.includes("numeric") || t.includes("serial") || t.includes("bigint")) {
      return "text-cyan-400 bg-cyan-950/40 border border-cyan-800/40";
    }
    if (t.includes("bool")) {
      return "text-amber-400 bg-amber-950/40 border border-amber-800/40";
    }
    if (t.includes("date") || t.includes("time") || t.includes("stamp")) {
      return "text-emerald-400 bg-emerald-950/40 border border-emerald-800/40";
    }
    return "text-slate-400 bg-slate-800 border border-slate-700/40";
  };

  // Helper: Constraints badge parser
  const renderConstraintBadges = (constraints?: string) => {
    if (!constraints) return <span className="text-slate-650 font-sans">-</span>;
    
    const badges: string[] = [];
    if (constraints.includes("PRIMARY KEY")) badges.push("PRIMARY KEY");
    if (constraints.includes("FOREIGN KEY")) badges.push("FOREIGN KEY");
    if (constraints.includes("NOT NULL")) badges.push("NOT NULL");
    if (constraints.includes("UNIQUE")) badges.push("UNIQUE");
    
    const remaining = constraints
      .replace("PRIMARY KEY", "")
      .replace("FOREIGN KEY", "")
      .replace("NOT NULL", "")
      .replace("UNIQUE", "")
      .trim();
      
    if (remaining && remaining !== "-" && remaining !== ",") {
      badges.push(remaining);
    }
    
    return (
      <div className="flex flex-wrap gap-1">
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

        {badges.map((badge, idx) => {
          let style = "bg-slate-800 text-slate-400";
          if (badge === "PRIMARY KEY") {
            style = "bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.15)]";
          } else if (badge === "FOREIGN KEY") {
            style = "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shadow-[0_0_8px_rgba(99,102,241,0.15)]";
          } else if (badge === "NOT NULL") {
            style = "bg-rose-500/5 text-rose-450 border border-rose-500/20";
          } else if (badge === "UNIQUE") {
            style = "bg-emerald-500/10 text-emerald-455 border border-emerald-500/25";
          }
          return (
            <span key={idx} className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold tracking-wider ${style}`}>
              {badge}
            </span>
          );
        })}
      </div>
    );
  };

  // Generate CREATE TABLE SQL Query DDL block
  const generateSQLCode = (table: DBTable) => {
    let sql = `CREATE TABLE ${table.name} (\n`;
    table.columns.forEach((col, idx) => {
      const isLast = idx === table.columns.length - 1;
      const colConstraint = col.constraints ? ` ${col.constraints}` : "";
      sql += `  ${col.name.padEnd(20)} ${col.type.toUpperCase()}${colConstraint}`;
      sql += isLast && (!table.relationships || table.relationships.length === 0) ? "" : ",\n";
    });
    
    if (table.relationships && table.relationships.length > 0) {
      table.relationships.forEach((rel, idx) => {
        const isLast = idx === table.relationships.length - 1;
        sql += `  CONSTRAINT fk_${table.name}_${rel.foreignKey} FOREIGN KEY (${rel.foreignKey}) REFERENCES ${rel.targetTable}(id)`;
        sql += isLast ? "" : ",\n";
      });
      sql += "\n";
    }
    sql += ");";
    return sql;
  };

  const handleCopySQL = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reusable Table Card Component inside the canvas
  const ERDTableCard = ({ table, isSelected, role }: { table: DBTable, isSelected: boolean, role: 'source' | 'target' | 'selected', key?: any }) => {
    const { visible, hiddenCount } = getVisibleColumns(table);
    
    return (
      <div 
        onClick={() => !isSelected && setSelectedTable(table)}
        className={`rounded-2xl border transition-all duration-300 text-left bg-slate-900/90 backdrop-blur w-full shadow-2xl ${
          isSelected 
            ? "border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.3)] ring-1 ring-indigo-500/50" 
            : "border-slate-800/80 hover:border-slate-700/90 cursor-pointer hover:shadow-indigo-950/20 hover:scale-[1.02]"
        }`}
      >
        {/* Card Header */}
        <div 
          id={`erd-header-${table.name}`}
          className={`px-4 py-3 border-b rounded-t-2xl flex items-center justify-between ${
            isSelected 
              ? "bg-gradient-to-r from-indigo-950/90 to-indigo-900/40 border-indigo-500/30" 
              : "bg-slate-950/80 border-slate-800/60"
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Database className={`h-4 w-4 shrink-0 ${isSelected ? "text-indigo-400 animate-pulse" : "text-slate-500"}`} />
            <span className="text-xs font-mono font-bold text-slate-100 truncate" title={table.name}>
              {table.name}
            </span>
          </div>
          {role !== 'selected' && (
            <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-semibold shrink-0 uppercase tracking-wider">
              {role === 'source' ? 'incoming' : 'outgoing'}
            </span>
          )}
        </div>

        {/* Columns List */}
        <div className="divide-y divide-slate-800/30">
          {(isSelected ? table.columns : visible).map((col, idx) => {
            const isPk = col.constraints?.includes("PRIMARY KEY");
            const isFk = table.relationships?.some(r => r.foreignKey === col.name);
            return (
              <div 
                key={idx}
                id={`erd-col-${table.name}-${col.name}`}
                className={`flex items-center justify-between px-4 py-2 hover:bg-slate-850/50 transition-colors text-[10px] font-mono group ${
                  isPk ? "bg-amber-95/5" : isFk ? "bg-indigo-95/5" : ""
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {isPk ? (
                    <Key className="h-3.5 w-3.5 text-amber-400 shrink-0 filter drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]" />
                  ) : isFk ? (
                    <ExternalLink className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600 group-hover:bg-slate-400 shrink-0 ml-1" />
                  )}
                  <span className={`font-bold truncate transition-colors ${
                    isPk ? "text-amber-200" : isFk ? "text-indigo-200" : "text-slate-300 group-hover:text-white"
                  }`}>
                    {col.name}
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 font-semibold group-hover:text-slate-400 ml-3">
                  {col.type.toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hidden Columns Indicator */}
        {!isSelected && hiddenCount > 0 && (
          <div className="px-4 py-2 bg-slate-950/40 rounded-b-2xl text-[9px] text-slate-500 font-mono text-center border-t border-slate-800/30">
            + {hiddenCount} other attributes hidden
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Injected custom styles for animations */}
      <style>{`
        @keyframes erdFlow {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        .erd-flow-line-animated {
          stroke-dasharray: 6 6;
          animation: erdFlow 1.5s linear infinite;
        }
        .canvas-bg-mesh {
          background-color: #080b12;
          background-image: 
            radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.08) 1.5px, transparent 0),
            linear-gradient(to right, rgba(99,102,241,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99,102,241,0.02) 1px, transparent 1px);
          background-size: 16px 16px, 32px 32px, 32px 32px;
        }
      `}</style>

      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">
              Database Reverse ERD Model
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Relational DB Engine Visualizer
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Live interactive entity relationship mapper parsed from project codebase ORM specifications, schema definitions, and model scripts.
          </p>
        </div>

        {/* Global Database Stats Grid */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-xl text-left min-w-[85px] hover:border-indigo-500/30 transition-all duration-300">
            <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">Tables</span>
            <span className="text-base font-black font-mono text-indigo-400">
              {totalTables}
            </span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-xl text-left min-w-[85px] hover:border-pink-500/30 transition-all duration-300">
            <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">Relations</span>
            <span className="text-base font-black font-mono text-pink-400">
              {totalRelations}
            </span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-xl text-left min-w-[85px] hover:border-emerald-500/30 transition-all duration-300">
            <span className="text-[9px] text-slate-500 uppercase font-black block tracking-wider">Columns</span>
            <span className="text-base font-black font-mono text-emerald-400">
              {totalColumns}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tables list on left */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl lg:col-span-4 flex flex-col h-full min-h-[500px]">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block mb-3.5 text-left">
              Relational Tables Catalog
            </span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search tables or attributes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-250 transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[600px] mt-4 pr-1">
            {filteredTables.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl">
                <Database className="h-6 w-6 text-slate-400 dark:text-slate-650 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-slate-500 dark:text-slate-450">No tables match search query</p>
              </div>
            ) : (
              filteredTables.map((table, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTable(table)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                    selectedTable?.name === table.name
                      ? "bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                      : "bg-slate-900/40 hover:bg-slate-800/60 border-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Database className={`h-4 w-4 shrink-0 transition-colors ${
                      selectedTable?.name === table.name 
                        ? "text-indigo-505" 
                        : "text-slate-400 dark:text-slate-505 group-hover:text-indigo-400"
                     }`} />
                    <div className="flex flex-col">
                      <span className={`text-xs font-mono font-bold transition-colors ${
                        selectedTable?.name === table.name 
                          ? "text-indigo-300" 
                          : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                      }`}>
                        {table.name}
                      </span>
                      <span className="text-[9px] text-slate-450 dark:text-slate-505 font-sans mt-0.5">
                        {table.relationships?.length || 0} mapping{(table.relationships?.length || 0) !== 1 && 's'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold transition-colors ${
                    selectedTable?.name === table.name
                      ? "bg-indigo-900/50 text-indigo-300"
                      : "bg-slate-200/55 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}>
                    {table.columns.length} columns
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detailed column & relationship ERD view */}
        {selectedTable ? (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Visual ERD Lineage Map */}
            <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider font-mono">
                    Visual Schema Lineage Path
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>Click related tables to navigate</span>
                </div>
              </div>

              {/* ERD Canvas Wrapper */}
              <div className="overflow-x-auto overflow-y-hidden border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-950">
                <div 
                  ref={canvasRef}
                  className="relative p-6 min-h-[390px] flex items-center justify-between select-none min-w-[760px] gap-12 canvas-bg-mesh"
                >
                  {/* SVG paths layer */}
                  <svg className="absolute inset-0 pointer-events-none w-full h-full">
                    <defs>
                      <linearGradient id="grad-one-to-many" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                      <linearGradient id="grad-many-to-one" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                      <linearGradient id="grad-one-to-one" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                      <linearGradient id="grad-many-to-many" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </linearGradient>
                      <linearGradient id="grad-default" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    
                    {connections.map((conn) => {
                      let gradUrl = "url(#grad-default)";
                      if (conn.type === "one-to-many") gradUrl = "url(#grad-one-to-many)";
                      else if (conn.type === "many-to-one") gradUrl = "url(#grad-many-to-one)";
                      else if (conn.type === "one-to-one") gradUrl = "url(#grad-one-to-one)";
                      else if (conn.type === "many-to-many") gradUrl = "url(#grad-many-to-many)";
                      
                      return (
                        <g key={conn.id} className="group/line">
                          {/* Hover track */}
                          <path 
                            d={conn.d} 
                            fill="none" 
                            stroke="transparent" 
                            strokeWidth={8} 
                            className="cursor-pointer pointer-events-auto"
                          />
                          {/* Inner dark contrast line */}
                          <path 
                            d={conn.d} 
                            fill="none" 
                            stroke="#020617" 
                            strokeWidth={4.5} 
                          />
                          {/* Glow background line */}
                          <path 
                            d={conn.d} 
                            fill="none" 
                            stroke={gradUrl} 
                            strokeWidth={3} 
                            className="opacity-20 blur-[2px]" 
                          />
                          {/* Animated flow line */}
                          <path 
                            d={conn.d} 
                            fill="none" 
                            stroke={gradUrl} 
                            strokeWidth={1.5} 
                            className="erd-flow-line-animated opacity-75 group-hover/line:opacity-100 group-hover/line:stroke-[2px] transition-all"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Left: Incoming Table Cards */}
                  <div className="flex flex-col gap-4 w-52 shrink-0 z-10 relative">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center border-b border-slate-900/60 pb-1 mb-1 font-mono">
                      Incoming Links ({incomingTables.length})
                    </div>
                    {incomingTables.slice(0, 2).map((tbl, i) => (
                      <ERDTableCard key={i} table={tbl} isSelected={false} role="source" />
                    ))}
                    {incomingTables.length > 2 && (
                      <div className="p-3 bg-slate-900/50 border border-dashed border-slate-800/80 rounded-2xl text-center">
                        <span className="text-[10px] text-slate-500 font-mono">
                          + {incomingTables.length - 2} more incoming
                        </span>
                      </div>
                    )}
                    {incomingTables.length === 0 && (
                      <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-900/40 rounded-2xl bg-slate-950/25">
                        <span className="text-[10px] text-slate-600 italic font-sans">No incoming links</span>
                      </div>
                    )}
                  </div>

                  {/* Center: Selected Table Card */}
                  <div className="w-60 shrink-0 z-10 relative">
                    <div className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider text-center border-b border-indigo-950/80 pb-1 mb-1 font-mono">
                      Active focus table
                    </div>
                    <ERDTableCard table={selectedTable} isSelected={true} role="selected" />
                  </div>

                  {/* Right: Outgoing Table Cards */}
                  <div className="flex flex-col gap-4 w-52 shrink-0 z-10 relative">
                    <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center border-b border-slate-900/60 pb-1 mb-1 font-mono">
                      Outgoing Links ({uniqueOutgoingTables.length})
                    </div>
                    {uniqueOutgoingTables.slice(0, 2).map((tbl, i) => (
                      <ERDTableCard key={i} table={tbl} isSelected={false} role="target" />
                    ))}
                    {uniqueOutgoingTables.length > 2 && (
                      <div className="p-3 bg-slate-900/50 border border-dashed border-slate-800/80 rounded-2xl text-center">
                        <span className="text-[10px] text-slate-500 font-mono">
                          + {uniqueOutgoingTables.length - 2} more outgoing
                        </span>
                      </div>
                    )}
                    {uniqueOutgoingTables.length === 0 && (
                      <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-900/40 rounded-2xl bg-slate-950/25">
                        <span className="text-[10px] text-slate-600 italic font-sans">No outgoing links</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* Specification Sub-Tab Section */}
            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
                <div className="flex items-center gap-2.5 text-left">
                  <Database className="h-4.5 w-4.5 text-indigo-400" />
                  <h3 className="text-sm font-extrabold font-mono text-slate-100 uppercase tracking-wider">
                    Specification: {selectedTable.name}
                  </h3>
                </div>
                
                {/* Sub-tabs selector */}
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
                  <button
                    onClick={() => setDetailSubTab('fields')}
                    className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
                      detailSubTab === 'fields' 
                        ? 'bg-white dark:bg-slate-900 text-indigo-500 dark:text-indigo-400 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-205'
                    }`}
                  >
                    Fields Dictionary
                  </button>
                  <button
                    onClick={() => setDetailSubTab('sql')}
                    className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      detailSubTab === 'sql' 
                        ? 'bg-white dark:bg-slate-900 text-indigo-500 dark:text-indigo-400 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-205'
                    }`}
                  >
                    <FileCode className="h-3 w-3" /> SQL DDL Code
                  </button>
                </div>
              </div>

              {detailSubTab === 'fields' ? (
                <div>
                  <div className="border border-slate-850 rounded-2xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/40 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider text-[9px] font-sans">
                          <th className="p-3.5 pl-5">Field Name</th>
                          <th className="p-3.5">Data Type</th>
                          <th className="p-3.5 pr-5">Constraints</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 dark:divide-slate-850/60 font-mono">
                        {selectedTable.columns.map((col, idx) => {
                          const isPk = col.constraints?.includes("PRIMARY KEY");
                          const isFk = selectedTable.relationships?.some(r => r.foreignKey === col.name);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                              <td className="p-3.5 pl-5 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                {isPk ? (
                                  <Key className="h-3.5 w-3.5 text-amber-550 shrink-0 filter drop-shadow-[0_0_2px_rgba(245,158,11,0.4)]" title="Primary Key" />
                                ) : isFk ? (
                                  <ExternalLink className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" title="Foreign Key" />
                                ) : (
                                  <Hash className="h-3.5 w-3.5 text-slate-500 dark:text-slate-600 shrink-0" />
                                )}
                                <span>{col.name}</span>
                              </td>
                              <td className="p-3.5 font-mono">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold tracking-wider ${getDataTypeBadgeStyle(col.type)}`}>
                                  {col.type}
                                </span>
                              </td>
                              <td className="p-3.5 pr-5 font-sans">
                                {renderConstraintBadges(col.constraints)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Dynamic SQL CREATE TABLE Code Block */
                <div className="relative group/code text-left">
                  <div className="absolute right-4 top-4 z-20">
                    <button
                      onClick={() => handleCopySQL(generateSQLCode(selectedTable))}
                      className="p-2 bg-slate-900 hover:bg-indigo-950 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors flex items-center gap-1.5 text-[10px] font-bold font-mono cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>COPIED!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>COPY SQL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-[#02050b] p-5 pt-12 rounded-2xl border border-slate-850 font-mono text-[11px] text-indigo-200 overflow-x-auto leading-relaxed select-text shadow-inner max-h-96">
                    <code>
                      {generateSQLCode(selectedTable)}
                    </code>
                  </pre>
                </div>
              )}

              {/* Relationships details block */}
              {selectedTable.relationships?.length > 0 && (
                <div className="pt-2 text-left">
                  <span className="text-[10px] text-slate-400 dark:text-slate-505 uppercase font-black tracking-wider block mb-3.5 font-mono">
                    Schema Relational Constraints
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTable.relationships.map((rel, idx) => {
                      const targetTableObj = activeProject.database?.tables?.find(t => t.name === rel.targetTable);
                      return (
                        <div 
                          key={idx} 
                          className="bg-slate-900/50 p-4.5 rounded-2xl border border-slate-800/80 flex flex-col justify-between hover:shadow-xl hover:border-indigo-500/20 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-3.5">
                            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                              Mapped Relationship
                            </span>
                            <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                              rel.type === 'one-to-many' ? 'bg-indigo-955/60 text-indigo-300 border border-indigo-500/20' :
                              rel.type === 'many-to-one' ? 'bg-purple-955/60 text-purple-300 border border-purple-500/20' :
                              rel.type === 'one-to-one' ? 'bg-emerald-955/60 text-emerald-300 border border-emerald-500/20' :
                              'bg-amber-955/60 text-amber-350 border border-amber-500/20'
                            }`}>
                              {rel.type}
                            </span>
                          </div>

                          <div className="space-y-3.5">
                            <div className="flex items-center gap-2.5 text-xs text-left">
                              <span className="text-slate-500 dark:text-slate-400">Linked Field:</span>
                              <code className="font-mono font-bold bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800/60 text-indigo-400">
                                {rel.foreignKey}
                              </code>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-150 dark:border-slate-850">
                              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                                <span className="text-slate-650 dark:text-slate-450">{selectedTable.name}</span>
                                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                                <span className="bg-indigo-955 text-indigo-300 border border-indigo-900 px-2 py-0.5 rounded font-mono text-[10px]">
                                  {rel.targetTable}
                                </span>
                              </div>

                              {targetTableObj && (
                                <button
                                  onClick={() => setSelectedTable(targetTableObj)}
                                  className="flex items-center gap-0.5 text-[10px] text-indigo-650 dark:text-indigo-450 hover:text-indigo-500 dark:hover:text-indigo-300 font-bold cursor-pointer group-hover:translate-x-0.5 transition-transform"
                                >
                                  Explore <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          /* Empty/Overview State Dashboard */
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs lg:col-span-8 space-y-6 text-left">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Network className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-wider">
                  Schema Catalog Dashboard
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a table from the catalog list on the left to visualize its schema diagram, inspect keys and relational pathways, or explore the catalog below.
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-450 dark:text-slate-505 uppercase font-black tracking-wider block mb-3.5">
                Detected Schema Tables Catalog
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProject.database?.tables?.map((table, idx) => {
                  const pkCol = table.columns.find(c => c.constraints?.includes("PRIMARY KEY"));
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedTable(table)}
                      className="bg-slate-50/50 dark:bg-slate-900/30 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-800 hover:shadow-xs cursor-pointer transition-all group text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Database className="h-4 w-4 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform shrink-0 animate-pulse" />
                          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                            {table.name}
                          </span>
                        </div>
                        <span className="bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-450 text-[9px] px-2 py-0.5 rounded font-mono font-semibold shrink-0">
                          {table.columns.length} columns
                        </span>
                      </div>
                      
                      <div className="space-y-2 mt-3.5 text-[10px] text-slate-500 dark:text-slate-400">
                        {pkCol && (
                          <div className="flex items-center gap-1.5 font-mono">
                            <Key className="h-3.5 w-3.5 text-amber-500 shrink-0 filter drop-shadow-[0_0_2px_rgba(245,158,11,0.4)]" />
                            <span className="truncate">PK: <code className="bg-slate-100 dark:bg-slate-950 px-1.5 py-0.2 rounded border dark:border-slate-800 text-indigo-300">{pkCol.name}</code></span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between border-t border-slate-150 dark:border-slate-850 pt-2 text-[10px]">
                          <span className="font-sans text-slate-400 dark:text-slate-500">
                            {table.relationships?.length || 0} relational mapping{(table.relationships?.length || 0) !== 1 && 's'}
                          </span>
                          <span className="text-indigo-650 dark:text-indigo-400 group-hover:translate-x-1 transition-transform font-bold inline-flex items-center gap-0.5">
                            Open <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
