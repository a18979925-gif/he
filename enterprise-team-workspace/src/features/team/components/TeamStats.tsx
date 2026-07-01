import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Member } from "../types/member";
import { Project } from "../types/team";
import { Task, PullRequest } from "../types/activity";
import { useFirebaseTeam } from "../context/FirebaseTeamContext";
import { 
  TrendingUp, Users, FolderKanban, CheckSquare, GitPullRequest, Database, 
  ShieldCheck, Activity, ChevronRight, Play, FileText, BookOpen, ExternalLink, 
  Sparkles, Terminal, Code, Cpu, HardDrive, Shield, CheckCircle2, AlertTriangle, 
  HelpCircle, X, Search, FileDown, Copy, Check, Info, Server, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface TeamStatsProps {
  activeMember: Member | null;
  projects: Project[];
  members: Member[];
  tasks: Task[];
  prs: PullRequest[];
  onTabChange: (id: string) => void;
}

// Pre-packaged high-value Knowledge Base playbooks
const KNOWLEDGE_BASE_DOCS = [
  {
    id: "sso-handbook",
    title: "Podręcznik Integracji SSO (v2.1)",
    category: "Security & MFA",
    updatedAt: "2026-06-15",
    content: `## INTEGRACJA SSO (SINGLE SIGN-ON) - SPECYFIKACJA ENTERPRISE
Ta dokumentacja określa standardy uwierzytelniania klastra z dostawcami tożsamości (IdP) takimi jak Okta, Azure AD oraz Google Workspace.

### 1. Protokoły i Standardy
Wszystkie integracje opierają się na standardzie **SAML 2.0** lub **OIDC (OpenID Connect)**.
- **SAML Metadata URL:** \`https://auth.synthetix.io/saml/metadata\`
- **OIDC Discovery Endpoint:** \`https://auth.synthetix.io/.well-known/openid-configuration\`

### 2. Bezpieczeństwo i MFA
Wymagane jest wymuszenie uwierzytelniania wieloskładnikowego (MFA) na poziomie IdP. Klucze sesyjne są rotowane automatycznie co 12 godzin.

### 3. Logowanie i Audyt
Każda próba logowania generuje asynchroniczny log SOC2 wpisany bezpośrednio do rejestru audytowego.`
  },
  {
    id: "disaster-recovery",
    title: "Rotacja Kluczy SSH i Disaster Recovery",
    category: "Infrastructure & Devops",
    updatedAt: "2026-06-20",
    content: `## PROCEDURA AWARYJNA (DISASTER RECOVERY PLAYBOOK)
Instrukcja postępowania w przypadku naruszenia bezpieczeństwa lub potrzeby pilnej rotacji kluczy SSH w infrastrukturze klastrów.

### KROK 1: Blokada Bramy Głównej
Natychmiastowe zablokowanie ruchu przychodzącego z podejrzanych adresów IP za pomocą reguły firewall:
\`\`\`bash
gcloud compute firewall-rules update ingress-block --source-ranges="0.0.0.0/0" --action=DENY
\`\`\`

### KROK 2: Generowanie nowej pary kluczy
Rotacja kluczy SSH dla wszystkich węzłów roboczych:
\`\`\`bash
ssh-keygen -t ed25519 -f ./id_ed25519_new -C "admin@synthetix.io"
\`\`\`

### KROK 3: Propagacja i Weryfikacja
Automatyczne rozesłanie kluczy za pomocą Ansible Playbook \`rotate_keys.yml\` i weryfikacja sumy kontrolnej SHA256.`
  },
  {
    id: "cicd-spec",
    title: "Specyfikacja Potoków Ciągłego Wdrażania (CI/CD)",
    category: "CI/CD & Automation",
    updatedAt: "2026-06-28",
    content: `## DOKUMENTACJA PIPELINE CI/CD (DOCKER / GKE)
Nasze repozytoria wykorzystują GitHub Actions zintegrowane z Google Cloud Build do automatycznego pakowania i wdrażania usług.

### Potoki Wydań:
1. **Analiza statyczna (Linter, ESLint, SonarQube)**
2. **Kompilacja obrazu Docker** na bazie bezpiecznego obrazu Alpine Linux.
3. **Skanowanie podatności (Trivy)**. Jeśli wykryto podatność o priorytecie CRITICAL, build jest przerywany.
4. **Wdrożenie na klaster Kubernetes (GKE)** z mechanizmem canary release (10% -> 50% -> 100%).`
  }
];

// High-fidelity Source File Explorer Database
const DEMO_FILES = [
  {
    name: "auth-service",
    file: "src/server.ts",
    lang: "typescript",
    lines: 15,
    code: `import express from 'express';
const app = express();

// JWT verification middleware
app.use('/api', (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'MFA clearance required' });
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', cluster: 'node-12a' });
});

app.listen(3000);`
  },
  {
    name: "payment-routing",
    file: "src/stripe/client.ts",
    lang: "typescript",
    lines: 12,
    code: `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-12'
});

export async function captureCharge(amount: number) {
  return stripe.charges.create({ 
    amount, 
    currency: 'usd',
    description: 'Synthetix Cloud Charge'
  });
}`
  },
  {
    name: "secure-ledger",
    file: "src/db/migrations.sql",
    lang: "sql",
    lines: 8,
    code: `CREATE TABLE invoices (
  id VARCHAR(64) PRIMARY KEY,
  amount DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  }
];

export function TeamStats({
  activeMember,
  projects,
  members,
  tasks,
  prs,
  onTabChange
}: TeamStatsProps) {
  const { auditLogs } = useFirebaseTeam();
  const currentRole = activeMember?.role || "viewer";

  // State managers
  const [liveRps, setLiveRps] = useState(384);
  const [liveCpu, setLiveCpu] = useState(24.5);
  const [activePods, setActivePods] = useState(12);
  const [storageUsage, setStorageUsage] = useState(42.4);

  // Projects Explorer Sub-tab active state
  const [activeSubTab, setActiveSubTab] = useState<"repos" | "files" | "scans">("repos");
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  // Active document reader modal state
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);

  // AI Optimizer States
  const [optimizerStatus, setOptimizerStatus] = useState<"idle" | "scanning" | "finished">("idle");
  const [optimizerText, setOptimizerText] = useState("");
  const [optimizerLog, setOptimizerLog] = useState("");

  // Audit Log Inspector State
  const [selectedAuditLogId, setSelectedAuditLogId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveRps((prev) => Math.round(Math.min(Math.max(prev + (Math.random() * 20 - 10), 320), 450)));
      setLiveCpu((prev) => {
        const next = prev + (Math.random() * 3 - 1.5);
        return Math.min(Math.max(parseFloat(next.toFixed(1)), 18), 38);
      });
      setStorageUsage((prev) => {
        const next = prev + (Math.random() * 0.1 - 0.05);
        return Math.min(Math.max(parseFloat(next.toFixed(2)), 41), 44);
      });
      if (Math.random() > 0.8) {
        setActivePods((prev) => (Math.random() > 0.5 ? Math.min(prev + 1, 16) : Math.max(prev - 1, 8)));
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Total aggregated numbers
  const totalProjects = projects.length;
  const activeMembersCount = members.filter((m) => m.status === "active").length;
  const totalRevenue = projects.reduce((acc, p) => acc + p.revenue, 0);

  // Execute Cost Optimization Scanner simulation
  const handleRunOptimizer = () => {
    setOptimizerStatus("scanning");
    setOptimizerLog("Inicjowanie agenta telemetrycznego...");
    
    setTimeout(() => {
      setOptimizerLog("Węzły GKE: Analiza przydziału pamięci dla 'Synthetix-core'...");
    }, 1200);

    setTimeout(() => {
      setOptimizerLog("Skanowanie kontenerów: Wykryto 4 nieaktywne porty dev...");
    }, 2400);

    setTimeout(() => {
      setOptimizerLog("Zalecenie: Skompilowano raport optymalizacji kosztów.");
      setOptimizerStatus("finished");
      setOptimizerText(`### REKOMENDACJA SYSTEMOWA AI:
Wykryto potencjał oszczędności finansowych rzędu **24% miesięcznie** (szacunkowo **$2,988 / mo**).

1. **Skalowanie nieaktywnych węzłów dev do 0** w weekendy (oszczędność **$1,120 / mo**).
2. **Redukcja zarezerwowanej pamięci CPU** w kontenerze \`secure-ledger\` z 2.0 do 1.2 Core (oszczędność **$850 / mo**).
3. **Rotacja nieużywanych dynamicznych adresów IP** i konsolidacja ruchu przez bramę ingress (oszczędność **$1,018 / mo**).`);
      toast.success("Raport optymalizacji AI został pomyślnie sporządzony!");
    }, 3600);
  };

  const activeDoc = KNOWLEDGE_BASE_DOCS.find(d => d.id === viewingDocId);
  const selectedAuditLogDetail = auditLogs.find(l => l.id === selectedAuditLogId);

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Dynamic Alert Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-8 w-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wide uppercase text-slate-100">Dedykowane Środowisko Synthetix Sandbox</h4>
            <p className="text-[11px] text-slate-400">SOC2 Certified • Bezpieczny symulator operacyjny w czasie rzeczywistym zintegrowany z bazą danych.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold px-3 py-1 bg-slate-850 border border-slate-800 text-emerald-400 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            KLASTER ONLINE
          </span>
          <span className="text-[10px] text-slate-400 hidden md:inline font-mono">Bramka API: 12ms</span>
        </div>
      </div>

      {/* 2. High-Density Unified KPI Stats Grid (4 Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* KPI: PROJECTS */}
        <div 
          onClick={() => onTabChange("projects")}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer relative group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Biblioteka Projektów</span>
            <span className="rounded-lg bg-slate-50 p-2 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FolderKanban className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{totalProjects} Aktywne</h3>
            <p className="mt-1 text-xxs text-slate-400 flex items-center gap-1">
              <span>Wartość:</span> <span className="font-bold text-indigo-600 font-mono">${totalRevenue.toLocaleString()}</span>
            </p>
          </div>
          <div className="mt-3 h-5 w-full opacity-60">
            <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
              <path d="M 0 15 Q 25 5, 50 12 T 100 6" fill="none" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI: TEAM MEMBERS */}
        <div 
          onClick={() => onTabChange("members")}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer relative group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Zarządzanie Zespołem</span>
            <span className="rounded-lg bg-slate-50 p-2 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{members.length} Profilów</h3>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xxs text-emerald-600 font-bold flex items-center gap-1">
                <span>●</span> <span>{activeMembersCount} aktywnych</span>
              </span>
              <div className="flex -space-x-1.5 overflow-hidden">
                {members.slice(0, 3).map((m) => (
                  <div key={m.id} className="h-4.5 w-4.5 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-black font-mono text-slate-600 uppercase">
                    {m.name.substring(0, 2)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 h-5 w-full opacity-60">
            <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
              <path d="M 0 10 Q 30 18, 50 4 T 100 12" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI: AUDIT ACTIONS */}
        <div 
          onClick={() => onTabChange("audit_logs")}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer relative group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Aktywność SOC2</span>
            <span className="rounded-lg bg-slate-50 p-2 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Activity className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{140 + auditLogs.length} Zdarzeń</h3>
            <p className="mt-1 text-xxs text-slate-400 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500"></span>
              </span>
              <span>Rejestr weryfikowany ciągle</span>
            </p>
          </div>
          <div className="mt-3 h-5 w-full opacity-60">
            <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
              <path d="M 0 18 Q 20 8, 40 15 T 70 5 T 100 12" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI: DEPLOYMENTS & STORAGE */}
        <div className="rounded-xl border border-indigo-900 bg-gradient-to-br from-indigo-950 to-slate-950 p-5 shadow-md text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xxs font-bold text-indigo-300 uppercase tracking-wider">Pojemność & Ruch</span>
            <span className="rounded-lg bg-indigo-900 p-2 text-indigo-300">
              <Database className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white tracking-tight">{storageUsage.toFixed(1)} GB</h3>
            <div className="mt-1.5 flex items-center justify-between text-xxs text-indigo-200">
              <span className="font-mono">Limit: 100GB</span>
              <span className="font-bold text-indigo-400 font-mono">{liveRps} RPS</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300" 
                style={{ width: `${storageUsage}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Bento Grid: Double Column Workspace Content & Sidebar */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column (2/3 width) - Col Span 2 */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Activity Feed (SOC2 Audit Stream) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                  <span>Strumień Aktywności i Audyt SOC2 (Real-Time Feed)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Każde działanie w klastrze jest rejestrowane w celach certyfikacji.</p>
              </div>
              <button 
                onClick={() => onTabChange("audit_logs")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-850 flex items-center gap-1 transition-colors"
              >
                <span>Wszystkie logi</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <p className="font-semibold">Brak zarejestrowanych logów audytowych w bazie klastra.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Wykonaj dowolną akcję, taką jak modyfikacja projektu lub zmiana statusu zadania, aby wygenerować log SOC2.</p>
                </div>
              ) : (
                auditLogs.slice(0, 6).map((log) => {
                  let categoryBadgeColor = "bg-slate-100 text-slate-700";
                  if (log.category === "auth") categoryBadgeColor = "bg-rose-50 text-rose-700 border border-rose-100";
                  if (log.category === "project") categoryBadgeColor = "bg-indigo-50 text-indigo-700 border border-indigo-100";
                  if (log.category === "admin") categoryBadgeColor = "bg-amber-50 text-amber-700 border border-amber-100";
                  if (log.category === "system") categoryBadgeColor = "bg-emerald-50 text-emerald-700 border border-emerald-100";

                  const logIpSeed = log.createdAt ? log.createdAt.charCodeAt(log.createdAt.length - 1) : 42;

                  return (
                    <div 
                      key={log.id} 
                      onClick={() => setSelectedAuditLogId(log.id === selectedAuditLogId ? null : log.id)}
                      className="flex items-start justify-between gap-3 text-xs py-3 hover:bg-slate-50 rounded-lg px-2 transition-all cursor-pointer"
                    >
                      <div className="flex gap-2.5">
                        <span className={`rounded font-mono text-[9px] font-bold px-1.5 py-0.5 shrink-0 ${categoryBadgeColor}`}>
                          {log.category.toUpperCase()}
                        </span>
                        <div>
                          <span className="font-extrabold text-slate-800">{log.actor?.name || "System"}</span>
                          <span className="text-slate-500"> {log.action} </span>
                          <span className="font-semibold text-slate-700">{log.target}</span>
                          
                          {selectedAuditLogId === log.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-2 p-2 bg-slate-900 text-slate-300 rounded-lg font-mono text-[10px] space-y-1"
                            >
                              <div className="text-indigo-400 font-bold">// Detale SOC2 Audit Payload</div>
                              <div>ID: {log.id}</div>
                              <div>Rola: {(log.actor?.role || "user").toUpperCase()}</div>
                              <div>IP: 194.12.8.{(logIpSeed % 200) + 2}</div>
                              {log.details && <div className="text-slate-400">Notatka: {log.details}</div>}
                            </motion.div>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-slate-400 text-[10px] shrink-0">
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "00:00"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Interactive Projects Library, Repositories and Source Control */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-indigo-500" />
                  <span>Biblioteka Projektów i Repozytoriów</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Zarządzaj zasobami kodu, plikami w chmurze i audytem bezpieczeństwa.</p>
              </div>
              
              {/* Tabs selector */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                <button
                  onClick={() => setActiveSubTab("repos")}
                  className={`px-3 py-1 text-xxs font-black rounded-md cursor-pointer transition-all ${
                    activeSubTab === "repos" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Repozytoria
                </button>
                <button
                  onClick={() => setActiveSubTab("files")}
                  className={`px-3 py-1 text-xxs font-black rounded-md cursor-pointer transition-all ${
                    activeSubTab === "files" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Pliki kodu
                </button>
                <button
                  onClick={() => setActiveSubTab("scans")}
                  className={`px-3 py-1 text-xxs font-black rounded-md cursor-pointer transition-all ${
                    activeSubTab === "scans" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Skanowania SOC2
                </button>
              </div>
            </div>

            {/* TAB CONTENT: REPOS */}
            {activeSubTab === "repos" && (
              <div className="grid gap-3 sm:grid-cols-3">
                {projects.map((proj) => {
                  return (
                    <div 
                      key={proj.id} 
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase">
                            {proj.id === "proj_1" ? "Auth" : proj.id === "proj_2" ? "Stripe" : "Mobile"}
                          </span>
                          <span className="h-2 w-2 rounded-full bg-emerald-500" title="Kompilacja poprawna"></span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">{proj.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">Branch: main</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-center justify-between text-xxs text-slate-500">
                        <span>Budżet:</span>
                        <span className="font-extrabold text-slate-700">${proj.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: FILES */}
            {activeSubTab === "files" && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1 space-y-1.5 max-h-56 overflow-y-auto">
                  {DEMO_FILES.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFileIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xxs font-bold flex flex-col gap-1 transition-all cursor-pointer ${
                        selectedFileIndex === idx 
                          ? "bg-slate-900 text-white border-slate-800" 
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span className="truncate">{file.file}</span>
                      <span className="text-[9px] text-slate-400 font-normal">{file.name}</span>
                    </button>
                  ))}
                </div>

                <div className="sm:col-span-2 bg-slate-950 rounded-xl p-4 text-white font-mono text-[10px] overflow-x-auto relative">
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[9px] bg-slate-900 border border-slate-800 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    <ShieldCheck className="h-3 w-3" /> ZWERYFIKOWANY BEZPIECZNY
                  </div>
                  <div className="text-slate-500 border-b border-slate-900 pb-2 mb-2 flex items-center justify-between">
                    <span>{DEMO_FILES[selectedFileIndex].file} ({DEMO_FILES[selectedFileIndex].lang})</span>
                    <span>{DEMO_FILES[selectedFileIndex].lines} linii</span>
                  </div>
                  <pre className="leading-relaxed text-slate-300">
                    <code>{DEMO_FILES[selectedFileIndex].code}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SCANS */}
            {activeSubTab === "scans" && (
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800">SOC2 Continuous Security Audits</span>
                  <span className="font-mono text-xxs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-bold">100% ZGODNOŚĆ (PASSED)</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 text-xxs">
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-150">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-extrabold text-slate-800">Trivy Vulnerability Scan</p>
                      <p className="text-[10px] text-slate-400">0 Critical • 0 High Vulnerabilities</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-150">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-extrabold text-slate-800">OWASP Top 10 SAST Audit</p>
                      <p className="text-[10px] text-slate-400">Static Code Analyzer verified</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-150">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-extrabold text-slate-800">Secrets & Private Key Leak Check</p>
                      <p className="text-[10px] text-slate-400">Checked commits in last 30 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-150">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-extrabold text-slate-800">MFA & TLS Compliance Verification</p>
                      <p className="text-[10px] text-slate-400">Encryption-in-transit certified</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Column (1/3 width) - Col Span 1 */}
        <div className="space-y-6">
          
          {/* Knowledge Base & Playbooks Module */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <span>Baza Wiedzy i Playbooki Operacyjne</span>
            </h3>
            
            <div className="space-y-3">
              {KNOWLEDGE_BASE_DOCS.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => setViewingDocId(doc.id)}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between text-xxs font-bold text-slate-400 mb-1">
                    <span>{doc.category}</span>
                    <span className="font-mono font-normal">{doc.updatedAt}</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors flex items-center justify-between">
                    <span>{doc.title}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* AI Cluster Cost Optimizer Widget */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-purple-50/40 p-6 shadow-xs relative">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 text-[9px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Rekomendacje AI
              </span>
              <span className="text-[10px] font-bold text-indigo-600 font-mono">Cost: $12,450 / mo</span>
            </div>
            
            <h3 className="text-sm font-black text-slate-950 tracking-tight">AI Cost & Resource Optimizer</h3>
            <p className="text-xxs text-slate-500 leading-normal mt-1 mb-4">
              Przeprowadź zautomatyzowane skanowanie obciążeń procesora i alokacji zasobów klastra pod kątem redukcji kosztów SaaS.
            </p>

            {optimizerStatus === "idle" && (
              <button
                onClick={handleRunOptimizer}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Uruchom Skaner Optymalizacyjny</span>
              </button>
            )}

            {optimizerStatus === "scanning" && (
              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-3 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
                  <span className="font-mono text-xxs">Analiza w toku...</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-2/3 animate-pulse"></div>
                </div>
                <p className="text-[10px] font-mono text-slate-400 leading-normal truncate">{optimizerLog}</p>
              </div>
            )}

            {optimizerStatus === "finished" && (
              <div className="space-y-4">
                <div className="p-3.5 bg-white border border-indigo-100 rounded-xl font-mono text-[10px] text-slate-700 leading-normal max-h-48 overflow-y-auto space-y-1">
                  <p className="text-indigo-600 font-bold">// Raport ukończony</p>
                  <pre className="whitespace-pre-wrap">{optimizerText}</pre>
                </div>
                
                <button
                  onClick={() => setOptimizerStatus("idle")}
                  className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xxs font-bold rounded-lg transition-all cursor-pointer text-center"
                >
                  Skanuj ponownie
                </button>
              </div>
            )}
          </div>

          {/* Pinned Links Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">Przypięte Szybkie Linki</h3>
            <div className="space-y-2.5 text-xs font-semibold">
              <a 
                href="#projects" 
                onClick={(e) => { e.preventDefault(); onTabChange("projects"); }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-slate-700 group"
              >
                <span className="flex items-center gap-2 text-slate-600 group-hover:text-indigo-600">
                  <Server className="h-3.5 w-3.5" />
                  <span>Centrum Sterowania Wdrożeniami</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
              
              <a 
                href="#api-keys" 
                onClick={(e) => { e.preventDefault(); onTabChange("api_keys"); }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-slate-700 group"
              >
                <span className="flex items-center gap-2 text-slate-600 group-hover:text-indigo-600">
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Klaster API Keys & Credentials</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a 
                href="#members" 
                onClick={(e) => { e.preventDefault(); onTabChange("members"); }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-slate-700 group"
              >
                <span className="flex items-center gap-2 text-slate-600 group-hover:text-indigo-600">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Poziomy Uprawnień Członków</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Overlays: Document Reader Modal */}
      {viewingDocId && activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <div>
                <span className="inline-flex items-center text-[10px] font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                  {activeDoc.category}
                </span>
                <h3 className="text-sm font-black text-slate-950 tracking-tight">{activeDoc.title}</h3>
              </div>
              <button 
                onClick={() => setViewingDocId(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto text-xs leading-relaxed text-slate-700 space-y-4">
              <pre className="whitespace-pre-wrap font-sans text-slate-800">
                {activeDoc.content}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-150 bg-slate-50 flex justify-between items-center text-xxs font-mono text-slate-400">
              <span>Ostatnia aktualizacja: {activeDoc.updatedAt}</span>
              <button 
                onClick={() => setViewingDocId(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Zamknij dokument
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
