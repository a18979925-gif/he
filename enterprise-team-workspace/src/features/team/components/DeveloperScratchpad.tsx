import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  StickyNote, X, Copy, Check, Trash2, FileDown, 
  Sparkles, ListTodo, FileCode, CheckSquare, Plus, ChevronDown
} from "lucide-react";
import { toast } from "sonner";

interface ScratchpadNote {
  id: string;
  title: string;
  content: string;
}

const TEMPLATES = [
  {
    name: "📝 Daily Standup",
    content: "## DAILY STANDUP REPORT\n\n**Wczoraj zrobione:**\n- \n**Dzisiejszy plan:**\n- \n**Blokery / Ryzyka:**\n- Brak"
  },
  {
    name: "🐛 Bug Report Template",
    content: "## RAPORT BŁĘDU\n\n**Opis błędu:** \n\n**Kroki do reprodukcji:**\n1. \n2. \n\n**Oczekiwane zachowanie:** \n\n**Rzeczywiste zachowanie:** "
  },
  {
    name: "✅ TODO Checklist",
    content: "## SPRINT CHECKLIST\n\n- [ ] [Zadanie 1] Przegląd kodu API\n- [ ] [Zadanie 2] Wdrożenie poprawek UI\n- [ ] [Zadanie 3] Testy regresyjne klastra\n- [ ] [Zadanie 4] Aktualizacja dokumentacji"
  },
  {
    name: "💻 JSON Config Snippet",
    content: "{\n  \"env\": \"production\",\n  \"serviceName\": \"aws-ecs-micro-cluster\",\n  \"autoDeploy\": true,\n  \"ports\": [3000],\n  \"allowedRoles\": [\"owner\", \"admin\", \"developer\"]\n}"
  }
];

