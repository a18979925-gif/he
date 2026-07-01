import React from "react";
import { Box, ChevronRight, Download, Plus, Trash2 } from "lucide-react";
import type { CodeScopeProject } from "../../stores/projectStore";
import type { WorkspaceRole } from "../../stores/workspaceStore";

interface WorkspaceProjectsProps {
  projects: CodeScopeProject[];
  canCreateProject: boolean;
  canDeleteProject: boolean;
  role: WorkspaceRole;
  onOpenProject: (projectId: string) => void;
  onCreateProject: () => void;
  onImportProject: () => void;
  onDeleteProject: (projectId: string) => void;
}

export default function WorkspaceProjects({
  projects,
  canCreateProject,
  canDeleteProject,
  role,
  onOpenProject,
  onCreateProject,
  onImportProject,
  onDeleteProject,
}: WorkspaceProjectsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Projects</h3>
        {canCreateProject && (
          <div className="flex items-center gap-2">
            <button
              onClick={onImportProject}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black text-slate-200 hover:bg-white/[0.06] transition-all"
            >
              <Download size={14} /> Import Existing
            </button>
            <button
              onClick={onCreateProject}
              className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-black text-white hover:bg-indigo-400 transition-all"
            >
              <Plus size={14} /> Create New
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {projects.map((project) => {
          return (
            <div
              key={project.id}
              className="rounded-lg border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-indigo-400/30 transition-all p-4"
            >
              <button onClick={() => onOpenProject(project.id)} className="w-full text-left">
                <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-indigo-500/12 border border-indigo-400/20 flex items-center justify-center">
                      <Box size={18} className="text-indigo-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-black text-white truncate">{project.name}</div>
                      <div className="text-xs text-slate-500">AI-understood application</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-500 shrink-0" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Health:</span>
                    <span className="font-black text-emerald-300">{project.analysis.healthScore}%</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Security:</span>
                    <span className={project.securityStatus === "Good" ? "font-black text-emerald-300" : "font-black text-amber-300"}>{project.securityStatus}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Runtime:</span>
                    <span className="font-black text-sky-300">{project.runtimeStatus}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Last Analysis:</span>
                    <span className="font-black text-slate-200">{project.lastAnalysis}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Members:</span>
                    <span className="font-black text-slate-200">{project.members.length}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">Role:</span>
                    <span className="font-black capitalize text-indigo-200">{role}</span>
                  </div>
                </div>
              </button>

              {canDeleteProject && (
                <button
                  onClick={() => onDeleteProject(project.id)}
                  className="mt-4 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-bold text-slate-500 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
