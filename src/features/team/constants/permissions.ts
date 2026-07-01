/**
 * src/features/team/constants/permissions.ts
 */
import type { RolePermissionMap } from "../types/role";

export const ROLE_PERMISSIONS: RolePermissionMap = {
  owner: [
    "project.create",
    "project.delete",
    "project.archive",
    "member.invite",
    "member.remove",
    "member.rolechange",
    "billing.manage",
    "billing.view",
    "settings.manage",
    "settings.view",
    "audit.view",
    "api.manage",
    "api.view",
    "security.manage",
  ],
  admin: [
    "project.create",
    "project.delete",
    "member.invite",
    "member.remove",
    "member.rolechange",
    "billing.view",
    "settings.manage",
    "audit.view",
    "api.view",
    "security.manage",
  ],
  developer: [
    "project.create",
    "member.invite",
    "billing.view",
    "audit.view",
    "api.view",
  ],
  security: [
    "project.create",
    "audit.view",
    "security.manage",
    "api.view",
  ],
  manager: [
    "project.create",
    "member.invite",
    "member.rolechange",
    "billing.view",
    "audit.view",
    "settings.view",
  ],
  viewer: [
    "project.create",
    "audit.view",
    "billing.view",
    "settings.view",
  ],
} as const;

export function hasPermission(userRole: string, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole as keyof RolePermissionMap] || [];
  return permissions.includes(permission as any);
}

export function hasAnyPermission(userRole: string, permissions: string[]): boolean {
  return permissions.some(perm => hasPermission(userRole, perm));
}

export function hasAllPermissions(userRole: string, permissions: string[]): boolean {
  return permissions.every(perm => hasPermission(userRole, perm));
}
