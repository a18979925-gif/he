/**
 * src/features/team/types/team.ts
 */

export type TeamRole =
  | "owner"
  | "admin"
  | "developer"
  | "security"
  | "manager"
  | "viewer";

export type TeamPermission =
  | "project.create"
  | "project.delete"
  | "project.archive"
  | "member.invite"
  | "member.remove"
  | "member.rolechange"
  | "billing.manage"
  | "billing.view"
  | "settings.manage"
  | "settings.view"
  | "audit.view"
  | "api.manage"
  | "api.view"
  | "security.manage";

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  members: TeamMember[];
  roles: CustomRole[];
  metadata?: {
    avatar?: string;
    color?: string;
  };
}

export interface TeamMember {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: TeamRole;
  joinedAt: Date;
  status: "active" | "pending" | "inactive";
}

export interface CustomRole {
  id: string;
  name: TeamRole;
  displayName: string;
  permissions: TeamPermission[];
  description: string;
}

export interface AuditLog {
  id: string;
  actor: {
    id: string;
    username: string;
    email: string;
  };
  action: string;
  target: {
    type: "member" | "project" | "role" | "apikey" | "setting";
    id: string;
    name: string;
  };
  changes?: Record<string, any>;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface TeamProject {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  roles: ProjectRole[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectRole {
  userId: string;
  role: "owner" | "maintainer" | "developer" | "viewer";
}

export interface ApiKey {
  id: string;
  name: string;
  token: string; // masked in UI
  createdBy: string;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
}

export type DashboardVariant = "owner" | "admin" | "developer" | "viewer";
