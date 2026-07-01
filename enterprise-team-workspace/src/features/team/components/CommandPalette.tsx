import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Search, Users, Folder, CheckSquare, Settings, Key, 
  Activity, CornerDownLeft, Command, FileText, LayoutDashboard, Plus 
} from "lucide-react";
import { Member } from "../types/member";
import { Project, ApiKey } from "../types/team";
import { Task, AuditLogEntry } from "../types/activity";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  projects: Project[];
  tasks: Task[];
  apiKeys: ApiKey[];
  auditLogs: AuditLogEntry[];
  setActiveTab: (tab: string) => void;
  onInviteClick?: () => void;
  onCreateProjectClick?: () => void;
}

interface SearchItem {
  id: string;
  category: "commands" | "members" | "projects" | "tasks" | "audit";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

export function CommandPalette({
  isOpen,
  onClose,
  members,
  projects,
  tasks,
  apiKeys,
  auditLogs,
  setActiveTab,
  onInviteClick,
  onCreateProjectClick
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // General commands / Quick Actions list
  const commands: SearchItem[] = useMemo(() => [
    {
      id: "nav-dashboard",
      category: "commands",
      title: "Pulpit główny (Dashboard)",
      subtitle: "Przejdź do głównego widoku statystyk i wykresów",
      icon: <LayoutDashboard className="h-4 w-4 text-indigo-400" />,
      action: () => {
        setActiveTab("dashboard");
        onClose();
      },
      badge: "Idź do"
    },
    {
      id: "nav-members",
      category: "commands",
      title: "Zarządzanie członkami i dostępem",
      subtitle: "Lista członków, zmiana ról, uprawnienia projektowe",
      icon: <Users className="h-4 w-4 text-emerald-400" />,
      action: () => {
        setActiveTab("members");
        onClose();
      },
      badge: "Idź do"
    },
    {
      id: "nav-projects",
      category: "commands",
      title: "Katalog repozytoriów i projektów",
      subtitle: "Repozytoria kodu, postęp, finanse projektów",
      icon: <Folder className="h-4 w-4 text-amber-400" />,
      action: () => {
        setActiveTab("projects");
        onClose();
      },
      badge: "Idź do"
    },
    {
      id: "nav-tasks",
      category: "commands",
      title: "Przydziały kodu i zadania",
      subtitle: "Przypisane moduły kodu, zadania deweloperskie",
      icon: <CheckSquare className="h-4 w-4 text-cyan-400" />,
      action: () => {
        setActiveTab("code_assignments");
        onClose();
      },
      badge: "Idź do"
    },
    {
      id: "nav-activity",
      category: "commands",
      title: "Aktywność zespołu i oś czasu",
      subtitle: "Historia operacji, commits, pull requests",
      icon: <Activity className="h-4 w-4 text-rose-400" />,
      action: () => {
        setActiveTab("TeamActivity");
        onClose();
      },
      badge: "Idź do"
    },
    {
      id: "nav-audit",
      category: "commands",
      title: "Logi audytowe organizacji (Audit Trail)",
      subtitle: "Niezaprzeczalny rejestr bezpieczeństwa",
      icon: <FileText className="h-4 w-4 text-slate-400" />,
      action: () => {
        setActiveTab("audit_logs");
        onClose();
      },
      badge: "Idź do"
    },
    {
      id: "nav-apikeys",
      category: "commands",
      title: "Klucze API i tokeny workspace",
      subtitle: "Zarządzaj kredencjałami integracji deweloperskich",
      icon: <Key className="h-4 w-4 text-purple-400" />,
      action: () => {
        setActiveTab("api_keys");
        onClose();
      },
      badge: "Idź do"
    },
    {
      id: "nav-settings",
      category: "commands",
      title: "Ustawienia bezpieczeństwa i workspace",
      subtitle: "Zmiana nazwy organizacji, bilans finansowy, limity",
      icon: <Settings className="h-4 w-4 text-sky-400" />,
      action: () => {
        setActiveTab("settings");
        onClose();
      },
      badge: "Idź do"
    },
    {
      id: "action-invite",
      category: "commands",
      title: "Zaproś nowego członka zespołu...",
      subtitle: "Szybkie zaproszenie do organizacji z przydziałem roli",
      icon: <Plus className="h-4 w-4 text-emerald-500" />,
      action: () => {
        setActiveTab("members");
        onInviteClick?.();
        onClose();
      },
      badge: "Akcja"
    },
    {
      id: "action-project",
      category: "commands",
      title: "Stwórz nowe repozytorium/projekt...",
      subtitle: "Inicjalizacja nowego projektu z tagami telemetrycznymi",
      icon: <Plus className="h-4 w-4 text-indigo-500" />,
      action: () => {
        setActiveTab("projects");
        onCreateProjectClick?.();
        onClose();
      },
      badge: "Akcja"
    }
  ], [setActiveTab, onInviteClick, onCreateProjectClick, onClose]);

  // Compute all matching items based on query
  const filteredItems = useMemo(() => {
    const cleanQuery = query.toLowerCase().trim();

    // If query is empty, show commands + first few items of other categories
    if (!cleanQuery) {
      return [
        ...commands,
        ...members.slice(0, 3).map(m => ({
          id: `member-${m.id}`,
          category: "members" as const,
          title: m.name,
          subtitle: `${m.email} • Dział: ${m.department}`,
          icon: <img src={m.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />,
          action: () => {
            setActiveTab("members");
            onClose();
          },
          badge: m.role.toUpperCase()
        })),
        ...projects.slice(0, 3).map(p => ({
          id: `proj-${p.id}`,
          category: "projects" as const,
          title: p.name,
          subtitle: p.description,
          icon: <Folder className="h-4 w-4 text-amber-500" />,
          action: () => {
            setActiveTab("projects");
            onClose();
          },
          badge: "Projekt"
        }))
      ];
    }

    const matched: SearchItem[] = [];

    // 1. Matches in commands
    commands.forEach(cmd => {
      if (cmd.title.toLowerCase().includes(cleanQuery) || cmd.subtitle?.toLowerCase().includes(cleanQuery)) {
        matched.push(cmd);
      }
    });

    // 2. Matches in members
    members.forEach(m => {
      if (
        m.name.toLowerCase().includes(cleanQuery) || 
        m.email.toLowerCase().includes(cleanQuery) || 
        m.department.toLowerCase().includes(cleanQuery) ||
        m.role.toLowerCase().includes(cleanQuery)
      ) {
        matched.push({
          id: `member-${m.id}`,
          category: "members",
          title: m.name,
          subtitle: `${m.email} • Dział: ${m.department}`,
          icon: <img src={m.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />,
          action: () => {
            setActiveTab("members");
            onClose();
          },
          badge: m.role.toUpperCase()
        });
      }
    });

    // 3. Matches in projects
    projects.forEach(p => {
      if (
        p.name.toLowerCase().includes(cleanQuery) || 
        p.description.toLowerCase().includes(cleanQuery) ||
        p.tags.some(t => t.toLowerCase().includes(cleanQuery))
      ) {
        matched.push({
          id: `proj-${p.id}`,
          category: "projects",
          title: p.name,
          subtitle: p.description,
          icon: <Folder className="h-4 w-4 text-amber-500" />,
          action: () => {
            setActiveTab("projects");
            onClose();
          },
          badge: "Projekt"
        });
      }
    });

    // 4. Matches in tasks
    tasks.forEach(t => {
      if (
        t.title.toLowerCase().includes(cleanQuery) || 
        t.status.toLowerCase().includes(cleanQuery) ||
        t.assignedTo.toLowerCase().includes(cleanQuery)
      ) {
        matched.push({
          id: `task-${t.id}`,
          category: "tasks",
          title: t.title,
          subtitle: `Przypisane do: ${t.assignedTo} • Status: ${t.status.toUpperCase()}`,
          icon: <CheckSquare className="h-4 w-4 text-cyan-500" />,
          action: () => {
            setActiveTab("code_assignments");
            onClose();
          },
          badge: "Zadanie"
        });
      }
    });

    // 5. Matches in Audit Logs
    auditLogs.slice(0, 15).forEach(l => {
      if (
        l.action.toLowerCase().includes(cleanQuery) || 
        l.target.toLowerCase().includes(cleanQuery) || 
        l.actor.name.toLowerCase().includes(cleanQuery) ||
        l.details?.toLowerCase().includes(cleanQuery)
      ) {
        matched.push({
          id: `audit-${l.id}`,
          category: "audit",
          title: `${l.actor.name}: ${l.action}`,
          subtitle: `${l.target} • ${new Date(l.createdAt).toLocaleString("pl-PL")}`,
          icon: <Activity className="h-4 w-4 text-slate-500" />,
          action: () => {
            setActiveTab("audit_logs");
            onClose();
          },
          badge: "Audit"
        });
      }
    });

    return matched;
  }, [query, commands, members, projects, tasks, auditLogs, setActiveTab, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 pt-[10vh] md:p-20">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Palette Container */}
      <div className="relative mx-auto max-w-2xl transform rounded-2xl border border-slate-800 bg-slate-900 text-white shadow-2xl transition-all overflow-hidden flex flex-col h-[550px]">
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-800 flex items-center shrink-0">
          <Search className="pointer-events-none absolute top-4 left-4 h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            className="h-14 w-full bg-transparent pl-12 pr-4 text-slate-100 placeholder-slate-400 text-sm focus:outline-hidden"
            placeholder="Wyszukaj członków, projekty, kody, audit trail lub wpisz polecenie..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="absolute right-4 flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[10px] font-mono text-slate-400 select-none">
            <span className="text-[9px]">ESC</span>
          </div>
        </div>

        {/* Results Scroll View */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center px-4">
              <Command className="mx-auto h-8 w-8 text-slate-600 mb-3 animate-pulse" />
              <p className="text-xs font-bold text-slate-300">Brak wyników wyszukiwania</p>
              <p className="text-[10px] text-slate-500 mt-1">Nie znaleźliśmy nic pasującego do frazy "{query}"</p>
            </div>
          ) : (
            <>
              {/* Group items logically if needed, but a single stream is incredibly readable */}
              {filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    data-index={idx}
                    onClick={item.action}
                    className={`w-full text-left rounded-xl p-3 flex items-center justify-between transition-all duration-100 cursor-pointer ${
                      isSelected 
                        ? "bg-slate-800 text-white ring-1 ring-indigo-500/30" 
                        : "text-slate-300 hover:bg-slate-850"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-slate-900 border border-indigo-500/20" : "bg-slate-850 border border-slate-800"
                      }`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-slate-100"}`}>
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-md">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                          isSelected 
                            ? "bg-indigo-950/50 border-indigo-500/30 text-indigo-300" 
                            : "bg-slate-800 border-slate-700 text-slate-400"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {isSelected && (
                        <CornerDownLeft className="h-3 w-3 text-slate-400 animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="shrink-0 bg-slate-950 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="bg-slate-900 px-1 py-0.2 rounded border border-slate-800">↑↓</span>
              <span>Nawigacja</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-slate-900 px-1 py-0.2 rounded border border-slate-800">Enter</span>
              <span>Wybierz</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>+ K otwiera panel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
