import { useState } from "react";
import { AuditLogEntry } from "../types/activity";
import { Search, ShieldAlert, Clock, Filter, Eye, Download, Users, Activity, Calendar } from "lucide-react";
import { toast } from "sonner";

interface TeamAuditLogProps {
  logs: AuditLogEntry[];
}

export function TeamAuditLog({ logs }: TeamAuditLogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "24h" | "7d" | "30d">("all");
  const [inspectingLog, setInspectingLog] = useState<AuditLogEntry | null>(null);

  // Filter logs based on search query, category, and date range
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || log.category === selectedCategory;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const logTime = new Date(log.createdAt).getTime();
      const now = Date.now();
      const diffHrs = (now - logTime) / (1000 * 60 * 60);
      if (dateFilter === "24h") {
        matchesDate = diffHrs <= 24;
      } else if (dateFilter === "7d") {
        matchesDate = diffHrs <= 24 * 7;
      } else if (dateFilter === "30d") {
        matchesDate = diffHrs <= 24 * 30;
      }
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  // Calculate live statistics
  const totalEvents = filteredLogs.length;
  const securityIncidents = filteredLogs.filter((log) => log.category === "security").length;
  const uniqueOperators = new Set(filteredLogs.map((log) => log.actor.email)).size;

  // Export JSON function
  const handleExportJSON = () => {
    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(filteredLogs, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `audit_trail_export_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success(`Wyeksportowano pomyślnie ${filteredLogs.length} wpisów do pliku JSON!`);
    } catch (err: any) {
      toast.error("Błąd podczas eksportowania logów: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Korporacyjny Rejestr Zdarzeń (Audit Trail)</span>
            <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xxs font-semibold text-rose-700 border border-rose-200">
              Zgodność SOC2 / SEC
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Niezmienny rejestr kryptograficzny dokumentujący wszystkie akcje administracyjne i modyfikacje przestrzeni roboczej. Wymagany do zachowania pełnego bezpieczeństwa korporacyjnego.
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportJSON}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer self-start md:self-auto"
        >
          <Download className="h-4 w-4 text-slate-500" />
          <span>Eksportuj (.JSON)</span>
        </button>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Zdarzenia w Filtrze</p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{totalEvents}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Alerty Bezpieczeństwa</p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{securityIncidents}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Aktywni Operatorzy</p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{uniqueOperators}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 sm:space-y-0">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj w rejestrze (np. Andrzej, rola, projekt)..."
              className="w-full h-10 rounded-lg border border-slate-200 pl-10 pr-4 text-xs focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Okres:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {[
                { id: "all", label: "Wszystko" },
                { id: "24h", label: "24h" },
                { id: "7d", label: "7 dni" },
                { id: "30d", label: "30 dni" },
              ].map((period) => {
                const isSelected = dateFilter === period.id;
                return (
                  <button
                    key={period.id}
                    onClick={() => setDateFilter(period.id as any)}
                    className={`px-2.5 py-1 text-xxs font-bold rounded-md transition-all cursor-pointer ${
                      isSelected ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {period.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 items-center border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1.5 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            <span>Kategoria</span>
          </span>
          {[
            { id: "all", label: "Wszystkie" },
            { id: "project", label: "Projekty" },
            { id: "member", label: "Zespół" },
            { id: "security", label: "Bezpieczeństwo" },
            { id: "settings", label: "Ustawienia" },
            { id: "billing", label: "Rozliczenia" }
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline List */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <ShieldAlert className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-800">Brak pasujących wpisów w rejestrze audytowym.</p>
              <p className="text-xs mt-1 text-slate-400">Spróbuj zmienić zapytanie lub zresetować filtry kategorii.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              // Categorized badges
              const categoryBadge = {
                project: "bg-blue-50 text-blue-700 border-blue-200",
                member: "bg-emerald-50 text-emerald-700 border-emerald-200",
                security: "bg-rose-50 text-rose-700 border-rose-200",
                settings: "bg-purple-50 text-purple-700 border-purple-200",
                billing: "bg-amber-50 text-amber-700 border-amber-200"
              }[log.category] || "bg-slate-50 text-slate-700 border-slate-200";

              const categoryPolish = {
                project: "Projekt",
                member: "Zespół",
                security: "Ochrona",
                settings: "Ustawienia",
                billing: "Finanse"
              }[log.category] || log.category;

              return (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3.5">
                    {/* Timestamp */}
                    <div className="font-mono text-xs text-slate-400 shrink-0 text-left w-16 pt-1 flex items-center gap-1" title={new Date(log.createdAt).toLocaleString()}>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Actor avatar */}
                    <img src={log.actor.avatar} alt={log.actor.name} className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-100 mt-0.5" />

                    {/* Action message */}
                    <div className="space-y-1">
                      <p className="text-xs text-slate-700">
                        <span className="font-bold text-slate-900">{log.actor.name}</span>
                        <span className="text-slate-500 mx-1.5">
                          {log.action === "invited member" ? "zaprosił użytkownika" :
                           log.action === "changed role" ? "zmienił rolę dla" :
                           log.action === "changed project role" ? "zmienił rolę projektową dla" :
                           log.action === "removed member" ? "usunął użytkownika" :
                           log.action === "created project" ? "utworzył projekt" :
                           log.action === "deleted project" ? "usunął projekt" :
                           log.action === "updated settings" ? "zaktualizował konfigurację" :
                           log.action === "connected integration" ? "podłączył integrację" :
                           log.action === "disconnected integration" ? "odłączył integrację" :
                           log.action === "updated billing" ? "zaktualizował rozliczenia" :
                           log.action === "updated role permissions" ? "zmodyfikował matrycę uprawnień ról" :
                           log.action === "triggered deployment" ? "uruchomił wdrożenie" : log.action}
                        </span>
                        <span className="font-semibold text-indigo-600">{log.target}</span>
                      </p>
                      <p className="text-xxs text-slate-400 leading-relaxed font-sans">{log.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${categoryBadge}`}>
                      {categoryPolish}
                    </span>
                    <button
                      onClick={() => setInspectingLog(log)}
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                      title="Szczegóły pakietu zdarzenia"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Log Inspecting Drawer Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-mono">Szczegóły Pakietu Zdarzenia (Audit)</h3>
              <button onClick={() => setInspectingLog(null)} className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer">
                Zamknij [x]
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium font-sans">ID Zdarzenia UUID:</span>
                <span className="col-span-2 font-mono text-slate-800 break-all">{inspectingLog.id}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium font-sans">Tożsamość Wykonawcy:</span>
                <span className="col-span-2 text-slate-800 font-semibold font-sans">{inspectingLog.actor.name} ({inspectingLog.actor.email})</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium font-sans">Wydarzenie:</span>
                <span className="col-span-2 text-slate-800 font-semibold uppercase font-mono">{inspectingLog.action}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium font-sans">Cel Akcji:</span>
                <span className="col-span-2 text-indigo-600 font-semibold font-sans">{inspectingLog.target}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium font-sans">Znacznik Czasu:</span>
                <span className="col-span-2 font-mono text-slate-600">{new Date(inspectingLog.createdAt).toISOString()}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium font-sans">Parametry Diagnostyczne:</span>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xxs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {inspectingLog.details || "Brak dodatkowych parametrów przypisanych do tego pakietu logów."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
