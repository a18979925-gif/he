import React, { useState } from "react";
import { Copy, FileCode, CheckCircle, HelpCircle, Shuffle, ChevronRight, Zap } from "lucide-react";

interface ClonePair {
  id: string;
  fileA: string;
  fileB: string;
  lines: string;
  percentage: number;
  codeSnippet: string;
  refactored: boolean;
}

export const DuplicationTab: React.FC = () => {
  const [clones, setClones] = useState<ClonePair[]>([
    {
      id: "clone-1",
      fileA: "admin_dashboard.php",
      fileB: "student_creator_dashboard.php",
      lines: "45-68 (23 linie)",
      percentage: 94,
      codeSnippet: `// Pobieranie powiadomień użytkownika\n$stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5");\n$stmt->execute([$user_id]);\n$notifications = $stmt->fetchAll();`,
      refactored: false
    },
    {
      id: "clone-2",
      fileA: "register.php",
      fileB: "login.php",
      lines: "112-124 (12 linii)",
      percentage: 82,
      codeSnippet: `// Walidacja siły hasła i formatu adresu e-mail\nif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {\n    throw new Exception("Nieprawidłowy e-mail");\n}`,
      refactored: false
    }
  ]);

  const [selectedClone, setSelectedClone] = useState<ClonePair | null>(null);
  const [refactorStatus, setRefactorStatus] = useState<string | null>(null);

  const handleAutoRefactor = (cloneId: string) => {
    setRefactorStatus("analyzing");
    setTimeout(() => {
      setRefactorStatus("generating");
      setTimeout(() => {
        setClones(prev => prev.map(c => c.id === cloneId ? { ...c, refactored: true, percentage: 0 } : c));
        setRefactorStatus("completed");
        setTimeout(() => {
          setRefactorStatus(null);
          setSelectedClone(null);
        }, 1500);
      }, 1500);
    }, 1000);
  };

  const duplicationRatio = Math.round((clones.filter(c => !c.refactored).length * 2.4) * 10) / 10;

  return (
    <div className="space-y-6 text-slate-200 text-left font-sans">
      
      {/* Header */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-900">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Copy className="h-5 w-5 text-indigo-400" />
          Duplicate Code Detector (AST Clones)
        </h2>
        <p className="text-xs text-slate-500 mt-1">Wykrywa identyczne lub semantycznie zbliżone bloki kodu, sugerując ich refaktoryzację do wspólnych plików pomocniczych.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">OGÓLNA GĘSTOŚĆ DUPLIKATÓW</span>
          <span className={`text-2xl font-black mt-1 block ${duplicationRatio > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {duplicationRatio}%
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">DUPLIKOWANE BLOKI</span>
          <span className="text-2xl font-black text-white mt-1 block">
            {clones.filter(c => !c.refactored).length} Wykryte
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono block">REFAKTORYZACJA KLONÓW</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {clones.filter(c => c.refactored).length} Wykonane
          </span>
        </div>
      </div>

      {/* Duplications List */}
      <div className="space-y-4">
        {clones.filter(c => !c.refactored).map((dup) => (
          <div 
            key={dup.id} 
            className="p-5 rounded-2xl bg-slate-950 border border-slate-900 hover:border-slate-800 transition-all text-left flex flex-col justify-between gap-4"
          >
            <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-2">
              <div className="flex items-center gap-2">
                <FileCode size={14} className="text-indigo-400" />
                <span className="text-xs font-mono font-bold text-slate-350">{dup.fileA}</span>
                <span className="text-slate-650 text-xs">↔</span>
                <span className="text-xs font-mono font-bold text-slate-350">{dup.fileB}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-rose-950 text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-900/50">
                  Podobieństwo: {dup.percentage}%
                </span>
                <button
                  onClick={() => setSelectedClone(dup)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  Analizuj klona <ChevronRight size={10} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-slate-550">
              <span>Zakres klona: {dup.lines}</span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 font-mono text-[9px] text-slate-400 max-h-[80px] overflow-hidden truncate">
              <pre>{dup.codeSnippet}</pre>
            </div>
          </div>
        ))}

        {clones.filter(c => !c.refactored).length === 0 && (
          <div className="p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center text-slate-400">
            <CheckCircle className="mx-auto text-emerald-450 text-emerald-450 text-emerald-400 mb-2" size={32} />
            <p className="text-sm font-bold text-white">Brak duplikatów kodu!</p>
            <p className="text-xs mt-1 text-slate-500">Twój kod jest w pełni zgodny z zasadą DRY (Don't Repeat Yourself).</p>
          </div>
        )}
      </div>

      {/* Side by Side Refactoring Panel Modal */}
      {selectedClone && (
        <div className="fixed inset-0 bg-[#000]/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200">
          <div className="bg-[#090911] border border-slate-900 p-6 rounded-3xl w-full max-w-2xl shadow-2xl relative text-left flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-start border-b border-slate-900 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shuffle className="text-indigo-400" size={16} /> 
                  Automatyczna Refaktoryzacja Klona AST
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Scalanie identycznej logiki do wspólnego pliku pomocniczego.</p>
              </div>
              <span className="bg-rose-950 text-rose-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-rose-900/50">
                Podobieństwo: {selectedClone.percentage}%
              </span>
            </div>

            {/* Split panel comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto mb-4 flex-1">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-indigo-400 block">{selectedClone.fileA}</span>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 font-mono text-[9px] text-slate-400 h-[150px] overflow-y-auto">
                  <pre>{selectedClone.codeSnippet}</pre>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-indigo-400 block">{selectedClone.fileB}</span>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 font-mono text-[9px] text-slate-400 h-[150px] overflow-y-auto">
                  <pre>{selectedClone.codeSnippet}</pre>
                </div>
              </div>
            </div>

            {/* Refactor Proposal */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 space-y-2 text-xs mb-5">
              <strong className="text-white block flex items-center gap-1.5">
                <Zap size={13} className="text-indigo-400" /> Propozycja Refaktoryzacji:
              </strong>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Wydzielenie logiki do pomocniczej klasy statycznej:
                <br />
                <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-400 font-mono text-[10px]">
                  Helper::fetchNotifications($user_id)
                </code> 
                wewnątrz pliku <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-455 text-indigo-400 font-mono text-[10px]">includes/helpers.php</code>.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-900 pt-4 shrink-0">
              <button 
                onClick={() => setSelectedClone(null)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Zamknij
              </button>
              <button 
                onClick={() => handleAutoRefactor(selectedClone.id)}
                disabled={refactorStatus !== null}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                {refactorStatus === "analyzing" ? "Analizowanie drzewa..." : 
                 refactorStatus === "generating" ? "Nadpisywanie plików..." :
                 refactorStatus === "completed" ? "Refaktoryzacja ukończona!" : "Wykonaj automatyczny Refactor"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
