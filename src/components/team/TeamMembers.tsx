/**
 * TeamMembers.tsx — scalable team member management layer
 * - no page reload (server-state safe)
 * - role-aware permissions
 * - safer removal flow
 * - future RBAC ready structure
 */

import React, { useMemo, useState, useCallback } from "react";
import {
  Users,
  Shield,
  UserMinus,
  AlertCircle,
  Loader2,
} from "lucide-react";

import MemberCard from "./MemberCard";
import { apiFetch } from "../../stores/authStore";

/* ---------------- TYPES ---------------- */

interface Team {
  id: string;
  owner_id: string;
  members: any[];
}

interface User {
  id: string;
}

interface Props {
  team: Team;
  user?: User;

  // IMPORTANT: parent sync hook (replaces reload)
  onUpdate?: (team: Team) => void;
}

/* ---------------- COMPONENT ---------------- */

export default function TeamMembers({
  team,
  user,
  onUpdate,
}: Props) {
  const isOwner = team.owner_id === user?.id;

  /* ---------------- STATE ---------------- */

  const [state, setState] = useState({
    removingId: null as string | null,
    error: "",
  });

  /* ---------------- DERIVED ---------------- */

  const members = useMemo(() => team.members ?? [], [team.members]);

  const setError = (msg: string) =>
    setState((s) => ({ ...s, error: msg }));

  /* ---------------- REMOVE MEMBER ---------------- */

  const removeMember = useCallback(
    async (memberId: string) => {
      if (!isOwner) return;

      setState((s) => ({
        ...s,
        removingId: memberId,
        error: "",
      }));

      try {
        await apiFetch(
          `/api/auth/teams/${team.id}/members/${memberId}`,
          { method: "DELETE" }
        );

        // no reload — propagate upward
        const updatedTeam = {
          ...team,
          members: members.filter((m) => m.id !== memberId),
        };

        onUpdate?.(updatedTeam);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setState((s) => ({ ...s, removingId: null }));
      }
    },
    [isOwner, team, members, onUpdate]
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8">

      {/* ACCESS NOTICE */}
      {!isOwner && (
        <div className="flex items-center gap-3 bg-slate-500/10 border border-slate-500/20 rounded-2xl p-4 text-sm text-slate-400">
          <Shield size={16} />
          Only team owner can manage members.
        </div>
      )}

      {/* ERROR */}
      {state.error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-sm text-rose-400">
          <AlertCircle size={16} />
          {state.error}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center gap-3 text-sm uppercase tracking-widest text-slate-500 font-bold">
        <Users size={18} className="text-indigo-400" />
        Members ({members.length})
        {isOwner && (
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
            Owner
          </span>
        )}
      </div>

      {/* LIST */}
      <div className="grid grid-cols-2 gap-6">
        {members.map((m: any) => {
          const isSelf = m.id === user?.id;
          const isRemovable =
            isOwner && m.role !== "owner" && !isSelf;

          return (
            <div key={m.id} className="relative">

              <MemberCard
                username={m.username}
                role={m.role}
                userId={m.id}
                currentUserId={user?.id}
              />

              {/* REMOVE BUTTON */}
              {isRemovable && (
                <button
                  onClick={() => removeMember(m.id)}
                  disabled={state.removingId === m.id}
                  className="absolute top-2 right-2 p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50"
                  title="Remove member"
                >
                  {state.removingId === m.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UserMinus size={14} />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {members.length === 0 && (
        <div className="text-center py-24 text-slate-600">
          No members in this team yet.
        </div>
      )}
    </div>
  );
}