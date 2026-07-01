import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, Lock, User, MapPin, Check, AlertTriangle, ShieldCheck, 
  HelpCircle, Eye, EyeOff, X, ArrowRight, Star, RefreshCw, 
  Sparkles, Terminal, LogOut, CheckCircle2, ChevronRight, Globe
} from "lucide-react";
import { toast } from "sonner";

// High-fidelity SVG Logos for each brand to guarantee premium visuals
const EPIC_LOGO = (
  <svg className="w-12 h-12 text-white fill-current" viewBox="0 0 24 24">
    <path d="M12 0L1.5 4.12v13.06L12 24l10.5-6.82V4.12L12 0zm7.13 16.48l-7.13 4.63-7.13-4.63v-9.6l7.13-4.63 7.13 4.63v9.6zM12 5.42L7.35 8.44v5.12L12 16.58l4.65-3.02V8.44L12 5.42zm2.14 6.78c-.28.18-.62.22-.9.1-.15-.06-.27-.18-.35-.32l-1.32-2.31c-.13-.23-.05-.53.18-.66.23-.13.53-.05.66.18l1.04 1.83 1.93-1.25c.23-.15.53-.08.68.15.15.23.08.53-.15.68l-2.19 1.43z"/>
  </svg>
);

const PLAYSTATION_LOGO = (
  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
    <path d="M11.24 16.023c-1.353-.393-2.67-.84-3.528-1.206V10.27c1.077.414 2.451.865 3.528 1.157v4.596zm5.836-1.503c-.56-.17-1.192-.358-1.841-.538v-3.79c.64.162 1.259.336 1.841.51v3.818zm-4.708-5.328c-.856-.307-1.84-.61-2.736-.838l2.736-.708v1.546zm5.228 1.144c-.742-.234-1.637-.468-2.484-.658l2.484-.572v1.23zm-14.774 4.54a24.516 24.516 0 011.666-.328v-3.41c-.604-.01-1.173.012-1.666.05v3.688zM12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm7.11 13.045c-.886-.25-2.023-.518-3.136-.723V10.45c1.037.24 2.181.545 3.136.852v3.743zm-4.264-1.075c-1.127-.315-2.433-.603-3.428-.795V9.452c1.041.25 2.3.568 3.428.892v3.826z"/>
  </svg>
);

const XBOX_LOGO = (
  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.05 18.06c-1.53-.08-2.92-.62-4.14-1.58.55-.42 1.34-.84 2.34-1.2 1.1-.39 2.45-.63 3.59-.61 1.09.02 2.35.25 3.39.63.89.33 1.58.71 2.06 1.08-1.19.98-2.58 1.57-4.14 1.66-.36.01-.73.01-1.1-.02zm6.27-2.96c-.45-.4-.15-.96.65-1.51 1.15-.79 2.09-1.92 2.65-3.19.06.32.09.64.09.98 0 1.48-.48 2.85-1.3 3.98l-2.09-.26zm-12.64 0c-1.1-.98-1.78-2.38-1.78-3.92 0-.3.02-.59.07-.88.58 1.25 1.52 2.34 2.64 3.1 1 .68 1.26 1.29.74 1.71l-1.67-.01zm14.65-5.94c-.21-1.39-1.18-2.73-2.51-3.61-1.75-1.17-4.15-1.65-5.84-1.17 1.63-.58 4.28-.21 6.13.91 1.63.98 2.43 2.37 2.44 3.75 0 .04-.21.08-.22.12zm-16.59-.07c0-1.28.71-2.57 2.19-3.48 1.74-1.07 4.16-1.4 5.75-.85-1.55-.54-4.04-.15-5.77.92-1.29.81-2.15 2.05-2.2 3.38.01.01.03.01.03.03z"/>
  </svg>
);

const NINTENDO_LOGO = (
  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-2v2h-2v-2h-2v-2h2V9h2v2h2v2z"/>
  </svg>
);

