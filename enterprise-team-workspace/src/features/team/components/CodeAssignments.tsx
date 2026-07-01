import { useState, useEffect, FormEvent } from "react";
import { useFirebaseTeam } from "../context/FirebaseTeamContext";
import { Member } from "../types/member";
import { RepoFile, CodeAssignment } from "../types/activity";
import { 
  Code, FileCode2, Briefcase, Users, Check, X, Terminal, 
  ArrowRight, CornerDownRight, MessageSquare, Clock, Send, 
  RotateCcw, Lock, CheckCircle2, AlertCircle, FileText, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

export function CodeAssignments() {
  const {
    activeMember,
    members,
    projects,
    repoFiles,
    codeAssignments,
    createCodeAssignment,
    submitCodeAssignment,
    mergeCodeAssignment,
    rejectCodeAssignment
  } = useFirebaseTeam();

  // Role Checks
  const isAdminOrOwner = activeMember?.role === "owner" || activeMember?.role === "admin" || activeMember?.role === "manager";
  const isDeveloper = activeMember?.role === "developer";

  // Tab state within Assignments: "tasks" (active assignments/management), "browser" (global repository viewer)
  const [innerTab, setInnerTab] = useState<"tasks" | "browser">("tasks");

  // Form States (for Admins)
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [customFilePath, setCustomFilePath] = useState("");
  const [assignedMemberId, setAssignedMemberId] = useState("");
  const [instructions, setInstructions] = useState("");

  // Filter project files dynamically
  const projectFiles = repoFiles.filter(f => f.projectId === selectedProjectId);
  const developers = members.filter(m => m.role === "developer");

  // Code Editor states (for Developers)
  const [activeEditingAsg, setActiveEditingAsg] = useState<CodeAssignment | null>(null);
  const [editingCode, setEditingCode] = useState("");

  // Code Diff / Review States (for Admins)
  const [reviewingAsg, setReviewingAsg] = useState<CodeAssignment | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Global repository view states
  const [browserProjectId, setBrowserProjectId] = useState(projects[0]?.id || "");
  const [browserFileId, setBrowserFileId] = useState<string | null>(null);

  // Ensure default states are loaded when projects/developers arrays update
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
    if (developers.length > 0 && !assignedMemberId) {
      setAssignedMemberId(developers[0].id);
    }
  }, [projects, developers]);

  // Set file input helper when selected file changes
  useEffect(() => {
    if (projectFiles.length > 0) {
      setSelectedFilePath(projectFiles[0].path);
    } else {
      setSelectedFilePath("custom");
    }
  }, [selectedProjectId, repoFiles]);

  // Handle creating assignment
  const handleCreateAssignment = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeMember) return;

    const proj = projects.find(p => p.id === selectedProjectId);
    const dev = members.find(m => m.id === assignedMemberId);
    const finalFilePath = selectedFilePath === "custom" ? customFilePath : selectedFilePath;

    if (!proj || !dev || !finalFilePath || !instructions) {
      toast.error("Proszę uzupełnić wszystkie pola formularza.");
      return;
    }

    // Get original content of file if it exists, otherwise provide boilerplate
    const existingFile = repoFiles.find(f => f.projectId === selectedProjectId && f.path === finalFilePath);
    const originalContent = existingFile ? existingFile.content : `// Nowy plik projektu: ${finalFilePath}\n// Dopisz kod według poniższych instrukcji:\n// ${instructions.replace(/\n/g, "\n// ")}\n\n`;

    try {
      await createCodeAssignment({
        projectId: selectedProjectId,
        projectName: proj.name,
        filePath: finalFilePath,
        originalContent,
        editedContent: originalContent,
        instructions,
        assignedTo: assignedMemberId,
        assignedToName: dev.name,
        assignedBy: activeMember.id,
        assignedByName: activeMember.name
      });

      toast.success(`Zlecenie dla ${dev.name} zostało wygenerowane pomyślnie!`);
      // Reset Form
      setCustomFilePath("");
      setInstructions("");
      setShowAssignForm(false);
    } catch (err: any) {
      toast.error("Błąd tworzenia zlecenia: " + err.message);
    }
  };

  // Open full editor for developer
  const handleOpenEditor = (asg: CodeAssignment) => {
    setActiveEditingAsg(asg);
    setEditingCode(asg.editedContent || asg.originalContent);
  };

  // Submit edited code
  const handleSubmitCode = async () => {
    if (!activeEditingAsg) return;
    if (window.confirm("Czy na pewno chcesz oddać zmodyfikowany plik do weryfikacji?")) {
      try {
        await submitCodeAssignment(activeEditingAsg.id, editingCode);
        toast.success("Twój kod został pomyślnie wysłany do review administratora!");
        setActiveEditingAsg(null);
      } catch (err: any) {
        toast.error("Błąd podczas wysyłania kodu: " + err.message);
      }
    }
  };

  // Merge (accept) code
  const handleMergeCode = async (asgId: string) => {
    if (window.confirm("Zatwierdzenie spowoduje scalenie kodu programisty bezpośrednio z repozytorium projektu. Kontynuować?")) {
      try {
        await mergeCodeAssignment(asgId);
        toast.success("Kod scalony pomyślnie z głównym repozytorium projektu!");
        setReviewingAsg(null);
      } catch (err: any) {
        toast.error("Błąd scalania kodu: " + err.message);
      }
    }
  };

  // Reject code
  const handleRejectSubmit = async () => {
    if (!reviewingAsg || !feedbackText) return;
    try {
      await rejectCodeAssignment(reviewingAsg.id, feedbackText);
      toast.success("Odrzucono zmiany. Kod został zwrócony deweloperowi do poprawki.");
      setFeedbackText("");
      setShowFeedbackModal(false);
      setReviewingAsg(null);
    } catch (err: any) {
      toast.error("Błąd odrzucania zmian: " + err.message);
    }
  };

  // Helper to count lines in editor
  const getLineNumbers = (code: string) => {
    const lines = code.split("\n").length;
    return Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header and Statistics Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Code className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
              Centrum Zleceń Kodu i Edytor SaaS
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Uprawniony admin może przypisać konkretne pliki projektu programistom z instrukcją edycji. Programista pracuje w interaktywnym edytorze i zwraca poprawiony plik, który po audycie trafia bezpośrednio do repozytorium.
          </p>
        </div>

        {/* Inner Navigation Tabs */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 self-start shadow-xxs">
          <button
            onClick={() => { setInnerTab("tasks"); setActiveEditingAsg(null); setReviewingAsg(null); }}
            className={`px-3 py-1.5 text-xxs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
              innerTab === "tasks" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Zlecenia i Edycja
          </button>
          <button
            onClick={() => { setInnerTab("browser"); setActiveEditingAsg(null); setReviewingAsg(null); }}
            className={`px-3 py-1.5 text-xxs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
              innerTab === "browser" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Repozytorium SaaS
          </button>
        </div>
      </div>

      {/* 2. TAB: GLOBAL REPOSITORY VIEW */}
      {innerTab === "browser" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* File Explorer list */}
          <div className="md:col-span-1 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3.5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Wybierz Projekt i Plik
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Projekt</label>
                <select
                  value={browserProjectId}
                  onChange={(e) => {
                    setBrowserProjectId(e.target.value);
                    setBrowserFileId(null);
                  }}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Struktura Plików (Real-Time)</label>
                <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                  {repoFiles.filter(f => f.projectId === browserProjectId).map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setBrowserFileId(file.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        browserFileId === file.id 
                          ? "bg-indigo-50 border border-indigo-100 text-indigo-700" 
                          : "text-slate-600 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode2 className={`h-4 w-4 ${browserFileId === file.id ? "text-indigo-600" : "text-slate-400"}`} />
                        <span className="truncate">{file.path}</span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
                    </button>
                  ))}
                  {repoFiles.filter(f => f.projectId === browserProjectId).length === 0 && (
                    <p className="text-xxs text-slate-400 text-center py-4">Brak plików w repozytorium. Zresetuj bazę lub utwórz nowe zlecenie, aby zainicjalizować pliki.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Viewer Content */}
          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-950 overflow-hidden shadow-xs flex flex-col h-[500px]">
            {browserFileId ? (
              <>
                {/* Header bar of Code View */}
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xxs text-slate-300">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <span>{repoFiles.find(f => f.id === browserFileId)?.path}</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-750 px-2 py-0.5 rounded font-mono uppercase">
                    {repoFiles.find(f => f.id === browserFileId)?.language}
                  </span>
                </div>

                {/* Simulated IDE Workspace */}
                <div className="flex-1 overflow-auto p-4 font-mono text-xs flex text-slate-300 bg-slate-950">
                  <div className="text-slate-600 text-right pr-4 border-r border-slate-800 select-none text-[11px] leading-relaxed">
                    {repoFiles.find(f => f.id === browserFileId)?.content.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <pre className="pl-4 leading-relaxed overflow-x-auto whitespace-pre text-[11px] text-slate-100 flex-1">
                    {repoFiles.find(f => f.id === browserFileId)?.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-950/80">
                <Terminal className="h-10 w-10 text-slate-700 mb-3 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-300">Eksplorator Kodu</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-normal">
                  Wybierz plik z listy po lewej stronie, aby otworzyć bezpieczny, scalony kod źródłowy na terminalu.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TAB: CODE TASKS AND ACTIVE IDE */}
      {innerTab === "tasks" && (
        <>
          {/* Active Workstation for DEVS */}
          {activeEditingAsg && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col lg:flex-row h-[600px]">
              {/* Left sidebar with instructions and original compare */}
              <div className="w-full lg:w-80 bg-slate-50 border-r border-slate-200 p-5 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[9px] font-bold text-indigo-700 uppercase tracking-wide font-mono">
                      Edytor Programisty
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm("Czy na pewno chcesz zamknąć edytor? Wszystkie niezapisane zmiany zostaną utracone.")) {
                          setActiveEditingAsg(null);
                        }
                      }}
                      className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1 cursor-pointer"
                    >
                      Zamknij ✕
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                      {activeEditingAsg.projectName}
                    </h3>
                    <p className="text-xxs text-slate-500 font-mono mt-0.5">
                      Ścieżka: {activeEditingAsg.filePath}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white border border-slate-200 p-3.5 space-y-2">
                    <h4 className="text-xxs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3 text-indigo-500" />
                      <span>Wytyczne od Administratora:</span>
                    </h4>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed max-h-[140px] overflow-y-auto whitespace-pre-wrap font-sans">
                      {activeEditingAsg.instructions}
                    </p>
                  </div>

                  {activeEditingAsg.status === "rejected" && activeEditingAsg.feedback && (
                    <div className="rounded-lg bg-rose-50 border border-rose-100 p-3.5 space-y-1.5">
                      <h4 className="text-xxs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                        <span>Powód Odrzucenia (Korekta):</span>
                      </h4>
                      <p className="text-xs text-rose-850 font-sans leading-relaxed">
                        {activeEditingAsg.feedback}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-5 border-t border-slate-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCode(activeEditingAsg.originalContent)}
                      className="flex-1 h-9 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xxs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="Przywróć zawartość pliku do stanu początkowego"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Przywróć Oryginał</span>
                    </button>
                  </div>
                  <button
                    onClick={handleSubmitCode}
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>Oddaj Zmodyfikowany Plik</span>
                  </button>
                </div>
              </div>

              {/* Real interactive code IDE screen */}
              <div className="flex-1 bg-slate-950 flex flex-col overflow-hidden">
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
                  <span className="font-mono text-xxs text-slate-300">
                    💻 WIRTUALNA STACJA ROBOCZA // {activeEditingAsg.filePath}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-emerald-400 border border-emerald-950/40 px-2 py-0.5 rounded font-mono uppercase">
                    ONLINE
                  </span>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* Line numbers column */}
                  <div className="bg-slate-950 py-4 text-slate-600 text-right pr-3 pl-4 border-r border-slate-850 select-none text-xs font-mono leading-normal min-w-[45px]">
                    {getLineNumbers(editingCode).map((line) => (
                      <div key={line} className="h-6 flex items-center justify-end">{line}</div>
                    ))}
                  </div>

                  {/* Real editing area */}
                  <textarea
                    value={editingCode}
                    onChange={(e) => setEditingCode(e.target.value)}
                    className="flex-1 bg-slate-950 text-slate-100 font-mono text-xs leading-normal p-4 focus:outline-hidden resize-none overflow-y-auto h-full"
                    style={{ lineHeight: "24px" }}
                    placeholder="// Wpisz swój kod tutaj..."
                    spellCheck="false"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active Workstation for CODE REVIEW (Admins) */}
          {reviewingAsg && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col h-[650px]">
              <div className="bg-slate-900 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Audit & Code Review // Zlecenie ID: {reviewingAsg.id}
                  </h3>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Weryfikujesz kod przesłany przez <strong>{reviewingAsg.assignedToName}</strong> dla pliku: <strong>{reviewingAsg.filePath}</strong> ({reviewingAsg.projectName})
                  </p>
                </div>
                <button
                  onClick={() => setReviewingAsg(null)}
                  className="text-slate-400 hover:text-slate-200 font-bold text-xs cursor-pointer"
                >
                  ✕ Zamknij Podgląd
                </button>
              </div>

              {/* Side by side diff views */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-slate-950">
                {/* Original File */}
                <div className="border-r border-slate-800 flex flex-col overflow-hidden h-full">
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>ORYGINALNY PLIK</span>
                    <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded">PRZED EDYCJĄ</span>
                  </div>
                  <div className="flex-1 overflow-auto p-4 font-mono text-xxs leading-normal text-rose-300 flex">
                    <div className="text-rose-900 text-right pr-3 mr-3 border-r border-slate-850 select-none text-xxs">
                      {reviewingAsg.originalContent.split("\n").map((_, i) => <div key={i}>{i+1}</div>)}
                    </div>
                    <pre className="whitespace-pre overflow-x-auto flex-1">{reviewingAsg.originalContent}</pre>
                  </div>
                </div>

                {/* Developer Submitted File */}
                <div className="flex flex-col overflow-hidden h-full">
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>ZMODYFIKOWANY PLIK (PROGRAMISTA)</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded">ZAPROPONOWANE ZMIANY</span>
                  </div>
                  <div className="flex-1 overflow-auto p-4 font-mono text-xxs leading-normal text-emerald-300 flex">
                    <div className="text-emerald-900 text-right pr-3 mr-3 border-r border-slate-850 select-none text-xxs">
                      {reviewingAsg.editedContent.split("\n").map((_, i) => <div key={i}>{i+1}</div>)}
                    </div>
                    <pre className="whitespace-pre overflow-x-auto flex-1">{reviewingAsg.editedContent}</pre>
                  </div>
                </div>
              </div>

              {/* Review Control Panel footer */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 font-medium">
                  Zatwierdzenie automatycznie zaktualizuje plik repozytorium w chmurze i utworzy tamper-proof audyt deweloperski.
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="flex-1 sm:flex-initial h-10 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs px-5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Odrzuć z Feedbackiem</span>
                  </button>
                  <button
                    onClick={() => handleMergeCode(reviewingAsg.id)}
                    className="flex-1 sm:flex-initial h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    <span>Zatwierdź i Scal (Merge)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form to dispatch/create a new assignment (Guarded to admin/manager) */}
          {isAdminOrOwner && showAssignForm && (
            <form onSubmit={handleCreateAssignment} className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100/50 pb-2">
                <h3 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                  <FileCode2 className="h-4.5 w-4.5 text-indigo-600" />
                  <span>Wyślij Nowe Zlecenie Kodowania dla Programisty</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Ukryj Formularz
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Selected Project */}
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Projekt SaaS</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* File Path inside Project */}
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Wybierz Plik lub Ścieżkę</label>
                  <select
                    value={selectedFilePath}
                    onChange={(e) => setSelectedFilePath(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    {projectFiles.map((file) => (
                      <option key={file.id} value={file.path}>{file.path}</option>
                    ))}
                    <option value="custom">+ Utwórz nowy / podaj ścieżkę ręcznie</option>
                  </select>
                </div>

                {/* Assigned Programmer */}
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Przypisz Programistę (Deweloper)</label>
                  <select
                    value={assignedMemberId}
                    onChange={(e) => setAssignedMemberId(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    {developers.map((dev) => (
                      <option key={dev.id} value={dev.id}>{dev.name} ({dev.department})</option>
                    ))}
                    {developers.length === 0 && (
                      <option value="">Brak zarejestrowanych programistów!</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Custom File Path (If custom selected) */}
              {selectedFilePath === "custom" && (
                <div className="max-w-md">
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Wpisz Nową Ścieżkę Pliku</label>
                  <input
                    type="text"
                    required
                    value={customFilePath}
                    onChange={(e) => setCustomFilePath(e.target.value)}
                    placeholder="src/components/MyNewFeature.tsx"
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              )}

              {/* Editing instructions */}
              <div>
                <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Wytyczne i Instrukcje do Zmiany Kodu</label>
                <textarea
                  required
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Dopisz nowy endpoint GET /api/healthcheck zwracający status 200, lub popraw błąd walidacji sesji..."
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={developers.length === 0}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Zleć Edycję Kodu
                </button>
              </div>
            </form>
          )}

          {/* MAIN ACTIONS & ASSIGNMENTS LIST */}
          {!activeEditingAsg && !reviewingAsg && (
            <div className="space-y-6">
              {/* Top Row for Admins (Add assignment buttons) */}
              {isAdminOrOwner && !showAssignForm && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAssignForm(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden transition-all duration-150 cursor-pointer"
                  >
                    <FileCode2 className="h-4 w-4" />
                    <span>Zleć Nową Edycję Kodu Programiście</span>
                  </button>
                </div>
              )}

              {/* Assignments Dashboard Lists */}
              <div className="grid grid-cols-1 gap-6">
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      <span>Rejestr Zleceń Kodu SaaS</span>
                    </h3>
                    <span className="font-mono text-xxs bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                      {codeAssignments.length} Łącznie
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 text-slate-700">
                    {/* Render developer assigned items first or all if admin */}
                    {codeAssignments
                      .filter((asg) => isAdminOrOwner || asg.assignedTo === activeMember?.id)
                      .map((asg) => {
                        const statusColors = 
                          asg.status === "assigned" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          asg.status === "submitted" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          asg.status === "merged" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          "bg-rose-50 text-rose-700 border-rose-200";

                        const statusLabels = 
                          asg.status === "assigned" ? "Przypisane" :
                          asg.status === "submitted" ? "Oddane do weryfikacji" :
                          asg.status === "merged" ? "Zatwierdzone & Scalone" :
                          "Odrzucone (Wymaga Poprawek)";

                        return (
                          <div key={asg.id} className="p-6 hover:bg-slate-50/40 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-2 max-w-2xl">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xxs font-bold text-slate-600 font-mono">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  <span>{asg.projectName}</span>
                                </span>
                                <span className="text-xxs font-semibold text-slate-400 font-mono">
                                  📂 {asg.filePath}
                                </span>
                                <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold ${statusColors}`}>
                                  {statusLabels}
                                </span>
                              </div>

                              <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-800">
                                  Wskazówki zlecenia:
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-2.5 rounded border border-slate-100 font-sans">
                                  {asg.instructions}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xxs text-slate-400 font-mono">
                                <span>Od: <strong>{asg.assignedByName}</strong></span>
                                <span className="text-slate-200">|</span>
                                <span>Dla: <strong>{asg.assignedToName}</strong></span>
                                <span className="text-slate-200">|</span>
                                <span>Wysłano: {new Date(asg.createdAt).toLocaleString()}</span>
                                {asg.submittedAt && (
                                  <>
                                    <span className="text-slate-200">|</span>
                                    <span>Oddano: {new Date(asg.submittedAt).toLocaleString()}</span>
                                  </>
                                )}
                              </div>

                              {asg.status === "rejected" && asg.feedback && (
                                <div className="rounded bg-rose-50 border border-rose-100 p-2 text-xxs text-rose-800 font-sans">
                                  <strong>Korekta administratora:</strong> {asg.feedback}
                                </div>
                              )}
                            </div>

                            {/* Actions on task item */}
                            <div className="shrink-0 flex items-center gap-2">
                              {/* 1. Developer Actions */}
                              {isDeveloper && (asg.status === "assigned" || asg.status === "rejected") && (
                                <button
                                  onClick={() => handleOpenEditor(asg)}
                                  className="h-9 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  <Code className="h-4 w-4" />
                                  <span>Otwórz Edytor SaaS</span>
                                </button>
                              )}

                              {/* 2. Admin Actions */}
                              {isAdminOrOwner && asg.status === "submitted" && (
                                <button
                                  onClick={() => setReviewingAsg(asg)}
                                  className="h-9 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  <Terminal className="h-4 w-4" />
                                  <span>Audit & Code Review</span>
                                </button>
                              )}

                              {asg.status === "merged" && (
                                <span className="text-emerald-600 font-bold text-xxs flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md font-mono">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>ZAKOŃCZONE</span>
                                </span>
                              )}

                              {asg.status === "submitted" && isDeveloper && (
                                <span className="text-slate-400 font-bold text-xxs flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md font-mono">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>OCZEKUJE NA MERGE</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    {codeAssignments.filter((asg) => isAdminOrOwner || asg.assignedTo === activeMember?.id).length === 0 && (
                      <div className="p-12 text-center text-slate-400 space-y-2">
                        <FileText className="h-10 w-10 text-slate-300 mx-auto animate-bounce" />
                        <h4 className="text-xs font-bold text-slate-600">Brak Aktywnych Zleceń Kodu</h4>
                        <p className="text-xxs text-slate-400 max-w-md mx-auto">
                          Wszystkie kody są zaktualizowane. Nowe zlecenia pojawią się w tym miejscu po przypisaniu plików przez administratora platformy.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 4. MODAL: FEEDBACK ON REJECTION */}
      {showFeedbackModal && reviewingAsg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-sm font-extrabold text-slate-950">Odrzuć zmiany i przekaż feedback</h3>
            </div>
            
            <p className="text-xs text-slate-500">
              Użytkownik <strong>{reviewingAsg.assignedToName}</strong> otrzyma powiadomienie oraz informację zwrotną i będzie mógł dokonać poprawek w swoim edytorze SaaS.
            </p>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Wpisz komentarz dla programisty (Wskazówki naprawcze):</label>
              <textarea
                required
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Kod ma błąd składniowy w linii 7, proszę poprawić warunek sprawdzający token auth..."
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowFeedbackModal(false); setFeedbackText(""); }}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={!feedbackText}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white cursor-pointer disabled:opacity-50"
              >
                Odrzuć i Wyślij Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
