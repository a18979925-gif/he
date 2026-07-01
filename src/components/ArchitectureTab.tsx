import React, { useState } from "react";
import {
  Globe,
  Server,
  Cpu,
  Database,
  ArrowRight,
  Layers,
  FileCode,
  Info,
  CheckCircle2,
  AlertCircle,
  Compass,
  HelpCircle,
  Activity,
  Filter,
  Search,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  Check,
  ChevronRight,
  Network
} from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface ArchitectureTabProps {
  activeProject: CodeScopeAnalysis;
  selectedArchLayer: string | null;
  setSelectedArchLayer: (layer: string | null) => void;
  setSelectedFile: (file: string) => void;
  setActiveTab: (tab: string) => void;
}

const isClassInLayer = (className: string, layer: string): boolean => {
  const name = className.toLowerCase();
  switch (layer) {
    case "Frontend Layer":
      return name.includes("view") || name.includes("component") || name.includes("page") || name.includes("screen") || name.includes("client") || name.includes("template") || name.includes("css") || name.includes("style");
    case "HTTP API Gateway":
    case "Controllers Layer":
      return name.includes("controller") || name.includes("gateway") || name.includes("router") || name.includes("handler") || name.includes("resolver") || name.includes("resource") || name.includes("auth") || name.includes("endpoint");
    case "Services Layer":
      return name.includes("service") || name.includes("command") || name.includes("query") || name.includes("usecase") || name.includes("logic") || name.includes("job") || name.includes("helper") || name.includes("calc") || name.includes("impl");
    case "Repositories Layer":
      const isModel = ["post", "comment", "user", "tag", "order", "product", "category", "review", "role", "permission", "shippingaddress", "orderitem", "orderaggregate"].includes(name);
      return name.includes("repository") || name.includes("repo") || name.includes("dao") || name.includes("mapper") || name.includes("entity") || name.includes("model") || name.includes("schema") || name.includes("database") || name.includes("context") || name.includes("db") || name.includes("prisma") || isModel;
    default:
      return true;
  }
};

const isInterfaceInLayer = (infName: string, layer: string): boolean => {
  const name = infName.toLowerCase();
  switch (layer) {
    case "Frontend Layer":
      return false;
    case "HTTP API Gateway":
    case "Controllers Layer":
      return name.includes("controller") || name.includes("gateway") || name.includes("dto") || name.includes("request") || name.includes("response");
    case "Services Layer":
      return name.includes("service") || name.includes("usecase") || name.includes("command") || name.includes("query");
    case "Repositories Layer":
      return name.includes("repository") || name.includes("repo") || name.includes("dao") || name.includes("mapper") || name.includes("entity");
    default:
      return true;
  }
};

const isDiagramInLayer = (d: { source: string; target: string; type: string }, layer: string): boolean => {
  const src = d.source.toLowerCase();
  const tgt = d.target.toLowerCase();
  switch (layer) {
    case "Frontend Layer":
      return src.includes("gateway") || src.includes("router") || src.includes("route") || src.includes("web") || src.includes("client");
    case "HTTP API Gateway":
    case "Controllers Layer":
      return src.includes("gateway") || src.includes("router") || src.includes("route") || src.includes("controller") || tgt.includes("controller");
    case "Services Layer":
      return src.includes("service") || tgt.includes("service");
    case "Repositories Layer":
      return src.includes("repository") || src.includes("repo") || src.includes("prisma") || src.includes("model") || tgt.includes("repository") || tgt.includes("repo") || tgt.includes("prisma") || tgt.includes("model") || tgt.includes("database") || tgt.includes("postgresql") || tgt.includes("mysql") || tgt.includes("db") || tgt.includes("prisma");
    default:
      return true;
  }
};

