/**
 * TeamDashboard.tsx — Team workspace overview with members, billing, projects, chat
 * Enhanced: Full-screen experience with expanded layout
 */
import React, { useState, useEffect } from "react";
import {
  Users, Plus, Copy, Check, Crown, MessageSquare,
  CreditCard, FolderOpen, Link, Shield, RefreshCw,
  UserPlus, ArrowRight, Zap, Activity, X, AlertTriangle
} from "lucide-react";
import { useAuthStore, apiFetch } from "../../stores/authStore";
import TeamChatPanel from "./TeamChatPanel";

interface TeamDashboardProps {
  teamId: string;
  onClose: () => void;
}

export default function TeamDashboard({ teamId, onClose }: TeamDashboardProps) {
  const { user } = useAuthStore();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "chat" | "billing" | "invite">("overview");
  const [inviteData, setInviteData] = useState<{ inviteUrl: string; token: string } | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);

  const loadTeam = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/api/auth/teams/${teamId}`);
      setTeam(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTeam(); }, [teamId]);

  const generateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const data = await apiFetch(`/api/auth/teams/${teamId}/invite`, {
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

  const isOwner = team?.owner_id === user?.id;
  const totalPLN = team ? (team.totalGr / 100).toFixed(2) : "0.00";

  const TABS = [
    { id: "overview", label: "Overview", icon: <Activity size={14} /> },
    { id: "chat",     label: "Live Chat", icon: <MessageSquare size={14} /> },
    { id: "billing",  label: "Billing",   icon: <CreditCard size={14} /> },
    { id: "invite",   label: "Invite",    icon: <UserPlus size={14} /> },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-7xl mx-4 h-[95vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        style={{ background: "linear-gradient(145deg, #0f1224 0%, #0a0d18 100%)" }}>

        {/* Glow effects */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-500/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-500/8 blur-3xl" />

        {/* Header */}
        <div className="relative shrink-0 px-8 py-6 border-b border-white/5 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20">
              <Users size={20} className="text-indigo-400" />
            </div>
            <div>
              {loading ? (
                <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
              ) : (
                <h2 className="text-xl font-black text-white">{team?.name || "Team"}</h2>
              )}
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                <span className="font-semibold">{team?.members?.length || 0} members</span>
                <span className="text-slate-700">·</span>
                <span className="text-amber-400 font-bold text-sm">{totalPLN} PLN</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Beta Warning Banner */}
        <div className="relative shrink-0 overflow-hidden border-b border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(245,158,11,0.08),transparent_50%)]" />
          <div className="relative flex items-center gap-4 px-8 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
              <AlertTriangle size={16} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Beta Feature
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400">
                  Team collaboration is currently in beta and will be improved in the next update
                </span>
              </div>
            </div>
          </div>
        </div>

{/* Premium Banner */}
<div className="relative shrink-0 overflow-hidden border-b border-indigo-500/10 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-indigo-500/5">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(99,102,241,0.12),transparent_50%)]" />

  <div className="relative flex flex-wrap items-center justify-between gap-4 px-8 py-4">
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
        <Zap size={18} className="text-indigo-400" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-white">
            Need custom team features?
          </span>

          <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
            Enterprise
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-400">
          Roles, permissions, audit logs, analytics, AI integrations and custom workspace systems.
          <span className="text-slate-600 block mt-1">
            Note: This is a separate application not affiliated with CodeScope, but available for use if desired.
          </span>
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <button
        onClick={() => window.open('/enterprise-team-workspace', '_blank')}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all text-xs font-bold"
      >
        <ArrowRight size={14} />
        Get Enterprise
      </button>
      <div className="rounded-2xl border border-indigo-500/20 bg-black/20 px-4 py-2">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
          Discord
        </div>

        <div className="font-mono text-sm font-bold text-indigo-400">
          frostbyte_frostbyte1
        </div>
      </div>
    </div>
  </div>
</div>
        {/* Tabs */}
        <div className="flex shrink-0 border-b border-white/5 px-2 bg-black/20 z-10 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? "text-indigo-400 border-b-2 border-indigo-500" : "text-slate-500 hover:text-slate-300"}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          {loading && (
            <div className="flex items-center justify-center h-32 text-slate-500 gap-2">
              <RefreshCw size={18} className="animate-spin" /> Loading team data...
            </div>
          )}
          {error && <div className="text-rose-400 text-sm">{error}</div>}

          {/* ── OVERVIEW ─────────────────────────────────────────── */}
          {!loading && team && activeTab === "overview" && (
            <div className="space-y-8 max-w-6xl">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: "Members", value: team.members?.length || 0, icon: <Users size={20} className="text-indigo-400" />, color: "from-indigo-500/20 to-violet-500/20 border-indigo-500/20" },
                  { label: "Projects", value: team.projects?.length || 0, icon: <FolderOpen size={20} className="text-sky-400" />, color: "from-sky-500/20 to-blue-500/20 border-sky-500/20" },
                  { label: "Total Cost", value: `${totalPLN} PLN`, icon: <CreditCard size={20} className="text-amber-400" />, color: "from-amber-500/20 to-orange-500/20 border-amber-500/20" },
                ].map(s => (
                  <div key={s.label} className={`bg-gradient-to-br ${s.color} border rounded-3xl p-6 text-center hover:border-white/20 transition-all`}>
                    <div className="flex justify-center mb-3">{s.icon}</div>
                    <div className="text-3xl font-black text-white">{s.value}</div>
                    <div className="text-xs text-slate-400 uppercase font-bold mt-1 tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Members list */}
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
                  <Users size={14} className="text-indigo-400" /> Members ({team.members?.length || 0})
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {team.members?.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black ${m.role === "owner" ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white" : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white"}`}>
                          {m.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">@{m.username}</div>
                          <div className="text-xs text-slate-500">{m.role}</div>
                        </div>
                      </div>
                      {m.role === "owner" && <Crown size={16} className="text-amber-400" />}
                      {m.id === user?.id && m.role !== "owner" && (
                        <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full font-bold">You</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent projects */}
              {team.projects?.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
                    <FolderOpen size={14} className="text-sky-400" /> Recent Projects ({team.projects?.length || 0})
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {team.projects.slice(0, 8).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <FolderOpen size={16} className="text-sky-400 flex-shrink-0" />
                          <span className="text-sm font-bold text-white truncate">{p.name}</span>
                        </div>
                        <span className="text-xs text-slate-500 ml-2 whitespace-nowrap">{p.file_count} files</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CHAT ─────────────────────────────────────────────── */}
          {!loading && activeTab === "chat" && (
            <div className="-m-8 h-[calc(100%+4rem)]">
              <TeamChatPanel teamId={teamId} onClose={() => setActiveTab("overview")} />
            </div>
          )}

          {/* ── BILLING ──────────────────────────────────────────── */}
          {!loading && team && activeTab === "billing" && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Total Usage</div>
                  <div className="text-4xl font-black text-amber-400 mt-2">{totalPLN} PLN</div>
                </div>
                <CreditCard size={40} className="text-amber-400/50" />
              </div>

              <div className="space-y-3">
                <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Billing Events</div>
                {team.billing?.length === 0 && (
                  <div className="text-center py-12 text-slate-600 text-sm">No billing events yet.</div>
                )}
                {team.billing?.map((ev: any) => (
                  <div key={ev.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                    <div>
                      <div className="text-sm font-bold text-white">{ev.description}</div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(ev.created_at).toLocaleString("pl-PL")} · @{ev.username}</div>
                    </div>
                    <span className="text-lg font-black text-amber-400">+{(ev.amount_gr / 100).toFixed(2)} PLN</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-500 space-y-2">
                <div className="font-bold text-slate-400">Pricing Model</div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>New team member</span><span className="text-amber-400 font-bold">1.00 PLN</span></div>
                  <div className="flex justify-between"><span>File scan (per file)</span><span className="text-amber-400 font-bold">0.10 PLN</span></div>
                  <div className="flex justify-between"><span>File scan (100+ files)</span><span className="text-amber-400 font-bold">0.08 PLN</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ── INVITE ───────────────────────────────────────────── */}
          {!loading && team && activeTab === "invite" && (
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
                      Share this link with teammates. Each new user joining costs <span className="text-amber-400 font-bold">1 PLN</span>.
                      Link valid for 72h, max 10 uses.
                    </p>
                    <button onClick={generateInvite} disabled={generatingInvite}
                      className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                      {generatingInvite
                        ? <><RefreshCw size={16} className="animate-spin" /> Generating...</>
                        : <><UserPlus size={16} /> Generate New Invite Link</>}
                    </button>
                  </div>

                  {inviteData && (
                    <div className="space-y-3">
                      <div className="text-xs text-emerald-400 font-bold uppercase flex items-center gap-2">
                        <Check size={14} /> Invite Link Ready
                      </div>
                      <div className="flex items-center gap-2 bg-black/30 border border-white/8 rounded-2xl p-4">
                        <code className="text-xs text-slate-300 font-mono flex-1 truncate">{inviteData.inviteUrl}</code>
                        <button onClick={copyInvite}
                          className={`shrink-0 flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border transition-all ${inviteCopied ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400" : "bg-white/5 border-white/8 text-slate-300 hover:text-white hover:bg-white/10"}`}>
                          {inviteCopied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Link</>}
                        </button>
                      </div>
                      <div className="text-xs text-slate-600">Valid 72 hours · max 10 uses · role: dev</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
