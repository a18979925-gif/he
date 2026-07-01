/**
 * src/features/team/hooks/usePermissions.ts
 */
import { useMemo } from "react";
import type { TeamRole, TeamPermission } from "../types/team";
import { ROLE_PERMISSIONS } from "../constants/permissions";

export function usePermissions(userRole: TeamRole) {
  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[userRole] || [];
  }, [userRole]);

  const can = (permission: TeamPermission): boolean => {
    return permissions.includes(permission);
  };

  const canAny = (perms: TeamPermission[]): boolean => {
    return perms.some(p => permissions.includes(p));
  };

  const canAll = (perms: TeamPermission[]): boolean => {
    return perms.every(p => permissions.includes(p));
  };

  return {
    permissions,
    can,
    canAny,
    canAll,
    isOwner: userRole === "owner",
    isAdmin: userRole === "admin",
    isDeveloper: userRole === "developer",
    isViewer: userRole === "viewer",
  };
}
