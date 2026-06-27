import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Trash2, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle, 
  HelpCircle, 
  Search, 
  Terminal, 
  Code, 
  ChevronRight, 
  ArrowRight,
  TrendingDown, 
  Activity, 
  FileCode, 
  ShieldCheck, 
  Play, 
  Sparkles,
  Info,
  Layers,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface DeadCodeTabProps {
  activeProject: CodeScopeAnalysis;
}

// Interactive Code Snippet Database with AST Chain metadata
const MOCK_SNIPPETS: Record<string, { code: string; lineStart: number; language: string; astChain: string[] }> = {
  "calculateLegacyTax()": {
    language: "java",
    lineStart: 180,
    astChain: ["SpringMvcRouter", "OrderService.java", "calculateLegacyTax() (0 Refs)"],
    code: `180:   // DEPRECATED: Relic of previous billing engine
181:   // Replaced by external Avalara API integrations
182:   @Deprecated(since = "2.4")
183:   @TransactionTimeout(30)
184:-  public BigDecimal calculateLegacyTax(Order order) {
185:-      BigDecimal base = order.getSubtotal().multiply(0.0825);
186:-      BigDecimal surcharge = order.getShipping().multiply(0.05);
187:-      return base.add(surcharge).setScale(2, RoundingMode.HALF_UP);
188:-  }
189:
190:   public BigDecimal calculateCurrentTax(Order order) {`
  },
  "deconstructToken()": {
    language: "java",
    lineStart: 88,
    astChain: ["SecurityChainFilter", "AuthService.java", "deconstructToken() (0 Refs)"],
    code: `88:   // Bypassed: Session authentication migrated to 
89:   // decentralized JWT verify signatures.
90:   @Deprecated
91:   @Audited(action = AuditingAction.READ)
92:-  private Claims deconstructToken(String token) {
93:-      String rawKey = this.config.getLegacyClientSecretKey();
94:-      return Jwts.parser().setSigningKey(rawKey).parseClaimsJws(token).getBody();
95:-  }
96:
97:   public boolean validateJwtToken(String jwt) {`
  },
  "validateOldSession()": {
    language: "java",
    lineStart: 110,
    astChain: ["WebSecurityConfigurer", "WebSecurityConfig.java", "validateOldSession() (0 Refs)"],
    code: `110:   // Bypassed by JWT stateless WebFilter upgrades
111:   // Reference count: 0 (Dead Code path)
112:   @Deprecated
113:-  protected boolean validateOldSession(HttpServletRequest req) {
114:-      String sessionId = req.getHeader("X-Legacy-Session-Id");
115:-      if (sessionId == null) return false;
116:-      return sessionRegistry.containsSession(sessionId);
117:-  }
118:
119:   @Bean
120:   public SecurityFilterChain filterChain(HttpSecurity http) {`
  },
  "purgeTempCart()": {
    language: "java",
    lineStart: 401,
    astChain: ["SpringMvcRouter", "CartController.java", "purgeTempCart() (0 Refs)"],
    code: `401:   // Cart cleanup is now scheduled automatically via
402:   // Redis Key Space notifications (TTL Expiry)
403:   @DeleteMapping("/temp-cart")
404:-  public ResponseEntity<?> purgeTempCart(@RequestParam String cartId) {
405:-      log.warn("Invoking deprecated local cart purge endpoint");
406:-      cartService.deleteCartFromMemoryStore(cartId);
407:-      return ResponseEntity.ok().build();
408:-  }
409:
410:   @GetMapping("/cart/{id}")`
  },
  "formatXmlHeaders()": {
    language: "java",
    lineStart: 50,
    astChain: ["InterceptorRegistry", "WebMvcConfig.java", "formatXmlHeaders() (0 Refs)"],
    code: `50:   // Leftover method since payload streams switched
51:   // entirely to JSON standardizations.
52:   @Deprecated
53:   @SuppressWarnings("unused")
54:-  public void formatXmlHeaders(HttpServletResponse response) {
55:-      response.setContentType("application/xml");
56:-      response.setCharacterEncoding("UTF-8");
57:-      response.setHeader("Cache-Control", "no-transform");
58:-  }
59:
60:   @Override
61:   public void addInterceptors(InterceptorRegistry r) {`
  },
  "DELETE": {
    language: "java",
    lineStart: 20,
    astChain: ["RouteTable", "UserController.java", "DELETE /api/users/temp (0 Refs)"],
    code: `20:   // Bypassed: Route endpoint registered but lacks active 
21:   // handlers or security token approvals.
22:   @RestController
23:   @RequestMapping("/api/users")
24:-  @DeleteMapping("/temp")
25:-  public ResponseEntity<Void> deleteTempUsers() {
26:-      // Dead controller mapping; database deletes are event-driven
27:-      return ResponseEntity.noContent().build();
28:-  }
29:
30:   @GetMapping("/me")`
  },
  "POST": {
    language: "java",
    lineStart: 40,
    astChain: ["TestRouter", "AuthController.java", "POST /api/test/reset (0 Refs)"],
    code: `40:   // WARNING: Integration testing endpoint leak.
41:   // Bypassed and disabled on production profiles.
42:   @Profile("test")
43:-  @PostMapping("/api/test/reset")
44:-  public ResponseEntity<Map<String, Object>> resetTestDatabase() {
45:-      dbMigrator.purgeAllDataForTesting();
46:-      return ResponseEntity.ok(Map.of("status", "reset_success"));
47:-  }
48:
49:   @PostMapping("/api/login")`
  },
  "GET": {
    language: "java",
    lineStart: 85,
    astChain: ["LegacyFilter", "ProductController.java", "GET /api/catalog/legacy (0 Refs)"],
    code: `85:   // Deprecated: Current UI makes unified calls 
86:   // to new pagination router at /products.
87:-  @GetMapping("/api/catalog/legacy")
88:-  public List<ProductDTO> getLegacyCatalog() {
89:-      log.debug("Routing to legacy product catalog adapter");
90:-      return catalogService.fetchLegacyFeed();
91:-  }
92:
93:   @GetMapping("/products")`
  },
  "import { parseString } from 'xml-loader'": {
    language: "typescript",
    lineStart: 1,
    astChain: ["ImportsList", "WebMvcConfig.java", "import xml-loader (0 Refs)"],
    code: `1:  package com.ecommerce.config;
2:  
3:  import org.springframework.context.annotation.Configuration;
4:  import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
5:- import { parseString } from 'xml-loader';
6:  import javax.servlet.http.HttpServletResponse;`
  },
  "import com.ecommerce.payment.LegacyStripeProvider": {
    language: "java",
    lineStart: 1,
    astChain: ["ImportsList", "OrderService.java", "LegacyStripeProvider (0 Refs)"],
    code: `1:  package com.ecommerce.service;
2:  
3:  import java.math.BigDecimal;
4:- import com.ecommerce.payment.LegacyStripeProvider;
5:  import com.ecommerce.sdk.payment.StripeClient;
6:  import org.slf4j.Logger;`
  },
  "import java.util.logging.SimpleFormatter": {
    language: "java",
    lineStart: 3,
    astChain: ["ImportsList", "ProductController.java", "SimpleFormatter (0 Refs)"],
    code: `3:  package com.ecommerce.controller;
4:  
5:  import org.slf4j.LoggerFactory;
6:- import java.util.logging.SimpleFormatter;
7:  import java.util.logging.LogRecord;
8:  import org.springframework.web.bind.annotation.RestController;`
  }
};

