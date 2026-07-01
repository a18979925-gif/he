/**
 * SoloTeamPicker.tsx — Modal shown BEFORE analysis starts.
 * Lets user pick Solo or Team mode, and which team to assign project to.
 * Enhanced with user addition by nickname and larger modal.
 */
import React, { useState } from "react";
import {
  Lock, Users, ChevronRight, Zap, Crown,
  FolderOpen, Check, Loader2, AlertCircle, Plus, Search, X, User
} from "lucide-react";
import { useAuthStore, apiFetch } from "../../stores/authStore";

interface SoloTeamPickerProps {
  projectName: string;
  fileCount: number;
  onConfirm: (mode: "solo" | "team", teamId: string | null) => void;
  onCancel: () => void;
}

export default function SoloTeamPicker({ projectName, fileCount, onConfirm, onCancel }: SoloTeamPickerProps) {
  const { user, teams } = useAuthStore();
  const [mode, setMode] = useState<"solo" | "team">("solo");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id || null);
  const [registeringTeam, setRegisteringTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [error, setError] = useState("");
  const [addingUser, setAddingUser] = useState(false);
  const [userNick, setUserNick] = useState("");
  const [addingUserLoading, setAddingUserLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Record<string, any[]>>({});

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setCreatingTeam(true);
    setError("");
    try {
      const team = await apiFetch("/api/auth/teams", {
        method: "POST",
        body: JSON.stringify({ name: newTeamName.trim() }),
      });
      useAuthStore.getState().setTeams([...useAuthStore.getState().teams, team]);
      setSelectedTeamId(team.id);
      setRegisteringTeam(false);
      setNewTeamName("");
      setTeamMembers({ ...teamMembers, [team.id]: [] });
    } catch (e: any) {
      setError("Error creating team: " + e.message);
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleAddUserByNick = async () => {
    if (!userNick.trim() || !selectedTeamId) return;
    setAddingUserLoading(true);
    setError("");
    try {
      const response = await apiFetch(`/api/auth/teams/${selectedTeamId}/invite`, {
        method: "POST",
        body: JSON.stringify({ nickname: userNick.trim() }),
      });
      setTeamMembers({
        ...teamMembers,
        [selectedTeamId]: [...(teamMembers[selectedTeamId] || []), response],
      });
      setUserNick("");
      setAddingUser(false);
    } catch (e: any) {
      setError("Error adding user: " + e.message);
    } finally {
      setAddingUserLoading(false);
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    if (!selectedTeamId) return;
    try {
      await apiFetch(`/api/auth/teams/${selectedTeamId}/members/${memberId}`, {
        method: "DELETE",
      });
      setTeamMembers({
        ...teamMembers,
        [selectedTeamId]: (teamMembers[selectedTeamId] || []).filter(m => m.id !== memberId),
      });
    } catch (e: any) {
      setError("Error removing user: " + e.message);
    }
  };

  const handleConfirm = () => {
    if (mode === "team" && !selectedTeamId) {
      setError("Please select or create a team first.");
      return;
    }
    onConfirm(mode, mode === "team" ? selectedTeamId : null);
  };

  const updatedTeams = useAuthStore.getState().teams;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full h-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        style={{ background: "linear-gradient(145deg, #0f1224 0%, #0a0d18 100%)" }}>

        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-violet-500/8 blur-3xl" />

        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen size={18} className="text-indigo-400" />
            <h2 className="text-lg font-black text-white">Project Analysis Mode</h2>
          </div>
          <p className="text-sm text-slate-500">
            Choose how you want to analyze <span className="text-slate-300 font-bold">{projectName}</span> ({fileCount} files)
          </p>
        </div>

        <div className="p-8 space-y-6 relative z-10 overflow-y-auto flex-1">
          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-4">
            {/* Solo */}
            <button onClick={() => setMode("solo")}
              className={`p-6 rounded-2xl border text-left transition-all duration-200 ${mode === "solo"
                ? "bg-gradient-to-br from-slate-700/40 to-slate-800/40 border-slate-500/40 shadow-lg"
                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"}`}>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${mode === "solo" ? "bg-gradient-to-br from-slate-500 to-slate-600" : "bg-white/5"}`}>
                <Lock size={20} className={mode === "solo" ? "text-white" : "text-slate-500"} />
              </div>
              <div className="text-sm font-bold text-white mb-1">Solo</div>
              <div className="text-xs text-slate-500 leading-relaxed">Private. Only you can see this project's analysis.</div>
              {mode === "solo" && (
                <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400 font-bold">
                  <Check size={12} /> Selected
                </div>
              )}
            </button>

            {/* Team */}
            <button onClick={() => { setMode("team"); setError(""); }}
              className={`p-6 rounded-2xl border text-left transition-all duration-200 ${mode === "team"
                ? "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border-indigo-500/40 shadow-lg shadow-indigo-900/20"
                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"}`}>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${mode === "team" ? "bg-gradient-to-br from-indigo-500 to-violet-600" : "bg-white/5"}`}>
                <Users size={20} className={mode === "team" ? "text-white" : "text-slate-500"} />
              </div>
              <div className="text-sm font-bold text-white mb-1">Team</div>
              <div className="text-xs text-slate-500 leading-relaxed">Shared workspace with live chat & presence.</div>
              {mode === "team" && (
                <div className="mt-3 flex items-center gap-1 text-xs text-indigo-400 font-bold">
                  <Check size={12} /> Selected
                </div>
              )}
            </button>
          </div>

          {/* Team picker (only when Team selected) */}
          {mode === "team" && (
            <div className="space-y-6">
              {!user ? (
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-400">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>You need to <strong>login</strong> first to use Team Mode.</span>
                </div>
              ) : (
                <>
                  <div>
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Select or Create Team</div>

                    {/* Teams list */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {updatedTeams.map((t: any) => (
                        <button key={t.id} onClick={() => setSelectedTeamId(t.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${selectedTeamId === t.id
                            ? "bg-indigo-500/15 border-indigo-500/30 text-white"
                            : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05]"}`}>
                          <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-black ${selectedTeamId === t.id ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white" : "bg-white/10 text-slate-500"}`}>
                            {t.name[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold flex-1 truncate">{t.name}</span>
                          {selectedTeamId === t.id && <Check size={16} className="text-indigo-400 shrink-0" />}
                        </button>
                      ))}
                      {updatedTeams.length === 0 && (
                        <div className="text-xs text-slate-600 text-center py-3">No teams yet. Create one below.</div>
                      )}
                    </div>

                    {/* Create new team inline */}
                    {!registeringTeam ? (
                      <button onClick={() => setRegisteringTeam(true)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-dashed border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all mt-2">
                        <Plus size={13} className="text-indigo-400" /> Create new team
                      </button>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                          placeholder="Team name..."
                          onKeyDown={e => e.key === "Enter" && handleCreateTeam()}
                          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                          autoFocus
                        />
                        <button onClick={handleCreateTeam} disabled={creatingTeam || !newTeamName.trim()}
                          className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50 transition-all flex items-center gap-1">
                          {creatingTeam ? <Loader2 size={13} className="animate-spin" /> : "Create"}
                        </button>
                        <button onClick={() => setRegisteringTeam(false)} className="text-slate-500 hover:text-slate-300 text-xs px-3 rounded-xl border border-white/8 hover:bg-white/5 transition-all">×</button>
                      </div>
                    )}
                  </div>

                  {/* Add user by nickname */}
                  {selectedTeamId && (
                    <div className="border-t border-white/5 pt-6">
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Team Members</div>

                      {/* Current members list */}
                      {teamMembers[selectedTeamId]?.length > 0 && (
                        <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                          {teamMembers[selectedTeamId].map((member: any) => (
                            <div key={member.id} className="flex items-center gap-3 px-3 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                                {member.nickname?.[0].toUpperCase() || member.email?.[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-white truncate">{member.nickname || member.email}</div>
                                {member.email && member.nickname && <div className="text-[9px] text-slate-500 truncate">{member.email}</div>}
                              </div>
                              <button onClick={() => handleRemoveTeamMember(member.id)} className="text-slate-500 hover:text-rose-400 transition-colors p-1">
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add user input */}
                      {!addingUser ? (
                        <button onClick={() => setAddingUser(true)}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-dashed border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all">
                          <User size={13} className="text-indigo-400" /> Add member by nickname
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                            <input value={userNick} onChange={e => setUserNick(e.target.value)}
                              placeholder="Enter nickname..."
                              onKeyDown={e => e.key === "Enter" && handleAddUserByNick()}
                              className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                              autoFocus
                            />
                          </div>
                          <button onClick={handleAddUserByNick} disabled={addingUserLoading || !userNick.trim()}
                            className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50 transition-all flex items-center gap-1">
                            {addingUserLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                          </button>
                          <button onClick={() => { setAddingUser(false); setUserNick(""); }} className="text-slate-500 hover:text-slate-300 text-xs px-3 rounded-xl border border-white/8 hover:bg-white/5 transition-all">×</button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-xs text-rose-400">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}

          {/* Info box */}
          <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-4 text-xs text-slate-500">
            <Zap size={14} className="text-indigo-400 shrink-0 mt-0.5" />
            <span>
              {mode === "team"
                ? "Team mode enables live chat, presence indicators, and shared issue ownership. Add team members by their nickname."
                : "Solo mode keeps your analysis private. You can always share it later."}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-8 border-t border-white/5 relative z-10 bg-black/20 sticky bottom-0">
          <button onClick={onCancel}
            className="flex-1 py-3 border border-white/8 text-slate-400 rounded-xl text-xs font-semibold hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button onClick={handleConfirm}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
            {mode === "solo" ? <Lock size={14} /> : <Users size={14} />}
            Start {mode === "solo" ? "Solo" : "Team"} Analysis
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
