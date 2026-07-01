import { useState, FormEvent } from "react";
import { Member } from "../types/member";
import { Project } from "../types/team";
import { TeamRole, ProjectRole } from "../types/role";
import { DEFAULT_ROLE_CONFIGS } from "../constants/permissions";
import { 
  ShieldAlert, UserPlus, Trash2, Edit, Check, Info, 
  Download, UserCheck, Tag, HelpCircle, RefreshCw, Users 
} from "lucide-react";
import { toast } from "sonner";

interface TeamMembersProps {
  members: Member[];
  projects: Project[];
  activeMember: Member | null;
  hasPermission: (permission: any) => boolean;
  onInviteMember: (name: string, email: string, role: TeamRole, department: string) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  logAction: (actor: Member, action: string, target: string, category: any, details?: string) => void;
}

export function TeamMembers({
  members,
  projects,
  activeMember,
  hasPermission,
  onInviteMember,
  onUpdateMember,
  onDeleteMember,
  logAction
}: TeamMembersProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("viewer");
  const [inviteDept, setInviteDept] = useState("Dział Techniczny");

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingProjectRoles, setEditingProjectRoles] = useState<string | null>(null); // memberId being edited

  // Multi-select Bulk Actions State
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [bulkRoleSelect, setBulkRoleSelect] = useState<TeamRole | "">("");

  // Permission Checks
  const canInvite = hasPermission("member.invite");
  const canRemove = hasPermission("member.remove");

  const handleInviteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    try {
      await onInviteMember(inviteName, inviteEmail, inviteRole, inviteDept);
      
      if (activeMember) {
        logAction(
          activeMember,
          "invited member",
          `${inviteName} (${inviteEmail}) as ${inviteRole.toUpperCase()}`,
          "member",
          `Assigned to department: ${inviteDept}`
        );
      }

      toast.success(`Zaproszenie dla użytkownika ${inviteName} zostało pomyślnie wysłane!`);
      // Reset Form
      setInviteName("");
      setInviteEmail("");
      setInviteRole("viewer");
      setInviteDept("Dział Techniczny");
      setShowInviteForm(false);
    } catch (err: any) {
      toast.error("Błąd zapraszania użytkownika: " + err.message);
    }
  };

  const handleRoleChange = async (member: Member, newRole: TeamRole) => {
    const oldRole = member.role;
    const updated = { ...member, role: newRole };
    try {
      await onUpdateMember(updated);
      
      if (activeMember) {
        logAction(
          activeMember,
          "changed role",
          `${member.name} (${oldRole.toUpperCase()} → ${newRole.toUpperCase()})`,
          "member",
          `Workspace credentials synchronized.`
        );
      }
      toast.success(`Rola użytkownika ${member.name} została zmieniona na ${newRole.toUpperCase()}.`);
    } catch (err: any) {
      toast.error("Błąd aktualizacji roli: " + err.message);
    }
  };

  const handleProjectRoleChange = async (member: Member, projectId: string, newProjRole: ProjectRole) => {
    const oldProjRole = member.projectRoles[projectId] || "viewer";
    const updatedProjectRoles = { ...member.projectRoles, [projectId]: newProjRole };
    const updated = { ...member, projectRoles: updatedProjectRoles };
    try {
      await onUpdateMember(updated);

      const project = projects.find((p) => p.id === projectId);
      if (activeMember && project) {
        logAction(
          activeMember,
          "changed project role",
          `${member.name} role in ${project.name} (${oldProjRole.toUpperCase()} → ${newProjRole.toUpperCase()})`,
          "member",
          `Project-level security context updated.`
        );
      }
      toast.success(`Zaktualizowano uprawnienia projektowe użytkownika ${member.name} dla projektu.`);
    } catch (err: any) {
      toast.error("Błąd aktualizacji uprawnień projektowych: " + err.message);
    }
  };

  const handleDeleteClick = async (member: Member) => {
    if (window.confirm(`Czy na pewno chcesz usunąć użytkownika ${member.name} z organizacji?`)) {
      try {
        await onDeleteMember(member.id);
        if (activeMember) {
          logAction(
            activeMember,
            "removed member",
            `${member.name} (${member.email})`,
            "member",
            "Workspace credentials completely revoked."
          );
        }
      } catch (err: any) {
        toast.error("Błąd usuwania użytkownika: " + err.message);
      }
    }
  };

  // --- Bulk Operations Handlers ---
  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMemberIds.length === members.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(members.map(m => m.id));
    }
  };

  const handleBulkDelete = async () => {
    const toDelete = selectedMemberIds.filter(id => id !== activeMember?.id);
    if (toDelete.length === 0) {
      toast.error("Brak członków do usunięcia (nie możesz usunąć samej/samgo siebie).");
      return;
    }

    const selectedMembersData = members.filter(m => toDelete.includes(m.id));

    if (window.confirm(`Czy na pewno chcesz usunąć ${toDelete.length} zaznaczonych członków zespołu? Ta operacja jest nieodwracalna (można cofnąć w ciągu 10s).`)) {
      try {
        toast.loading(`Usuwanie zbiorcze ${toDelete.length} użytkowników...`, { id: "bulk-del" });
        
        // Delete all selected in parallel
        await Promise.all(toDelete.map(id => onDeleteMember(id)));
        
        if (activeMember) {
          logAction(
            activeMember,
            "bulk removed members",
            `${toDelete.length} members`,
            "member",
            `IDs: ${toDelete.join(", ")}`
          );
        }

        setSelectedMemberIds([]);
        toast.success(`Pomyślnie usunięto ${toDelete.length} członków zespołu.`, {
          id: "bulk-del",
          action: {
            label: "Cofnij (10s)",
            onClick: async () => {
              try {
                toast.loading("Przywracanie członków...", { id: "bulk-restore" });
                // Re-add them using onUpdateMember (since updateMember uses setDoc which recreates deleted documents!)
                await Promise.all(selectedMembersData.map(m => onUpdateMember(m)));
                if (activeMember) {
                  logAction(
                    activeMember,
                    "bulk restored members",
                    `${selectedMembersData.length} members`,
                    "member",
                    "Restored multiple user identities and workspace privileges."
                  );
                }
                toast.success(`Przywrócono ${selectedMembersData.length} członków zespołu!`, { id: "bulk-restore" });
              } catch (err: any) {
                toast.error("Błąd przywracania: " + err.message, { id: "bulk-restore" });
              }
            }
          },
          duration: 10000
        });
      } catch (err: any) {
        toast.error("Błąd usuwania zbiorczego: " + err.message, { id: "bulk-del" });
      }
    }
  };

  const handleBulkChangeRoleSubmit = async (role: TeamRole) => {
    if (!role) return;
    const selectedMembersData = members.filter(m => selectedMemberIds.includes(m.id));
    try {
      toast.loading(`Zmiana roli dla ${selectedMemberIds.length} członków...`, { id: "bulk-role" });
      
      await Promise.all(selectedMemberIds.map(async id => {
        const m = members.find(member => member.id === id);
        if (m) {
          const updated = { ...m, role };
          await onUpdateMember(updated);
        }
      }));

      if (activeMember) {
        logAction(
          activeMember,
          "bulk changed roles",
          `${selectedMemberIds.length} members to ${role.toUpperCase()}`,
          "member"
        );
      }

      setSelectedMemberIds([]);
      setBulkRoleSelect("");
      
      toast.success(`Rola dla ${selectedMembersData.length} użytkowników została pomyślnie zmieniona na ${role.toUpperCase()}!`, {
        id: "bulk-role",
        action: {
          label: "Cofnij (10s)",
          onClick: async () => {
            try {
              toast.loading("Przywracanie poprzednich ról...", { id: "bulk-restore" });
              await Promise.all(selectedMembersData.map(m => onUpdateMember(m)));
              if (activeMember) {
                logAction(activeMember, "bulk restored roles", `${selectedMembersData.length} members`, "member");
              }
              toast.success("Przywrócono oryginalne role użytkowników!", { id: "bulk-restore" });
            } catch (err: any) {
              toast.error("Błąd przywracania ról: " + err.message, { id: "bulk-restore" });
            }
          }
        },
        duration: 10000
      });
    } catch (err: any) {
      toast.error("Błąd zmiany ról: " + err.message, { id: "bulk-role" });
    }
  };

  const handleBulkChangeDept = async () => {
    const newDept = window.prompt("Wprowadź nową nazwę departamentu dla zaznaczonych członków zespołu:");
    if (!newDept || !newDept.trim()) return;

    const selectedMembersData = members.filter(m => selectedMemberIds.includes(m.id));

    try {
      toast.loading(`Zmiana działu dla ${selectedMemberIds.length} członków...`, { id: "bulk-dept" });
      
      await Promise.all(selectedMemberIds.map(async id => {
        const m = members.find(member => member.id === id);
        if (m) {
          const updated = { ...m, department: newDept.trim() };
          await onUpdateMember(updated);
        }
      }));

      if (activeMember) {
        logAction(
          activeMember,
          "bulk changed departments",
          `${selectedMemberIds.length} members to ${newDept}`,
          "member"
        );
      }

      setSelectedMemberIds([]);
      toast.success(`Dział został zaktualizowany na "${newDept}" dla ${selectedMembersData.length} członków!`, {
        id: "bulk-dept",
        action: {
          label: "Cofnij (10s)",
          onClick: async () => {
            try {
              toast.loading("Przywracanie poprzednich działów...", { id: "bulk-restore" });
              await Promise.all(selectedMembersData.map(m => onUpdateMember(m)));
              if (activeMember) {
                logAction(activeMember, "bulk restored departments", `${selectedMembersData.length} members`, "member");
              }
              toast.success("Przywrócono oryginalne działy użytkowników!", { id: "bulk-restore" });
            } catch (err: any) {
              toast.error("Błąd przywracania działów: " + err.message, { id: "bulk-restore" });
            }
          }
        },
        duration: 10000
      });
    } catch (err: any) {
      toast.error("Błąd aktualizacji działów: " + err.message, { id: "bulk-dept" });
    }
  };

  const handleBulkExport = () => {
    const selectedMembers = members.filter(m => selectedMemberIds.includes(m.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedMembers, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `team_members_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Wyeksportowano dane dla ${selectedMembers.length} członków zespołu.`);
  };

  // Status visual color map
  const getPresenceColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500";
      case "away": return "bg-amber-400";
      case "offline": return "bg-slate-400";
      default: return "bg-emerald-500";
    }
  };

  const getPresenceText = (status: string) => {
    switch (status) {
      case "active": return "Dostępny";
      case "away": return "Zaraz wracam";
      case "offline": return "Offline";
      default: return "Dostępny";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Członkowie i Kontrola Dostępu</h2>
          <p className="text-xs text-slate-500">Zarządzaj użytkownikami organizacji, danymi logowania workspace oraz uprawnieniami do poszczególnych projektów.</p>
        </div>

        {/* Invite Button with Permission Guard feedback */}
        <div>
          {canInvite ? (
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden transition-all duration-150 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Zaproś Członka Organizacji</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-400 border border-slate-200 cursor-not-allowed select-none" title="Brak uprawnień 'member.invite' do zapraszania użytkowników.">
              <ShieldAlert className="h-4 w-4 text-slate-400" />
              <span>Zaproś Członka (Wymaga Uprawnień)</span>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Drawer Form */}
      {showInviteForm && (
        <form onSubmit={handleInviteSubmit} className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-indigo-950 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-indigo-600" />
            <span>Wyślij Nowe Zaproszenie do Workspace</span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Imię i nazwisko</label>
              <input
                type="text"
                required
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Andrzej Kowalski"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Adres E-mail</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="andrzej@domena.pl"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Globalna Rola w Workspace</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="owner">Owner (Właściciel)</option>
                <option value="admin">Admin (Administrator)</option>
                <option value="developer">Developer (Deweloper)</option>
                <option value="security">Security Officer (Inspektor Bezpieczeństwa)</option>
                <option value="manager">Manager (Menedżer)</option>
                <option value="worker">Worker (Pracownik)</option>
                <option value="viewer">Viewer (Widz)</option>
              </select>
            </div>
            <div>
              <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Dział / Departament</label>
              <input
                type="text"
                required
                value={inviteDept}
                onChange={(e) => setInviteDept(e.target.value)}
                placeholder="Dział Techniczny"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowInviteForm(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
            >
              Wyślij Zaproszenie
            </button>
          </div>
        </form>
      )}

      {/* --- BULK ACTION TOOLBAR (Slides in when items selected) --- */}
      {selectedMemberIds.length > 0 && (
        <div className="bg-slate-900 text-white rounded-xl px-5 py-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-slate-800 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-extrabold text-xs shrink-0 animate-pulse">
              {selectedMemberIds.length}
            </div>
            <div>
              <p className="text-xs font-bold">Zaznaczono {selectedMemberIds.length} użytkowników</p>
              <p className="text-[10px] text-slate-400">Wybierz operację zbiorczą dla zaznaczonych tożsamości.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Bulk Change Role Selector */}
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
              <select
                value={bulkRoleSelect}
                onChange={(e) => {
                  const val = e.target.value as TeamRole;
                  setBulkRoleSelect(val);
                  if (val) {
                    handleBulkChangeRoleSubmit(val);
                  }
                }}
                className="rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xxs font-semibold h-8 px-2.5 focus:outline-hidden"
              >
                <option value="">Zmień rolę zbiorczo...</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
                <option value="security">Security Officer</option>
                <option value="manager">Manager</option>
                <option value="worker">Worker</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            {/* Change Department */}
            <button
              onClick={handleBulkChangeDept}
              className="h-8 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xxs font-bold px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Tag className="h-3.5 w-3.5 text-indigo-400" />
              <span>Zmień dział</span>
            </button>

            {/* JSON Export */}
            <button
              onClick={handleBulkExport}
              className="h-8 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xxs font-bold px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Eksportuj (.JSON)</span>
            </button>

            {/* Bulk Delete */}
            {canRemove && (
              <button
                onClick={handleBulkDelete}
                className="h-8 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/40 text-rose-200 text-xxs font-extrabold px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Usuń całkowicie</span>
              </button>
            )}

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedMemberIds([])}
              className="text-xxs text-slate-400 hover:text-slate-200 font-bold px-2 py-1 cursor-pointer"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* Directory Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xxs font-bold uppercase tracking-wider text-slate-400">
                {/* Selection column header */}
                <th className="px-6 py-3.5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.length === members.length && members.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    title="Zaznacz wszystkich"
                  />
                </th>
                <th className="px-6 py-3.5">Tożsamość Użytkownika</th>
                <th className="px-6 py-3.5">Rola w Workspace</th>
                <th className="px-6 py-3.5">Departament</th>
                <th className="px-6 py-3.5">Status & Aktywność</th>
                <th className="px-6 py-3.5">Role Projektowe (Dostęp Szczegółowy)</th>
                <th className="px-6 py-3.5 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
              {members.map((member) => {
                const isSelectedForProjectRoles = editingProjectRoles === member.id;
                const roleConf = DEFAULT_ROLE_CONFIGS[member.role] || DEFAULT_ROLE_CONFIGS.viewer;
                const isChecked = selectedMemberIds.includes(member.id);

                return (
                  <tr key={member.id} className={`hover:bg-slate-50/50 transition-colors ${isChecked ? "bg-indigo-50/10" : ""}`}>
                    {/* Row Checkbox */}
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectMember(member.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img src={member.avatar} alt={member.name} className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-100" />
                          <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getPresenceColor(member.status || "active")} ring-1 ring-slate-900/5`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-slate-900">{member.name}</p>
                            {member.id === activeMember?.id && (
                              <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm border border-indigo-100">
                                TY
                              </span>
                            )}
                          </div>
                          <p className="text-xxs text-slate-400 font-mono">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* Let authorized users edit role on the fly */}
                      {canInvite ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member, e.target.value as TeamRole)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        >
                          <option value="owner">Owner (Właściciel)</option>
                          <option value="admin">Admin (Administrator)</option>
                          <option value="developer">Developer (Deweloper)</option>
                          <option value="security">Security Officer (Inspektor Bezpieczeństwa)</option>
                          <option value="manager">Manager (Menedżer)</option>
                          <option value="worker">Worker (Pracownik)</option>
                          <option value="viewer">Viewer (Widz)</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xxs font-semibold ${roleConf.badgeBg}`}>
                          {roleConf.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xxs text-slate-500">
                      {member.department}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="text-slate-600 font-medium text-[10px] flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${getPresenceColor(member.status || "active")}`} />
                          <span>{getPresenceText(member.status || "active")}</span>
                        </span>
                        <p className="text-[9px] text-slate-400 font-mono">Logowanie: {member.lastActive || "Przed chwilą"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {/* Display project level configurations */}
                        {projects.map((proj) => {
                          const projRole = member.projectRoles?.[proj.id] || "viewer";
                          return (
                            <div key={proj.id} className="flex items-center gap-2 text-xxs">
                              <span className="font-semibold text-slate-500 min-w-[100px] truncate">{proj.name}:</span>
                              {isSelectedForProjectRoles ? (
                                <select
                                  value={projRole}
                                  onChange={(e) => handleProjectRoleChange(member, proj.id, e.target.value as ProjectRole)}
                                  className="rounded-sm border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-medium"
                                >
                                  <option value="owner">Właściciel Projektu</option>
                                  <option value="maintainer">Konserwator</option>
                                  <option value="developer">Deweloper</option>
                                  <option value="viewer">Widz</option>
                                </select>
                              ) : (
                                <span className={`rounded-sm border px-1.5 py-0.2 font-mono text-[9px] font-medium capitalize ${
                                  projRole === "owner" ? "bg-rose-50 border-rose-200 text-rose-700" :
                                  projRole === "maintainer" ? "bg-amber-50 border-amber-200 text-amber-700" :
                                  projRole === "developer" ? "bg-blue-50 border-blue-200 text-blue-700" :
                                  "bg-slate-50 border-slate-200 text-slate-600"
                                }`}>
                                  {projRole === "owner" ? "Właściciel" : projRole === "maintainer" ? "Konserwator" : projRole === "developer" ? "Deweloper" : "Widz"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {/* Project specific setup explanation */}
                        <button
                          onClick={() => setEditingProjectRoles(isSelectedForProjectRoles ? null : member.id)}
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                          <Edit className="h-2.5 w-2.5" />
                          <span>{isSelectedForProjectRoles ? "Zapisz uprawnienia" : "Konfiguruj uprawnienia projektowe"}</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canRemove ? (
                        <button
                          onClick={() => handleDeleteClick(member)}
                          disabled={member.id === activeMember?.id}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                          title={member.id === activeMember?.id ? "Nie możesz usunąć aktualnie zalogowanej tożsamości" : "Cofnij uprawnienia całkowicie"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 select-none cursor-not-allowed" title="Twój symulator nie posiada uprawnień 'member.remove'">
                          🔒 Zabezpieczone
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Roles explanation note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 flex gap-3">
        <Info className="h-5 w-5 text-indigo-500 shrink-0" />
        <div>
          <h4 className="font-bold text-slate-800">Wskazówka dotycząca ról projektowych (Workspace vs. Uprawnienia Projektowe)</h4>
          <p className="mt-1 leading-relaxed">
            Uprawnienia workspace określają, które panele strukturalne użytkownik może przeglądać i edytować (takie jak rozliczenia, integracje i lista członków). Role projektowe (np. Właściciel Projektu, Konserwator, Deweloper, Widz) są ograniczone specjalnie do poszczególnych repozytoriów. Na przykład, globalny Deweloper może być przypisany jako Właściciel w jednym projekcie, a w innym mieć tylko prawa do odczytu ze względów bezpieczeństwa.
          </p>
        </div>
      </div>
    </div>
  );
}
