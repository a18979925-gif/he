/**
 * WorkspaceDashboard.tsx — Main container (~120 lines)
 * Clean architecture with extracted components & constants
 */
import React, { useEffect, useMemo, useState } from "react";
import { useProjectStore } from "../../stores/projectStore";
import { useWorkspaceStore, type WorkspaceRole } from "../../stores/workspaceStore";
import CreateProjectModal from "./CreateProjectModal";
import ImportProjectModal from "./ImportProjectModal";
import ProjectWorkspace from "./ProjectWorkspace";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import WorkspaceSectionRenderer from "./WorkspaceSectionRenderer";
import { getWorkspaceNavigation, type WorkspaceSection } from "./constants/workspaceNavigation";
import { useAuthStore } from "../../stores/authStore";

interface WorkspaceDashboardProps {
  workspaceId?: string;
  onClose: () => void;
}

export default function WorkspaceDashboard({ workspaceId, onClose }: WorkspaceDashboardProps) {
  const { user } = useAuthStore();
  const {
    workspaces,
    activeWorkspaceId,
    currentRole,
    setCurrentRole,
    setActiveWorkspaceId,
    inviteMemberByNick,
    changeMemberRole,
  } = useWorkspaceStore();
  const { projects, loadProjectsFromApi, activeProjectId, setActiveProjectId, createProject, importProjects, deleteProject } =
    useProjectStore();

  const [activeSection, setActiveSection] = useState<WorkspaceSection>("overview");
  const [loading, setLoading] = useState(false);
  const [projectLoadError, setProjectLoadError] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showImportProject, setShowImportProject] = useState(false);

  const currentWorkspaceId = workspaceId || activeWorkspaceId;
  const workspace = workspaces.find((item) => item.id === currentWorkspaceId) || workspaces[0];
  const currentUserId = user?.id || "user";

  const isOwner = currentRole === "owner";
  const isAdmin = currentRole === "admin";
  const canCreateProject = isOwner || isAdmin;
  const canDeleteProject = isOwner;
  const canInvite = isOwner || isAdmin;
  const canChangeRoles = isOwner;

  // Load projects on mount
  useEffect(() => {
    if (workspaceId) setActiveWorkspaceId(workspaceId);
  }, [workspaceId, setActiveWorkspaceId]);

  useEffect(() => {
    let cancelled = false;
    setProjectLoadError("");
    loadProjectsFromApi().catch((error: Error) => {
      if (!cancelled) setProjectLoadError(error.message);
    });
    return () => {
      cancelled = true;
    };
  }, [loadProjectsFromApi]);

  // Filter projects for current user
  const workspaceProjects = useMemo(() => {
    return projects.filter((project) => project.members.some((member) => member.uid === currentUserId));
  }, [currentUserId, projects]);

  const activeProject = workspaceProjects.find((project) => project.id === activeProjectId);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 450);
  };

  const handleRoleChange = (role: WorkspaceRole) => {
    setCurrentRole(role);
    setActiveSection("overview");
  };

  const handleInvite = (nickname: string, role: WorkspaceRole) => {
    inviteMemberByNick(workspace.id, nickname, role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-screen h-screen max-w-none max-h-none overflow-hidden bg-[#0b1020] text-slate-200">
        <div className="grid h-full grid-cols-[220px_minmax(0,1fr)]">
          {/* Sidebar */}
          <DashboardSidebar
            workspace={workspace}
            activeSection={activeSection}
            currentRole={currentRole}
            onSectionChange={setActiveSection}
            onRoleChange={handleRoleChange}
          />

          {/* Main Content */}
          <main className="flex min-w-0 flex-col">
            {/* Header */}
            <DashboardHeader
              workspace={workspace}
              activeProject={activeProject}
              currentRole={currentRole}
              loading={loading}
              onRefresh={handleRefresh}
              onClose={onClose}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
              {activeProject ? (
                <ProjectWorkspace project={activeProject} currentUserId={currentUserId} onBack={() => setActiveProjectId(null)} />
              ) : (
                <div className="space-y-6">
                  {projectLoadError && (
                    <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-4 text-sm font-bold text-amber-200">
                      {projectLoadError}
                    </div>
                  )}

                  <WorkspaceSectionRenderer
                    section={activeSection}
                    workspace={workspace}
                    workspaceProjects={workspaceProjects}
                    role={currentRole}
                    canCreateProject={canCreateProject}
                    canDeleteProject={canDeleteProject}
                    canInvite={canInvite}
                    canChangeRoles={canChangeRoles}
                    onOpenProject={setActiveProjectId}
                    onCreateProject={() => setShowCreateProject(true)}
                    onImportProject={() => setShowImportProject(true)}
                    onDeleteProject={deleteProject}
                    onInvite={handleInvite}
                    onRoleChange={changeMemberRole.bind(null, workspace.id)}
                  />
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Modals */}
        {showCreateProject && (
          <CreateProjectModal
            members={workspace.members}
            onClose={() => setShowCreateProject(false)}
            onCreate={(input) => createProject(input)}
          />
        )}
        {showImportProject && (
          <ImportProjectModal
            projects={projects}
            onClose={() => setShowImportProject(false)}
            onImport={(projectIds) => {
              importProjects(projectIds, {
                uid: currentUserId,
                role: currentRole,
              });
              setShowImportProject(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
