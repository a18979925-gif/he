import React, { useState } from "react";
import {
  GitCompare,
  Plus,
  Minus,
  Settings,
  Server,
  Shield,
  Sparkles,
  RefreshCw,
  AlertCircle,
  GitCommit,
  GitBranch,
  GitPullRequest,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  User,
  Clock,
  ArrowUpRight,
  Flame,
  ChevronDown,
  ChevronRight,
  Activity,
  Terminal,
  LayoutGrid,
  BarChart2,
  FileCode,
  FileSpreadsheet,
  Check,
  Search,
  BookOpen
} from "lucide-react";
import { CodeScopeAnalysis } from "../types";

interface TimelineTabProps {
  activeProject: CodeScopeAnalysis;
}

interface CommitItem {
  hash: string;
  msg: string;
  author: string;
  avatarColor: string;
  date: string;
  type: "feat" | "fix" | "security" | "perf" | "refactor" | "infra" | "chore";
  files: string[];
  insertions: number;
  deletions: number;
  diffLines: string[];
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ activeProject }) => {
  const [baseVer, setBaseVer] = useState<string>("v1.0.0");
  const [targetVer, setTargetVer] = useState<string>("v1.2.0 (Current)");
  const [comparing, setComparing] = useState<boolean>(false);
  const [subTab, setSubTab] = useState<"commits" | "hotspots" | "architecture">("commits");
  const [commitSearch, setCommitSearch] = useState<string>("");
  const [expandedCommitHash, setExpandedCommitHash] = useState<string | null>(null);
  const [selectedFileHotspot, setSelectedFileHotspot] = useState<string | null>(null);

  const projectName = activeProject.projectName;

  // Dynamic Delta stats based on active project
  const getDeltaSummary = (projName: string) => {
    const name = projName.toLowerCase();
    if (name.includes("laravel") || name.includes("blog") || name.includes("microservice")) {
      return { endpoints: 6, tech: 1, deadClasses: 1, healthGrowth: 3 };
    } else if (name.includes("fintech") || name.includes("express") || name.includes("prisma")) {
      return { endpoints: 10, tech: 2, deadClasses: 2, healthGrowth: 5 };
    }
    return { endpoints: 14, tech: 3, deadClasses: 3, healthGrowth: 4 };
  };

  const deltaSummary = getDeltaSummary(projectName);

  // Dynamic security improvement indicators
  const getSecurityDelta = (projName: string) => {
    const name = projName.toLowerCase();
    if (name.includes("laravel") || name.includes("blog") || name.includes("microservice")) {
      return { prior: 75, current: 88, diff: 13 };
    } else if (name.includes("fintech") || name.includes("express") || name.includes("prisma")) {
      return { prior: 68, current: 85, diff: 17 };
    }
    return { prior: 82, current: 91, diff: 9 };
  };

  const securityData = getSecurityDelta(projectName);

  // Project-specific files modified
  const getDeltaFiles = (projName: string) => {
    const name = projName.toLowerCase();
    if (name.includes("laravel") || name.includes("blog") || name.includes("microservice")) {
      return {
        addedEndpoints: [
          "GET /posts/{slug}/amp",
          "POST /api/v1/comments",
          "DELETE /api/v1/posts/bulk",
          "GET /api/health"
        ],
        addedInfra: [
          "Tailwind CSS configurations",
          "GitHub deployment action runner",
          "MySQL Redis connection pools"
        ],
        removedClasses: [
          "App\\Http\\Controllers\\OldPostController",
          "App\\Utils\\DeprecatedSlugger",
          "App\\Policies\\LegacyAuthPolicy"
        ]
      };
    } else if (name.includes("fintech") || name.includes("express") || name.includes("prisma")) {
      return {
        addedEndpoints: [
          "POST /api/wallet/reconcile",
          "PUT /api/users/bank-metadata",
          "GET /api/health/diagnostics",
          "DELETE /api/ledgers"
        ],
        addedInfra: [
          "Prisma db-pull migrations setup",
          "GitHub Actions workflow config",
          "Docker multi-tier compilation"
        ],
        removedClasses: [
          "controllers/legacyWalletController.ts",
          "services/deprecatedCryptoService.ts",
          "database/tempClient.ts"
        ]
      };
    }
    return {
      addedEndpoints: [
        "POST /api/orders/checkout",
        "GET /api/products/search",
        "PUT /api/users/profile/avatar",
        "DELETE /api/cart/items/bulk",
        "GET /api/health/metrics"
      ],
      addedInfra: [
        "Redis Cache clusters configuration",
        "Docker Multi-stage compilation config",
        "GitHub Actions CI workflow definition"
      ],
      removedClasses: [
        "com.ecommerce.legacy.XmlOrderTaxCalculator",
        "com.ecommerce.utils.DeprecatedStringSplitter",
        "com.ecommerce.auth.TempSessionValidator"
      ]
    };
  };

  const deltaFiles = getDeltaFiles(projectName);

  // Dynamic GitInsights (Risk & Churn targets)
  const getInsightsForProject = (proj: CodeScopeAnalysis) => {
    if (proj.gitInsights && proj.gitInsights.length > 0) {
      return proj.gitInsights;
    }
    const name = proj.projectName.toLowerCase();
    if (name.includes("laravel") || name.includes("blog") || name.includes("microservice")) {
      return [
        { file: "PostController.php", commitsCount: 15, authorsCount: 2, churnRate: 35, riskScore: 40 },
        { file: "Post.php", commitsCount: 8, authorsCount: 1, churnRate: 10, riskScore: 18 }
      ];
    } else if (name.includes("fintech") || name.includes("express") || name.includes("prisma")) {
      return [
        { file: "UserController.ts", commitsCount: 18, authorsCount: 2, churnRate: 45, riskScore: 50 },
        { file: "UserRepository.ts", commitsCount: 12, authorsCount: 1, churnRate: 20, riskScore: 32 }
      ];
    }
    return [
      { file: "OrderService.java", commitsCount: 38, authorsCount: 3, churnRate: 72, riskScore: 84 },
      { file: "ProductController.java", commitsCount: 22, authorsCount: 2, churnRate: 40, riskScore: 55 },
      { file: "WebMvcConfig.java", commitsCount: 8, authorsCount: 1, churnRate: 15, riskScore: 20 }
    ];
  };

  const insights = getInsightsForProject(activeProject);

  // Dynamic Commits Logs list matching projects
  const getCommitsForProject = (projName: string): CommitItem[] => {
    const name = projName.toLowerCase();
    if (name.includes("spring") || name.includes("ecommerce")) {
      return [
        {
          hash: "a4f89d2",
          msg: "feat(order): integrate Stripe payment gateway checkouts",
          author: "Alex Rivers",
          avatarColor: "from-indigo-500 to-blue-500",
          date: "2 hours ago",
          type: "feat",
          files: ["OrderService.java", "OrderController.java"],
          insertions: 124,
          deletions: 12,
          diffLines: [
            "+ import com.stripe.Stripe;",
            "+ import com.stripe.model.Charge;",
            "  public OrderReceiptDto placeOrder(OrderCreationRequest request) {",
            "-   // TODO: Integrate external payments system",
            "+   Stripe.apiKey = stripeSecretKey;",
            "+   Map<String, Object> params = new HashMap<>();",
            "+   params.put(\"amount\", request.getAmountInCents());",
            "+   Charge charge = Charge.create(params);",
            "+   order.setPaymentStatus(PaymentStatus.PAID);"
          ]
        },
        {
          hash: "c9b21f0",
          msg: "security(auth): fix parameter values interpolation SQL injection",
          author: "Jane Miller",
          avatarColor: "from-emerald-500 to-teal-500",
          date: "1 day ago",
          type: "security",
          files: ["UserRepository.java"],
          insertions: 15,
          deletions: 8,
          diffLines: [
            "  public User findByEmail(String email) {",
            "-   String query = \"SELECT * FROM users WHERE email = '\" + email + \"'\";",
            "-   return entityManager.createNativeQuery(query, User.class).getSingleResult();",
            "+   String query = \"SELECT o FROM User o WHERE o.email = :email\";",
            "+   return entityManager.createQuery(query, User.class)",
            "+     .setParameter(\"email\", email)",
            "+     .getSingleResult();"
          ]
        },
        {
          hash: "e7d34a1",
          msg: "perf(orders): mitigate hibernate N+1 queries in queryService",
          author: "Andrzej K.",
          avatarColor: "from-amber-500 to-orange-500",
          date: "2 days ago",
          type: "perf",
          files: ["OrderService.java", "OrderRepository.java"],
          insertions: 48,
          deletions: 31,
          diffLines: [
            "  @Transactional(readOnly = true)",
            "  public List<Order> getActiveOrders() {",
            "-   return orderRepository.findAll(); // N+1: loads each order individually",
            "+   return orderRepository.findAllWithItemsJoined(); // Uses FETCH JOIN to batch items",
            "  }"
          ]
        },
        {
          hash: "8f1c04b",
          msg: "refactor: extract order transaction verification logic",
          author: "Alex Rivers",
          avatarColor: "from-indigo-500 to-blue-500",
          date: "3 days ago",
          type: "refactor",
          files: ["OrderService.java"],
          insertions: 89,
          deletions: 94,
          diffLines: [
            "  public void processOrder(Order order) {",
            "-   // 100 lines of inline validations, tax rules, and audit mapping...",
            "+   validationService.validateAddress(order.getShippingAddress());",
            "+   taxCalculationService.applyTaxes(order);",
            "+   auditLogger.logOrderProcess(order);"
          ]
        },
        {
          hash: "3d5a2c9",
          msg: "infra: configure multi-stage Docker builds and Redis cache setup",
          author: "Alex Rivers",
          avatarColor: "from-indigo-500 to-blue-500",
          date: "1 week ago",
          type: "infra",
          files: ["Dockerfile", "docker-compose.yml", "WebMvcConfig.java"],
          insertions: 145,
          deletions: 4,
          diffLines: [
            "+ FROM maven:3.8-openjdk-17-slim AS build",
            "+ COPY src /home/app/src",
            "+ RUN mvn -f /home/app/pom.xml clean package",
            "+",
            "+ FROM openjdk:17-jdk-alpine",
            "+ COPY --from=build /home/app/target/*.jar app.jar"
          ]
        }
      ];
    } else if (name.includes("laravel") || name.includes("blog") || name.includes("microservice")) {
      return [
        {
          hash: "b5c12f4",
          msg: "feat(post): add markdown parser and editor support",
          author: "Alex Rivers",
          avatarColor: "from-indigo-500 to-blue-500",
          date: "4 hours ago",
          type: "feat",
          files: ["PostController.php", "Post.php"],
          insertions: 98,
          deletions: 4,
          diffLines: [
            "+ use GrahamCampbell\\Markdown\\Facades\\Markdown;",
            "  public function show($slug) {",
            "    $post = Post::where('slug', $slug)->firstOrFail();",
            "-   $post->body_html = $post->body;",
            "+   $post->body_html = Markdown::convertToHtml($post->body);"
          ]
        },
        {
          hash: "a8e38d1",
          msg: "security: validate request credentials using strict FormRequests",
          author: "Jane Miller",
          avatarColor: "from-emerald-500 to-teal-500",
          date: "1 day ago",
          type: "security",
          files: ["AuthRequest.php", "AuthController.php"],
          insertions: 42,
          deletions: 11,
          diffLines: [
            "- public function login(Request $request) {",
            "-   $creds = $request->only('email', 'password');",
            "+ public function login(AuthRequest $request) {",
            "+   $creds = $request->validated();"
          ]
        },
        {
          hash: "f3b9c02",
          msg: "perf: cache landing page query response in Redis for 1hr",
          author: "Andrzej K.",
          avatarColor: "from-amber-500 to-orange-500",
          date: "3 days ago",
          type: "perf",
          files: ["HomeController.php"],
          insertions: 22,
          deletions: 14,
          diffLines: [
            "- $posts = Post::latest()->take(10)->get();",
            "+ $posts = Cache::remember('homepage_posts', 3600, function() {",
            "+   return Post::latest()->take(10)->get();",
            "+ });"
          ]
        },
        {
          hash: "e204c88",
          msg: "infra: define GitHub Actions deployment workflow for staging",
          author: "Alex Rivers",
          avatarColor: "from-indigo-500 to-blue-500",
          date: "1 week ago",
          type: "infra",
          files: [".github/workflows/deploy.yml"],
          insertions: 72,
          deletions: 0,
          diffLines: [
            "+ name: Deploy Staging",
            "+ on:",
            "+   push:",
            "+     branches: [ staging ]",
            "+ jobs:",
            "+   deploy:",
            "+     runs-on: ubuntu-latest"
          ]
        }
      ];
    }
    // Fintech Express / Prisma
    return [
      {
        hash: "f921ab0",
        msg: "feat(wallet): implement ledger reconciliation cron scheduler",
        author: "Alex Rivers",
        avatarColor: "from-indigo-500 to-blue-500",
        date: "1 hour ago",
        type: "feat",
        files: ["wallet.service.ts", "ledger.ts"],
        insertions: 210,
        deletions: 15,
        diffLines: [
          "+ import { Cron, CronExpression } from '@nestjs/schedule';",
          "  export class WalletService {",
          "+   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)",
          "+   async reconcileLedger() {",
          "+     const status = await this.ledger.verifyDailyBalances();",
          "+     this.logger.log(`Reconciliation status: ${status}`);",
          "+   }"
        ]
      },
      {
        hash: "c3d8ef4",
        msg: "security: encrypt user banking metadata details using AES-256",
        author: "Jane Miller",
        avatarColor: "from-emerald-500 to-teal-500",
        date: "2 days ago",
        type: "security",
        files: ["crypto.ts", "user.service.ts"],
        insertions: 65,
        deletions: 2,
        diffLines: [
          "+ import { encrypt, decrypt } from './crypto';",
          "  async saveBankDetails(userId: string, accountNo: string) {",
          "-   return this.prisma.bankDetails.create({ data: { userId, accountNo } });",
          "+   const cipher = encrypt(accountNo);",
          "+   return this.prisma.bankDetails.create({ data: { userId, accountNo: cipher } });"
        ]
      },
      {
        hash: "b21e04a",
        msg: "perf: batch database transaction inserts in ledger queries",
        author: "Alex Rivers",
        avatarColor: "from-indigo-500 to-blue-500",
        date: "4 days ago",
        type: "perf",
        files: ["prisma.service.ts"],
        insertions: 34,
        deletions: 18,
        diffLines: [
          "- for (const entry of entries) {",
          "-   await this.prisma.ledger.create({ data: entry });",
          "- }",
          "+ await this.prisma.$transaction(",
          "+   entries.map(e => this.prisma.ledger.create({ data: e }))",
          "+ );"
        ]
      },
      {
        hash: "d8ef312",
        msg: "refactor: simplify database client initialization configurations",
        author: "Jane Miller",
        avatarColor: "from-emerald-500 to-teal-500",
        date: "1 week ago",
        type: "refactor",
        files: ["database.ts"],
        insertions: 12,
        deletions: 48,
        diffLines: [
          "- const client = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });",
          "+ const client = new PrismaClient({",
          "+   log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']",
          "+ });"
        ]
      }
    ];
  };

  const commitsList = getCommitsForProject(projectName);

  const filteredCommits = commitsList.filter((commit) => {
    const matchesSearch =
      commit.msg.toLowerCase().includes(commitSearch.toLowerCase()) ||
      commit.hash.toLowerCase().includes(commitSearch.toLowerCase()) ||
      commit.author.toLowerCase().includes(commitSearch.toLowerCase());

    const matchesFile = selectedFileHotspot
      ? commit.files.includes(selectedFileHotspot)
      : true;

    return matchesSearch && matchesFile;
  });

  const handleCompare = () => {
    setComparing(true);
    setTimeout(() => {
      setComparing(false);
    }, 800);
  };

  // Sparkline generator helper
  const getSparklinePoints = (index: number) => {
    const paths = [
      "M0,18 Q12,2 24,18 T48,6",
      "M0,10 Q12,18 24,6 T48,14",
      "M0,14 Q12,6 24,14 T48,10"
    ];
    return paths[index % paths.length];
  };

  // Color generator for Risk score
  const getRiskColor = (score: number) => {
    if (score >= 75) return "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-950/20";
    if (score >= 45) return "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-950/20";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-950/20";
  };

  return (
    <div className="space-y-6 text-left" id="timeline-tab-view">
      {/* Premium UI Polish Status Header */}
      <div className="flex justify-between items-center bg-slate-900/35 border border-slate-800/80 px-4 py-2.5 rounded-xl mb-4 hover:scale-[1.002] transition-transform duration-300">
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-sans">Module: AST-Inferred Source Intelligence</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] bg-slate-950 text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-850 select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          AI Oracle Connected
        </div>
      </div>

      {/* Custom Styles Inject for premium animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(220px); }
        }
        .animate-scan {
          animation: scanline 2.5s linear infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.15; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .pulse-bubble {
          animation: pulse-ring 3s ease-in-out infinite;
        }
        @keyframes float-effect {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
        .float-card {
          animation: float-effect 4s ease-in-out infinite;
        }
      `}} />

      {/* Header Repository Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              Version Control Delta Auditing
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <GitCompare className="h-6 w-6 text-indigo-500 animate-pulse" />
            Architecture Evolution & Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Diff workspace branches or snapshots (e.g. <code className="bg-slate-900 border border-slate-800 px-1 rounded text-indigo-300 font-mono">v1.zip</code> vs <code className="bg-slate-900 border border-slate-800 px-1 rounded text-emerald-300 font-mono">v2.zip</code>) to trace endpoints growth, redundant class removals, code churn hotspots, and security regressions.
          </p>
        </div>

        {/* Versions selection & Git Actions Simulation */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 p-2 rounded-2xl border border-slate-800/80 shadow-inner shrink-0">
          <div className="flex items-center gap-2">
            <GitBranch className="h-3.5 w-3.5 text-slate-500 ml-1.5" />
            <select
              value={baseVer}
              onChange={(e) => setBaseVer(e.target.value)}
              className="bg-slate-900/60 text-xs font-semibold text-slate-200 px-3 py-2 rounded-xl border border-slate-800/80 outline-none hover:border-slate-700 focus:border-indigo-500 transition-all font-mono"
            >
              <option value="v1.0.0">Release v1.0.0 (Base)</option>
              <option value="v1.1.0">Release v1.1.0 (Alpha)</option>
            </select>
          </div>
          
          <span className="text-slate-600 text-sm font-mono select-none">➔</span>
          
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-3.5 w-3.5 text-emerald-500" />
            <select
              value={targetVer}
              onChange={(e) => setTargetVer(e.target.value)}
              className="bg-slate-900/60 text-xs font-semibold text-slate-200 px-3 py-2 rounded-xl border border-slate-800/80 outline-none hover:border-slate-700 focus:border-indigo-500 transition-all font-mono"
            >
              <option value="v1.2.0 (Current)">v1.2.0 (Current Upload)</option>
            </select>
          </div>

          <button
            onClick={handleCompare}
            disabled={comparing}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-950/20 hover:shadow-indigo-500/10 active:scale-95 transition-all cursor-pointer font-sans"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${comparing ? 'animate-spin' : ''}`} />
            <span>{comparing ? 'Compiling Diff...' : 'Compare snapshots'}</span>
          </button>
        </div>
      </div>

      {comparing ? (
        /* Cyber Holographic Scan Loading State */
        <div className="bg-slate-950/90 rounded-3xl border border-indigo-500/30 p-12 text-center relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] min-h-[300px] flex flex-col justify-center items-center font-sans">
          {/* Radial Grid lines */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="scan-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#scan-grid)" />
            </svg>
          </div>

          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-pulse" />
          
          <RefreshCw className="h-10 w-10 text-indigo-400 animate-spin mb-4" />
          <h3 className="text-sm font-bold text-white tracking-widest uppercase font-mono mb-2">Analyzing snapshot structures...</h3>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            Reconstructing code topography and evaluating difference signatures inside the local index databases.
          </p>

          <div className="w-64 max-w-xs bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800 mb-6">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" style={{ width: '100%' }} />
          </div>

          {/* Simulated scanning output logs */}
          <div className="w-full max-w-lg bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-left font-mono text-[10px] text-emerald-400 space-y-1.5 shadow-inner">
            <div className="flex items-center gap-2">
              <Terminal className="h-3 w-3 text-indigo-400 animate-pulse" />
              <span>[INFO] Resolving tags: <span className="text-white">{baseVer}</span> ➔ <span className="text-white">{targetVer}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="h-3 w-3 text-indigo-400 animate-pulse" />
              <span>[INFO] Mapping class inheritance trees and abstract endpoints...</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="h-3 w-3 text-indigo-400 animate-pulse" />
              <span>[INFO] Correlating AST node changes with Git commit indexes...</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>[SUCCESS] Compilation complete. Rendered hotspot metrics.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Main Side: Metrics Cards & sub-tab Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Evolution Metrics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Card 1: Endpoints */}
              <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800/80 p-4.5 rounded-2xl shadow-lg hover:border-emerald-500/20 hover:shadow-emerald-500/5 group transition-all duration-300 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
                <div className="text-emerald-400 text-2xl font-mono font-black flex items-center gap-1.5 justify-start">
                  <Plus className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>{deltaSummary.endpoints}</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mt-1">Endpoints added</span>
              </div>

              {/* Card 2: Tech/Infra */}
              <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800/80 p-4.5 rounded-2xl shadow-lg hover:border-indigo-500/20 hover:shadow-indigo-500/5 group transition-all duration-300 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-16 w-16 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
                <div className="text-indigo-400 text-2xl font-mono font-black flex items-center gap-1.5 justify-start">
                  <Plus className="h-5 w-5 text-indigo-500 shrink-0" />
                  <span>{deltaSummary.tech}</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mt-1">Tech / Infra configs</span>
              </div>

              {/* Card 3: Redundant Cleanups */}
              <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800/80 p-4.5 rounded-2xl shadow-lg hover:border-rose-500/20 hover:shadow-rose-500/5 group transition-all duration-300 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-16 w-16 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all pointer-events-none" />
                <div className="text-rose-400 text-2xl font-mono font-black flex items-center gap-1.5 justify-start">
                  <Minus className="h-5 w-5 text-rose-500 shrink-0" />
                  <span>{deltaSummary.deadClasses}</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mt-1">Dead Classes Deleted</span>
              </div>

              {/* Card 4: Health Growth */}
              <div className="bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800/80 p-4.5 rounded-2xl shadow-lg hover:border-amber-500/20 hover:shadow-amber-500/5 group transition-all duration-300 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-16 w-16 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
                <div className="text-amber-400 text-2xl font-mono font-black flex items-center gap-1 justify-start">
                  <span>+{deltaSummary.healthGrowth}%</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mt-1">Quality index growth</span>
              </div>
            </div>

            {/* Dashboard Sub-Tabs Panel Container */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
              
              {/* Panel Sub-Tabs Navigation */}
              <div className="bg-slate-950/65 px-4 py-3.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800/60">
                  <button
                    onClick={() => setSubTab("commits")}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      subTab === "commits"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <GitCommit className="h-3.5 w-3.5" />
                    <span>Commits History</span>
                  </button>

                  <button
                    onClick={() => setSubTab("hotspots")}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      subTab === "hotspots"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Flame className="h-3.5 w-3.5" />
                    <span>Risk & Churn Hotspots</span>
                  </button>

                  <button
                    onClick={() => setSubTab("architecture")}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      subTab === "architecture"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Architectural Evolution</span>
                  </button>
                </div>

                {/* Commits search input */}
                {subTab === "commits" && (
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filter commits, messages..."
                      value={commitSearch}
                      onChange={(e) => setCommitSearch(e.target.value)}
                      className="bg-slate-900/80 text-[11px] placeholder-slate-550 text-slate-200 pl-8 pr-3 py-2 rounded-xl border border-slate-800 outline-none focus:border-indigo-500 w-44 md:w-56 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Sub-Tab 1: COMMITS HISTORY FEED (Git version log) */}
              {subTab === "commits" && (
                <div className="p-6 space-y-6">
                  {selectedFileHotspot && (
                    <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-indigo-300">
                        <Flame className="h-4 w-4 text-indigo-400 animate-pulse" />
                        <span>Showing commit log metrics filtered by file hotspot: <strong className="text-white font-mono">{selectedFileHotspot}</strong></span>
                      </div>
                      <button
                        onClick={() => setSelectedFileHotspot(null)}
                        className="text-[10px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors font-mono cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}

                  {filteredCommits.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs font-sans">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-655" />
                      No commit logs match the active filter configurations.
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline Items Stack */}
                      <div className="space-y-0.5">
                        {filteredCommits.map((commit, idx) => {
                          const isExpanded = expandedCommitHash === commit.hash;
                          
                          // Git Graph SVG column connection renderer
                          const renderGitGraphSegment = () => {
                            if (idx === 0) {
                              return (
                                <svg className="w-12 h-14 shrink-0" viewBox="0 0 48 56">
                                  <line x1="24" y1="24" x2="24" y2="56" className="stroke-slate-800" strokeWidth="2" />
                                  <circle cx="24" cy="24" r="7" className="fill-indigo-500 stroke-slate-900" strokeWidth="3" />
                                  <circle cx="24" cy="24" r="2.5" className="fill-white" />
                                </svg>
                              );
                            }
                            if (idx === 1) {
                              return (
                                <svg className="w-12 h-14 shrink-0" viewBox="0 0 48 56">
                                  <line x1="24" y1="0" x2="24" y2="56" className="stroke-slate-800" strokeWidth="2" />
                                  <path d="M 24 16 Q 24 28 36 36 L 36 56" fill="none" className="stroke-emerald-600" strokeWidth="2" />
                                  <circle cx="36" cy="36" r="6" className="fill-emerald-500 stroke-slate-900" strokeWidth="2.5" />
                                  <circle cx="36" cy="36" r="2" className="fill-white" />
                                </svg>
                              );
                            }
                            if (idx === 2) {
                              return (
                                <svg className="w-12 h-14 shrink-0" viewBox="0 0 48 56">
                                  <line x1="24" y1="0" x2="24" y2="56" className="stroke-slate-800" strokeWidth="2" />
                                  <line x1="36" y1="0" x2="36" y2="56" className="stroke-emerald-600" strokeWidth="2" />
                                  <circle cx="36" cy="24" r="6" className="fill-emerald-500 stroke-slate-900" strokeWidth="2.5" />
                                  <circle cx="36" cy="24" r="2" className="fill-white" />
                                </svg>
                              );
                            }
                            return (
                              <svg className="w-12 h-14 shrink-0" viewBox="0 0 48 56">
                                <line x1="24" y1="0" x2="24" y2="56" className="stroke-slate-800" strokeWidth="2" />
                                <path d="M 36 0 L 36 20 Q 24 28 24 40" fill="none" className="stroke-emerald-600" strokeWidth="2" />
                                <circle cx="24" cy="40" r="7" className="fill-indigo-500 stroke-slate-900" strokeWidth="3" />
                                <circle cx="24" cy="40" r="2.5" className="fill-white" />
                              </svg>
                            );
                          };

                          return (
                            <div key={commit.hash} className="flex items-stretch">
                              {/* Left Branch Graphics */}
                              {renderGitGraphSegment()}

                              {/* Commit Card body */}
                              <div className="flex-1 pb-4">
                                <div
                                  onClick={() => setExpandedCommitHash(isExpanded ? null : commit.hash)}
                                  className={`bg-slate-900/30 border p-4.5 rounded-2xl text-left cursor-pointer transition-all duration-300 hover:bg-slate-900/60 ${
                                    isExpanded 
                                      ? "border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.08)] bg-slate-900/50" 
                                      : "border-slate-800/80 hover:border-slate-700/80"
                                  }`}
                                >
                                  {/* Info header */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-indigo-400 hover:underline">{commit.hash}</span>
                                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                          <Clock className="h-3 w-3" /> {commit.date}
                                        </span>
                                        {/* Status Tag */}
                                        <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded font-sans uppercase tracking-wider ${
                                          commit.type === 'feat' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                          commit.type === 'security' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                          commit.type === 'perf' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                          commit.type === 'refactor' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        }`}>
                                          {commit.type}
                                        </span>
                                      </div>
                                      <p className="text-xs font-semibold text-slate-200 leading-snug group-hover:text-white">
                                        {commit.msg}
                                      </p>
                                    </div>

                                    {/* Author & File Stats */}
                                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                                      <div className="flex items-center gap-1.5">
                                        <div className={`h-5.5 w-5.5 rounded-full bg-gradient-to-br ${commit.avatarColor} flex items-center justify-center text-[9px] font-black text-white shadow-sm`}>
                                          {commit.author.split(' ').map(n=>n[0]).join('')}
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-400">@{commit.author}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-[10px] font-mono">
                                        <span className="text-emerald-400 font-bold">+{commit.insertions}</span>
                                        <span className="text-slate-655 font-bold">/</span>
                                        <span className="text-rose-400 font-bold">-{commit.deletions}</span>
                                      </div>
                                      <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-indigo-400' : ''}`} />
                                    </div>
                                  </div>

                                  {/* Code changes details (Accordion content) */}
                                  {isExpanded && (
                                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3.5 animate-[fadeIn_0.2s_ease-out]">
                                      {/* Files List */}
                                      <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2 font-mono">Files Affected</span>
                                        <div className="flex flex-wrap gap-2">
                                          {commit.files.map((file, fIdx) => (
                                            <span key={fIdx} className="bg-slate-950 border border-slate-800 text-[10px] font-mono px-2.5 py-1 rounded-lg text-slate-350 flex items-center gap-1.5">
                                              <FileCode className="h-3 w-3 text-indigo-500" />
                                              {file}
                                            </span>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Mock Code Diff */}
                                      <div className="space-y-1 bg-slate-950 rounded-xl border border-slate-800/80 p-3.5 font-mono text-[10.5px] leading-relaxed overflow-x-auto text-slate-350 shadow-inner">
                                        <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest border-b border-slate-900 pb-1.5 mb-2 font-sans">Unified Changes View</div>
                                        {commit.diffLines.map((line, lIdx) => {
                                          const isAdded = line.startsWith("+");
                                          const isRemoved = line.startsWith("-");
                                          return (
                                            <div
                                              key={lIdx}
                                              className={`whitespace-pre ${
                                                isAdded 
                                                  ? "text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-md" 
                                                  : isRemoved 
                                                    ? "text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded-md" 
                                                    : "text-slate-500"
                                              }`}
                                            >
                                              {line}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 2: RISK & CHURN HOTSPOTS */}
              {subTab === "hotspots" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-1">
                      <BarChart2 className="h-4 w-4 text-indigo-400" />
                      Hotspot Topography Map
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Visual correlation of code modifications (X-axis) vs stability risk index (Y-axis). Outer pulse sizes mirror churn ratios.
                    </p>
                  </div>

                  {/* SVG Hotspots Grid Scatter Plot */}
                  <div className="relative bg-slate-950 border border-slate-850 rounded-2xl p-4 shadow-inner">
                    <svg className="w-full h-56" viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">
                      {/* Grid background lines */}
                      <line x1="40" y1="20" x2="480" y2="20" className="stroke-slate-800/40" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="40" y1="70" x2="480" y2="70" className="stroke-slate-800/40" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="40" y1="120" x2="480" y2="120" className="stroke-slate-800/40" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="40" y1="170" x2="480" y2="170" className="stroke-slate-800/40" strokeWidth="1" strokeDasharray="3,3" />
                      
                      <line x1="150" y1="20" x2="150" y2="170" className="stroke-slate-800/40" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="260" y1="20" x2="260" y2="170" className="stroke-slate-800/40" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="370" y1="20" x2="370" y2="170" className="stroke-slate-800/40" strokeWidth="1" strokeDasharray="3,3" />

                      {/* Main axis lines */}
                      <line x1="40" y1="170" x2="480" y2="170" className="stroke-slate-800" strokeWidth="1.5" />
                      <line x1="40" y1="20" x2="40" y2="170" className="stroke-slate-800" strokeWidth="1.5" />

                      {/* Axis labels */}
                      <text x="260" y="195" fill="rgb(100, 116, 139)" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono uppercase tracking-wider">Commits Count (Frequency)</text>
                      <text x="15" y="95" fill="rgb(100, 116, 139)" fontSize="9" fontWeight="bold" transform="rotate(-90 15 95)" textAnchor="middle" className="font-mono uppercase tracking-wider">Risk score %</text>

                      {/* Gradients */}
                      <defs>
                        <radialGradient id="rose-glow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="rgba(244, 63, 94, 0.4)" />
                          <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
                        </radialGradient>
                        <radialGradient id="amber-glow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="rgba(245, 158, 11, 0.4)" />
                          <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
                        </radialGradient>
                        <radialGradient id="emerald-glow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.4)" />
                          <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                        </radialGradient>
                      </defs>

                      {/* Scatter Plot items */}
                      {insights.map((item, idx) => {
                        // Plot coordinates math
                        // Commits X: min=0, max=50 => map to 40..460
                        const cx = Math.max(60, Math.min(460, 40 + (item.commitsCount / 50) * 400));
                        // Risk Y: min=0, max=100 => map to 170..30
                        const cy = Math.max(30, Math.min(160, 170 - (item.riskScore / 100) * 140));
                        const isSelected = selectedFileHotspot === item.file;
                        
                        const colorClass = item.riskScore >= 75 ? "fill-rose-500" : item.riskScore >= 45 ? "fill-amber-500" : "fill-emerald-500";
                        const glowId = item.riskScore >= 75 ? "url(#rose-glow)" : item.riskScore >= 45 ? "url(#amber-glow)" : "url(#emerald-glow)";
                        const radius = Math.max(7, Math.min(16, 6 + (item.churnRate / 100) * 10));

                        return (
                          <g 
                            key={idx} 
                            className="cursor-pointer"
                            onClick={() => setSelectedFileHotspot(isSelected ? null : item.file)}
                          >
                            {/* Glow Ring */}
                            <circle cx={cx} cy={cy} r={radius * 2.5} fill={glowId} />
                            
                            {/* Pulse line when hovered/selected */}
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={radius * (isSelected ? 2 : 1.5)} 
                              fill="none" 
                              stroke={item.riskScore >= 75 ? "rgba(244, 63, 94, 0.3)" : item.riskScore >= 45 ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)"} 
                              strokeWidth="1" 
                              className={`${isSelected ? "pulse-bubble" : ""}`}
                            />
                            
                            {/* Core Point */}
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={radius} 
                              className={`${colorClass} stroke-slate-900 transition-all duration-300`} 
                              strokeWidth="2" 
                            />
                            
                            {/* File Name Tag */}
                            <text 
                              x={cx} 
                              y={cy - radius - 6} 
                              fill={isSelected ? "#fff" : "rgb(156, 163, 175)"} 
                              fontSize="9.5" 
                              fontWeight={isSelected ? "bold" : "normal"}
                              textAnchor="middle" 
                              className="font-mono bg-slate-950 px-1 rounded pointer-events-none"
                            >
                              {item.file.split("/").pop()}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Hotspots files table */}
                  <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/40 shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-slate-350 text-left">
                        <thead>
                          <tr className="border-b border-slate-800/80 text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-950/70">
                            <th className="py-3 px-4">File Path</th>
                            <th className="py-3 px-4 text-center">Commits</th>
                            <th className="py-3 px-4 text-center">Authors</th>
                            <th className="py-3 px-4 text-center">Churn History</th>
                            <th className="py-3 px-4 text-right">Stability Risk</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {insights.map((item, idx) => {
                            const isSelected = selectedFileHotspot === item.file;
                            const riskBadgeColor = getRiskColor(item.riskScore);
                            
                            return (
                              <tr
                                key={idx}
                                onClick={() => setSelectedFileHotspot(isSelected ? null : item.file)}
                                className={`hover:bg-slate-900/40 cursor-pointer transition-colors duration-200 ${
                                  isSelected ? "bg-indigo-500/5 text-white" : ""
                                }`}
                              >
                                <td className="py-3.5 px-4 flex items-center gap-2 max-w-[260px] truncate" title={item.file}>
                                  <FileCode className={`h-4 w-4 shrink-0 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                                  <span className={`font-semibold ${isSelected ? "text-indigo-300" : "text-slate-300"}`}>{item.file}</span>
                                </td>
                                <td className="py-3.5 px-4 text-center font-bold text-slate-300">{item.commitsCount}</td>
                                <td className="py-3.5 px-4 text-center font-medium text-slate-400">{item.authorsCount}</td>
                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    {/* Mini SVG Sparkline */}
                                    <svg className="w-10 h-5" viewBox="0 0 48 20">
                                      <path
                                        d={getSparklinePoints(idx)}
                                        fill="none"
                                        stroke={item.riskScore >= 75 ? "rgba(244, 63, 94, 0.6)" : item.riskScore >= 45 ? "rgba(245, 158, 11, 0.6)" : "rgba(16, 185, 129, 0.6)"}
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                    <span className="font-semibold text-slate-200">{item.churnRate}%</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2.5">
                                    <span className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-lg border ${riskBadgeColor}`}>
                                      {item.riskScore}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: ARCHITECTURAL EVOLUTION (API diff and Class removals) */}
              {subTab === "architecture" && (
                <div className="p-6 space-y-6">
                  {/* Grid layout with left/right column for Added vs Removed */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Additions list */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                        <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20 text-emerald-400">
                          <Plus className="h-3.5 w-3.5" />
                        </div>
                        <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                          Structural Inclusions (+{deltaFiles.addedEndpoints.length + deltaFiles.addedInfra.length})
                        </h4>
                      </div>

                      {/* API Endpoints additions */}
                      <div className="space-y-2.5 text-left">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-sans block">Endpoints Configured</span>
                        {deltaFiles.addedEndpoints.map((ep, idx) => {
                          const [method, path] = ep.split(" ");
                          return (
                            <div key={idx} className="bg-slate-950/70 border border-slate-850 p-2.5 rounded-xl font-mono text-[10.5px] flex items-center justify-between gap-2.5 shadow-sm">
                              <div className="flex items-center gap-2 truncate">
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded leading-none ${
                                  method === 'POST' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                                  method === 'GET' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' :
                                  method === 'PUT' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                                  'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {method}
                                </span>
                                <span className="text-slate-300 truncate" title={path}>{path}</span>
                              </div>
                              <span className="text-[8.5px] font-bold text-emerald-500 shrink-0 font-sans uppercase">Added</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Infrastructure additions */}
                      <div className="space-y-2.5 text-left pt-2">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-sans block">Infrastructure Pipelines</span>
                        {deltaFiles.addedInfra.map((infra, idx) => (
                          <div key={idx} className="bg-slate-950/70 border border-slate-850 p-2.5 rounded-xl font-mono text-[10.5px] flex items-center justify-between gap-2 shadow-sm">
                            <div className="flex items-center gap-2 truncate text-slate-350">
                              <Server className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate">{infra}</span>
                            </div>
                            <span className="text-[8.5px] font-bold text-emerald-500 shrink-0 font-sans uppercase">New</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Redundant Cleanups (Removals) */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                        <div className="bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20 text-rose-400">
                          <Minus className="h-3.5 w-3.5" />
                        </div>
                        <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                          Redundant Deletions (-{deltaFiles.removedClasses.length})
                        </h4>
                      </div>

                      <div className="space-y-2.5 text-left">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-sans block">Classes Purged</span>
                        {deltaFiles.removedClasses.map((cls, idx) => (
                          <div key={idx} className="bg-slate-950/40 border border-slate-900 p-2.5 rounded-xl font-mono text-[10.5px] flex items-center justify-between gap-2.5 shadow-inner">
                            <div className="flex items-center gap-2 truncate text-slate-455 line-through">
                              <FileCode className="h-3.5 w-3.5 text-rose-500/50 shrink-0" />
                              <span className="truncate" title={cls}>{cls}</span>
                            </div>
                            <span className="text-[8.5px] font-bold text-rose-500/80 shrink-0 font-sans uppercase">Purged</span>
                          </div>
                        ))}
                      </div>

                      {/* Evolution context info */}
                      <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 text-xs text-slate-400 leading-relaxed font-sans mt-8 shadow-inner">
                        <span className="flex items-center gap-1.5 text-slate-200 font-bold mb-1.5">
                          <Activity className="h-4 w-4 text-indigo-400" />
                          Complexity Refinement
                        </span>
                        <p className="text-[11px] leading-relaxed">
                          Cleanups reduced duplicate declarations by approximately <strong className="text-emerald-400 font-bold">14.3%</strong>. This decreases the compiler load index and mitigates legacy inheritance injection threats inside dependency schemas.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Right Sidebar columns: Widgets */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Widget 1: Gorgeous Circular Security Progress Indicator */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950/90 to-slate-900 rounded-2xl border border-slate-800/80 p-5.5 shadow-xl space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Security Audit Factor</span>
                <span className="text-emerald-400 font-extrabold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                  +{securityData.diff} Improved
                </span>
              </div>

              {/* Circular Gauge */}
              <div className="relative flex items-center justify-center my-6">
                <svg className="w-28 h-28 transform -rotate-90">
                  {/* Outer track */}
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    className="stroke-slate-900"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  {/* Prior dotted indicator line */}
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    className="stroke-indigo-500/15"
                    strokeWidth="2.5"
                    strokeDasharray="4, 3"
                    fill="transparent"
                  />
                  {/* Current active glowing indicator */}
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    className="stroke-indigo-500"
                    strokeWidth="6.5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={2 * Math.PI * 44 * (1 - securityData.current / 100)}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 6px rgba(99, 102, 241, 0.45))" }}
                  />
                </svg>
                {/* Inside center text */}
                <div className="absolute flex flex-col items-center justify-center font-sans">
                  <span className="text-2xl font-black text-white font-mono">{securityData.current}%</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Vulnerability</span>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-3.5 space-y-2 font-sans">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500">Prior Vulnerability Score</span>
                  <span className="text-slate-400 font-mono font-medium">{securityData.prior} / 100</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500">Current Evolution Score</span>
                  <span className="text-white font-mono font-bold">{securityData.current} / 100</span>
                </div>
              </div>

              <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans bg-slate-950/50 p-2.5 rounded-xl border border-slate-900/60">
                Remediated SQL queries interpolation, fixed raw parameter validation schemas, and isolated downstream system paths.
              </p>
            </div>

            {/* Widget 2: Stability Index Warning Indicators */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Evolution Indexes
                </h4>
                <span className="text-[9.5px] font-mono text-slate-500">v1.2.0 stats</span>
              </div>

              <div className="space-y-3.5">
                {/* Metric 1 */}
                <div className="space-y-1.5 font-sans">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Branch Stability Index</span>
                    <span className="text-white font-bold font-mono">94.8%</span>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: '94.8%' }} />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="space-y-1.5 font-sans">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Codebase Churn Average</span>
                    <span className="text-white font-bold font-mono">42.3%</span>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full" style={{ width: '42.3%' }} />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="space-y-1.5 font-sans">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Active Authors count</span>
                    <span className="text-white font-bold font-mono">3 Contributors</span>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>

              <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl flex items-start gap-2.5 mt-2">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-[10px] text-rose-300 leading-normal font-sans">
                  <strong className="text-white font-bold uppercase tracking-wider block mb-0.5 text-[8.5px]">Hotspot Alert</strong>
                  One file is identified with a Critical churn-to-risk ratio. Focus reviews on <code className="bg-slate-950 border border-slate-850 px-1 rounded text-white font-mono text-[9px]">OrderService.java</code>.
                </div>
              </div>
            </div>

            {/* Widget 3: Premium Context Information */}
            <div className="bg-gradient-to-br from-slate-950/80 to-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-inner space-y-3.5 text-left float-card">
              <div className="flex items-center gap-2 text-slate-200 font-extrabold text-xs font-sans">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                Understanding Version Diff
              </div>
              <p className="leading-relaxed text-[11px] text-slate-400 font-sans">
                CodeScope retains compilation metadata caches from upload snapshots. Selecting a comparative release evaluates structures to map API shifts, code modifications, security indexes, and contributor metrics dynamically.
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
