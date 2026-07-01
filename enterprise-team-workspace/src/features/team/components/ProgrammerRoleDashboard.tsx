import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Member } from "../types/member";
import { Project } from "../types/team";
import { 
  Eye, Heart, Sparkles, Code, Play, FolderPlus, UploadCloud, Save, Trash2, 
  RefreshCw, Layers, CheckSquare, Plus, Check, ChevronRight, FileCode, Video, 
  ExternalLink, Download, Copy, AlertCircle, Laptop, Settings, ArrowRight, Star, FileText, Info
} from "lucide-react";
import { toast } from "sonner";
import { EpicLoginPreview } from "./EpicLoginPreview";
import { useFirebaseTeam } from "../context/FirebaseTeamContext";

interface ProgrammerRoleDashboardProps {
  activeMember: Member | null;
  projects: Project[];
}

interface Asset {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | "zip" | "github" | "figma" | "youtube";
  size: string;
  uploadedAt: string;
}

const INITIAL_ASSETS: Asset[] = [
  { id: "ast_1", name: "banner_landing.png", type: "image", size: "1.4 MB", uploadedAt: "2026-06-28" },
  { id: "ast_2", name: "demo_screencast.mp4", type: "video", size: "14.2 MB", uploadedAt: "2026-06-29" },
  { id: "ast_3", name: "api_spec_v2.pdf", type: "pdf", size: "312 KB", uploadedAt: "2026-06-25" },
  { id: "ast_4", name: "deployment_package.zip", type: "zip", size: "4.8 MB", uploadedAt: "2026-06-30" },
  { id: "ast_5", name: "github.com/synthetix-core", type: "github", size: "Repo URL", uploadedAt: "2026-06-20" }
];

interface Snapshot {
  version: string;
  createdAt: string;
  author: string;
  comment: string;
}

const INITIAL_SNAPSHOTS: Snapshot[] = [
  { version: "v0.1", createdAt: "2026-06-15 14:30", author: "Marcin", comment: "Inicjalizacja kodu, szkielet routingu i bazy" },
  { version: "v0.2", createdAt: "2026-06-22 11:15", author: "Marcin", comment: "Dodano middleware do autoryzacji oraz style Tailwind" },
  { version: "v1.0", createdAt: "2026-06-30 18:40", author: "System", comment: "Wydanie stabilne z pełną odpornością kwantową" }
];

