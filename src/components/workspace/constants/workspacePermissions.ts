/**
 * constants/workspacePermissions.ts
 */
import type { WorkspaceRole } from "../../stores/workspaceStore";

export const WORKSPACE_PERMISSIONS: Record<WorkspaceRole, string[]> = {
  owner: [
    "Create Project",
    "Delete Project",
    "Invite Members",
    "Change Roles",
    "Access Billing",
    "Manage Workspace",
    "Deploy",
    "View All Projects",
  ],
  admin: ["Manage Projects", "Assign Tasks", "View Reports", "Run Analysis", "Manage Runtime"],
  developer: ["View Projects", "Edit Files", "Save Files", "Run Analysis", "View Runtime Logs", "View Database Schema"],
  viewer: ["Read Only"],
} as const;
