import { TeamRole, ProjectRole } from "./role";

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: TeamRole;
  status: "active" | "invited" | "suspended";
  joinedAt: string;
  department: string;
  lastActive: string;
  projectRoles: Record<string, ProjectRole>; // projectId -> ProjectRole
}
