import { useState, useEffect, useRef, FormEvent } from "react";
import { Member } from "../types/member";
import { Project } from "../types/team";
import { Task, PullRequest, LogLine } from "../types/activity";
import { 
  DollarSign, ArrowDownToLine, GitPullRequest, GitMerge, FileCode, CheckSquare, 
  Terminal, Play, Cpu, Server, HardDrive, BarChart3, Search, BookOpen, 
  ChevronRight, Folder, RefreshCw, Layers, ShieldCheck, Activity, Users, Send
} from "lucide-react";
import { toast } from "sonner";
import { KnowledgeBaseReader } from "./KnowledgeBaseReader";
import { ExecutiveReports } from "./ExecutiveReports";
import { ApiDocumentation } from "./ApiDocumentation";
import { TeamActivityFeed } from "./TeamActivityFeed";

interface TeamActivityProps {
  activeTab: string;
  projects: Project[];
  members: Member[];
  tasks: Task[];
  prs: PullRequest[];
  activeMember: Member | null;
  onUpdateTaskStatus: (id: string, status: Task["status"]) => void;
  onAddTask: (task: Omit<Task, "id" | "projectName">) => void;
  onCreatePR: (pr: Omit<PullRequest, "id" | "status" | "createdAt" | "projectName">) => void;
  onUpdatePRStatus: (id: string, status: "open" | "merged" | "closed") => void;
  logAction: (actor: Member, action: string, target: string, category: any, details?: string) => void;
}

