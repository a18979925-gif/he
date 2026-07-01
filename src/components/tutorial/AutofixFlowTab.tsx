import React from "react";
import { Info, HelpCircle, Layers, ShieldCheck, Zap, Terminal, FileCode, CheckSquare } from "lucide-react";

export const AutofixFlowTab: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-300 font-sans text-xs md:text-sm leading-relaxed max-w-none text-left">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-slate-900 bg-gradient-to-r from-indigo-950/40 via-indigo-950/10 to-transparent">
        <div className="absolute top-0 right-0 w-64 h-full bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">ROZDZIAŁ 3</span>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-3 tracking-tight">Interactive Fix Flow & Mini Editor</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-3xl">
            Przewodnik po cyklu interaktywnego usuwania luk w plikach deweloperskich. Dowiedz się, jak automatycznie nanosić poprawki bezpośrednio na swój dysk za pomocą jednego kliknięcia.
          </p>
        </div>
      </div>

      {/* Section 1: Koncepcja Autofix Flow */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Zap size={16} className="text-indigo-400" />
          3.1 Idea i Działanie Pętli Diagnostycznej
        </h3>
        <p>
          Tradycyjne systemy audytu kodu informują jedynie o błędach, zmuszając programistę do wyszukiwania plików w zewnętrznym IDE, edycji kodu i ponownego skanowania. CodeScope drastycznie upraszcza ten proces dzięki **Interactive Fix Flow**.
        </p>
        <p>
          Jest to zamknięta, atomowa i w pełni kontrolowana przez użytkownika pętla diagnostyczno-naprawcza, która łączy interfejs graficzny bezpośrednio z fizycznym systemem plików Twojego komputera. Każda wykryta przez AI podatność posiada przypisany do siebie patch (diff), który może zostać naniesiony w czasie rzeczywistym.
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-400 my-4">
          <strong className="text-white block mb-1">Bezpieczeństwo operacji zapisu:</strong>
          Każdy automatyczny fix nie nadpisuje całego pliku w ciemno. Silnik backendu wykonuje celowaną operację tekstowej zamiany wadliwego bloku kodu (`oldCode` na `newCode`), co eliminuje ryzyko przypadkowego usunięcia pobocznych partii programu.
        </div>
      </div>

      {/* Section 2: Przewodnik krok po kroku */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <CheckSquare size={16} className="text-emerald-400" />
          3.2 Instrukcja Usuwania Błędów Krok po Kroku
        </h3>
        <p>
          Aby skutecznie zlikwidować błąd w projekcie:
        </p>

        <div className="space-y-4 mt-2">
          <div className="flex gap-4">
            <span className="text-[10px] font-mono font-black bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded h-fit shrink-0">KROK 1</span>
            <div>
              <strong className="text-white text-xs block">Zlokalizuj problem w zakładce Diagnostics</strong>
              <p className="text-xs text-slate-450 mt-1">
                Wykryty problem (np. wyciek sekretów w kodzie) jest opisany na tablicy wyników. Obok nagłówka błędu znajdziesz niebieski przycisk **Fix**. Kliknięcie go aktywuje stan korekcji pliku i automatycznie przełączy widok aplikacji na eksplorator plików (zakładka **Files**).
              </p>
            </div>
          </div>

          <div className="flex gap-4 border-t border-slate-900 pt-4">
            <span className="text-[10px] font-mono font-black bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded h-fit shrink-0">KROK 2</span>
            <div>
              <strong className="text-white text-xs block">Zbadaj podświetloną sekcję w edytorze kodu</strong>
              <p className="text-xs text-slate-450 mt-1">
                W eksploratorze plików zostanie automatycznie otwarty odpowiedni plik źródłowy. Wbudowany edytor kodu podświetli linie kodu, w których wykryto błąd (delikatny czerwony/pomarańczowy background), a w marginesie (gutter) pojawi się pulsująca ikona ostrzegawcza.
              </p>
            </div>
          </div>

          <div className="flex gap-4 border-t border-slate-900 pt-4">
            <span className="text-[10px] font-mono font-black bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded h-fit shrink-0">KROK 3</span>
            <div>
              <strong className="text-white text-xs block">Zatwierdź poprawność patcha (Apply Fix)</strong>
              <p className="text-xs text-slate-450 mt-1">
                Kliknij bezpośrednio na podświetloną sekcję kodu w edytorze. Otworzy to czytelny panel akcji bezpośrednio pod liniami kodu, pokazujący sugerowane zmiany (przed i po). Kliknięcie przycisku **Apply Fix** wywoła endpoint `/api/fix-code` na backendzie Express.
              </p>
            </div>
          </div>

          <div className="flex gap-4 border-t border-slate-900 pt-4">
            <span className="text-[10px] font-mono font-black bg-amber-500/10 text-amber-400 px-2 py-1 rounded h-fit shrink-0">KROK 4</span>
            <div>
              <strong className="text-white text-xs block">Automatyczne odświeżenie i re-analiza</strong>
              <p className="text-xs text-slate-450 mt-1">
                Backend podmieni kod na Twoim dysku fizycznym. Przeglądarka zaktualizuje zawartość pliku w tle, a system wywoła automatyczny proces re-analizy bazy kodowej. Po powrocie do zakładki **Diagnostics** błąd zniknie ze statystyk, a wskaźnik zdrowia wzrośnie!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Manualna Edycja */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <FileCode size={16} className="text-cyan-400" />
          3.3 Tryb Ręcznego Edytora (Manual Edit Mode)
        </h3>
        <p>
          Jeśli sugerowana poprawka AI Ci nie odpowiada i wolisz dokonać edycji ręcznie:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-455 text-slate-400 text-left">
          <li>W prawym górnym rogu podglądu kodu w zakładce **Files** kliknij pływający przycisk **Edytuj plik**.</li>
          <li>Podgląd kodu zamieni się w interaktywną tablicę edytora (`textarea`) z dynamiczną numeracją linii po lewej stronie.</li>
          <li>Wprowadź dowolne modyfikacje w tekście programu.</li>
          <li>Kliknij **Zapisz Plik** na górnym pasku kontrolnym edytora – zmiany zostaną zapisane, a analizator uruchomi się automatycznie. Kliknięcie **Anuluj** przywróci oryginalną zawartość.</li>
        </ol>
      </div>

      {/* Chapter Summary */}
      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-400 mt-6">
        <strong className="text-emerald-400 block mb-1">Świetnie!</strong>
        Umiesz już usuwać błędy automatycznie i ręcznie bezpośrednio w systemie plików. W kolejnym rozdziale zobaczysz, jak korzystać z symulatora SQL i testować zapytania bazodanowe na żywo.
      </div>

    </div>
  );
};
