/**
 * PresenceBar.tsx — Shows who is currently online in the team workspace
 * and who is viewing specific files. Enhanced with expanded view & nickname display
 */
import React, { useState } from "react";
import { Eye, Wifi, ChevronDown, X, User, Mail } from "lucide-react";

interface PresenceBarProps {
  onlineUsers: { username: string; nickname?: string; color: string; isMe: boolean; email?: string }[];
  currentFile?: string;
  viewingMap?: Record<string, { username: string; nickname?: string; file?: string; color: string }>;
  compact?: boolean;
  onUserRemove?: (username: string) => void;
}

export default function PresenceBar({
  onlineUsers,
  currentFile,
  viewingMap = {},
  compact = false,
  onUserRemove,
}: PresenceBarProps) {
  const [expandedUsers, setExpandedUsers] = useState(false);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  if (onlineUsers.length === 0) return null;

  const viewingCurrentFile = currentFile
    ? Object.values(viewingMap).filter(u => u.file === currentFile && !u.username.startsWith("me"))
    : [];

  const displayCount = 6;
  const hiddenCount = Math.max(0, onlineUsers.length - displayCount);

  return (
    <>
      {/* Compact bar */}
      <div className={`flex items-center gap-3 ${compact ? "px-2 py-1" : "px-4 py-2.5"} rounded-lg bg-white/[0.02] border border-white/5`}>
        {/* Online indicator */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold uppercase tracking-wider shrink-0">
          <Wifi size={11} className="text-emerald-500 animate-pulse" />
          <span className="hidden sm:block">Live</span>
        </div>

        {/* Avatar stack */}
        <div className="flex -space-x-2 items-center">
          {onlineUsers.slice(0, displayCount).map((u) => (
            <div
              key={u.username}
              onMouseEnter={() => setHoveredUser(u.username)}
              onMouseLeave={() => setHoveredUser(null)}
              className="relative group"
            >
              <div
                title={`@${u.nickname || u.username}${u.isMe ? " (you)" : ""}`}
                className={`relative h-7 w-7 rounded-full border-2 flex items-center justify-center text-[9px] font-black text-white transition-all duration-200 hover:scale-125 hover:z-20 hover:shadow-lg cursor-default ${
                  u.isMe ? "ring-1 ring-white/30 ring-offset-2 ring-offset-[#0a0d18]" : ""
                }`}
                style={{ backgroundColor: u.color, borderColor: "#0a0d18" }}
              >
                {(u.nickname || u.username)[0].toUpperCase()}
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#0a0d18] animate-pulse" />
              </div>

              {/* Hover tooltip */}
              {hoveredUser === u.username && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white whitespace-nowrap z-50 shadow-xl pointer-events-none">
                  <div className="font-bold">{u.nickname || u.username}</div>
                  {u.email && <div className="text-slate-400 text-[9px]">{u.email}</div>}
                  {u.isMe && <div className="text-emerald-400 text-[9px] font-semibold">You</div>}
                </div>
              )}
            </div>
          ))}
          {hiddenCount > 0 && (
            <button
              onClick={() => setExpandedUsers(true)}
              className="h-7 w-7 rounded-full border-2 border-[#0a0d18] bg-indigo-500/20 flex items-center justify-center text-[8px] font-black text-indigo-300 hover:bg-indigo-500/30 transition-colors"
              title={`+${hiddenCount} more users`}
            >
              +{hiddenCount}
            </button>
          )}
        </div>

        {/* Who's viewing current file */}
        {viewingCurrentFile.length > 0 && currentFile && (
          <div className="flex items-center gap-1.5 ml-2 text-[9px] text-slate-500 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-1">
            <Eye size={10} className="text-indigo-400" />
            <span className="font-semibold">
              {viewingCurrentFile.map(u => u.nickname || u.username).join(", ")} viewing
            </span>
          </div>
        )}

        {/* Toggle expand */}
        <button
          onClick={() => setExpandedUsers(!expandedUsers)}
          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors p-1"
          title="View all team members"
        >
          <ChevronDown size={14} className={`transition-transform ${expandedUsers ? "rotate-180" : ""}`} />
        </button>

        <span className="text-[9px] text-slate-600 shrink-0 hidden lg:block">
          {onlineUsers.length} online
        </span>
      </div>

      {/* Expanded view modal */}
      {expandedUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setExpandedUsers(false)} />

          <div
            className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ background: "linear-gradient(145deg, #0f1224 0%, #0a0d18 100%)" }}
          >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -top-12 -left-12 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-violet-500/8 blur-3xl" />

            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 relative z-10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Wifi size={14} className="text-emerald-500" />
                  Team Members Online
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">{onlineUsers.length} people in this workspace</p>
              </div>
              <button
                onClick={() => setExpandedUsers(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Members list */}
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto relative z-10">
              {onlineUsers.map((u) => (
                <div
                  key={u.username}
                  className="flex items-center gap-3 px-3 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-xl transition-all group"
                >
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 ring-2 ring-white/20"
                    style={{ backgroundColor: u.color }}
                  >
                    {(u.nickname || u.username)[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                      {u.nickname || u.username}
                      {u.isMe && (
                        <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/30 text-emerald-300 rounded-full font-semibold whitespace-nowrap">
                          You
                        </span>
                      )}
                    </div>
                    {u.email && <div className="text-[9px] text-slate-500 truncate flex items-center gap-1">
                      <Mail size={9} /> {u.email}
                    </div>}
                    <div className="text-[8px] text-slate-600 mt-0.5 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active now
                    </div>
                  </div>

                  {/* Remove button - only show for non-current user */}
                  {!u.isMe && onUserRemove && (
                    <button
                      onClick={() => onUserRemove(u.username)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-rose-400 p-1"
                      title="Remove from team"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Footer info */}
            <div className="px-6 py-4 border-t border-white/5 bg-black/20 relative z-10">
              <div className="text-[9px] text-slate-500 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All members are currently active in this workspace
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
