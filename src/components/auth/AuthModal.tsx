import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, Sparkles, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuthStore, apiFetch } from "../../stores/authStore";


interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  inviteToken?: string;
}

export default function AuthModal({ onClose, onSuccess, inviteToken }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(inviteToken ? "register" : "login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { setAuth, setTeams } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!username.trim() || !password.trim()) { setError("Fill in all fields"); return; }
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const data = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ username: username.trim(), password }),
      });

      setAuth(data.token, data.user);

      // Load teams
      const me = await apiFetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      setTeams(me.teams || []);

      // If joining via invite token
      if (inviteToken) {
        try {
          await apiFetch(`/api/auth/join/${inviteToken}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${data.token}` }
          });
          setSuccess(`✅ Joined team! Redirecting...`);
        } catch (invErr: any) {
          setSuccess(`Logged in! But invite error: ${invErr.message}`);
        }
      } else {
        setSuccess(mode === "register" ? "Account created! Welcome 🎉" : "Welcome back! 👋");
      }

      setTimeout(() => { onSuccess?.(); onClose(); }, 1000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0f1224 0%, #0a0d18 100%)" }}>

        {/* Glow */}
        <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-violet-500/8 blur-2xl" />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20">
              <Sparkles size={16} className="text-indigo-400" />
            </div>
            <h2 className="text-sm font-black text-white">CodeScope</h2>
          </div>
          <p className="text-[10px] text-slate-500">
            {inviteToken ? "Create account to join the team" : mode === "login" ? "Sign in to your workspace" : "Create your workspace account"}
          </p>
        </div>

        {/* Tabs */}
        {!inviteToken && (
          <div className="flex border-b border-white/5">
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 text-xs font-bold transition-all ${mode === m ? "text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5" : "text-slate-500 hover:text-slate-300"}`}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 relative z-10">

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Username</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)} autoFocus
                placeholder="your_username"
                className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 text-[11px] text-rose-400">
              <AlertCircle size={13} className="shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-[11px] text-emerald-400">
              <CheckCircle2 size={13} className="shrink-0" /> {success}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Processing...</>
              : mode === "login" ? "Sign In" : inviteToken ? "Create Account & Join" : "Create Account"
            }
          </button>

          {mode === "register" && !inviteToken && (
            <p className="text-[9px] text-slate-600 text-center">
              By registering you agree to be billed as you use team features.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
