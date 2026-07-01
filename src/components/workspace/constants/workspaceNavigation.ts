/**
 * constants/workspaceNavigation.ts
 */
import { Activity, BookOpen, Briefcase, FolderKanban, FileCode2, Home, Settings, Users } from "lucide-react";
import type { WorkspaceRole } from "../../stores/workspaceStore";

export type WorkspaceSection = "overview" | "projects" | "members" | "tasks" | "knowledge" | "files" | "activity" | "settings";

export interface NavItem {
  id: WorkspaceSection;
  label: string;
  icon: React.ReactNode;
}

const OWNER_NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: <Home size={17} /> },
  { id: "projects", label: "Projects", icon: <FolderKanban size={17} /> },
  { id: "members", label: "Members", icon: <Users size={17} /> },
  { id: "activity", label: "Activity", icon: <Activity size={17} /> },
  { id: "knowledge", label: "Knowledge", icon: <BookOpen size={17} /> },
  { id: "files", label: "Files", icon: <FileCode2 size={17} /> },
  { id: "settings", label: "Settings", icon: <Settings size={17} /> },
];

const DEVELOPER_NAV: NavItem[] = [
  { id: "overview", label: "Overview", icon: <Home size={17} /> },
  { id: "projects", label: "Projects", icon: <FolderKanban size={17} /> },
  { id: "tasks", label: "Tasks", icon: <Briefcase size={17} /> },
  { id: "knowledge", label: "Knowledge", icon: <BookOpen size={17} /> },
  { id: "files", label: "Files", icon: <FileCode2 size={17} /> },
  { id: "activity", label: "Activity", icon: <Activity size={17} /> },
];

export function getWorkspaceNavigation(role: WorkspaceRole): NavItem[] {
  if (role === "owner" || role === "admin") {
    return OWNER_NAV;
  }
  return DEVELOPER_NAV;
}
