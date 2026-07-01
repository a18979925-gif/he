/**
 * components/workspace/DashboardOverview.tsx
 */
import React from "react";
import type { Project } from "../../stores/projectStore";
import type { WorkspaceRole } from "../../stores/workspaceStore";
import WorkspaceActivity from "./WorkspaceActivity";
import WorkspaceProjects from "./WorkspaceProjects";

interface DashboardOverviewProps {
  workspaceProjects: Project[];
  workspace: { id: string; members: any[] };
  role: WorkspaceRole;
  canCreateProject: boolean;
  canDeleteProject: boolean;
  onOpenProject: (id: string) => void;
  onCreateProject: () => void;
  onImportProject: () => void;
  onDeleteProject: (id: string) => void;
}

export default function DashboardOverview({
  workspaceProjects,
  workspace,
  role,
  canCreateProject,
  canDeleteProject,
  onOpenProject,
  onCreateProject,
  onImportProject,
  onDeleteProject,
}: DashboardOverviewProps) {
  const criticalIssues = workspaceProjects.reduce(
    (sum, project) => sum + project.security.issues.filter((issue) => issue.severity === "Critical").length,
    0
  );

  const runtimeIncidents = workspaceProjects.filter((project) => project.runtimeStatus !== "Online").length;

  const pendingReviews = workspaceProjects.reduce((sum, project) => sum + project.pendingReviews, 0);

  const workspaceHealth = Math.round(
    workspaceProjects.reduce((sum, project) => sum + project.analysis.healthScore, 0) / Math.max(workspaceProjects.length, 1)
  );

  const statItems = [
    { label: "Workspace Health", value: `${workspaceHealth}%` },
    { label: "Active Projects", value: workspaceProjects.length },
    { label: "Team Members", value: workspace.members.length },
    { label: "Critical Issues", value: criticalIssues },
    { label: "Runtime Incidents", value: runtimeIncidents },
    { label: "Pending Reviews", value: pendingReviews },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {statItems.map((item) => (
          <div key={item.label} className="rounded-lg border border-white/8 bg-white/[0.03] p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.label}</div>
            <div className="mt-2 text-3xl font-black text-white">{item.value}</div>
          </div>
        ))}
      </section>

      {/* Activity */}
      <WorkspaceActivity projects={workspaceProjects} />

      {/* Projects */}
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

      {workspaceProjects.length === 0 && (
        <div className="rounded-lg border border-white/8 bg-white/[0.03] p-6 text-sm text-slate-400">
          No real projects loaded yet. Create a new project or import an existing analyzed project.
        </div>
      )}
    </div>
  );
}
