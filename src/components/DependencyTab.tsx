import React, { useState, useRef } from "react";
import { Search, Cpu, Check, ArrowRight, ZoomIn, ZoomOut, Move, Layers } from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface DependencyTabProps {
  activeProject: CodeScopeAnalysis;
  symbolSearchQuery: string;
  setSymbolSearchQuery: (query: string) => void;
  selectedDepNode: string;
  setSelectedDepNode: (node: string) => void;
}

export const DependencyTab: React.FC<DependencyTabProps> = ({
  activeProject,
  symbolSearchQuery,
  setSymbolSearchQuery,
  selectedDepNode,
  setSelectedDepNode,
}) => {
  const [subView, setSubView] = useState<'visual' | 'relations' | 'callgraph'>('visual');
  
  // Interactive SVG Graph controls
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const startPan = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Call Graph Selected Method
  const [selectedMethod, setSelectedMethod] = useState<string>("OrderService.placeOrder()");

  const activeNode = activeProject.dependencyGraph.nodes.find(n => n.id === selectedDepNode);

  // Pre-calculated coordinates for visual graph layout (circle or grid pattern)
  const nodesCount = activeProject.dependencyGraph.nodes.length;
  const nodesWithCoords = activeProject.dependencyGraph.nodes.map((n, i) => {
    // Circle formula centered around (300, 220)
    const radius = 160;
    const angle = (i * 2 * Math.PI) / nodesCount;
    return {
      ...n,
      x: 300 + radius * Math.cos(angle),
      y: 220 + radius * Math.sin(angle)
    };
  });

  // Check if a connection lies within a circular dependency
  const isPartofCycle = (srcId: string, tgtId: string) => {
    if (!activeProject.importAnalysis?.circularDependencies) return false;
    return activeProject.importAnalysis.circularDependencies.some(cycle => {
      const parts = cycle.split(" -> ");
      const srcBase = srcId.split("/").pop() || srcId;
      const tgtBase = tgtId.split("/").pop() || tgtId;
      
      // Look for adjacent elements in the cycle loop
      for (let i = 0; i < parts.length - 1; i++) {
        if (parts[i] === srcBase && parts[i + 1] === tgtBase) return true;
      }
      return false;
    });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Only pan if clicking on empty SVG space
    if (svgRef.current && e.target === svgRef.current) {
      setIsPanning(true);
      startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.current.x,
        y: e.clientY - startPan.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Call Graph paths mapper
  const callGraphPaths: Record<string, Array<{ name: string; type: string; desc: string }>> = {
    "OrderService.placeOrder()": [
      { name: "placeOrder()", type: "entry", desc: "Order Rest Endpoint controller entry point verification." },
      { name: "validateCart()", type: "step", desc: "Check stock quantities and coupon integrity checks." },
      { name: "calculatePrice()", type: "step", desc: "Apply dynamic discounts and tax coefficients computation." },
      { name: "paymentService.pay()", type: "call", desc: "Issue charging request payload targeting Stripe." },
      { name: "orderRepository.save()", type: "database", desc: "Commit aggregated values into orders SQL tables." }
    ],
    "AuthController.login()": [
      { name: "login()", type: "entry", desc: "Binds inputs, filters credentials signatures." },
      { name: "authenticate()", type: "step", desc: "Decrypts secrets and matches password hashes." },
      { name: "tokenService.issue()", type: "call", desc: "Sign JWT tokens payload variables." },
      { name: "userRepository.logLogin()", type: "database", desc: "Log security analytics audit trace." }
    ],
    "ProductService.search()": [
      { name: "search()", type: "entry", desc: "Parses request query filters." },
      { name: "buildJpaQuery()", type: "step", desc: "Build JPA Specifications search tree." },
      { name: "cache.get()", type: "call", desc: "Attempt fast cache retrieval from Redis cluster." },
      { name: "productRepository.query()", type: "database", desc: "Select matching records from tables." }
    ]
  };

  return (
    <div className="space-y-6 text-left font-sans" id="dependency-tab-view">
      <style>{`
        @keyframes edge-flow-animation {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        .edge-selected-flow {
          stroke-dasharray: 6 3;
          animation: edge-flow-animation 1.5s linear infinite;
        }
        .edge-cycle-flow {
          stroke-dasharray: 4 2;
          animation: edge-flow-animation 1s linear infinite;
        }
        .bg-radial-dark {
          background: radial-gradient(circle at center, #0b1329 0%, #030712 100%);
        }
      `}</style>

      {/* Title block */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="bg-indigo-500/10 p-3 rounded-2xl text-indigo-400 border border-indigo-500/20 shrink-0 shadow-inner">
          <Layers className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            Dependency Graph
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Interactive Schema
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Interactive workspace to check imports, outgoing connections, constructor dependency injections, and implementations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Symbol Selector */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-2xl shadow-slate-950/50 space-y-4 lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5 font-sans">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                Class Dependency Nodes
              </span>
              <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800/80 text-indigo-400 font-bold">
                {activeProject.dependencyGraph.nodes.length} total
              </span>
            </div>

            <div className="relative mb-4 group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-200" />
              <input 
                type="text" 
                placeholder="Search symbols..."
                value={symbolSearchQuery}
                onChange={(e) => setSymbolSearchQuery(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 rounded-xl py-2 pl-9.5 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:bg-slate-950 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 outline-none font-sans transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {activeProject.dependencyGraph.nodes
                .filter(n => n.label.toLowerCase().includes(symbolSearchQuery.toLowerCase()))
                .map((node, i) => {
                  const isSelected = selectedDepNode === node.id;
                  let badgeStyle = "bg-slate-800/80 text-slate-355 border border-slate-700/40";
                  switch(node.type) {
                    case 'controller':
                      badgeStyle = "bg-sky-500/10 text-sky-400 border border-sky-500/20";
                      break;
                    case 'service':
                      badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                      break;
                    case 'repository':
                      badgeStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                      break;
                    case 'middleware':
                      badgeStyle = "bg-violet-500/10 text-violet-400 border border-violet-500/20";
                      break;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDepNode(node.id)}
                      className={`w-full text-left p-3 rounded-xl text-xs font-mono flex items-center justify-between transition-all duration-200 cursor-pointer border ${
                        isSelected 
                          ? "bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white font-semibold border-indigo-500/40 shadow-md shadow-indigo-950/20" 
                          : "bg-slate-950/40 hover:bg-slate-800/60 text-slate-300 hover:text-white border-slate-800/60 hover:border-slate-700/80"
                      }`}
                    >
                      <span className="truncate pr-2">{node.label}</span>
                      <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold shrink-0 ${isSelected ? "bg-white/20 text-white border border-transparent" : badgeStyle}`}>
                        {node.type}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Tab Content Viewer */}
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-2xl shadow-slate-950/50 lg:col-span-8 flex flex-col justify-between space-y-6">
          
          {/* Internal View Tab Selectors */}
          <div className="flex border-b border-slate-800 pb-4 justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-2.5 rounded-xl text-indigo-400 border border-indigo-500/20 shrink-0 shadow-inner">
                <Cpu className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-slate-100 font-mono line-clamp-1">{selectedDepNode}</h3>
                <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  AST Node Type: <span className="font-mono text-slate-200 capitalize font-medium">{activeNode?.type || "class"}</span>
                </p>
              </div>
            </div>

            <div className="flex bg-slate-950/80 p-1 rounded-xl gap-1.5 text-[11px] font-sans border border-slate-850">
              <button
                onClick={() => setSubView('visual')}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  subView === 'visual' 
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-white font-bold border border-slate-700/80 shadow-md shadow-slate-950/60' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
                }`}
              >
                Interactive Tree View
              </button>
              <button
                onClick={() => setSubView('callgraph')}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  subView === 'callgraph' 
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-white font-bold border border-slate-700/80 shadow-md shadow-slate-950/60' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
                }`}
              >
                Call Graph Flow
              </button>
              <button
                onClick={() => setSubView('relations')}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  subView === 'relations' 
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-white font-bold border border-slate-700/80 shadow-md shadow-slate-950/60' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
                }`}
              >
                Direct Relations List
              </button>
            </div>
          </div>

          {/* SubView Panels */}
          {subView === 'visual' && (
            <div className="space-y-4">
              {/* Interactive Toolbar */}
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                <span className="flex items-center gap-2 font-medium font-sans text-slate-400">
                  <Move className="h-4 w-4 text-indigo-400 animate-pulse" />
                  Drag empty canvas area to Pan. Click nodes to trace imports.
                </span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} 
                    className="hover:bg-slate-800 hover:text-slate-250 p-1.5 rounded-lg border border-transparent hover:border-slate-700 transition-all duration-200 cursor-pointer" 
                    title="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="font-mono font-bold text-[10px] w-12 text-center text-slate-300">{Math.round(zoom * 100)}%</span>
                  <button 
                    onClick={() => setZoom(z => Math.min(2, z + 0.1))} 
                    className="hover:bg-slate-800 hover:text-slate-250 p-1.5 rounded-lg border border-transparent hover:border-slate-700 transition-all duration-200 cursor-pointer" 
                    title="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} 
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white transition-all cursor-pointer font-sans"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Graphic Canvas Box */}
              <div className="relative border border-slate-800/80 rounded-2xl overflow-hidden bg-radial-dark h-[400px] shadow-inner shadow-black/80">
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="cursor-grab active:cursor-grabbing select-none"
                >
                  <defs>
                    {/* Arrow markers */}
                    <marker id="arrow" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                    </marker>
                    <marker id="arrow-selected" viewBox="0 0 10 10" refX="27" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
                    </marker>
                    <marker id="arrow-cycle" viewBox="0 0 10 10" refX="27" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#f87171" />
                    </marker>

                    {/* Radial gradients for the nodes */}
                    <radialGradient id="grad-selected" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </radialGradient>
                    <radialGradient id="grad-cycle" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </radialGradient>
                    <radialGradient id="grad-controller" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </radialGradient>
                    <radialGradient id="grad-service" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </radialGradient>
                    <radialGradient id="grad-repository" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#d97706" />
                    </radialGradient>
                    <radialGradient id="grad-middleware" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </radialGradient>
                    <radialGradient id="grad-default" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="100%" stopColor="#475569" />
                    </radialGradient>

                    {/* Glow Filter */}
                    <filter id="glow-selected" x="-35%" y="-35%" width="170%" height="170%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-cycle" x="-35%" y="-35%" width="170%" height="170%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Dot Grid Pattern */}
                    <pattern id="dot-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1.2" fill="#334155" opacity="0.45" />
                    </pattern>
                  </defs>

                  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {/* Infinite moving grid background */}
                    <rect x="-10000" y="-10000" width="20000" height="20000" fill="url(#dot-grid)" pointerEvents="none" />

                    {/* Render Links */}
                    {activeProject.dependencyGraph.edges.map((edge, idx) => {
                      const srcNode = nodesWithCoords.find(n => n.id === edge.source);
                      const tgtNode = nodesWithCoords.find(n => n.id === edge.target);
                      if (!srcNode || !tgtNode) return null;

                      const cycle = isPartofCycle(edge.source, edge.target);
                      const isLinkedToSelected = edge.source === selectedDepNode || edge.target === selectedDepNode;

                      return (
                        <line
                          key={idx}
                          x1={srcNode.x}
                          y1={srcNode.y}
                          x2={tgtNode.x}
                          y2={tgtNode.y}
                          stroke={cycle ? "#f87171" : isLinkedToSelected ? "#818cf8" : "#334155"}
                          strokeWidth={cycle ? 2.5 : isLinkedToSelected ? 2 : 1.25}
                          strokeDasharray={cycle ? "4,4" : undefined}
                          markerEnd={cycle ? "url(#arrow-cycle)" : isLinkedToSelected ? "url(#arrow-selected)" : "url(#arrow)"}
                          className={`${cycle ? "edge-pulse edge-cycle-flow" : isLinkedToSelected ? "edge-selected-flow" : ""} transition-all duration-300`}
                          opacity={isLinkedToSelected || cycle ? 1 : 0.35}
                        />
                      );
                    })}

                    {/* Render Nodes */}
                    {nodesWithCoords.map((node) => {
                      const isSelected = node.id === selectedDepNode;
                      const hasCycle = activeProject.importAnalysis?.circularDependencies?.some(c => c.includes(node.label));
                      
                      let nodeGrad = "url(#grad-default)";
                      let nodeStroke = "#475569";
                      if (isSelected) {
                        nodeGrad = "url(#grad-selected)";
                        nodeStroke = "#a5b4fc";
                      } else if (hasCycle) {
                        nodeGrad = "url(#grad-cycle)";
                        nodeStroke = "#fca5a5";
                      } else {
                        switch (node.type) {
                          case 'controller':
                            nodeGrad = "url(#grad-controller)";
                            nodeStroke = "#0284c7";
                            break;
                          case 'service':
                            nodeGrad = "url(#grad-service)";
                            nodeStroke = "#059669";
                            break;
                          case 'repository':
                            nodeGrad = "url(#grad-repository)";
                            nodeStroke = "#d97706";
                            break;
                          case 'middleware':
                            nodeGrad = "url(#grad-middleware)";
                            nodeStroke = "#7c3aed";
                            break;
                          default:
                            nodeGrad = "url(#grad-default)";
                            nodeStroke = "#475569";
                        }
                      }
                      
                      return (
                        <g 
                          key={node.id} 
                          transform={`translate(${node.x}, ${node.y})`}
                          onClick={(e) => { e.stopPropagation(); setSelectedDepNode(node.id); }}
                          className="cursor-pointer group"
                        >
                          {/* Inner glowing aura for selected */}
                          {isSelected && (
                            <circle
                              r="26"
                              fill="#4f46e5"
                              opacity="0.25"
                              className="animate-ping pointer-events-none"
                            />
                          )}

                          {/* Outer Circle Container */}
                          <circle
                            r={isSelected ? "20" : "15"}
                            fill={nodeGrad}
                            stroke={nodeStroke}
                            strokeWidth={isSelected ? 3 : 1.5}
                            filter={isSelected ? "url(#glow-selected)" : hasCycle ? "url(#glow-cycle)" : undefined}
                            className="transition-all duration-300 group-hover:brightness-110"
                          />

                          {/* Central node core design */}
                          <circle
                            r="5"
                            fill="#020617"
                            className="pointer-events-none"
                          />
                          <circle
                            r="2.5"
                            fill={isSelected ? "#818cf8" : "#ffffff"}
                            className="pointer-events-none"
                          />
                          
                          {/* Text Outline for ultimate readability */}
                          <text
                            y="32"
                            textAnchor="middle"
                            fill="#020617"
                            stroke="#020617"
                            strokeWidth="4.5"
                            strokeLinejoin="round"
                            fontSize="10"
                            fontFamily="monospace"
                            className="select-none pointer-events-none font-bold"
                          >
                            {node.label}
                          </text>
                          {/* Text Main */}
                          <text
                            y="32"
                            textAnchor="middle"
                            fill={isSelected ? "#e0e7ff" : hasCycle ? "#fecaca" : "#94a3b8"}
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight={isSelected ? "bold" : "normal"}
                            className="select-none pointer-events-none transition-colors duration-200 group-hover:fill-slate-100"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>

              {/* Legend info */}
              <div className="flex gap-4 justify-center items-center text-[10px] text-slate-400 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60 font-sans mt-3 flex-wrap">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-500/20"></span> Controller</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20"></span> Service</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/20"></span> Repository</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-violet-400 ring-2 ring-violet-500/20"></span> Middleware</span>
                <span className="flex items-center gap-2 font-semibold text-red-400"><span className="w-4 h-0.5 border-t-2 border-dashed border-red-400 block"></span> Circular Dependency Cycle</span>
              </div>
            </div>
          )}

          {/* Call Graph panel */}
          {subView === 'callgraph' && (
            <div className="space-y-5 text-left font-sans">
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Dynamic Call Trace Analysis</h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-0.5 font-sans">Trace method invocation chains dynamically derived from static source code bindings.</p>
                </div>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl outline-none font-semibold text-slate-200 hover:text-white hover:border-slate-700 focus:border-indigo-500/80 transition-all cursor-pointer font-sans"
                >
                  <option value="OrderService.placeOrder()">OrderService.placeOrder()</option>
                  <option value="AuthController.login()">AuthController.login()</option>
                  <option value="ProductService.search()">ProductService.search()</option>
                </select>
              </div>

              {/* Graphical Calling Chain */}
              <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800/60 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <span className="text-[9px] text-indigo-400 tracking-wider uppercase font-mono font-bold block mb-1">
                  Method Execution Timeline Mappings
                </span>

                <div className="flex flex-col space-y-3 pl-3">
                  {callGraphPaths[selectedMethod]?.map((node, index, arr) => (
                    <div key={index} className="flex items-start gap-4 group">
                      {/* Step index dot & line */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border transition-all duration-300 ${
                          index === 0 
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]" 
                            : index === arr.length - 1 
                              ? "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                              : "bg-slate-900 border-slate-800 text-slate-350 group-hover:border-slate-700"
                        }`}>
                          {index + 1}
                        </div>
                        {index < arr.length - 1 && (
                          <div className="w-0.5 h-12 bg-gradient-to-b from-slate-800 to-slate-900 my-1"></div>
                        )}
                      </div>
                      
                      {/* Details Card */}
                      <div className="bg-slate-900/40 group-hover:bg-slate-900/80 border border-slate-900 group-hover:border-slate-800/80 p-3.5 rounded-xl transition-all duration-300 flex-1 ml-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <strong className="text-xs font-mono text-slate-205 group-hover:text-white transition-colors duration-200">{node.name}</strong>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                            node.type === 'entry' ? "bg-indigo-950/80 text-indigo-300 border border-indigo-900/80" :
                            node.type === 'database' ? "bg-amber-950/80 text-amber-300 border border-amber-900/80" :
                            node.type === 'call' ? "bg-rose-950/80 text-rose-300 border border-rose-900/80" :
                            "bg-slate-900 text-slate-400 border border-slate-800"
                          }`}>
                            {node.type}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed group-hover:text-slate-300 transition-colors duration-200">{node.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Direct Relations List */}
          {subView === 'relations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Incoming Dependencies */}
              <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/60 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2 mb-4 font-sans">
                  <Check className="h-4 w-4 text-emerald-400" /> Incoming Dependencies (Who Calls This)
                </span>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {activeProject.dependencyGraph.edges
                    .filter(e => e.target === selectedDepNode)
                    .map((edge, idx) => (
                      <div key={idx} className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-850 p-3 rounded-xl text-xs flex justify-between items-center transition-all duration-200">
                        <span className="font-mono font-semibold text-slate-205">{edge.source}</span>
                        <span className="text-[9px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-850 font-mono font-medium">{edge.label || "invokes"}</span>
                      </div>
                    ))}
                  {activeProject.dependencyGraph.edges.filter(e => e.target === selectedDepNode).length === 0 && (
                    <div className="text-xs text-slate-500 py-8 text-center italic font-sans">No incoming dependency roots. Entry layer.</div>
                  )}
                </div>
              </div>

              {/* Outgoing Dependencies */}
              <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/60 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2 mb-4 font-sans">
                  <ArrowRight className="h-4 w-4 text-indigo-400" /> Outgoing Dependencies (What This Calls)
                </span>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {activeProject.dependencyGraph.edges
                    .filter(e => e.source === selectedDepNode)
                    .map((edge, idx) => (
                      <div key={idx} className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-850 p-3 rounded-xl text-xs flex justify-between items-center transition-all duration-200">
                        <span className="font-mono font-semibold text-slate-205">{edge.target}</span>
                        <span className="text-[9px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-850 font-mono font-medium">{edge.label || "references"}</span>
                      </div>
                    ))}
                  {activeProject.dependencyGraph.edges.filter(e => e.source === selectedDepNode).length === 0 && (
                    <div className="text-xs text-slate-500 py-8 text-center italic font-sans">No outgoing dependencies. Leaf entity layer.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dependency Injection / Constructor & Usage Stats */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-850 shadow-xl shadow-black/40">
            <span className="text-[10px] text-indigo-400 font-mono tracking-wider block mb-3 uppercase text-left font-bold">AST Usage Statistics</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800/60">
              <div className="pt-2 sm:pt-0">
                <div className="text-xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">14</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold font-sans mt-0.5">Active Imports</div>
              </div>
              <div className="pt-2 sm:pt-0 sm:pl-2">
                <div className="text-xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-450">42</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold font-sans mt-0.5">Method Calls</div>
              </div>
              <div className="pt-2 sm:pt-0 sm:pl-2">
                <div className="text-xs font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 leading-[30px]">Constructor</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold font-sans mt-0.5">Injected</div>
              </div>
              <div className="pt-2 sm:pt-0 sm:pl-2">
                <div className="text-xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">1</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold font-sans mt-0.5">Implementations</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};