import React, { useState } from "react";
import { Lock, FileCode, CheckCircle, ShieldAlert, AlertTriangle, RefreshCw, EyeOff, Eye } from "lucide-react";

interface SecretIssue {
  id: string;
  file: string;
  line: number;
  type: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  secretValue: string;
  envKey: string;
  masked: boolean;
}

export const SecretsTab: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const [secrets, setSecrets] = useState<SecretIssue[]>([
    {
      id: "sec-1",
      file: "admin/header.php",
      line: 31,
      type: "Magic Admin ID Parameter",
      severity: "Medium",
      secretValue: "999999",
      envKey: "ADMIN_SYSTEM_USER_ID",
      masked: false
    },
    {
      id: "sec-2",
      file: "payment_checkout.php",
      line: 12,
      type: "Stripe Secret API Key",
      severity: "Critical",
      secretValue: "sk_test_51MzXkIL89w1JjKoPLp0293...",
      envKey: "STRIPE_SECRET_KEY",
      masked: false
    },
    {
      id: "sec-3",
      file: "db.php",
      line: 4,
      type: "Hardcoded Password",
      severity: "High",
      secretValue: "school_admin_pass_2026",
      envKey: "DB_PASSWORD",
      masked: false
    }
  ]);

  const toggleShowValue = (id: string) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleScanSecrets = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
    }, 2000);
  };

  const handleMaskSecret = (id: string) => {
    setSecrets(prev => prev.map(s => s.id === id ? { ...s, masked: true } : s));
  };

  return (
    <div className="space-y-6 text-slate-200 text-left font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950 p-6 rounded-3xl border border-slate-900 gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-400" />
            Secret Scanner (API Keys & Credentials)
          </h2>
          <p className="text-xs text-slate-500 mt-1">Skanuje pliki pod kątem zahardkodowanych haseł, kluczy API, tokenów OAuth i kluczy prywatnych SSH.</p>
        </div>
        <button
          onClick={handleScanSecrets}
          disabled={scanning}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-97 select-none"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? "Skanowanie w toku..." : "Uruchom Secret Scanner"}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">STAN ZAGROŻENIA</span>
          <span className={`text-2xl font-black mt-1 block ${secrets.filter(s => !s.masked).length > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
            {secrets.filter(s => !s.masked).length > 0 ? "Krytyczny wyciek" : "Bezpieczny"}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">AKTYWNE WYCIEKI</span>
          <span className="text-2xl font-black text-white mt-1 block">
            {secrets.filter(s => !s.masked).length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">ZAMASKOWANE / W .ENV</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {secrets.filter(s => s.masked).length}
          </span>
        </div>
      </div>

      {/* Secrets List */}
      <div className="space-y-4">
        {secrets.map((sec) => (
          <div 
            key={sec.id} 
            className={`p-5 rounded-2xl bg-slate-950 border transition-all text-left flex gap-4 ${
              sec.masked ? 'border-slate-900 opacity-60' : sec.severity === 'Critical' ? 'border-red-900/40 bg-red-950/5 shadow-md shadow-red-950/10' : 'border-slate-900'
            }`}
          >
            <div className={`p-2.5 rounded-xl border h-fit shrink-0 ${
              sec.masked ? 'bg-slate-900 text-slate-500 border-slate-800' : sec.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              <AlertTriangle size={16} />
            </div>

            <div className="space-y-3.5 flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs font-bold text-white truncate">{sec.type}</span>
                <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase shrink-0 ${
                  sec.severity === 'Critical' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}>
                  {sec.severity}
                </span>
              </div>

              <div className="text-[10px] text-slate-500 font-mono">
                Lokalizacja: <span className="text-cyan-400">{sec.file}:{sec.line}</span>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-850 font-mono text-[10px] text-rose-400 min-w-0">
                <span className="truncate flex-1">
                  {sec.masked ? "•••••••••••••••• (ZAMASKOWANO)" : showValues[sec.id] ? sec.secretValue : "••••••••••••••••"}
                </span>
                {!sec.masked && (
                  <button 
                    onClick={() => toggleShowValue(sec.id)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors shrink-0 cursor-pointer"
                  >
                    {showValues[sec.id] ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                )}
              </div>

              {!sec.masked ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1 border-t border-slate-900/60 mt-2">
                  <span className="text-[11px] text-slate-400 leading-relaxed max-w-md">{sec.suggestion}</span>
                  <button
                    onClick={() => handleMaskSecret(sec.id)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg transition-all shrink-0 cursor-pointer active:scale-97"
                  >
                    Przenieś do zmiennej {sec.envKey}
                  </button>
                </div>
              ) : (
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle size={11} /> Pomyślnie zamaskowano w pliku deweloperskim i zapisano do zmiennych środowiskowych!
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
