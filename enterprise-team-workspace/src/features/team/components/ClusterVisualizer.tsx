import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Server, Activity, Database, ShieldAlert, Zap, RotateCw, Cpu, 
  Globe, Wifi, AlertCircle, Terminal, ArrowRight, Lock, Check, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface ClusterNode {
  id: string;
  name: string;
  type: "gateway" | "ai" | "database" | "microservice" | "cache";
  status: "healthy" | "overloaded" | "offline" | "rebooting";
  cpu: number;
  memory: number;
  connections: number;
  ip: string;
}

interface TelemetryPoint {
  time: string;
  load: number;
  response: number;
}

export function ClusterVisualizer() {
  const [nodes, setNodes] = useState<ClusterNode[]>([
    { id: "node-ingress", name: "nginx-ingress-gateway", type: "gateway", status: "healthy", cpu: 14, memory: 35, connections: 142, ip: "192.168.1.10" },
    { id: "node-ai", name: "gemini-api-agent-broker", type: "ai", status: "healthy", cpu: 22, memory: 68, connections: 18, ip: "192.168.1.25" },
    { id: "node-firestore", name: "gcp-firestore-sync-hub", type: "database", status: "healthy", cpu: 8, memory: 28, connections: 250, ip: "192.168.1.50" },
    { id: "node-worker", name: "celery-worker-queue-01", type: "microservice", status: "healthy", cpu: 5, memory: 45, connections: 8, ip: "192.168.1.80" },
    { id: "node-worker-02", name: "celery-worker-queue-02", type: "microservice", status: "healthy", cpu: 3, memory: 40, connections: 4, ip: "192.168.1.81" },
    { id: "node-redis", name: "redis-l2-state-cache", type: "cache", status: "healthy", cpu: 12, memory: 18, connections: 110, ip: "192.168.1.15" }
  ]);

  const [activeNodeId, setActiveNodeId] = useState<string | null>("node-ai");
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [isDdosAttack, setIsDdosAttack] = useState(false);
  const [isAiThreat, setIsAiThreat] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState<Array<{ id: string; msg: string; type: "error" | "warning" | "info"; time: string }>>([
    { id: "alt-1", msg: "Podłączono bezpieczny system telemetryczny", type: "info", time: "03:15:02" },
    { id: "alt-2", msg: "Inicjalizacja szyfrowania połączeń gRPC", type: "info", time: "03:15:40" }
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Generate initial historical telemetry points
  useEffect(() => {
    const points: TelemetryPoint[] = [];
    const now = new Date();
    for (let i = 12; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 4000);
      points.push({
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        load: Math.floor(Math.random() * 20) + 15,
        response: Math.floor(Math.random() * 30) + 12
      });
    }
    setTelemetry(points);
  }, []);

  // Update telemetry metrics in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setNodes((prevNodes) =>
        prevNodes.map((n) => {
          if (n.status === "rebooting") return n;

          let cpuDelta = (Math.random() - 0.5) * 6;
          let connDelta = Math.floor((Math.random() - 0.5) * 15);

          if (isStressTesting) {
            cpuDelta = (Math.random() * 8) + 12; // spike up
            connDelta = Math.floor(Math.random() * 40) + 30;
          }
          if (isDdosAttack) {
            cpuDelta = (Math.random() * 15) + 20; // extreme spike
            connDelta = Math.floor(Math.random() * 100) + 80;
          }

          const targetCpu = Math.min(Math.max(Math.floor(n.cpu + cpuDelta), 2), 99);
          const targetConn = Math.max(n.connections + connDelta, 0);
          
          let nextStatus: ClusterNode["status"] = "healthy";
          if (targetCpu > 80) nextStatus = "overloaded";

          return {
            ...n,
            cpu: targetCpu,
            connections: targetConn,
            status: nextStatus
          };
        })
      );

      // Add a telemetry graph point
      setTelemetry((prev) => {
        const next = [...prev.slice(1)];
        const currentLoadAvg = Math.floor(
          nodes.reduce((acc, n) => acc + n.cpu, 0) / nodes.length
        );
        const currentRespAvg = isDdosAttack 
          ? Math.floor(Math.random() * 350) + 220 
          : isStressTesting 
          ? Math.floor(Math.random() * 90) + 45 
          : Math.floor(Math.random() * 15) + 12;

        next.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          load: isDdosAttack ? Math.min(98, currentLoadAvg + 40) : currentLoadAvg,
          response: currentRespAvg
        });
        return next;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [isStressTesting, isDdosAttack, nodes]);

  // Visualizer Animation on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || 600;
    let height = canvas.height = 360;

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 360;
      }
    };
    window.addEventListener("resize", handleResize);

    const activeNode = nodes.find(n => n.id === activeNodeId);

    // Positions of our static nodes on a circular topology map
    const nodePositions: Record<string, { x: number; y: number }> = {
      "node-ingress": { x: width * 0.18, y: height * 0.5 },
      "node-ai": { x: width * 0.5, y: height * 0.22 },
      "node-firestore": { x: width * 0.82, y: height * 0.5 },
      "node-worker": { x: width * 0.4, y: height * 0.78 },
      "node-worker-02": { x: width * 0.6, y: height * 0.78 },
      "node-redis": { x: width * 0.5, y: height * 0.5 }
    };

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw connecting server lines with active pulsing packets
      const connectionsList = [
        ["node-ingress", "node-redis"],
        ["node-ingress", "node-ai"],
        ["node-redis", "node-firestore"],
        ["node-redis", "node-worker"],
        ["node-redis", "node-worker-02"],
        ["node-ai", "node-redis"],
        ["node-worker", "node-firestore"],
        ["node-worker-02", "node-firestore"]
      ];

      connectionsList.forEach(([srcId, dstId]) => {
        const src = nodePositions[srcId];
        const dst = nodePositions[dstId];
        if (!src || !dst) return;

        // Draw static connecting cable
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(dst.x, dst.y);
        ctx.strokeStyle = isDdosAttack ? "rgba(239, 68, 68, 0.15)" : "rgba(99, 102, 241, 0.12)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw pulsing data packet flows moving along the cables
        const packetCount = isDdosAttack ? 5 : isStressTesting ? 3 : 1;
        for (let p = 0; p < packetCount; p++) {
          const speedFactor = isDdosAttack ? 0.015 : 0.006;
          const progress = ((frame * speedFactor) + (p / packetCount)) % 1;
          const px = src.x + (dst.x - src.x) * progress;
          const py = src.y + (dst.y - src.y) * progress;

          ctx.beginPath();
          ctx.arc(px, py, isDdosAttack ? 4 : 3, 0, Math.PI * 2);
          ctx.fillStyle = isDdosAttack 
            ? "rgba(239, 68, 68, 0.85)" 
            : isAiThreat && (srcId === "node-ai" || dstId === "node-ai")
            ? "rgba(245, 158, 11, 0.9)"
            : "rgba(99, 102, 241, 0.75)";
          ctx.shadowColor = ctx.fillStyle as string;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      // 2. Draw actual physical/virtual cluster Server Nodes
      nodes.forEach((node) => {
        const pos = nodePositions[node.id];
        if (!pos) return;

        const isCurrentSelected = node.id === activeNodeId;
        const radius = isCurrentSelected ? 26 : 22;

        // Draw server glow effects based on CPU health
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + (Math.sin(frame * 0.05) * 3 + 2), 0, Math.PI * 2);
        if (node.status === "offline") {
          ctx.fillStyle = "rgba(100, 116, 139, 0.05)";
        } else if (node.status === "rebooting") {
          ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
        } else if (node.cpu > 80) {
          ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
        } else {
          ctx.fillStyle = "rgba(99, 102, 241, 0.06)";
        }
        ctx.fill();

        // Draw Server Circle Border
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        if (node.status === "offline") {
          ctx.strokeStyle = "#94a3b8"; // slate-400
        } else if (node.status === "rebooting") {
          ctx.strokeStyle = "#f59e0b"; // amber-500
        } else if (node.cpu > 80) {
          ctx.strokeStyle = "#ef4444"; // red-500
        } else {
          ctx.strokeStyle = "#6366f1"; // indigo-500
        }
        ctx.lineWidth = isCurrentSelected ? 3 : 1.5;
        ctx.stroke();

        // Server Inner Solid Color
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius - 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // Dynamic Status Dot Inside server
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 4, 4, 0, Math.PI * 2);
        if (node.status === "offline") {
          ctx.fillStyle = "#64748b";
        } else if (node.status === "rebooting") {
          ctx.fillStyle = "#f59e0b";
        } else if (node.cpu > 80) {
          ctx.fillStyle = "#ef4444";
        } else {
          ctx.fillStyle = "#10b981"; // emerald-500
        }
        ctx.fill();

        // Draw short visual labels
        ctx.fillStyle = "#1e293b"; // slate-800
        ctx.font = "bold 9px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        
        let displayShort = node.name.substring(0, 10);
        if (node.type === "ai") displayShort = "gemini-api";
        if (node.type === "gateway") displayShort = "nginx-ing";
        if (node.type === "database") displayShort = "firestore";

        ctx.fillText(displayShort, pos.x, pos.y + 11);

        // CPU text hovering over the node for quick monitoring
        if (node.status !== "offline" && node.status !== "rebooting") {
          ctx.fillStyle = node.cpu > 80 ? "#ef4444" : "#475569";
          ctx.font = "bold 8px 'JetBrains Mono', monospace";
          ctx.fillText(`${node.cpu}%`, pos.x, pos.y - 12);
        } else if (node.status === "rebooting") {
          ctx.fillStyle = "#f59e0b";
          ctx.font = "bold 7px sans-serif";
          ctx.fillText("REBOOT", pos.x, pos.y - 12);
        }
      });

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [nodes, activeNodeId, isStressTesting, isDdosAttack, isAiThreat]);

  // Node Actions
  const handleRebootNode = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          return { ...n, status: "rebooting", cpu: 0, connections: 0 };
        }
        return n;
      })
    );

    const logMsg = `Wywołano restart kontenera dla ${id}. Trwa sekwencja restartu...`;
    addAlert(logMsg, "warning");
    toast.warning(`Kontener ${id} jest restartowany.`);

    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === id) {
            return { ...n, status: "healthy", cpu: 12, connections: 10 };
          }
          return n;
        })
      );
      addAlert(`Pomyślnie zrekompilowano i przywrócono kontener: ${id}`, "info");
      toast.success(`Kontener ${id} pomyślnie wstał i przeszedł testy health-check!`);
    }, 5000);
  };

  const handleDrainConnections = (id: string) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          return { ...n, connections: 0, cpu: 2 };
        }
        return n;
      })
    );
    addAlert(`Opróżniono kolejki zadań (Drain logs) na węźle ${id}.`, "info");
    toast.info(`Ruch na węźle ${id} został przekierowany na serwery zapasowe.`);
  };

  const addAlert = (msg: string, type: "error" | "warning" | "info") => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSystemAlerts((prev) => [
      { id: Math.random().toString(), msg, type, time: timeStr },
      ...prev.slice(0, 15)
    ]);
  };

  // Simulation Triggers
  const triggerStressTest = () => {
    if (isDdosAttack) {
      toast.error("Anuluj najpierw atak DDOS przed włączeniem normalnego testu.");
      return;
    }
    const nextState = !isStressTesting;
    setIsStressTesting(nextState);
    if (nextState) {
      addAlert("Uruchomiono symulację obciążenia klastra (Stress Test)", "warning");
      toast.info("Generowanie sztucznego ruchu testowego: 450 req/s...");
    } else {
      addAlert("Zakończono symulację obciążenia", "info");
      toast.success("Klaster powrócił do nominalnego poziomu obciążenia.");
    }
  };

  const triggerDdosAttack = () => {
    const nextState = !isDdosAttack;
    setIsDdosAttack(nextState);
    if (nextState) {
      setIsStressTesting(false);
      addAlert("🚨 WYKRYTO ATAK DDOS! 12,500 zapytaj/s z zainfekowanych węzłów botnetu!", "error");
      toast.error("ALERT CYBERBEZPIECZEŃSTWA: Wykryto atak wolumetryczny!");
      
      // Auto-escalation trigger in 4 seconds
      setTimeout(() => {
        addAlert("🛡️ Wdrożono Cloudflare Magic Transit & Ingress Rate Limiter", "info");
        toast.success("System automatycznie aktywował filtry ochrony przed DDOS.");
      }, 4000);
    } else {
      addAlert("Atak DDOS ustał. Środowisko powraca do stabilności.", "info");
      toast.success("Nominalna drożność ruchu przywrócona.");
    }
  };

  const triggerAiThreat = () => {
    const nextState = !isAiThreat;
    setIsAiThreat(nextState);
    if (nextState) {
      addAlert("⚠️ Blokada ataku typu Prompt Injection na węźle AI!", "error");
      addAlert("🔒 Gemini AI Safety Guardrails przechwycił instrukcję 'Ignore prior instructions...'", "warning");
      toast.warning("Wykryto i unieszkodliwiono próbę obejścia filtrów AI!");
    } else {
      setIsAiThreat(false);
    }
  };

  const selectedNode = nodes.find((n) => n.id === activeNodeId);

  return (
    <div id="cluster-visualizer-container" className="grid gap-6 lg:grid-cols-12">
      {/* Topology Canvas Board */}
      <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col">
        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Topologia Klastra Chmurowego (Live Grid)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Interaktywna mapa sieciowa oparta na technologii WebSocket Sync. Kliknij serwer, aby zarządzać.
            </p>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={triggerStressTest}
              className={`px-3 py-1.5 rounded-lg text-xxs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                isStressTesting 
                  ? "bg-amber-100 text-amber-800 border border-amber-200" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Test Obciążenia</span>
            </button>
            <button
              onClick={triggerDdosAttack}
              className={`px-3 py-1.5 rounded-lg text-xxs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                isDdosAttack 
                  ? "bg-rose-600 text-white shadow-xs" 
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Symuluj DDOS</span>
            </button>
            <button
              onClick={triggerAiThreat}
              className={`px-3 py-1.5 rounded-lg text-xxs font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                isAiThreat 
                  ? "bg-amber-500 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>AI Injection</span>
            </button>
          </div>
        </div>

        <div className="relative bg-slate-950/2 flex-1 min-h-[300px] flex items-center justify-center p-2">
          {/* Canvas renders topology nodes */}
          <canvas ref={canvasRef} className="block w-full h-[360px]" />

          {/* Quick Node Overlay Buttons to simplify clicking */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full">
              {Object.entries({
                "node-ingress": { left: "12%", top: "42%" },
                "node-ai": { left: "45%", top: "14%" },
                "node-firestore": { left: "77%", top: "42%" },
                "node-worker": { left: "34%", top: "72%" },
                "node-worker-02": { left: "55%", top: "72%" },
                "node-redis": { left: "45%", top: "42%" }
              }).map(([id, pos]) => (
                <button
                  key={id}
                  onClick={() => setActiveNodeId(id)}
                  style={{ left: pos.left, top: pos.top }}
                  className="absolute pointer-events-auto w-12 h-12 -ml-6 -mt-6 rounded-full opacity-0 hover:opacity-10 cursor-pointer bg-indigo-500"
                  title={`Wybierz węzeł: ${id}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Real-time statistics bars */}
        <div className="border-t border-slate-100 bg-slate-50/30 p-4 grid gap-4 grid-cols-2 md:grid-cols-4 text-xs">
          <div className="space-y-1">
            <span className="text-xxs font-semibold uppercase text-slate-400">Ogólne CPU</span>
            <div className="flex items-center gap-2 font-mono font-bold text-slate-900">
              <Cpu className="h-4 w-4 text-slate-500" />
              <span>
                {Math.floor(nodes.reduce((acc, n) => acc + n.cpu, 0) / nodes.length)}%
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xxs font-semibold uppercase text-slate-400">Łączna Przepustowość</span>
            <div className="flex items-center gap-2 font-mono font-bold text-slate-900">
              <Activity className="h-4 w-4 text-indigo-500" />
              <span>
                {isDdosAttack ? "24,810 req/s" : isStressTesting ? "3,480 req/s" : "284 req/s"}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xxs font-semibold uppercase text-slate-400">Węzły Aktywne</span>
            <div className="flex items-center gap-2 font-mono font-bold text-slate-900">
              <Server className="h-4 w-4 text-emerald-500" />
              <span>
                {nodes.filter(n => n.status !== "offline" && n.status !== "rebooting").length} / {nodes.length}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xxs font-semibold uppercase text-slate-400">Bezpieczeństwo (WAF)</span>
            <div className="flex items-center gap-2 font-mono font-bold text-slate-900">
              <Lock className={`h-4 w-4 ${isDdosAttack || isAiThreat ? "text-rose-500" : "text-emerald-500"}`} />
              <span className={isDdosAttack || isAiThreat ? "text-rose-600 animate-pulse" : "text-emerald-600"}>
                {isDdosAttack ? "MITIGATION MODE" : isAiThreat ? "ATTACK INTERCEPTED" : "ACTIVE & SECURE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Details & Action Panel */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {selectedNode ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col gap-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700 font-mono">
                  {selectedNode.type} Węzeł
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-mono mt-1">
                  {selectedNode.name}
                </h4>
              </div>
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                selectedNode.status === "healthy" ? "bg-emerald-50 text-emerald-700" :
                selectedNode.status === "rebooting" ? "bg-amber-50 text-amber-700 animate-pulse" : "bg-rose-50 text-rose-700"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  selectedNode.status === "healthy" ? "bg-emerald-500" :
                  selectedNode.status === "rebooting" ? "bg-amber-500" : "bg-rose-500"
                }`} />
                <span>{selectedNode.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Obciążenie CPU</span>
                <p className="text-base font-bold font-mono text-slate-900">{selectedNode.cpu}%</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Użycie RAM</span>
                <p className="text-base font-bold font-mono text-slate-900">{selectedNode.memory}%</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Aktywne Sockety</span>
                <p className="text-base font-bold font-mono text-slate-900">{selectedNode.connections}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Wewnętrzne IP</span>
                <p className="text-xs font-bold font-mono text-slate-500">{selectedNode.ip}</p>
              </div>
            </div>

            {/* Micro-actions */}
            <div className="space-y-2 pt-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Operacje Administratorskie (gRPC)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRebootNode(selectedNode.id)}
                  disabled={selectedNode.status === "rebooting"}
                  className="flex-1 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xxs font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="h-3.5 w-3.5 text-slate-400" />
                  <span>Restartuj Pod</span>
                </button>
                <button
                  onClick={() => handleDrainConnections(selectedNode.id)}
                  disabled={selectedNode.status === "rebooting"}
                  className="flex-1 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xxs font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                  <span>Drain Traffic</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-center text-xs text-slate-400 py-12">
            <Server className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p>Kliknij dowolny węzeł na mapie sieciowej, aby otworzyć bezpieczną konsolę gRPC.</p>
          </div>
        )}

        {/* Real-time System Alert Log Terminal */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 text-slate-200 shadow-lg flex-1 flex flex-col min-h-[180px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-xxs font-mono font-bold uppercase text-slate-400 tracking-wider">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              <span>Compliance & Guardrail Audit Log</span>
            </div>
            <span className="animate-pulse text-emerald-400 font-bold">● ONLINE</span>
          </div>

          <div className="flex-1 font-mono text-[10px] leading-relaxed space-y-1.5 overflow-y-auto max-h-[160px] scrollbar-thin scrollbar-thumb-slate-800">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-1">
                <span className="text-slate-500 shrink-0 select-none">[{alert.time}]</span>
                <span className={
                  alert.type === "error" ? "text-rose-400" :
                  alert.type === "warning" ? "text-amber-400" : "text-cyan-400"
                }>
                  {alert.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
