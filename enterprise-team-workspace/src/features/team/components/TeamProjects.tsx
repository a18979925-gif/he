import { useState, FormEvent } from "react";
import { Project } from "../types/team";
import { Member } from "../types/member";
import { Task } from "../types/activity";
import { 
  FolderKanban, Plus, Trash2, Tag, Users, Wallet, GitBranch, 
  Terminal, ShieldAlert, LayoutGrid, List, Archive, Download
} from "lucide-react";
import { toast } from "sonner";

interface TeamProjectsProps {
  projects: Project[];
  members: Member[];
  tasks: Task[];
  activeMember: Member | null;
  hasPermission: (permission: any) => boolean;
  onCreateProject: (name: string, description: string, tags: string[]) => any;
  onUpdateProject?: (project: Project) => Promise<void>;
  onDeleteProject: (id: string) => void;
  logAction: (actor: Member, action: string, target: string, category: any, details?: string) => void;
}

export function TeamProjects({
  projects,
  members,
  tasks,
  activeMember,
  hasPermission,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  logAction
}: TeamProjectsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjTags, setNewProjTags] = useState("");

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Layout View States
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [bulkStatusSelect, setBulkStatusSelect] = useState<"active" | "archived" | "paused" | "">("");

  const canCreate = hasPermission("project.create");
  const canDelete = hasPermission("project.delete");
  const isOwnerOrAdmin = activeMember?.role === "owner" || activeMember?.role === "admin";

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newProjName || !newProjDesc) return;

    const tagsArr = newProjTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const createdProj = await onCreateProject(newProjName, newProjDesc, tagsArr);

      if (activeMember) {
        logAction(
          activeMember,
          "created project",
          `${newProjName} (${createdProj.id})`,
          "project",
          `Initialized with standard git files & workspace configurations.`
        );
      }

      toast.success(`Projekt "${newProjName}" został pomyślnie utworzony!`);
      setNewProjName("");
      setNewProjDesc("");
      setNewProjTags("");
      setShowCreateForm(false);
    } catch (err: any) {
      toast.error("Błąd podczas tworzenia projektu: " + err.message);
    }
  };

  const handleDeleteClick = async (proj: Project) => {
    if (window.confirm(`Czy jesteś absolutnie pewien, że chcesz usunąć projekt '${proj.name}'? Ta operacja jest nieodwracalna.`)) {
      try {
        await onDeleteProject(proj.id);
        if (activeMember) {
          logAction(
            activeMember,
            "deleted project",
            `${proj.name} (${proj.id})`,
            "project",
            "Project and all associated database records were wiped."
          );
        }
        if (selectedProjectId === proj.id) {
          setSelectedProjectId(null);
        }
      } catch (err: any) {
        toast.error("Błąd podczas usuwania projektu: " + err.message);
      }
    }
  };

  // Filter projects depending on developer role
  const isDeveloper = activeMember?.role === "developer";
  const visibleProjects = projects.filter((p) => {
    if (isDeveloper && activeMember) {
      const projectRole = activeMember.projectRoles?.[p.id];
      return projectRole === "developer" || projectRole === "maintainer" || projectRole === "owner";
    }
    return true;
  });

  // Multi-Select Operations
  const toggleSelectProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProjectIds.length === visibleProjects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(visibleProjects.map((p) => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!onUpdateProject) return;
    const toDelete = [...selectedProjectIds];
    if (toDelete.length === 0) return;

    if (window.confirm(`Czy na pewno chcesz usunąć ${toDelete.length} zaznaczonych projektów?`)) {
      try {
        toast.loading(`Usuwanie zbiorcze ${toDelete.length} projektów...`, { id: "bulk-proj-del" });
        
        // Find project data before deleting
        const projectDataBackup = toDelete
          .map((id) => projects.find((p) => p.id === id))
          .filter(Boolean) as Project[];

        // Delete all in parallel
        await Promise.all(toDelete.map((id) => onDeleteProject(id)));

        if (activeMember) {
          logAction(
            activeMember,
            "bulk deleted projects",
            `${toDelete.length} projects`,
            "project",
            `IDs: ${toDelete.join(", ")}`
          );
        }

        setSelectedProjectIds([]);

        // Show unified UNDO toast
        toast.success(`Pomyślnie usunięto ${toDelete.length} projektów.`, {
          id: "bulk-proj-del",
          action: {
            label: "Cofnij (10s)",
            onClick: async () => {
              try {
                toast.loading("Przywracanie projektów...", { id: "bulk-proj-restore" });
                // Restore all backed up projects using onUpdateProject
                await Promise.all(projectDataBackup.map((p) => onUpdateProject(p)));

                if (activeMember) {
                  logAction(
                    activeMember,
                    "bulk restored projects",
                    `${projectDataBackup.length} projects`,
                    "project",
                    `Restored backed-up project documents.`
                  );
                }
                toast.success(`Przywrócono ${projectDataBackup.length} projektów!`, { id: "bulk-proj-restore" });
              } catch (err: any) {
                toast.error("Błąd podczas przywracania: " + err.message, { id: "bulk-proj-restore" });
              }
            }
          },
          duration: 10000
        });
      } catch (err: any) {
        toast.error("Błąd usuwania zbiorczego: " + err.message, { id: "bulk-proj-del" });
      }
    }
  };

  const handleBulkStatusChange = async (newStatus: "active" | "archived" | "paused") => {
    if (!onUpdateProject || selectedProjectIds.length === 0) return;

    try {
      toast.loading(`Aktualizowanie statusu dla ${selectedProjectIds.length} projektów...`, { id: "bulk-proj-status" });

      // Save backup of original status
      const backupData = selectedProjectIds
        .map((id) => {
          const p = projects.find((proj) => proj.id === id);
          return p ? { id: p.id, originalStatus: p.status, project: p } : null;
        })
        .filter(Boolean) as { id: string; originalStatus: "active" | "archived" | "paused"; project: Project }[];

      // Update status in parallel
      await Promise.all(
        backupData.map(async ({ project }) => {
          const updated = { ...project, status: newStatus };
          await onUpdateProject(updated);
        })
      );

      if (activeMember) {
        logAction(
          activeMember,
          `bulk changed status to ${newStatus}`,
          `${selectedProjectIds.length} projects`,
          "project"
        );
      }

      setSelectedProjectIds([]);
      setBulkStatusSelect("");

      toast.success(`Zmieniono status ${backupData.length} projektów na ${newStatus.toUpperCase()}.`, {
        id: "bulk-proj-status",
        action: {
          label: "Cofnij (10s)",
          onClick: async () => {
            try {
              toast.loading("Przywracanie poprzednich statusów...", { id: "bulk-proj-status-undo" });

              await Promise.all(
                backupData.map(async ({ project, originalStatus }) => {
                  const restored = { ...project, status: originalStatus };
                  await onUpdateProject(restored);
                })
              );

              if (activeMember) {
                logAction(
                  activeMember,
                  "bulk undone project status change",
                  `${backupData.length} projects`,
                  "project"
                );
              }
              toast.success("Przywrócono poprzednie statusy projektów!", { id: "bulk-proj-status-undo" });
            } catch (err: any) {
              toast.error("Błąd podczas przywracania: " + err.message, { id: "bulk-proj-status-undo" });
            }
          }
        },
        duration: 10000
      });
    } catch (err: any) {
      toast.error("Błąd podczas zmiany statusu: " + err.message, { id: "bulk-proj-status" });
    }
  };

  const handleBulkAddTag = async () => {
    if (!onUpdateProject || selectedProjectIds.length === 0) return;
    const tagToAdd = window.prompt("Wpisz nazwę tagu, który chcesz dodać do wybranych projektów:");
    if (!tagToAdd || !tagToAdd.trim()) return;
    const cleanTag = tagToAdd.trim();

    try {
      toast.loading(`Dodawanie tagu "${cleanTag}" do ${selectedProjectIds.length} projektów...`, { id: "bulk-proj-tag" });

      const backupData = selectedProjectIds
        .map((id) => {
          const p = projects.find((proj) => proj.id === id);
          return p ? { id: p.id, originalTags: p.tags, project: p } : null;
        })
        .filter(Boolean) as { id: string; originalTags: string[]; project: Project }[];

      await Promise.all(
        backupData.map(async ({ project }) => {
          if (!project.tags.includes(cleanTag)) {
            const updated = { ...project, tags: [...project.tags, cleanTag] };
            await onUpdateProject(updated);
          }
        })
      );

      if (activeMember) {
        logAction(
          activeMember,
          `bulk added tag "${cleanTag}" to projects`,
          `${selectedProjectIds.length} projects`,
          "project"
        );
      }

      setSelectedProjectIds([]);

      toast.success(`Dodano tag "${cleanTag}" do zaznaczonych projektów.`, {
        id: "bulk-proj-tag",
        action: {
          label: "Cofnij (10s)",
          onClick: async () => {
            try {
              toast.loading("Przywracanie poprzednich tagów...", { id: "bulk-proj-tag-undo" });
              await Promise.all(
                backupData.map(async ({ project, originalTags }) => {
                  const restored = { ...project, tags: originalTags };
                  await onUpdateProject(restored);
                })
              );
              toast.success("Przywrócono poprzednie tagi projektów!", { id: "bulk-proj-tag-undo" });
            } catch (err: any) {
              toast.error("Błąd podczas przywracania: " + err.message, { id: "bulk-proj-tag-undo" });
            }
          }
        },
        duration: 10000
      });
    } catch (err: any) {
      toast.error("Błąd podczas dodawania tagu: " + err.message, { id: "bulk-proj-tag" });
    }
  };

  const handleBulkExport = () => {
    const selected = projects.filter((p) => selectedProjectIds.includes(p.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selected, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `projects_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success(`Wyeksportowano dane dla ${selected.length} projektów.`);
  };

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "archived":
        return "bg-slate-100 border-slate-200 text-slate-600";
      case "paused":
        return "bg-amber-50 border-amber-200 text-amber-700";
      default:
        return "bg-slate-50 border-slate-200 text-slate-600";
    }
  };

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "Aktywny";
      case "archived":
        return "Zarchiwizowany";
      case "paused":
        return "Wstrzymany";
      default:
        return "Aktywny";
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            {isDeveloper ? "Moje Przypisane Projekty" : "Projekty w Workspace"}
          </h2>
          <p className="text-xs text-slate-500">
            {isDeveloper
              ? "Repozytoria, w których posiadasz uprawnienia do zapisu i kompilacji."
              : "Przeglądaj globalne repozytoria, monitoruj finanse i zarządzaj wydaniami gałęzi."}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Grid/Table Layout Toggle Button Panel */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Widok kafelków"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Widok tabeli"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {canCreate ? (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden transition-all duration-150 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Utwórz Nowy Projekt</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-400 border border-slate-200 cursor-not-allowed select-none" title="Brak uprawnień 'project.create' w workspace.">
              <ShieldAlert className="h-4 w-4 text-slate-400" />
              <span>Utwórz Projekt (Wymaga Uprawnień)</span>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Form Drawer */}
      {showCreateForm && (
        <form onSubmit={handleCreateSubmit} className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-semibold text-indigo-950 flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-indigo-600" />
            <span>Zainicjuj Repozytorium Przedsiębiorstwa</span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Nazwa Projektu</label>
              <input
                type="text"
                required
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                placeholder="Microservice Core"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Tagi (Oddzielone przecinkami)</label>
              <input
                type="text"
                value={newProjTags}
                onChange={(e) => setNewProjTags(e.target.value)}
                placeholder="Fintech, Rust, Auth"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Opis projektu</label>
              <textarea
                required
                rows={2}
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                placeholder="Krótkie podsumowanie założeń architektury i celów wdrożenia."
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
            >
              Utwórz Repozytorium
            </button>
          </div>
        </form>
      )}

      {/* --- BULK ACTIONS FLOATING TOOLBAR --- */}
      {selectedProjectIds.length > 0 && (
        <div className="bg-slate-900 text-white rounded-xl px-5 py-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-slate-800 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 font-extrabold text-xs shrink-0 animate-pulse">
              {selectedProjectIds.length}
            </div>
            <div>
              <p className="text-xs font-bold">Zaznaczono {selectedProjectIds.length} projektów</p>
              <p className="text-[10px] text-slate-400 font-medium">Szybkie zarządzanie wybranym pakietem repozytoriów.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Status Change Selector */}
            <div className="flex items-center gap-1.5">
              <Archive className="h-3.5 w-3.5 text-indigo-400" />
              <select
                value={bulkStatusSelect}
                onChange={(e) => {
                  const val = e.target.value as "active" | "archived" | "paused";
                  setBulkStatusSelect(val);
                  if (val) {
                    handleBulkStatusChange(val);
                  }
                }}
                className="rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xxs font-semibold h-8 px-2.5 focus:outline-hidden"
              >
                <option value="">Zmień status zbiorczo...</option>
                <option value="active">Ustaw: Aktywny</option>
                <option value="archived">Ustaw: Zarchiwizuj</option>
                <option value="paused">Ustaw: Wstrzymaj</option>
              </select>
            </div>

            {/* Tag Modification */}
            <button
              onClick={handleBulkAddTag}
              className="h-8 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xxs font-bold px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Tag className="h-3.5 w-3.5 text-indigo-400" />
              <span>Dodaj tag</span>
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
            {canDelete && (
              <button
                onClick={handleBulkDelete}
                className="h-8 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/40 text-rose-200 text-xxs font-extrabold px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span>Usuń trwale</span>
              </button>
            )}

            {/* Cancel Selection */}
            <button
              onClick={() => setSelectedProjectIds([])}
              className="text-xxs text-slate-400 hover:text-slate-200 font-bold px-2 py-1 cursor-pointer"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* PROJECTS LIST VIEW - GRID OR TABLE */}
      {visibleProjects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <FolderKanban className="mx-auto h-12 w-12 text-slate-300 mb-3 animate-pulse" />
          <p className="text-sm font-semibold text-slate-800">Brak widocznych projektów.</p>
          <p className="text-xs mt-1 text-slate-400">
            {isDeveloper
              ? "Nie jesteś przypisany do żadnego projektu o wysokich uprawnieniach. Skontaktuj się z Właścicielem."
              : "Utwórz nowe repozytorium projektu, aby wypełnić przestrzeń roboczą."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID LAYOUT (With Multi-Select Checkboxes) */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProjects.map((proj) => {
            const isSelected = selectedProjectId === proj.id;
            const projectTasks = tasks.filter((t) => t.projectId === proj.id);
            const activeMemberProjRole = activeMember?.projectRoles?.[proj.id] || "viewer";
            const isChecked = selectedProjectIds.includes(proj.id);

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                className={`flex flex-col justify-between rounded-xl border p-5 bg-white cursor-pointer transition-all duration-200 relative ${
                  isChecked
                    ? "border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/5 shadow-xs"
                    : isSelected
                    ? "border-slate-400 ring-1 ring-slate-400/10 shadow-md"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                {/* Checkbox Overlay (Visible when hover or checked) */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectProject(proj.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                  />
                </div>

                <div className="pl-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-base font-semibold text-slate-700 border border-slate-200/50">
                      📦
                    </span>
                    <div className="flex gap-1.5 items-center">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-semibold capitalize ${getStatusBadge(proj.status)}`}>
                        {getStatusText(proj.status)}
                      </span>

                      {isOwnerOrAdmin && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                          <Wallet className="h-3 w-3" />
                          <span>${proj.revenue.toLocaleString()}</span>
                        </span>
                      )}
                      {isDeveloper && (
                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/10 capitalize">
                          Rola: {activeMemberProjRole === "owner" ? "Właściciel" : activeMemberProjRole === "maintainer" ? "Konserwator" : activeMemberProjRole === "developer" ? "Deweloper" : "Widz"}
                        </span>
                      )}
                      {canDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(proj);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Usuń Repozytorium"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">{proj.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">{proj.description}</p>
                  </div>
                </div>

                {/* Tags & Footer Meta */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 pl-6">
                  {/* Tag List */}
                  <div className="flex flex-wrap gap-1">
                    {proj.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600"
                      >
                        <Tag className="h-2.5 w-2.5 text-slate-400" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>

                  {/* Operational stats */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{proj.memberCount} Deweloperów</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Terminal className="h-3.5 w-3.5" />
                      <span>{projectTasks.length} Zadań</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LAYOUT */
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xxs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3.5 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedProjectIds.length === visibleProjects.length && visibleProjects.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                      title="Zaznacz wszystkie"
                    />
                  </th>
                  <th className="px-6 py-3.5">Szczegóły Projektu / Nazwa</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Tagi</th>
                  <th className="px-6 py-3.5">Kluczowe Statystyki</th>
                  {isOwnerOrAdmin && <th className="px-6 py-3.5">Przychód / Budżet</th>}
                  <th className="px-6 py-3.5 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                {visibleProjects.map((proj) => {
                  const isChecked = selectedProjectIds.includes(proj.id);
                  const isSelected = selectedProjectId === proj.id;
                  const projectTasks = tasks.filter((t) => t.projectId === proj.id);

                  return (
                    <tr
                      key={proj.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isChecked ? "bg-indigo-50/10" : ""
                      } ${isSelected ? "bg-slate-50" : ""}`}
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectProject(proj.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">📦</span>
                          <div>
                            <p className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                              {proj.name}
                            </p>
                            <p className="text-slate-500 text-xxs mt-0.5 max-w-sm line-clamp-1">
                              {proj.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xxs font-semibold capitalize ${getStatusBadge(proj.status)}`}>
                          {getStatusText(proj.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {proj.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-sm bg-slate-100 px-1.5 py-0.2 text-[9px] font-mono text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                        <div className="space-y-0.5">
                          <p>{proj.memberCount} deweloperów</p>
                          <p className="text-slate-400">{projectTasks.length} modułów zadań</p>
                        </div>
                      </td>
                      {isOwnerOrAdmin && (
                        <td className="px-6 py-4 font-mono font-semibold text-emerald-700 text-xs">
                          ${proj.revenue.toLocaleString()}
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedProjectId(isSelected ? null : proj.id)}
                            className="text-indigo-600 hover:text-indigo-800 text-xxs font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Szczegóły
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteClick(proj)}
                              className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Usuń trwale"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Project Granular Sub-View Drawer */}
      {selectedProjectId && (
        <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-xs animate-fadeIn space-y-4">
          {(() => {
            const selectedProj = projects.find((p) => p.id === selectedProjectId);
            if (!selectedProj) return null;

            const projTasks = tasks.filter((t) => t.projectId === selectedProj.id);
            const projMembers = members.filter((m) => m.projectRoles?.[selectedProj.id] !== undefined);

            return (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-indigo-600" />
                      <span>Kontekst Workspace: {selectedProj.name}</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {selectedProj.id} • Utworzono {new Date(selectedProj.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProjectId(null)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Zamknij Panel [x]
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Assigned Issues */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Przypisane Zadania Projektowe ({projTasks.length})</h4>
                    <div className="space-y-2">
                      {projTasks.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-lg">Brak aktywnych zadań przypisanych do tego repozytorium.</p>
                      ) : (
                        projTasks.map((t) => {
                          const assignedUser = members.find((m) => m.id === t.assignedTo);
                          return (
                            <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                              <div>
                                <p className="font-semibold text-slate-800">{t.title}</p>
                                <p className="text-[10px] text-slate-400 mt-1 font-mono">Przypisany: {assignedUser?.name || "Nieprzypisany"}</p>
                              </div>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                t.priority === "high" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                t.priority === "medium" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-50 text-slate-600"
                              }`}>
                                {t.priority === "high" ? "WYSOKI" : t.priority === "medium" ? "ŚREDNI" : "NISKI"}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Scoped Project Members */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Członkowie i Uprawnienia Projektowe ({projMembers.length})</h4>
                    <div className="space-y-2">
                      {projMembers.map((m) => {
                        const role = m.projectRoles[selectedProj.id];
                        return (
                          <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs">
                            <div className="flex items-center gap-2">
                              <img src={m.avatar} alt={m.name} className="h-6 w-6 rounded-md object-cover" />
                              <span className="font-semibold text-slate-800">{m.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase bg-white border border-slate-200 px-1.5 py-0.5 rounded-sm capitalize">
                              {role === "owner" ? "Właściciel" : role === "maintainer" ? "Konserwator" : role === "developer" ? "Deweloper" : "Widz"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
