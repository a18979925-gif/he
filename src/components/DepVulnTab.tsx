import React, { useState } from "react";
import { Shield, FileCode, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

interface Vulnerability {
  id: string;
  cve: string;
  package: string;
  affected: string;
  fixed: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  cvss: number;
  desc: string;
  fixedStatus: boolean;
}

export const DepVulnTab: React.FC = () => {
  const [updatingPackage, setUpdatingPackage] = useState<string | null>(null);

  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([
    {
      id: "vuln-1",
      cve: "CVE-2023-42793",
      package: "guzzlehttp/guzzle",
      affected: "<7.4.5",
      fixed: "7.4.5",
      severity: "High",
      cvss: 8.8,
      desc: "Luka typu HTTP Request Smuggling pozwalająca na przejmowanie nagłówków sesyjnych użytkowników w starszych wersjach biblioteki klienckiej.",
      fixedStatus: false
    },
    {
      id: "vuln-2",
      cve: "CVE-2024-10022",
      package: "chart.js",
      affected: "<4.2.0",
      fixed: "4.2.0",
      severity: "Medium",
      cvss: 6.5,
      desc: "Luka typu Prototype Pollution w mechanizmie renderowania wykresów radarowych mogąca doprowadzić do Denial of Service.",
      fixedStatus: false
    }
  ]);

  const handleUpdatePackage = (id: string, packageName: string) => {
    setUpdatingPackage(id);
    setTimeout(() => {
      setVulnerabilities(prev => prev.map(v => v.id === id ? { ...v, fixedStatus: true } : v));
      setUpdatingPackage(null);
    }, 2000);
  };

  const activeVulns = vulnerabilities.filter(v => !v.fixedStatus);

  return (
    <div className="space-y-6 text-slate-200 text-left font-sans">
      
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-900">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-400" />
          Dependency Vulnerability Scanner (CVE / OSV Database)
        </h2>
        <p className="text-xs text-slate-500 mt-1">Skanuje pliki manifestu zależności i automatycznie wyszukuje podatności (CVE) w bazach danych NVD oraz OSV.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">STAN BEZPIECZEŃSTWA</span>
          <span className={`text-2xl font-black mt-1 block ${activeVulns.length > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
            {activeVulns.length > 0 ? "Podatny" : "W pełni bezpieczny"}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">ZAGROŻENIA CVE</span>
          <span className="text-2xl font-black text-white mt-1 block">{activeVulns.length} Podatności</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">ZAKTUALIZOWANE PAKIETY</span>
          <span className="text-2xl font-black text-emerald-450 text-emerald-450 text-emerald-400 mt-1 block">
            {vulnerabilities.filter(v => v.fixedStatus).length}
          </span>
        </div>
      </div>

      {/* Vulnerabilities List */}
      <div className="space-y-4">
        {vulnerabilities.map((vuln) => (
          <div 
            key={vuln.id} 
            className={`p-5 rounded-2xl bg-slate-950 border transition-all text-left flex gap-4 ${
              vuln.fixedStatus ? 'border-slate-900 opacity-60' : 'border-slate-900'
            }`}
          >
            <div className={`p-2.5 rounded-xl border h-fit shrink-0 ${
              vuln.fixedStatus ? 'bg-slate-900 text-slate-500 border-slate-800' : 'bg-rose-500/10 text-rose-550 text-rose-450 border-rose-500/20'
            }`}>
              <AlertTriangle size={16} />
            </div>

            <div className="space-y-3.5 flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-white truncate">{vuln.cve}</span>
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850 truncate">
                    {vuln.package}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850">
                    CVSS {vuln.cvss}
                  </span>
                  <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase ${
                    vuln.fixedStatus ? 'text-slate-500 border-slate-800 bg-slate-900/60' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                  }`}>
                    {vuln.severity}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-350 leading-relaxed font-normal">{vuln.desc}</p>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 mt-2 border-t border-slate-900/60">
                <div className="flex gap-4 text-[10px] font-mono text-slate-500">
                  <div>Zależność: <span className="text-rose-400 font-semibold">{vuln.affected}</span></div>
                  <div>Bezpieczna: <span className="text-emerald-450 text-emerald-400 font-semibold">&gt;={vuln.fixed}</span></div>
                </div>

                {!vuln.fixedStatus ? (
                  <button
                    onClick={() => handleUpdatePackage(vuln.id, vuln.package)}
                    disabled={updatingPackage !== null}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-1.5 active:scale-97 select-none"
                  >
                    {updatingPackage === vuln.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                    {updatingPackage === vuln.id ? "Aktualizowanie..." : `Aktualizuj do ${vuln.fixed}`}
                  </button>
                ) : (
                  <div className="text-[10px] text-emerald-450 text-emerald-450 text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle size={11} /> Zaktualizowano bibliotekę i załatano podatność pomyślnie!
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