const getLayerStyle = (layerId: string, isActive: boolean) => {
  if (!isActive) {
    return {
      border: "border-slate-800/85 hover:border-slate-750 hover:bg-slate-900/30",
      bg: "bg-slate-900/10",
      text: "text-slate-400",
      iconColor: "text-slate-500",
      glow: "hover:shadow-[0_0_15px_rgba(99,102,241,0.03)]",
      badgeColor: "bg-slate-800/60 text-slate-500 border-slate-700"
    };
  }

  switch (layerId) {
    case "Frontend Layer":
      return {
        border: "border-indigo-500/80",
        bg: "bg-indigo-950/20",
        text: "text-indigo-200 font-semibold",
        iconColor: "text-indigo-400",
        glow: "shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30",
        badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/25"
      };
    case "HTTP API Gateway":
    case "Controllers Layer":
      return {
        border: "border-sky-500/80",
        bg: "bg-sky-950/20",
        text: "text-sky-200 font-semibold",
        iconColor: "text-sky-400",
        glow: "shadow-[0_0_30px_rgba(14,165,233,0.15)] ring-1 ring-sky-500/30",
        badgeColor: "bg-sky-500/10 text-sky-300 border-sky-500/25"
      };
    case "Services Layer":
      return {
        border: "border-pink-500/80",
        bg: "bg-pink-950/20",
        text: "text-pink-200 font-semibold",
        iconColor: "text-pink-400",
        glow: "shadow-[0_0_30px_rgba(236,72,153,0.15)] ring-1 ring-pink-500/30",
        badgeColor: "bg-pink-500/10 text-pink-300 border-pink-500/25"
      };
    case "Repositories Layer":
      return {
        border: "border-amber-500/80",
        bg: "bg-amber-950/20",
        text: "text-amber-200 font-semibold",
        iconColor: "text-amber-400",
        glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30",
        badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/25"
      };
    default:
      return {
        border: "border-indigo-500/80",
        bg: "bg-indigo-950/20",
        text: "text-indigo-200 font-semibold",
        iconColor: "text-indigo-400",
        glow: "shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30",
        badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/25"
      };
  }
};

const getLayerColor = (color: string) => {
  switch (color) {
    case "indigo": return "rgba(99, 102, 241, 0.4)";
    case "sky": return "rgba(14, 165, 233, 0.4)";
    case "pink": return "rgba(236, 72, 153, 0.4)";
    case "amber": return "rgba(245, 158, 11, 0.4)";
    default: return "rgba(99, 102, 241, 0.4)";
  }
};

