/**
 * src/features/team/types/member.ts
 */
import type { TeamRole, TeamMember as BaseTeamMember } from "./team";

export interface TeamMember extends BaseTeamMember {
  permissions: string[];
  canManageMembers: boolean;
  canManageSettings: boolean;
  canViewAuditLog: boolean;
}

export interface InviteMemberInput {
  email: string;
  role: TeamRole;
}

export interface MemberRoleChangeInput {
  memberId: string;
  newRole: TeamRole;
}
