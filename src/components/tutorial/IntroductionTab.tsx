import React from "react";
import { Info, Cpu, Network, BookOpen, AlertCircle, Play, FileCode } from "lucide-react";

export const IntroductionTab: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-300 font-sans text-xs md:text-sm leading-relaxed max-w-none text-left">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-slate-900 bg-gradient-to-r from-indigo-950/40 via-indigo-950/10 to-transparent">
        <div className="absolute top-0 right-0 w-64 h-full bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">ROZDZIAŁ 1</span>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-3 tracking-tight">Wprowadzenie do Platformy CodeScope</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-3xl">
            Poznaj architekturę systemu, technologie stojące za analizatorem semantycznym oraz dowiedz się, jak platforma dekonstruuje i audytuje kod źródłowy w czasie rzeczywistym.
          </p>
        </div>
      </div>

      {/* Section 1: Co to jest CodeScope? */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <BookOpen size={16} className="text-indigo-400" />
          1.1 Istota i Założenia Systemowe
        </h3>
        <p>
          CodeScope to zautomatyzowane, ultranowoczesne środowisko deweloperskie i audytorskie przeznaczone do statycznej analizy kodu źródłowego. W odróżnieniu od klasycznych skanerów bezpieczeństwa, które działają wyłącznie na bazie dopasowywania wzorców tekstowych (RegEx), CodeScope kompiluje wgrane pliki źródłowe do reprezentacji **drzewa semantycznego** (AST - Abstract Syntax Tree) w pamięci RAM.
        </p>
        <p>
          Umożliwia to badanie kodu z pełnym zrozumieniem jego kontekstu, relacji między klasami, dziedziczenia typów oraz przepływu danych (Data Flow Analysis). Dzięki takiemu podejściu platforma potrafi nie tylko wskazywać błędy, ale również proponować logiczne, zintegrowane i w pełni bezpieczne poprawki bezpośrednio w plikach deweloperskich.
        </p>

        <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4 mt-2">
          <Info size={18} className="text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <strong className="text-white block mb-1">Dlaczego analiza statyczna (SAST)?</strong>
            Uruchamianie kodu w celu wykrycia podatności jest drogie i niesie ryzyko infekcji środowiska uruchomieniowego. CodeScope pozwala na weryfikację kodu z poziomu meta-struktury, co gwarantuje 100% bezpieczeństwo sandboxa przy zachowaniu maksymalnej dokładności diagnostycznej.
          </div>
        </div>
      </div>

      {/* Section 2: Jak działa Parser AST? */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Cpu size={16} className="text-cyan-400" />
          1.2 Cykl Życia Analizy Składniowej (AST Parser)
        </h3>
        <p>
          Proces parsowania wgranych plików źródłowych dzieli się na trzy główne etapy:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-900 text-left">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs mb-3 border border-indigo-500/20">01</div>
            <span className="text-xs font-extrabold text-white block">Analiza Leksykalna (Tokenizacja)</span>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Surowy ciąg znaków (kod źródłowy) dzielony jest na podstawowe jednostki gramatyczne, zwane tokenami (słowa kluczowe, identyfikatory, operatory).
            </p>
          </div>
          
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-900 text-left">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs mb-3 border border-cyan-500/20">02</div>
            <span className="text-xs font-extrabold text-white block">Analiza Składniowa (Parsing)</span>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Tokeny są grupowane w struktury hierarchiczne odpowiadające gramatyce języka programowania, tworząc surowe drzewo rozbioru składniowego.
            </p>
          </div>
          
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-900 text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3 border border-emerald-500/20">03</div>
            <span className="text-xs font-extrabold text-white block">Generowanie Drzewa Semantycznego</span>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Drzewo wzbogacane jest o definicje typów, zakresy zmiennych (scopes) oraz powiązania importów/eksportów. Powstaje finalne drzewo AST gotowe do audytu.
            </p>
          </div>
        </div>

        <p>
          Wszystkie te etapy odbywają się asynchronicznie za pośrednictwem wbudowanych silników parsujących (np. Babel dla JS/TS, swc dla kodu TypeScript React, oraz natywnych parserów regexowych i AST fallback dla języków kompilowanych takich jak Go, Rust, Java).
        </p>
      </div>

      {/* Section 3: Struktura Technologiczna */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Network size={16} className="text-emerald-400" />
          1.3 Architektura i Stack Technologiczny
        </h3>
        <p>
          Aplikacja została zaprojektowana w oparciu o architekturę rozproszoną (decoupled architecture) podzieloną na lekki, responsywny klient frontendowy oraz wydajny serwer deweloperski Node.js:
        </p>
        
        <table className="w-full border-collapse border border-slate-900 text-xs my-4 bg-slate-950/40 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-slate-950 text-white border-b border-slate-900 font-bold">
              <th className="p-3 text-left">Warstwa</th>
              <th className="p-3 text-left">Technologia</th>
              <th className="p-3 text-left">Rola w Systemie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            <tr>
              <td className="p-3 font-semibold text-indigo-400">Frontend Core</td>
              <td className="p-3 font-mono">React 19 + TypeScript</td>
              <td className="p-3">Odpowiedzialny za renderowanie widoku, zarządzanie stanem analizy i obsługę edytora.</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-cyan-400">Styling & UI</td>
              <td className="p-3 font-mono">Tailwind CSS + Lucide Icons</td>
              <td className="p-3">Buduje nowoczesny, ciemny design deweloperski z zachowaniem wysokiej responsywności.</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-emerald-400">Backend API</td>
              <td className="p-3 font-mono">Express.js (Node.js)</td>
              <td className="p-3">Obsługuje żądania zapisu plików na dysku, zarządza procesami CLI i integracją z AI.</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-amber-400">Skaner Heurystyczny</td>
              <td className="p-3 font-mono">Custom AST Rules Engine</td>
              <td className="p-3">Wykonuje deterministyczne testy na obecność znanych wzorców błędów w czasie &lt; 50ms.</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-rose-400">Silnik Inteligencji</td>
              <td className="p-3 font-mono">Gemini 2.5 Flash SDK</td>
              <td className="p-3">Odpowiedzialny za dogłębny audyt bezpieczeństwa oraz generowanie poprawek diff.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section 4: Mierniki Złożoności */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-400" />
          1.4 Metryki Jakości i Złożoność Kodu
        </h3>
        <p>
          Podczas parsowania każdego pliku, CodeScope automatycznie oblicza kluczowe wskaźniki inżynierii oprogramowania:
        </p>
        <ul className="list-disc pl-5 space-y-2.5 text-xs text-slate-400">
          <li>
            <strong className="text-white">Złożoność Cyklomatyczna (McCabe Complexity):</strong> Mierzy liczbę niezależnych ścieżek przejścia przez kod (instrukcje warunkowe `if`, pętle `for`, bloki `catch`). Wynik powyżej 15 sygnalizuje potrzebę refaktoryzacji.
          </li>
          <li>
            <strong className="text-white">Złożoność Kognitywna (Cognitive Complexity):</strong> Określa stopień trudności zrozumienia kodu przez człowieka. Bierze pod uwagę m.in. zagnieżdżenia pętli i warunków.
          </li>
          <li>
            <strong className="text-white">Gęstość komentarzy (Comment Ratio):</strong> Procentowa ilość linii zawierających dokumentację w stosunku do kodu wykonywalnego.
          </li>
          <li>
            <strong className="text-white">Duplikacja kodu:</strong> Wyszukuje powtarzające się fragmenty AST (code clones), sugerując wydzielenie ich do wspólnych modułów pomocniczych.
          </li>
        </ul>
      </div>

      {/* Section 5: Podsumowanie */}
      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-400 mt-6">
        <strong className="text-emerald-400 block mb-1">Gratulacje!</strong>
        Ukończyłeś wprowadzenie do architektury CodeScope. W następnym rozdziale dowiesz się dokładnie, jak uruchomić proces skanowania, jak działa cennik Stripe oraz jak importować własne repozytoria bezpośrednio z platformy GitHub.
      </div>

    </div>
  );
};
