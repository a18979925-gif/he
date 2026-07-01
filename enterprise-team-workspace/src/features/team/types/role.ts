export type TeamRole =
  | "owner"
  | "admin"
  | "developer"
  | "security"
  | "manager"
  | "viewer"
  | "worker";

export type TeamPermission =
  | "project.create"
  | "project.delete"
  | "member.invite"
  | "member.remove"
  | "billing.manage"
  | "settings.manage";

export interface Permission {
  id: TeamPermission;
  name: string;
  description: string;
  category: "projects" | "members" | "billing" | "settings";
}

export interface RoleConfig {
  role: TeamRole;
  name: string;
  permissions: TeamPermission[];
  description: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export type ProjectRole = "owner" | "maintainer" | "developer" | "viewer";

export interface ProjectRoleConfig {
  role: ProjectRole;
  name: string;
  description: string;
  color: string;
}
