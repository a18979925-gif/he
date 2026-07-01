/**
 * components/workspace/DashboardSidebar.tsx
 */
import React from "react";
import { Sparkles } from "lucide-react";
import type { WorkspaceRole } from "../../stores/workspaceStore";
import { WORKSPACE_PERMISSIONS } from "./constants/workspacePermissions";
import { getWorkspaceNavigation, type WorkspaceSection } from "./constants/workspaceNavigation";

interface DashboardSidebarProps {
  workspace: { name: string };
  activeSection: WorkspaceSection;
  currentRole: WorkspaceRole;
  onSectionChange: (section: WorkspaceSection) => void;
  onRoleChange: (role: WorkspaceRole) => void;
}

export default function DashboardSidebar({
  workspace,
  activeSection,
  currentRole,
  onSectionChange,
  onRoleChange,
}: DashboardSidebarProps) {
  const navItems = getWorkspaceNavigation(currentRole);
  const permissions = WORKSPACE_PERMISSIONS[currentRole];

  return (
    <aside className="border-r border-white/8 bg-black/20 p-4 flex flex-col">
      <div className="px-2 py-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-300">
          <Sparkles size={15} /> CodeScope
        </div>
        <h1 className="mt-2 text-lg font-black text-white">{workspace.name}</h1>
      </div>

      <nav className="mt-5 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${
              activeSection === item.id ? "bg-indigo-500/15 text-indigo-200" : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-3">
        <select
          value={currentRole}
          onChange={(event) => {
            onRoleChange(event.target.value as WorkspaceRole);
            onSectionChange("overview");
          }}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none"
        >
          <option value="owner">Owner View</option>
          <option value="admin">Admin View</option>
          <option value="developer">Developer View</option>
          <option value="viewer">Viewer View</option>
        </select>

        <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Permissions</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {permissions.map((permission) => (
              <span key={permission} className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-300">
                {permission}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
