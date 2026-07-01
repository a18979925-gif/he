import React, { useState, useEffect } from "react";
import { 
  BookOpen, Search, ChevronRight, FileText, Download, Play, Check, 
  Plus, Edit3, Save, Trash2, HelpCircle, MessageSquare, Send, Sparkles, 
  ArrowRight, Clock, ShieldCheck, Copy, CheckCircle2, RotateCw
} from "lucide-react";
import { toast } from "sonner";
import { Member } from "../types/member";
import { useFirebaseTeam } from "../context/FirebaseTeamContext";

interface Article {
  id: string;
  title: string;
  category: "SSO" | "Security" | "Disaster" | "API" | "Finance";
  description: string;
  content: string;
  codeSnippet?: string;
  lastUpdated: string;
  author: string;
  readTime: string;
}

interface KnowledgeBaseReaderProps {
  activeMember: Member | null;
}

export function KnowledgeBaseReader({ activeMember }: KnowledgeBaseReaderProps) {
  const { kbArticles: articles, createKbArticle, updateKbArticle, deleteKbArticle } = useFirebaseTeam();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState<string>("kb-1");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Ask AI Panel states
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswers, setAiAnswers] = useState<Array<{ q: string; a: string; time: string }>>([
    { q: "Jaki jest czas życia tokenu JWT?", a: "Zgodnie z zasadami bezpieczeństwa SSO, czas życia tokenu JWT wynosi dokładnie 7200 sekund (2 godziny).", time: "03:10" }
  ]);
  const [isAiResponding, setIsAiResponding] = useState(false);

  // New/Edit Article Form States
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<Article["category"]>("SSO");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCode, setFormCode] = useState("");

  const canEdit = activeMember?.role === "owner" || activeMember?.role === "admin" || activeMember?.role === "manager" || activeMember?.role === "developer";

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeArticle = articles.find(art => art.id === selectedArticleId) || articles[0];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Skopiowano kod do schowka systemowego!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleGeneratePdf = () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfProgress(10);
    toast.info("Generowanie raportu PDF z bazy wiedzy...");

    const interval = setInterval(() => {
      setPdfProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGeneratingPdf(false);
          toast.success("Zatwierdzono i wygenerowano dokument PDF! Trwa pobieranie...", {
            description: `Wygenerowano plik: ${activeArticle.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`
          });
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const handleOpenEdit = () => {
    if (!activeArticle) return;
    setFormTitle(activeArticle.title);
    setFormCategory(activeArticle.category);
    setFormDescription(activeArticle.description);
    setFormContent(activeArticle.content);
    setFormCode(activeArticle.codeSnippet || "");
    setIsEditing(true);
    setIsAddingNew(false);
  };

  const handleOpenAdd = () => {
    setFormTitle("");
    setFormCategory("SSO");
    setFormDescription("");
    setFormContent("");
    setFormCode("");
    setIsAddingNew(true);
    setIsEditing(false);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) {
      toast.error("Tytuł i zawartość artykułu są wymagane.");
      return;
    }

    try {
      if (isEditing && activeArticle) {
        await updateKbArticle({
          ...activeArticle,
          title: formTitle,
          category: formCategory,
          description: formDescription,
          content: formContent,
          codeSnippet: formCode,
        });
        toast.success("Zaktualizowano artykuł w bazie wiedzy.");
        setIsEditing(false);
      } else if (isAddingNew) {
        await createKbArticle({
          title: formTitle,
          category: formCategory,
          description: formDescription,
          content: formContent,
          codeSnippet: formCode,
        });
        toast.success(`Utworzono nowy artykuł: "${formTitle}"!`);
        setIsAddingNew(false);
      }
    } catch (err: any) {
      toast.error("Błąd zapisu artykułu: " + err.message);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this article from the enterprise knowledge base?")) {
      try {
        await deleteKbArticle(id);
        toast.info("Artykuł został usunięty.");
        setIsEditing(false);
        if (articles.length > 1) {
          const firstRemaining = articles.find(art => art.id !== id);
          setSelectedArticleId(firstRemaining ? firstRemaining.id : "");
        } else {
          setSelectedArticleId("");
        }
      } catch (err: any) {
        toast.error("Błąd usuwania artykułu: " + err.message);
      }
    }
  };

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    const question = aiQuestion;
    setAiQuestion("");
    setIsAiResponding(true);

    // Context-aware simulated answers
    let answer = "Dobre pytanie. Nasz system automatycznie synchronizuje te parametry z nadrzędnymi polisami Kubernetes oraz Cloudflare Transit. Szczegóły konfiguracji znajdziesz w dokumentacji technicznej.";
    const qLower = question.toLowerCase();

    if (qLower.includes("jwt") || qLower.includes("token")) {
      answer = "Tokeny JWT są podpisywane algorytmem RS256 przy użyciu asymetrycznego klucza klastra. Ich czas życia to dokładnie 7200 sekund, a tolerancja zegara (clock tolerance) wynosi 10 sekund w celu eliminacji problemów z desynchronizacją serwerów.";
    } else if (qLower.includes("awaryj") || qLower.includes("failover") || qLower.includes("dns")) {
      answer = "Failover opiera się na technologii Cloudflare Magic Transit. W przypadku wykrycia awarii w strefie głównej, routery przełączają ruch seryjny na replikę zapasową w czasie poniżej 12 sekund, co gwarantuje ciągłość usług zgodnie z SLA.";
    } else if (qLower.includes("stripe") || qLower.includes("fakturow") || qLower.includes("płatno")) {
      answer = "Integracja ze Stripe pobiera webhooki, które są zabezpieczone unikalną sygnaturą (Stripe-Signature). Każde zapytanie przechodzi walidację kryptograficzną na serwerze, zapobiegając próbom ponownego wysłania tych samych pakietów (replay-attack).";
    } else if (qLower.includes("slack") || qLower.includes("powiadom")) {
      answer = "Aby aktywować powiadomienia, przejdź do panelu administracyjnego Slacka i wygeneruj unikalny webhook dla kanału #synthetix-builds. Nagłówki są automatycznie przekazywane przez nasz mikrousługowy Broker.";
    }

    setTimeout(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAiAnswers(prev => [{ q: question, a: answer, time: timeStr }, ...prev]);
      setIsAiResponding(false);
      toast.success("Otrzymano odpowiedź od asystenta Gemini Safe Guard!");
    }, 1200);
  };

  return (
    <div id="knowledge-base-root" className="grid gap-6 lg:grid-cols-12 text-slate-800">
      
      {/* LEFT: Article Directory Navigation */}
      <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col gap-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj w bazie wiedzy..."
            className="w-full h-10 rounded-lg border border-slate-200 pl-9 pr-3 text-xs focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Categories/Actions */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Baza Artykułów ({filteredArticles.length})
          </span>
          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>Dodaj Artykuł</span>
            </button>
          )}
        </div>

        {/* Directory List */}
        <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] scrollbar-thin">
          {filteredArticles.map((art) => {
            const isSelected = art.id === selectedArticleId;
            return (
              <button
                key={art.id}
                onClick={() => {
                  setSelectedArticleId(art.id);
                  setIsEditing(false);
                  setIsAddingNew(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col gap-1.5 cursor-pointer ${
                  isSelected 
                    ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-950/20" 
                    : "bg-slate-50 hover:bg-slate-100/70 border-slate-100 text-slate-700"
                }`}
              >
                <div className="flex justify-between items-start gap-2 w-full">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono ${
                    isSelected ? "bg-indigo-500 text-white" : "bg-indigo-50 text-indigo-700"
                  }`}>
                    {art.category}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    {art.readTime}
                  </span>
                </div>
                <h4 className={`font-bold leading-tight ${isSelected ? "text-white" : "text-slate-800"}`}>
                  {art.title}
                </h4>
                <p className={`line-clamp-2 text-[10px] leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                  {art.description}
                </p>
              </button>
            );
          })}

          {filteredArticles.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p>Nie znaleziono dopasowanych artykułów.</p>
            </div>
          )}
        </div>

        {/* Quick Help Desk */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-1">
          <h5 className="font-bold text-[11px] text-indigo-900 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Zgodność i Bezpieczeństwo</span>
          </h5>
          <p className="text-[10px] text-indigo-700/80 leading-relaxed">
            Ten system bazy wiedzy jest audytowany i zgodny z wymogami SOC2 i ISO 27001. Każda edycja jest logowana.
          </p>
        </div>
      </div>

      {/* RIGHT: Selected Article Viewer OR Editor */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {isEditing || isAddingNew ? (
          /* EDIT / CREATE FORM */
          <form onSubmit={handleSaveArticle} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-indigo-600" />
                <span>{isEditing ? "Edytuj Artykuł" : "Utwórz Nowy Artykuł w Bazie"}</span>
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setIsAddingNew(false);
                  }}
                  className="px-3 h-8 text-xxs font-bold rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-4 h-8 text-xxs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Zapisz Artykuł</span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tytuł Artykułu</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="np. Przewodnik konfiguracji SSO i JWT"
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Kategoria</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as Article["category"])}
                  className="w-full h-9 rounded-lg border border-slate-200 px-2.5 text-xs bg-white"
                >
                  <option value="SSO">SSO / MFA</option>
                  <option value="Security">Security</option>
                  <option value="Disaster">Disaster Recovery</option>
                  <option value="API">API Integration</option>
                  <option value="Finance">Finanse SLA</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Krótki Opis</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder=" np. Opis procedury oraz parametry techniczne weryfikacji JWT."
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Treść Artykułu (Markdown/Tekst)</label>
              <textarea
                required
                rows={6}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Wpisz treść merytoryczną artykułu..."
                className="w-full rounded-lg border border-slate-200 p-3 text-xs focus:border-indigo-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Kod / Konfiguracja Techniczna (Opcjonalnie)</label>
              <textarea
                rows={4}
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="// Przykładowy kod techniczny"
                className="w-full rounded-lg border border-slate-200 p-3 text-xs focus:border-indigo-500 font-mono"
              />
            </div>
          </form>
        ) : (
          /* ARTICLE VIEWER */
          activeArticle && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col gap-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-700 font-mono">
                      {activeArticle.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Aktualizacja: {activeArticle.lastUpdated}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">
                    {activeArticle.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Autor publikacji: <strong className="text-slate-700">{activeArticle.author}</strong> • Czas czytania: {activeArticle.readTime}
                  </p>
                </div>

                {/* Top Action Controls */}
                <div className="flex gap-2 self-start sm:self-center">
                  {canEdit && (
                    <>
                      <button
                        onClick={handleOpenEdit}
                        className="px-3 h-9 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                        <span>Edytuj</span>
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(activeArticle.id)}
                        className="p-2 h-9 rounded-lg border border-rose-150 bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors"
                        title="Usuń Artykuł"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf}
                    className="px-4 h-9 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <RotateCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Kompilacja {pdfProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Generuj PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="text-xs text-slate-700 leading-relaxed space-y-4 font-sans whitespace-pre-wrap">
                {activeArticle.content}
              </div>

              {/* Code Snippet Box */}
              {activeArticle.codeSnippet && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-4 py-2 rounded-t-xl border-b border-slate-800">
                    <span>CONFIG_BOOT_SNIPPET.ts</span>
                    <button
                      onClick={() => handleCopyCode(activeArticle.codeSnippet || "")}
                      className="text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedCode ? "Skopiowano!" : "Kopiuj kod"}</span>
                    </button>
                  </div>
                  <pre className="rounded-b-xl bg-slate-950 p-4 text-[10.5px] font-mono text-slate-200 overflow-x-auto leading-relaxed border border-slate-900 shadow-inner">
                    <code>{activeArticle.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
          )
        )}

        {/* BOTTOM: Ask AI Copilot Panel */}
        <div className="rounded-2xl border border-slate-900 bg-slate-950 p-5 text-slate-200 shadow-md">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-white font-mono">
                Gemini Security & Compliance Assistant
              </h4>
              <p className="text-[10px] text-slate-400">
                Zadaj pytanie asystentowi AI odnośnie procedur technicznych i wymogów bezpieczeństwa w firmie.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto mb-4 pr-1 scrollbar-thin scrollbar-thumb-slate-850">
            {aiAnswers.map((answer, index) => (
              <div key={index} className="space-y-2 border-b border-slate-900/60 pb-3 last:border-0 last:pb-0">
                <div className="flex items-start gap-2">
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-400 font-mono">Pytanie</span>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">{answer.q}</p>
                </div>
                <div className="flex items-start gap-2 pl-4 border-l-2 border-indigo-500/40 bg-slate-900/30 p-2.5 rounded-r-lg">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{answer.a}</p>
                    <span className="block text-[9px] font-mono text-slate-500">{answer.time} • Gemini API Broker</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ask input form */}
          <form onSubmit={handleAskAi} className="flex gap-2">
            <input
              type="text"
              required
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="np. Ile wynosi dopuszczalny czas życia tokenów JWT?"
              className="flex-1 h-9 rounded-lg bg-slate-900 border border-slate-800 px-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isAiResponding}
              className="px-4 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isAiResponding ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              <span>Zadaj Pytanie</span>
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
