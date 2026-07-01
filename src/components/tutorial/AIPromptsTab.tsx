import React from "react";
import { Info, HelpCircle, Layers, ShieldCheck, Zap, Terminal, FileCode, CheckSquare, Sparkles, Cpu } from "lucide-react";

export const AIPromptsTab: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-300 font-sans text-xs md:text-sm leading-relaxed max-w-none text-left">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-slate-900 bg-gradient-to-r from-amber-950/25 via-amber-950/5 to-transparent">
        <div className="absolute top-0 right-0 w-64 h-full bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[9px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">ROZDZIAŁ 6</span>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-3 tracking-tight">AI Oracle & Prompt Engineering</h2>
          <p className="text-slate-450 text-xs md:text-sm mt-2 max-w-3xl">
            Przewodnik po strukturze zapytań modeli sztucznej inteligencji Gemini API. Poznaj schematy promptów wykorzystywane do audytu kodu.
          </p>
        </div>
      </div>

      {/* Section 1: AI Oracle */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          6.1 Rola AI Oracle w Skanowaniu Kodu
        </h3>
        <p>
          Podczas gdy parser heurystyczny wykonuje deterministyczne, szybkie sprawdzenia oparte na wyrażeniach regularnych (RegEx) i regułach AST, moduł **AI Oracle** (oparty na Gemini 2.5) odpowiada za głębokie zrozumienie intencji programistycznych i wyszukiwanie subtelnych podatności logicznych.
        </p>
        <p>
          AI Oracle otrzymuje jako kontekst pełną zawartość sprawdzanego pliku, jego język, ścieżkę w projekcie oraz zidentyfikowane dotychczas podstawowe ostrzeżenia z parsera statycznego.
        </p>
      </div>

      {/* Section 2: Struktura promptu */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Cpu size={16} className="text-cyan-400" />
          6.2 Struktura Zapytania i Inżynieria Promptów (Prompt Architecture)
        </h3>
        <p>
          Prompt wysyłany do modelu składa się z instrukcji systemowej (System Instructions) oraz dynamicznego opisu pliku źródłowego:
        </p>
        
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[10px] text-slate-350 leading-relaxed space-y-2">
          <span className="text-indigo-400 font-bold block">// Instrukcja systemowa (System Instruction):</span>
          <p className="pl-4 border-l border-slate-800">
            "You are an elite automated security scanner and code quality helper. Always return precise line numbers and actionable unified diffs. Always output valid JSON strictly matching the requested schema."
          </p>
          
          <span className="text-indigo-400 font-bold block mt-4">// Schemat promptu (Context Construction):</span>
          <p className="pl-4 border-l border-slate-800">
            - Nazwa pliku oraz język programowania (np. TypeScript).<br />
            - Surowy kod źródłowy pliku zamknięty w znacznikach markdown.<br />
            - Ostrzeżenia heurystyczne wykryte lokalnie.<br />
            - Wymóg wygenerowania poprawek w postaci standardowego formatu patcha diff: `@@ -line,oldLines +line,newLines @@`.
          </p>
        </div>
      </div>

      {/* Section 3: Weryfikacja Schematu JSON */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <FileCode size={16} className="text-emerald-400" />
          6.3 Walidacja Danych Wyjściowych (Structured Output Schema)
        </h3>
        <p>
          Aby aplikacja mogła bezproblemowo zinterpretować odpowiedź z chmury, CodeScope wymusza na API Gemini zwrócenie strukturalnego dokumentu JSON (Structured JSON Output) za pomocą parametru `responseSchema` w SDK:
        </p>
        
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[10px] text-slate-300">
          <pre>{`{
  "type": "OBJECT",
  "properties": {
    "issues": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "line": { "type": "INTEGER" },
          "category": { "type": "STRING", "description": "security | quality | refactor" },
          "severity": { "type": "STRING", "description": "critical | warning | info" },
          "title": { "type": "STRING" },
          "description": { "type": "STRING" },
          "snippet": { "type": "STRING" },
          "suggestion": { "type": "STRING" },
          "diff": { "type": "STRING" }
        },
        "required": ["line", "category", "severity", "title", "description", "snippet"]
      }
    }
  },
  "required": ["issues"]
}`}</pre>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Dzięki temu rozwiązaniu eliminujemy błędy parsowania odpowiedzi z modelu (tzw. hallucinated outputs), co pozwala na natychmiastowe ładowanie poprawek bezpośrednio do Mini Code Editora.
        </p>
      </div>

      {/* Chapter Summary */}
      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-400 mt-6">
        <strong className="text-emerald-400 block mb-1">Gratulacje!</strong>
        Ukończyłeś całą bazę wiedzy CodeScope. Masz teraz pełną wiedzę na temat architektury, cennika, edytora, bazy danych oraz modeli sztucznej inteligencji. Życzymy udanych audytów!
      </div>

    </div>
  );
};
