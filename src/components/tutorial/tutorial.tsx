import React, { useState } from "react";
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  CheckCircle, 
  HelpCircle, 
  Info, 
  Shield, 
  Layers, 
  Zap, 
  Terminal, 
  X
} from "lucide-react";

// Import subcomponents
import { IntroductionTab } from "./IntroductionTab";
import { ScanningPricingTab } from "./ScanningPricingTab";
import { AutofixFlowTab } from "./AutofixFlowTab";
import { SqlTerminalTab } from "./SqlTerminalTab";
import { GcpAuthTab } from "./GcpAuthTab";
import { AIPromptsTab } from "./AIPromptsTab";
import { ComponentsTab } from "./ComponentsTab";

interface TutorialPortalProps {
  onClose: () => void;
}

export const TutorialPortal: React.FC<TutorialPortalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<string>("intro");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Keep track of read chapters in state
  const [readChapters, setReadChapters] = useState<string[]>(["intro"]);

  const chapters = [
    { id: "intro", title: "1. Wprowadzenie do Platformy", desc: "Zasady analizy AST oraz architektura systemu", component: <IntroductionTab /> },
    { id: "scan", title: "2. Skanowanie i Cennik Stripe", desc: "Wgrywanie ZIP, repozytoria i płatności", component: <ScanningPricingTab /> },
    { id: "fix", title: "3. Autofix Flow & Mini Editor", desc: "Podświetlanie linii i nakładanie poprawek", component: <AutofixFlowTab /> },
    { id: "sql", title: "4. SQL Sandbox & Terminal", desc: "Odpytywanie wirtualnej bazy danych", component: <SqlTerminalTab /> },
    { id: "gcp", title: "5. Google Cloud Auth", desc: "Konfiguracja poświadczeń ADC i API", component: <GcpAuthTab /> },
    { id: "ai", title: "6. AI Oracle Prompting", desc: "Schematy promptów i structured outputs", component: <AIPromptsTab /> },
    { id: "components", title: "7. Spis Komponentów (A-Z)", desc: "Dokumentacja i zadania plików z components/", component: <ComponentsTab /> }
  ];

  const handleMarkAsRead = (id: string) => {
    if (!readChapters.includes(id)) {
      setReadChapters(prev => [...prev, id]);
    }
  };

  const progressPercentage = Math.round((readChapters.length / chapters.length) * 100);

  // Simple keyword matching for search query
  const filteredChapters = chapters.filter(chap => {
    const query = searchQuery.toLowerCase();
    return chap.title.toLowerCase().includes(query) || 
           chap.desc.toLowerCase().includes(query) ||
           chap.id.toLowerCase().includes(query);
  });

  return (
    <div className="fixed inset-0 bg-[#030307]/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6 md:p-8 animate-in fade-in duration-200">
      
      {/* Decorative Glowing Orbs behind the Modal */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="bg-[#090911] border border-slate-900 rounded-3xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-250 text-left">
        
        {/* Header Block */}
        <div className="px-6 py-4 bg-[#05050a] border-b border-slate-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2.5 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-inner">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Baza Wiedzy CodeScope (A-Z)
                <span className="text-[9px] font-mono font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest">
                  Google Dev Style
                </span>
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Interaktywny panel przewodników technicznych oraz dokumentacji interfejsu API</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Wyszukaj temat..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950/60 border border-slate-900 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none w-48 transition-colors shadow-inner"
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-slate-850 hover:border-slate-700"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Reading Progress Bar */}
        <div className="h-1 bg-slate-900 shrink-0 relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Portal Body Layout */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Left Sidebar navigation */}
          <div className="w-72 bg-[#05050a]/40 border-r border-slate-900 p-5 overflow-y-auto hidden md:block shrink-0">
            <div className="flex justify-between items-center mb-4 pl-2">
              <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase">Spis Treści</span>
              <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{progressPercentage}% PRZECZYTANE</span>
            </div>
            
            <div className="flex flex-col gap-2">
              {filteredChapters.map(chap => {
                const isRead = readChapters.includes(chap.id);
                const isActive = activeTab === chap.id;
                return (
                  <button
                    key={chap.id}
                    onClick={() => {
                      setActiveTab(chap.id);
                      handleMarkAsRead(chap.id);
                    }}
                    className={`w-full text-left p-3 rounded-2xl text-xs font-semibold flex flex-col gap-1 transition-all border cursor-pointer select-none ${
                      isActive 
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25 shadow-md shadow-indigo-950/20' 
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-950/50 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="truncate">{chap.title}</span>
                      {isRead && <CheckCircle size={11} className="text-emerald-450 text-emerald-400 shrink-0 ml-1.5" />}
                    </div>
                    <span className="text-[9px] text-slate-500 font-normal leading-relaxed truncate">{chap.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-[#090911]/30">
            {/* Render Active Chapter component */}
            {chapters.find(c => c.id === activeTab)?.component || (
              <div className="flex flex-col justify-center items-center h-full text-slate-500">
                <HelpCircle size={40} className="mb-4 text-indigo-500/30 animate-pulse" />
                <span className="text-sm">Nie znaleziono wybranego rozdziału dokumentacji.</span>
              </div>
            )}

            {/* Bottom Navigation Buttons */}
            <div className="mt-12 pt-6 border-t border-slate-900 flex justify-between items-center gap-4">
              <button
                disabled={activeTab === chapters[0].id}
                onClick={() => {
                  const idx = chapters.findIndex(c => c.id === activeTab);
                  if (idx > 0) {
                    const prevId = chapters[idx - 1].id;
                    setActiveTab(prevId);
                    handleMarkAsRead(prevId);
                  }
                }}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-950 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                Poprzedni
              </button>
              
              <button
                onClick={() => {
                  const idx = chapters.findIndex(c => c.id === activeTab);
                  if (idx < chapters.length - 1) {
                    const nextId = chapters[idx + 1].id;
                    setActiveTab(nextId);
                    handleMarkAsRead(nextId);
                  } else {
                    onClose();
                  }
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-97"
              >
                {activeTab === chapters[chapters.length - 1].id ? "Ukończ poradnik" : "Następny rozdział"}
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

        </div>

        {/* Modal Status Footer */}
        <div className="px-6 py-3.5 bg-[#05050a] border-t border-slate-900 flex justify-between items-center shrink-0 text-[10px] text-slate-500 select-none font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <CheckCircle size={12} className="text-indigo-400" />
              Skończone rozdziały: {readChapters.length} / {chapters.length}
            </span>
          </div>
          <span>CodeScope Google Dev documentation hub v2.4</span>
        </div>

      </div>

    </div>
  );
};
