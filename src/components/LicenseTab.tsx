import React, { useState } from "react";
import { Scale, FileCode, CheckCircle, AlertCircle, Info, Search, Sliders } from "lucide-react";

interface DependencyLicense {
  name: string;
  type: "Composer" | "NPM" | "Cargo" | "PIP";
  license: string;
  status: "approved" | "restricted" | "danger";
  desc: string;
}

export const LicenseTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "approved" | "danger">("all");
  const [exceptions, setExceptions] = useState<string[]>([]);
  const [exceptionInput, setExceptionInput] = useState("");

  const [dependencies, setDependencies] = useState<DependencyLicense[]>([
    { name: "stripe/stripe-php", type: "Composer", license: "MIT", status: "approved", desc: "Zezwala na pełne komercyjne użycie bez ograniczeń typu Copyleft." },
    { name: "guzzlehttp/guzzle", type: "Composer", license: "MIT", status: "approved", desc: "Zezwala na pełne komercyjne użycie bez ograniczeń typu Copyleft." },
    { name: "chart.js", type: "NPM", license: "MIT", status: "approved", desc: "Zezwala na pełne komercyjne użycie bez ograniczeń typu Copyleft." },
    { name: "lucide-react", type: "NPM", license: "ISC", status: "approved", desc: "Bardzo permissive licencja, w pełni bezpieczna dla komercyjnego SaaS." },
    { name: "gpl-library/core", type: "NPM", license: "GPL-3.0", status: "danger", desc: "Licencja silnego copyleft. Wymaga udostępnienia całego kodu aplikacji na licencji GPL." }
  ]);

  const handleRequestException = (e: React.FormEvent) => {
    e.preventDefault();
    if (exceptionInput.trim() && !exceptions.includes(exceptionInput)) {
      setExceptions(prev => [...prev, exceptionInput]);
      setExceptionInput("");
    }
  };

  const filteredDeps = dependencies.filter(dep => {
    const matchesSearch = dep.name.toLowerCase().includes(searchQuery.toLowerCase()) || dep.license.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      activeFilter === "approved" ? dep.status === "approved" :
      activeFilter === "danger" ? dep.status === "danger" : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 text-slate-200 text-left font-sans">
      
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-900">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Scale className="h-5 w-5 text-indigo-400" />
          License Compliance Scanner (GPL / Copyleft Protection)
        </h2>
        <p className="text-xs text-slate-500 mt-1">Audytuje zależności pod kątem licencji Copyleft chroniąc własność intelektualną Twojego oprogramowania.</p>
      </div>

      {/* Compliance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">LICENCJE ZATWIERDZONE</span>
          <span className="text-2xl font-black text-emerald-450 text-emerald-450 text-emerald-400 mt-1 block">
            {dependencies.filter(d => d.status === 'approved').length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">ZAGROŻENIA ZGODNOŚCI</span>
          <span className={`text-2xl font-black mt-1 block ${dependencies.filter(d => d.status === 'danger').length > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-450 text-emerald-400'}`}>
            {dependencies.filter(d => d.status === 'danger').length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">ZATWIERDZONE WYJĄTKI</span>
          <span className="text-2xl font-black text-indigo-455 text-indigo-400 mt-1 block">{exceptions.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">OGÓLNA ZGODNOŚĆ</span>
          <span className="text-2xl font-black text-white mt-1 block">
            {dependencies.some(d => d.status === 'danger') ? 'Niezgodny' : 'Zgodny'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Licenses List Panel */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-950 border border-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Szukaj licencji lub pakietu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none w-full transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
              <button 
                onClick={() => setActiveFilter("all")}
                className={`px-2.5 py-1 rounded-lg border ${activeFilter === 'all' ? 'bg-slate-900 text-white border-slate-800' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveFilter("approved")}
                className={`px-2.5 py-1 rounded-lg border ${activeFilter === 'approved' ? 'bg-slate-900 text-emerald-450 border-slate-800' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
              >
                Approved
              </button>
              <button 
                onClick={() => setActiveFilter("danger")}
                className={`px-2.5 py-1 rounded-lg border ${activeFilter === 'danger' ? 'bg-slate-900 text-rose-455 text-rose-400 border-slate-800' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
              >
                Danger (GPL)
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-900 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredDeps.map((dep, i) => (
              <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{dep.name}</span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850">
                      {dep.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{dep.desc}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-indigo-400">{dep.license}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                    dep.status === 'approved' ? 'bg-emerald-950 text-emerald-450 border-emerald-900/50' : 'bg-rose-950 text-rose-400 border-rose-900/50'
                  }`}>
                    {dep.status === 'approved' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                    {dep.status === 'approved' ? 'Safe' : 'Danger'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exceptions & Policy Request Form */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-slate-900 pb-3">
            <Info size={14} className="text-indigo-400" /> Wnioski o Wyjątki Licencyjne
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed text-left">
            Jeśli projekt wymaga użycia pakietu o restrykcyjnej licencji (np. GPL), możesz zgłosić wniosek do działu prawnego o zatwierdzenie wyjątku:
          </p>

          <form onSubmit={handleRequestException} className="space-y-3">
            <input 
              type="text" 
              placeholder="Nazwa biblioteki (np. gpl-library/core)..." 
              value={exceptionInput}
              onChange={(e) => setExceptionInput(e.target.value)}
              className="bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none w-full transition-colors"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
            >
              Zgłoś wniosek o wyjątek
            </button>
          </form>

          {/* List of registered exceptions */}
          {exceptions.length > 0 && (
            <div className="pt-3 border-t border-slate-900 space-y-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block text-left">Zarejestrowane Wyjątki:</span>
              <div className="flex flex-wrap gap-1.5">
                {exceptions.map(exc => (
                  <span key={exc} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded-lg font-semibold">
                    {exc}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
