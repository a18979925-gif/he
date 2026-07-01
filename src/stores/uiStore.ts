import { create } from "zustand";

interface UiState {
  activeWorkspaceTab: "dashboard" | "activity";
  activeProjectTab:
    | "overview"
    | "architecture"
    | "api"
    | "database"
    | "runtime"
    | "security"
    | "performance"
    | "reports"
    | "files"
    | "editor";
  setActiveWorkspaceTab: (tab: UiState["activeWorkspaceTab"]) => void;
  setActiveProjectTab: (tab: UiState["activeProjectTab"]) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeWorkspaceTab: "dashboard",
  activeProjectTab: "overview",
  setActiveWorkspaceTab: (activeWorkspaceTab) => set({ activeWorkspaceTab }),
  setActiveProjectTab: (activeProjectTab) => set({ activeProjectTab }),
}));
