import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Member } from "../types/member";
import { Project } from "../types/team";
import { 
  Eye, Heart, Bookmark, Share2, AlertTriangle, Filter, Grid, List, 
  Search, Check, ArrowUpDown, ChevronRight, BookOpen, Star, Sparkles, Clock, Globe, Shield, Terminal,
  Play, RefreshCw, Laptop, X
} from "lucide-react";
import { toast } from "sonner";
import { EpicLoginPreview } from "./EpicLoginPreview";

interface ViewerRoleDashboardProps {
  activeMember: Member | null;
  projects: Project[];
}

interface ExploreProject {
  id: string;
  name: string;
  owner: string;
  avatar: string;
  description: string;
  tech: string[];
  status: string;
  followers: number;
  members: number;
  category: string;
  difficulty: "Łatwy" | "Średni" | "Trudny";
  visibility: "Publiczny" | "Prywatny";
  license: string;
  language: string;
  coverUrl: string;
  roadmap: string[];
  docs: string;
}

export const ViewerRoleDashboard: React.FC<ViewerRoleDashboardProps> = ({
  activeMember,
  projects
}) => {
  // Dynamically map projects prop from Firebase to ExploreProject interface
  const mappedProjects = React.useMemo(() => {
    const listToMap = projects || [];

    return listToMap.map((p) => {
      return {
        id: p.id,
        name: p.name,
        owner: "Klaster Synthetix",
        avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=80&h=80&fit=crop",
        description: p.description,
        tech: p.tags && p.tags.length > 0 ? p.tags : ["React", "TypeScript", "Tailwind CSS"],
        status: p.status === "active" ? "Aktywny" : (p.status || "Aktywny"),
        followers: p.revenue ? Math.floor(p.revenue / 1200) + 12 : 55,
        members: p.memberCount || 1,
        category: p.tags?.[0] || "Core-Service",
        difficulty: "Średni" as const,
        visibility: "Publiczny" as const,
        license: "MIT",
        language: "Polski",
        coverUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
        roadmap: [
          "Faza 1: Opracowanie architektury oraz diagramów (Zakończona)",
          "Faza 2: Integracja z klastrem Firebase & Auth (W trakcie)",
          "Faza 3: Testy penetracyjne, odporność kwantowa (Planowana)"
        ],
        docs: `# ${p.name}\nDokumentacja techniczna dla projektu ${p.name}.\n\nOpis projektu:\n${p.description || "Brak opisu"}`
      };
    });
  }, [projects]);

  const exploreProjects = mappedProjects;
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Set default selected project when list loads or changes
  React.useEffect(() => {
    if (exploreProjects.length > 0) {
      if (!selectedProjectId || !exploreProjects.some(p => p.id === selectedProjectId)) {
        setSelectedProjectId(exploreProjects[0].id);
      }
    }
  }, [exploreProjects, selectedProjectId]);

  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);
  const [feedType, setFeedType] = useState<"featured" | "trending" | "newest" | "recommended">("featured");
  
  // Sidebar Filter States
  const [filterTech, setFilterTech] = useState<string>("Wszystkie");
  const [filterCategory, setFilterCategory] = useState<string>("Wszystkie");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("Wszystkie");
  const [filterRecruitment, setFilterRecruitment] = useState<boolean | null>(null);
  const [filterLanguage, setFilterLanguage] = useState<string>("Wszystkie");

  // Grid/List toggling
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "stars">("popular");

  // Follow & Bookmark state Simulation
  const [followedProjectIds, setFollowedProjectIds] = useState<string[]>(["proj_1"]);
  const [bookmarkedProjectIds, setBookmarkedProjectIds] = useState<string[]>(["proj_2"]);

  const fallbackProject: ExploreProject = {
    id: "fallback",
    name: "Brak projektu",
    owner: "Synthetix Team",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
    description: "Brak dostępnych projektów w tym klastrze.",
    tech: ["Brak"],
    status: "Nieaktywny",
    followers: 0,
    members: 0,
    category: "Ogólne",
    difficulty: "Łatwy",
    visibility: "Publiczny",
    license: "Brak",
    language: "Polski",
    coverUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    roadmap: [],
    docs: "# Brak projektu\nDodaj nowy projekt, aby zobaczyć szczegóły."
  };

  const activeProject = exploreProjects.find(p => p.id === selectedProjectId) || exploreProjects[0] || fallbackProject;

  const handleFollow = (id: string, name: string) => {
    if (followedProjectIds.includes(id)) {
      setFollowedProjectIds(prev => prev.filter(pId => pId !== id));
      toast.info(`Przestałeś obserwować projekt "${name}"`);
    } else {
      setFollowedProjectIds(prev => [...prev, id]);
      toast.success(`Teraz obserwujesz projekt "${name}"!`);
    }
  };

  const handleBookmark = (id: string, name: string) => {
    if (bookmarkedProjectIds.includes(id)) {
      setBookmarkedProjectIds(prev => prev.filter(pId => pId !== id));
      toast.info(`Usunięto projekt "${name}" z zakładek`);
    } else {
      setBookmarkedProjectIds(prev => [...prev, id]);
      toast.success(`Dodano projekt "${name}" do zakładek!`);
    }
  };

  const handleShare = (name: string) => {
    const shareUrl = `${window.location.origin}/project/${selectedProjectId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success(`Skopiowano link udostępniania dla projektu "${name}" do schowka systemowego!`);
    }).catch(() => {
      toast.success(`Link udostępniania dla "${name}" został pomyślnie wygenerowany!`);
    });
  };

  const handleReport = (name: string) => {
    const reason = window.prompt(`Podaj powód zgłoszenia projektu "${name}":`, "Niedozwolone słownictwo lub błędy w kodzie.");
    if (reason === null) return; // User cancelled
    if (!reason.trim()) {
      toast.error("Powód zgłoszenia nie może być pusty!");
      return;
    }
    toast.success(`Projekt "${name}" został zgłoszony z powodu: "${reason}". Dziękujemy za zgłoszenie!`);
  };

  // Filter projects
  const filteredProjects = exploreProjects.filter(project => {
    // Search
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.tech.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Tech filter
    const matchesTech = filterTech === "Wszystkie" || project.tech.includes(filterTech);
    // Category
    const matchesCategory = filterCategory === "Wszystkie" || project.category === filterCategory;
    // Difficulty
    const matchesDifficulty = filterDifficulty === "Wszystkie" || project.difficulty === filterDifficulty;
    // Language
    const matchesLanguage = filterLanguage === "Wszystkie" || project.language === filterLanguage;

    return matchesSearch && matchesTech && matchesCategory && matchesDifficulty && matchesLanguage;
  }).sort((a, b) => {
    if (sortBy === "newest") return b.id.localeCompare(a.id);
    if (sortBy === "stars") return b.followers - a.followers;
    return b.followers - a.followers; // Default popular
  });

  // Hero feed options mapping
  const heroProjects = exploreProjects.filter((p, i) => {
    if (feedType === "featured") return i === 0 || i === 2;
    if (feedType === "trending") return p.followers > 200;
    if (feedType === "newest") return i === 1 || i === 3;
    return i === 2 || i === 3; // recommended
  });

  return (
    <div id="viewer-dashboard-container" className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-1.5 animate-fadeIn">
      
      {/* 1. Left Sidebar Filters (1 column) */}
      <div id="viewer-sidebar" className="xl:col-span-1 space-y-5 rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
          <Filter className="h-4.5 w-4.5 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Filtry Odkrywania</h3>
        </div>

        {/* Search */}
        <div className="space-y-1.5">
          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Szukaj słów kluczowych</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="np. Rust, React..."
              className="w-full h-9 pl-8.5 pr-3 text-xxs border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-hidden transition-all focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Technology */}
        <div className="space-y-1.5">
          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Technologia</label>
          <select
            value={filterTech}
            onChange={(e) => setFilterTech(e.target.value)}
            className="w-full h-9 px-3 text-xxs border border-slate-200 rounded-lg bg-white focus:outline-hidden text-slate-700 cursor-pointer focus:border-indigo-500 font-medium"
          >
            <option value="Wszystkie">Wszystkie technologie</option>
            <option value="React">React</option>
            <option value="TypeScript">TypeScript</option>
            <option value="Rust">Rust</option>
            <option value="Python">Python</option>
            <option value="Next.js">Next.js</option>
          </select>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Kategoria projektu</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full h-9 px-3 text-xxs border border-slate-200 rounded-lg bg-white focus:outline-hidden text-slate-700 cursor-pointer focus:border-indigo-500 font-medium"
          >
            <option value="Wszystkie">Wszystkie kategorie</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Infrastruktura">Infrastruktura</option>
            <option value="Sztuczna Inteligencja">Sztuczna Inteligencja</option>
            <option value="IoT">IoT</option>
          </select>
        </div>

        {/* Difficulty */}
        <div className="space-y-1.5">
          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Poziom trudności</label>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="w-full h-9 px-3 text-xxs border border-slate-200 rounded-lg bg-white focus:outline-hidden text-slate-700 cursor-pointer focus:border-indigo-500 font-medium"
          >
            <option value="Wszystkie">Dowolny poziom</option>
            <option value="Łatwy">Łatwy</option>
            <option value="Średni">Średni</option>
            <option value="Trudny">Trudny</option>
          </select>
        </div>

        {/* Language */}
        <div className="space-y-1.5">
          <label className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Język projektu</label>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="w-full h-9 px-3 text-xxs border border-slate-200 rounded-lg bg-white focus:outline-hidden text-slate-700 cursor-pointer focus:border-indigo-500 font-medium"
          >
            <option value="Wszystkie">Dowolny język</option>
            <option value="Polski">Polski</option>
            <option value="Angielski">Angielski</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[10px] text-indigo-800 leading-normal flex items-start gap-2">
            <Shield className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Tryb Odkrywania (Widz)</p>
              <p className="mt-0.5 text-slate-500 font-mono text-[9px]">
                Masz pełny dostęp do podglądu architektury i portfolio, ale bez uprawnień zapisu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Content Panel (2 columns) */}
      <div id="viewer-main-panel" className="xl:col-span-2 space-y-6">
        
        {/* Horizontal Hero Feed Tabs */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Polecane Projekty (Hero Feed)</h4>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {(["featured", "trending", "newest", "recommended"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFeedType(tab)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    feedType === tab 
                      ? "bg-white text-indigo-600 shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "featured" ? "Featured" : tab === "trending" ? "Trending" : tab === "newest" ? "Newest" : "Recommended"}
                </button>
              ))}
            </div>
          </div>

          {/* Hero List Horizonal slider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heroProjects.map((proj) => (
              <div 
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`relative group rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  selectedProjectId === proj.id 
                    ? "border-indigo-500 ring-1 ring-indigo-500" 
                    : "border-slate-200"
                }`}
              >
                <div className="h-24 w-full overflow-hidden relative">
                  <img 
                    src={proj.coverUrl} 
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono font-bold text-white">
                    {proj.difficulty}
                  </div>
                </div>
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={proj.avatar} className="h-5 w-5 rounded-full" alt={proj.owner} />
                    <span className="text-[10px] text-slate-500 font-medium">{proj.owner}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{proj.name}</h5>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{proj.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {proj.tech.slice(0, 3).map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-150 text-[9px] font-mono text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      {proj.followers}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectId(proj.id);
                        toast.success(`Ładowanie podglądu dla "${proj.name}"`);
                      }}
                      className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold transition-all text-[9px]"
                    >
                      Podgląd
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Feed Header with Toggles & Sorters */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Wszystkie Projekty ({filteredProjects.length})</h4>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sorter */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    sortBy === "popular" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Najpopularniejsze
                </button>
                <button
                  onClick={() => setSortBy("newest")}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    sortBy === "newest" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Najnowsze
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-1 rounded cursor-pointer ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500"}`}
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-1 rounded cursor-pointer ${viewMode === "list" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500"}`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty State check */}
          {filteredProjects.length === 0 ? (
            <div className="p-10 text-center space-y-3 rounded-xl bg-slate-50/50 border border-dashed border-slate-200">
              <AlertTriangle className="h-8 w-8 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-slate-700">Nie znaleziono projektów</h5>
                <p className="text-[10px] text-slate-400">Spróbuj wyczyścić wybrane filtry lub wpisać inne hasło.</p>
              </div>
              <button 
                onClick={() => {
                  setFilterTech("Wszystkie");
                  setFilterCategory("Wszystkie");
                  setFilterDifficulty("Wszystkie");
                  setFilterLanguage("Wszystkie");
                  setSearchQuery("");
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-extrabold text-xxs transition-all cursor-pointer"
              >
                Wyczyść filtry
              </button>
            </div>
          ) : (
            /* Project Feed Display */
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map((proj) => {
                  const isFollowed = followedProjectIds.includes(proj.id);
                  const isBookmarked = bookmarkedProjectIds.includes(proj.id);
                  return (
                    <div 
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between ${
                        selectedProjectId === proj.id 
                          ? "border-indigo-600 bg-indigo-50/5" 
                          : "border-slate-200 bg-slate-50/20 hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            proj.status === "Aktywny" ? "bg-emerald-50 border border-emerald-100 text-emerald-700" :
                            proj.status === "Beta" ? "bg-indigo-50 border border-indigo-100 text-indigo-700" :
                            "bg-amber-50 border border-amber-100 text-amber-700"
                          }`}>
                            {proj.status}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                            {proj.license}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-1">{proj.name}</h4>
                          <p className="text-[10px] text-slate-500 leading-normal line-clamp-2 mt-1">{proj.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {proj.tech.map(t => (
                            <span key={t} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[9px] font-mono text-slate-500">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 text-[10px] text-slate-400">
                        <span className="font-medium text-slate-500">Członkowie: {proj.members}</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmark(proj.id, proj.name);
                            }}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isBookmarked ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            <Bookmark className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollow(proj.id, proj.name);
                            }}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isFollowed ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            <Heart className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProjects.map((proj) => {
                  const isFollowed = followedProjectIds.includes(proj.id);
                  const isBookmarked = bookmarkedProjectIds.includes(proj.id);
                  return (
                    <div 
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        selectedProjectId === proj.id 
                          ? "border-indigo-600 bg-indigo-50/10" 
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img src={proj.coverUrl} className="h-10 w-12 rounded object-cover" alt="" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{proj.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate">{proj.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex gap-1">
                          {proj.tech.slice(0, 2).map(t => (
                            <span key={t} className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-150 text-[9px] font-mono text-slate-500">
                              {t}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">★ {proj.followers}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollow(proj.id, proj.name);
                            }}
                            className={`p-1.5 rounded-md border ${
                              isFollowed ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-white border-slate-200 text-slate-400"
                            }`}
                          >
                            <Heart className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* 3. Right Context Panel (1 column) */}
      <div id="viewer-right-panel" className="xl:col-span-1 rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-5">
        <div className="border-b border-slate-150 pb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Szczegóły Projektu</h3>
        </div>

        <div className="space-y-4">
          <div className="h-28 w-full rounded-xl overflow-hidden relative">
            <img 
              src={activeProject.coverUrl} 
              alt={activeProject.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
              <span className="text-xs font-bold text-white truncate">{activeProject.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <img src={activeProject.avatar} className="h-6 w-6 rounded-full" alt="" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Właściciel Projektu</p>
              <p className="text-xs font-semibold text-slate-700">{activeProject.owner}</p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Opis</span>
            <p className="text-xxs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/40">
              {activeProject.description}
            </p>
          </div>

          {/* Technology stack list */}
          <div className="space-y-1.5">
            <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Stos technologiczny</span>
            <div className="flex flex-wrap gap-1">
              {activeProject.tech.map(t => (
                <span key={t} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-mono font-bold">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Roadmap */}
          <div className="space-y-2">
            <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Plan działania (Roadmap)</span>
            <div className="space-y-2 font-mono text-[9px]">
              {activeProject.roadmap.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-600 leading-normal">
                  <ChevronRight className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Microcopy disclaimer of no edit */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-[10px] text-amber-800 leading-normal flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Brak uprawnień do edycji</p>
              <p className="text-slate-500 text-[9px]">
                Zalogowano jako {activeMember?.name || "Widz"}. Twoja rola nie pozwala na wprowadzanie modyfikacji w tym klastrze projektowym.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            {/* Live Playable Sandbox Button */}
            <button
              onClick={() => {
                toast.success(`Uruchamianie podglądu dla "${activeProject.name}"...`);
                setShowLivePreviewModal(true);
              }}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-indigo-750 hover:from-indigo-500 hover:to-indigo-650 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-lg hover:-translate-y-0.5"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Uruchom Podgląd Live (Interaktywny)</span>
            </button>

            <button 
              onClick={() => handleFollow(activeProject.id, activeProject.name)}
              className="w-full h-9 bg-slate-150 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold text-xxs rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Heart className={`h-3.5 w-3.5 ${followedProjectIds.includes(activeProject.id) ? "text-rose-600 fill-rose-600" : "text-slate-500"}`} />
              <span>Obserwuj projekt</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleBookmark(activeProject.id, activeProject.name)}
                className="h-9 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xxs rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Bookmark className="h-3 w-3" />
                <span>Zapisz</span>
              </button>

              <button 
                onClick={() => handleShare(activeProject.name)}
                className="h-9 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xxs rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Share2 className="h-3 w-3" />
                <span>Udostępnij</span>
              </button>
            </div>

            <button 
              onClick={() => handleReport(activeProject.name)}
              className="w-full h-8 text-[10px] text-rose-500 hover:text-rose-600 flex items-center justify-center gap-1 transition-colors cursor-pointer font-medium"
            >
              <AlertTriangle className="h-3 w-3" />
              <span>Zgłoś projekt administracji</span>
            </button>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN INTERACTIVE LIVE SANDBOX MODAL */}
      <AnimatePresence>
        {showLivePreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-5xl h-[85vh] bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden relative"
            >
              {/* Header */}
              <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-indigo-500/15 text-indigo-400 rounded-lg">
                    <Laptop className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm">{activeProject.name} // Piaskownica</h3>
                    <p className="text-[10px] text-zinc-400">Interaktywne środowisko uruchomieniowe (Host: Port 3000)</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowLivePreviewModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-750 text-xs font-bold text-zinc-350 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span>Zamknij</span>
                </button>
              </div>

              {/* Live Preview body */}
              <div className="flex-1 bg-[#121212] overflow-auto flex flex-col justify-between">
                <EpicLoginPreview onBackToDashboard={() => setShowLivePreviewModal(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
