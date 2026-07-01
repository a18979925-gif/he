import { Member } from "../types/member";
import { Organization } from "../types/team";
import { TeamRole } from "../types/role";
import { DEFAULT_ROLE_CONFIGS } from "../constants/permissions";
import { LucideIcon } from "./LucideIcon";
import { ShieldAlert, RefreshCw, Terminal, LogOut, DoorOpen, Search } from "lucide-react";
import { useFirebaseTeam } from "../context/FirebaseTeamContext";

interface TeamHeaderProps {
  org: Organization | null;
  activeMember: Member | null;
  members: Member[];
  onChangeActiveMember: (id: string) => void;
  onResetData: () => void;
  onSearchClick?: () => void;
}

export function TeamHeader({
  org,
  activeMember,
  members,
  onChangeActiveMember,
  onResetData,
  onSearchClick
}: TeamHeaderProps) {
  const currentRoleConfig = activeMember ? DEFAULT_ROLE_CONFIGS[activeMember.role] : null;
  const { logout, leaveWorkspace } = useFirebaseTeam();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 shadow-xs">
      {/* Left Branding */}
      <div className="flex items-center gap-3.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-base font-extrabold text-white shadow-lg shadow-indigo-600/20">
          {org?.logo || "⚡"}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900">
              {org?.name || "Synthetix Enterprise"}
            </h1>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono border border-slate-200/60">
              PROD-NODE
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-wide mt-0.5">{org?.domain || "synthetix.io"}</p>
        </div>
      </div>

      {/* Global Interactive Command Palette Search Trigger */}
      {onSearchClick && (
        <button 
          onClick={onSearchClick}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-600 transition-all cursor-pointer text-xs font-medium max-w-xs w-64 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Szybkie wyszukiwanie...</span>
          </div>
          <kbd className="bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-[9px] font-bold font-mono text-slate-400">Ctrl+K</kbd>
        </button>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Real-time System Status Indicator */}
        <div className="hidden items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-200/60 md:flex font-mono text-xs text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>Sys: Sprawny</span>
        </div>

        {/* Action Controls */}
        <button
          onClick={leaveWorkspace}
          title="Opuść ten zespół (Zmień workspace)"
          className="flex h-9 px-3 gap-1.5 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-colors text-xxs font-bold uppercase tracking-wider cursor-pointer"
        >
          <DoorOpen className="h-4 w-4" />
          <span className="hidden lg:inline">Zmień Zespół</span>
        </button>

        <button
          onClick={onResetData}
          title="Zresetuj bazę klastra do wartości domyślnych"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        <button
          onClick={logout}
          title="Wyloguj z systemu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 bg-rose-50/10 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>


        {/* Role Identity Simulator Dropdown */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-1">
          <div className="pl-3 pr-1 text-right">
            <p className="text-xxs font-semibold uppercase tracking-wider text-slate-400 font-mono">Profil Symulatora</p>
            {activeMember && (
              <p className="text-xs font-medium text-slate-700 max-w-[120px] truncate">{activeMember.name}</p>
            )}
          </div>
          <div className="relative">
            <select
              value={activeMember?.id || ""}
              onChange={(e) => onChangeActiveMember(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-hidden cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "1.25rem 1.25rem",
                backgroundRepeat: "no-repeat"
              }}
            >
              {members.map((m) => {
                const polRole = 
                  m.role === "owner" ? "Właściciel (Owner)" : 
                  m.role === "admin" ? "Administrator (Admin)" : 
                  m.role === "developer" ? "Developer (Dev)" : 
                  m.role === "security" ? "Oficer Bezpieczeństwa (Security)" : 
                  m.role === "manager" ? "Menedżer (Manager)" : 
                  m.role === "worker" ? "Programista (Programmer)" : 
                  "Audytor (Viewer)";
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} ({polRole})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Active Role Badging */}
        {currentRoleConfig && (
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold ${currentRoleConfig.badgeBg}`}>
            <span>{currentRoleConfig.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
