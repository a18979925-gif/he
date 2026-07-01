/**
 * MemberCard.tsx — Reusable member card component (LARGE)
 */
import React from "react";
import { Crown } from "lucide-react";

interface MemberCardProps {
  username: string;
  role: "owner" | "admin" | "dev" | "viewer";
  userId: string;
  currentUserId?: string;
}

export default function MemberCard({ username, role, userId, currentUserId }: MemberCardProps) {
  const isOwner = role === "owner";
  const isCurrentUser = userId === currentUserId;

  return (
    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center gap-4">
        <div
          className={`h-14 w-14 rounded-xl flex items-center justify-center text-lg font-black ${
            isOwner
              ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
              : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
          }`}
        >
          {username[0].toUpperCase()}
        </div>
        <div>
          <div className="text-base font-bold text-white">@{username}</div>
          <div className="text-sm text-slate-500 capitalize">{role}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {isOwner && <Crown size={20} className="text-amber-400" />}
        {isCurrentUser && !isOwner && (
          <span className="text-sm text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full font-bold">
            You
          </span>
        )}
      </div>
    </div>
  );
}
