/**
 * src/features/team/constants/navigation.ts
 */
import { Home, Users, Lock, BarChart3, GitBranch, Zap, Eye, Settings, LogOut, Key, AlertCircle, CreditCard } from "lucide-react";
import type { TeamRole } from "../types/team";

export const ROLE_NAVIGATION: Record<TeamRole, Array<{ id: string; label: string; icon: React.ReactNode }>> = {
  owner: [
    { id: "overview", label: "Overview", icon: <Home size={17} /> },
    { id: "revenue", label: "Revenue", icon: <CreditCard size={17} /> },
    { id: "projects", label: "Projects", icon: <GitBranch size={17} /> },
    { id: "members", label: "Members", icon: <Users size={17} /> },
    { id: "activity", label: "Activity", icon: <Zap size={17} /> },
    { id: "audit", label: "Audit Logs", icon: <BarChart3 size={17} /> },
    { id: "apikeys", label: "API Keys", icon: <Key size={17} /> },
    { id: "security", label: "Security", icon: <Lock size={17} /> },
    { id: "settings", label: "Settings", icon: <Settings size={17} /> },
  ],
  admin: [
    { id: "overview", label: "Overview", icon: <Home size={17} /> },
    { id: "projects", label: "Projects", icon: <GitBranch size={17} /> },
    { id: "members", label: "Members", icon: <Users size={17} /> },
    { id: "activity", label: "Activity", icon: <Zap size={17} /> },
    { id: "deployments", label: "Deployments", icon: <AlertCircle size={17} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={17} /> },
    { id: "audit", label: "Audit Logs", icon: <BarChart3 size={17} /> },
  ],
  developer: [
    { id: "overview", label: "My Projects", icon: <Home size={17} /> },
    { id: "tasks", label: "Assigned Tasks", icon: <Zap size={17} /> },
    { id: "files", label: "Files", icon: <GitBranch size={17} /> },
    { id: "pulls", label: "Pull Requests", icon: <Eye size={17} /> },
    { id: "logs", label: "Runtime Logs", icon: <BarChart3 size={17} /> },
  ],
  security: [
    { id: "overview", label: "Overview", icon: <Home size={17} /> },
    { id: "vulnerabilities", label: "Vulnerabilities", icon: <AlertCircle size={17} /> },
    { id: "audit", label: "Audit Logs", icon: <BarChart3 size={17} /> },
    { id: "security", label: "Security", icon: <Lock size={17} /> },
  ],
  manager: [
    { id: "overview", label: "Overview", icon: <Home size={17} /> },
    { id: "members", label: "Members", icon: <Users size={17} /> },
    { id: "projects", label: "Projects", icon: <GitBranch size={17} /> },
    { id: "activity", label: "Activity", icon: <Zap size={17} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={17} /> },
  ],
  viewer: [
    { id: "overview", label: "Overview", icon: <Eye size={17} /> },
    { id: "reports", label: "Reports", icon: <BarChart3 size={17} /> },
    { id: "documentation", label: "Documentation", icon: <Home size={17} /> },
    { id: "activity", label: "Activity", icon: <Zap size={17} /> },
  ],
};

export function getNavigationForRole(role: TeamRole) {
  return ROLE_NAVIGATION[role] || ROLE_NAVIGATION.viewer;
}
