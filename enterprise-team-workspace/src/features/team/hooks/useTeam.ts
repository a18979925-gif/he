import { useState, useEffect, useCallback } from "react";
import { Organization, Project, ApiKey, Integration, BillingConfig } from "../types/team";
import { Member } from "../types/member";
import { Task, PullRequest } from "../types/activity";
import { TeamRole, TeamPermission } from "../types/role";
import { teamApi } from "../services/teamApi";

export function useTeam() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [billing, setBilling] = useState<BillingConfig | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<TeamRole, TeamPermission[]>>({} as any);
  const [activeMemberId, setActiveMemberId] = useState<string>("");

  const refreshAll = useCallback(() => {
    teamApi.initialize();
    setOrg(teamApi.getOrg());
    const loadedMembers = teamApi.getMembers();
    setMembers(loadedMembers);
    setProjects(teamApi.getProjects());
    setApiKeys(teamApi.getApiKeys());
    setIntegrations(teamApi.getIntegrations());
    setBilling(teamApi.getBilling());
    setTasks(teamApi.getTasks());
    setPrs(teamApi.getPRs());
    setRolePermissions(teamApi.getRolePermissions());

    // Select first member as default active if not set
    if (loadedMembers.length > 0 && !activeMemberId) {
      // Find Andrzej by default
      const andrzej = loadedMembers.find(m => m.name.includes("Andrzej")) || loadedMembers[0];
      setActiveMemberId(andrzej.id);
    }
  }, [activeMemberId]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const activeMember = members.find((m) => m.id === activeMemberId) || null;

  // Actions
  const changeActiveMember = useCallback((id: string) => {
    setActiveMemberId(id);
  }, []);

  const inviteMember = useCallback(
    (name: string, email: string, role: TeamRole, department: string) => {
      const newMember = teamApi.addMember({
        name,
        email,
        avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 100) + 1500000000000}?auto=format&fit=crop&w=150&h=150&q=80`,
        role,
        status: "active",
        department: department || "Engineering",
        lastActive: "Active now"
      });
      refreshAll();
      return newMember;
    },
    [refreshAll]
  );

  const updateMember = useCallback(
    (member: Member) => {
      teamApi.updateMember(member);
      refreshAll();
    },
    [refreshAll]
  );

  const deleteMember = useCallback(
    (id: string) => {
      teamApi.deleteMember(id);
      refreshAll();
    },
    [refreshAll]
  );

  const createProject = useCallback(
    (name: string, description: string, tags: string[]) => {
      const newProj = teamApi.addProject({
        name,
        description,
        status: "active",
        tags
      });
      refreshAll();
      return newProj;
    },
    [refreshAll]
  );

  const updateProject = useCallback(
    (project: Project) => {
      teamApi.updateProject(project);
      refreshAll();
    },
    [refreshAll]
  );

  const deleteProject = useCallback(
    (id: string) => {
      teamApi.deleteProject(id);
      refreshAll();
    },
    [refreshAll]
  );

  const createApiKey = useCallback(
    (name: string) => {
      const key = teamApi.createApiKey(name);
      refreshAll();
      return key;
    },
    [refreshAll]
  );

  const revokeApiKey = useCallback(
    (id: string) => {
      teamApi.revokeApiKey(id);
      refreshAll();
    },
    [refreshAll]
  );

  const toggleIntegration = useCallback(
    (id: string) => {
      const res = teamApi.toggleIntegration(id);
      refreshAll();
      return res;
    },
    [refreshAll]
  );

  const updateBilling = useCallback(
    (config: BillingConfig) => {
      teamApi.updateBilling(config);
      refreshAll();
    },
    [refreshAll]
  );

  const updateTaskStatus = useCallback(
    (id: string, status: Task["status"]) => {
      teamApi.updateTaskStatus(id, status);
      refreshAll();
    },
    [refreshAll]
  );

  const addTask = useCallback(
    (task: Omit<Task, "id" | "projectName">) => {
      const t = teamApi.addTask(task);
      refreshAll();
      return t;
    },
    [refreshAll]
  );

  const createPR = useCallback(
    (pr: Omit<PullRequest, "id" | "status" | "createdAt" | "projectName">) => {
      const p = teamApi.createPR(pr);
      refreshAll();
      return p;
    },
    [refreshAll]
  );

  const updateRolePermissions = useCallback(
    (role: TeamRole, permissions: TeamPermission[]) => {
      teamApi.updateRolePermissions(role, permissions);
      refreshAll();
    },
    [refreshAll]
  );

  const updateOrg = useCallback(
    (newOrg: Organization) => {
      teamApi.updateOrg(newOrg);
      refreshAll();
    },
    [refreshAll]
  );

  return {
    org,
    members,
    projects,
    apiKeys,
    integrations,
    billing,
    tasks,
    prs,
    rolePermissions,
    activeMember,
    changeActiveMember,
    inviteMember,
    updateMember,
    deleteMember,
    createProject,
    updateProject,
    deleteProject,
    createApiKey,
    revokeApiKey,
    toggleIntegration,
    updateBilling,
    updateTaskStatus,
    addTask,
    createPR,
    updateRolePermissions,
    updateOrg,
    refreshAll
  };
}
