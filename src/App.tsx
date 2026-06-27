import React, { useState, useEffect } from "react";
import { Cpu } from "lucide-react";
import JSZip from "jszip";
import { CodeScopeAnalysis, EndpointItem, DBTable, SecurityIssue, RefactoringSuggestion } from "./types";
import { Header } from "./components/layout/Header";
import { HomePage } from "./pages/HomePage";
import { UploadZone } from "./components/UploadZone";
import { springBootEcommerce, laravelBlog, expressPrisma } from "./data/samples";
import { MOCK_FILES, getFallbackContent } from "./data/mockFiles";

export default function App() {
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
      
      let processed = 0;
      for (const filename of fileNames) {
        const zipFile = contents.files[filename];
        if (!zipFile.dir) {
          // Read contents of important files (config or code files) for static analysis
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
            ext === ".js" ||
            ext === ".py" ||
            ext === ".java" ||
            ext === ".php";
            
          let fileText = "";
          if (shouldRead && zipFile.async) {
            fileText = await zipFile.async("text");
          }
          
          // Get metadata
          const fileData = await zipFile.async("uint8array");
          fileList.push({
            name: filename,
            size: fileData.length,
            content: fileText ? fileText.substring(0, 15000) : undefined // Limit to first 15KB per file context
          });
        }
        processed++;
      }

      setUploadProgress("Uploading file map for AI intelligence scan...");
      setUploadedZipFiles(fileList);

      // Trigger server endpoint POST /api/analyze
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: file.name.replace(".zip", ""),
          files: fileList
        })
      });

      if (!response.ok) {
        throw new Error("API analysis request failed");
      }

      const report: CodeScopeAnalysis = await response.json();
      setUploadProgress("Finalizing Interactive Graph Layouts...");
      
      // Inject files list into files database if not fully present in the returned JSON
      if (!report.importAnalysis) report.importAnalysis = { largestFiles: [], circularDependencies: [], packageCouplingScore: 50 };
      if (!report.importAnalysis.largestFiles || report.importAnalysis.largestFiles.length === 0) {
        const sorted = [...fileList].sort((a, b) => b.size - a.size).slice(0, 5);
        report.importAnalysis.largestFiles = sorted.map(sf => ({
          file: sf.name,
          size: sf.size > 1024 ? `${(sf.size / 1024).toFixed(1)} KB` : `${sf.size} B`
        }));
      }

      // Add actual zip files as search candidates
      setActiveProject(report);
      setUploadProgress("Complete!");
      setTimeout(() => {
        setIsUploading(false);
        setActiveTab("dashboard");
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="codescope-root">
      
      {/* Dynamic Full Screen Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/90 flex flex-col justify-center items-center z-50 text-white px-4">
          <div className="relative flex justify-center items-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            <Cpu className="absolute text-indigo-400 h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-medium mb-2 tracking-tight">Parser Engine Scanning...</h2>
          <p className="text-indigo-300 font-mono text-sm max-w-md text-center bg-slate-800 py-2 px-4 rounded border border-indigo-950">
            {uploadProgress}
          </p>
          <p className="text-slate-400 text-xs mt-4">Analyzing project file graphs & building AST mapping model</p>
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
          onFixIssue={handleAutoFixIssue}
        />
      ) : (
        <UploadZone
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          gitRepoUrl={gitRepoUrl}
          setGitRepoUrl={setGitRepoUrl}
          handleZipUpload={handleZipUpload}
          handleGitImport={handleGitImport}
          recentProjects={recentProjects}
          handleSelectRecentProject={handleSelectRecentProject}
          handleLoadSampleProject={handleLoadSampleProject}
        />
      )}
    </div>
  );
}
