/**
 * src/features/team/types/role.ts
 */
import type { TeamRole, TeamPermission } from "./team";

export interface RolePermissionMap {
  [key in TeamRole]: TeamPermission[];
}

export interface RoleNavigationMap {
  [key in TeamRole]: NavigationItem[];
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}