export function TeamActivity({
  activeTab,
  projects,
  members,
  tasks,
  prs,
  activeMember,
  onUpdateTaskStatus,
  onAddTask,
  onCreatePR,
  onUpdatePRStatus,
  logAction
}: TeamActivityProps) {
  // Common states
  const [searchQuery, setSearchQuery] = useState("");

  // 1. REVENUE (Owner)
  const revenueTrend = [
    { month: "Styczeń", amt: 125000 },
    { month: "Luty", amt: 142000 },
    { month: "Marzec", amt: 188000 },
    { month: "Kwiecień", amt: 210000 },
    { month: "Maj", amt: 295000 },
    { month: "Czerwiec", amt: 555000 }
  ];
  const maxRevenueVal = 600000;

  // 2. KANBAN (Developer: Assigned Tasks)
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskProj, setNewTaskProj] = useState(projects[0]?.id || "");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !activeMember) return;
    try {
      await onAddTask({
        projectId: newTaskProj,
        title: newTaskTitle,
        status: "todo",
        assignedTo: activeMember.id, // Assign to self
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        priority: newTaskPriority
      });
      
      logAction(
        activeMember,
        "created task",
        `'${newTaskTitle}' for own taskboard`,
        "project",
        `Assigned to developer identity.`
      );
      toast.success(`Utworzono nowe zadanie: "${newTaskTitle}"`);
      setNewTaskTitle("");
    } catch (err: any) {
      toast.error("Błąd tworzenia zadania: " + err.message);
    }
  };

  const moveTask = async (taskId: string, newStatus: Task["status"]) => {
    try {
      await onUpdateTaskStatus(taskId, newStatus);
      const task = tasks.find((t) => t.id === taskId);
      if (activeMember && task) {
        logAction(
          activeMember,
          "updated task",
          `'${task.title}' → ${newStatus.toUpperCase()}`,
          "project",
          `Sprint boards updated.`
        );
      }
      toast.success("Zaktualizowano status zadania.");
    } catch (err: any) {
      toast.error("Błąd aktualizacji statusu: " + err.message);
    }
  };

  // 3. REPO FILES (Developer: Repository files)
  const [selectedFileRepo, setSelectedFileRepo] = useState(projects[0]?.id || "");
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const repoFiles: Record<string, Array<{ path: string; language: string; content: string }>> = {
    proj_1: [
      { path: "src/server.ts", language: "typescript", content: "import express from 'express';\nconst app = express();\n\n// JWT verification middleware\napp.use('/api', (req, res, next) => {\n  const token = req.headers.authorization;\n  if (!token) return res.status(401).json({ error: 'MFA clearance required' });\n  next();\n});\n\napp.listen(3000);" },
      { path: "src/auth/webauthn.ts", language: "typescript", content: "export async function generateChallenge(userId: string) {\n  const challenge = crypto.getRandomValues(new Uint8Array(32));\n  // Store in cache with 120s TTL\n  return challenge;\n}" },
      { path: "package.json", language: "json", content: "{\n  \"name\": \"auth-service\",\n  \"dependencies\": {\n    \"@google/genai\": \"^2.4.0\",\n    \"jose\": \"^5.2.0\"\n  }\n}" }
    ],
    proj_2: [
      { path: "src/stripe/client.ts", language: "typescript", content: "import Stripe from 'stripe';\n\nconst stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {\n  apiVersion: '2024-04-12'\n});\n\nexport async function captureCharge(amount: number) {\n  return stripe.charges.create({ amount, currency: 'usd' });\n}" },
      { path: "src/db/migrations.sql", language: "sql", content: "CREATE TABLE invoices (\n  id VARCHAR(64) PRIMARY KEY,\n  amount DECIMAL(12, 2),\n  currency VARCHAR(3),\n  status VARCHAR(20)\n);" }
    ],
    proj_3: [
      { path: "src/App.tsx", language: "typescript", content: "import React from 'react';\nimport { View, Text } from 'react-native';\n\nexport default function App() {\n  return (\n    <View style={{ flex: 1, justify: 'center' }}>\n      <Text>Secure Ledger v1.4</Text>\n    </View>\n  );\n}" }
    ]
  };

  // 4. PULL REQUESTS (Developer: Review)
  const [showPrForm, setShowPrForm] = useState(false);
  const [prTitle, setPrTitle] = useState("");
  const [prProj, setPrProj] = useState(projects[0]?.id || "");
  const [prBranch, setPrBranch] = useState("feature/nowe-api");

  const handleCreatePr = async (e: FormEvent) => {
    e.preventDefault();
    if (!prTitle || !activeMember) return;
    try {
      await onCreatePR({
        projectId: prProj,
        title: prTitle,
        author: activeMember.id,
        branch: prBranch
      });
      logAction(
        activeMember,
        "opened pull_request",
        `'${prTitle}' branch: ${prBranch}`,
        "project",
        `Review requested.`
      );
      toast.success(`Zgłoszono nowy Pull Request: "${prTitle}"!`);
      setPrTitle("");
      setShowPrForm(false);
    } catch (err: any) {
      toast.error("Błąd tworzenia Pull Requesta: " + err.message);
    }
  };

  const handleMergePr = async (pr: PullRequest) => {
    try {
      await onUpdatePRStatus(pr.id, "merged");
      if (activeMember) {
        logAction(
          activeMember,
          "merged pull_request",
          `PR-${pr.id}: '${pr.title}' to main branch`,
          "project",
          `Continuous Integration triggers automatically engaged.`
        );
      }
      toast.success(`Pull Request #${pr.id} został pomyślnie scalony!`);
    } catch (err: any) {
      toast.error("Błąd scalania Pull Requesta: " + err.message);
    }
  };

  // 5. RUNTIME LOGS (Developer: Live standard outs)
  const [logsLines, setLogsLines] = useState<LogLine[]>([
    { id: "1", timestamp: "13:40:11", level: "info", service: "AuthService", message: "Instancja klastra uruchomiona pomyślnie na porcie 3000." },
    { id: "2", timestamp: "13:40:15", level: "info", service: "AuthService", message: "Dane uwierzytelniające bazy danych zweryfikowane. Uścisk dłoni TLS zakończony." },
    { id: "3", timestamp: "13:42:01", level: "warn", service: "Gateway", message: "Przekroczono limit zapytań (Rate Limit) dla adresu IP 84.120.21.4" },
    { id: "4", timestamp: "13:45:10", level: "info", service: "BillingEngine", message: "Wysłano webhooki rozliczeń do Stripe. Kod odpowiedzi: 200." }
  ]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Roll logs dynamically
  useEffect(() => {
    if (activeTab !== "runtime_logs") return;
    const interval = setInterval(() => {
      const msgs = [
        { level: "info" as const, service: "AuthService", message: "Wygenerowano pomyślnie wezwanie MFA dla user_id mem_3." },
        { level: "info" as const, service: "Gateway", message: "GET /api/v1/projects 200 OK - 8ms" },
        { level: "warn" as const, service: "SecurityIngestion", message: "Wykryto próbę połączenia SSH w podsieci node-9b od andrzej_root." },
        { level: "error" as const, service: "PaymentGateway", message: "Ostrzeżenie połączenia ze Stripe: limit czasu odczytu przekroczony (próba 1/3)" },
        { level: "info" as const, service: "DockerWorker", message: "Oczyszczanie pamięci zakończone pomyślnie. Zwolniono 142MB pamięci RAM." }
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      const now = new Date();
      const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      
      setLogsLines((prev) => [
        ...prev.slice(-30), // keep last 30
        { id: String(Date.now()), timestamp, ...randomMsg }
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logsLines, activeTab]);

  // 6. DEPLOYMENTS (Admin)
  const [clusterStatus, setClusterStatus] = useState<"healthy" | "deploying" | "failed">("healthy");
  const [progressVal, setProgressVal] = useState(100);

  const triggerClusterRebuild = () => {
    if (clusterStatus === "deploying") return;
    setClusterStatus("deploying");
    setProgressVal(10);
    toast.info("Uruchomiono przebudowę mikro-klastra AWS ECS...");
    
    if (activeMember) {
      logAction(
        activeMember,
        "triggered deployment",
        "AWS Elastic Container cluster rebuild",
        "security",
        "Executing rolling replacement of runtime services."
      );
    }

    const interval = setInterval(() => {
      setProgressVal((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setClusterStatus("healthy");
          toast.success("Wdrożenie zakończone! Klastry są w pełni zsynchronizowane.");
          return 100;
        }
        return prev + 15;
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* 1. REVENUE TAB */}
      {activeTab === "revenue" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">Przychody i Fakturowanie</h2>
            <p className="text-xs text-slate-500 font-sans">Wskaźniki przychodów brutto portfela korporacyjnego, fakturowanie i prognozy wzrostu.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* SVG Interactive Chart Card */}
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-xxs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 font-mono">Historia Przychodów Brutto (USD)</h3>
              
              {/* Custom SVG Line Chart */}
              <div className="relative h-60 w-full">
                {/* Horizontal gridlines */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const yVal = 200 - i * 40;
                  const labelVal = Math.round((i * maxRevenueVal) / 4);
                  return (
                    <div key={i} className="absolute w-full flex items-center text-[10px] font-mono text-slate-400" style={{ top: `${yVal}px` }}>
                      <span className="w-12 shrink-0">${labelVal >= 1000 ? `${labelVal/1000}k` : labelVal}</span>
                      <div className="flex-1 border-t border-slate-100 border-dashed"></div>
                    </div>
                  );
                })}

                {/* SVG path mapping */}
                <svg viewBox="0 0 500 200" className="absolute left-12 top-0 h-[200px] w-[calc(100%-48px)] overflow-visible">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area fill */}
                  <path
                    d={`M 0,${200 - (revenueTrend[0].amt / maxRevenueVal) * 200} 
                        L 100,${200 - (revenueTrend[1].amt / maxRevenueVal) * 200} 
                        L 200,${200 - (revenueTrend[2].amt / maxRevenueVal) * 200} 
                        L 300,${200 - (revenueTrend[3].amt / maxRevenueVal) * 200} 
                        L 400,${200 - (revenueTrend[4].amt / maxRevenueVal) * 200} 
                        L 500,${200 - (revenueTrend[5].amt / maxRevenueVal) * 200} 
                        L 500,200 L 0,200 Z`}
                    fill="url(#chartGrad)"
                    className="transition-all duration-300"
                  />

                  {/* Stroke path */}
                  <path
                    d={`M 0,${200 - (revenueTrend[0].amt / maxRevenueVal) * 200} 
                        L 100,${200 - (revenueTrend[1].amt / maxRevenueVal) * 200} 
                        L 200,${200 - (revenueTrend[2].amt / maxRevenueVal) * 200} 
                        L 300,${200 - (revenueTrend[3].amt / maxRevenueVal) * 200} 
                        L 400,${200 - (revenueTrend[4].amt / maxRevenueVal) * 200} 
                        L 500,${200 - (revenueTrend[5].amt / maxRevenueVal) * 200}`}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />

                  {/* Draw circles on points */}
                  {revenueTrend.map((pt, idx) => {
                    const cx = idx * 100;
                    const cy = 200 - (pt.amt / maxRevenueVal) * 200;
                    return (
                      <g key={idx} className="group/dot cursor-pointer">
                        <circle
                          cx={cx}
                          cy={cy}
                          r="5"
                          fill="#ffffff"
                          stroke="#4f46e5"
                          strokeWidth="3"
                          className="hover:r-7 transition-all duration-100"
                        />
                        {/* Tooltip on hover */}
                        <foreignObject x={cx - 30} y={cy - 35} width="60" height="25" className="opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-slate-900 text-white rounded px-1 py-0.5 text-[9px] font-bold text-center font-mono">
                            ${pt.amt / 1000}k
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })}
                </svg>

                {/* X labels */}
                <div className="absolute left-12 top-[215px] w-[calc(100%-48px)] flex justify-between text-[10px] font-mono text-slate-400">
                  {revenueTrend.map((pt, idx) => (
                    <span key={idx} className="w-[80px] text-center">{pt.month}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick action items */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xxs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 font-mono">Lista Zgodności Finansowej</h3>
                <div className="space-y-3.5 text-xs text-slate-700">
                  <div className="flex gap-2 items-start">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Audyty kwartalne zatwierdzone przez SEC</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Zabezpieczenie ryzyka kursowego aktywne</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Klucz weryfikacyjny podpisów webhooków Stripe aktywny</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer">
                <ArrowDownToLine className="h-4 w-4" />
                <span>Eksportuj Księgę GAAP (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVITY TAB (Admin audit logs trigger) */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Strumień Operacyjny w Czasie Rzeczywistym</h2>
            <p className="text-xs text-slate-500">Podgląd na żywo zmian strukturalnych, awansów uprawnień oraz wdrożeń kodu.</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtruj logi zdarzeń po wykonawcy, akcji lub celu..."
                className="w-full h-10 rounded-lg border border-slate-200 pl-10 pr-4 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="divide-y divide-slate-100 font-mono text-xs text-slate-600">
              {/* Re-use standard audit items styled for admin stream */}
              {members.slice(0, 4).map((m, idx) => (
                <div key={idx} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                    <span className="text-slate-400">[{m.lastActive}]</span>
                    <span className="font-semibold text-slate-900">{m.name}</span>
                    <span className="text-slate-500">odpytał zasoby bazowe w dziale</span>
                    <span className="rounded bg-slate-100 px-1 py-0.2 text-[10px] font-bold text-slate-700">{m.department}</span>
                  </div>
                  <span className="text-xxs text-slate-400">Połączenie: OK</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. DEPLOYMENTS */}
      {activeTab === "deployments" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Usługi i Kontenery w Chmurze</h2>
              <p className="text-xs text-slate-500">Monitoruj stan serwerów, opóźnienia i uruchamiaj aktualizacje mikrousług.</p>
            </div>
            <button
              onClick={triggerClusterRebuild}
              disabled={clusterStatus === "deploying"}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${clusterStatus === "deploying" ? "animate-spin" : ""}`} />
              <span>{clusterStatus === "deploying" ? "Trwa Wdrażanie Zmian..." : "Wymuś Przebudowę Potoku"}</span>
            </button>
          </div>

          {/* Progress bar for rebuild */}
          {clusterStatus === "deploying" && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold">
                <span>Wdrażanie mikro-klastra AWS ECS Fargate...</span>
                <span>{progressVal}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-600 transition-all duration-300" style={{ width: `${progressVal}%` }}></div>
              </div>
            </div>
          )}

          {/* Clusters Cards */}
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            {projects.map((proj) => {
              const versionStr = proj.id === "proj_1" ? "v1.3.4" : proj.id === "proj_2" ? "v2.1.0-rc3" : "v1.0.0-gold";
              return (
                <div key={proj.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{proj.name} Cluster</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xxs font-semibold text-emerald-700 border border-emerald-200 font-mono">
                      ● AKTYWNY
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-500 font-mono text-xxs">
                    <div className="flex justify-between">
                      <span>Wersja Obrazu:</span>
                      <span className="text-slate-800 font-semibold">{versionStr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cel Usługi:</span>
                      <span className="text-slate-800 font-semibold">port-3000-ingress</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Obciążenie:</span>
                      <span className="text-slate-800 font-semibold">0.45% CPU</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PLATFORM ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Stan Infrastruktury Wirtualnej</h2>
            <p className="text-xs text-slate-500 font-sans">Statystyki na żywo: obciążenie obliczeniowe, transfer wychodzący i pamięć masowa.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
                <Cpu className="h-4 w-4" />
                <span>Obciążenie Procesora Klastra</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">22.4%</h3>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: "22.4%" }}></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs">
                <HardDrive className="h-4 w-4" />
                <span>Zużycie Dysków SSD</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">8.92 GB</h3>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: "35%" }}></div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-2 text-pink-600 font-semibold text-xs">
                <Activity className="h-4 w-4" />
                <span>Transfer Sieciowy Wychodzący</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">2.4 MB/s</h3>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500" style={{ width: "12%" }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE SPRINT BOARD TASKS */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Przypisana Tablica Sprintu</h2>
              <p className="text-xs text-slate-500">Interaktywne karty Kanban. Przesuwaj zadania od backlogu po pełne wdrożenie.</p>
            </div>
          </div>

          {/* Quick inline insert task form */}
          <form onSubmit={handleCreateTask} className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Utwórz przypisane do siebie zadanie</label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Napisać walidacje punktów końcowych..."
                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Projekt</label>
              <select
                value={newTaskProj}
                onChange={(e) => setNewTaskProj(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs focus:outline-hidden"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Priorytet</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs focus:outline-hidden"
              >
                <option value="low">Niski</option>
                <option value="medium">Średni</option>
                <option value="high">Wysoki</option>
              </select>
            </div>
            <button
              type="submit"
              className="h-9 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
            >
              Dodaj Zadanie
            </button>
          </form>

          {/* Sprint Columns Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            {(["todo", "in-progress", "review", "done"] as Task["status"][]).map((status) => {
              const colTasks = tasks.filter((t) => t.status === status);
              return (
                <div key={status} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3.5 min-h-[300px]">
                  <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {status === "todo" ? "Do Zrobienia" : status === "in-progress" ? "W Toku" : status === "review" ? "Weryfikacja" : "Gotowe"}
                    </span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 font-mono">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {colTasks.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center py-6 font-mono">Brak zadań w tej kolumnie</p>
                    ) : (
                      colTasks.map((task) => (
                        <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-xxs space-y-2.5 hover:border-slate-300 transition-colors">
                          <p className="text-xs font-semibold text-slate-800 leading-snug">{task.title}</p>
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[9px] font-mono text-slate-400">
                            <span className="text-slate-500 font-bold">{task.projectName}</span>
                            <span className={`px-1.5 rounded-sm font-bold ${
                              task.priority === "high" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                              task.priority === "medium" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-100 text-slate-500"
                            }`}>
                              {task.priority === "high" ? "WYSOKI" : task.priority === "medium" ? "ŚREDNI" : "NISKI"}
                            </span>
                          </div>

                          {/* Quick action triggers */}
                          <div className="flex gap-1.5 pt-1.5 border-t border-slate-100 justify-end">
                            {status !== "todo" && (
                              <button
                                onClick={() => {
                                  const idx = (["todo", "in-progress", "review", "done"] as Task["status"][]).indexOf(status);
                                  moveTask(task.id, (["todo", "in-progress", "review", "done"] as Task["status"][])[idx - 1]);
                                }}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                              >
                                ← Wstecz
                              </button>
                            )}
                            {status !== "done" && (
                              <button
                                onClick={() => {
                                  const idx = (["todo", "in-progress", "review", "done"] as Task["status"][]).indexOf(status);
                                  moveTask(task.id, (["todo", "in-progress", "review", "done"] as Task["status"][])[idx + 1]);
                                }}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                              >
                                Dalej →
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. REPOSITORY GIT FILE TREE */}
      {activeTab === "files" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Eksplorator Plików Repozytorium</h2>
            <p className="text-xs text-slate-500">Wybierz aktywne repozytorium i przeglądaj struktury plików źródłowych.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">Wybierz Repozytorium</label>
                <select
                  value={selectedFileRepo}
                  onChange={(e) => {
                    setSelectedFileRepo(e.target.value);
                    setSelectedFileContent(null);
                  }}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Nested interactive files */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 py-1 uppercase tracking-wide font-mono">
                  <span>Drzewo Źródeł Przestrzeni</span>
                </div>
                {(repoFiles[selectedFileRepo] || []).map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFileContent(file.content)}
                    className="flex items-center gap-2.5 w-full rounded-md px-2.5 py-1.5 text-left text-xs font-mono text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer animate-fadeIn"
                  >
                    <Folder className="h-4 w-4 text-amber-500" />
                    <span>{file.path}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content view */}
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-900 p-5 text-slate-300 font-mono text-xs overflow-x-auto min-h-[300px]">
              {selectedFileContent ? (
                <pre className="leading-relaxed whitespace-pre">{selectedFileContent}</pre>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-slate-500 py-12">
                  <FileCode className="h-10 w-10 text-slate-700 mb-2" />
                  <p>Wybierz plik z drzewa katalogów po lewej stronie, aby wyświetlić zawartość.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. PULL REQUESTS */}
      {activeTab === "pull_requests" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Biurko Przeglądu Kodu (Pull Requests)</h2>
              <p className="text-xs text-slate-500">Przeglądaj kod, uruchamiaj testy integracyjne i zatwierdzaj scalenia z główną gałęzią.</p>
            </div>
            <button
              onClick={() => setShowPrForm(!showPrForm)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 cursor-pointer"
            >
              <GitPullRequest className="h-4 w-4" />
              <span>Utwórz Pull Request</span>
            </button>
          </div>

          {showPrForm && (
            <form onSubmit={handleCreatePr} className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">Zaproponuj Scalenie Nowej Funkcji</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  required
                  value={prTitle}
                  onChange={(e) => setPrTitle(e.target.value)}
                  placeholder="feat: szyfrowanie danych w bazie..."
                  className="rounded-lg border border-slate-200 bg-white px-3 text-xs h-10 focus:border-indigo-500"
                />
                <select
                  value={prProj}
                  onChange={(e) => setPrProj(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 text-xs h-10"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={prBranch}
                  onChange={(e) => setPrBranch(e.target.value)}
                  placeholder="feature/crypto-encryption"
                  className="rounded-lg border border-slate-200 bg-white px-3 text-xs h-10 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2.5">
                <button type="submit" className="px-4 h-9 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer">
                  Zgłoś Pull Request
                </button>
              </div>
            </form>
          )}

          {/* List of PRs */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 text-xs text-slate-700">
              {prs.map((pr) => {
                const authorUser = members.find((m) => m.id === pr.author);
                return (
                  <div key={pr.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 leading-tight text-sm">{pr.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{pr.id}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5 text-slate-400 text-[10px] font-mono">
                        <span className="font-bold text-slate-600 uppercase bg-slate-50 px-1 border rounded-xs">{pr.projectName}</span>
                        <span>•</span>
                        <span>Autor: {authorUser?.name || "Viewer"}</span>
                        <span>•</span>
                        <span>Gałąź: {pr.branch}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {pr.status === "open" ? (
                        <button
                          onClick={() => handleMergePr(pr)}
                          className="inline-flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer"
                        >
                          <GitMerge className="h-3.5 w-3.5" />
                          <span>Zatwierdź i Scal</span>
                        </button>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 font-mono uppercase">
                          ✓ Scalono z gałęzią główną
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 8. RUNTIME LIVE LOGS */}
      {activeTab === "runtime_logs" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Konsola Logów Aplikacji na Żywo</h2>
            <p className="text-xs text-slate-500">Przewijany potok logów systemowych mikrousług. Dane odświeżane są w czasie rzeczywistym.</p>
          </div>

          <div className="rounded-xl bg-slate-950 p-5 border border-slate-800 text-slate-300 font-mono text-[11px] h-[340px] overflow-y-auto space-y-1.5">
            {logsLines.map((line) => (
              <div key={line.id} className="flex gap-2 leading-relaxed">
                <span className="text-slate-500 shrink-0">{line.timestamp}</span>
                <span className={`uppercase font-bold shrink-0 ${
                  line.level === "info" ? "text-cyan-400" :
                  line.level === "warn" ? "text-amber-400" : "text-rose-500"
                }`}>
                  [{line.level}]
                </span>
                <span className="text-indigo-400 font-semibold shrink-0">{line.service}:</span>
                <span className="text-slate-200">{line.message}</span>
              </div>
            ))}
            <div ref={consoleBottomRef} />
          </div>
        </div>
      )}

      {/* 9. VIEWER REPORTS & KNOWLEDGE BASE */}
      {activeTab === "reports" && (
        <ExecutiveReports activeMember={activeMember} />
      )}
      {activeTab === "documentation" && (
        <ApiDocumentation />
      )}
      {activeTab === "knowledge_base" && (
        <KnowledgeBaseReader activeMember={activeMember} />
      )}
      {activeTab === "activity_feed" && (
        <TeamActivityFeed />
      )}
    </div>
  );
}
