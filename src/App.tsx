import React, { useState, useEffect } from "react";
import { Cpu, Sparkles, Lock, CreditCard, RefreshCw } from "lucide-react";
import JSZip from "jszip";
import { CodeScopeAnalysis, EndpointItem, DBTable, SecurityIssue, RefactoringSuggestion } from "./types";
import { Header } from "./components/layout/Header";
import { HomePage } from "./pages/HomePage";
import { MainScreen } from "./components/MainScreen";
import { AuthPage } from "./components/AuthPage";
import { springBootEcommerce, laravelBlog, expressPrisma } from "./data/samples";
import { MOCK_FILES, getFallbackContent } from "./data/mockFiles";
import { auth } from "./firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import TeamDashboard from "./components/team/TeamDashboard";

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Projects State
  const [activeProject, setActiveProject] = useState<CodeScopeAnalysis | null>(null);
  const [projectSource, setProjectSource] = useState<'sample' | 'uploaded'>('uploaded');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Custom uploaded zip files state
  const [uploadedZipFiles, setUploadedZipFiles] = useState<Array<{ name: string; size: number; content?: string }>>([]);
  const [uploadedZipName, setUploadedZipName] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [gitRepoUrl, setGitRepoUrl] = useState<string>("");

  // Tabs Management
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Code Explorer State
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [fileSearchQuery, setFileSearchQuery] = useState<string>("");
  const [symbolSearchQuery, setSymbolSearchQuery] = useState<string>("");
  const [codeSearchQuery, setCodeSearchQuery] = useState<string>("");
  const [appliedSecurityFixes, setAppliedSecurityFixes] = useState<Record<string, boolean>>({});
  const [diffViewActive, setDiffViewActive] = useState<Record<string, boolean>>({});
  const [sampleCodeOverrides, setSampleCodeOverrides] = useState<Record<string, string>>({});

  // Architecture explorer detail state
  const [selectedArchLayer, setSelectedArchLayer] = useState<string | null>("Services Layer");

  // Dependency Explorer detail state
  const [selectedDepNode, setSelectedDepNode] = useState<string>("OrderService");

  // Swagger state
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointItem | null>(null);
  const [swaggerRequestBody, setSwaggerRequestBody] = useState<string>("{\n  \"items\": [\n    { \"id\": \"prod-102\", \"quantity\": 2 }\n  ],\n  \"couponCode\": \"WINTER25\"\n}");
  const [swaggerResponse, setSwaggerResponse] = useState<{ status: number; headers: string; body: string } | null>(null);
  const [isSwaggerExecuting, setIsSwaggerExecuting] = useState<boolean>(false);
  const [simulatedExecutionTrace, setSimulatedExecutionTrace] = useState<string[]>([]);

  // ERD state
  const [selectedTable, setSelectedTable] = useState<DBTable | null>(null);

  // Security detail modal / code diff compare state
  const [selectedSecurityIssue, setSelectedSecurityIssue] = useState<SecurityIssue | null>(null);
  const [securityFixed, setSecurityFixed] = useState<boolean>(false);

  // Copy/Download feedback
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Custom User Analyzer Settings
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settingsSeverity, setSettingsSeverity] = useState<string>("All");
  const [settingsArchMatch, setSettingsArchMatch] = useState<number>(75);

  // Interactive Code Helper States
  const [helperSubTab, setHelperSubTab] = useState<string>("security-fixes");
  const [selectedHelperSecurity, setSelectedHelperSecurity] = useState<SecurityIssue | null>(null);
  const [selectedHelperRefactor, setSelectedHelperRefactor] = useState<RefactoringSuggestion | null>(null);
  const [helperSearchQuery, setHelperSearchQuery] = useState<string>("");
  const [simulatedDiffApplied, setSimulatedDiffApplied] = useState<boolean>(false);

  // SQL Terminal Playground State
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM users;");
  const [sqlResults, setSqlResults] = useState<Array<Record<string, any>> | null>(null);
  const [sqlAffectedRows, setSqlAffectedRows] = useState<number>(0);
  const [sqlError, setSqlError] = useState<string>("");
  const [sqlLoading, setSqlLoading] = useState<boolean>(false);

  // Sandbox live status polling
  const [sandboxDbState, setSandboxDbState] = useState<Record<string, Array<Record<string, any>>>>({});
  const [sandboxLogs, setSandboxLogs] = useState<any[]>([]);
  const [isSandboxLoading, setIsSandboxLoading] = useState<boolean>(false);
  const [activeSandboxTable, setActiveSandboxTable] = useState<string>("");
  const [expandedLogIndex, setExpandedLogIndex] = useState<number | null>(null);

  // Recent Projects cache list
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  // Team Dashboard from URL
  const [showTeamDashboard, setShowTeamDashboard] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const teamId = params.get('team');
    if (teamId) {
      setShowTeamDashboard(teamId);
    }

    // Listen for team project load events
    const handleLoadTeamProject = async (event: CustomEvent) => {
      const { projectId, teamId } = event.detail;
      try {
        setIsUploading(true);
        setUploadProgress(`Loading team project from team ${teamId}...`);
        
        const response = await fetch(`/api/teams/${teamId}/projects/${projectId}`);
        if (response.ok) {
          const projectData = await response.json();
          setActiveProject(projectData);
          setProjectSource('uploaded');
          setActiveTab("dashboard");
          setShowTeamDashboard(null);
        } else {
          alert("Failed to load team project");
        }
      } catch (err: any) {
        alert("Error loading team project: " + err.message);
      } finally {
        setIsUploading(false);
      }
    };

    window.addEventListener('loadTeamProject', handleLoadTeamProject as EventListener);
    return () => {
      window.removeEventListener('loadTeamProject', handleLoadTeamProject as EventListener);
    };
  }, []);

  const fetchRecentProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setRecentProjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch recent projects from server", err);
    }
  };

  useEffect(() => {
    fetchRecentProjects();
  }, [activeProject]);

  const handleSelectRecentProject = async (projectName: string) => {
    try {
      setIsUploading(true);
      setUploadProgress(`Restoring workspace project '${projectName}' from cache...`);
      
      const response = await fetch(`/api/projects/${encodeURIComponent(projectName)}`);
      if (response.ok) {
        const report = await response.json();
        setProjectSource('uploaded');
        setUploadedZipName(projectName);
        setActiveProject(report);

        // Reconstruct basic file list for explorer structure from largestFiles
        const restoredFiles: any[] = [];
        if (report.importAnalysis?.largestFiles) {
          report.importAnalysis.largestFiles.forEach((lf: any) => {
            restoredFiles.push({ name: lf.file, size: 1000, content: `// File '${lf.file}' loaded from cache.\n// Re-upload ZIP to view full content.` });
          });
        }
        setUploadedZipFiles(restoredFiles);
        setActiveTab("dashboard");
      } else {
        alert("Could not load project: Cache might have been purged.");
      }
    } catch (err: any) {
      alert(`Restoration failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Synchronize first default file for file viewer
  useEffect(() => {
    if (activeProject && activeProject.importAnalysis?.largestFiles?.length > 0) {
      setSelectedFile(activeProject.importAnalysis.largestFiles[0].file);
    } else {
      setSelectedFile("");
    }
    // Set first endpoint for Swagger
    if (activeProject && activeProject.endpoints?.length > 0) {
      setSelectedEndpoint(activeProject.endpoints[0]);
    } else {
      setSelectedEndpoint(null);
    }
    setSwaggerResponse(null);
    setSimulatedExecutionTrace([]);
    // Set first table for ERD
    if (activeProject && activeProject.database?.tables?.length > 0) {
      setSelectedTable(activeProject.database.tables[0]);
    } else {
      setSelectedTable(null);
    }
  }, [activeProject]);

  const fetchSandboxConfig = async () => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/sandbox-config/${activeProject.projectName.toLowerCase()}`);
      if (res.ok) {
        const data = await res.json();
        setSandboxDbState(data.dbState || {});
        setSandboxLogs(data.logs || []);
        
        // Auto-select first table if none is active
        const tables = Object.keys(data.dbState || {});
        if (tables.length > 0 && !activeSandboxTable) {
          const firstTable = tables.find(t => t.toLowerCase().includes("user")) || tables[0];
          setActiveSandboxTable(firstTable);
        }
      }
    } catch (err) {
      console.error("Failed to fetch live sandbox configurations", err);
    }
  };

  const handleSandboxReset = async () => {
    if (!activeProject) return;
    try {
      setIsSandboxLoading(true);
      const res = await fetch(`/api/sandbox-reset/${activeProject.projectName.toLowerCase()}`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setSandboxDbState(data.dbState || {});
        setSandboxLogs([]);
      }
    } catch (err) {
      console.error("Failed to reset sandbox", err);
    } finally {
      setIsSandboxLoading(false);
    }
  };

  useEffect(() => {
    if (!activeProject) return;
    fetchSandboxConfig();
    
    // Poll sandbox logs and DB changes every 2 seconds when user is on the runtime sandbox tab!
    let interval: any = null;
    if (activeTab === "runtime" || activeTab === "api") {
      interval = setInterval(fetchSandboxConfig, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeProject, activeTab, activeSandboxTable]);

  const pathExtension = (fname: string) => {
    const idx = fname.lastIndexOf(".");
    return idx === -1 ? "" : fname.substring(idx);
  };

  // Handle ZIP file upload in browser using JSZip
  // File selection states for ZIP analysis
  const [activeFixIssue, setActiveFixIssue] = useState<any | null>(null);
  const [showFilePicker, setShowFilePicker] = useState<boolean>(false);
  const [zipFilesList, setZipFilesList] = useState<string[]>([]);
  const [selectedFilesToAudit, setSelectedFilesToAudit] = useState<string[]>([]);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [pendingFileList, setPendingFileList] = useState<Array<{ name: string; size: number; content?: string }>>([]);

  // Scan Count and Pricing
  const [scanCount, setScanCount] = useState<number>(() => {
    const val = localStorage.getItem("codescope_scan_count");
    return val ? parseInt(val, 10) : 0;
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'blik' | 'gpay'>('card');
  const [blikCode, setBlikCode] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('');

  const calculateScanPrice = (fileCount: number) => {
    if (scanCount === 0) {
      if (fileCount <= 40) return 0;
      const extra = fileCount - 40;
      const rate = fileCount >= 100 ? 0.08 : 0.10;
      return extra * rate;
    } else {
      const rate = fileCount >= 100 ? 0.08 : 0.10;
      return fileCount * rate;
    }
  };

  const handleStartClicked = () => {
    if (!pendingUploadFile) return;
    const price = calculateScanPrice(selectedFilesToAudit.length);
    if (price > 0) {
      setIsPaymentModalOpen(true);
    } else {
      executeAnalysis();
    }
  };

  const handlePayAndStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    
    if (paymentMethod === 'blik') {
      setPaymentStep('Inicjowanie transakcji BLIK...');
      await new Promise(r => setTimeout(r, 600));
      setPaymentStep('Wysyłanie żądania autoryzacji do banku...');
      await new Promise(r => setTimeout(r, 800));
      setPaymentStep('Oczekiwanie na potwierdzenie w aplikacji mobilnej banku (BLIK)...');
      await new Promise(r => setTimeout(r, 1400));
      setPaymentStep('Płatność autoryzowana pomyślnie! Rozpoczynanie audytu...');
      await new Promise(r => setTimeout(r, 600));
    } else if (paymentMethod === 'gpay') {
      setPaymentStep('Inicjowanie transakcji Google Pay...');
      await new Promise(r => setTimeout(r, 600));
      setPaymentStep('Autoryzacja portfela cyfrowego i tokenu płatności...');
      await new Promise(r => setTimeout(r, 900));
      setPaymentStep('Płatność autoryzowana pomyślnie! Rozpoczynanie audytu...');
      await new Promise(r => setTimeout(r, 600));
    } else {
      setPaymentStep('Inicjowanie bezpiecznej transakcji SSL 256-bit...');
      await new Promise(r => setTimeout(r, 600));
      setPaymentStep('Weryfikacja karty przez bank i 3D-Secure...');
      await new Promise(r => setTimeout(r, 800));
      setPaymentStep('Płatność autoryzowana pomyślnie! Rozpoczynanie audytu...');
      await new Promise(r => setTimeout(r, 600));
    }
    
    setIsProcessingPayment(false);
    setIsPaymentModalOpen(false);
    
    await executeAnalysis();
  };

  const handleBypassPayment = async () => {
    setIsPaymentModalOpen(false);
    await executeAnalysis();
  };

  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setProjectSource('uploaded');
      setUploadedZipName(file.name);
      
      setUploadProgress("Reading zip file archive...");
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      const fileList: Array<{ name: string; size: number; content?: string }> = [];
      const fileNames = Object.keys(contents.files);
      
      setUploadProgress(`Extracting project hierarchy (${fileNames.length} nodes)...`);
      
      for (const filename of fileNames) {
        const zipFile = contents.files[filename];
        if (!zipFile.dir) {
          const ext = pathExtension(filename).toLowerCase();
          const shouldRead = 
            filename.includes("package.json") ||
            filename.includes("composer.json") ||
            filename.includes("pom.xml") ||
            filename.includes("requirements.txt") ||
            filename.includes(".env") ||
            filename.includes("schema") ||
            filename.includes("controller") ||
            filename.includes("service") ||
            filename.includes("route") ||
            ext === ".sql" ||
            ext === ".ts" ||
            ext === ".tsx" ||
            ext === ".js" ||
            ext === ".jsx" ||
            ext === ".py" ||
            ext === ".java" ||
            ext === ".php" ||
            ext === ".go" ||
            ext === ".rs";
            
          let fileText = "";
          if (shouldRead && zipFile.async) {
            fileText = await zipFile.async("text");
          }
          
          const fileData = await zipFile.async("uint8array");
          fileList.push({
            name: filename,
            size: fileData.length,
            content: fileText ? fileText.substring(0, 15000) : undefined
          });
        }
      }

      // Filter source code files for picker checkboxes
      const selectableFiles = fileList.filter(f => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'rs', 'java', 'sql', 'php', 'json', 'yml', 'yaml', 'xml', 'properties'];
        return ext && codeExtensions.includes(ext);
      }).map(f => f.name);

      setZipFilesList(selectableFiles);
      setSelectedFilesToAudit(selectableFiles.slice(0, 6)); // Default to first 6 files
      setPendingUploadFile(file);
      setPendingFileList(fileList);
      
      setIsUploading(false);
      setShowFilePicker(true);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      setUploadProgress("Failed to read ZIP archive.");
    }
  };

  const executeAnalysis = async () => {
    if (!pendingUploadFile) return;
    try {
      setShowFilePicker(false);
      setIsUploading(true);
      setUploadProgress("Uploading file map for AI intelligence scan...");
      setUploadedZipFiles(pendingFileList);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: pendingUploadFile.name.replace(".zip", ""),
          files: pendingFileList,
          selectedFiles: selectedFilesToAudit
        })
      });

      if (!response.ok) {
        throw new Error("API analysis request failed");
      }

      const report: CodeScopeAnalysis = await response.json();
      setUploadProgress("Finalizing Interactive Graph Layouts...");
      
      if (!report.importAnalysis) report.importAnalysis = { largestFiles: [], circularDependencies: [], packageCouplingScore: 50 };
      if (!report.importAnalysis.largestFiles || report.importAnalysis.largestFiles.length === 0) {
        const sorted = [...pendingFileList].sort((a, b) => b.size - a.size).slice(0, 5);
        report.importAnalysis.largestFiles = sorted.map(sf => ({
          file: sf.name,
          size: sf.size > 1024 ? `${(sf.size / 1024).toFixed(1)} KB` : `${sf.size} B`
        }));
      }

      setActiveProject(report);
      setUploadProgress("Complete!");
      setTimeout(() => {
        setIsUploading(false);
        setActiveTab("dashboard");
        setScanCount(prev => {
          const next = prev + 1;
          localStorage.setItem("codescope_scan_count", next.toString());
          return next;
        });
      }, 500);

    } catch (err) {
      console.error(err);
      setUploadProgress("Analysis failed. Reverting to standard parsing model.");
      setIsUploading(false);
    }
  };

  const handleGitImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitRepoUrl) return;

    setIsUploading(true);
    setUploadProgress("Cloning remote Git repository indices...");
    
    // Simulate repository cloning and analysis using real API
    setTimeout(async () => {
      setUploadProgress("Synthesizing Git metadata and structure...");
      
      const repoName = gitRepoUrl.split("/").pop()?.replace(".git", "") || "git-repo";
      
      const simulatedFiles = [
        {
          name: "package.json",
          size: 450,
          content: `{\n  "name": "${repoName}",\n  "version": "1.0.0",\n  "dependencies": {\n    "express": "^4.18.2",\n    "pg": "^8.11.3",\n    "jsonwebtoken": "^9.0.2"\n  }\n}`
        },
        {
          name: "src/server.ts",
          size: 1120,
          content: `import express from "express";\nimport jwt from "jsonwebtoken";\n\nconst app = express();\napp.use(express.json());\n\napp.post("/api/auth/login", (req, res) => {\n  const token = jwt.sign({ user: "admin" }, "super-secret-key-1234");\n  res.json({ token });\n});\n\napp.get("/api/users", (req, res) => {\n  res.json([{ id: 1, name: "Alice" }]);\n});\n\napp.listen(3000);`
        },
        {
          name: "src/db/schema.sql",
          size: 350,
          content: `CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  username VARCHAR(100) UNIQUE NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL\n);`
        },
        {
          name: "README.md",
          size: 150,
          content: `# ${repoName}\n\nAutomated enterprise grade static workspace.`
        }
      ];

      try {
        setUploadProgress("Running Project DNA Security Sweeps...");
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: repoName,
            files: simulatedFiles
          })
        });

        if (!response.ok) throw new Error("Git analysis failed");
        const report: CodeScopeAnalysis = await response.json();
        
        setUploadedZipFiles(simulatedFiles);
        setActiveProject(report);
        setProjectSource('uploaded');
        setUploadedZipName(repoName);
        setIsUploading(false);
        setActiveTab("dashboard");
      } catch (err) {
        console.error("Git simulation analysis error:", err);
        setUploadProgress("Cloning failed. Reverting.");
        setIsUploading(false);
      }
    }, 1200);
  };

  const copyTextToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const executeSwaggerTryIt = async () => {
    if (!selectedEndpoint || !activeProject) return;
    setIsSwaggerExecuting(true);
    setSwaggerResponse(null);
    setSimulatedExecutionTrace([]);

    const steps = selectedEndpoint.flow || [
      "Router Receive",
      "Middleware Check",
      "Controller Handler",
      "Database Execution",
      "Response Mapping"
    ];

    let targetUrl = `/api/sandbox/${activeProject.projectName.toLowerCase()}${selectedEndpoint.url}`;
    
    if (selectedEndpoint.url.includes("/:")) {
      const parts = selectedEndpoint.url.split("/");
      const resolvedParts = parts.map(part => {
        if (part.startsWith(":")) {
          return "1";
        }
        return part;
      });
      targetUrl = `/api/sandbox/${activeProject.projectName.toLowerCase()}${resolvedParts.join("/")}`;
    }

    try {
      const fetchOptions: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          "Content-Type": "application/json"
        }
      };

      if (selectedEndpoint.method !== "GET" && selectedEndpoint.method !== "DELETE") {
        fetchOptions.body = swaggerRequestBody;
      }

      const res = await fetch(targetUrl, fetchOptions);
      const resStatus = res.status;
      const resHeaders = Array.from(res.headers.entries())
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      
      let resBody = "";
      try {
        const json = await res.json();
        resBody = JSON.stringify(json, null, 2);
      } catch (_) {
        resBody = await res.text();
      }

      let currentStepIndex = 0;
      const interval = setInterval(() => {
        if (currentStepIndex < steps.length) {
          setSimulatedExecutionTrace(prev => [...prev, steps[currentStepIndex]]);
          currentStepIndex++;
        } else {
          clearInterval(interval);
          setIsSwaggerExecuting(false);
          setSwaggerResponse({
            status: resStatus,
            headers: `HTTP/1.1 ${resStatus} ${resStatus >= 200 && resStatus < 300 ? "OK" : "Error"}\n${resHeaders}`,
            body: resBody
          });
        }
      }, 100);

    } catch (err: any) {
      setIsSwaggerExecuting(false);
      setSwaggerResponse({
        status: 500,
        headers: "HTTP/1.1 500 Connection Error",
        body: JSON.stringify({ error: err.message || "Failed to contact live sandbox server" }, null, 2)
      });
    }
  };

  const handleExecuteSQLQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    if (!q.trim() || !activeProject) return;

    setSqlLoading(true);
    setSqlError("");
    setSqlResults(null);
    setSqlAffectedRows(0);

    try {
      const response = await fetch(`/api/sql-terminal/${encodeURIComponent(activeProject.projectName)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Wystąpił błąd podczas wykonywania zapytania.");
      }

      const data = await response.json();
      if (data.status === "error" || data.error) {
        setSqlError(data.error || "Execution failed.");
      } else {
        setSqlResults(data.rows);
        setSqlAffectedRows(data.affectedRows);
      }
    } catch (error: any) {
      setSqlError(error.message);
    } finally {
      setSqlLoading(false);
    }
  };

  const triggerDownloadReport = (format: 'markdown' | 'json' | 'html') => {
    if (!activeProject) return;
    let content = "";
    let mimeType = "text/plain";
    let filename = `codescope-report-${activeProject.projectName.toLowerCase().replace(/\s+/g, "-")}`;

    if (format === 'json') {
      content = JSON.stringify(activeProject, null, 2);
      mimeType = "application/json";
      filename += ".json";
    } else if (format === 'markdown') {
      content = `# CodeScope Static Analysis Report: ${activeProject.projectName}
Date: ${new Date().toLocaleDateString()}
Health Score: ${activeProject.healthScore}/100

## Architecture: ${activeProject.architecture.style}
Confidence Match: ${activeProject.architecture.confidence}%
${activeProject.architecture.explanation}

## Technologies Detected (DNA)
- Frameworks: ${activeProject.projectDNA.frameworks.join(", ")}
- Databases: ${activeProject.projectDNA.databases.join(", ")}
- Infrastructure: ${activeProject.projectDNA.infrastructure.join(", ")}

## Key Findings
- Total Vulnerabilities: ${activeProject.security?.length || 0}
- Performance Bottlenecks: ${activeProject.performance?.length || 0}
- Refactoring Suggestions: ${activeProject.refactoring?.length || 0}
`;
      mimeType = "text/markdown";
      filename += ".md";
    } else {
      content = `<!DOCTYPE html>
<html>
<head><title>CodeScope Report</title><style>body { font-family: sans-serif; padding: 20px; }</style></head>
<body>
  <h1>CodeScope static analysis for ${activeProject.projectName}</h1>
  <p><strong>Health Score:</strong> ${activeProject.healthScore}/100</p>
  <h2>Architecture style: ${activeProject.architecture.style}</h2>
  <p>${activeProject.architecture.explanation}</p>
</body>
</html>`;
      mimeType = "text/html";
      filename += ".html";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAutoFixIssue = async (filePath: string, oldCode: string, newCode: string) => {
    if (projectSource === 'sample') {
      setIsUploading(true);
      setUploadProgress("Code repaired. Re-running diagnostics hub...");
      
      await new Promise(resolve => setTimeout(resolve, 800));

      const baseName = filePath.substring(filePath.lastIndexOf("/") + 1).substring(filePath.lastIndexOf("\\") + 1);
      const matchKey = Object.keys(MOCK_FILES).find(k => k.toLowerCase() === baseName.toLowerCase() || filePath.toLowerCase().endsWith(k.toLowerCase()));
      
      let originalContent = "";
      if (sampleCodeOverrides[filePath]) {
        originalContent = sampleCodeOverrides[filePath];
      } else if (matchKey) {
        originalContent = MOCK_FILES[matchKey];
      } else {
        originalContent = getFallbackContent(filePath);
      }

      const updatedContent = originalContent.replace(oldCode, newCode);
      setSampleCodeOverrides(prev => ({
        ...prev,
        [filePath]: updatedContent,
        [matchKey || filePath]: updatedContent
      }));

      if (activeProject) {
        const updatedProject = { ...activeProject };
        
        const markFixed = (arr?: any[]) => {
          return arr?.map(item => {
            const isMatch = item.file === filePath && (item.oldCode === oldCode || item.description.includes(oldCode.substring(0, 20)));
            if (isMatch) {
              return { ...item, isFixed: true };
            }
            return item;
          });
        };

        if (updatedProject.security) updatedProject.security = markFixed(updatedProject.security);
        if (updatedProject.performance) updatedProject.performance = markFixed(updatedProject.performance);
        if (updatedProject.bugs) updatedProject.bugs = markFixed(updatedProject.bugs);
        if (updatedProject.codeSmells) updatedProject.codeSmells = markFixed(updatedProject.codeSmells);
        if (updatedProject.compliance) updatedProject.compliance = markFixed(updatedProject.compliance);

        updatedProject.healthScore = Math.min(100, updatedProject.healthScore + 2);
        setActiveProject(updatedProject);
      }

      setIsUploading(false);
      alert("Success: Auto-fixed virtual sample file and re-analyzed workspace successfully!");
      return;
    }

    // 1. Send dynamic fix query request to local node backend server
    try {
      const response = await fetch("/api/fix-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, oldCode, newCode })
      });
      if (!response.ok) {
        const err = await response.json();
        alert(`Failed to patch local file on disk: ${err.error}`);
        return;
      }
    } catch (err: any) {
      console.error("Local filesystem auto-fix write failed", err);
    }

    // 2. Perform in-memory browser virtual replacement to enable mock files mapping instantly
    const updatedFiles = uploadedZipFiles.map(file => {
      if (file.name === filePath && file.content) {
        return {
          ...file,
          content: file.content.replace(oldCode, newCode)
        };
      }
      return file;
    });
    setUploadedZipFiles(updatedFiles);

    // 3. Re-run analysis automatically using updated files
    try {
      setIsUploading(true);
      setUploadProgress("Code repaired. Re-running diagnostics hub...");
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: activeProject?.projectName || "Repaired Codebase",
          files: updatedFiles
        })
      });

      if (!response.ok) throw new Error("API analysis request failed");
      const report: CodeScopeAnalysis = await response.json();
      setActiveProject(report);
      alert("Success: Auto-fixed local file code block on your computer disk and re-analyzed workspace successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Auto-fix applied, but re-analysis failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveFile = async (filePath: string, content: string) => {
    if (projectSource === 'sample') {
      setIsUploading(true);
      setUploadProgress("Saving virtual sample file and re-running diagnostics...");
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setSampleCodeOverrides(prev => ({
        ...prev,
        [filePath]: content
      }));

      // Simulate diagnostic refresh
      if (activeProject) {
        const updatedProject = { ...activeProject };
        updatedProject.healthScore = Math.min(100, updatedProject.healthScore + 1);
        setActiveProject(updatedProject);
      }
      setIsUploading(false);
      return;
    }

    try {
      const response = await fetch("/api/save-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, content })
      });
      if (!response.ok) {
        let errMsg = `Server returned status ${response.status}`;
        try {
          const err = await response.json();
          errMsg = err.error || errMsg;
        } catch {
          try {
            errMsg = await response.text() || errMsg;
          } catch {}
        }
        alert(`Failed to save file on disk: ${errMsg}`);
        return;
      }
    } catch (err: any) {
      console.error("Local filesystem write failed", err);
      alert(`Save operation failed: ${err.message}`);
      return;
    }

    const updatedFiles = uploadedZipFiles.map(file => {
      if (file.name === filePath) {
        return {
          ...file,
          content: content
        };
      }
      return file;
    });
    setUploadedZipFiles(updatedFiles);

    try {
      setIsUploading(true);
      setUploadProgress("Code modified. Re-running diagnostics hub...");
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: activeProject?.projectName || "Repaired Codebase",
          files: updatedFiles,
          selectedFiles: selectedFilesToAudit
        })
      });

      if (!response.ok) throw new Error("API analysis request failed");
      const report: CodeScopeAnalysis = await response.json();
      setActiveProject(report);
    } catch (err: any) {
      console.error(err);
      alert(`File saved on disk, but re-analysis failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSampleProject = (sampleName: 'ecommerce' | 'microservice' | 'fintech') => {
    let sample: CodeScopeAnalysis;
    if (sampleName === 'ecommerce') sample = springBootEcommerce;
    else if (sampleName === 'microservice') sample = laravelBlog;
    else sample = expressPrisma;

    setProjectSource('sample');
    setUploadedZipName(sample.projectName);
    setActiveProject(sample);
    
    if (sampleName === 'ecommerce') setSelectedFile("OrderService.java");
    else if (sampleName === 'microservice') setSelectedFile("PostController.php");
    else setSelectedFile("UserController.ts");

    setSampleCodeOverrides({});
    setActiveTab("dashboard");
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center text-white font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-xs text-slate-400 font-mono">Verifying secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      {showTeamDashboard && (
        <TeamDashboard teamId={showTeamDashboard} onClose={() => setShowTeamDashboard(null)} />
      )}
      <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col font-sans" id="codescope-root">
      
      {/* Premium Dynamic Full Screen Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-[#07070a]/95 backdrop-blur-md flex flex-col justify-center items-center z-50 text-white px-4 overflow-hidden">
          {/* Orbital Backgrounds */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative flex justify-center items-center mb-8">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
            <div className="relative w-20 h-20 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
              <Cpu className="text-indigo-400 h-8 w-8 relative z-10" />
            </div>
            {/* Spinning ring */}
            <div className="absolute -inset-4 border border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute -inset-8 border border-emerald-500/10 border-b-emerald-400/50 rounded-full animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
          </div>

          <h2 className="text-2xl font-black mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Parser Engine Scanning
          </h2>
          
          <div className="bg-slate-900/60 border border-indigo-500/20 py-3 px-6 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] max-w-md w-full mb-6">
            <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin flex-shrink-0" />
            <p className="text-indigo-200 font-mono text-xs w-full text-center tracking-wide">
              {uploadProgress}
            </p>
          </div>

          <p className="text-slate-500 text-[11px] uppercase tracking-widest font-bold">
            Analyzing project file graphs & building AST mapping model
          </p>
        </div>
      )}

      {/* Top Banner Navigation */}
      <Header
        activeProject={activeProject}
        handleZipUpload={handleZipUpload}
        setActiveProject={setActiveProject}
        handleLoadSampleProject={handleLoadSampleProject}
        projectSource={projectSource}
      />

      {/* Main Workspace Frame */}
      {activeProject ? (
        <HomePage
          activeProject={activeProject}
          projectSource={projectSource}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setActiveProject={setActiveProject}
          handleZipUpload={handleZipUpload}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          settingsSeverity={settingsSeverity}
          setSettingsSeverity={setSettingsSeverity}
          settingsArchMatch={settingsArchMatch}
          setSettingsArchMatch={setSettingsArchMatch}
          selectedArchLayer={selectedArchLayer}
          setSelectedArchLayer={setSelectedArchLayer}
          symbolSearchQuery={symbolSearchQuery}
          setSymbolSearchQuery={setSymbolSearchQuery}
          selectedDepNode={selectedDepNode}
          setSelectedDepNode={setSelectedDepNode}
          fetchSandboxConfig={fetchSandboxConfig}
          handleSandboxReset={handleSandboxReset}
          sandboxDbState={sandboxDbState}
          sandboxLogs={sandboxLogs}
          activeSandboxTable={activeSandboxTable}
          setActiveSandboxTable={setActiveSandboxTable}
          expandedLogIndex={expandedLogIndex}
          setExpandedLogIndex={setExpandedLogIndex}
          selectedEndpoint={selectedEndpoint}
          setSelectedEndpoint={setSelectedEndpoint}
          swaggerRequestBody={swaggerRequestBody}
          setSwaggerRequestBody={setSwaggerRequestBody}
          executeSwaggerTryIt={executeSwaggerTryIt}
          isSwaggerExecuting={isSwaggerExecuting}
          simulatedExecutionTrace={simulatedExecutionTrace}
          swaggerResponse={swaggerResponse}
          setSwaggerResponse={setSwaggerResponse}
          setSimulatedExecutionTrace={setSimulatedExecutionTrace}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          activeFixIssue={activeFixIssue}
          setActiveFixIssue={setActiveFixIssue}
          fileSearchQuery={fileSearchQuery}
          setFileSearchQuery={setFileSearchQuery}
          codeSearchQuery={codeSearchQuery}
          setCodeSearchQuery={setCodeSearchQuery}
          appliedSecurityFixes={appliedSecurityFixes}
          setAppliedSecurityFixes={setAppliedSecurityFixes}
          diffViewActive={diffViewActive}
          setDiffViewActive={setDiffViewActive}
          uploadedZipFiles={uploadedZipFiles}
          sampleCodeOverrides={sampleCodeOverrides}
          selectedSecurityIssue={selectedSecurityIssue}
          setSelectedSecurityIssue={setSelectedSecurityIssue}
          securityFixed={securityFixed}
          setSecurityFixed={setSecurityFixed}
          triggerDownloadReport={triggerDownloadReport}
          helperSubTab={helperSubTab}
          setHelperSubTab={setHelperSubTab}
          selectedHelperSecurity={selectedHelperSecurity}
          setSelectedHelperSecurity={setSelectedHelperSecurity}
          selectedHelperRefactor={selectedHelperRefactor}
          setSelectedHelperRefactor={setSelectedHelperRefactor}
          helperSearchQuery={helperSearchQuery}
          setHelperSearchQuery={setHelperSearchQuery}
          simulatedDiffApplied={simulatedDiffApplied}
          setSimulatedDiffApplied={setSimulatedDiffApplied}
          sqlQuery={sqlQuery}
          setSqlQuery={setSqlQuery}
          handleExecuteSQLQuery={handleExecuteSQLQuery}
          sqlLoading={sqlLoading}
          sqlResults={sqlResults}
          sqlAffectedRows={sqlAffectedRows}
          sqlError={sqlError}
          copyFeedback={copyFeedback}
          copyTextToClipboard={copyTextToClipboard}
          onSaveFile={handleSaveFile}
          onFixIssue={handleAutoFixIssue}
        />
      ) : showFilePicker ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="max-w-md w-full bg-[#141417] p-6 rounded-2xl border border-[#222228] space-y-4 text-left shadow-2xl">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#f1f1f5]">Wybierz pliki do analizy AI</h3>
            </div>
            <p className="text-xs text-[#9ea4b0]">
              Wybierz pliki z archiwum, które chcesz poddać audytowi AI. Bazowy plan obejmuje do 6 plików bez dodatkowych opłat.
            </p>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedFilesToAudit(zipFilesList)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
              >
                Zaznacz wszystkie
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilesToAudit([])}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
              >
                Odznacz wszystkie
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-[#222228] rounded-lg divide-y divide-[#222228] bg-[#0d0d0f]/40 scrollbar-thin">
              {zipFilesList.map((filename) => {
                const isChecked = selectedFilesToAudit.includes(filename);
                return (
                  <label key={filename} className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#d1d1d6] hover:bg-[#1a1a1f] cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFilesToAudit(prev => [...prev, filename]);
                        } else {
                          setSelectedFilesToAudit(prev => prev.filter(f => f !== filename));
                        }
                      }}
                      className="accent-indigo-500 rounded border-slate-700 bg-slate-850"
                    />
                    <span className="truncate select-none">{filename}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-xs font-semibold pt-2 border-t border-[#222228]">
              <div className="flex flex-col text-[#9ea4b0]">
                <span>Wybrano plików: {selectedFilesToAudit.length}</span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {scanCount === 0 ? "Pierwszy skan (do 40 plik. darmowy)" : "Kolejny skan (płatny każdy plik)"}
                </span>
              </div>
              <span className="text-amber-400 font-bold text-sm">
                Cena: {calculateScanPrice(selectedFilesToAudit.length).toFixed(2).replace('.', ',')} PLN
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowFilePicker(false);
                  setPendingUploadFile(null);
                }}
                className="flex-1 py-2 border border-[#222228] text-[#9ea4b0] rounded-lg text-xs font-semibold hover:bg-[#1a1a1f] transition-colors"
              >
                Wróć
              </button>
              <button
                onClick={handleStartClicked}
                className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md text-center"
              >
                Uruchom analizę
              </button>
            </div>
          </div>
        </div>
      ) : (
        <MainScreen
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          gitRepoUrl={gitRepoUrl}
          setGitRepoUrl={setGitRepoUrl}
          handleZipUpload={handleZipUpload}
          handleGitImport={handleGitImport}
          recentProjects={recentProjects}
          handleSelectRecentProject={handleSelectRecentProject}
          handleLoadSampleProject={handleLoadSampleProject}
          setShowSettings={setShowSettings}
          setActiveTab={setActiveTab}
        />
      
      )}

      {/* Mock Payment Gateway Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white relative text-left">
              <div className="absolute top-4 right-4">
                <button 
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)} 
                  className="text-slate-400 hover:text-white transition-colors text-sm font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-1 text-blue-400 font-bold uppercase tracking-wider text-[10px]">
                <Lock size={12} className="text-blue-400" /> Bezpieczna płatność testowa
              </div>
              <h3 className="text-lg font-black tracking-tight mt-1">Stripe Checkout Simulation</h3>
              <p className="text-xs text-slate-400 mt-1">Zatwierdź transakcję, aby odblokować dedykowany audyt.</p>
            </div>

            {/* Simulated Receipt */}
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center text-xs text-left">
              <div>
                <span className="text-slate-400 font-semibold uppercase block text-[8px] tracking-wider">Plan:</span>
                <span className="font-bold text-slate-700">
                  Dedykowana analiza kodu AI
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-semibold uppercase block text-[8px] tracking-wider">Do zapłaty:</span>
                <span className="text-base font-black text-slate-900">
                  {calculateScanPrice(selectedFilesToAudit.length).toFixed(2).replace('.', ',')} PLN
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="flex bg-slate-100 rounded-lg p-1 mx-6 mt-4 border border-slate-200">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${paymentMethod === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
              >
                Karta
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('blik')}
                className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${paymentMethod === 'blik' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
              >
                BLIK
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('gpay')}
                className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${paymentMethod === 'gpay' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-500 hover:text-slate-850'}`}
              >
                GPay
              </button>
            </div>

            {/* Credit Card Graphic mockup */}
            {paymentMethod === 'card' && (
              <div className="px-6 pt-5">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden aspect-[1.586/1] flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-7 bg-amber-400/80 rounded-md border border-amber-300/40 relative overflow-hidden flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-0.5 w-full h-full p-1 opacity-60">
                        {[...Array(6)].map((_, i) => <div key={i} className="border border-slate-900 rounded-2xs" />)}
                      </div>
                    </div>
                    <span className="text-xs font-black italic tracking-widest text-slate-300 uppercase">
                      {cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Test Card'}
                    </span>
                  </div>

                  <div className="text-lg font-mono font-bold tracking-widest text-center my-3 select-all">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end text-xs font-mono uppercase text-slate-300">
                    <div>
                      <span className="text-[7px] text-slate-400 block tracking-wider font-sans">Właściciel karty</span>
                      <span className="truncate max-w-[180px] inline-block font-semibold">{cardName || 'JAN KOWALSKI'}</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[7px] text-slate-400 block tracking-wider font-sans">Ważność</span>
                      <span className="font-semibold">{cardExpiry || '12/29'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BLIK Graphics */}
            {paymentMethod === 'blik' && (
              <div className="px-6 pt-5 text-center">
                <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl flex flex-col items-center justify-center gap-2.5">
                  <div className="bg-pink-600 text-white px-5 py-2 rounded-xl font-black italic tracking-widest text-lg shadow-sm select-none">
                    blik
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                    Wprowadź 6-cyfrowy kod BLIK z aplikacji bankowej i zatwierdź go na swoim telefonie po kliknięciu Autoryzuj.
                  </p>
                </div>
              </div>
            )}

            {/* GPay Graphics */}
            {paymentMethod === 'gpay' && (
              <div className="px-6 pt-5 text-center">
                <div className="bg-slate-50 border border-slate-200/60 p-8 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <div className="bg-slate-950 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm text-sm tracking-wide justify-center">
                    <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" /> Google Pay
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-[220px] mx-auto leading-relaxed">
                    Szybka autoryzacja za pomocą karty płatniczej przypisanej do Twojego konta Google.
                  </p>
                </div>
              </div>
            )}

            {/* Input fields form */}
            <form onSubmit={handlePayAndStart} className="p-6 space-y-4">
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div className="text-left">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Numer karty</label>
                    <div className="relative">
                      <CreditCard size={14} className="absolute left-3 top-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        placeholder="4242 4242 4242 4242" 
                        value={cardNumber}
                        maxLength={19}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                          setCardNumber(val);
                        }}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-slate-850 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Imię i nazwisko właściciela</label>
                    <input 
                      type="text" 
                      required
                      placeholder="JAN KOWALSKI" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-850 focus:bg-white font-mono uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Ważność (MM/YY)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="12/29" 
                        value={cardExpiry}
                        maxLength={5}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 2) {
                            val = val.substring(0, 2) + '/' + val.substring(2, 4);
                          }
                          setCardExpiry(val);
                        }}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-850 focus:bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CVV</label>
                      <input 
                        type="password" 
                        required
                        placeholder="123" 
                        value={cardCvv}
                        maxLength={3}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-850 focus:bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'blik' && (
                <div className="text-left">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Kod BLIK</label>
                  <input 
                    type="text" 
                    required
                    placeholder="123 456" 
                    value={blikCode}
                    maxLength={7}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/(.{3})/g, '$1 ').trim();
                      setBlikCode(val);
                    }}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-850 focus:bg-white font-mono text-center text-lg font-bold tracking-widest"
                  />
                </div>
              )}

              <div className="pt-2">
                {isProcessingPayment ? (
                  <div className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm">
                    <RefreshCw size={14} className="animate-spin text-blue-400" />
                    <span className="text-[10px] text-slate-300 font-medium animate-pulse">{paymentStep}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => setIsPaymentModalOpen(false)} 
                        className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        Anuluj
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Lock size={12} /> Autoryzuj {calculateScanPrice(selectedFilesToAudit.length).toFixed(2).replace('.', ',')} PLN
                      </button>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={handleBypassPayment}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-600 border border-indigo-100 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Sparkles size={12} className="text-indigo-500 animate-pulse" /> Pomiń płatność (Tryb testowy)
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
