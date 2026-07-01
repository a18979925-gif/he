import { Permission, RoleConfig, ProjectRoleConfig, TeamPermission, TeamRole, ProjectRole } from "../types/role";

export const WORKSPACE_PERMISSIONS: Permission[] = [
  {
    id: "project.create",
    name: "Create Projects",
    description: "Allows creating new workspace projects and initializing their environments.",
    category: "projects"
  },
  {
    id: "project.delete",
    name: "Delete Projects",
    description: "Allows hard deletion or archiving of existing projects.",
    category: "projects"
  },
  {
    id: "member.invite",
    name: "Invite Members",
    description: "Allows inviting new members and assigning workspace roles.",
    category: "members"
  },
  {
    id: "member.remove",
    name: "Remove Members",
    description: "Allows removing team members or revoking workspace access.",
    category: "members"
  },
  {
    id: "billing.manage",
    name: "Manage Billing",
    description: "Allows managing payment options, invoicing, and plan upgrades.",
    category: "billing"
  },
  {
    id: "settings.manage",
    name: "Manage Settings",
    description: "Allows changing workspace general settings, integrations, and API keys.",
    category: "settings"
  }
];

export const DEFAULT_ROLE_CONFIGS: Record<TeamRole, RoleConfig> = {
  owner: {
    role: "owner",
    name: "Owner",
    description: "Full control over the organization, billing, and system parameters.",
    permissions: [
      "project.create",
      "project.delete",
      "member.invite",
      "member.remove",
      "billing.manage",
      "settings.manage"
    ],
    color: "rose-600",
    badgeBg: "bg-rose-50 border-rose-200 text-rose-700",
    badgeText: "text-rose-700"
  },
  admin: {
    role: "admin",
    name: "Admin",
    description: "Full operational access over members, projects, and system audits (excludes billing).",
    permissions: [
      "project.create",
      "project.delete",
      "member.invite",
      "member.remove",
      "settings.manage"
    ],
    color: "amber-600",
    badgeBg: "bg-amber-50 border-amber-200 text-amber-700",
    badgeText: "text-amber-700"
  },
  developer: {
    role: "developer",
    name: "Programista",
    description: "Dostęp techniczny do tworzenia kodu, zatwierdzania i edycji zleconych plików w SaaS.",
    permissions: ["project.create"],
    color: "blue-600",
    badgeBg: "bg-blue-50 border-blue-200 text-blue-700",
    badgeText: "text-blue-700"
  },
  security: {
    role: "security",
    name: "Security Officer",
    description: "Focuses on security parameters, API keys, and comprehensive workspace audit logs.",
    permissions: ["settings.manage"],
    color: "purple-600",
    badgeBg: "bg-purple-50 border-purple-200 text-purple-700",
    badgeText: "text-purple-700"
  },
  manager: {
    role: "manager",
    name: "Manager",
    description: "Administrative oversight over team members, reports, and inviting developers.",
    permissions: ["project.create", "member.invite"],
    color: "emerald-600",
    badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
    badgeText: "text-emerald-700"
  },
  viewer: {
    role: "viewer",
    name: "Viewer",
    description: "Read-only access to browse projects, files, and reports without write capability.",
    permissions: [],
    color: "slate-500",
    badgeBg: "bg-slate-50 border-slate-200 text-slate-700",
    badgeText: "text-slate-700"
  },
  worker: {
    role: "worker",
    name: "Pracownik",
    description: "Dedykowany portal pracowniczy z zadaniami, projektami, czatem, edytorem i powiadomieniami.",
    permissions: [],
    color: "emerald-500",
    badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
    badgeText: "text-emerald-700"
  }
};

export const PROJECT_ROLE_CONFIGS: Record<ProjectRole, ProjectRoleConfig> = {
  owner: {
    role: "owner",
    name: "Project Owner",
    description: "Ultimate control over this specific project's configuration.",
    color: "text-rose-600 bg-rose-50 border-rose-200"
  },
  maintainer: {
    role: "maintainer",
    name: "Maintainer",
    description: "Can push commits, accept pull requests, and manage project settings.",
    color: "text-amber-600 bg-amber-50 border-amber-200"
  },
  developer: {
    role: "developer",
    name: "Developer",
    description: "Can create branches, commit code, and trigger dev builds.",
    color: "text-blue-600 bg-blue-50 border-blue-200"
  },
  viewer: {
    role: "viewer",
    name: "Viewer",
    description: "Read-only access to this specific project's dashboard and code repository.",
    color: "text-slate-600 bg-slate-50 border-slate-200"
  }
};