export const DeveloperScratchpad: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState("note-1");
  const [notes, setNotes] = useState<ScratchpadNote[]>([
    { id: "note-1", title: "Szkicownik A", content: "Witaj w Podręcznym Szkicowniku Dewelopera!\n\nWpisz tutaj swoje tymczasowe uwagi, fragmenty kodu lub notatki ze spotkań.\nZapisywanie odbywa się automatycznie w localStorage." },
    { id: "note-2", title: "Zadania/Notatki B", content: "## Druga notatka robocza\n\nSzybkie linki / Snippety:\n- localhost:3000/api/health\n- git commit -m \"refactor: optimize rendering and state sync\"" },
    { id: "note-3", title: "Checklist", content: "## DO ZROBIENIA DZIŚ:\n\n- [ ] Sprawdzić logi audytowe pod kątem integracji\n- [ ] Wygenerować nowy klucz API dla telemetry\n- [ ] Zatwierdzić Pull Request" }
  ]);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedNotes = localStorage.getItem("dev_scratchpad_notes");
    const savedActiveId = localStorage.getItem("dev_scratchpad_active_id");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Failed to load scratchpad notes", e);
      }
    }
    if (savedActiveId) {
      setActiveNoteId(savedActiveId);
    }
  }, []);

  // Save to local storage
  const saveNotes = (updatedNotes: ScratchpadNote[]) => {
    setNotes(updatedNotes);
    localStorage.setItem("dev_scratchpad_notes", JSON.stringify(updatedNotes));
  };

  const handleContentChange = (content: string) => {
    const updated = notes.map(note => 
      note.id === activeNoteId ? { ...note, content } : note
    );
    saveNotes(updated);
  };

  const handleTitleChange = (title: string) => {
    const updated = notes.map(note => 
      note.id === activeNoteId ? { ...note, title: title.substring(0, 24) } : note
    );
    saveNotes(updated);
  };

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeNote.content);
    setCopied(true);
    toast.success("Skopiowano notatkę do schowka!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm("Czy na pewno chcesz wyczyścić bieżącą notatkę?")) {
      const updated = notes.map(note => 
        note.id === activeNoteId ? { ...note, content: "" } : note
      );
      saveNotes(updated);
      toast.info("Notatka wyczyszczona.");
    }
  };

  const handleDownload = () => {
    try {
      const element = document.createElement("a");
      const file = new Blob([activeNote.content], { type: "text/plain;charset=utf-8" });
      element.href = URL.createObjectURL(file);
      element.download = `${activeNote.title.toLowerCase().replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Pomyślnie pobrano notatkę!");
    } catch (err: any) {
      toast.error("Błąd zapisu pliku: " + err.message);
    }
  };

  const applyTemplate = (templateContent: string) => {
    const updated = notes.map(note => 
      note.id === activeNoteId ? { ...note, content: templateContent } : note
    );
    saveNotes(updated);
    setShowTemplates(false);
    toast.success("Wklejono gotowy szablon struktury!");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 border border-slate-700 cursor-pointer relative group"
        id="dev-scratchpad-trigger"
        title="Szkicownik deweloperski"
      >
        <StickyNote className="h-5 w-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-indigo-500 border-2 border-white animate-pulse"></span>
      </motion.button>

      {/* Expanded Scratchpad Card Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-80 rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-md p-4 shadow-2xl text-slate-200 flex flex-col opacity-95 hover:opacity-100 transition-opacity duration-200"
            id="dev-scratchpad-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">Scratchpad</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                >
                  Zwiń
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-slate-500 hover:text-slate-300 transition p-1 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Note Selector Tabs */}
            <div className="flex gap-1 mb-3 bg-slate-900/60 p-1 rounded-lg border border-slate-900">
              {notes.map((note) => {
                const isActive = note.id === activeNoteId;
                return (
                  <button
                    key={note.id}
                    onClick={() => {
                      setActiveNoteId(note.id);
                      localStorage.setItem("dev_scratchpad_active_id", note.id);
                    }}
                    className={`flex-1 py-1 px-1.5 text-center text-[11px] font-bold rounded-md transition-all cursor-pointer truncate ${
                      isActive 
                        ? "bg-slate-800 text-indigo-300 shadow-xs" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {note.title}
                  </button>
                );
              })}
            </div>

            {/* Note Title Input */}
            <div className="mb-2">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-transparent border-b border-transparent hover:border-slate-850 focus:border-indigo-500 py-0.5 text-xs font-bold text-slate-300 focus:outline-hidden transition"
                placeholder="Nazwa notatki..."
              />
            </div>

            {/* Editing Box */}
            <div className="relative">
              <textarea
                value={activeNote.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Wpisz tutaj swoje notatki, checklistę, kod..."
                className="w-full h-56 rounded-lg bg-slate-900 border border-slate-800 p-3 text-xs font-mono leading-relaxed text-slate-300 focus:border-indigo-500 focus:outline-hidden resize-none scrollbar-thin"
              />
            </div>

            {/* Templates Selector */}
            <div className="relative mt-2">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full flex items-center justify-between bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:bg-slate-850 cursor-pointer transition"
              >
                <span className="flex items-center gap-1.5">
                  <ListTodo className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Struktury i szablony</span>
                </span>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${showTemplates ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-10 bottom-full mb-1 left-0 right-0 rounded-lg border border-slate-800 bg-slate-900/95 backdrop-blur-md overflow-hidden shadow-xl"
                  >
                    <div className="divide-y divide-slate-850 text-left">
                      {TEMPLATES.map((tpl, idx) => (
                        <button
                          key={idx}
                          onClick={() => applyTemplate(tpl.content)}
                          className="w-full text-left px-3 py-2 text-xxs font-bold text-slate-300 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                        >
                          {tpl.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Tools Footer */}
            <div className="flex justify-between gap-2 mt-3 pt-3 border-t border-slate-900">
              <button
                onClick={handleClear}
                title="Wyczyść notatkę"
                className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 border border-slate-850 cursor-pointer transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  title="Pobierz jako plik tekstowy"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300 border border-slate-850 cursor-pointer transition"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Zapisz plik</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/10 cursor-pointer transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-white" />
                      <span className="text-[11px]">Skopiowano</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-white" />
                      <span className="text-[11px]">Skopiuj</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
