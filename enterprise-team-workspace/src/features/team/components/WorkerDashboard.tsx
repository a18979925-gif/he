import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Member } from "../types/member";
import { Project } from "../types/team";
import { Task } from "../types/activity";
import { useFirebaseTeam } from "../context/FirebaseTeamContext";
import { 
  CheckSquare, Inbox, Briefcase, MessagesSquare, Code, Mail, Bell, User,
  Plus, Check, Play, Send, ChevronRight, Download, Eye, AlertCircle,
  FileText, ShieldCheck, HelpCircle, Save, Copy, CheckCircle2, Star, 
  CornerDownRight, ArrowRight, MessageSquare, Flame, Trash2, Calendar, FileCode, Clock
} from "lucide-react";
import { toast } from "sonner";

interface WorkerDashboardProps {
  activeMember: Member | null;
  projects: Project[];
  members: Member[];
  tasks: Task[];
  onTabChange: (tabId: string) => void;
  activeSubTab?: string; // Optional override
  onUpdateTaskStatus?: (id: string, status: "todo" | "in-progress" | "review" | "done") => Promise<void>;
}

export function WorkerDashboard({
  activeMember,
  projects,
  members,
  tasks: parentTasks,
  onTabChange,
  activeSubTab = "overview",
  onUpdateTaskStatus
}: WorkerDashboardProps) {
  const { repoFiles, auditLogs, logAction, updateRepoFile } = useFirebaseTeam();

  // Sub tab manager
  const [currentTab, setCurrentTab] = useState<string>(activeSubTab);

  useEffect(() => {
    setCurrentTab(activeSubTab);
  }, [activeSubTab]);

  // Synchronize tasks with Firestore parentTasks to eliminate mock data
  const [workerTasks, setWorkerTasks] = useState<any[]>([]);

  useEffect(() => {
    if (parentTasks && parentTasks.length > 0) {
      const mapped = parentTasks.map(t => {
        const priorityLabel = t.priority ? t.priority.toUpperCase() : "MEDIUM";
        let statusLabel = "Pending";
        if (t.status === "in-progress") statusLabel = "In Progress";
        if (t.status === "done") statusLabel = "Completed";
        if (t.status === "review") statusLabel = "In Progress";

        return {
          id: t.id,
          title: t.title,
          priority: priorityLabel,
          status: statusLabel,
          dueDate: t.dueDate || "Dzisiaj",
          description: `Zadanie przypisane w projekcie "${t.projectName || 'Ogólny'}". Wykonaj przypisane prace zgodnie ze specyfikacją klastra.`,
          files: [t.id === "task_1" ? "auth.ts" : t.id === "task_3" ? "api.ts" : "notes.md"],
          comments: []
        };
      });
      setWorkerTasks(mapped);
    } else {
      setWorkerTasks([]);
    }
  }, [parentTasks]);

  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);

  useEffect(() => {
    if (repoFiles && repoFiles.length > 0) {
      setReceivedFiles(repoFiles.map((f) => ({
        id: f.id,
        name: f.path.split("/").pop() || f.path,
        from: "System klastra",
        project: "Infrastruktura",
        status: "New",
        size: "240 KB",
        message: `Plik roboczy dla klastra: ${f.path}`
      })));
    } else {
      setReceivedFiles([]);
    }
  }, [repoFiles]);

  const [invites, setInvites] = useState<any[]>([]);

  const notifications = React.useMemo(() => {
    return (auditLogs || []).map((log) => ({
      id: log.id,
      text: `${log.actor?.name || "System"} wykonał: "${log.action}" na "${log.target}"`,
      time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    })).slice(0, 10);
  }, [auditLogs]);

  const [chats, setChats] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const initialChats: Record<string, any[]> = {
      "#general": [
        { id: "wc_1", sender: "Andrzej (Owner)", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop", text: "Witamy w kanale dyskusyjnym klastra!", time: "09:00", role: "owner" }
      ]
    };
    
    // Dynamically generate channels for each project in Firestore
    projects.forEach((proj) => {
      const channelName = `#${proj.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      initialChats[channelName] = [
        {
          id: `welcome_${proj.id}`,
          sender: "System Bot",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
          text: `Inicjalizacja kanału dyskusyjnego dla projektu "${proj.name}".`,
          time: "10:00",
          role: "system"
        }
      ];
    });

    setChats(initialChats);
  }, [projects]);

  const [activeChannel, setActiveChannel] = useState<string>("#general");
  const [chatInput, setChatInput] = useState("");

  // Editor states dynamically mapped from repoFiles
  const editorFiles = React.useMemo(() => {
    if (repoFiles && repoFiles.length > 0) {
      return repoFiles.map((f) => ({
        name: f.path.split("/").pop() || f.path,
        path: f.path,
        lang: f.language === "typescript" ? "typescript" : f.language === "json" ? "json" : f.language === "sql" ? "sql" : "text",
        content: f.content
      }));
    }
    return [
      {
        name: "README.md",
        path: "README.md",
        lang: "markdown",
        content: `# Brak plików klastra\nZresetuj dane w panelu ustawień lub utwórz projekt z plikami aby aktywować edytor.`
      }
    ];
  }, [repoFiles]);

  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [editorContent, setEditorContent] = useState("");

  useEffect(() => {
    if (editorFiles[selectedFileIndex]) {
      setEditorContent(editorFiles[selectedFileIndex].content);
    } else if (editorFiles[0]) {
      setSelectedFileIndex(0);
      setEditorContent(editorFiles[0].content);
    }
  }, [editorFiles, selectedFileIndex]);

  // Inline task file editor states
  const [inlineEditingFile, setInlineEditingFile] = useState<string | null>(null);
  const [inlineEditingContent, setInlineEditingContent] = useState<string>("");

  // Selected task detail view
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTaskComment, setNewTaskComment] = useState("");

  // Clear inline editor when selected task changes
  useEffect(() => {
    setInlineEditingFile(null);
    setInlineEditingContent("");
  }, [selectedTaskId]);

  // Projects navigation inside My Projects
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectSubTab, setProjectSubTab] = useState<"overview" | "tasks" | "files" | "chat">("overview");

  // Sync editor file state when loaded or index changed
  const handleSelectFile = (index: number) => {
    setSelectedFileIndex(index);
    if (editorFiles[index]) {
      setEditorContent(editorFiles[index].content);
    }
  };

  // Save modified editor file to Firestore
  const handleSaveFile = async () => {
    const file = editorFiles[selectedFileIndex];
    if (!file) return;
    
    // Find matching project id from repoFiles
    const originalFile = repoFiles?.find(f => f.path === file.path);
    const projectId = originalFile?.projectId || projects[0]?.id || "proj_1";

    try {
      if (updateRepoFile) {
        await updateRepoFile(projectId, file.path, editorContent);
        if (logAction) {
          await logAction("zaktualizował plik", file.name, "settings", `Zapisano zmiany w pliku ${file.path} bezpośrednio w Firestore.`);
        }
        toast.success(`Plik ${file.name} został pomyślnie zaktualizowany bezpośrednio w Firestore!`);
      } else {
        toast.success(`Zapisano zmiany lokalnie dla pliku ${file.name}`);
      }
    } catch (err: any) {
      toast.error(`Błąd zapisu pliku: ${err.message}`);
    }
  };

  // Copy Editor content to clipboard
  const handleCopyFile = () => {
    navigator.clipboard.writeText(editorContent);
    toast.success("Skopiowano kod do schowka systemowego!");
  };

  // Download Editor file
  const handleDownloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([editorContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = editorFiles[selectedFileIndex]?.name || "file.ts";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Pobrano plik ${editorFiles[selectedFileIndex]?.name}`);
  };

  // Inline Editor Handlers
  const handleStartInlineEdit = (fileName: string) => {
    const file = editorFiles.find(f => f.name === fileName);
    if (file) {
      setInlineEditingFile(fileName);
      setInlineEditingContent(file.content);
      toast.info(`Otwarto plik ${fileName} w szybkim edytorze zadania.`);
    } else {
      setInlineEditingFile(fileName);
      setInlineEditingContent(`// Nowy plik: ${fileName}\n\nexport function main() {\n  console.log("Inicjalizacja ${fileName}");\n}`);
      toast.info(`Utworzono i otwarto nowy plik ${fileName} w szybkim edytorze zadania.`);
    }
  };

  const handleSaveInlineFile = async () => {
    if (!inlineEditingFile) return;

    const file = editorFiles.find(f => f.name === inlineEditingFile);
    const filePath = file?.path || `src/${inlineEditingFile}`;
    const originalFile = repoFiles?.find(f => f.path === filePath);
    const projectId = originalFile?.projectId || projects[0]?.id || "proj_1";

    try {
      if (updateRepoFile) {
        await updateRepoFile(projectId, filePath, inlineEditingContent);
        if (logAction) {
          await logAction("zaktualizował szybki plik", inlineEditingFile, "settings", `Zapisano zmiany w pliku zadania ${filePath}.`);
        }
        toast.success(`Zapisano plik ${inlineEditingFile} bezpośrednio w Firestore!`);
        if (file && editorFiles[selectedFileIndex]?.name === inlineEditingFile) {
          setEditorContent(inlineEditingContent);
        }
      } else {
        toast.success(`Zapisano zmiany lokalnie`);
      }
    } catch (err: any) {
      toast.error(`Błąd zapisu pliku: ${err.message}`);
    }
  };

  const handleDownloadInlineFile = () => {
    if (!inlineEditingFile) return;
    const element = document.createElement("a");
    const file = new Blob([inlineEditingContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = inlineEditingFile;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Pobrano plik ${inlineEditingFile}`);
  };

  const handleCopyInlineFile = () => {
    if (!inlineEditingContent) return;
    navigator.clipboard.writeText(inlineEditingContent);
    toast.success("Skopiowano kod do schowka!");
  };

  // Accept / Decline Invites
  const handleAcceptInvite = async (id: string, name: string) => {
    setInvites(invites.map(inv => inv.id === id ? { ...inv, status: "Accepted" } : inv));
    try {
      if (logAction) {
        await logAction("przyjął zaproszenie", name, "security", `Dołączono pomyślnie do ${name}.`);
      }
      toast.success(`Zaakceptowano zaproszenie do: ${name}!`);
    } catch (err) {
      toast.success(`Zaakceptowano zaproszenie do: ${name}!`);
    }
  };

  const handleDeclineInvite = (id: string, name: string) => {
    setInvites(invites.filter(inv => inv.id !== id));
    toast.info(`Odrzucono zaproszenie do: ${name}`);
  };

  // Chat message sending
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: activeMember?.name || "Mój Profil",
      avatar: activeMember?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: "worker"
    };

    setChats({
      ...chats,
      [activeChannel]: [...(chats[activeChannel] || []), newMessage]
    });
    setChatInput("");
  };

  // Download received files mock
  const handleDownloadReceivedFile = (id: string, name: string) => {
    setReceivedFiles(receivedFiles.map(f => f.id === id ? { ...f, status: "Downloaded" } : f));
    toast.success(`Rozpoczęto pobieranie pliku: ${name}`);
  };

  // Task interaction
  const handleStartTask = async (taskId: string) => {
    setWorkerTasks(workerTasks.map(t => t.id === taskId ? { ...t, status: "In Progress" } : t));
    if (onUpdateTaskStatus) {
      try {
        await onUpdateTaskStatus(taskId, "in-progress");
        if (logAction) {
          await logAction("rozpoczął zadanie", taskId, "settings", `Zadanie ${taskId} w toku.`);
        }
        toast.info("Zadanie zostało oznaczone jako: W toku w bazie Firestore");
      } catch (err: any) {
        toast.error(`Błąd aktualizacji Firestore: ${err.message}`);
      }
    } else {
      toast.info("Zadanie zostało oznaczone jako: W toku");
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    setWorkerTasks(workerTasks.map(t => t.id === taskId ? { ...t, status: "Completed" } : t));
    if (onUpdateTaskStatus) {
      try {
        await onUpdateTaskStatus(taskId, "done");
        if (logAction) {
          const tTitle = workerTasks.find(t => t.id === taskId)?.title || taskId;
          await logAction("ukończył zadanie", tTitle, "settings", `Zadanie ${taskId} zakończone pomyślnie.`);
        }
        toast.success("Zadanie oznaczone jako ukończone w bazie Firestore!");
      } catch (err: any) {
        toast.error(`Błąd ukończenia zadania: ${err.message}`);
      }
    } else {
      toast.success("Zadanie ukończone! Wysłano powiadomienie do Właściciela.");
    }
  };

  const handleAddTaskComment = (taskId: string) => {
    if (!newTaskComment.trim()) return;
    setWorkerTasks(workerTasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comments: [
            ...t.comments,
            {
              sender: activeMember?.name || "Pracownik",
              text: newTaskComment,
              time: "Przed chwilą"
            }
          ]
        };
      }
      return t;
    }));
    setNewTaskComment("");
    toast.success("Komentarz został dodany!");
  };

  // Navigation redirect helpers
  const handleOpenCodeInEditor = (fileName: string) => {
    const fileIdx = editorFiles.findIndex(f => f.name === fileName);
    if (fileIdx !== -1) {
      setSelectedFileIndex(fileIdx);
      setEditorContent(editorFiles[fileIdx].content);
      setCurrentTab("mini_editor");
      setSelectedTaskId(null);
    } else {
      toast.error(`Plik ${fileName} nie jest dostępny w wbudowanym edytorze.`);
    }
  };

  // Assigned projects
  const workerProjects = [
    { id: "proj_1", name: "Frontend Platform", desc: "React + Tailwind SaaS Dashboard", progress: 72, membersCount: 6, openTasksCount: 14, completedTasksCount: 83 },
    { id: "proj_2", name: "Security API Service", desc: "Express + Node.js Authentication Core", progress: 48, membersCount: 3, openTasksCount: 8, completedTasksCount: 32 }
  ];

  const activeTaskDetails = workerTasks.find(t => t.id === selectedTaskId);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Nav Router bar for debugging / sync */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto gap-1">
        <button
          onClick={() => { setCurrentTab("overview"); setSelectedProjectId(null); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            currentTab === "overview" && !selectedProjectId ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => { setCurrentTab("my_tasks"); setSelectedProjectId(null); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            currentTab === "my_tasks" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span>Moje Zadania</span>
          {workerTasks.filter(t => t.status !== "Completed").length > 0 && (
            <span className="bg-rose-500 text-white font-black text-[9px] rounded-full px-1.5 py-0.5 animate-pulse">
              {workerTasks.filter(t => t.status !== "Completed").length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setCurrentTab("received_files"); setSelectedProjectId(null); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            currentTab === "received_files" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Inbox className="h-3.5 w-3.5" />
          <span>Pliki od Zespołu</span>
          {receivedFiles.filter(f => f.status === "New").length > 0 && (
            <span className="bg-indigo-600 text-white font-black text-[9px] rounded-full px-1.5 py-0.5">
              {receivedFiles.filter(f => f.status === "New").length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setCurrentTab("my_projects"); setSelectedProjectId(null); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            currentTab === "my_projects" || selectedProjectId ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Moje Projekty</span>
        </button>
        <button
          onClick={() => { setCurrentTab("team_chat"); setSelectedProjectId(null); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            currentTab === "team_chat" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MessagesSquare className="h-3.5 w-3.5" />
          <span>Team Chat</span>
        </button>
        <button
          onClick={() => { setCurrentTab("mini_editor"); setSelectedProjectId(null); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            currentTab === "mini_editor" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Code className="h-3.5 w-3.5" />
          <span>Wbudowany Edytor</span>
        </button>
        <button
          onClick={() => { setCurrentTab("invites"); setSelectedProjectId(null); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            currentTab === "invites" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Zaproszenia</span>
          {invites.filter(i => i.status === "Pending").length > 0 && (
            <span className="bg-amber-500 text-white font-black text-[9px] rounded-full px-1.5 py-0.5">
              {invites.filter(i => i.status === "Pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setCurrentTab("notifications"); setSelectedProjectId(null); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            currentTab === "notifications" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Bell className="h-3.5 w-3.5" />
          <span>Powiadomienia</span>
        </button>
        <button
          onClick={() => { setCurrentTab("profile"); setSelectedProjectId(null); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
            currentTab === "profile" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Profil</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedProjectId ? `proj_${selectedProjectId}` : currentTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >

          {/* ======================================= */}
          {/* 1. OVERVIEW / DASHBOARD                 */}
          {/* ======================================= */}
          {currentTab === "overview" && !selectedProjectId && (
            <div className="space-y-6">
              
              {/* Welcome Card */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <img
                    src={activeMember?.avatar || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop"}
                    alt={activeMember?.name || "User"}
                    className="h-14 w-14 rounded-xl border border-slate-700 object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-white">Witamy ponownie, {activeMember?.name || "Pracowniku"}!</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Twój portal operacyjny jest w pełni autoryzowany. Masz {workerTasks.filter(t=>t.status !== "Completed").length} aktywnych zadań na dzisiaj.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative z-10 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold px-3 py-1 bg-slate-850 border border-slate-800 text-emerald-400 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    STAŻ: PRACUJE
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Zadania na dziś</span>
                  <span className="text-3xl font-black text-slate-900 mt-2 block font-mono">
                    {workerTasks.filter(t => t.dueDate === "Dzisiaj").length + 2}
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold block mt-1">Priorytet: HIGH</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Ukończone zadania</span>
                  <span className="text-3xl font-black text-emerald-600 mt-2 block font-mono">42</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Zatwierdzone w tym miesiącu</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Oczekujące zadania</span>
                  <span className="text-3xl font-black text-amber-500 mt-2 block font-mono">
                    {workerTasks.filter(t => t.status === "Pending").length}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">Do przejrzenia</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Aktywne Zaproszenia</span>
                  <span className="text-3xl font-black text-indigo-600 mt-2 block font-mono">
                    {invites.filter(i => i.status === "Pending").length}
                  </span>
                  <span className="text-[10px] text-rose-500 font-semibold block mt-1">Wymaga odpowiedzi</span>
                </div>
              </div>

              {/* Two-Column Bento Layout */}
              <div className="grid gap-6 lg:grid-cols-3">
                
                {/* Left (2/3 width) - Recent Tasks list & files received */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Recent Tasks List */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-indigo-500" />
                          <span>Bieżące Zadania Pracownika</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Twoje ostatnio przypisane zlecenia deweloperskie i projektowe.</p>
                      </div>
                      <button 
                        onClick={() => setCurrentTab("my_tasks")}
                        className="text-xxs font-bold text-indigo-600 hover:text-indigo-850 flex items-center gap-0.5 transition-colors"
                      >
                        <span>Zobacz wszystkie</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {workerTasks.slice(0, 3).map((task) => {
                        let priorityColor = "bg-slate-100 text-slate-700";
                        if (task.priority === "HIGH") priorityColor = "bg-rose-50 border border-rose-200 text-rose-700";
                        if (task.priority === "MEDIUM") priorityColor = "bg-amber-50 border border-amber-200 text-amber-700";
                        if (task.priority === "LOW") priorityColor = "bg-blue-50 border border-blue-200 text-blue-700";

                        let statusColor = "text-slate-500";
                        if (task.status === "In Progress") statusColor = "text-indigo-600 font-bold";
                        if (task.status === "Completed") statusColor = "text-emerald-600 font-bold";

                        return (
                          <div 
                            key={task.id}
                            onClick={() => { setSelectedTaskId(task.id); setCurrentTab("my_tasks"); }}
                            className="py-3.5 flex items-center justify-between hover:bg-slate-50/60 rounded-xl px-2 transition-all cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${priorityColor}`}>
                                {task.priority}
                              </span>
                              <div>
                                <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">{task.title}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
                                  <span>Termin: {task.dueDate}</span>
                                  <span>•</span>
                                  <span>Załączonych plików: {task.files.length}</span>
                                </p>
                              </div>
                            </div>
                            <span className={`text-xxs font-mono ${statusColor}`}>{task.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Files Received Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Inbox className="h-4 w-4 text-emerald-500" />
                          <span>Otrzymane Instrukcje i Pliki ({receivedFiles.length})</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Zasoby i specyfikacje wysłane do Ciebie bezpośrednio przez Administratora.</p>
                      </div>
                      <button 
                        onClick={() => setCurrentTab("received_files")}
                        className="text-xxs font-bold text-indigo-600 hover:text-indigo-850 flex items-center gap-0.5 transition-colors"
                      >
                        <span>Przeglądaj pliki</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {receivedFiles.map((file) => (
                        <div key={file.id} className="p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] text-slate-400 font-mono">{file.size}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                file.status === "New" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"
                              }`}>
                                {file.status === "New" ? "Nowy" : "Pobrany"}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-950 truncate flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-slate-500" />
                              <span>{file.name}</span>
                            </h4>
                            <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-2">"{file.message}"</p>
                          </div>
                          <div className="mt-4 pt-2 border-t border-slate-150/50 flex items-center justify-between">
                            <span className="text-[9px] text-slate-400">Nadawca: {file.from}</span>
                            <button
                              onClick={() => handleDownloadReceivedFile(file.id, file.name)}
                              className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors cursor-pointer"
                            >
                              <Download className="h-3 w-3" />
                              <span>Pobierz</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Sidebar (1/3 width) - Knowledge Base shortcuts & Notifications */}
                <div className="space-y-6">
                  
                  {/* Notifications feed */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-amber-500" />
                      <span>Strumień Powiadomień</span>
                    </h3>
                    <div className="space-y-3.5">
                      {notifications.slice(0, 4).map((n) => (
                        <div key={n.id} className="flex gap-2.5 text-xs">
                          <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.read ? "bg-slate-300" : "bg-indigo-600 animate-pulse"}`}></span>
                          <div>
                            <p className={`text-slate-800 ${!n.read ? "font-bold" : "text-slate-600"}`}>{n.text}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pinned playbooks / links */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Rekomendowane Playbooki</h3>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 flex items-center justify-between group cursor-pointer" onClick={() => handleOpenCodeInEditor("notes.md")}>
                        <div>
                          <p className="font-extrabold text-slate-800">Podręcznik deweloperski</p>
                          <p className="text-[10px] text-slate-400 font-mono">notes.md</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      
                      <div className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 flex items-center justify-between group cursor-pointer" onClick={() => handleOpenCodeInEditor("auth.ts")}>
                        <div>
                          <p className="font-extrabold text-slate-800">Kod weryfikacji sesji</p>
                          <p className="text-[10px] text-slate-400 font-mono">auth.ts</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* 2. MY TASKS                             */}
          {/* ======================================= */}
          {currentTab === "my_tasks" && !selectedProjectId && (
            <div className="grid gap-6 lg:grid-cols-3">
              
              {/* Task table / list */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight flex items-center gap-1.5">
                      <CheckSquare className="h-4 w-4 text-indigo-600" />
                      <span>Moje Przypisane Zadania</span>
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Przeglądaj, aktualizuj stany i uruchamiaj zlecenia deweloperskie.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-3">Zadanie</th>
                        <th className="px-4 py-3">Priorytet</th>
                        <th className="px-4 py-3">Termin</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {workerTasks.map((t) => {
                        let priorityColor = "bg-slate-100 text-slate-700";
                        if (t.priority === "HIGH") priorityColor = "bg-rose-100 text-rose-800 font-black";
                        if (t.priority === "MEDIUM") priorityColor = "bg-amber-100 text-amber-800 font-black";
                        if (t.priority === "LOW") priorityColor = "bg-blue-100 text-blue-800 font-black";

                        let statusBadge = "bg-slate-100 text-slate-600";
                        if (t.status === "In Progress") statusBadge = "bg-indigo-100 text-indigo-800 font-bold";
                        if (t.status === "Completed") statusBadge = "bg-emerald-100 text-emerald-800 font-bold";

                        return (
                          <tr 
                            key={t.id}
                            onClick={() => setSelectedTaskId(t.id)}
                            className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedTaskId === t.id ? "bg-slate-50/80 font-bold border-l-2 border-indigo-600" : ""}`}
                          >
                            <td className="px-4 py-3.5">
                              <p className="text-slate-900 font-extrabold">{t.title}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-sm mt-0.5">{t.description}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`text-[9px] uppercase px-2 py-0.5 rounded ${priorityColor}`}>{t.priority}</span>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-[10px] text-slate-500">{t.dueDate}</td>
                            <td className="px-4 py-3.5 text-right">
                              <span className={`text-[10px] px-2 py-0.5 rounded-md ${statusBadge}`}>{t.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Task Details panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                {activeTaskDetails ? (
                  <div className="space-y-5">
                    <div className="border-b border-slate-100 pb-3">
                      <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md uppercase tracking-wide">Szczegóły Zadania</span>
                      <h3 className="text-sm font-black text-slate-950 mt-1.5 leading-tight">{activeTaskDetails.title}</h3>
                    </div>

                    <div className="space-y-3.5 text-xs text-slate-600">
                      <div>
                        <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Opis zadania</span>
                        <p className="leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">{activeTaskDetails.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Priorytet</span>
                          <span className="font-bold text-slate-800">{activeTaskDetails.priority}</span>
                        </div>
                        <div>
                          <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                          <span className="font-bold text-slate-800">{activeTaskDetails.status}</span>
                        </div>
                      </div>

                      {/* Associated code files */}
                      <div>
                        <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-2">Załączone pliki kodu</span>
                        <div className="space-y-2">
                          {activeTaskDetails.files.map((fileName: string) => (
                            <div key={fileName} className="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xxs font-mono text-slate-700">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                  <FileCode className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                  <span className="truncate max-w-[120px]">{fileName}</span>
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleStartInlineEdit(fileName)}
                                    className="text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-0.5 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer"
                                  >
                                    <Code className="h-3 w-3" />
                                    <span>Szybka Edycja</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenCodeInEditor(fileName)}
                                    className="text-slate-500 hover:text-slate-700 font-extrabold flex items-center gap-0.5 px-1.5 py-1 rounded hover:bg-slate-100 transition-all cursor-pointer"
                                    title="Otwórz w pełnym osobnym edytorze"
                                  >
                                    <span>Pełny edytor</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Inline Code Editor Section */}
                        {inlineEditingFile && (
                          <div className="border border-slate-200 rounded-2xl bg-slate-900 shadow-lg overflow-hidden flex flex-col mt-4 animate-fadeIn">
                            {/* Editor Tab Bar */}
                            <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-850">
                              <div className="flex items-center gap-2">
                                <FileCode className="h-4 w-4 text-indigo-400 shrink-0" />
                                <span className="font-mono text-xs text-slate-300 font-bold truncate">
                                  {inlineEditingFile}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-900 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                                  Szybka Edycja
                                </span>
                                <button
                                  onClick={() => setInlineEditingFile(null)}
                                  className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-xxs font-mono font-bold px-1.5 py-0.5 rounded hover:bg-slate-800"
                                  title="Zamknij edytor"
                                >
                                  ×
                                </button>
                              </div>
                            </div>

                            {/* Editor Content Box */}
                            <div className="p-3 bg-slate-900 font-mono text-[11px] leading-normal flex gap-2 overflow-x-auto min-h-[220px]">
                              {/* Fake Line Numbers */}
                              <div className="text-slate-600 text-right select-none pr-1 border-r border-slate-800/80 leading-relaxed shrink-0">
                                {inlineEditingContent.split("\n").map((_, i) => (
                                  <div key={i} className="h-4">{i + 1}</div>
                                ))}
                              </div>
                              {/* Textarea Code Area */}
                              <textarea
                                value={inlineEditingContent}
                                onChange={(e) => setInlineEditingContent(e.target.value)}
                                className="flex-1 bg-transparent text-slate-100 focus:outline-hidden resize-y min-h-[200px] leading-relaxed font-mono text-[11px] placeholder-slate-700 font-normal focus:ring-0 focus:border-0 border-0 p-0 w-full whitespace-pre"
                                spellCheck={false}
                              />
                            </div>

                            {/* Editor Stats / Info bar */}
                            <div className="bg-slate-950 px-3.5 py-1.5 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                              <div className="flex items-center gap-3">
                                <span>Linie: {inlineEditingContent.split("\n").length}</span>
                                <span>Znaki: {inlineEditingContent.length}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[9px] text-emerald-500">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Autozapis</span>
                              </div>
                            </div>

                            {/* Editor Controls footer */}
                            <div className="p-2.5 bg-slate-950 border-t border-slate-850 flex gap-2">
                              <button
                                onClick={handleSaveInlineFile}
                                className="flex-1 h-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xxs font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <Save className="h-3 w-3" />
                                <span>Zapisz plik</span>
                              </button>
                              <button
                                onClick={handleDownloadInlineFile}
                                className="h-8 px-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg text-xxs font-bold flex items-center justify-center gap-1 cursor-pointer border border-slate-800 transition-colors"
                                title="Pobierz plik lokalnie"
                              >
                                <Download className="h-3 w-3" />
                                <span>Pobierz</span>
                              </button>
                              <button
                                onClick={handleCopyInlineFile}
                                className="h-8 px-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg text-xxs font-bold flex items-center justify-center cursor-pointer border border-slate-800 transition-colors"
                                title="Kopiuj zawartość"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comment feed */}
                      <div>
                        <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider mb-2">Dyskusja o zadaniu</span>
                        <div className="space-y-2 max-h-36 overflow-y-auto mb-2 pr-1">
                          {activeTaskDetails.comments.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic text-center py-2">Brak komentarzy. Zacznij dyskusję.</p>
                          ) : (
                            activeTaskDetails.comments.map((c: any, idx: number) => (
                              <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px]">
                                <div className="flex justify-between font-bold text-slate-700 mb-0.5">
                                  <span>{c.sender}</span>
                                  <span className="font-mono text-[9px] font-normal text-slate-400">{c.time}</span>
                                </div>
                                <p className="text-slate-600 italic">"{c.text}"</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Send comment */}
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newTaskComment}
                            onChange={(e) => setNewTaskComment(e.target.value)}
                            placeholder="Zostaw notatkę..."
                            className="flex-1 h-8 px-2.5 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-hidden"
                          />
                          <button
                            onClick={() => handleAddTaskComment(activeTaskDetails.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white h-8 px-2.5 rounded-lg text-xxs font-bold flex items-center justify-center cursor-pointer transition-colors"
                          >
                            Dodaj
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Operational controls */}
                    <div className="pt-4 border-t border-slate-100 flex gap-2">
                      {activeTaskDetails.status !== "In Progress" && activeTaskDetails.status !== "Completed" && (
                        <button
                          onClick={() => handleStartTask(activeTaskDetails.id)}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>Rozpocznij</span>
                        </button>
                      )}
                      
                      {activeTaskDetails.status !== "Completed" && (
                        <button
                          onClick={() => handleCompleteTask(activeTaskDetails.id)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Oznacz jako gotowe</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    <CheckSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p>Wybierz zadanie z listy, aby wyświetlić szczegóły, pobrać pliki lub otworzyć je we wbudowanym edytorze kodu.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* 3. PLIKI OD ZESPOŁU                     */}
          {/* ======================================= */}
          {currentTab === "received_files" && !selectedProjectId && (
            <div className="grid gap-6 lg:grid-cols-3">
              
              {/* Files received list */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
                    <Inbox className="h-4 w-4 text-emerald-600" />
                    <span>Pliki i Instrukcje od Zespołu</span>
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Scentralizowana skrzynka odbiorcza dla zasobów przesyłanych do Ciebie przez Administratora.</p>
                </div>

                <div className="space-y-4">
                  {receivedFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        file.status === "New" ? "bg-indigo-50/30 border-indigo-100" : "bg-slate-50/50 border-slate-150"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-xs font-black text-slate-950">{file.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">({file.size})</span>
                            {file.status === "New" && (
                              <span className="bg-indigo-100 text-indigo-700 font-bold text-[9px] px-1.5 py-0.5 rounded">NOWY PLIK</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 italic">"{file.message}"</p>
                          <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                            <span>Wysłał: {file.from}</span>
                            <span>•</span>
                            <span>Projekt: {file.project}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleDownloadReceivedFile(file.id, file.name)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xxs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          <span>Pobierz</span>
                        </button>
                        
                        {/* If code file, support opening in editor */}
                        {(file.name.endsWith(".ts") || file.name.endsWith(".tsx") || file.name.endsWith(".md")) && (
                          <button
                            onClick={() => handleOpenCodeInEditor(file.name)}
                            className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-xxs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Code className="h-3 w-3" />
                            <span>Edytuj w IDE</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback portal card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Wyślij Raport / Notatkę</h3>
                  <p className="text-xxs text-slate-500 leading-normal mb-4">
                    Ukończyłeś pracę lub napotkałeś problem techniczny? Wyślij asynchroniczną informację zwrotną bezpośrednio do Właściciela klastra.
                  </p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-xxs font-bold uppercase tracking-wider text-slate-400 mb-1">Docelowy Projekt</label>
                      <select className="w-full h-9 rounded-lg border border-slate-200 bg-white text-xs px-2.5 focus:border-indigo-500 focus:outline-hidden">
                        <option value="frontend">Frontend Platform</option>
                        <option value="backend">Security API Service</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xxs font-bold uppercase tracking-wider text-slate-400 mb-1">Treść wiadomości</label>
                      <textarea
                        rows={4}
                        placeholder="Poprawki zostały zaimplementowane. Kod przeszedł lokalną kompilację i testy lintera..."
                        className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-hidden resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    toast.success("Raport zwrotny został poprawnie wysłany do Administratora!");
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-4"
                >
                  <Send className="h-4 w-4" />
                  <span>Wyślij Raport do Admina</span>
                </button>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* 4. MY PROJECTS                          */}
          {/* ======================================= */}
          {currentTab === "my_projects" && (
            <div>
              {!selectedProjectId ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-indigo-600" />
                      <span>Moje Aktywne Projekty ({workerProjects.length})</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Twoje przydzielone obszary pracy. Widzisz wyłącznie projekty, do których przypisali Cię administratorzy.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {workerProjects.map((proj) => (
                      <div 
                        key={proj.id}
                        onClick={() => { setSelectedProjectId(proj.id); setProjectSubTab("overview"); }}
                        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-slate-300 cursor-pointer transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-md uppercase">
                              ZESPÓŁ ROBOCZY
                            </span>
                            <span className="text-xs font-bold text-slate-400 font-mono">{proj.progress}%</span>
                          </div>
                          
                          <h3 className="text-sm font-black text-slate-950 tracking-tight">{proj.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">{proj.desc}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                          <div className="flex justify-between text-xxs text-slate-400 mb-1.5">
                            <span>Postęp prac</span>
                            <span>{proj.completedTasksCount} Ukończonych</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${proj.progress}%` }}></div>
                          </div>
                          <div className="mt-3 flex justify-between items-center text-[10px] font-mono text-slate-400">
                            <span>{proj.membersCount} członków</span>
                            <span className="text-indigo-600 font-bold">Otwórz panel projektu →</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Detailed Project Sub-view with inner tabs
                <div className="space-y-6">
                  
                  {/* Project Inner Header */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <button 
                        onClick={() => setSelectedProjectId(null)}
                        className="text-xxs font-black text-indigo-600 hover:text-indigo-850 flex items-center gap-0.5 mb-1 cursor-pointer"
                      >
                        ← Wróć do projektów
                      </button>
                      <h2 className="text-base font-black text-slate-950 tracking-tight">
                        {workerProjects.find(p=>p.id === selectedProjectId)?.name}
                      </h2>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
                      <button
                        onClick={() => setProjectSubTab("overview")}
                        className={`px-3 py-1 text-xxs font-bold rounded-md cursor-pointer transition-all ${
                          projectSubTab === "overview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Przegląd
                      </button>
                      <button
                        onClick={() => setProjectSubTab("tasks")}
                        className={`px-3 py-1 text-xxs font-bold rounded-md cursor-pointer transition-all ${
                          projectSubTab === "tasks" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Zadania ({workerTasks.length})
                      </button>
                      <button
                        onClick={() => setProjectSubTab("files")}
                        className={`px-3 py-1 text-xxs font-bold rounded-md cursor-pointer transition-all ${
                          projectSubTab === "files" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Pliki
                      </button>
                      <button
                        onClick={() => setProjectSubTab("chat")}
                        className={`px-3 py-1 text-xxs font-bold rounded-md cursor-pointer transition-all ${
                          projectSubTab === "chat" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Chat
                      </button>
                    </div>
                  </div>

                  {/* Project Overview Inner Tab */}
                  {projectSubTab === "overview" && (
                    <div className="grid gap-6 sm:grid-cols-3">
                      <div className="sm:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Informacje o projekcie</h3>
                        <div className="grid gap-4 sm:grid-cols-2 text-xs">
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="block text-slate-400 font-bold text-xxs uppercase">Rola w projekcie</span>
                            <span className="text-sm font-black text-slate-800 mt-1 block">Współpracownik (Worker)</span>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="block text-slate-400 font-bold text-xxs uppercase">Otwarte zadania</span>
                            <span className="text-sm font-black text-rose-600 mt-1 block">14 zadań otwartych</span>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="block text-slate-400 font-bold text-xxs uppercase">Ukończone zlecenia</span>
                            <span className="text-sm font-black text-emerald-600 mt-1 block">83 zatwierdzonych</span>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="block text-slate-400 font-bold text-xxs uppercase">Aktywni członkowie</span>
                            <span className="text-sm font-black text-slate-800 mt-1 block">6 osób</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Moi dedykowani partnerzy w tym zespole:</p>
                          <div className="flex gap-2">
                            {members.slice(0, 4).map((m) => (
                              <div key={m.id} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xxs font-bold text-slate-700">
                                <img src={m.avatar} className="h-4.5 w-4.5 rounded-full object-cover" />
                                <span>{m.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
                        <div>
                          <span className="text-xxs font-mono font-bold text-indigo-400 uppercase tracking-widest">Kondycja Builda</span>
                          <h4 className="text-sm font-black tracking-tight mt-1">Status środowiska CI/CD</h4>
                          <p className="text-xxs text-slate-400 mt-2 leading-relaxed">
                            Ostatni test jednostkowy oraz linter pomyślnie przeszły weryfikację na serwerze testowym.
                          </p>

                          <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-400 space-y-1">
                            <div>$ npm run build</div>
                            <div className="text-slate-400">&gt; Building client assets...</div>
                            <div>✓ Compiled successfully (1.2s)</div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
                          <span>Build: #042A</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> SUKCES
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Project Tasks Inner Tab */}
                  {projectSubTab === "tasks" && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Zadania przydzielone w projekcie</h3>
                      
                      <div className="space-y-2.5">
                        {workerTasks.map((task) => (
                          <div 
                            key={task.id}
                            onClick={() => { setSelectedTaskId(task.id); setCurrentTab("my_tasks"); }}
                            className="p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xxs font-bold text-indigo-600 font-mono">[{task.priority}]</span>
                                <h4 className="text-xs font-black text-slate-900">{task.title}</h4>
                              </div>
                              <p className="text-xxs text-slate-400 mt-0.5 font-mono">Termin: {task.dueDate}</p>
                            </div>
                            <span className="text-xxs font-bold text-slate-500 font-mono hover:text-indigo-600">Otwórz zadanie →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Files Inner Tab */}
                  {projectSubTab === "files" && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Drzewo plików projektu</h3>
                        <span className="text-xxs font-mono text-slate-400">3 pliki aktywne</span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {editorFiles.slice(0, 3).map((f, idx) => (
                          <div key={f.name} className="p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between">
                            <div>
                              <FileCode className="h-7 w-7 text-indigo-500 mb-2" />
                              <h4 className="text-xs font-black text-slate-900 truncate">{f.name}</h4>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{f.path}</p>
                            </div>
                            
                            <div className="mt-4 pt-2 border-t border-slate-150/50 flex items-center justify-between">
                              <button
                                onClick={() => handleOpenCodeInEditor(f.name)}
                                className="text-xxs font-extrabold text-indigo-600 hover:text-indigo-850 cursor-pointer"
                              >
                                Edytuj w IDE
                              </button>
                              <span className="text-[10px] text-slate-400 font-mono uppercase">{f.lang}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Chat Inner Tab */}
                  {projectSubTab === "chat" && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                      <div className="border-b border-slate-100 pb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">#frontend-chat</h3>
                        <p className="text-xxs text-slate-500 mt-0.5">Scentralizowany kanał dyskusyjny przeznaczony wyłącznie dla zespołu tego projektu.</p>
                      </div>

                      <div className="h-56 bg-slate-50 rounded-xl p-4 overflow-y-auto space-y-3.5 border border-slate-150">
                        {chats["#frontend-chat"]?.map((msg) => (
                          <div key={msg.id} className="flex gap-2.5 items-start text-xs">
                            <img src={msg.avatar} className="h-7 w-7 rounded-full object-cover" />
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="font-bold text-slate-800">{msg.sender}</span>
                                <span className="font-mono text-[9px] text-slate-400">{msg.time}</span>
                              </div>
                              <p className="text-slate-600 leading-normal">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                          placeholder="Wpisz wiadomość na kanale #frontend-chat..."
                          className="flex-1 h-9 px-3 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-hidden"
                        />
                        <button
                          onClick={() => {
                            // Ensure chat input is sent to frontend-chat
                            const prevChannel = activeChannel;
                            setActiveChannel("#frontend-chat");
                            setTimeout(() => {
                              handleSendChatMessage();
                              setActiveChannel(prevChannel);
                            }, 50);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white h-9 px-4 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Wyślij
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* ======================================= */}
          {/* 5. TEAM CHAT                            */}
          {/* ======================================= */}
          {currentTab === "team_chat" && !selectedProjectId && (
            <div className="grid gap-6 lg:grid-cols-4">
              
              {/* Channel list side rail */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Kanały dyskusyjne</h3>
                
                <div className="space-y-1">
                  {Object.keys(chats).filter(c => c !== "#frontend-chat").map((channel) => {
                    const isSelected = activeChannel === channel;
                    return (
                      <button
                        key={channel}
                        onClick={() => setActiveChannel(channel)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-slate-900 text-white shadow-md" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-slate-400" />
                          <span>{channel}</span>
                        </span>
                        {channel === "#general" && (
                          <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">2</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-150">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Moja Tożsamość</span>
                  <div className="mt-2.5 flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-150">
                    <img src={activeMember?.avatar} className="h-6 w-6 rounded-full object-cover" />
                    <span className="text-xxs font-bold text-slate-700 truncate">{activeMember?.name} (Worker)</span>
                  </div>
                </div>
              </div>

              {/* Chat frame */}
              <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[420px]">
                <div>
                  <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">{activeChannel}</h2>
                      <p className="text-[11px] text-slate-500">Oficjalny kanał komunikacyjny dla tego zespołu.</p>
                    </div>
                    <span className="text-xxs text-slate-400 font-mono">SOC2 Compliant Chat</span>
                  </div>

                  {/* Message stream */}
                  <div className="h-64 overflow-y-auto space-y-4 pr-1">
                    {chats[activeChannel]?.map((msg) => (
                      <div key={msg.id} className="flex gap-3 items-start text-xs">
                        <img src={msg.avatar} className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-150 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-extrabold text-slate-950">{msg.sender}</span>
                            <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-1 py-0.2 rounded font-mono uppercase scale-90">{msg.role}</span>
                            <span className="font-mono text-[9px] text-slate-400">{msg.time}</span>
                          </div>
                          <p className="text-slate-600 leading-normal">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input row */}
                <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                    placeholder={`Napisz wiadomość na kanale ${activeChannel}...`}
                    className="flex-1 h-10 px-3 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-hidden"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white h-10 px-4 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Wyślij
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* 6. MINI VS CODE EDITOR                  */}
          {/* ======================================= */}
          {currentTab === "mini_editor" && !selectedProjectId && (
            <div className="grid gap-6 lg:grid-cols-4">
              
              {/* File Explorer */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xs space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-xxs font-mono text-indigo-400 font-bold uppercase tracking-widest">SaaS Workspace</span>
                  <h3 className="text-xs font-extrabold text-slate-100 mt-0.5">Eksplorator Plików (IDE)</h3>
                </div>

                <div className="space-y-1">
                  {editorFiles.map((file, idx) => {
                    const isSelected = selectedFileIndex === idx;
                    return (
                      <button
                        key={file.name}
                        onClick={() => handleSelectFile(idx)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-mono flex flex-col gap-0.5 transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-slate-800 text-white border-l-2 border-indigo-400" 
                            : "text-slate-400 hover:bg-slate-850 hover:text-slate-100"
                        }`}
                      >
                        <span className="font-extrabold">{file.name}</span>
                        <span className="text-[9px] text-slate-500">{file.path}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono space-y-1">
                  <div>IDE v1.1 • Sandbox Mode</div>
                  <div>Zintegrowany linter aktywny</div>
                </div>
              </div>

              {/* Editor viewport */}
              <div className="lg:col-span-3 bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl min-h-[460px]">
                
                {/* Editor Top Bar */}
                <div className="bg-slate-900/90 border-b border-slate-900 p-3 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-mono font-bold">{editorFiles[selectedFileIndex].path}</span>
                    <span className="text-[9.5px] font-mono text-slate-500 uppercase">({editorFiles[selectedFileIndex].lang})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleSaveFile}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xxs rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Save className="h-3 w-3" />
                      <span>Zapisz</span>
                    </button>
                    <button
                      onClick={handleCopyFile}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xxs rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Kopiuj</span>
                    </button>
                    <button
                      onClick={handleDownloadFile}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xxs rounded-md transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      <span>Pobierz</span>
                    </button>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 flex font-mono text-xs relative">
                  {/* Line numbers column */}
                  <div className="bg-slate-950 text-slate-600 select-none text-right px-3 py-4 border-r border-slate-900/40 text-[11px] leading-relaxed">
                    {Array.from({ length: editorContent.split("\n").length || 1 }).map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  {/* Real-time editable textarea */}
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    className="flex-1 bg-slate-950 text-slate-200 focus:outline-hidden p-4 resize-none leading-relaxed font-mono text-[11.5px]"
                    style={{ whiteSpace: "pre" }}
                  />
                </div>

                {/* Editor Status Bar */}
                <div className="bg-slate-900/50 border-t border-slate-900 p-2.5 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                  <span>UTF-8 • TypeScript Compiler Ready</span>
                  <span className="text-indigo-400 font-semibold">Zatwierdzony przez kompilator klastra</span>
                </div>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* 7. INVITES                              */}
          {/* ======================================= */}
          {currentTab === "invites" && !selectedProjectId && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-500" />
                  <span>Zaproszenia do Współpracy ({invites.filter(i=>i.status === "Pending").length})</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Zaakceptuj zaproszenia, aby dołączyć do dedykowanych zespołów roboczych lub projektów.</p>
              </div>

              <div className="space-y-3">
                {invites.map((inv) => (
                  <div key={inv.id} className="p-4.5 rounded-2xl border border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Mail className="h-4.5 w-4.5 text-slate-500" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-indigo-600 font-bold block">{inv.type}</span>
                        <h4 className="text-xs font-black text-slate-950 mt-0.5">{inv.name}</h4>
                        <p className="text-xxs text-slate-400 mt-1 font-mono">Zaprosił: {inv.from} • {inv.date}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {inv.status === "Pending" ? (
                        <>
                          <button
                            onClick={() => handleAcceptInvite(inv.id, inv.name)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xxs rounded-lg transition-colors cursor-pointer"
                          >
                            Zaakceptuj
                          </button>
                          <button
                            onClick={() => handleDeclineInvite(inv.id, inv.name)}
                            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xxs rounded-lg transition-colors cursor-pointer"
                          >
                            Odrzuć
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xxs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg font-mono uppercase">
                          <Check className="h-3 w-3" /> Zaakceptowane
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* 8. NOTIFICATIONS                        */}
          {/* ======================================= */}
          {currentTab === "notifications" && !selectedProjectId && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-500" />
                    <span>Dziennik powiadomień</span>
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">Chronologiczny spis najnowszych zdarzeń w klastrze.</p>
                </div>
                
                <button
                  onClick={() => {
                    toast.success("Wszystkie powiadomienia klastra zostały oznaczone jako przeczytane.");
                  }}
                  className="text-xxs font-bold text-indigo-600 hover:text-indigo-850 cursor-pointer"
                >
                  Oznacz wszystkie jako przeczytane
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="py-3 flex justify-between items-center hover:bg-slate-50/40 rounded-lg px-2">
                    <div className="flex gap-2.5 items-center">
                      <span className={`h-2 w-2 rounded-full ${n.read ? "bg-slate-300" : "bg-indigo-600 animate-pulse"}`}></span>
                      <p className={`text-xs text-slate-800 ${!n.read ? "font-bold" : "text-slate-600"}`}>{n.text}</p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* 9. MY PROFILE                           */}
          {/* ======================================= */}
          {currentTab === "profile" && !selectedProjectId && (
            <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-slate-100 pb-5">
                <img
                  src={activeMember?.avatar}
                  alt={activeMember?.name}
                  className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
                />
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="text-base font-black text-slate-950 tracking-tight">{activeMember?.name}</h3>
                    <span className="inline-flex items-center rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[9px] font-bold px-2 py-0.5 uppercase tracking-wide">
                      PRACOWNIK (WORKER)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{activeMember?.email}</p>
                  <p className="text-xxs text-slate-400 mt-1">Dział: {activeMember?.department}</p>
                </div>
              </div>

              {/* Technical indicators */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Statystyki Operacyjne</h4>
                
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-xxs uppercase">Ukończone zlecenia</span>
                    <span className="font-mono font-black text-slate-900">42 zadania</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-xxs uppercase">Aktywne projekty</span>
                    <span className="font-mono font-black text-slate-900">2 przypisane</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-xxs uppercase">Linijki kodu w IDE</span>
                    <span className="font-mono font-black text-slate-900">3,490 linii</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-xxs uppercase">Data dołączenia</span>
                    <span className="font-mono font-black text-slate-900">Czerwiec 2026</span>
                  </div>
                </div>
              </div>

              {/* Simulated security audit statement */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xxs text-slate-500 leading-normal flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-slate-800 uppercase tracking-wider mb-0.5">Oświadczenie bezpieczeństwa SOC2 Compliance</h5>
                  <p>
                    Sesje Twojego konta oraz wszelkie operacje na wbudowanym edytorze kodu podlegają asynchronicznemu audytowi SOC2. Aktywność API oraz logowania są szyfrowane kluczami AES-256-GCM.
                  </p>
                </div>
              </div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