const STEAM_LOGO = (
  <svg className="w-5 h-5 text-slate-200 fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.35 12.11l-2.74-1.14a2.26 2.26 0 00-.77-.17c-.12 0-.24.01-.36.03l-1.32-.9c.04-.15.06-.31.06-.47 0-1-.81-1.81-1.81-1.81S7.6 11.47 7.6 12.47c0 .64.33 1.21.84 1.54l.9 1.32c-.02.12-.03.24-.03.36 0 .43.15.82.4 1.14l-1.13 2.74a7.995 7.995 0 01-4.71-6.1c.14-.02.27-.04.41-.04 1.15 0 2.08.93 2.08 2.08s-.93 2.08-2.08 2.08c-.18 0-.35-.02-.51-.07a8.03 8.03 0 0113.39-1.41zm-6.26.36c0-.49.4-.89.89-.89s.89.4.89.89-.4.89-.89.89-.89-.4-.89-.89z"/>
  </svg>
);

const GOOGLE_LOGO = (
  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
    <path d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.24-3.116C18.253 1.698 15.495 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.34 0 10.56-4.455 10.56-10.74 0-.725-.08-1.275-.175-1.825L12.24 10.285z"/>
  </svg>
);

const APPLE_LOGO = (
  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.1.09 2.23-.58 2.94-1.39z"/>
  </svg>
);

const DISNEY_LOGO = (
  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.29 11.29c-.39.39-1.02.39-1.41 0L9.29 10.7c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l2.59 2.59c.38.39.38 1.02 0 1.41z"/>
  </svg>
);

const FACEBOOK_LOGO = (
  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
  </svg>
);

const LEGO_LOGO = (
  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v-2H9V9h2V7h2v2h2v2h-2v2h2v2h-2v2h-2v-2z"/>
  </svg>
);

const AUTODESK_LOGO = (
  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11l-4 4-4-4 1.4-1.4 1.6 1.6V9h2v4.2l1.6-1.6L16 13z"/>
  </svg>
);

interface EpicLoginPreviewProps {
  onBackToDashboard?: () => void;
}

