import React, { useState } from "react";
import { 
  Users, Send, ShieldCheck, Flame, Cpu, 
  Settings, CheckCircle2, MessageSquare, AlertCircle, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { Member } from "../types/member";
import { useFirebaseTeam } from "../context/FirebaseTeamContext";

interface Bulletin {
  id: string;
  sender: string;
  avatar: string;
  role: string;
  message: string;
  category: "info" | "alert" | "release";
  time: string;
}

const INITIAL_BULLETINS: Bulletin[] = [
  {
    id: "bl-1",
    sender: "Andrzej Kowalski",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    role: "Właściciel (Owner)",
    message: "Przypominam o obowiązkowym zaliczeniu audytu bezpieczeństwa SOC2 w tym tygodniu. Proszę wszystkich o weryfikację uprawnień.",
    category: "alert",
    time: "2 godziny temu"
  },
  {
    id: "bl-2",
    sender: "Mike Tyson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
    role: "Developer (Dev)",
    message: "Wdrożono nową wersję klastra autoryzacji SSO v1.1. Rozwiązano problemy z przekraczaniem limitu czasu przy wywołaniach wielopoziomowych.",
    category: "release",
    time: "5 godzin temu"
  }
];

export function TeamActivityFeed() {
  const { auditLogs, activeMember, logAction } = useFirebaseTeam();
  const [bulletins, setBulletins] = useState<Bulletin[]>(INITIAL_BULLETINS);
  const [bulletinInput, setBulletinInput] = useState("");
  const [bulletinCategory, setBulletinCategory] = useState<Bulletin["category"]>("info");

  const handlePostBulletin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletinInput.trim() || !activeMember) return;

    const newBulletin: Bulletin = {
      id: `bl-${Date.now()}`,
      sender: activeMember.name,
      avatar: activeMember.avatar,
      role: activeMember.role.toUpperCase(),
      message: bulletinInput.trim(),
      category: bulletinCategory,
      time: "Przed chwilą"
    };

    setBulletins(prev => [newBulletin, ...prev]);
    setBulletinInput("");
    
    // Add to audit trail log too
    logAction(
      activeMember,
      "posted team bulletin",
      `'${newBulletin.message.substring(0, 30)}...'`,
      "security"
    );

    toast.success("Opublikowano nowy komunikat na tablicy zespołu!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <span>Strumień Aktywności i Komunikatów</span>
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xxs font-semibold text-indigo-700 border border-indigo-200">
            Workspace Feed
          </span>
        </h2>
        <p className="text-xs text-slate-500">
          Publikuj komunikaty, koordynuj wydania wersji oraz monitoruj logi aktywności członków zespołu w czasie rzeczywistym.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Bulletins Feed & Poster */}
        <div className="md:col-span-7 space-y-4">
          {/* Post Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-indigo-500" />
              <span>Opublikuj Nowy Komunikat Zespołu</span>
            </h3>
            <form onSubmit={handlePostBulletin} className="space-y-3">
              <textarea
                value={bulletinInput}
                onChange={(e) => setBulletinInput(e.target.value)}
                placeholder="Napisz ogłoszenie, zapytanie lub podsumowanie sprintu..."
                required
                rows={2}
                className="w-full rounded-lg border border-slate-200 p-3 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Kategoria:</span>
                  <select
                    value={bulletinCategory}
                    onChange={(e) => setBulletinCategory(e.target.value as Bulletin["category"])}
                    className="h-8 rounded-lg border border-slate-200 text-xxs font-semibold bg-slate-50 text-slate-600 px-2"
                  >
                    <option value="info">📋 Informacja</option>
                    <option value="alert">⚠️ Alert</option>
                    <option value="release">🚀 Wydanie wersji</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Send className="h-3 w-3" />
                  <span>Wyślij</span>
                </button>
              </div>
            </form>
          </div>

          {/* Bulletins List */}
          <div className="space-y-3">
            {bulletins.map((bl) => (
              <div key={bl.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs relative">
                <div className="absolute top-4 right-4">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    bl.category === "alert" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                    bl.category === "release" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}>
                    {bl.category}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <img src={bl.avatar} alt={bl.sender} className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-100 shrink-0" />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xs font-bold text-slate-800 leading-none">{bl.sender}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{bl.role}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{bl.time}</p>
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed whitespace-pre-wrap">{bl.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Cryptographic Audit Stream (Audit Log integration) */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Log Rejestru Zdarzeń (Live stream)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Logi generowane automatycznie przez uścisk dłoni z bazą danych Firebase Firestore i integrację ról.
            </p>

            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
              {(auditLogs || []).slice(0, 15).map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-150 text-[10px] text-slate-600 font-mono flex items-start gap-2 leading-relaxed">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse"></div>
                  <div>
                    <p className="font-bold text-slate-850">{log.actor.name}: <span className="font-normal text-slate-500">{log.action}</span></p>
                    <p className="text-slate-400 mt-0.5">Cel: {log.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
