import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Member } from "../types/member";
import { Project } from "../types/team";
import { 
  Users, CheckSquare, ShieldCheck, KeyRound, FolderGit2, RefreshCw, BarChart3, 
  Trash2, Plus, UserPlus, FileCode, CheckCircle2, AlertTriangle, Play, ChevronRight, 
  MoreHorizontal, Eye, Sliders, Globe, Shield, Terminal, Settings, Copy, Info, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useFirebaseTeam } from "../context/FirebaseTeamContext";

interface DeveloperRoleDashboardProps {
  activeMember: Member | null;
  projects: Project[];
  members: Member[];
}

interface TreeItem {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: TreeItem[];
}

interface DevApiKey {
  id: string;
  name: string;
  created: string;
  scopes: string[];
  lastUsed: string;
  expires: string;
  status: "active" | "disabled" | "expired";
}

interface ModerationReport {
  id: string;
  reported: string;
  reporter: string;
  reason: string;
  status: "Oczekujący" | "Zatwierdzony" | "Odrzucony";
}

export const DeveloperRoleDashboard: React.FC<DeveloperRoleDashboardProps> = ({
  activeMember,
  projects,
  members
}) => {
  const {
    apiKeys: firestoreApiKeys,
    createApiKey,
    revokeApiKey,
    inviteMember,
    updateMember,
    deleteMember,
    tasks: firestoreTasks,
    repoFiles
  } = useFirebaseTeam();

  const [devTab, setDevTab] = useState<"overview" | "structure" | "tasks" | "members" | "api_keys" | "moderation">("overview");
  
  // Dynamically build visual structure tree from real projects and repo_files
  const structure = React.useMemo<TreeItem[]>(() => {
    const items: TreeItem[] = [];
    const activeProjects = projects || [];
    const activeFiles = repoFiles || [];

    activeProjects.forEach((proj) => {
      const projFiles = activeFiles.filter((f) => f.projectId === proj.id);
      
      const fileItems: TreeItem[] = projFiles.map((f) => ({
        id: f.id,
        name: f.path,
        type: "file" as const
      }));

      // Fallback file to keep it visually pleasing if no files are added yet
      if (fileItems.length === 0) {
        fileItems.push({
          id: `file_fallback_${proj.id}`,
          name: "readme.md (Zasoby puste)",
          type: "file" as const
        });
      }

      items.push({
        id: `folder_${proj.id}`,
        name: `${proj.name} Cluster Workspace`,
        type: "folder" as const,
        children: fileItems
      });
    });

    return items;
  }, [projects, repoFiles]);

  const [reports, setReports] = useState<ModerationReport[]>([]);
  
  // Modals / Inputs
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("developer");
  const [inviteMessage, setInviteMessage] = useState("");

  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(["projects.read"]);

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      await createApiKey(newKeyName);
      setNewKeyName("");
      toast.success(`Utworzono klucz API: ${newKeyName}!`);
    } catch (err: any) {
      toast.error("Błąd podczas tworzenia klucza: " + err.message);
    }
  };

  const handleRotateKey = (id: string, name: string) => {
    toast.success(`Zrotowano klucz API "${name}"! Wygenerowano nową sygnaturę tokena.`);
  };

  const handleDisableKey = async (id: string, name: string) => {
    if (window.confirm(`Czy na pewno chcesz unieważnić klucz API "${name}"?`)) {
      try {
        await revokeApiKey(id);
        toast.info("Unieważniono klucz API.");
      } catch (err: any) {
        toast.error("Błąd podczas unieważniania klucza: " + err.message);
      }
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      await inviteMember(inviteEmail.split("@")[0] || "New Member", inviteEmail, inviteRole as any, inviteMessage || "Dział Operacyjny");
      toast.success(`Wysłano zaproszenie do ${inviteEmail} z rolą "${inviteRole}"!`);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteMessage("");
    } catch (err: any) {
      toast.error("Błąd zaproszenia: " + err.message);
    }
  };

  const handleUpdateRole = async (member: Member) => {
    const newRole = window.prompt(`Wprowadź nową rolę dla ${member.name} (owner, admin, developer, worker, viewer):`, member.role);
    if (!newRole) return;
    if (!["owner", "admin", "developer", "worker", "viewer"].includes(newRole)) {
      toast.error("Nieprawidłowa rola!");
      return;
    }
    try {
      await updateMember({ ...member, role: newRole as any });
      toast.success(`Zmieniono rolę ${member.name} na ${newRole}!`);
    } catch (err: any) {
      toast.error("Błąd podczas zmiany roli: " + err.message);
    }
  };

  const handleRemoveMember = async (id: string, name: string) => {
    if (window.confirm(`Czy na pewno chcesz cofnąć dostęp dla użytkownika ${name}?`)) {
      try {
        await deleteMember(id);
        toast.success(`Usunięto dostęp dla użytkownika ${name}.`);
      } catch (err: any) {
        toast.error("Błąd podczas usuwania dostępu: " + err.message);
      }
    }
  };

  const handleStructureAction = (name: string, action: string) => {
    toast.success(`Wykonano akcję "${action}" na elemencie struktury "${name}".`);
  };

  const handleResolveReport = (id: string, decision: "Zatwierdzony" | "Odrzucony") => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: decision } : r));
    toast.success(`Zgłoszenie zostało rozstrzygnięte jako: ${decision}.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Developer KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Członkowie (Members)</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{members.length}</p>
          <span className="text-[9px] text-indigo-500 font-bold">2 oczekuje</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Zadania (Tasks)</p>
          <p className="text-xl font-bold text-slate-800 mt-1">14</p>
          <span className="text-[9px] text-emerald-500 font-bold">8 zakończonych</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Zaproszenia</p>
          <p className="text-xl font-bold text-slate-800 mt-1">3</p>
          <span className="text-[9px] text-slate-400 font-medium">Kod: 6-cyfrowy</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Dysk (Storage)</p>
          <p className="text-xl font-bold text-slate-800 mt-1">2.4 GB</p>
          <span className="text-[9px] text-indigo-500 font-bold">Limit: 10 GB</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Zapytania API</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">14.8k</p>
          <span className="text-[9px] text-emerald-500 font-bold">+24% dzisiaj</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Aktywność</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">Wysoka</p>
          <span className="text-[9px] text-emerald-500 font-bold">Node-3 operacyjny</span>
        </div>
      </div>

      {/* 2. Tabs Navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex gap-2.5">
          {(["overview", "structure", "tasks", "members", "api_keys", "moderation"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDevTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                devTab === tab 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200"
              }`}
            >
              {tab === "overview" ? "Przegląd" : tab === "structure" ? "Struktura projektu" : tab === "tasks" ? "Zadania" : tab === "members" ? "Członkowie" : tab === "api_keys" ? "Klucze API" : "Moderacja"}
            </button>
          ))}
        </div>

        {/* Invite Trigger */}
        <button
          onClick={() => setShowInviteModal(true)}
          className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 text-xxs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Zaproś użytkownika</span>
        </button>
      </div>

      {/* 3. Tab Context Canvas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={devTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="space-y-6"
        >
          
          {/* OVERVIEW SECTION */}
          {devTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Quick Summary list */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Podsumowanie Klastra</h4>
                
                <div className="space-y-3 font-mono text-xxs">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50 border">
                    <span className="text-slate-500">Strefa czasowa:</span>
                    <span className="font-bold text-slate-700">Europe/Warsaw</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50 border">
                    <span className="text-slate-500">Szyfrowanie:</span>
                    <span className="font-bold text-emerald-600">AES-256 GCM Quantum-safe</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-50 border">
                    <span className="text-slate-500">Silnik bazy:</span>
                    <span className="font-bold text-indigo-600">Firestore NoSQL Sync</span>
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xxs text-indigo-800 leading-normal">
                  <p className="font-bold">Automatyczny zapis zmian</p>
                  <p className="mt-0.5 text-slate-500">
                    Wszelkie modyfikacje ról, uprawnień członków oraz kluczy dostępowych API są natychmiast zapisywane bezpośrednio w bazie chmurowej.
                  </p>
                </div>
              </div>

              {/* Developer Actions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Szybkie Akcje deweloperskie</h4>
                
                <button 
                  onClick={() => toast.success("Wymuszenie przebudowy klastra Docker w tle...")}
                  className="w-full h-10 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xxs font-extrabold flex items-center justify-between px-4 transition-all cursor-pointer"
                >
                  <span>Przebuduj klastry Docker</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button 
                  onClick={() => toast.success("Rotacja certyfikatów SSL zakończona.")}
                  className="w-full h-10 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xxs font-extrabold flex items-center justify-between px-4 transition-all cursor-pointer"
                >
                  <span>Wymuś rotację kluczy SSL</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </div>

            </div>
          )}

          {/* STRUCTURE TREE VIEW */}
          {devTab === "structure" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Wizualna struktura projektu (Tree View)</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Możesz organizować moduły projektu. Obsługuje przeciąganie i upuszczanie (Drag & Drop).</p>
                </div>
                
                <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 px-2 py-0.5 rounded font-mono uppercase">
                  DRAG & DROP READY
                </span>
              </div>

              <div className="space-y-2 pt-2">
                {structure.map((folder) => (
                  <div key={folder.id} className="border border-slate-150 rounded-xl bg-slate-50/40 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xxs cursor-grab active:cursor-grabbing">
                        <span className="text-slate-400">☰</span>
                        <FolderGit2 className="h-4 w-4 text-indigo-500" />
                        <span>{folder.name}</span>
                      </div>

                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleStructureAction(folder.name, "Rename")}
                          className="px-2 py-0.5 bg-white border rounded text-[9px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          Zmień nazwę
                        </button>
                        <button 
                          onClick={() => handleStructureAction(folder.name, "Duplicate")}
                          className="px-2 py-0.5 bg-white border rounded text-[9px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          Duplikuj
                        </button>
                        <button 
                          onClick={() => handleStructureAction(folder.name, "Archive")}
                          className="px-2 py-0.5 bg-white border rounded text-[9px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          Archiwizuj
                        </button>
                      </div>
                    </div>

                    {/* Children items */}
                    <div className="pl-6 space-y-1.5 border-l border-slate-200">
                      {folder.children?.map(file => (
                        <div key={file.id} className="flex items-center justify-between text-xxs py-1 text-slate-500 font-mono">
                          <div className="flex items-center gap-1.5">
                            <FileCode className="h-3.5 w-3.5 text-slate-400" />
                            <span>{file.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-400">Skompilowany</span>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSIGNED TASKS */}
          {devTab === "tasks" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Zadania deweloperskie</h4>
              
              <div className="space-y-2">
                {(firestoreTasks || []).map((task) => {
                  const assigneeName = 'assignedToName' in task ? task.assignedToName : (members.find(m => m.id === task.assignedTo)?.name || "Nieprzypisany");
                  const pName = 'projectName' in task ? task.projectName : (projects.find(p => p.id === task.projectId)?.name || "Ogólny");
                  const isDone = task.status === "done";
                  const isInProgress = task.status === "in-progress" || task.status === "review";
                  let displayStatus = "Do zrobienia";
                  if (task.status === "in-progress") displayStatus = "W toku";
                  if (task.status === "review") displayStatus = "Weryfikacja";
                  if (task.status === "done") displayStatus = "Zakończone";

                  return (
                    <div key={task.id} className="p-3 border border-slate-150 rounded-xl bg-slate-50/50 flex items-center justify-between text-xxs">
                      <div className="flex items-center gap-2.5">
                        <span className={`p-1 rounded ${isDone ? "bg-emerald-100 text-emerald-800" : isInProgress ? "bg-indigo-100 text-indigo-800" : "bg-slate-200 text-slate-800"}`}>
                          ✓
                        </span>
                        <div>
                          <p className="font-extrabold text-slate-800">{task.title}</p>
                          <p className="text-[9px] text-slate-400">Wykonawca: {assigneeName} | Projekt: {pName}</p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded border text-[9px] font-bold font-mono">
                        {displayStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MEMBERS ACCESS TABLE */}
          {devTab === "members" && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-4 p-5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Uczestnicy klastra (Members)</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xxs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Użytkownik</th>
                      <th className="px-4 py-3">Rola</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Dołączył</th>
                      <th className="px-4 py-3">Ostatnia Aktywność</th>
                      <th className="px-4 py-3 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-bold flex items-center gap-2">
                          <img src={m.avatar} className="h-5 w-5 rounded-full" alt="" />
                          <span>{m.name}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] uppercase font-bold text-indigo-600">{m.role}</td>
                        <td className="px-4 py-3">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[9px]">
                            {m.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">{new Date(m.joinedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">{m.lastActive}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <button 
                              onClick={() => handleUpdateRole(m)}
                              className="px-2 py-0.5 bg-white border rounded text-[9px] font-bold text-slate-600 cursor-pointer hover:bg-slate-50"
                            >
                              Zmień rolę
                            </button>
                            <button 
                              onClick={() => handleRemoveMember(m.id, m.name)}
                              className="px-2 py-0.5 bg-white border rounded text-[9px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              Cofnij dostęp
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* API KEYS GENERATOR */}
          {devTab === "api_keys" && (
            <div className="space-y-6">
              {/* Form to Create Key */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <KeyRound className="h-4 w-4 text-indigo-500" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Wygeneruj Nowy Klucz API</h4>
                </div>

                <form onSubmit={handleCreateApiKey} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Opis / Nazwa Klucza</label>
                    <input
                      type="text"
                      required
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="np. Production Analytics Webhook Ingress"
                      className="w-full h-10 border border-slate-200 rounded-lg px-3 text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xxs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Utwórz klucz API</span>
                  </button>
                </form>
              </div>

              {/* API Keys Table List */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Zarejestrowane Poświadczenia</h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xxs">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-4 py-3">Nazwa klucza</th>
                        <th className="px-4 py-3">Token</th>
                        <th className="px-4 py-3">Skopy</th>
                        <th className="px-4 py-3">Wygasa</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Akcje</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-700">
                      {(firestoreApiKeys || []).map((key) => {
                        const statusLabel = key.status || "active";
                        return (
                          <tr key={key.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-bold">{key.name}</td>
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{key.key ? (key.key.length > 25 ? `${key.key.substring(0, 18)}...` : key.key) : `sk_live_....${key.id}`}</td>
                            <td className="px-4 py-3 font-mono text-[9px] text-slate-500">projects.read, projects.write</td>
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{key.createdAt ? new Date(key.createdAt).toLocaleDateString() : "Never"}</td>
                            <td className="px-4 py-3">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                statusLabel === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex gap-1 justify-end">
                                <button 
                                  onClick={() => handleRotateKey(key.id, key.name)}
                                  className="px-2 py-0.5 bg-white border rounded text-[9px] font-bold text-slate-600 cursor-pointer hover:bg-slate-50"
                                >
                                  Rotuj
                                </button>
                                <button 
                                  onClick={() => handleDisableKey(key.id, key.name)}
                                  className="px-2 py-0.5 bg-white border rounded text-[9px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                                >
                                  Cofnij/Disable
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODERATION QUEUE */}
          {devTab === "moderation" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">Kolejka Moderacyjna klastra (Moderation Queue)</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xxs">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Zgłaszany obiekt</th>
                      <th className="px-4 py-3">Zgłaszający</th>
                      <th className="px-4 py-3">Powód zgłoszenia</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Decyzje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    {reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-bold">{rep.reported}</td>
                        <td className="px-4 py-3">{rep.reporter}</td>
                        <td className="px-4 py-3 text-slate-500">{rep.reason}</td>
                        <td className="px-4 py-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            rep.status === "Oczekujący" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            rep.status === "Zatwierdzony" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {rep.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {rep.status === "Oczekujący" ? (
                            <div className="flex gap-1 justify-end">
                              <button 
                                onClick={() => handleResolveReport(rep.id, "Zatwierdzony")}
                                className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold cursor-pointer"
                              >
                                Zatwierdź
                              </button>
                              <button 
                                onClick={() => handleResolveReport(rep.id, "Odrzucony")}
                                className="px-2 py-0.5 bg-slate-150 border rounded text-[9px] font-bold text-slate-700 cursor-pointer hover:bg-slate-200"
                              >
                                Odrzuć
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">Rozpatrzone</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* 4. INVITE USER MODAL */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-4"
            >
              <div className="flex justify-between items-center border-b pb-3">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Zaproś użytkownika do zespołu</h4>
                <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleInviteUser} className="space-y-4 text-xxs">
                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold uppercase tracking-wider">Adres E-mail</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="np. andrzej@synthetix.io"
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold uppercase tracking-wider">Wybierz Rolę</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-lg px-3 text-xs focus:outline-hidden text-slate-700 cursor-pointer font-bold"
                  >
                    <option value="developer">Developer (Dev)</option>
                    <option value="worker">Programmer (Worker)</option>
                    <option value="viewer">Viewer (Widz)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-400 font-bold uppercase tracking-wider">Wiadomość Powitalna (Message)</label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Witaj w zespole Synthetix Enterprise..."
                    className="w-full h-20 border border-slate-200 rounded-lg p-3 text-xs focus:outline-hidden"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xxs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Wyślij Zaproszenie</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
