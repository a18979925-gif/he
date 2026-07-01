/**
 * components/workspace/DashboardHeader.tsx
 */
import React from "react";
import { RefreshCw, X } from "lucide-react";
import type { WorkspaceRole } from "../../stores/workspaceStore";
import type { Project } from "../../stores/projectStore";

interface DashboardHeaderProps {
  workspace: { name: string };
  activeProject: Project | undefined;
  currentRole: WorkspaceRole;
  loading: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

export default function DashboardHeader({
  workspace,
  activeProject,
  currentRole,
  loading,
  onRefresh,
  onClose,
}: DashboardHeaderProps) {
  return (
    <header className="shrink-0 border-b border-white/8 px-8 py-5 flex items-center justify-between gap-6">
      <div>
        <div className="text-xs font-black uppercase tracking-wider text-indigo-300">{currentRole} workspace</div>
        <h2 className="mt-1 text-2xl font-black text-white">
          {activeProject ? `${activeProject.name} Project` : workspace.name}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="rounded-lg p-3 text-slate-500 hover:text-white hover:bg-white/8 transition-all"
          title="Refresh"
        >
          <RefreshCw size={21} className={loading ? "animate-spin" : ""} />
        </button>
        <button
          onClick={onClose}
          className="rounded-lg p-3 text-slate-500 hover:text-white hover:bg-white/8 transition-all"
          title="Close"
        >
          <X size={24} />
        </button>
      </div>
    </header>
  );
}