export function EpicLoginPreview({ onBackToDashboard }: EpicLoginPreviewProps) {
  // Flow State
  const [step, setStep] = useState<"email" | "password" | "register" | "success" | "forgot">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Register form fields
  const [regCountry, setRegCountry] = useState("Polska");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regTerms, setRegTerms] = useState(false);

  // Active SSO SSO Login Modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [ssoUsername, setSsoUsername] = useState("");
  const [ssoPassword, setSsoPassword] = useState("");
  const [ssoLoading, setSsoLoading] = useState(false);

  // Other utility overlays
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Handle Email submission (move to password input)
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Wprowadź poprawny adres e-mail!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("password");
      toast.info("Wprowadź hasło dla podanego konta Epic Games.");
    }, 800);
  };

  // Handle Password submission and login simulation
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      toast.error("Hasło musi zawierać przynajmniej 4 znaki!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      toast.success("Zalogowano pomyślnie do Epic Games!", {
        description: `Witaj z powrotem, ${email.split("@")[0]}!`
      });
    }, 1200);
  };

  // Handle Mock Register submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.includes("@") || regPassword.length < 6 || !regDisplayName || !regTerms) {
      toast.error("Wypełnij wymagane pola i zaakceptuj regulamin!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmail(regEmail);
      setStep("success");
      toast.success(`Konto utworzone pomyślnie!`, {
        description: `Zarejestrowano jako ${regDisplayName}`
      });
    }, 1500);
  };

  // Handle Mock Forgotten Password
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Wpisz poprawny adres e-mail!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("email");
      toast.success("Wysłano link do resetowania hasła!", {
        description: `Sprawdź skrzynkę e-mail: ${email}`
      });
    }, 1000);
  };

  // Handle SSO login submit inside the modal
  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoUsername) {
      toast.error("Nazwa użytkownika jest wymagana!");
      return;
    }
    setSsoLoading(true);
    setTimeout(() => {
      setSsoLoading(false);
      setEmail(`${ssoUsername.toLowerCase().replace(/[^a-z0-9]/g, "")}@epic-sso.com`);
      setActiveModal(null);
      setSsoUsername("");
      setSsoPassword("");
      setStep("success");
      toast.success(`Zalogowano poprzez konto ${activeModal}!`);
    }, 1400);
  };

  const logout = () => {
    setEmail("");
    setPassword("");
    setStep("email");
    toast.info("Wylogowano z systemu Epic Games.");
  };

  // Helper to render SSO modals styling and names dynamically
  const getSsoModalConfig = (provider: string) => {
    switch (provider) {
      case "PlayStation Network":
        return {
          bg: "bg-blue-900 border-blue-700",
          accent: "bg-blue-600 hover:bg-blue-500",
          logo: PLAYSTATION_LOGO,
          label: "Identyfikator wpisu (Adres e-mail)"
        };
      case "Sieć Xbox":
        return {
          bg: "bg-green-950 border-green-800",
          accent: "bg-green-600 hover:bg-green-500",
          logo: XBOX_LOGO,
          label: "E-mail, telefon lub nazwa Skype"
        };
      case "Konto Nintendo":
        return {
          bg: "bg-red-950 border-red-800",
          accent: "bg-red-600 hover:bg-red-500",
          logo: NINTENDO_LOGO,
          label: "Identyfikator użytkownika lub adres e-mail"
        };
      case "Google":
        return {
          bg: "bg-slate-900 border-slate-700",
          accent: "bg-blue-600 hover:bg-blue-500",
          logo: GOOGLE_LOGO,
          label: "Telefon lub adres e-mail"
        };
      case "Steam":
        return {
          bg: "bg-slate-900 border-indigo-950/80",
          accent: "bg-indigo-600 hover:bg-indigo-500",
          logo: STEAM_LOGO,
          label: "Nazwa konta Steam"
        };
      case "Disney":
        return {
          bg: "bg-blue-950 border-blue-900",
          accent: "bg-indigo-600 hover:bg-indigo-500",
          logo: DISNEY_LOGO,
          label: "E-mail konta Disney+"
        };
      case "Apple":
        return {
          bg: "bg-zinc-900 border-zinc-700",
          accent: "bg-white hover:bg-zinc-100 text-black",
          logo: APPLE_LOGO,
          label: "Apple ID"
        };
      case "Facebook":
        return {
          bg: "bg-blue-950 border-blue-900",
          accent: "bg-blue-600 hover:bg-blue-500",
          logo: FACEBOOK_LOGO,
          label: "Adres e-mail lub numer telefonu"
        };
      case "Konto LEGO":
        return {
          bg: "bg-yellow-950 border-yellow-800",
          accent: "bg-yellow-600 hover:bg-yellow-500 text-black",
          logo: LEGO_LOGO,
          label: "Nazwa użytkownika LEGO ID"
        };
      case "Autodesk":
        return {
          bg: "bg-zinc-900 border-zinc-800",
          accent: "bg-teal-600 hover:bg-teal-500",
          logo: AUTODESK_LOGO,
          label: "Identyfikator Autodesk"
        };
      default:
        return {
          bg: "bg-slate-900 border-slate-700",
          accent: "bg-indigo-600 hover:bg-indigo-500",
          logo: EPIC_LOGO,
          label: "Login ID"
        };
    }
  };

  return (
    <div id="epic-login-preview-container" className="min-h-[700px] w-full rounded-3xl bg-[#121212] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Absolute top tools bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full px-3 py-1 text-[10px] text-zinc-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>W pełni interaktywny podgląd</span>
        </div>
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold text-zinc-300 flex items-center gap-1 transition-all cursor-pointer shadow-md"
          >
            <X className="h-3 w-3" />
            <span>Wyjdź z Podglądu</span>
          </button>
        )}
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-[480px] bg-[#18181c] border border-zinc-850 rounded-2xl p-6 md:p-8 flex flex-col items-center shadow-2xl relative z-10 my-8">
        
        {/* Epic logo */}
        <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
          {EPIC_LOGO}
        </div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: EMAIL ADDRESS INPUT */}
          {step === "email" && (
            <motion.div
              key="step-email"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
              className="w-full flex flex-col"
            >
              <h2 className="text-lg md:text-xl font-bold text-white text-center mb-6 tracking-tight">
                Zaloguj się do Epic Games
              </h2>

              <form onSubmit={handleEmailSubmit} className="space-y-4 w-full">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Adres e-mail"
                    className="w-full h-12 rounded bg-zinc-900 border border-zinc-700 hover:border-zinc-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-hidden px-4 text-sm text-white transition-all placeholder:text-zinc-500"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-500" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#00a2f4] hover:bg-[#1fb1f6] text-white font-bold text-sm rounded uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>
                      <span>Kontynuuj</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <button
                  onClick={() => setStep("register")}
                  className="text-xs text-zinc-400 hover:text-white transition-colors underline cursor-pointer"
                >
                  Pierwszy raz tutaj? Utwórz konto
                </button>
              </div>

              {/* Console buttons zone */}
              <div className="mt-8 border-t border-zinc-800 pt-6 w-full text-center space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Grasz tylko na konsoli?
                </p>
                <p className="text-[10px] text-zinc-500">
                  Zaloguj się, aby uzyskać dostęp do postępów i zakupów
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveModal("PlayStation Network")}
                    className="flex flex-col items-center justify-center p-3 rounded bg-zinc-900 border border-zinc-800 hover:border-blue-600 transition-all gap-1.5 group cursor-pointer"
                  >
                    <div className="p-2 rounded bg-blue-600 text-white shadow-md group-hover:scale-105 transition-transform">
                      {PLAYSTATION_LOGO}
                    </div>
                    <span className="text-[9px] text-zinc-400 font-medium tracking-tight leading-tight">
                      PlayStation™
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveModal("Sieć Xbox")}
                    className="flex flex-col items-center justify-center p-3 rounded bg-zinc-900 border border-zinc-800 hover:border-green-600 transition-all gap-1.5 group cursor-pointer"
                  >
                    <div className="p-2 rounded bg-green-600 text-white shadow-md group-hover:scale-105 transition-transform">
                      {XBOX_LOGO}
                    </div>
                    <span className="text-[9px] text-zinc-400 font-medium tracking-tight leading-tight">
                      Sieć Xbox
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveModal("Konto Nintendo")}
                    className="flex flex-col items-center justify-center p-3 rounded bg-zinc-900 border border-zinc-800 hover:border-red-600 transition-all gap-1.5 group cursor-pointer"
                  >
                    <div className="p-2 rounded bg-red-600 text-white shadow-md group-hover:scale-105 transition-transform">
                      {NINTENDO_LOGO}
                    </div>
                    <span className="text-[9px] text-zinc-400 font-medium tracking-tight leading-tight">
                      Konto Nintendo
                    </span>
                  </button>
                </div>
              </div>

              {/* Other logins grid */}
              <div className="mt-6 border-t border-zinc-800 pt-6 w-full text-center space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Inne sposoby logowania
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveModal("Google")}
                    className="flex items-center gap-2 px-3 py-2.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-left transition-all cursor-pointer"
                  >
                    <span className="text-red-500">{GOOGLE_LOGO}</span>
                    <span className="text-[10px] font-bold text-zinc-300">Google</span>
                  </button>

                  <button
                    onClick={() => setActiveModal("Steam")}
                    className="flex items-center gap-2 px-3 py-2.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-left transition-all cursor-pointer"
                  >
                    <span>{STEAM_LOGO}</span>
                    <span className="text-[10px] font-bold text-zinc-300">Steam</span>
                  </button>

                  <button
                    onClick={() => setActiveModal("Disney")}
                    className="flex items-center gap-2 px-3 py-2.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-left transition-all cursor-pointer"
                  >
                    <span className="text-blue-400">{DISNEY_LOGO}</span>
                    <span className="text-[10px] font-bold text-zinc-300">Disney</span>
                  </button>

                  <button
                    onClick={() => setActiveModal("Apple")}
                    className="flex items-center gap-2 px-3 py-2.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-left transition-all cursor-pointer"
                  >
                    <span>{APPLE_LOGO}</span>
                    <span className="text-[10px] font-bold text-zinc-300">Apple ID</span>
                  </button>

                  <button
                    onClick={() => setActiveModal("Facebook")}
                    className="flex items-center gap-2 px-3 py-2.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-left transition-all cursor-pointer"
                  >
                    <span className="text-blue-500">{FACEBOOK_LOGO}</span>
                    <span className="text-[10px] font-bold text-zinc-300">Facebook</span>
                  </button>

                  <button
                    onClick={() => setActiveModal("Konto LEGO")}
                    className="flex items-center gap-2 px-3 py-2.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-left transition-all cursor-pointer"
                  >
                    <span className="text-yellow-500">{LEGO_LOGO}</span>
                    <span className="text-[10px] font-bold text-zinc-300">LEGO®</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveModal("Autodesk")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-center transition-all cursor-pointer"
                  >
                    <span className="text-orange-500">{AUTODESK_LOGO}</span>
                    <span className="text-[10px] font-bold text-zinc-300">Autodesk Inc.</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PASSWORD ENTRY */}
          {step === "password" && (
            <motion.div
              key="step-password"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="w-full flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setStep("email")}
                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xxs font-bold text-zinc-400 rounded cursor-pointer"
                >
                  ← Powrót
                </button>
                <span className="text-xxs text-zinc-500 font-mono truncate max-w-[200px]">
                  Konto: {email}
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-white text-center mb-6 tracking-tight">
                Wprowadź hasło
              </h2>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Hasło"
                    className="w-full h-12 rounded bg-zinc-900 border border-zinc-700 hover:border-zinc-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-hidden px-4 pr-12 text-sm text-white transition-all placeholder:text-zinc-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setStep("forgot")}
                    className="text-xxs text-zinc-400 hover:text-white transition-colors underline cursor-pointer"
                  >
                    Zapomniałeś hasła?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#00a2f4] hover:bg-[#1fb1f6] text-white font-bold text-sm rounded uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center"
                >
                  {loading ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : "Zaloguj się"}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 3: MOCK REGISTER */}
          {step === "register" && (
            <motion.div
              key="step-register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setStep("email")}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xxs font-bold text-zinc-400 rounded cursor-pointer"
                >
                  ← Powrót do logowania
                </button>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-white text-center mb-4 tracking-tight">
                Utwórz konto Epic Games
              </h2>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Imię</label>
                    <input
                      type="text"
                      required
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Imię"
                      className="w-full h-10 rounded bg-zinc-900 border border-zinc-700 px-3 text-xs text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nazwisko</label>
                    <input
                      type="text"
                      required
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Nazwisko"
                      className="w-full h-10 rounded bg-zinc-900 border border-zinc-700 px-3 text-xs text-white placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Kraj</label>
                  <select
                    value={regCountry}
                    onChange={(e) => setRegCountry(e.target.value)}
                    className="w-full h-10 rounded bg-zinc-900 border border-zinc-700 px-2 text-xs text-white"
                  >
                    <option value="Polska">Polska</option>
                    <option value="Niemcy">Niemcy</option>
                    <option value="USA">Stany Zjednoczone (USA)</option>
                    <option value="Wielka Brytania">Wielka Brytania</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nazwa wyświetlana (Nickname)</label>
                  <input
                    type="text"
                    required
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                    placeholder="np. PlayerOneX"
                    className="w-full h-10 rounded bg-zinc-900 border border-zinc-700 px-3 text-xs text-white placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Adres e-mail</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Adres e-mail"
                    className="w-full h-10 rounded bg-zinc-900 border border-zinc-700 px-3 text-xs text-white placeholder:text-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Hasło</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Hasło (min. 6 znaków)"
                    className="w-full h-10 rounded bg-zinc-900 border border-zinc-700 px-3 text-xs text-white placeholder:text-zinc-500"
                  />
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={regTerms}
                    onChange={(e) => setRegTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-sky-500 focus:ring-sky-500 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="text-[10px] text-zinc-400 leading-normal cursor-pointer select-none">
                    Przeczytałem i akceptuję <strong className="text-zinc-300 hover:underline">Warunki Świadczenia Usług</strong> oraz zapoznałem się z <strong className="text-zinc-300 hover:underline">Polityką Prywatności</strong>.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#00a2f4] hover:bg-[#1fb1f6] text-white font-bold text-xs rounded uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md mt-4 flex items-center justify-center"
                >
                  {loading ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : "Zarejestruj się"}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 4: FORGOT PASSWORD */}
          {step === "forgot" && (
            <motion.div
              key="step-forgot"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col"
            >
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setStep("password")}
                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xxs font-bold text-zinc-400 rounded cursor-pointer"
                >
                  ← Anuluj
                </button>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-white text-center mb-4 tracking-tight">
                Resetuj hasło konta
              </h2>
              
              <p className="text-xs text-zinc-400 text-center mb-6 leading-relaxed">
                Podaj swój adres e-mail przypisany do Epic Games. Wyślemy Ci link do wygenerowania nowego hasła zabezpieczającego.
              </p>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Zarejestrowany adres e-mail"
                  className="w-full h-12 rounded bg-zinc-900 border border-zinc-700 px-4 text-sm text-white placeholder:text-zinc-500 focus:border-sky-500 focus:outline-hidden"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#00a2f4] hover:bg-[#1fb1f6] text-white font-bold text-sm rounded uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center"
                >
                  {loading ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : "Wyślij e-mail"}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 5: SUCCESSFUL LOGIN LANDING SCREEN */}
          {step === "success" && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center text-center space-y-6"
            >
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <ShieldCheck className="h-10 w-10 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">
                  Zalogowano pomyślnie!
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  {email}
                </p>
              </div>

              {/* Mock launcher dashboard */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 w-full text-left space-y-3.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-[#00a2f4]" />
                    <span>Moje Gry (Launcher Cloud)</span>
                  </span>
                  <span className="text-[9px] bg-[#00a2f4]/15 text-[#00a2f4] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                    ONLINE
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded bg-[#121212] hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-750 transition-all group">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded bg-[#111] overflow-hidden flex items-center justify-center text-[10px] font-bold text-[#00a2f4]">
                        FTN
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">Fortnite</h4>
                        <p className="text-[9px] text-emerald-400 font-mono mt-1">Zainstalowana • Gotowa do gry</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toast.success("Uruchamianie Fortnite... Przygotowywanie pakietów tekstur.")}
                      className="px-2.5 py-1 text-[9px] font-bold rounded bg-[#00a2f4] hover:bg-[#1fb1f6] text-white cursor-pointer"
                    >
                      GRAJ
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-[#121212] hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-750 transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded bg-[#111] overflow-hidden flex items-center justify-center text-[10px] font-bold text-orange-400">
                        RL
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">Rocket League®</h4>
                        <p className="text-[9px] text-zinc-400 font-mono mt-1">Dostępna aktualizacja (1.2 GB)</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toast.info("Pobieranie aktualizacji dla Rocket League...")}
                      className="px-2.5 py-1 text-[9px] font-bold rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
                    >
                      AKTUALIZUJ
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-[#121212] hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-750 transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded bg-[#111] overflow-hidden flex items-center justify-center text-[10px] font-bold text-purple-400">
                        FG
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">Fall Guys</h4>
                        <p className="text-[9px] text-zinc-400 font-mono mt-1">W chmurze</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toast.success("Uruchamianie Fall Guys w trybie streamingowym...")}
                      className="px-2.5 py-1 text-[9px] font-bold rounded bg-[#00a2f4] hover:bg-[#1fb1f6] text-white cursor-pointer"
                    >
                      GRAJ
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 w-full pt-2">
                <button
                  onClick={logout}
                  className="flex-1 h-10 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-rose-900 hover:text-rose-400 text-zinc-400 text-xxs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Wyloguj się</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Footer Support Links */}
        {step !== "success" && (
          <div className="mt-8 flex flex-col items-center gap-2 text-[10px] text-zinc-500 border-t border-zinc-850 pt-5 w-full">
            <button
              onClick={() => {
                toast.info("Inicjowanie samouczka odzyskiwania konta...");
                setActiveModal("Pomoc techniczna");
              }}
              className="hover:text-white transition-colors underline cursor-pointer"
            >
              Masz problemy z logowaniem?
            </button>
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="hover:text-white transition-colors underline cursor-pointer"
            >
              Polityka prywatności
            </button>
          </div>
        )}
      </div>

      {/* DYNAMIC SSO PROVIDER MODAL */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-40"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className={`w-full max-w-[400px] rounded-xl border p-5 flex flex-col text-white shadow-2xl relative ${getSsoModalConfig(activeModal).bg}`}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSsoUsername("");
                  setSsoPassword("");
                }}
                className="absolute right-4 top-4 text-zinc-400 hover:text-white transition-all cursor-pointer p-1 rounded hover:bg-white/10"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="flex items-center gap-3 mb-5 border-b border-white/10 pb-3">
                <div className="p-2.5 bg-white/10 rounded-lg">
                  {getSsoModalConfig(activeModal).logo}
                </div>
                <div>
                  <h3 className="font-bold text-sm">Zaloguj przez {activeModal}</h3>
                  <p className="text-[10px] text-zinc-300">Bezpieczne logowanie jednokrotne (SSO)</p>
                </div>
              </div>

              {activeModal === "Pomoc techniczna" ? (
                /* HELP DESK MODE */
                <div className="space-y-4 text-xs text-zinc-200">
                  <p className="leading-relaxed">
                    W przypadku problemów z dostępem, możesz natychmiast wygenerować awaryjny klucz sesyjny. Zaloguje Cię to do domyślnego konta demonstracyjnego.
                  </p>
                  <button
                    onClick={() => {
                      setEmail("demo-gamer@epicgames.com");
                      setActiveModal(null);
                      setStep("success");
                      toast.success("Zalogowano awaryjnie przez system wsparcia technicznego!");
                    }}
                    className="w-full py-2.5 rounded bg-white text-black font-extrabold text-xxs tracking-wider hover:bg-zinc-100 uppercase transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Uruchom Awaryjnie (Konto Demo)</span>
                  </button>
                </div>
              ) : (
                /* GENERAL SSO FORM */
                <form onSubmit={handleSsoSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wide">
                      {getSsoModalConfig(activeModal).label}
                    </label>
                    <input
                      type="text"
                      required
                      value={ssoUsername}
                      onChange={(e) => setSsoUsername(e.target.value)}
                      placeholder={`Nazwa użytkownika ${activeModal}`}
                      className="w-full h-11 bg-black/40 border border-white/20 focus:border-white rounded px-3 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wide">
                      Hasło dostępu
                    </label>
                    <input
                      type="password"
                      required
                      value={ssoPassword}
                      onChange={(e) => setSsoPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 bg-black/40 border border-white/20 focus:border-white rounded px-3 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-[9px] text-zinc-300 bg-white/5 p-2 rounded">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Szyfrowane połączenie SSL z serwerem uwierzytelniania {activeModal}.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={ssoLoading}
                    className={`w-full h-11 rounded font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow flex items-center justify-center ${
                      getSsoModalConfig(activeModal).accent
                    }`}
                  >
                    {ssoLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : `Autoryzuj i Zaloguj`}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRIVACY POLICY DIALOG */}
      <AnimatePresence>
        {showPrivacyPolicy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-40"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-[420px] rounded-xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col text-white shadow-2xl relative"
            >
              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <h3 className="font-bold text-sm mb-3 text-white flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-[#00a2f4]" />
                <span>Polityka Prywatności i Pliki Cookies</span>
              </h3>

              <div className="text-xxs text-zinc-400 leading-relaxed space-y-3.5 max-h-[250px] overflow-y-auto pr-2 mb-4 scrollbar-thin">
                <p>
                  Szanujemy Twoją prywatność. Niniejsza polityka wyjaśnia, jak zbieramy, przetwarzamy i chronimy Twoje dane osobowe w ramach usług Epic Games Store oraz silnika Unreal Engine.
                </p>
                <p>
                  <strong>1. Dane, które zbieramy:</strong> Adres e-mail, identyfikatory urządzeń sieciowych, unikalne pseudonimy w grze, a w przypadku integracji SSO (Steam, PlayStation, Xbox, Nintendo, LEGO, Autodesk, Disney), przekazywane są wyłącznie bezpieczne tokeny uwierzytelniające OAuth 2.0.
                </p>
                <p>
                  <strong>2. Bezpieczeństwo:</strong> Wszystkie informacje logowania są przesyłane w postaci zaszyfrowanej metodą asymetryczną AES-256 z certyfikatem SSL klasy korporacyjnej. Hasła są przechowywane wyłącznie w postaci skrótów kryptograficznych bcrypt z unikalną solą.
                </p>
                <p>
                  <strong>3. Pliki cookies:</strong> Używamy ciasteczek w celu podtrzymania sesji użytkownika w piaskownicy deweloperskiej. Możesz w każdej chwili wyczyścić te dane w ustawieniach przeglądarki.
                </p>
              </div>

              <button
                onClick={() => setShowPrivacyPolicy(false)}
                className="w-full py-2.5 rounded bg-[#00a2f4] hover:bg-[#1fb1f6] text-white font-bold text-xxs tracking-wider uppercase transition-all cursor-pointer"
              >
                Rozumiem i Akceptuję
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
