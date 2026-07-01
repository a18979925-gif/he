import { useState } from "react";
import { 
  BarChart3, ArrowDownToLine, TrendingUp, ShieldCheck, 
  RefreshCw, FileText, CheckCircle2, Star, Calendar, 
  HelpCircle, DollarSign, Award, Layers
} from "lucide-react";
import { toast } from "sonner";
import { Member } from "../types/member";

interface ExecutiveReportsProps {
  activeMember: Member | null;
}

export function ExecutiveReports({ activeMember }: ExecutiveReportsProps) {
  const [selectedReportType, setSelectedReportType] = useState<"financial" | "security" | "productivity">("financial");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [kpiScore, setKpiScore] = useState({
    systemHealth: 98.4,
    revenueGrowth: "+24.8%",
    complianceScore: "99.2%"
  });

  const reportsList = [
    { id: "rep-1", name: "Raport Finansowy Q2 2026", type: "financial", date: "2026-06-30", size: "2.4 MB", securityLevel: "Klasyfikowany" },
    { id: "rep-2", name: "Audyt Bezpieczeństwa ISO 27001", type: "security", date: "2026-06-15", size: "4.1 MB", securityLevel: "Ściśle Tajne" },
    { id: "rep-3", name: "Produktywność Deweloperska - Czerwiec", type: "productivity", date: "2026-06-28", size: "1.8 MB", securityLevel: "Wewnętrzny" },
    { id: "rep-4", name: "Analiza Redundancji Serwerowej AWS", type: "security", date: "2026-05-10", size: "3.2 MB", securityLevel: "Klasyfikowany" },
    { id: "rep-5", name: "Prognoza Rentowności SaaS Q3-Q4", type: "financial", date: "2026-06-01", size: "1.2 MB", securityLevel: "Zastrzeżony" }
  ];

  const triggerLiveAudit = () => {
    if (isAuditing) return;
    setIsAuditing(true);
    setAuditProgress(0);
    setAuditLogs([]);
    toast.info("Inicjalizacja audytu SOC2 klastra kandydującego...");

    const auditSteps = [
      { progress: 15, log: "Weryfikacja sum kontrolnych bazy danych Firebase Firestore..." },
      { progress: 35, log: "Sprawdzanie reguł uwierzytelniania wielopoziomowego (MFA)..." },
      { progress: 55, log: "Skanowanie certyfikatów SSL klastra Cloud Run i nagłówków CORS..." },
      { progress: 75, log: "Audyt kryptograficzny kluczy API oraz uprawnień ról w workspace..." },
      { progress: 95, log: "Generowanie sumy skrótu kryptograficznego i certyfikatu zgodności..." },
      { progress: 100, log: "Audyt zakończony powodzeniem. Zgodność zadeklarowana." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < auditSteps.length) {
        const step = auditSteps[currentStep];
        setAuditProgress(step.progress);
        setAuditLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.log}`]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsAuditing(false);
        setKpiScore({
          systemHealth: 99.8,
          revenueGrowth: "+26.1%",
          complianceScore: "100.0%"
        });
        toast.success("Audyt zakończony! Wynik zgodności podniesiony do 100%.", {
          description: "Wygenerowano certyfikat sumy kontrolnej SHA-256."
        });
      }
    }, 800);
  };

  const handleDownloadReport = (reportName: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Przygotowywanie raportu "${reportName}" do bezpiecznego pobrania...`,
        success: `Pobrano pomyślnie raport: ${reportName}`,
        error: "Nie udało się wygenerować raportu."
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <span>Centrum Raportów Dyrektorskich</span>
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xxs font-semibold text-indigo-700 border border-indigo-200">
            Executive Suite
          </span>
        </h2>
        <p className="text-xs text-slate-500">
          Zarządzaj fakturowaniem SaaS, analizuj produktywność techniczną i generuj natychmiastowe certyfikaty zgodności SOC2 dla ubezpieczycieli.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Dynamika Przychodów</p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{kpiScore.revenueGrowth}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Certyfikat Zgodności</p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{kpiScore.complianceScore}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Wskaźnik Bezawaryjności</p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{kpiScore.systemHealth}%</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Reports Archive */}
        <div className="md:col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800">Archiwum Wygenerowanych Raportów</h3>
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 self-start sm:self-auto">
                <button
                  onClick={() => setSelectedReportType("financial")}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${selectedReportType === "financial" ? "bg-white text-indigo-600 shadow-xxs border border-slate-100" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Finanse
                </button>
                <button
                  onClick={() => setSelectedReportType("security")}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${selectedReportType === "security" ? "bg-white text-indigo-600 shadow-xxs border border-slate-100" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Bezpieczeństwo
                </button>
                <button
                  onClick={() => setSelectedReportType("productivity")}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${selectedReportType === "productivity" ? "bg-white text-indigo-600 shadow-xxs border border-slate-100" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Wydajność
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {reportsList
                .filter(rep => rep.type === selectedReportType)
                .map((rep) => (
                  <div key={rep.id} className="py-3 flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{rep.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-400">
                          <span>{rep.date}</span>
                          <span>•</span>
                          <span>{rep.size}</span>
                          <span>•</span>
                          <span className="rounded bg-slate-100 border border-slate-200 px-1 text-[9px] text-slate-500 font-bold uppercase">{rep.securityLevel}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadReport(rep.name)}
                      className="h-8 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 text-xxs font-bold px-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <ArrowDownToLine className="h-3 w-3" />
                      <span className="hidden sm:inline">Pobierz</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Live Security Auditor */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Instatnt Auditing Engine</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Zezwól algorytmom klastra na przeprowadzenie natychmiastowej symulacji audytu SOC2 typu II i wykazanie zgodności przed organem kontrolnym.
            </p>

            {isAuditing ? (
              <div className="mt-4 space-y-3 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-600 animate-pulse">Skanowanie zasobów...</span>
                  <span className="font-mono text-slate-500">{auditProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
                  <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${auditProgress}%` }}></div>
                </div>
                <div className="rounded-lg bg-slate-950 p-3 text-xxs font-mono text-slate-400 border border-slate-800 h-[140px] overflow-y-auto space-y-1 scrollbar-thin">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="leading-normal">{log}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 flex-1 flex flex-col justify-end">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-center text-xs text-slate-500 mb-4">
                  Ostatni pełny audyt: <span className="font-mono font-bold text-slate-700">Dzisiaj, 11:24</span>
                </div>
                <button
                  onClick={triggerLiveAudit}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
                  <span>Rozpocznij Audyt Kontrolny</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
