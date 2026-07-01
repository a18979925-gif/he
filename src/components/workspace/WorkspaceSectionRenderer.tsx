/**
 * components/workspace/WorkspaceSectionRenderer.tsx
 * Routes based on activeSection
 */
import React from "react";
import { FileCode2 } from "lucide-react";
import type { Project } from "../../stores/projectStore";
import type { WorkspaceRole } from "../../stores/workspaceStore";
import type { WorkspaceSection } from "./constants/workspaceNavigation";
import DashboardOverview from "./DashboardOverview";
import WorkspaceProjects from "./WorkspaceProjects";
import WorkspaceMembers from "./WorkspaceMembers";
import WorkspaceActivity from "./WorkspaceActivity";

interface WorkspaceSectionRendererProps {
  section: WorkspaceSection;
  workspace: { id: string; name: string; members: any[] };
  workspaceProjects: Project[];
  role: WorkspaceRole;
  canCreateProject: boolean;
  canDeleteProject: boolean;
  canInvite: boolean;
  canChangeRoles: boolean;
  onOpenProject: (id: string) => void;
  onCreateProject: () => void;
  onImportProject: () => void;
  onDeleteProject: (id: string) => void;
  onInvite: (nickname: string, role: WorkspaceRole) => void;
  onRoleChange: (memberId: string, role: WorkspaceRole) => void;
}

export default function WorkspaceSectionRenderer({
  section,
  workspace,
  workspaceProjects,
  role,
  canCreateProject,
  canDeleteProject,
  canInvite,
  canChangeRoles,
  onOpenProject,
  onCreateProject,
  onImportProject,
  onDeleteProject,
  onInvite,
  onRoleChange,
}: WorkspaceSectionRendererProps) {
  if (section === "overview") {
    return (
      <DashboardOverview
        workspaceProjects={workspaceProjects}
        workspace={workspace}
        role={role}
        canCreateProject={canCreateProject}
        canDeleteProject={canDeleteProject}
        onOpenProject={onOpenProject}
        onCreateProject={onCreateProject}
        onImportProject={onImportProject}
        onDeleteProject={onDeleteProject}
      />
    );
  }

  if (section === "projects") {
    return (
      <WorkspaceProjects
        projects={workspaceProjects}
        role={role}
        canCreateProject={canCreateProject}
        canDeleteProject={canDeleteProject}
        onOpenProject={onOpenProject}
        onCreateProject={onCreateProject}
        onImportProject={onImportProject}
        onDeleteProject={onDeleteProject}
      />
    );
  }

  if (section === "members") {
    return (
      <WorkspaceMembers
        workspace={workspace}
        canInvite={canInvite}
        canChangeRoles={canChangeRoles}
        onInvite={onInvite}
        onRoleChange={onRoleChange}
      />
    );
  }

  if (section === "activity") {
    return <WorkspaceActivity projects={workspaceProjects} />;
  }

  if (section === "tasks") {
    return (
      <section className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Assigned To Me</h3>
        <div className="rounded-lg border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-400">
          Tasks feature coming soon...
        </div>
      </section>
    );
  }

  if (section === "knowledge") {
    return (
      <section className="rounded-lg border border-white/8 bg-white/[0.03] p-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Knowledge Base</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <div className="rounded-md bg-black/20 border border-white/5 p-3">Application boundaries and domain modules</div>
          <div className="rounded-md bg-black/20 border border-white/5 p-3">Runtime ownership notes</div>
          <div className="rounded-md bg-black/20 border border-white/5 p-3">Security review decisions</div>
        </div>
      </section>
    );
  }

  if (section === "files") {
    return (
      <section className="rounded-lg border border-white/8 bg-white/[0.03] p-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Workspace Files</h3>
        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
          {workspaceProjects.flatMap((project) =>
            project.files.map((file) => (
              <button
                key={`${project.id}-${file.path}`}
                onClick={() => onOpenProject(project.id)}
                className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-black/20 px-4 py-3 text-left hover:bg-white/[0.05]"
              >
                <span>
                  <span className="block text-sm font-black text-white">{project.name}</span>
                  <span className="block font-mono text-xs text-slate-500">{file.path}</span>
                </span>
                <FileCode2 size={17} className="text-indigo-300" />
              </button>
            ))
          )}
        </div>
      </section>
    );
  }

  if (section === "settings") {
    return (
      <section className="rounded-lg border border-white/8 bg-white/[0.03] p-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Workspace Settings</h3>
        <p className="mt-3 text-sm text-slate-400">
          {role === "owner" ? "Owner can manage workspace settings and billing from here." : "This area is restricted to Owner role."}
        </p>
      </section>
    );
  }

  return null;
}
