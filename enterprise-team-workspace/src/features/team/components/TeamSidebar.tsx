import { Member } from "../types/member";
import { NavigationItem, ROLE_NAVIGATION_MAP } from "../constants/navigation";
import { LucideIcon } from "./LucideIcon";
import { Shield, Sparkles, Terminal } from "lucide-react";
import { DEFAULT_ROLE_CONFIGS } from "../constants/permissions";

interface TeamSidebarProps {
  activeMember: Member | null;
  activeTab: string;
  onTabChange: (id: string) => void;
  rolePermissions: Record<string, string[]>;
}

export function TeamSidebar({
  activeMember,
  activeTab,
  onTabChange,
  rolePermissions
}: TeamSidebarProps) {
  const currentRole = activeMember?.role || "viewer";
  const navItems = ROLE_NAVIGATION_MAP[currentRole] || [];
  const roleConfig = DEFAULT_ROLE_CONFIGS[currentRole];
  
  // Get currently active permissions list for quick status
  const currentPermsCount = rolePermissions[currentRole]?.length || 0;

  return (
    <aside className="flex w-64 flex-col border-r border-slate-900 bg-slate-950 p-4 relative overflow-hidden">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -translate-x-12 -translate-y-12 pointer-events-none" />
      
      {/* Simulation Meta Header */}
      <div className="mb-6 rounded-2xl bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 p-4 text-white shadow-lg shadow-black/40 relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300">
            Secured Session
          </span>
        </div>
        <p className="mt-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Poziom dostępu:
        </p>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-sm font-black tracking-tight text-white uppercase font-sans">
            {roleConfig?.name || currentRole}
          </span>
          <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-indigo-300 border border-indigo-500/20">
            {currentPermsCount} Perms
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-1.5 relative z-10">
        <div className="px-3 py-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Nawigacja Workspace
          </span>
        </div>
        
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border-l-2 border-indigo-400"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-100 border-l-2 border-transparent"
              }`}
            >
              <span className={`transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}>
                <LucideIcon name={item.icon} size={15} />
              </span>
              <div className="flex-1 truncate">
                <p className="leading-tight tracking-wide">{item.name}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Identity Details Popover Footprint */}
      <div className="mt-auto border-t border-slate-900 pt-4 relative z-10">
        {activeMember ? (
          <div className="rounded-2xl bg-slate-900/40 p-3 border border-slate-900/80 shadow-md">
            <div className="flex items-center gap-2.5">
              <img
                src={activeMember.avatar}
                alt={activeMember.name}
                className="h-8.5 w-8.5 rounded-xl object-cover ring-2 ring-slate-800"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-100 leading-none">
                  {activeMember.name}
                </p>
                <p className="truncate text-[9px] text-slate-500 font-mono mt-1">
                  {activeMember.email}
                </p>
              </div>
            </div>
            
            <div className="mt-3 border-t border-slate-900 pt-2.5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Dział / Departament
              </p>
              <p className="text-[10px] font-mono text-slate-300 mt-1 truncate bg-slate-950 p-2 rounded-lg border border-slate-900">
                {activeMember.department}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-rose-950/40 border border-rose-900/40 p-3 text-center text-xs text-rose-300 font-medium">
            Brak aktywnego profilu symulatora.
          </div>
        )}
      </div>
    </aside>
  );
}
