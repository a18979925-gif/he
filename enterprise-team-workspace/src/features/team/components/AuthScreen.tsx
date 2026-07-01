import React, { useState } from "react";
import { useFirebaseTeam } from "../context/FirebaseTeamContext";
import { motion } from "motion/react";
import { ShieldCheck, Lock, Mail, User, ArrowRight, Loader2, KeyRound, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { TeamRole } from "../types/role";

export const AuthScreen: React.FC = () => {
  const { login, signup, loginWithGoogle } = useFirebaseTeam();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamRole>("developer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!nickname.trim()) {
          throw new Error("Proszę wpisać nick / nickname.");
        }
        await signup(email, password, nickname, selectedRole);
        toast.success("Konto zostało pomyślnie utworzone!");
      } else {
        await login(email, password);
        toast.success("Zalogowano pomyślnie!");
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "Wystąpił błąd podczas logowania.";
      if (err.code === "auth/invalid-credential") {
        errMsg = "Nieprawidłowy adres email lub hasło.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "Ten adres email jest już zajęty.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Hasło powinno mieć przynajmniej 6 znaków.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Niepoprawny format adresu email.";
      }
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: "admin" | "developer") => {
    setError(null);
    setLoading(true);
    const demoEmail = `${role}_demo@synthetix.io`;
    const demoPassword = "password123";
    const demoNick = role === "admin" ? "Andrzej (Admin)" : "Marcin (Dev)";

    try {
      // Try logging in first
      await login(demoEmail, demoPassword);
      toast.success(`Zalogowano jako ${role === "admin" ? "Andrzej (Admin)" : "Marcin (Dev)"}!`);
    } catch (err: any) {
      // If user doesn't exist, register them
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        try {
          await signup(demoEmail, demoPassword, demoNick, role);
          toast.success(`Zarejestrowano i zalogowano jako ${role === "admin" ? "Andrzej (Admin)" : "Marcin (Dev)"}!`);
        } catch (signupErr: any) {
          setError(signupErr.message);
          toast.error(signupErr.message);
          setLoading(false);
        }
      } else {
        setError(err.message);
        toast.error(err.message);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-50 via-slate-100 to-slate-200/60 p-6 font-sans relative overflow-hidden">
      {/* Decorative background glow elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden p-8 md:p-10 relative z-10">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-indigo-500 via-indigo-600 to-purple-600"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-4 shadow-sm relative group">
            <div className="absolute inset-0 bg-indigo-600/5 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            <ShieldCheck className="h-7 w-7 text-indigo-600 relative z-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Synthetix Enterprise</h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">Scentralizowany panel bezpieczeństwa i zarządzania zespołem</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-rose-100 bg-rose-50/50 p-3.5 text-xs text-rose-800 font-medium"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Twój Nick / Nickname</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="np. Andrzej"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Kim jesteś? (Wybierz rolę)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden transition-all text-slate-700 font-medium cursor-pointer"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="worker">Programmer</option>
                    <option value="developer">Developer (Dev)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xxs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Adres Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nazwa@firma.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xxs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Hasło logowania</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-xs focus:border-indigo-500 focus:bg-white focus:outline-hidden transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer mt-6"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? "Zarejestruj konto" : "Zaloguj do systemu"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <span className="border-b border-slate-200 w-2/5"></span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LUB</span>
          <span className="border-b border-slate-200 w-2/5"></span>
        </div>

        <button
          type="button"
          onClick={async () => {
            setError(null);
            setLoading(true);
            try {
              await loginWithGoogle();
              toast.success("Zalogowano pomyślnie przez Google!");
            } catch (err: any) {
              console.error(err);
              const errMsg = err.message || "Błąd logowania przez Google.";
              setError(errMsg);
              toast.error(errMsg);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer mt-4"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.29 1.71 15.53 1 12.24 1 5.48 1 0 6.48 0 13.2s5.48 12.2 12.24 12.2c7.055 0 11.75-4.965 11.75-11.965 0-.805-.085-1.42-.185-2.15H12.24z"
            />
          </svg>
          <span>Zaloguj przez Google (Zalecane)</span>
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-xxs text-indigo-600 hover:text-indigo-800 font-bold tracking-wide uppercase transition-colors cursor-pointer"
          >
            {isSignUp ? "Masz już konto? Zaloguj się" : "Nie masz konta? Zarejestruj się"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            <KeyRound className="h-3.5 w-3.5 text-slate-400" />
            <span>Szybkie Logowanie Demo</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickDemo("admin")}
              type="button"
              className="py-2.5 px-3 border border-slate-200 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/20 rounded-xl text-left text-xxs transition-all cursor-pointer group"
            >
              <span className="block font-bold text-slate-800 group-hover:text-indigo-900">Rola Admin</span>
              <span className="text-[10px] text-slate-400">Andrzej (Admin)</span>
            </button>
            <button
              onClick={() => handleQuickDemo("developer")}
              type="button"
              className="py-2.5 px-3 border border-slate-200 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/20 rounded-xl text-left text-xxs transition-all cursor-pointer group"
            >
              <span className="block font-bold text-slate-800 group-hover:text-indigo-900">Rola Developer</span>
              <span className="text-[10px] text-slate-400">Marcin (Dev)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