export const DeadCodeTab: React.FC<DeadCodeTabProps> = ({ activeProject }) => {
  const [cleaned, setCleaned] = useState<boolean>(false);
  const [cleaning, setCleaning] = useState<boolean>(false);
  const [sweepLogs, setSweepLogs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<'method' | 'endpoint' | 'import'>('method');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Core AST dead code instances state
  const [deadMethods, setDeadMethods] = useState([
    { name: "calculateLegacyTax()", file: "OrderService.java", line: 184, reason: "No references found in active controller or services mapping." },
    { name: "deconstructToken()", file: "AuthService.java", line: 92, reason: "Superceded by unified OAuth JWT helper validations." },
    { name: "validateOldSession()", file: "WebSecurityConfig.java", line: 114, reason: "Dead routing code path bypassed by security upgrades." },
    { name: "purgeTempCart()", file: "CartController.java", line: 405, reason: "Cart expiry logic migrated to Redis TTL schedules." },
    { name: "formatXmlHeaders()", file: "WebMvcConfig.java", line: 55, reason: "Leftover utility method after switching payload streams to JSON." }
  ]);

  const [deadEndpoints, setDeadEndpoints] = useState([
    { method: "DELETE", url: "/api/users/temp", file: "UserController.java", reason: "Route registration is active but has no handler binder." },
    { method: "POST", url: "/api/test/reset", file: "AuthController.java", reason: "Integration testing router leftover; never called in production." },
    { method: "GET", url: "/api/catalog/legacy", file: "ProductController.java", reason: "Deprecated feed URL, current UI requests /products." }
  ]);

  const [deadImports, setDeadImports] = useState([
    { importStmt: "import { parseString } from 'xml-loader'", file: "WebMvcConfig.java", line: 5, reason: "Unused package reference." },
    { importStmt: "import com.ecommerce.payment.LegacyStripeProvider", file: "OrderService.java", line: 4, reason: "Stripe client replaced with Stripe SDK." },
    { importStmt: "import java.util.logging.SimpleFormatter", file: "ProductController.java", line: 8, reason: "Logging rewritten to use slf4j logger API." }
  ]);

  // Sync selected index when switching sub-tabs
  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedType]);

  const handleCleanSweep = () => {
    setCleaning(true);
    setSweepLogs([]);

    const logs = [
      "🔍 [AST Scan] Initializing parser for " + activeProject.projectName + "...",
      "⚙️ [AST Scan] Building AST symbol tables and dependency trees...",
      "📂 [AST Scan] Validating internal route descriptors & controller targets...",
      "⚠️ [AST Scan] Discovered: 17 orphaned methods, 4 unused endpoints, 23 imports",
      "⚡ [AST Purge] Removing 17 redundant method signatures from class definitions...",
      "✂️ [AST Purge] Safe-pruning 23 unreferenced library imports from compilation pipeline...",
      "🚀 [AST Purge] Unregistering obsolete controllers from routing mappings...",
      "✅ [AST Success] Codebase optimization completed successfully. Errors: 0"
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setSweepLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setTimeout(() => {
            setDeadMethods([]);
            setDeadEndpoints([]);
            setDeadImports([]);
            setCleaned(true);
            setCleaning(false);
          }, 300);
        }
      }, index * 200);
    });
  };

  const handleReset = () => {
    setCleaned(false);
    setDeadMethods([
      { name: "calculateLegacyTax()", file: "OrderService.java", line: 184, reason: "No references found in active controller or services mapping." },
      { name: "deconstructToken()", file: "AuthService.java", line: 92, reason: "Superceded by unified OAuth JWT helper validations." },
      { name: "validateOldSession()", file: "WebSecurityConfig.java", line: 114, reason: "Dead routing code path bypassed by security upgrades." },
      { name: "purgeTempCart()", file: "CartController.java", line: 405, reason: "Cart expiry logic migrated to Redis TTL schedules." },
      { name: "formatXmlHeaders()", file: "WebMvcConfig.java", line: 55, reason: "Leftover utility method after switching payload streams to JSON." }
    ]);
    setDeadEndpoints([
      { method: "DELETE", url: "/api/users/temp", file: "UserController.java", reason: "Route registration is active but has no handler binder." },
      { method: "POST", url: "/api/test/reset", file: "AuthController.java", reason: "Integration testing router leftover; never called in production." },
      { method: "GET", url: "/api/catalog/legacy", file: "ProductController.java", reason: "Deprecated feed URL, current UI requests /products." }
    ]);
    setDeadImports([
      { importStmt: "import { parseString } from 'xml-loader'", file: "WebMvcConfig.java", line: 5, reason: "Unused package reference." },
      { importStmt: "import com.ecommerce.payment.LegacyStripeProvider", file: "OrderService.java", line: 4, reason: "Stripe client replaced with Stripe SDK." },
      { importStmt: "import java.util.logging.SimpleFormatter", file: "ProductController.java", line: 8, reason: "Logging rewritten to use slf4j logger API." }
    ]);
    setSelectedIndex(0);
    setSelectedType('method');
  };

  const handleDeleteItem = (type: 'method' | 'endpoint' | 'import', index: number) => {
    if (type === 'method') {
      setDeadMethods(prev => {
        const next = prev.filter((_, i) => i !== index);
        if (next.length === 0 && deadEndpoints.length === 0 && deadImports.length === 0) setCleaned(true);
        return next;
      });
    } else if (type === 'endpoint') {
      setDeadEndpoints(prev => {
        const next = prev.filter((_, i) => i !== index);
        if (deadMethods.length === 0 && next.length === 0 && deadImports.length === 0) setCleaned(true);
        return next;
      });
    } else {
      setDeadImports(prev => {
        const next = prev.filter((_, i) => i !== index);
        if (deadMethods.length === 0 && deadEndpoints.length === 0 && next.length === 0) setCleaned(true);
        return next;
      });
    }
  };

  // Lists filtering based on search query
  const filteredMethods = deadMethods.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEndpoints = deadEndpoints.filter(ep => 
    ep.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ep.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredImports = deadImports.filter(imp => 
    imp.importStmt.toLowerCase().includes(searchQuery.toLowerCase()) || 
    imp.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
    imp.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeList = selectedType === 'method' 
    ? filteredMethods 
    : selectedType === 'endpoint' 
      ? filteredEndpoints 
      : filteredImports;

  const currentItem = activeList[selectedIndex] || activeList[0] || null;

  // Retrieve code preview block details
  const getSnippetKey = (item: any) => {
    if (!item) return "";
    if (item.name) return item.name;
    if (item.method) return item.method; // DELETE, POST, GET
    if (item.importStmt) return item.importStmt;
    return "";
  };

  const snippetKey = getSnippetKey(currentItem);
  const snippetData = MOCK_SNIPPETS[snippetKey] || {
    language: "java",
    lineStart: 1,
    astChain: ["Scanner", "File", "Symbol"],
    code: `// AST Code block preview not found for this element.\n// This item may have been custom processed.`
  };

  // Helper parser for diff highlighting
  const renderCodeSnippet = (snippetCode: string) => {
    const lines = snippetCode.split("\n");
    return lines.map((line, idx) => {
      const colonIndex = line.indexOf(":");
      let lineNum = String(idx + 1);
      let codePart = line;

      if (colonIndex !== -1) {
        lineNum = line.substring(0, colonIndex).trim();
        codePart = line.substring(colonIndex + 1);
      }

      const isDeleted = codePart.startsWith("-");
      const cleanCode = isDeleted ? codePart.substring(1) : codePart;

      return (
        <div 
          key={idx} 
          className={`flex items-start px-3 py-0.5 font-mono text-[11px] leading-relaxed transition-colors duration-150 ${
            isDeleted 
              ? "bg-rose-500/10 text-rose-300 border-l-2 border-rose-500 font-medium" 
              : "text-slate-400 hover:bg-slate-900/30"
          }`}
        >
          <span className="w-8 shrink-0 text-slate-600 text-right select-none pr-3 border-r border-slate-800/60 mr-3">
            {lineNum}
          </span>
          <span className="whitespace-pre">{cleanCode}</span>
        </div>
      );
    });
  };

  // Simulated metrics counters
  const totalDeadMethods = cleaned ? 0 : 17;
  const totalDeadEndpoints = cleaned ? 0 : 4;
  const totalDeadImports = cleaned ? 0 : 23;

  return (
    <div className="space-y-6 text-left" id="dead-code-tab-view">
      
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-2xl text-white border border-slate-800/80 shadow-2xl shadow-slate-950/40">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        
        {/* Blueprint background grid effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dead-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dead-grid)" />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center gap-1 bg-rose-500/10 text-rose-300 border border-rose-500/25 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                <Flame className="h-3 w-3 text-rose-400" />
                Dead Code Sweep
              </span>
              <span className="text-slate-700 text-xs">•</span>
              <span className="text-xs text-slate-400 font-medium">AST Codebase Pruning Engine</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Dead Code Detector
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1.5 leading-relaxed">
              Heuristic AST analyzer scanning the compilation scope for unreachable routing handlers, unused package imports, and orphaned methods.
            </p>
          </div>

          {!cleaned && !cleaning && (
            <button
              onClick={handleCleanSweep}
              className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-950/20 active:scale-95 cursor-pointer shrink-0 border border-rose-500/30"
            >
              <RefreshCw className="h-4 w-4 animate-spin-slow" />
              <span>Run Bulk Clean Sweep</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Sweeping Console UI */}
      {cleaning && (
        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-rose-500 animate-spin" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">AST Refactor Console</span>
            </div>
            <span className="text-[10px] text-rose-400 font-mono animate-pulse">CLEANING_WORKSPACE</span>
          </div>

          <div className="bg-black/60 border border-slate-900 rounded-xl p-4 font-mono text-[11px] text-rose-400/90 space-y-2 h-44 overflow-y-auto shadow-inner select-none scrollbar-thin scrollbar-thumb-slate-850 scrollbar-track-transparent">
            {sweepLogs.map((log, index) => (
              <div key={index} className="flex items-center gap-2 animate-fadeIn">
                <span className="text-slate-600 text-[9px] font-sans">[{new Date().toLocaleTimeString()}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>

          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-300 rounded-full" 
              style={{ width: `${(sweepLogs.length / 8) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Clean Success State */}
      {cleaned && !cleaning && (
        <div className="bg-slate-900/40 border border-emerald-500/20 p-8 rounded-2xl text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

          <div className="bg-emerald-500/10 p-4 rounded-full inline-block mx-auto border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-bounce" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-white font-sans">Workspace AST Sweep Successful!</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              CodeScope static analysis swept redundant function declarations, tidied obsolete class imports, and unlinked dead routes. Zero compile issues detected.
            </p>
          </div>

          {/* Savings Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-2">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 uppercase font-medium block">Redundant LOC Pruned</span>
              <strong className="text-xl font-mono text-emerald-400 block mt-1">620 lines</strong>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 uppercase font-medium block">Bundle Size Reduction</span>
              <strong className="text-xl font-mono text-emerald-400 block mt-1">~84 KB</strong>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 uppercase font-medium block">Compile speedup</span>
              <strong className="text-xl font-mono text-emerald-400 block mt-1">~4.2%</strong>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 uppercase font-medium block">Codebase Integrity</span>
              <strong className="text-xl font-mono text-emerald-400 block mt-1">100% Safe</strong>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-4 py-2 rounded-lg transition-all active:scale-95 cursor-pointer font-sans"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restore Codebase Demo State</span>
          </button>
        </div>
      )}

      {/* Main View Grid: Stats and Master-Detail Explorer */}
      {!cleaned && !cleaning && (
        <div className="space-y-6">
          
          {/* Overview Statistics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Dead Methods Card */}
            <div className="bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-rose-950/5 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden hover:shadow-rose-500/5 hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute right-4 top-4 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                <Flame className="h-4.5 w-4.5 text-rose-400" />
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Dead Methods</span>
              <strong className="text-slate-100 font-mono text-3xl block mt-1.5">{totalDeadMethods}</strong>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-rose-400 font-medium">🔥 Unreferenced signatures</span>
                <span className="text-[10px] text-slate-500 font-mono">420 LOC saved</span>
              </div>
              <div className="mt-2 w-full bg-slate-800/60 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>

            {/* Unused Endpoints Card */}
            <div className="bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-orange-950/5 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden hover:shadow-orange-500/5 hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute right-4 top-4 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                <Layers className="h-4.5 w-4.5 text-orange-400" />
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Unused Endpoints</span>
              <strong className="text-slate-100 font-mono text-3xl block mt-1.5">{totalDeadEndpoints}</strong>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-orange-400 font-medium">🔥 Unreachable mappings</span>
                <span className="text-[10px] text-slate-500 font-mono">110 LOC saved</span>
              </div>
              <div className="mt-2 w-full bg-slate-800/60 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            {/* Unused Imports Card */}
            <div className="bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-amber-950/5 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden hover:shadow-amber-500/5 hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute right-4 top-4 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                <FileCode className="h-4.5 w-4.5 text-amber-400" />
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Unused Imports</span>
              <strong className="text-slate-100 font-mono text-3xl block mt-1.5">{totalDeadImports}</strong>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-medium">🔥 Bloated dependencies</span>
                <span className="text-[10px] text-slate-500 font-mono">90 LOC saved</span>
              </div>
              <div className="mt-2 w-full bg-slate-800/60 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

          </div>

          {/* Visual Charts & Code Bloat Insights Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Donut Chart: Active vs Dead LOC */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-indigo-400" />
                  Codebase Density
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">Comparison of active source files versus dead AST sections.</p>
              </div>

              <div className="flex items-center justify-center py-4 gap-6">
                {/* SVG Ring Graph */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="w-28 h-28 drop-shadow-[0_0_15px_rgba(99,102,241,0.08)]">
                    {/* Track Active code */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#1e293b"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#6366f1"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={(2 * Math.PI * 38) * (1 - 0.958)}
                      strokeLinecap="round"
                      fill="transparent"
                      transform="rotate(-90 50 50)"
                    />
                    {/* Track Dead code */}
                    <circle
                      cx="50"
                      cy="50"
                      r="28"
                      stroke="#1e293b"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="28"
                      stroke="#f43f5e"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={(2 * Math.PI * 28) * (1 - 0.042)}
                      strokeLinecap="round"
                      fill="transparent"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  
                  {/* Total LOC Metric in the center */}
                  <div className="absolute text-center select-none">
                    <span className="block font-mono text-[10px] font-black text-white">14,850</span>
                    <span className="block text-[6px] text-slate-500 font-semibold uppercase tracking-wider">LOC</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1 shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-200 leading-none">Active codebase</span>
                      <span className="text-[9px] text-slate-400 font-mono">14,230 LOC (95.8%)</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-200 leading-none">Orphaned bloat</span>
                      <span className="text-[9px] text-slate-400 font-mono">620 LOC (4.2%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <span>ESTIMATED BUILD SPEEDUP: <b className="text-emerald-400 font-semibold">+4.2%</b></span>
                <span>AST COVERAGE: 99.8%</span>
              </div>
            </div>

            {/* Top Bloated Files: Horizontal savings bars */}
            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="h-4 w-4 text-rose-400" />
                  Code Bloat Breakdown
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">Files with highest volume of dead code definitions detected.</p>
              </div>

              <div className="space-y-2.5 py-3">
                {[
                  { file: "OrderService.java", lines: 42, pct: 90, type: "method" },
                  { file: "UserController.java", lines: 35, pct: 75, type: "endpoint" },
                  { file: "WebSecurityConfig.java", lines: 28, pct: 60, type: "method" },
                  { file: "AuthService.java", lines: 18, pct: 40, type: "import" },
                  { file: "ProductController.java", lines: 12, pct: 25, type: "import" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-32 truncate font-mono text-[10px] text-slate-300 flex items-center gap-1.5 shrink-0">
                      <FileCode className="h-3 w-3 text-slate-500 shrink-0" />
                      {item.file}
                    </span>
                    <div className="flex-1 bg-slate-800/60 h-1.5 rounded-full overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full" 
                        style={{ width: `${item.pct}%` }} 
                      />
                    </div>
                    <span className="w-14 text-right font-mono text-[9px] text-rose-400 font-semibold shrink-0">
                      -{item.lines} LOC
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-800/80 pt-3 text-[9px] text-slate-500 font-sans leading-none flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-indigo-400" />
                <span>Double-click any item in the explorer below to review specific definitions.</span>
              </div>
            </div>

          </div>

          {/* Master-Detail Explorer layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Explorer panel: Search + items list */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col space-y-4 shadow-xl">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search dead code items or files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-colors"
                />
              </div>

              {/* Sub-tab selection */}
              <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800/50">
                <button
                  onClick={() => setSelectedType('method')}
                  className={`py-1.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                    selectedType === 'method'
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Methods ({filteredMethods.length})
                </button>
                <button
                  onClick={() => setSelectedType('endpoint')}
                  className={`py-1.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                    selectedType === 'endpoint'
                      ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Endpoints ({filteredEndpoints.length})
                </button>
                <button
                  onClick={() => setSelectedType('import')}
                  className={`py-1.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                    selectedType === 'import'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Imports ({filteredImports.length})
                </button>
              </div>

              {/* List Container */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {activeList.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Info className="h-8 w-8 text-slate-700 mx-auto" />
                    <span className="block text-xs text-slate-500">No matching dead code elements.</span>
                  </div>
                ) : (
                  activeList.map((item, idx) => {
                    const isSelected = activeList[selectedIndex] ? idx === selectedIndex : idx === 0;
                    const itemTitle = (item as any).name || (item as any).url || (item as any).importStmt;
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 relative ${
                          isSelected
                            ? 'border-rose-500/30 bg-rose-500/5 shadow-md shadow-rose-950/15'
                            : 'border-slate-800/60 hover:border-slate-700/60 bg-slate-900/30 hover:bg-slate-900/50'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 bg-rose-500 rounded-r" />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {selectedType === 'endpoint' && (
                              <span className="bg-orange-950 border border-orange-500/30 text-orange-400 font-bold font-mono text-[9px] px-1 rounded uppercase">
                                {(item as any).method}
                              </span>
                            )}
                            <strong className="font-mono text-xs text-slate-200 block truncate max-w-full">
                              {itemTitle}
                            </strong>
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-slate-500 font-mono">
                            <span className="truncate max-w-[120px]">{item.file}</span>
                            {(item as any).line && (
                              <>
                                <span>•</span>
                                <span>Line {(item as any).line}</span>
                              </>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-slate-450 mt-1 line-clamp-1 leading-normal font-sans">
                            {item.reason}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(selectedType, idx);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Safe Prune"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Right details panel: AST details + diff visual preview */}
            <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
              {currentItem ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  
                  {/* AST Metadata Headers */}
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        {selectedType === 'method' && <Code className="h-4.5 w-4.5 text-rose-400" />}
                        {selectedType === 'endpoint' && <Layers className="h-4.5 w-4.5 text-orange-400" />}
                        {selectedType === 'import' && <FileCode className="h-4.5 w-4.5 text-amber-400" />}
                        
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">AST Trace details</h4>
                          <span className="text-[9px] text-slate-500 font-mono block">Scope: {currentItem.file}</span>
                        </div>
                      </div>

                      <span className="bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        0 references found
                      </span>
                    </div>

                    <div className="mt-3 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold font-sans block">Detection Heuristic Reason</span>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentItem.reason}</p>
                    </div>
                  </div>

                  {/* AST Reference chain graphic */}
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold font-sans block mb-2">AST Call-Tree Chain</span>
                    
                    <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-850 flex items-center justify-between gap-2 overflow-x-auto select-none">
                      <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] px-2.5 py-1.5 rounded-lg font-mono">
                        {snippetData.astChain[0]}
                      </div>
                      
                      <ChevronRight className="h-4 w-4 text-slate-650 shrink-0" />
                      
                      <div className="bg-slate-900 border border-slate-800 text-slate-350 text-[10px] px-2.5 py-1.5 rounded-lg font-mono truncate max-w-[140px]" title={snippetData.astChain[1]}>
                        {snippetData.astChain[1]}
                      </div>
                      
                      <ChevronRight className="h-4 w-4 text-rose-500/40 shrink-0" />
                      
                      <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 text-[10px] px-2.5 py-1.5 rounded-lg font-mono border-dashed animate-pulse">
                        {snippetData.astChain[2]}
                      </div>
                    </div>
                  </div>

                  {/* Code Editor Preview diff container */}
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold font-sans block mb-2">Static AST Diff Preview</span>
                    
                    <div className="bg-slate-950 rounded-xl border border-slate-850 overflow-hidden flex flex-col">
                      <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-850 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{currentItem.file}</span>
                        <span>{snippetData.language.toUpperCase()}</span>
                      </div>
                      
                      <div className="py-2.5 max-h-[170px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-850 scrollbar-track-transparent">
                        {renderCodeSnippet(snippetData.code)}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleDeleteItem(selectedType, selectedIndex)}
                      className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold py-2 rounded-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 border border-rose-500/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Safely Prune Block</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(selectedType, selectedIndex)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-slate-200 text-xs font-semibold py-2 rounded-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700/80"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Mark as Active / Keep</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="py-24 text-center space-y-2 flex-1 flex flex-col justify-center">
                  <AlertCircle className="h-8 w-8 text-slate-700 mx-auto" />
                  <span className="text-xs text-slate-500">No dead code element selected. Scan is clean.</span>
                </div>
              )}
            </div>

          </div>

          {/* AST Engine informational panel */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 mt-0.5 shrink-0">
                <AlertCircle className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-white">How is Dead Code detected by CodeScope?</h5>
                <p className="text-[11px] text-slate-450 leading-relaxed max-w-2xl">
                  Our compiler AST parser resolves symbols, tracking references, function calls, route binds, class instantiations, and module imports. If a declared symbol has zero active links in the solved dependency graph, it is flagged as dead block weight.
                </p>
              </div>
            </div>
            <a 
              href="#diagnostics"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 whitespace-nowrap"
            >
              <span>Read AST Docs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

        </div>
      )}

    </div>
  );
};
