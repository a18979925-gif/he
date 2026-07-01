import React, { useState } from "react";
import { Layers, FileCode, Folder, Info, ChevronDown, ChevronUp, Cpu, Network, Lock, Zap } from "lucide-react";

interface ComponentDetail {
  name: string;
  desc: string;
  type: "Tab View" | "Modal Window" | "Helper Component" | "System Layout";
  icons: string[];
  endpoints: string[];
  complexity: "low" | "medium" | "high";
}

export const ComponentsTab: React.FC = () => {
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);

  const mainComponents: ComponentDetail[] = [
    { 
      name: "AIPresetPrompts.tsx", 
      desc: "Zarządza gotowymi, sprofilowanymi szablonami pytań (promtów) wysyłanymi do AI Oracle.",
      type: "Helper Component",
      icons: ["Sparkles", "Cpu"],
      endpoints: ["Brak bezpośrednich (zmienna lokalna)"],
      complexity: "low"
    },
    { 
      name: "AiRemediationChat.tsx", 
      desc: "Interaktywny czat z asystentem AI, pozwalający na konwersację o konkretnej podatności i generowanie poprawek w czasie rzeczywistym.",
      type: "Tab View",
      icons: ["Send", "MessageSquare", "Bot", "Sparkles"],
      endpoints: ["/api/chat-remediation", "/api/fix-code"],
      complexity: "high"
    },
    { 
      name: "AnalysisTab.tsx", 
      desc: "Zakładka statystyk ogólnych projektu: zawiera podsumowanie stopnia duplikacji kodu, metryki LOC, wskaźniki złożoności oraz analizę długu.",
      type: "Tab View",
      icons: ["Activity", "BarChart2", "PieChart"],
      endpoints: ["/api/project-summary/:projectName"],
      complexity: "medium"
    },
    { 
      name: "ApiTab.tsx", 
      desc: "Eksplorator API wyodrębniający kontrolery sieciowe z kodu. Pozwala na testowanie zapytań HTTP w wirtualnym środowisku runtime.",
      type: "Tab View",
      icons: ["Globe", "Send", "Play"],
      endpoints: ["/api/endpoints/:projectName", "/api/execute-mock-http"],
      complexity: "high"
    },
    { 
      name: "ArchitectureTab.tsx", 
      desc: "Wizualizuje strukturę zależności między modułami, warstwami kodu oraz generuje grafy wywołań funkcji (call graphs).",
      type: "Tab View",
      icons: ["GitBranch", "Network"],
      endpoints: ["/api/call-graph/:projectName"],
      complexity: "high"
    },
    { 
      name: "AuthPage.tsx", 
      desc: "Ekran logowania i rejestracji użytkowników zintegrowany z autentykacją Google/Email w usłudze Firebase Auth.",
      type: "System Layout",
      icons: ["Lock", "Mail", "UserCheck"],
      endpoints: ["Firebase Authentication Services"],
      complexity: "medium"
    },
    { 
      name: "BenchmarkTab.tsx", 
      desc: "Moduł porównujący wydajność parsowania AST i audytów CodeScope z rynkowymi skanerami typu SonarQube czy Snyk.",
      type: "Tab View",
      icons: ["Zap", "TrendingUp"],
      endpoints: ["/api/benchmark-stats"],
      complexity: "medium"
    },
    { 
      name: "CodeHelperTab.tsx", 
      desc: "Wielozadaniowy pomocnik generujący szablony testów jednostkowych (JUnit, Jest, PyTest) oraz dokumentację JSDoc/Javadoc dla zaznaczonych klas.",
      type: "Tab View",
      icons: ["Code", "HelpCircle"],
      endpoints: ["/api/generate-docs", "/api/generate-tests"],
      complexity: "medium"
    },
    { 
      name: "ComplianceTab.tsx", 
      desc: "Weryfikuje zgodność bazy kodowej z międzynarodowymi regulacjami bezpieczeństwa i standardami prawnymi (RODO/GDPR, OWASP ASVS, ISO 27001).",
      type: "Tab View",
      icons: ["ShieldAlert", "FileText"],
      endpoints: ["/api/compliance-check/:projectName"],
      complexity: "medium"
    },
    { 
      name: "CtoSuiteTab.tsx", 
      desc: "Panel zarządczy CTO prezentujący poziom długu technicznego w roboczogodzinach, estymację kosztów refaktoryzacji oraz trendy stabilności.",
      type: "Tab View",
      icons: ["Briefcase", "TrendingDown", "AlertTriangle"],
      endpoints: ["/api/cto-metrics/:projectName"],
      complexity: "high"
    },
    { 
      name: "DashboardTab.tsx", 
      desc: "Główny pulpit nawigacyjny wczytany po analizie, zbierający kluczowe KPI projektu (zdrowie, krytyczne błędy, rozkład języków).",
      type: "Tab View",
      icons: ["LayoutDashboard", "Layers", "Activity"],
      endpoints: ["/api/project-summary/:projectName"],
      complexity: "medium"
    },
    { 
      name: "DatabaseTab.tsx", 
      desc: "Podgląd schematu bazodanowego: rysuje tabele, kolumny, typy danych oraz relacje wykryte w plikach źródłowych DDL.",
      type: "Tab View",
      icons: ["Database", "Map"],
      endpoints: ["/api/db-schema/:projectName"],
      complexity: "medium"
    },
    { 
      name: "DeadCodeTab.tsx", 
      desc: "Skanuje drzewo AST pod kątem martwego kodu (nieużywane zmienne, martwe klasy, nieosiągalne instrukcje return).",
      type: "Tab View",
      icons: ["Trash2", "EyeOff"],
      endpoints: ["/api/dead-code/:projectName"],
      complexity: "high"
    },
    { 
      name: "DependencyTab.tsx", 
      desc: "Analizuje zależności zewnętrzne zadeklarowane w package.json / pom.xml / Cargo.toml i weryfikuje je z bazami luk bezpieczeństwa (CVE).",
      type: "Tab View",
      icons: ["Package", "ShieldCheck"],
      endpoints: ["/api/dependencies/:projectName"],
      complexity: "medium"
    },
    { 
      name: "DiagnosticsTab.tsx", 
      desc: "Kluczowa tablica diagnostyczna agregująca wszystkie wykryte luki bezpieczeństwa i błędy z opcją przejścia do automatycznej naprawy (Fix).",
      type: "Tab View",
      icons: ["AlertCircle", "Wrench", "Play"],
      endpoints: ["/api/diagnostics/:projectName"],
      complexity: "high"
    },
    { 
      name: "DiffViewer.tsx", 
      desc: "Pomocniczy widok renderujący różnice w kodzie (przed i po) w formacie unified diff podczas akceptowania poprawek.",
      type: "Helper Component",
      icons: ["GitCompare", "Check"],
      endpoints: ["Brak bezpośrednich (stan czysto frontendowy)"],
      complexity: "low"
    },
    { 
      name: "FileTree.tsx", 
      desc: "Renderuje interaktywne, rozwijane drzewo katalogów projektu w lewym pasku eksploratora plików.",
      type: "Helper Component",
      icons: ["FolderPlus", "File"],
      endpoints: ["Brak (dane przekazywane przez Props)"],
      complexity: "medium"
    },
    { 
      name: "FilesTab.tsx", 
      desc: "Eksplorator kodu łączący interaktywne drzewo plików z edytorem CodeViewer oraz panelem manualnej edycji pliku.",
      type: "Tab View",
      icons: ["FolderOpen", "Edit3"],
      endpoints: ["/api/file-content"],
      complexity: "high"
    },
    { 
      name: "GitInsightsTab.tsx", 
      desc: "Analizuje historię commitów Git, identyfikując autorów z największą liczbą wprowadzonych bugów oraz pliki najczęściej modyfikowane (hotspots).",
      type: "Tab View",
      icons: ["GitCommit", "GitBranch", "Users"],
      endpoints: ["/api/git-insights/:projectName"],
      complexity: "medium"
    },
    { 
      name: "LogsStreamTab.tsx", 
      desc: "Strumieniuje w czasie rzeczywistym logi wykonania zapytań HTTP i zapytań SQL z uruchomionych wirtualnych sandboxów.",
      type: "Tab View",
      icons: ["Terminal", "Clock"],
      endpoints: ["/api/logs-ws-stream"],
      complexity: "medium"
    },
    { 
      name: "MainScreen.tsx", 
      desc: "Ekran powitalny aplikacji zawierający opcje wgrywania ZIP, klonowania Git, gotowe szablony i dokumentację.",
      type: "System Layout",
      icons: ["Sparkles", "UploadCloud", "HelpCircle"],
      endpoints: ["/api/recent-projects", "/api/upload-zip", "/api/git-clone"],
      complexity: "medium"
    },
    { 
      name: "MetricsChart.tsx", 
      desc: "Odpowiada za rysowanie wykresów liniowych i kołowych przedstawiających wskaźniki zdrowia, z wykorzystaniem biblioteki Chart.js.",
      type: "Helper Component",
      icons: ["TrendingUp", "Activity"],
      endpoints: ["Brak (pure wrapper)"],
      complexity: "low"
    },
    { 
      name: "PerformanceTab.tsx", 
      desc: "Analizuje kod pod kątem wycieków pamięci, nieoptymalnych pętli, brakujących indeksów SQL oraz blokujących operacji wejścia/wyjścia.",
      type: "Tab View",
      icons: ["Zap", "Gauge"],
      endpoints: ["/api/performance-check/:projectName"],
      complexity: "high"
    },
    { 
      name: "RefactorTab.tsx", 
      desc: "Generuje rekomendacje refaktoryzacyjne: sugeruje podział zbyt dużych funkcji, wydzielenie logiki do osobnych klas oraz uproszczenie warunków.",
      type: "Tab View",
      icons: ["RefreshCw", "Shuffle"],
      endpoints: ["/api/refactor-check/:projectName"],
      complexity: "medium"
    },
    { 
      name: "ReportDashboard.tsx", 
      desc: "Generator eksportowalnych raportów technicznych w formatach PDF, JSON i CSV na potrzeby audytów zewnętrznych.",
      type: "Helper Component",
      icons: ["FileText", "Download"],
      endpoints: ["/api/generate-pdf", "/api/generate-json-report"],
      complexity: "medium"
    },
    { 
      name: "ReportsTab.tsx", 
      desc: "Zarządza historią wygenerowanych raportów i ułatwia ich pobieranie oraz udostępnianie członkom zespołu.",
      type: "Tab View",
      icons: ["Folder", "DownloadCloud"],
      endpoints: ["/api/reports-list/:projectName"],
      complexity: "low"
    },
    { 
      name: "RuntimeTab.tsx", 
      desc: "Panel kontrolny uruchomionego symulatora API: pozwala wysyłać zapytania testowe i podglądać zachowanie mock-serwera.",
      type: "Tab View",
      icons: ["Play", "PlayCircle", "AlertCircle"],
      endpoints: ["/api/runtime-status/:projectName", "/api/runtime-restart"],
      complexity: "high"
    },
    { 
      name: "SecurityTab.tsx", 
      desc: "Tablica skupiona wyłącznie na lukach bezpieczeństwa: grupuje zagrożenia według kategorii OWASP Top 10 (np. XSS, SQLi).",
      type: "Tab View",
      icons: ["Shield", "Lock", "AlertTriangle"],
      endpoints: ["/api/security-audit/:projectName"],
      complexity: "high"
    },
    { 
      name: "SqlTerminalTab.tsx", 
      desc: "Konsola zapytań SQL zintegrowana z wirtualną bazą danych SQLite w pamięci RAM.",
      type: "Tab View",
      icons: ["Terminal", "Database"],
      endpoints: ["/api/sandbox-query/:projectName"],
      complexity: "medium"
    },
    { 
      name: "TimelineTab.tsx", 
      desc: "Oś czasu reprezentująca historię zmian w projekcie (wgranie kodu, kolejne skany, naniesione poprawki deweloperskie).",
      type: "Tab View",
      icons: ["History", "Clock"],
      endpoints: ["/api/timeline/:projectName"],
      complexity: "low"
    },
    { 
      name: "TotalAnalyzeTab.tsx", 
      desc: "Agreguje wyniki cząstkowe ze skanera heurystycznego i modeli AI w celu wyliczenia ostatecznego Health Score.",
      type: "Tab View",
      icons: ["Search", "Activity"],
      endpoints: ["/api/total-analyze/:projectName"],
      complexity: "medium"
    },
    { 
      name: "UploadSection.tsx", 
      desc: "Kontener formularza wgrywania archiwów ZIP na stronie głównej z kalkulatorem wycen Stripe.",
      type: "Helper Component",
      icons: ["Upload", "CreditCard"],
      endpoints: ["/api/stripe-checkout-session"],
      complexity: "medium"
    },
    { 
      name: "UploadZone.tsx", 
      desc: "Uproszczona, archiwalna wersja ekranu powitalnego zastąpiona przez nowoczesny MainScreen.tsx.",
      type: "System Layout",
      icons: ["FolderPlus"],
      endpoints: ["Brak (deprecated)"],
      complexity: "low"
    }
  ];

  const subDirectories: ComponentDetail[] = [
    { 
      name: "files/CodeViewer.tsx", 
      desc: "Główny czytnik kodu. Odpowiada za podświetlanie składni, rysowanie guttera z markerami ostrzeżeń, renderowanie trybu edycji oraz integrację z Apply Fix.",
      type: "Helper Component",
      icons: ["Code", "Edit", "Play"],
      endpoints: ["/api/save-file", "/api/fix-code"],
      complexity: "high"
    },
    { 
      name: "files/DiffViewer.tsx", 
      desc: "Wyświetla graficzne porównanie linii kodu przed i po nałożeniu sugerowanej poprawki bezpieczeństwa.",
      type: "Helper Component",
      icons: ["GitCompare"],
      endpoints: ["Brak"],
      complexity: "low"
    },
    { 
      name: "layout/Header.tsx", 
      desc: "Pasek górny aplikacji: wyświetla logo, informacje o zalogowanym użytkowniku Firebase oraz powiadomienia systemowe.",
      type: "System Layout",
      icons: ["Bell", "User", "LogOut"],
      endpoints: ["Firebase Auth services"],
      complexity: "low"
    },
    { 
      name: "layout/Sidebar.tsx", 
      desc: "Pasek boczny nawigacji tabów: pozwala przełączać się między pulpitem, plikami, diagnostyką, bazą danych i innymi widokami.",
      type: "System Layout",
      icons: ["Menu", "ChevronLeft"],
      endpoints: ["Brak (lokalne przekierowania stanów)"],
      complexity: "low"
    },
    { 
      name: "layout/SettingsDrawer.tsx", 
      desc: "Wysuwany panel ustawień: konfiguruje filtry wyświetlania błędów, klucze API modeli Gemini oraz opcje analizatora.",
      type: "System Layout",
      icons: ["Settings", "Sliders"],
      endpoints: ["/api/save-settings"],
      complexity: "medium"
    }
  ];

  const toggleExpand = (name: string) => {
    setExpandedComponent(prev => (prev === name ? null : name));
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case "high": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: return "text-emerald-450 text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  const renderComponentCard = (comp: ComponentDetail) => {
    const isExpanded = expandedComponent === comp.name;
    return (
      <div 
        key={comp.name} 
        onClick={() => toggleExpand(comp.name)}
        className={`p-4 rounded-2xl bg-slate-950 border transition-all cursor-pointer select-none text-left ${
          isExpanded 
            ? "border-indigo-500/40 bg-indigo-950/5 shadow-md shadow-indigo-950/30" 
            : "border-slate-900/60 hover:border-slate-800"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileCode size={14} className={isExpanded ? "text-indigo-400 animate-pulse" : "text-cyan-400"} />
            <span className="font-mono font-extrabold text-white text-xs">{comp.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-black uppercase text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
              {comp.type}
            </span>
            {isExpanded ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-500" />}
          </div>
        </div>

        {/* Collapsible details panel */}
        {isExpanded ? (
          <div className="mt-3.5 pt-3.5 border-t border-slate-900/80 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <p className="text-xs text-slate-350 leading-relaxed font-normal">{comp.desc}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[10px] font-mono">
              <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-900">
                <span className="text-slate-500 block mb-1">KOMPLEKSOWOŚĆ</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase inline-block ${getComplexityColor(comp.complexity)}`}>
                  {comp.complexity}
                </span>
              </div>
              <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-900">
                <span className="text-slate-500 block mb-1">MOCK ENDPOINTY API</span>
                <div className="text-slate-300 font-semibold truncate">
                  {comp.endpoints.map((ep, i) => <div key={i} className="truncate">{ep}</div>)}
                </div>
              </div>
              <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-900">
                <span className="text-slate-500 block mb-1">IKONY / MODUŁY</span>
                <span className="text-indigo-400 font-bold truncate block">
                  {comp.icons.join(", ")}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-450 mt-1.5 truncate pl-6">{comp.desc}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 text-slate-300 font-sans text-xs md:text-sm leading-relaxed max-w-none text-left">
      
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-slate-900 bg-gradient-to-r from-indigo-950/40 via-indigo-950/10 to-transparent">
        <div className="absolute top-0 right-0 w-64 h-full bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">DODATEK</span>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-3 tracking-tight">Interaktywny Spis Komponentów</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-3xl">
            Kliknij na dowolny plik z listy, aby wysunąć jego specyfikację techniczną, poziom skomplikowania, ikony oraz wywoływane endpointy.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 text-xs text-slate-400">
        <Info size={16} className="text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
        <p>
          <strong>Instrukcja obsługi:</strong> Lista podzielona jest na katalog główny oraz podkatalogi. Kliknięcie w kartę komponentu otwiera podgląd z analizą kompleksowości oraz mapą połączeń API.
        </p>
      </div>

      {/* Main Folder Components */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Folder size={16} className="text-indigo-400" />
          Katalog Główny (src/components/*)
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {mainComponents.map(renderComponentCard)}
        </div>
      </div>

      {/* Subdirectories */}
      <div className="space-y-3 pt-6">
        <h3 className="text-base font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
          <Folder size={16} className="text-emerald-400" />
          Podkatalogi (files/, layout/)
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {subDirectories.map(renderComponentCard)}
        </div>
      </div>

    </div>
  );
};
