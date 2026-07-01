import { useCallback } from "react";
import { Member } from "../types/member";
import { TeamPermission, ProjectRole } from "../types/role";
import { useFirebaseTeam } from "../context/FirebaseTeamContext";

export function usePermissions(activeMember: Member | null) {
  const { rolePermissions } = useFirebaseTeam();

  const hasPermission = useCallback(
    (permission: TeamPermission): boolean => {
      if (!activeMember) return false;
      
      // Load current dynamic permissions mapping from Firebase Team Context
      const allowedPermissions = rolePermissions?.[activeMember.role] || [];
      
      return allowedPermissions.includes(permission);
    },
    [activeMember, rolePermissions]
  );

  const hasProjectRole = useCallback(
    (projectId: string, allowedRoles: ProjectRole[]): boolean => {
      if (!activeMember) return false;
      
      // Get member's role for this specific project
      const projRole = activeMember.projectRoles?.[projectId];
      if (!projRole) return false;
      
      return allowedRoles.includes(projRole);
    },
    [activeMember]
  );

  return {
    hasPermission,
    hasProjectRole,
    role: activeMember?.role || "viewer",
    activeMember
  };
}
