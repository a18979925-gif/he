/**
 * TeamInvite.tsx — Invite management tab
 */
import React, { useState } from "react";
import { Link, Shield, UserPlus, Copy, Check, RefreshCw } from "lucide-react";
import { apiFetch } from "../../stores/authStore";

interface Team {
  id: string;
  owner_id: string;
}

interface User {
  id: string;
}

interface InviteData {
  inviteUrl: string;
  token: string;
}

interface TeamInviteProps {
  team: Team;
  user?: User;
}

export default function TeamInvite({ team, user }: TeamInviteProps) {
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);

  const isOwner = team.owner_id === user?.id;

  const generateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const data = await apiFetch(`/api/auth/teams/${team.id}/invite`, {
        method: "POST",
        body: JSON.stringify({ role: "dev", maxUses: 10, expiresInHours: 72 }),
      });
      setInviteData(data);
    } catch (e: any) {
      alert("Error generating invite: " + e.message);
    } finally {
      setGeneratingInvite(false);
    }
  };

  const copyInvite = () => {
    if (!inviteData) return;
    navigator.clipboard.writeText(inviteData.inviteUrl);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {!isOwner && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-400">
          <Shield size={16} className="flex-shrink-0" /> Only the team owner can create invites.
        </div>
      )}

      {isOwner && (
        <>
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 space-y-4">
            <div className="flex items-center gap-3 text-sm font-bold text-white">
              <Link size={18} className="text-indigo-400" />
              Generate Invite Link
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Share this link with teammates. Each new user joining costs{" "}
              <span className="text-amber-400 font-bold">1 PLN</span>. Link valid for 72h, max 10 uses.
            </p>
            <button
              onClick={generateInvite}
              disabled={generatingInvite}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generatingInvite ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Generate New Invite Link
                </>
              )}
            </button>
          </div>

          {inviteData && (
            <div className="space-y-3">
              <div className="text-xs text-emerald-400 font-bold uppercase flex items-center gap-2">
                <Check size={14} /> Invite Link Ready
              </div>
              <div className="flex items-center gap-2 bg-black/30 border border-white/8 rounded-2xl p-4">
                <code className="text-xs text-slate-300 font-mono flex-1 truncate">{inviteData.inviteUrl}</code>
                <button
                  onClick={copyInvite}
                  className={`shrink-0 flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border transition-all ${
                    inviteCopied
                      ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                      : "bg-white/5 border-white/8 text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {inviteCopied ? (
                    <>
                      <Check size={13} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy Link
                    </>
                  )}
                </button>
              </div>
              <div className="text-xs text-slate-600">Valid 72 hours · max 10 uses · role: dev</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
