import React, { useState } from "react";
import { useFirebaseTeam } from "../context/FirebaseTeamContext";
import { motion } from "motion/react";
import { Plus, Users, ArrowRight, Loader2, LogOut, Code, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const SetupWorkspaceScreen: React.FC = () => {
  const { createWorkspace, joinWorkspace, logout, profile } = useFirebaseTeam();
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loadingType, setLoadingType] = useState<"create" | "join" | "demo" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setError(null);
    setLoadingType("create");
    try {
      await createWorkspace(teamName.trim());
      toast.success(`Zespół "${teamName.trim()}" został pomyślnie utworzony!`);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Wystąpił błąd podczas tworzenia zespołu.";
      setError(msg);
      toast.error(msg);
      setLoadingType(null);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setError(null);
    setLoadingType("join");
    try {
      await joinWorkspace(inviteCode.trim().toUpperCase());
      toast.success("Pomyślnie połączono z zespołem!");
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Kod zaproszenia jest nieprawidłowy lub wygasł.";
      setError(msg);
      toast.error(msg);
      setLoadingType(null);
    }
  };

  const handleDemoBypass = async () => {
    setError(null);
    setLoadingType("demo");
    try {
      await createWorkspace("Synthetix Demo Sandbox", true);
      toast.success("Zainicjalizowano i przekierowano do środowiska demo!");
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Wystąpił błąd podczas szybkiego startu.";
      setError(msg);
      toast.error(msg);
      setLoadingType(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-slate-100 to-slate-200/60 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Decorative background glow elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden p-8 md:p-12 relative z-10 animate-fade-in">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-indigo-500 via-indigo-600 to-purple-600"></div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Konto Aktywne
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2 flex items-center gap-2">
              <span>Witaj, {profile?.nickname}!</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-wide mt-1">{profile?.email}</p>
          </div>
          <button
            onClick={logout}
            className="h-9 px-4 border border-slate-200 hover:border-rose-200 hover:bg-rose-50/30 text-slate-500 hover:text-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Wyloguj</span>
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-xs text-rose-800 font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Demo/Test Bypass Banner */}
        <div className="mb-8 p-5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100/80 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[9px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Tryb Testowy / Demo
            </span>
            <h3 className="text-sm font-black text-slate-950">Szybka prezentacja systemu (Bypass)</h3>
            <p className="text-xxs text-slate-500 leading-normal">
              Uruchom w pełni skonfigurowane środowisko testowe Sandbox z przykładowymi projektami, zadaniami, repozytoriami plików oraz logami audytowymi SOC2 za pomocą jednego kliknięcia.
            </p>
          </div>
          <button
            onClick={handleDemoBypass}
            disabled={loadingType !== null}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none text-white text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer shrink-0"
          >
            {loadingType === "demo" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Szybki Start</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Split grid for Create vs Join */}
        <div className="grid gap-8 md:grid-cols-2 md:divide-x md:divide-slate-100">
          
          {/* Create section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Utwórz Nowy Zespół</h2>
                <p className="text-xxs text-slate-400 mt-0.5">Uruchom nowy klaster operacyjny i bazy danych</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nazwa Organizacji / Projektu</label>
                <input
                  type="text"
                  required
                  disabled={loadingType !== null}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="np. Synthetix Tech, Acme Inc"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden transition-all placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={loadingType !== null || !teamName.trim()}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100 disabled:shadow-none text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {loadingType === "create" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Inicjalizuj Zespół</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Join section */}
          <div className="space-y-6 md:pl-8">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Dołącz do Zespołu</h2>
                <p className="text-xxs text-slate-400 mt-0.5">Połącz się z istniejącym klastrem roboczym</p>
              </div>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Kod Zaproszenia (Security Key)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Code className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    disabled={loadingType !== null}
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="np. SYN-123456"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-mono focus:border-emerald-500 focus:bg-white focus:outline-hidden transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingType !== null || !inviteCode.trim()}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100 disabled:shadow-none text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {loadingType === "join" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Dołącz do Klastra</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Dynamic Tip banner */}
        <div className="mt-12 rounded-xl bg-indigo-50/30 border border-indigo-100/40 p-4 text-xxs text-slate-500 leading-relaxed flex gap-3 items-start">
          <div className="text-indigo-600 font-bold shrink-0">💡 Wskazówka:</div>
          <div>
            Kod zaproszenia to unikalny identyfikator Twojego klastra (np. <strong>SYN-XXXXXX</strong>). Znajdziesz go w prawym górnym rogu panelu bocznego oraz w ustawieniach głównych w sekcji "Workspace configurations", gdy jesteś zalogowany w zespole. Przekaż go współpracownikom, aby mogli natychmiast dołączyć do bazy danych Firestore w czasie rzeczywistym!
          </div>
        </div>
      </div>
    </div>
  );
};
