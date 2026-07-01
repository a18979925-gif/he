import React from "react";
import { Info, HelpCircle, Layers, ShieldCheck, Zap, Terminal, FileCode, CheckSquare, Database } from "lucide-react";

export const SqlTerminalTab: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-300 font-sans text-xs md:text-sm leading-relaxed max-w-none text-left">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-slate-900 bg-gradient-to-r from-cyan-950/30 via-cyan-950/10 to-transparent">
        <div className="absolute top-0 right-0 w-64 h-full bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">ROZDZIAŁ 4</span>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-3 tracking-tight">SQL Sandbox & Terminal</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-3xl">
            Przewodnik po wbudowanej, zautomatyzowanej bazie danych SQL oraz interaktywnej konsoli zapytań deweloperskich.
          </p>
        </div>
      </div>

      {/* Section 1: Koncepcja SQL Sandbox */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Database size={16} className="text-indigo-400" />
          4.1 Wirtualna Baza Danych w Pamięci (RAM DB State)
        </h3>
        <p>
          Większość aplikacji webowych opiera się na relacyjnych bazach danych SQL. CodeScope potrafi wykryć pliki definicji struktur (DDL, pliki migracji SQL, encje JPA/Hibernate/Prisma) podczas parsowania AST i na ich podstawie **automatycznie wygenerować wirtualną bazę danych**.
        </p>
        <p>
          Baza danych działa w pamięci RAM serwera Express i jest powiązana z kontekstem Twojego aktywnego projektu. Zostaje uzupełniona domyślnym, realistycznym zestawem danych testowych (rekordy użytkowników, zamówienia, produkty), aby umożliwić natychmiastowe testowanie operacji CRUD bez konieczności instalowania serwerów MySQL czy PostgreSQL.
        </p>
      </div>

      {/* Section 2: Terminal SQL */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Terminal size={16} className="text-cyan-400" />
          4.2 Interaktywny Terminal Zapytań
        </h3>
        <p>
          Zakładka **SQL Terminal** udostępnia w pełni funkcjonalną konsolę, w której możesz na żywo odpytywać wygenerowaną bazę danych.
        </p>
        <ul className="list-disc pl-5 space-y-2.5 text-xs text-slate-400">
          <li>
            <strong className="text-white">Zapytania SELECT:</strong> Zwracają dane w postaci estetycznych, posortowanych tabel z możliwością stronicowania wyników.
          </li>
          <li>
            <strong className="text-white">Zapytania modyfikujące (INSERT, UPDATE, DELETE):</strong> Wprowadzają trwałe (do czasu restartu/resetu) modyfikacje do stanów tabel oraz raportują liczbę dotkniętych rekordów (`affectedRows`).
          </li>
          <li>
            <strong className="text-white">Odporność na błędy:</strong> Wbudowany interpreter SQL weryfikuje składnię zapytań i w przypadku błędów zwraca dokładny komunikat debugera z silnika SQLite.
          </li>
        </ul>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-400 my-4">
          <strong className="text-white block mb-1">Przykład zapytania testowego:</strong>
          Wpisz w konsoli terminala poniższe zapytanie, aby pobrać listę użytkowników:
          <code className="bg-slate-900 px-2 py-1.5 rounded text-indigo-400 font-mono text-[10px] mt-1.5 block">
            SELECT id, email, role, status FROM users WHERE status = 'active';
          </code>
        </div>
      </div>

      {/* Section 3: Resetowanie bazy i logi */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <FileCode size={16} className="text-emerald-400" />
          4.3 Podgląd Schematu i Przywracanie Stanu Pierwotnego
        </h3>
        <p>
          Wszystkie aktywne tabele bazy danych są w każdej chwili widoczne w zakładce **Database**. Możesz tam podejrzeć zdefiniowane kolumny, ich typy (VARCHAR, INT, TIMESTAMP), klucze główne oraz relacje.
        </p>
        <p>
          Jeśli Twoje zapytania INSERT/DELETE uszkodzą bazę lub chcesz powrócić do domyślnych danych:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-400 text-left">
          <li>W prawym górnym rogu zakładki **Database** kliknij przycisk **Reset Database**.</li>
          <li>Wyśle to żądanie do `/api/sandbox-reset/:projectName`.</li>
          <li>Wszystkie wirtualne tabele zostaną wyczyszczone i ponownie zasilone oryginalnymi paczkami danych testowych, a historia logów w terminalu zostanie zresetowana.</li>
        </ol>
      </div>

      {/* Chapter Summary */}
      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-400 mt-6">
        <strong className="text-emerald-400 block mb-1">Świetnie!</strong>
        Znasz już zasady działania silnika bazodanowego w CodeScope. W ostatnim rozdziale zapoznasz się z instrukcją konfiguracji autentykacji Google Cloud w swoich projektach programistycznych.
      </div>

    </div>
  );
};
