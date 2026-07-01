import React from "react";
import { Info, HelpCircle, Layers, ShieldCheck, Zap, Terminal, FileCode, CheckSquare, Shield, Lock } from "lucide-react";

export const GcpAuthTab: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-300 font-sans text-xs md:text-sm leading-relaxed max-w-none text-left">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-slate-900 bg-gradient-to-r from-indigo-950/40 via-indigo-950/10 to-transparent">
        <div className="absolute top-0 right-0 w-64 h-full bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">ROZDZIAŁ 5</span>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-3 tracking-tight">Google Cloud SDK Authentication Guide</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-3xl">
            Przewodnik po autoryzacji bibliotek klienckich Google Cloud. Poznaj różnice między poświadczeniami ADC a bezpośrednim przekazywaniem kluczy API.
          </p>
        </div>
      </div>

      {/* Section 1: Co to jest ADC? */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Shield size={16} className="text-indigo-400" />
          5.1 Zrozumienie Application Default Credentials (ADC)
        </h3>
        <p>
          Większość oficjalnych bibliotek klienckich Google Cloud (np. `@google-cloud/storage`, `google-cloud-vision`) nie wymaga jawnego podawania kluczy czy haseł bezpośrednio w kodzie źródłowym. Zamiast tego stosuje się standard **Application Default Credentials (ADC)**.
        </p>
        <p>
          ADC to elastyczny mechanizm, w którym biblioteka automatycznie szuka poświadczeń w określonej hierarchii lokalizacji:
        </p>
        <ol className="list-decimal pl-5 space-y-2.5 text-xs text-slate-400">
          <li>
            <strong className="text-white">Zmienna środowiskowa `GOOGLE_APPLICATION_CREDENTIALS`:</strong> Jeśli zmienna ta jest ustawiona, biblioteka załaduje plik JSON ze wskazanego adresu na dysku.
          </li>
          <li>
            <strong className="text-white">Poświadczenia deweloperskie gcloud CLI:</strong> Wygenerowane poleceniem logowania lokalnego na komputerze programisty.
          </li>
          <li>
            <strong className="text-white">Konta usługi powiązane z chmurą:</strong> Jeśli kod działa na maszynie wirtualnej w Google Cloud (np. Compute Engine, GKE, Cloud Run), tożsamość pobierana jest z wbudowanego serwera metadanych.
          </li>
        </ol>
      </div>

      {/* Section 2: Konfiguracja ADC krok po kroku */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Terminal size={16} className="text-cyan-400" />
          5.2 Lokalne Konfigurowanie Poświadczeń przez CLI
        </h3>
        <p>
          Aby biblioteki klienckie działały na Twoim lokalnym komputerze bez błędów typu `Forbidden` lub `Missing Credentials`:
        </p>
        
        <div className="space-y-4 mt-2">
          <div className="flex gap-4">
            <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded h-fit shrink-0">KROK 1</span>
            <div>
              <strong className="text-white text-xs block">Zainstaluj Google Cloud CLI</strong>
              <p className="text-xs text-slate-450 mt-1">
                Pobierz i zainstaluj paczkę gcloud SDK odpowiednią dla swojego systemu operacyjnego (Windows/macOS/Linux).
              </p>
            </div>
          </div>

          <div className="flex gap-4 border-t border-slate-900 pt-4">
            <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded h-fit shrink-0">KROK 2</span>
            <div>
              <strong className="text-white text-xs block">Autoryzuj sesję lokalną</strong>
              <p className="text-xs text-slate-450 mt-1">
                Uruchom w swoim terminalu poniższe polecenie:
                <code className="bg-slate-950 px-2 py-1.5 rounded text-indigo-400 font-mono text-[10px] mt-1.5 block">
                  gcloud auth application-default login
                </code>
              </p>
            </div>
          </div>

          <div className="flex gap-4 border-t border-slate-900 pt-4">
            <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded h-fit shrink-0">KROK 3</span>
            <div>
              <strong className="text-white text-xs block">Zatwierdź logowanie w przeglądarce</strong>
              <p className="text-xs text-slate-450 mt-1">
                System otworzy przeglądarkę internetową, prosząc Cię o zalogowanie na swoje konto Google Cloud i przyznanie uprawnień deweloperskich. Poświadczenia zostaną automatycznie zapisane pod adresem `%APPDATA%\gcloud\application_default_credentials.json` (w systemie Windows).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Klucze API */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Lock size={16} className="text-amber-400" />
          5.3 Bezpośrednie Użycie Kluczy API (API Keys)
        </h3>
        <p>
          W niektórych przypadkach (np. integracja z Speech-to-Text lub Translation API z poziomu klienta mobilnego/webowego) biblioteki wspierają bezpośrednie przekazywanie klucza API (`ApiKey`).
        </p>
        <p>
          Ta metoda polega na jawnym zadeklarowaniu klucza przy tworzeniu obiektu klienta, np. w Node.js:
          <br />
          <code className="bg-slate-950 px-2.5 py-1.5 rounded text-cyan-400 font-mono text-[10px] mt-1.5 inline-block">
            {"const client = new LanguageServiceClient({ apiKey: 'TWÓJ_KLUCZ_API' });"}
          </code>
        </p>

        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex gap-3 text-xs text-slate-400">
          <Info size={16} className="text-rose-500 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <strong className="text-rose-400 block mb-1">Ostrzeżenie o bezpieczeństwie:</strong>
            Nigdy nie wpisuj kluczy API na sztywno do kodu źródłowego (tzw. hardcoded secrets). Zawsze wczytuj je z zewnętrznych zmiennych środowiskowych `.env` lub systemów typu Secret Manager. CodeScope automatycznie wykrywa zahardkodowane klucze API w kodzie jako luki krytyczne!
          </div>
        </div>
      </div>

      {/* Chapter Summary */}
      <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-400 mt-6">
        <strong className="text-emerald-400 block mb-1">Brawo!</strong>
        Ukończyłeś główną ścieżkę szkoleniową. W ostatnim, dodatkowym rozdziale zapoznasz się z koncepcją promptów silnika AI Oracle oraz zasadami inżynierii promptów deweloperskich.
      </div>

    </div>
  );
};
