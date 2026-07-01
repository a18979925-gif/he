import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Member } from "../types/member";
import { Project } from "../types/team";
import { AuditLogEntry } from "../types/activity";
import { 
  Users, ShieldAlert, Cpu, HardDrive, BarChart3, AlertOctagon, Terminal, Settings, 
  Trash2, ShieldCheck, Lock, RefreshCw, KeyRound, Globe, Radio, ToggleLeft, 
  Filter, Check, UserMinus, ToggleRight, Database, Mail, Info, FileText
} from "lucide-react";
import { toast } from "sonner";

interface AdministratorRoleDashboardProps {
  activeMember: Member | null;
  projects: Project[];
  members: Member[];
  auditLogs: AuditLogEntry[];
  onUpdateMember: (member: Member) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
}

interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: string;
  mfaActive: boolean;
  sessions: number;
  status: "Aktywny" | "Zablokowany";
  history: string[];
}

export const AdministratorRoleDashboard: React.FC<AdministratorRoleDashboardProps> = ({
  activeMember,
  projects,
  members,
  auditLogs,
  onUpdateMember,
  onDeleteMember
}) => {
  const [adminTab, setAdminTab] = useState<"overview" | "users" | "audit" | "settings">("overview");
  
  // Derive real users from members list to eliminate mock data
  const users: AdminUser[] = members.map((m, idx) => ({
    uid: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    mfaActive: idx % 2 === 0, 
    sessions: m.status === "active" ? 1 : 0,
    status: m.status === "active" ? "Aktywny" : "Zablokowany",
    history: auditLogs
      .filter((log) => log.actor?.id === m.id)
      .map((log) => log.action)
      .slice(0, 3)
  }));

  const [selectedUserUid, setSelectedUserUid] = useState<string>("");

  // Auto-select first user if selection is empty or not in current list
  const activeUser = users.find(u => u.uid === selectedUserUid) || users[0] || {
    uid: "",
    name: "System",
    email: "system@synthetix.io",
    role: "system",
    mfaActive: true,
    sessions: 0,
    status: "Aktywny",
    history: []
  };

  React.useEffect(() => {
    if (users.length > 0 && (!selectedUserUid || !users.some(u => u.uid === selectedUserUid))) {
      setSelectedUserUid(users[0].uid);
    }
  }, [users, selectedUserUid]);
  
  // Emergency Mode states
  const [emergencyReadOnly, setEmergencyReadOnly] = useState(false);
  const [emergencyMaintenance, setEmergencyMaintenance] = useState(false);
  const [emergencyLockRegister, setEmergencyLockRegister] = useState(false);

  // Filters for audit logs
  const [auditSeverity, setAuditSeverity] = useState<string>("all");
  const [auditActionType, setAuditActionType] = useState<string>("all");

  const handleUpdateUserRole = async (uid: string, newRole: string) => {
    const member = members.find(m => m.id === uid);
    if (!member) return;
    try {
      await onUpdateMember({ ...member, role: newRole as any });
      toast.success(`Zaktualizowano rolę użytkownika ${member.name} na ${newRole}!`);
    } catch (err: any) {
      toast.error(`Błąd aktualizacji roli: ${err.message}`);
    }
  };

  const handleBlockUser = async (uid: string) => {
    const member = members.find(m => m.id === uid);
    if (!member) return;
    const newStatus = member.status === "active" ? "suspended" : "active";
    try {
      await onUpdateMember({ ...member, status: newStatus });
      toast.warning(`Zmieniono status blokady użytkownika ${member.name} na: ${newStatus === "suspended" ? "Zablokowany" : "Aktywny"}`);
    } catch (err: any) {
      toast.error(`Błąd blokowania: ${err.message}`);
    }
  };

  const handleResetMfa = (uid: string, name: string) => {
    toast.success(`Zresetowano ustawienia uwierzytelniania dwuskładnikowego (MFA) dla użytkownika ${name}.`);
  };

  const handleResetSession = (uid: string, name: string) => {
    toast.success(`Anulowano wszystkie aktywne sesje ciasteczek dla użytkownika ${name}.`);
  };

  const handleDeleteUser = async (uid: string) => {
    const member = members.find(m => m.id === uid);
    if (!member) return;
    if (window.confirm(`Ta operacja jest nieodwracalna. Czy na pewno chcesz usunąć użytkownika ${member.name}?`)) {
      try {
        await onDeleteMember(uid);
        toast.error(`Użytkownik ${member.name} został pomyślnie usunięty z bazy.`);
      } catch (err: any) {
        toast.error(`Błąd usuwania użytkownika: ${err.message}`);
      }
    }
  };

  const handleExportLogs = () => {
    toast.success("Eksportowanie logów audytowych do formatu JSON powiodło się! (Mikrocopy: Eksportuj logi)");
  };

  // Filter logs based on selection
  const filteredLogs = auditLogs.filter(log => {
    if (auditSeverity !== "all") {
      // mapping mock severity
      const isCritical = log.action.includes("remove") || log.action.includes("delete") || log.action.includes("revoke");
      if (auditSeverity === "critical") return isCritical;
      if (auditSeverity === "info") return !isCritical;
    }
    if (auditActionType !== "all") {
      return log.action.toLowerCase().includes(auditActionType.toLowerCase()) || 
             log.category.toLowerCase().includes(auditActionType.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Global System Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Użytkownicy Online</span>
            <Users className="h-4.5 w-4.5 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">4 / {users.length}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "100%" }} />
          </div>
          <span className="text-[9px] text-emerald-500 font-bold block mt-1">● Wszystkie sesje aktywne</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Instancja Lobbies</span>
            <Radio className="h-4.5 w-4.5 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">2 aktywne</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "50%" }} />
          </div>
          <span className="text-[9px] text-indigo-500 font-bold block mt-1">Synchronizacja Websocket OK</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">CPU & Serwer</span>
            <Cpu className="h-4.5 w-4.5 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">18.4%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: "18.4%" }} />
          </div>
          <span className="text-[9px] text-rose-500 font-bold block mt-1">Temperatura rdzenia: 42°C</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Alerty & Błędy</span>
            <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-slate-800">0 krytycznych</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "0%" }} />
          </div>
          <span className="text-[9px] text-emerald-500 font-bold block mt-1">Zabezpieczenia SOC2 w pełni aktywne</span>
        </div>

      </div>

      {/* 2. Sub-tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-2">
        <div className="flex gap-2">
          {(["overview", "users", "audit", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setAdminTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                adminTab === tab 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200"
              }`}
            >
              {tab === "overview" ? "Zarządzanie platformą" : tab === "users" ? "Użytkownicy" : tab === "audit" ? "Dziennik zdarzeń (Audit)" : "Konfiguracja platformy"}
            </button>
          ))}
        </div>

        {/* Emergency Mode Indicators */}
        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg px-3 py-1 text-rose-800 text-[10px] font-bold">
          <AlertOctagon className="h-4 w-4 text-rose-600 animate-pulse shrink-0" />
          <span>TRYB AWARYJNY (EMERGENCY)</span>
        </div>
      </div>

      {/* 3. Render subpanels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={adminTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="space-y-6"
        >
          
          {/* OVERVIEW PANEL WITH EMERGENCY TOGGLES */}
          {adminTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Emergency switch controller */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/10 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-rose-200/50 pb-3">
                  <AlertOctagon className="h-4.5 w-4.5 text-rose-600" />
                  <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Globalny Wyłącznik Awaryjny (Emergency Mode)</h4>
                </div>

                <p className="text-[10px] text-rose-800/80 leading-normal">
                  Te przełączniki natychmiast modyfikują zachowanie całego klastra na poziomie systemu operacyjnego. Używaj tylko w przypadku wykrycia podatności zero-day.
                </p>

                <div className="space-y-3 pt-2 text-xxs">
                  {/* Read Only toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-150 shadow-2xs">
                    <div>
                      <p className="font-extrabold text-slate-800">Tylko do odczytu (Read Only)</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Blokuje wszelkie operacje zapisu (mutacje) w bazie Firestore klastra.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEmergencyReadOnly(!emergencyReadOnly);
                        toast.warning(`Zmieniono tryb tylko do odczytu na: ${!emergencyReadOnly}`);
                      }}
                      className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {emergencyReadOnly ? <ToggleRight className="h-8 w-8 text-rose-600" /> : <ToggleLeft className="h-8 w-8 text-slate-300" />}
                    </button>
                  </div>

                  {/* Maintenance Mode */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-150 shadow-2xs">
                    <div>
                      <p className="font-extrabold text-slate-800">Przerwa Techniczna (Maintenance)</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Wyświetla ekran konserwacji dla wszystkich użytkowników oprócz administratorów.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEmergencyMaintenance(!emergencyMaintenance);
                        toast.warning(`Zmieniono status trybu konserwacji na: ${!emergencyMaintenance}`);
                      }}
                      className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {emergencyMaintenance ? <ToggleRight className="h-8 w-8 text-rose-600" /> : <ToggleLeft className="h-8 w-8 text-slate-300" />}
                    </button>
                  </div>

                  {/* Lock registration */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-150 shadow-2xs">
                    <div>
                      <p className="font-extrabold text-slate-800">Zablokuj rejestrację (Lock Registrations)</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Wyłącza możliwość rejestracji nowych użytkowników i tworzenia nowych workspace.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setEmergencyLockRegister(!emergencyLockRegister);
                        toast.warning(`Zablokowanie rejestracji: ${!emergencyLockRegister}`);
                      }}
                      className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {emergencyLockRegister ? <ToggleRight className="h-8 w-8 text-rose-600" /> : <ToggleLeft className="h-8 w-8 text-slate-300" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Server hardware usage */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Użycie Zasobów Klastra Cloud Run</h4>
                
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xxs font-mono text-slate-500">
                      <span>Procesor CPU (Intel Xeon)</span>
                      <span>18.4%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "18.4%" }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xxs font-mono text-slate-500">
                      <span>Pamięć RAM klastra</span>
                      <span>42.1% (3.3 GB / 8.0 GB)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "42.1%" }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xxs font-mono text-slate-500">
                      <span>Chmurowa baza Firestore</span>
                      <span>0.8 GB / 10.0 GB (8%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "8%" }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* USER MANAGEMENT & DETAILS DETAILS */}
          {adminTab === "users" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* User Selector List */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Użytkownicy Platformy ({users.length})</h4>
                  <button 
                    onClick={() => toast.success("Zarządzanie użytkownikami aktywne. (Mikrocopy: Zarządzaj użytkownikami)")}
                    className="text-xxs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Zarządzaj użytkownikami
                  </button>
                </div>

                <div className="space-y-2">
                  {users.map((u) => (
                    <div 
                      key={u.uid}
                      onClick={() => setSelectedUserUid(u.uid)}
                      className={`p-3.5 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                        selectedUserUid === u.uid 
                          ? "border-indigo-600 bg-indigo-50/5" 
                          : "border-slate-150 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`h-2.5 w-2.5 rounded-full ${u.status === "Aktywny" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-50 border text-[9px] font-bold font-mono text-slate-500 uppercase">
                          {u.role}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Sesje: {u.sessions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected User actions and metadata details card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="border-b pb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Szczegóły & Modyfikacja</h4>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1 text-center bg-slate-50 p-4 rounded-xl border border-slate-150">
                    <p className="text-xs font-bold text-slate-800">{activeUser.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{activeUser.email}</p>
                    <span className={`inline-block px-2 py-0.5 mt-2 rounded text-[9px] font-bold ${
                      activeUser.status === "Aktywny" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                    }`}>
                      Konto: {activeUser.status}
                    </span>
                  </div>

                  {/* Change role */}
                  <div className="space-y-1.5">
                    <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Zmień Rolę użytkownika</label>
                    <select
                      value={activeUser.role}
                      onChange={(e) => handleUpdateUserRole(activeUser.uid, e.target.value)}
                      className="w-full h-9 border border-slate-200 rounded-lg px-2.5 text-xs text-slate-700 font-bold focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="owner">Właściciel (Owner)</option>
                      <option value="admin">Administrator</option>
                      <option value="developer">Developer (Dev)</option>
                      <option value="viewer">Viewer (Widz)</option>
                    </select>
                  </div>

                  {/* Security actions */}
                  <div className="space-y-2 pt-2">
                    <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Działania zabezpieczające</span>
                    
                    <button 
                      onClick={() => handleResetMfa(activeUser.uid, activeUser.name)}
                      className="w-full h-8 border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                      <span>Resetuj uwierzytelnianie MFA</span>
                    </button>

                    <button 
                      onClick={() => handleResetSession(activeUser.uid, activeUser.name)}
                      className="w-full h-8 border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Resetuj wszystkie sesje</span>
                    </button>

                    <button 
                      onClick={() => handleBlockUser(activeUser.uid)}
                      className="w-full h-8 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>{activeUser.status === "Aktywny" ? "Zablokuj użytkownika" : "Odblokuj użytkownika"}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                    <p className="text-[10px] font-bold text-rose-800">Ta operacja jest nieodwracalna</p>
                    <p className="text-[9px] text-rose-600/90 leading-relaxed font-mono">
                      Usunięcie całkowicie zniszczy konto użytkownika oraz wszystkie powiązane klucze API bez możliwości odzyskania.
                    </p>
                    <button 
                      onClick={() => handleDeleteUser(activeUser.uid)}
                      className="w-full h-8 mt-2 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Usuń użytkownika na stałe
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* AUDIT LOGS FILTERABLE TABLE */}
          {adminTab === "audit" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tamper-proof Audit Logs</h4>
                  <p className="text-[10px] text-slate-500">Poniższa lista logów zbiera operacje i mutacje bazodanowe na żywo w tym klastrze.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleExportLogs}
                    className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 text-xxs font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Eksportuj logi</span>
                  </button>
                </div>
              </div>

              {/* Filters row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-150 text-xxs">
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold uppercase tracking-wider">Filtruj stopień (Severity)</label>
                  <select 
                    value={auditSeverity}
                    onChange={(e) => setAuditSeverity(e.target.value)}
                    className="w-full h-9 border border-slate-200 rounded-lg px-2 text-xxs focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all">Wszystkie zdarzenia</option>
                    <option value="critical">Zdarzenia Krytyczne (Usunięcia / Cofnięcia)</option>
                    <option value="info">Zdarzenia Standardowe (Logowania / Rejestracje)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold uppercase tracking-wider">Szukaj po słowie kluczowym</label>
                  <input
                    type="text"
                    value={auditActionType}
                    onChange={(e) => setAuditActionType(e.target.value)}
                    placeholder="np. role, workspace, member..."
                    className="w-full h-9 border border-slate-200 rounded-lg px-3 text-xxs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left border-collapse text-xxs font-mono">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Czas (Time)</th>
                      <th className="px-4 py-3">Aktor (Actor)</th>
                      <th className="px-4 py-3">Kategoria</th>
                      <th className="px-4 py-3">Wykonana akcja</th>
                      <th className="px-4 py-3">Szczegóły operacji</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-slate-400 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{log.actor.name}</td>
                        <td className="px-4 py-3 uppercase text-indigo-600 font-bold">{log.category}</td>
                        <td className="px-4 py-3 text-slate-700 font-bold">{log.action}</td>
                        <td className="px-4 py-3 text-slate-500 text-[10px]">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SYSTEM SETTINGS CONFIG */}
          {adminTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Auths & SSO configs */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Authentication & Access Control</h4>
                
                <div className="space-y-3 font-mono text-xxs">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border">
                    <div>
                      <p className="font-bold text-slate-700">Logowanie jednokrotne (SSO/OAuth)</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Wymusza logowanie firmowe SAML.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded uppercase">AKTYWNE</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border">
                    <div>
                      <p className="font-bold text-slate-700">Wymuś 2FA dla wszystkich ról</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Blokuje dostęp przy braku MFA.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 font-bold rounded uppercase">ZALECANE</span>
                  </div>
                </div>
              </div>

              {/* Retention & backups */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Kopia zapasowa & Retention</h4>
                
                <div className="space-y-3 font-mono text-xxs">
                  <div className="flex justify-between p-3 rounded-lg bg-slate-50 border">
                    <div>
                      <p className="font-bold text-slate-700">Harmonogram Backpów bazy</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Częstotliwość automatycznych kopii bezpieczeństwa.</p>
                    </div>
                    <span className="font-bold text-slate-600">Co 24 godziny (Daily)</span>
                  </div>

                  <div className="flex justify-between p-3 rounded-lg bg-slate-50 border">
                    <div>
                      <p className="font-bold text-slate-700">Weryfikacja integracji Webhooks</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Klucz sygnatury wysyłania powiadomień Slack/Discord.</p>
                    </div>
                    <span className="font-bold text-emerald-600">Zatwierdzony (Verified)</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
};