export const ProgrammerRoleDashboard: React.FC<ProgrammerRoleDashboardProps> = ({
  activeMember,
  projects
}) => {
  const { createProject } = useFirebaseTeam();

  const handleCreateProject = async () => {
    const name = window.prompt("Podaj nazwę nowego projektu:");
    if (!name) return;
    const desc = window.prompt("Podaj krótki opis projektu:");
    if (desc === null) return;
    
    try {
      await createProject(name, desc, ["React", "TypeScript"]);
      toast.success(`Projekt "${name}" został pomyślnie utworzony!`);
    } catch (err: any) {
      toast.error("Błąd tworzenia projektu: " + err.message);
    }
  };

  // Navigation inside Programmer sub-tabs
  const [progTab, setProgTab] = useState<"projects" | "editor" | "assets" | "publish">("projects");

  // Project select for programmer operations
  const [selectedProjId, setSelectedProjId] = useState<string>("proj_1");
  const [draftState, setDraftState] = useState<"private" | "invited_only" | "public">("private");

  // Editor Split states
  const [editorWidth, setEditorWidth] = useState<"50-50" | "70-30" | "100-0">("50-50");
  
  // Workspace multi-file support
  const [activeFile, setActiveFile] = useState<"index.ts" | "EpicLogin.tsx">("EpicLogin.tsx");
  const [fileContents, setFileContents] = useState({
    "index.ts": `// PROGRAMMER ACTIVE PROJECT ENVIRONMENT
import { createServer } from "http";
import { analyzeAnomalies } from "./security/ai";

const PORT = process.env.PORT || 3000;

export function runMainServer() {
  console.log("[SERVER] Uruchomiono na porcie " + PORT);
  
  // Automatyczny system wczesnego ostrzegania
  analyzeAnomalies({
    threatLevel: "CRITICAL",
    autoQuarantine: true
  });
}`,
    "EpicLogin.tsx": `// EPIC GAMES AUTHENTICATION MODULE - HIGH FIDELITY
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, CheckCircle } from "lucide-react";

export default function EpicLogin() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email");

  return (
    <div className="epic-login-card bg-[#18181c] p-8 rounded-2xl border border-zinc-850 shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-6">Zaloguj się do Epic Games</h2>
      {/* Dynamic forms & SSO OAuth callbacks here */}
    </div>
  );
}`
  });

  const [previewTab, setPreviewTab] = useState<"terminal" | "app">("app");
  const [compiling, setCompiling] = useState(false);

  // Asset list state
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetType, setNewAssetType] = useState<Asset["type"]>("image");

  // Snapshot lists
  const [snapshots, setSnapshots] = useState<Snapshot[]>(INITIAL_SNAPSHOTS);
  const [snapshotComment, setSnapshotComment] = useState("");

  // Publish Flow Steps (Create -> Edit -> Validate -> Publish -> Add to Lobby -> Public)
  const [publishStep, setPublishStep] = useState<number>(3); // currently at "Validate" step

  const activeProjectDetails = projects.find(p => p.id === selectedProjId) || projects[0];

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotComment.trim()) return;

    const newVer = `v1.${snapshots.length - 1}`;
    const newSnap: Snapshot = {
      version: newVer,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      author: activeMember?.name || "Programmer",
      comment: snapshotComment
    };

    setSnapshots(prev => [...prev, newSnap]);
    setSnapshotComment("");
    toast.success(`Utworzono migawkę wersji ${newVer}! (Mikrocopy: Przywróć wersję)`);
  };

  const handleRestoreSnapshot = (version: string) => {
    toast.success(`Pomyślnie przywrócono stan z migawki wersji ${version}.`);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;

    const newAsset: Asset = {
      id: "ast_" + Math.random().toString(36).substring(2, 9),
      name: newAssetName,
      type: newAssetType,
      size: newAssetType === "github" || newAssetType === "figma" ? "URL" : "1.2 MB",
      uploadedAt: new Date().toISOString().substring(0, 10)
    };

    setAssets(prev => [...prev, newAsset]);
    setNewAssetName("");
    toast.success(`Dodano nowy zasób: ${newAssetName}`);
  };

  const handleDeleteAsset = (id: string, name: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    toast.info(`Usunięto zasób "${name}"`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Programmer KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Odsłony (Views)</p>
          <p className="text-xl font-bold text-slate-800 mt-1">1,245</p>
          <span className="text-[9px] text-emerald-500 font-bold">+12% dzisiaj</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Obserwujący</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">348</p>
          <span className="text-[9px] text-slate-400 font-medium">Baza organiczna</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Moje Projekty</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{projects.length}</p>
          <span className="text-[9px] text-indigo-500 font-bold">Wersje: v1.0, v0.2</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Zaproszenia</p>
          <p className="text-xl font-bold text-amber-600 mt-1">2 aktywne</p>
          <span className="text-[9px] text-amber-500 font-bold">Oczekuje na akcję</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Gwiazdki (Stars)</p>
          <p className="text-xl font-bold text-slate-800 mt-1">94</p>
          <span className="text-[9px] text-emerald-500 font-bold">+4 w tym tygodniu</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-center items-center">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Profil (Completion)</p>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "85%" }} />
          </div>
          <span className="text-[9px] text-slate-500 mt-1 font-bold">85% gotowy</span>
        </div>
      </div>

      {/* 2. Sub-tab Selection Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-extrabold text-slate-800">Panel Twórcy (Programmer Dashboard)</h2>
        </div>

        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setProgTab("projects")}
            className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
              progTab === "projects" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Moje Projekty
          </button>
          <button
            onClick={() => setProgTab("editor")}
            className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
              progTab === "editor" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Szybki Edytor & Podgląd
          </button>
          <button
            onClick={() => setProgTab("assets")}
            className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
              progTab === "assets" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Menedżer Zasobów
          </button>
          <button
            onClick={() => setProgTab("publish")}
            className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
              progTab === "publish" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Publikacja & Snapshots
          </button>
        </div>
      </div>

      {/* 3. Dynamic Sub-tab Render */}
      <AnimatePresence mode="wait">
        <motion.div
          key={progTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          
          {/* A. MY PROJECTS TAB */}
          {progTab === "projects" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Przypisane & Własne Projekty</h3>
                <button 
                  onClick={handleCreateProject}
                  className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 text-xxs font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>Nowy projekt</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div 
                    key={proj.id} 
                    className={`rounded-2xl border bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                      selectedProjId === proj.id ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-200"
                    }`}
                    onClick={() => setSelectedProjId(proj.id)}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
                          Wersja: 1.0.3
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold font-mono">
                          Publiczny
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{proj.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-normal line-clamp-3 mt-1">{proj.description}</p>
                      
                      <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Aktualizacja: 2 godz. temu</span>
                        <span className="text-indigo-600 font-bold">Otwarte zadania: 4</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" alt="" />
                        <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" alt="" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjId(proj.id);
                          setProgTab("editor");
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-extrabold text-[10px] flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Otwórz edytor</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* B. EDITOR SPLIT VIEW */}
          {progTab === "editor" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4.5 w-4.5 text-indigo-500 font-bold shrink-0" />
                  <span className="text-xs font-bold text-slate-400 uppercase mr-1">Workspace:</span>
                  <div className="flex gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setActiveFile("index.ts")}
                      className={`px-3 py-1 rounded-md text-xxs font-mono font-bold transition-all cursor-pointer ${
                        activeFile === "index.ts" ? "bg-slate-900 text-slate-100 shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      index.ts
                    </button>
                    <button
                      onClick={() => setActiveFile("EpicLogin.tsx")}
                      className={`px-3 py-1 rounded-md text-xxs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeFile === "EpicLogin.tsx" ? "bg-slate-900 text-slate-100 shadow-xs font-extrabold" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>EpicLogin.tsx</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Siatka ekranu:</span>
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border">
                    <button 
                      onClick={() => setEditorWidth("50-50")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${editorWidth === "50-50" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
                    >
                      50/50
                    </button>
                    <button 
                      onClick={() => setEditorWidth("70-30")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${editorWidth === "70-30" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
                    >
                      70/30
                    </button>
                    <button 
                      onClick={() => setEditorWidth("100-0")}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${editorWidth === "100-0" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500"}`}
                    >
                      100%
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setCompiling(true);
                      toast.loading(`Kompilowanie ${activeFile}... Przygotowywanie kontenera deweloperskiego.`, { id: "compile-toast" });
                      setTimeout(() => {
                        setCompiling(false);
                        setPreviewTab("app");
                        toast.success(`Moduł ${activeFile} pomyślnie uruchomiony w piaskownicy deweloperskiej!`, {
                          id: "compile-toast",
                          description: "Uruchomiono na porcie 3000 // Zewnętrzny tunel aktywny."
                        });
                      }, 1000);
                    }}
                    className="h-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md px-2.5 text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Uruchom podgląd</span>
                  </button>
                </div>
              </div>

              {/* Real Interactive Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Editor Box */}
                <div className={`${
                  editorWidth === "50-50" ? "lg:col-span-6" : 
                  editorWidth === "70-30" ? "lg:col-span-7" : 
                  "lg:col-span-12"
                } border border-slate-200 rounded-2xl bg-slate-900 overflow-hidden flex flex-col shadow-sm transition-all duration-300`}>
                  <div className="bg-slate-950 px-4 py-2 border-b border-slate-850 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                      <span>{activeFile}</span>
                    </div>
                    <span>{activeFile.endsWith(".tsx") ? "React TSX Component" : "Node.js / TypeScript"}</span>
                  </div>

                  <div className="p-4 bg-slate-900 flex-1 min-h-[450px] font-mono text-xs text-slate-300 leading-relaxed flex gap-3">
                    <div className="text-slate-600 text-right select-none pr-2 border-r border-slate-800/80">
                      {fileContents[activeFile].split("\n").map((_, idx) => (
                        <div key={idx}>{idx + 1}</div>
                      ))}
                    </div>
                    <textarea 
                      value={fileContents[activeFile]}
                      onChange={(e) => setFileContents(prev => ({ ...prev, [activeFile]: e.target.value }))}
                      className="flex-1 bg-transparent text-slate-100 focus:outline-hidden resize-none min-h-[450px] font-mono text-xs w-full p-0 border-0 focus:ring-0 whitespace-pre overflow-y-auto"
                      spellCheck={false}
                    />
                  </div>
                  
                  <div className="bg-slate-950 p-2 border-t border-slate-850 flex justify-between items-center text-xxs font-mono text-slate-500 px-4">
                    <span>Linie: {fileContents[activeFile].split("\n").length}</span>
                    <button 
                      onClick={() => toast.success("Zmiany w kodzie zapisane lokalnie w pamięci roboczej klastra!")}
                      className="flex items-center gap-1 text-indigo-400 font-bold hover:text-indigo-300 cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Zapisz plik</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Box (shown only if width is not 100%) */}
                {editorWidth !== "100-0" && (
                  <div className={`${
                    editorWidth === "50-50" ? "lg:col-span-6" : "lg:col-span-5"
                  } border border-slate-200 rounded-2xl bg-white overflow-hidden flex flex-col shadow-sm transition-all duration-300`}>
                    
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2 font-semibold">
                        <Laptop className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                        <span>Podgląd Live</span>
                      </div>

                      {/* Mode Toggles */}
                      <div className="flex gap-1 bg-slate-200/60 p-0.5 rounded-lg border border-slate-300/40">
                        <button
                          onClick={() => setPreviewTab("app")}
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                            previewTab === "app" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Aplikacja</span>
                        </button>
                        <button
                          onClick={() => setPreviewTab("terminal")}
                          className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                            previewTab === "terminal" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <span>Logi systemu</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 bg-[#121212] overflow-hidden flex flex-col relative min-h-[450px]">
                      
                      {/* Compiler Overlay */}
                      <AnimatePresence>
                        {compiling && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/95 z-20 flex flex-col justify-center items-center text-center space-y-3 p-6"
                          >
                            <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                            <p className="text-xs font-mono text-indigo-400">Pomyślna autokompilacja...</p>
                            <p className="text-[10px] font-mono text-slate-500">Transpilacja modułów TSX i uruchamianie silnika Vite HMR na porcie 3000</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {previewTab === "app" ? (
                        <div className="flex-1 overflow-auto bg-[#121212] flex flex-col">
                          <EpicLoginPreview />
                        </div>
                      ) : (
                        <div className="p-4 flex-1 font-mono text-[10px] leading-relaxed text-slate-300 space-y-1 bg-slate-950 overflow-y-auto">
                          <div className="text-indigo-400">[SYSTEM] Initializing telemetry virtual-node-1a...</div>
                          <div className="text-emerald-400">[SERVER] Vite dev server listening on port 3000.</div>
                          <div className="text-slate-500">[LOG] Handshake connection established with the client simulator.</div>
                          <div className="text-yellow-400">[WARN] Vite HMR is disabled by workspace controlplane.</div>
                          {activeFile === "EpicLogin.tsx" ? (
                            <>
                              <div className="text-purple-400">[VITE] Loaded 1 external dependency (motion/react).</div>
                              <div className="text-sky-400">[COMPILER] Bundled EpicLoginPreview in 23ms.</div>
                              <div className="text-emerald-400">[SUCCESS] Active workspace rendering Epic Games Authentication Module.</div>
                              <div className="text-slate-500">[LOG] Mapped 11 SSO callbacks: Playstation Network, Xbox Live, Nintendo Account, Google, Steam, Disney+, Apple ID, Facebook, Lego ID, Autodesk.</div>
                            </>
                          ) : (
                            <>
                              <div className="text-sky-400">[COMPILER] Bundled index.ts in 5ms.</div>
                              <div className="text-emerald-400">[SERVER] runMainServer() executed successfully.</div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* C. ASSET MANAGER */}
          {progTab === "assets" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Upload Section Form */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <UploadCloud className="h-4.5 w-4.5 text-indigo-500" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Dodaj Nowe Media</h4>
                  </div>

                  <form onSubmit={handleAddAsset} className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Nazwa Zasobu / Link</label>
                      <input
                        type="text"
                        required
                        value={newAssetName}
                        onChange={(e) => setNewAssetName(e.target.value)}
                        placeholder="np. figma.com/project-design"
                        className="w-full h-10 border border-slate-200 rounded-lg px-3 text-xs focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Typ Zasobu</label>
                      <select
                        value={newAssetType}
                        onChange={(e) => setNewAssetType(e.target.value as Asset["type"])}
                        className="w-full h-10 border border-slate-200 rounded-lg px-3 text-xs focus:outline-hidden cursor-pointer"
                      >
                        <option value="image">Obraz (banner, screenshot)</option>
                        <option value="video">Wideo (screencast, demo)</option>
                        <option value="pdf">Dokument (PDF)</option>
                        <option value="zip">Paczka kodu (ZIP)</option>
                        <option value="github">Repozytorium GitHub</option>
                        <option value="figma">Projekt Figma</option>
                        <option value="youtube">Wideo YouTube</option>
                      </select>
                    </div>

                    <button 
                      type="submit"
                      className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xxs rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Dodaj media</span>
                    </button>
                  </form>
                </div>

                {/* Assets Grid List */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Załączone Zasoby (Asset Manager)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assets.map((ast) => (
                      <div key={ast.id} className="p-3 border border-slate-150 rounded-xl bg-slate-50/50 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex items-center gap-2.5">
                          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                            {ast.type === "image" ? <FileCode className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                          </span>
                          <div className="min-w-0">
                            <h5 className="text-xxs font-bold text-slate-800 truncate">{ast.name}</h5>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">{ast.size} • {ast.uploadedAt}</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteAsset(ast.id, ast.name)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* D. PUBLISH FLOW & SNAPSHOTS */}
          {progTab === "publish" && (
            <div className="space-y-6">
              {/* Snapshots Versioning Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Create snapshot */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Layers className="h-4.5 w-4.5 text-indigo-500" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Inicjuj Snapshot (Wersjonowanie)</h4>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal">
                    Zrób migawkę stanu swojego projektu, aby móc łatwo do niej wrócić w przyszłości w razie problemów z kodem.
                  </p>

                  <form onSubmit={handleCreateSnapshot} className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Opis / Notatka do wersji</label>
                      <input
                        type="text"
                        required
                        value={snapshotComment}
                        onChange={(e) => setSnapshotComment(e.target.value)}
                        placeholder="np. Dodano integrację API i wyczyszczono logi"
                        className="w-full h-10 border border-slate-200 rounded-lg px-3 text-xs focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xxs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Zrób Snapshot wersji</span>
                    </button>
                  </form>
                </div>

                {/* Snapshots List */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Dostępne Migawki (Szybki Powrót)</h4>

                  <div className="space-y-2">
                    {snapshots.map((snap, idx) => (
                      <div key={idx} className="p-3 border border-slate-150 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-bold font-mono border border-indigo-900">
                              {snap.version}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">{snap.createdAt}</span>
                          </div>
                          <p className="text-xxs font-bold text-slate-700 leading-relaxed">{snap.comment}</p>
                          <p className="text-[9px] text-slate-400">Autor: {snap.author}</p>
                        </div>

                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleRestoreSnapshot(snap.version)}
                            className="px-2 py-1 rounded bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 text-[9px] font-bold transition-all cursor-pointer"
                          >
                            Przywróć
                          </button>
                          <button 
                            onClick={() => toast.info("Porównywanie wersji w toku...")}
                            className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-bold transition-all cursor-pointer"
                          >
                            Porównaj
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Publish Flow Step Progression */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Kroki Publikacji Projektu (Publish Flow)</h4>
                </div>

                {/* Steps Horizontal visualization */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
                  {[
                    { step: 1, label: "Create" },
                    { step: 2, label: "Edit" },
                    { step: 3, label: "Validate" },
                    { step: 4, label: "Publish" },
                    { step: 5, label: "Add to Lobby" },
                    { step: 6, label: "Public" }
                  ].map((s) => {
                    const isCompleted = s.step < publishStep;
                    const isActive = s.step === publishStep;
                    return (
                      <div 
                        key={s.step} 
                        onClick={() => {
                          setPublishStep(s.step);
                          toast.success(`Przejście do kroku: ${s.label}`);
                        }}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isActive 
                            ? "border-indigo-500 bg-indigo-50/20 shadow-xs" 
                            : isCompleted 
                            ? "border-slate-200 bg-slate-50/50" 
                            : "border-slate-150 bg-slate-50/10 text-slate-400"
                        }`}
                      >
                        <div className={`h-6 w-6 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                          isActive ? "bg-indigo-600 text-white" : isCompleted ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"
                        }`}>
                          {isCompleted ? "✓" : s.step}
                        </div>
                        <p className="text-[10px] font-extrabold mt-2 uppercase tracking-wide">{s.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Draft states control */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Status widoczności szkicu (Draft States)</span>
                    <p className="text-[10px] text-slate-500 font-mono">Zmień stopień zabezpieczeń przed opublikowaniem.</p>
                  </div>

                  <div className="flex gap-2">
                    {(["private", "invited_only", "public"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setDraftState(mode);
                          toast.success(`Zmieniono widoczność na ${mode}`);
                        }}
                        className={`px-3 py-1.5 border rounded-lg text-xxs font-bold uppercase transition-all cursor-pointer ${
                          draftState === mode 
                            ? "bg-indigo-600 border-indigo-600 text-white" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {mode === "private" ? "Prywatny" : mode === "invited_only" ? "Tylko Zaproszeni" : "Publiczny"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      toast.success("Projekt pomyślnie dodany do Lobby! (Mikrocopy: Dodaj do Lobby)");
                    }}
                    className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xxs rounded-lg px-4 flex items-center gap-1 cursor-pointer transition-colors border border-slate-200"
                  >
                    <span>Dodaj do Lobby</span>
                  </button>
                  <button 
                    onClick={() => {
                      setPublishStep(6);
                      toast.success("Projekt został opublikowany jako publiczny! (Mikrocopy: Opublikuj)");
                    }}
                    className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xxs rounded-lg px-4 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Opublikuj projekt</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
};
