import { create } from "zustand";

export type WorkspaceRole = "owner" | "admin" | "developer" | "viewer";

export interface WorkspaceMember {
  id: string;
  nickname: string;
  role: WorkspaceRole;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: WorkspaceMember[];
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  currentRole: WorkspaceRole;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspaceId: (workspaceId: string) => void;
  setCurrentRole: (role: WorkspaceRole) => void;
  addWorkspace: (workspace: Workspace) => void;
  inviteMemberByNick: (workspaceId: string, nickname: string, role: WorkspaceRole) => void;
  changeMemberRole: (workspaceId: string, memberId: string, role: WorkspaceRole) => void;
}

const defaultWorkspace: Workspace = {
  id: "default-workspace",
  name: "CodeScope Workspace",
  ownerId: "andrzej",
  members: [
    { id: "andrzej", nickname: "Andrzej", role: "owner" },
    { id: "john", nickname: "John", role: "admin" },
    { id: "mike", nickname: "Mike", role: "admin" },
    { id: "alex", nickname: "Alex", role: "developer" },
    { id: "tom", nickname: "Tom", role: "developer" },
    { id: "kate", nickname: "Kate", role: "developer" },
    { id: "nina", nickname: "Nina", role: "viewer" },
    { id: "oliver", nickname: "Oliver", role: "viewer" },
  ],
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [defaultWorkspace],
  activeWorkspaceId: defaultWorkspace.id,
  currentRole: "owner",
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspaceId: (activeWorkspaceId) => set({ activeWorkspaceId }),
  setCurrentRole: (currentRole) => set({ currentRole }),
  addWorkspace: (workspace) =>
    set((state) => ({ workspaces: [...state.workspaces, workspace] })),
  inviteMemberByNick: (workspaceId, nickname, role) =>
    set((state) => ({
      workspaces: state.workspaces.map((workspace) =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              members: [
                ...workspace.members,
                {
                  id: nickname.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  nickname,
                  role,
                },
              ],
            }
          : workspace
      ),
    })),
  changeMemberRole: (workspaceId, memberId, role) =>
    set((state) => ({
      workspaces: state.workspaces.map((workspace) =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              members: workspace.members.map((member) =>
                member.id === memberId ? { ...member, role } : member
              ),
            }
          : workspace
      ),
    })),
}));
