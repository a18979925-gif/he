import React from "react";
import { Info, HelpCircle, Layers, ShieldCheck, CreditCard, GitPullRequest, ArrowRight } from "lucide-react";

export const ScanningPricingTab: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-300 font-sans text-xs md:text-sm leading-relaxed max-w-none text-left">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-slate-900 bg-gradient-to-r from-emerald-950/30 via-emerald-950/10 to-transparent">
        <div className="absolute top-0 right-0 w-64 h-full bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-450 text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ROZDZIAŁ 2</span>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-3 tracking-tight">Skanowanie Kodu i Cennik Stripe</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-3xl">
            Przewodnik po metodach dostarczania kodu źródłowego oraz szczegółowa analiza zasad naliczania płatności za pomocą symulowanego interfejsu Stripe Checkout.
          </p>
        </div>
      </div>

      {/* Section 1: Jak wgrać pliki? */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Layers size={16} className="text-indigo-400" />
          2.1 Import ZIP oraz Repozytoriów Git
        </h3>
        <p>
          CodeScope udostępnia dwa główne kanały do wprowadzania struktur projektów do analizatora składniowego:
        </p>
        <ul className="list-disc pl-5 space-y-3.5 text-xs text-slate-400">
          <li>
            <strong className="text-white">Import Archiwum ZIP:</strong> Pozwala na szybkie zrzucenie spakowanego folderu roboczego. Wgrywany ZIP jest odczytywany w przeglądarce za pomocą biblioteki `JSZip` w celu odseparowania plików tekstowych od zasobów binarnych, a następnie przesyłany strumieniowo do silnika analizatora Express.
          </li>
          <li>
            <strong className="text-white">Klonowanie Git:</strong> Umożliwia pobranie kodu bezpośrednio z publicznego repozytorium (GitHub, GitLab, Bitbucket). Backend wykonuje operację `git clone` do tymczasowego folderu roboczego, skąd odczytuje strukturę katalogów.
          </li>
        </ul>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-400 my-4">
          <strong className="text-white block mb-1">Wykluczenia automatyczne (Exclusions):</strong>
          Podczas skanowania system automatycznie pomija foldery binarne i biblioteki zewnętrzne (np. `node_modules`, `dist`, `build`, `.git`, `vendor`, `target`, `bin`, `obj`) oraz pliki graficzne/multimedialne, aby nie obciążać procesora dekompilacją zasobów niekodowych.
        </div>
      </div>

      {/* Section 2: Szczegółowe zasady cennika */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <CreditCard size={16} className="text-emerald-400" />
          2.2 Cennik Skanowania i Limity Plików (Stripe API Rules)
        </h3>
        <p>
          System rozliczeniowy CodeScope posiada przejrzysty mechanizm wyceny skanowania, wdrożony bezpośrednio na porcie serwera Express. Zaimplementowane reguły cennika prezentują się następująco:
        </p>

        <div className="p-5 rounded-2xl bg-slate-955 bg-slate-950/60 border border-slate-900 my-4 space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
            <div>
              <strong className="text-white block">Skan darmowy (Pierwsze Skanowanie)</strong>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Każdy zalogowany lub gościnny użytkownik otrzymuje **dokładnie 1 skan za darmo**, o ile łączna liczba plików w wyselekcjonowanym archiwum ZIP wynosi **nie więcej niż 40 plików**.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 border-t border-slate-900 pt-4">
            <div className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
            <div>
              <strong className="text-white block">Skanowanie płatne (Powyżej limitu lub Kolejne)</strong>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Każde kolejne skanowanie (scan count &gt; 1 w `localStorage`) lub skan archiwum zawierającego więcej niż 40 plików jest płatny. Stawka wynosi **10 groszy (0.10 PLN) za każdy plik** znajdujący się w projekcie.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 border-t border-slate-900 pt-4">
            <div className="h-6 w-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
            <div>
              <strong className="text-white block">Rabat ilościowy (Projekty 100+)</strong>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Dla dużych baz kodowych składających się z **100 lub więcej plików**, system automatycznie nalicza rabat ilościowy, obniżając cenę skanowania do **8 groszy (0.08 PLN) za każdy plik**.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-450 leading-relaxed">
          Wzór matematyczny stosowany do obliczenia ceny w PLN:
          <br />
          <code className="bg-slate-950 px-2 py-1 rounded text-cyan-400 font-mono text-[10px] mt-1 inline-block">
            Cena = fileCount &gt;= 100 ? (fileCount * 0.08) : (fileCount * 0.10)
          </code>
        </p>
      </div>

      {/* Section 3: Symulator Bramki Stripe */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <ShieldCheck size={16} className="text-cyan-400" />
          2.3 Symulacja Płatności Stripe Checkout
        </h3>
        <p>
          W środowisku deweloperskim integracja ze Stripe została zastąpiona interaktywnym, bezpiecznym oknem modalnym **Stripe Checkout Simulation**:
        </p>
        <ul className="list-decimal pl-5 space-y-2.5 text-xs text-slate-400 text-left">
          <li>
            Po przesłaniu pliku ZIP, system sprawdza historię i liczbę plików. Jeśli warunki wskazują na skan płatny, pojawia się overlay informujący o konieczności opłacenia audytu.
          </li>
          <li>
            Kliknięcie **Przejdź do płatności** otwiera makietę bramki Stripe imitującą prawdziwy formularz płatniczy z polami na numer karty kredytowej, datę ważności i kod CVC.
          </li>
          <li>
            Po wpisaniu danych i kliknięciu **Zapłać**, system autoryzuje transakcję w bazie danych, inkrementuje licznik skanów w przeglądarce i odblokowuje proces generowania AST.
          </li>
        </ul>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3 text-xs text-slate-400">
          <HelpCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p>
            <strong>Weryfikacja lokalna:</strong> Płatności w sandboxie mają charakter testowy i nie pobierają prawdziwych środków. Służą walidacji UX systemu transakcyjnego przed podpięciem kluczy Stripe Production API w zmiennych środowiskowych `.env`.
          </p>
        </div>
      </div>

      {/* Chapter Summary */}
      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-400 mt-6">
        <strong className="text-emerald-400 block mb-1">Świetnie!</strong>
        Znasz już zasady działania importu kodu oraz mechanizmu Stripe Checkout. W kolejnym rozdziale zobaczysz, jak krok po kroku wygląda proces lokalizacji i autofixu błędów przy użyciu wbudowanego edytora kodu.
      </div>

    </div>
  );
};