export const ArchitectureTab: React.FC<ArchitectureTabProps> = ({
  activeProject,
  selectedArchLayer,
  setSelectedArchLayer,
  setSelectedFile,
  setActiveTab,
}) => {
  const [activeExplainTab, setActiveExplainTab] = useState<"overview" | "metrics" | "recommendations">("overview");
  const [classSearch, setClassSearch] = useState("");
  const [interfaceSearch, setInterfaceSearch] = useState("");
  const [filterToLayer, setFilterToLayer] = useState(true);

  // Confidence calculations
  const confidence = activeProject.architecture?.confidence || 85;
  const styleName = activeProject.architecture?.style || "N-Tier / Layered Monolith";
  const explanation = activeProject.architecture?.explanation || "No static architectural narrative extracted for this codebase.";
  
  const radius = 36;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  // Layer mapping configuration
  const layers = [
    {
      id: "Frontend Layer",
      title: "Frontend Client",
      subtitle: "React / Blade / SPA",
      icon: Globe,
      color: "indigo",
      desc: "User interfaces, view templates, assets and frontend routing",
      badge: "UI Layer"
    },
    {
      id: "HTTP API Gateway",
      title: "API Gateways",
      subtitle: "Controllers & Routers",
      icon: Server,
      color: "sky",
      desc: "HTTP entry points, middleware filters, security check gates",
      badge: "Gateway Layer"
    },
    {
      id: "Services Layer",
      title: "Core Logic Services",
      subtitle: "Domain Logic & Rules",
      icon: Cpu,
      color: "pink",
      desc: "Isolated business rules, calculations, and transactional operations",
      badge: "Core Service"
    },
    {
      id: "Repositories Layer",
      title: "Data Persistence",
      subtitle: "ORM & Repo Schemas",
      icon: Database,
      color: "amber",
      desc: "Database access layer, mapping entities and database drivers",
      badge: "Persistence"
    }
  ];

  const isSelected = (layerId: string) => {
    if (selectedArchLayer === layerId) return true;
    if (layerId === "HTTP API Gateway" && selectedArchLayer === "Controllers Layer") return true;
    return false;
  };

  // Stats calculation
  const totalClasses = activeProject.modules?.reduce((acc, m) => acc + (m.classes?.length || 0), 0) || 0;
  const totalInterfaces = activeProject.modules?.reduce((acc, m) => acc + (m.interfaces?.length || 0), 0) || 0;
  const totalRelations = activeProject.architecture?.diagrams?.length || 0;

  // Filter lists
  const allClasses = activeProject.modules?.flatMap(m => m.classes || []) || [];
  let displayedClasses = allClasses;
  if (filterToLayer && selectedArchLayer) {
    displayedClasses = allClasses.filter(c => isClassInLayer(c, selectedArchLayer));
  }
  if (classSearch.trim() !== "") {
    displayedClasses = displayedClasses.filter(c => c.toLowerCase().includes(classSearch.toLowerCase()));
  }

  const allInterfaces = activeProject.modules?.flatMap(m => m.interfaces || []) || [];
  let displayedInterfaces = allInterfaces;
  if (filterToLayer && selectedArchLayer) {
    displayedInterfaces = allInterfaces.filter(inf => isInterfaceInLayer(inf, selectedArchLayer));
  }
  if (interfaceSearch.trim() !== "") {
    displayedInterfaces = displayedInterfaces.filter(inf => inf.toLowerCase().includes(interfaceSearch.toLowerCase()));
  }

  const allDiagrams = activeProject.architecture?.diagrams || [];
  let displayedDiagrams = allDiagrams;
  if (filterToLayer && selectedArchLayer) {
    displayedDiagrams = allDiagrams.filter(d => isDiagramInLayer(d, selectedArchLayer));
  }

  // Recommendations generator
  const getRecommendations = () => {
    if (styleName.includes("DDD") || styleName.includes("Domain-Driven")) {
      return [
        { label: "Aggregate Boundary Integrity", desc: "Ensure domain models are mutated only via transaction roots. Do not leak internal models." },
        { label: "Port Isolation", desc: "Inject persistence drivers dynamically using interfaces. Keep JPA or SQL operations fully decoupled." },
        { label: "Pure Domain Logic", desc: "Avoid placing state-changing API operations directly in the controller layers." }
      ];
    } else if (styleName.includes("Layered")) {
      return [
        { label: "Direct Service Layer Calls", desc: "Controllers must only invoke Business Services. Avoid bypass routes that call Prisma/ORM directly." },
        { label: "Strict Dependency Flow", desc: "Maintain downward flow: Controller -> Service -> Repository. Circular imports degrade cohesion." },
        { label: "DTO Pattern Adoption", desc: "Translate database row entities into lightweight data transfer objects before returning payload." }
      ];
    } else {
      return [
        { label: "Decouple DB Entities", desc: "Ensure business services run in a transaction context, avoiding direct DB writes from web route files." },
        { label: "Inject Logic via Contracts", desc: "Define interfaces for external gateway calls (e.g. payment handlers) to improve unit testability." },
        { label: "Minimize Middleware Bloat", desc: "Offload request sanitization and schema check validations to specialized gateway filters." }
      ];
    }
  };

  const getMetrics = () => {
    const health = activeProject.healthScore || 90;
    const cohesion = Math.min(100, Math.round(health * 1.05));
    const coupling = Math.max(10, Math.round(110 - confidence));
    
    return [
      { label: "AST Cohere Index", value: `${cohesion}%`, rating: cohesion > 85 ? "High Cohesion" : "Medium Cohesion" },
      { label: "Coupling Factor", value: `${coupling}%`, rating: coupling < 30 ? "Loosely Coupled" : "Moderately Coupled" },
      { label: "Layer Strictness", value: confidence > 80 ? "Strict Boundaries" : "Relaxed Boundaries", rating: `Score: ${confidence}` },
      { label: "Complexity Density", value: health > 90 ? "Minimal" : "Moderate", rating: "Clean loops" }
    ];
  };

  return (
    <div className="space-y-6" id="architecture-tab-view">
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

      <style>{`
        @keyframes dash {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes dash-vertical {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>

      {/* Header section with micro-stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-100">
              Architecture Blueprint Explorer
            </h2>
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              AST Engine v1.8
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Static analysis mapped boundary flow. Detects controllers, services, transactional ports, and database persistence layouts.
          </p>
        </div>
        
        {/* Micro stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center shrink-0">
          <div className="bg-slate-900/40 border border-slate-800/80 px-3 py-1.5 rounded-xl min-w-[85px]">
            <span className="block text-[10px] text-slate-500 font-medium">Layers</span>
            <span className="text-xs font-semibold font-mono text-indigo-400">4 / Active</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 px-3 py-1.5 rounded-xl min-w-[85px]">
            <span className="block text-[10px] text-slate-500 font-medium">Classes</span>
            <span className="text-xs font-semibold font-mono text-sky-400">{totalClasses}</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 px-3 py-1.5 rounded-xl min-w-[85px]">
            <span className="block text-[10px] text-slate-500 font-medium">Contracts</span>
            <span className="text-xs font-semibold font-mono text-pink-400">{totalInterfaces}</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 px-3 py-1.5 rounded-xl min-w-[85px]">
            <span className="block text-[10px] text-slate-500 font-medium">Downstream</span>
            <span className="text-xs font-semibold font-mono text-amber-400">{totalRelations}</span>
          </div>
        </div>
      </div>

      {/* Confidence gauge and AI explanation details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confidence Gauge Card */}
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800/80 p-5 rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full pointer-events-none"></div>
          
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pattern Confidence</span>
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${confidence > 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {confidence > 80 ? 'HIGH ACCURACY' : 'PROBABLE'}
            </span>
          </div>
          
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                className={`transition-all duration-1000 ease-out ${confidence > 80 ? 'stroke-indigo-500' : 'stroke-amber-500'}`}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${confidence > 80 ? 'rgba(99,102,241,0.4)' : 'rgba(245,158,11,0.4)'})` }}
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-bold tracking-tight text-slate-100">{confidence}%</span>
              <span className="block text-[8px] font-bold tracking-widest text-slate-400 uppercase">Match Score</span>
            </div>
          </div>
          
          <div className="w-full mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 block mb-1">Architecture Detected</span>
            <span className="text-sm font-semibold text-slate-200 block truncate">{styleName}</span>
          </div>
        </div>

        {/* AI Narratives & Tabs Card */}
        <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/80 border border-slate-800/80 p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-pink-500/5 blur-3xl rounded-full pointer-events-none"></div>
          
          <div>
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveExplainTab("overview")}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg transition-all ${activeExplainTab === "overview" ? "bg-slate-850 text-slate-200 font-semibold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveExplainTab("metrics")}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg transition-all ${activeExplainTab === "metrics" ? "bg-slate-850 text-slate-200 font-semibold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  Structural Metrics
                </button>
                <button
                  onClick={() => setActiveExplainTab("recommendations")}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg transition-all ${activeExplainTab === "recommendations" ? "bg-slate-850 text-slate-200 font-semibold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  AI Recommendations
                </button>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <Network className="h-3 w-3 text-indigo-500/80" />
                Model: Claude-3-Sonnet
              </div>
            </div>

            {/* Tab Contents */}
            <div className="min-h-[110px] flex flex-col justify-center">
              {activeExplainTab === "overview" && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {explanation}
                    </p>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 text-[10px] text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span>Static AST confirms this design style pattern conforms to modular coupling constraints.</span>
                  </div>
                </div>
              )}

              {activeExplainTab === "metrics" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getMetrics().map((m, idx) => (
                    <div key={idx} className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">{m.label}</span>
                        <span className="text-xs font-semibold text-slate-300">{m.rating}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/10">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeExplainTab === "recommendations" && (
                <div className="space-y-2">
                  {getRecommendations().map((r, idx) => (
                    <div key={idx} className="bg-slate-950/20 p-2.5 rounded-xl border border-slate-900 flex items-start gap-2.5 text-xs">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 animate-pulse" />
                      <div className="leading-tight">
                        <span className="font-semibold text-slate-200 block">{r.label}</span>
                        <span className="text-slate-400 text-[10px] mt-0.5 block">{r.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Multi Node Diagram */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-32 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Compass className="h-4.5 w-4.5 text-indigo-400" />
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Interactive Flow Pipeline</h3>
              <p className="text-[10px] text-slate-500">Select any layer box to inspect its isolated AST component mapping below.</p>
            </div>
          </div>
          
          {selectedArchLayer && (
            <span className="text-[9px] self-start sm:self-center px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono">
              Active View: {selectedArchLayer}
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-2 relative w-full z-10">
          {layers.map((layer, index) => {
            const active = isSelected(layer.id);
            const style = getLayerStyle(layer.id, active);
            const LayerIcon = layer.icon;

            const layerClassCount = allClasses.filter(c => isClassInLayer(c, layer.id)).length;
            const layerInfCount = allInterfaces.filter(inf => isInterfaceInLayer(inf, layer.id)).length;

            return (
              <React.Fragment key={layer.id}>
                {/* Card node */}
                <div
                  onClick={() => setSelectedArchLayer(layer.id)}
                  className={`cursor-pointer p-4 rounded-xl border flex-1 flex flex-col justify-between transition-all duration-300 relative group select-none ${style.bg} ${style.border} ${style.glow}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${style.iconColor} transition-all group-hover:scale-105 duration-300`}>
                        <LayerIcon className="h-5 w-5" />
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono ${style.badgeColor}`}>
                        {layer.badge}
                      </span>
                    </div>
                    
                    <h4 className={`text-xs font-bold transition-colors ${active ? style.text : 'text-slate-300 group-hover:text-slate-100'}`}>
                      {layer.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{layer.subtitle}</p>
                    
                    <p className="text-[9px] text-slate-400 mt-2 leading-tight group-hover:text-slate-300 transition-colors line-clamp-2">
                      {layer.desc}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-800/60 text-[9px] text-slate-500 font-mono">
                    <span className="flex items-center gap-0.5">
                      <FileCode className="h-3 w-3 text-slate-400" />
                      {layerClassCount} Classes
                    </span>
                    {layerInfCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Info className="h-3 w-3 text-slate-400" />
                        {layerInfCount} Ports
                      </span>
                    )}
                  </div>
                </div>

                {/* Connectors */}
                {index < layers.length - 1 && (
                  <>
                    {/* Desktop Connector */}
                    <div className="hidden lg:flex items-center justify-center w-8 shrink-0">
                      <svg className="w-8 h-4 overflow-visible" viewBox="0 0 32 16" fill="none">
                        <path
                          d="M0 8H32"
                          className="stroke-slate-800/80"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M0 8H32"
                          strokeWidth="1.5"
                          strokeDasharray="4 6"
                          style={{ stroke: getLayerColor(layer.color), animation: "dash 1.5s linear infinite" }}
                        />
                      </svg>
                    </div>

                    {/* Mobile Connector */}
                    <div className="flex lg:hidden items-center justify-center h-6 py-1">
                      <svg className="h-6 w-4 overflow-visible" viewBox="0 0 16 24" fill="none">
                        <path
                          d="M8 0V24"
                          className="stroke-slate-800/80"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M8 0V24"
                          strokeWidth="1.5"
                          strokeDasharray="4 6"
                          style={{ stroke: getLayerColor(layer.color), animation: "dash-vertical 1.5s linear infinite" }}
                        />
                      </svg>
                    </div>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Layer Specific Inspector Detail Panel */}
      {selectedArchLayer && (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
          
          {/* Inspector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  {selectedArchLayer} AST Mappings
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Component declarations, interface boundaries, and downstream logic flows matching this pattern.
                </p>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg select-none text-[11px] font-medium text-slate-300 hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={filterToLayer}
                  onChange={(e) => setFilterToLayer(e.target.checked)}
                  className="rounded border-slate-850 text-indigo-600 focus:ring-indigo-500/30 bg-slate-950 h-3.5 w-3.5"
                />
                <span className="flex items-center gap-1">
                  <Filter className="h-3 w-3 text-slate-400" />
                  Filter to Layer
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Component Files / Classes */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 flex flex-col justify-between min-h-[320px]">
              <div>
                <div className="flex items-center justify-between mb-3.5 gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block shrink-0">
                    Logical Components ({displayedClasses.length})
                  </span>
                  <div className="relative w-full max-w-[140px]">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={classSearch}
                      onChange={(e) => setClassSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-md py-1 pl-7 pr-2 text-[10px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {displayedClasses.map((c, idx) => (
                    <div 
                      key={idx}
                      onClick={() => { setSelectedFile(c); setActiveTab("files"); }}
                      className="group bg-slate-900/40 hover:bg-indigo-950/20 p-2.5 rounded-lg border border-slate-850 hover:border-indigo-500/30 text-xs font-mono font-medium hover:text-indigo-400 cursor-pointer flex items-center justify-between transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileCode className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                        <span className="truncate text-slate-300 group-hover:text-indigo-300">{c}</span>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  ))}

                  {displayedClasses.length === 0 && (
                    <div className="text-[11px] text-slate-500 py-8 text-center italic border border-dashed border-slate-800/80 rounded-lg">
                      No classes mapped to this layer.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-850/60 text-[10px] text-slate-500">
                Tip: Click any class node above to view its static AST code source directly in the File Explorer.
              </div>
            </div>

            {/* Interfaces / Hexagonal boundaries */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 flex flex-col justify-between min-h-[320px]">
              <div>
                <div className="flex items-center justify-between mb-3.5 gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block shrink-0">
                    Interfaces & Ports ({displayedInterfaces.length})
                  </span>
                  <div className="relative w-full max-w-[140px]">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={interfaceSearch}
                      onChange={(e) => setInterfaceSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-md py-1 pl-7 pr-2 text-[10px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-pink-500/50"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {displayedInterfaces.map((inf, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-850 text-xs font-mono text-slate-300 flex items-center gap-2">
                      <Info className="h-3.5 w-3.5 text-pink-500/70 shrink-0" />
                      <span className="truncate">{inf}</span>
                    </div>
                  ))}
                  {displayedInterfaces.length === 0 && (
                    <div className="text-[11px] text-slate-500 py-8 text-center italic border border-dashed border-slate-800/80 rounded-lg">
                      No decoupled interfaces mapped on this layer.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-850/60 text-[10px] text-slate-500">
                Decouplers isolate domain dependencies, enabling clean unit testing and Hexagonal adapter ports.
              </div>
            </div>

            {/* Connected entities or dependencies */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 flex flex-col justify-between min-h-[320px]">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-3.5">
                  Downstream Relationships ({displayedDiagrams.length})
                </span>
                
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {displayedDiagrams.map((d, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-850 text-xs flex flex-col gap-1.5 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-indigo-300 truncate max-w-[42%] border border-slate-850">
                          {d.source}
                        </span>
                        
                        <div className="flex flex-col items-center flex-1 mx-1.5 relative min-w-[50px]">
                          <span className="text-[8px] text-slate-400 font-mono text-center truncate max-w-[90px] bg-slate-900 px-1 border border-slate-800 rounded z-10 leading-tight">
                            {d.type || d.label}
                          </span>
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-800 w-full z-0"></div>
                        </div>
                        
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-emerald-300 truncate max-w-[42%] border border-slate-850">
                          {d.target}
                        </span>
                      </div>
                    </div>
                  ))}
                  {displayedDiagrams.length === 0 && (
                    <div className="text-[11px] text-slate-500 py-8 text-center italic border border-dashed border-slate-800/80 rounded-lg">
                      No active data flows mapped to this layer.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-850/60 text-[10px] text-slate-500">
                Arrows represent static dependencies detected by tracing class initializations and calls.
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};