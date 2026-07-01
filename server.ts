import express from "express";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { processAnalysis } from "./mainAnalyze.js";
import { sandboxProjects, initializeMockData, executeSQL, matchRoute } from "./runtime.js";
import { authRouter } from "./authRoutes.js";
import { chatDb, teamDb, billingDb } from "./db.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3022;

app.use(express.json({ limit: "50mb" }));

// ─── Auth + Team routes ───────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// ─── Socket.io setup (realtime chat + presence) ───────────────────────────
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  path: "/socket.io"
});

// Track online presence per team
const teamPresence: Record<string, Set<string>> = {}; // teamId → Set of usernames

io.on("connection", (socket) => {
  let currentUser: { id: string; username: string } | null = null;
  let currentTeamId: string | null = null;

  socket.on("team:join", ({ teamId, user }) => {
    currentUser = user;
    currentTeamId = teamId;
    socket.join(teamId);

    if (!teamPresence[teamId]) teamPresence[teamId] = new Set();
    teamPresence[teamId].add(user.username);

    // Broadcast updated presence list
    io.to(teamId).emit("presence:update", Array.from(teamPresence[teamId]));

    // Send chat history to new joiner
    const history = chatDb.getRecent(teamId, 50);
    socket.emit("chat:history", history);
  });

  socket.on("chat:send", ({ teamId, user, message, context }) => {
    if (!teamId || !user || !message) return;

    // Persist to SQLite
    chatDb.save(teamId, user.id, user.username, message, context);

    const msg = {
      id: Date.now().toString(),
      teamId, userId: user.id, username: user.username,
      message, context: context || null,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all room members
    io.to(teamId).emit("chat:message", msg);
  });

  socket.on("presence:viewing", ({ teamId, user, file, line }) => {
    socket.to(teamId).emit("presence:viewing", { user, file, line });
  });

  socket.on("disconnect", () => {
    if (currentTeamId && currentUser) {
      teamPresence[currentTeamId]?.delete(currentUser.username);
      io.to(currentTeamId).emit("presence:update", Array.from(teamPresence[currentTeamId] || []));
    }
  });
});

// Initialize Gemini client if API key is provided
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI Client initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.log("No GEMINI_API_KEY found. Running in local fallback mode.");
}

// Healthy route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiEnabled: !!ai });
});

// REST route: Analyze codebase using modular analytical framework
app.post("/api/analyze", async (req, res) => {
  const { files, projectName } = req.body;
  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: "No files list provided for analysis" });
  }

  try {
    const report = await processAnalysis(files, projectName, ai);
    
    // Save report to real sandbox instance
    const cleanProjName = report.projectName || "Uploaded Project";
    const tables = report.database?.tables || [];
    sandboxProjects.set(cleanProjName.toLowerCase(), {
      projectName: cleanProjName,
      dbState: initializeMockData(tables),
      logs: [],
      analysis: report
    });
    console.log(`[Runtime Init] Initialized real runtime sandbox for project: ${cleanProjName}`);

    return res.json(report);
  } catch (err) {
    console.error("Analysis execution failed:", err);
    return res.status(500).json({ error: "Failed to perform codebase static analysis." });
  }
});

// Safe workspace file path resolver helper
async function resolveWorkspaceFile(filePath: string): Promise<string | null> {
  const fs = await import("fs/promises");
  let absolutePath = path.resolve(process.cwd(), filePath);
  
  // 1. Direct match check
  try {
    await fs.access(absolutePath);
    return absolutePath;
  } catch {}

  // 2. Strip top level folder prefix check (e.g. "my-project-master/src/App.tsx" -> "src/App.tsx")
  const parts = filePath.split(/[/\\]/);
  if (parts.length > 1) {
    const stripped = parts.slice(1).join("/");
    const altPath = path.resolve(process.cwd(), stripped);
    try {
      await fs.access(altPath);
      return altPath;
    } catch {}
  }

  // 3. Search suffix recursively in workspace
  const findFileWithSuffix = async (dir: string, suffix: string): Promise<string | null> => {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const resPath = path.resolve(dir, entry.name);
        if (entry.isDirectory()) {
          if (['node_modules', 'dist', 'build', '.git'].includes(entry.name)) continue;
          const match = await findFileWithSuffix(resPath, suffix);
          if (match) return match;
        } else {
          const normalizedRes = resPath.replace(/\\/g, '/').toLowerCase();
          const normalizedSuffix = suffix.replace(/\\/g, '/').toLowerCase();
          if (normalizedRes.endsWith(normalizedSuffix)) {
            return resPath;
          }
        }
      }
    } catch (e) {
      console.warn(`[Resolve] Directory read failed for: ${dir}`);
    }
    return null;
  };

  // Try suffix of length 2 (e.g. "src/App.tsx")
  if (parts.length >= 2) {
    const suffix = parts.slice(-2).join("/");
    const matched = await findFileWithSuffix(process.cwd(), suffix);
    if (matched) return matched;
  }

  // Try suffix of length 1 (e.g. "App.tsx")
  if (parts.length >= 1) {
    const suffix = parts.slice(-1)[0];
    const matched = await findFileWithSuffix(process.cwd(), suffix);
    if (matched) return matched;
  }

  return null;
}

// Auto-fix endpoint to modify code directly on disk
app.post("/api/fix-code", async (req, res) => {
  const { filePath, oldCode, newCode } = req.body;
  if (!filePath || oldCode === undefined || newCode === undefined) {
    return res.status(400).json({ error: "Missing filePath, oldCode or newCode parameters." });
  }

  try {
    const absolutePath = await resolveWorkspaceFile(filePath);
    if (!absolutePath) {
      return res.status(404).json({ error: `File not found on local disk at: ${filePath}` });
    }
    
    // Prevent directory traversal: check if it starts with process.cwd()
    if (!absolutePath.toLowerCase().startsWith(process.cwd().toLowerCase())) {
      return res.status(403).json({ error: "Forbidden: Cannot edit files outside of the workspace directory." });
    }

    const baseName = path.basename(absolutePath).toLowerCase();
    const extName = path.extname(absolutePath).toLowerCase();

    const ALLOWED_EXTENSIONS = [
      ".ts", ".tsx", ".js", ".jsx", ".java", ".py", ".go", ".rs", ".php",
      ".sql", ".json", ".xml", ".txt", ".md", ".html", ".css",
      ".yml", ".yaml", ".gitignore", ".env", ".local", ".example",
      ".prettierrc", ".eslintrc", ".babelrc", ".toml", ".config", ""
    ];

    if (!ALLOWED_EXTENSIONS.includes(extName)) {
      return res.status(403).json({ error: "Forbidden: File extension is not allowed for modification." });
    }

    const fs = await import("fs/promises");
    const fileContent = await fs.readFile(absolutePath, "utf-8");
    
    if (!fileContent.includes(oldCode)) {
      return res.status(400).json({ 
        error: "Target code block not found in file. The file may have been already modified." 
      });
    }

    const updatedContent = fileContent.replace(oldCode, newCode);
    await fs.writeFile(absolutePath, updatedContent, "utf-8");
    
    console.log(`[Auto-Fix] Successfully fixed file on disk: ${filePath}`);
    return res.json({ status: "success", message: `Successfully fixed file on disk at: ${filePath}` });
  } catch (err: any) {
    console.error("Auto-fix execution failed:", err);
    return res.status(500).json({ error: `Failed to fix file on disk: ${err.message}` });
  }
});

// Save file endpoint to overwrite file content directly on disk
app.post("/api/save-file", async (req, res) => {
  const { filePath, content } = req.body;
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: "Missing filePath or content parameters." });
  }

  try {
    const absolutePath = await resolveWorkspaceFile(filePath);
    if (!absolutePath) {
      return res.status(404).json({ error: `File not found on local disk at: ${filePath}` });
    }
    
    // Prevent directory traversal: check if it starts with process.cwd()
    if (!absolutePath.toLowerCase().startsWith(process.cwd().toLowerCase())) {
      return res.status(403).json({ error: "Forbidden: Cannot edit files outside of the workspace directory." });
    }

    const baseName = path.basename(absolutePath).toLowerCase();
    const extName = path.extname(absolutePath).toLowerCase();

    const ALLOWED_EXTENSIONS = [
      ".ts", ".tsx", ".js", ".jsx", ".java", ".py", ".go", ".rs", ".php",
      ".sql", ".json", ".xml", ".txt", ".md", ".html", ".css",
      ".yml", ".yaml", ".gitignore", ".env", ".local", ".example",
      ".prettierrc", ".eslintrc", ".babelrc", ".toml", ".config", ""
    ];

    if (!ALLOWED_EXTENSIONS.includes(extName)) {
      return res.status(403).json({ error: "Forbidden: File extension is not allowed for modification." });
    }

    const fs = await import("fs/promises");
    await fs.writeFile(absolutePath, content, "utf-8");
    
    console.log(`[Editor] Successfully saved file on disk: ${filePath}`);
    return res.json({ status: "success", message: `Successfully saved file on disk at: ${filePath}` });
  } catch (err: any) {
    console.error("Save file operation failed:", err);
    return res.status(500).json({ error: `Failed to save file on disk: ${err.message}` });
  }
});

// GET configuration, database table state, and logs for active workspace
app.get("/api/sandbox-config/:projectName", (req, res) => {
  const { projectName } = req.params;
  const proj = sandboxProjects.get(projectName.toLowerCase());
  if (!proj) {
    return res.status(404).json({ error: "Project sandbox not found. Please upload a repository ZIP to register a workspace." });
  }
  return res.json({
    projectName: proj.projectName,
    dbState: proj.dbState,
    logs: proj.logs
  });
});

// Reset database tables back to original mock schemas and purge request logs
app.post("/api/sandbox-reset/:projectName", (req, res) => {
  const { projectName } = req.params;
  const proj = sandboxProjects.get(projectName.toLowerCase());
  if (!proj) {
    return res.status(404).json({ error: "Project sandbox not found" });
  }
  const tables = proj.analysis?.database?.tables || [];
  proj.dbState = initializeMockData(tables);
  proj.logs = [];
  return res.json({ status: "success", dbState: proj.dbState, message: "Database reset to mock values successfully." });
});

// Live execution endpoint that receives HTTP requests, processes actual CRUD against dbState, and logs execution traces
app.all("/api/sandbox/:projectName/*", (req, res) => {
  const { projectName } = req.params;
  const targetPath = "/" + req.params[0]; // e.g., "/users" or "/orders"
  const method = req.method.toUpperCase();
  const startTime = Date.now();

  const projectKey = projectName.toLowerCase();
  const proj = sandboxProjects.get(projectKey);
  if (!proj) {
    return res.status(404).json({
      error: `Live Runtime Sandbox for '${projectName}' is offline. Please analyze or re-upload your workspace first.`
    });
  }

  const logMessages: string[] = [`Incoming ${method} ${targetPath}`];
  let responseData: any = null;
  let responseStatus = 200;
  let queryExecuted = "Dynamic Model Controller Interceptor";

  try {
    // 1. Check if we have dynamic endpoints mapped inside CodeScope static analyzer report
    const endpoints = proj.analysis?.endpoints || [];
    let matchedEp: any = null;
    let pathParams: Record<string, string> = {};

    for (const ep of endpoints) {
      if (ep.method === method) {
        const match = matchRoute(ep.url, targetPath);
        if (match) {
          matchedEp = ep;
          pathParams = match;
          break;
        }
      }
    }

    // Combine parameters (body + query params + path params)
    const combinedParams = {
      ...req.query,
      ...req.body,
      ...pathParams
    };

    // 2. Execute SQL query mapping if available, otherwise do dynamic ORM schema CRUD tracing
    if (matchedEp && matchedEp.sqlQuery) {
      queryExecuted = matchedEp.sqlQuery;
      logMessages.push(`Route Match: Mapped AST SQL logic: ${queryExecuted}`);
      
      const { rows, affectedRows, error } = executeSQL(queryExecuted, proj.dbState, combinedParams);
      if (error) {
        responseStatus = 500;
        responseData = { error: `Database execution fault: ${error}` };
        logMessages.push(`SQL Error: ${error}`);
      } else {
        if (method === "GET") {
          responseData = matchedEp.url.includes("/:") && rows.length > 0 ? rows[0] : rows;
        } else if (method === "POST") {
          responseStatus = 201;
          responseData = { status: "created", inserted: rows[0] || combinedParams };
        } else {
          responseData = { status: "success", affectedRows };
        }
        logMessages.push(`SQL Executed successfully. Rows returned/affected: ${rows.length || affectedRows}`);
      }
    } else {
      // Automatic intelligent REST CRUD mapper based on tables inside in-memory DB schema
      const parts = targetPath.split("/").filter(Boolean);
      const resourceName = parts[0]?.toLowerCase(); // e.g., "users"
      
      // Find table in database state
      const matchedTableKey = Object.keys(proj.dbState).find(
        key => key.toLowerCase() === resourceName || key.toLowerCase() === resourceName + "s"
      );

      if (matchedTableKey) {
        logMessages.push(`No exact route parsed, fallback to automatic REST CRUD on Table [${matchedTableKey}]`);
        const table = proj.dbState[matchedTableKey];
        const idParam = parts[1];

        if (method === "GET") {
          if (idParam) {
            const item = table.find(r => String(r.id) === String(idParam));
            if (item) {
              responseData = item;
            } else {
              responseStatus = 404;
              responseData = { error: `Resource with ID ${idParam} not found in Table ${matchedTableKey}` };
            }
          } else {
            responseData = table;
            queryExecuted = `SELECT * FROM ${matchedTableKey}`;
          }
        } else if (method === "POST") {
          responseStatus = 201;
          const newId = table.length > 0 ? Math.max(...table.map(r => typeof r.id === 'number' ? r.id : 0)) + 1 : 1;
          const newRow = { id: newId, ...req.body, created_at: new Date().toISOString() };
          table.push(newRow);
          responseData = { status: "created", row: newRow };
          queryExecuted = `INSERT INTO ${matchedTableKey} VALUES (${JSON.stringify(Object.values(newRow))})`;
        } else if (method === "PUT") {
          if (idParam) {
            const itemIdx = table.findIndex(r => String(r.id) === String(idParam));
            if (itemIdx !== -1) {
              table[itemIdx] = { ...table[itemIdx], ...req.body };
              responseData = { status: "updated", row: table[itemIdx] };
              queryExecuted = `UPDATE ${matchedTableKey} SET ... WHERE id = ${idParam}`;
            } else {
              responseStatus = 404;
              responseData = { error: `Resource with ID ${idParam} not found` };
            }
          } else {
            responseStatus = 400;
            responseData = { error: "Missing ID parameter for PUT operation" };
          }
        } else if (method === "DELETE") {
          if (idParam) {
            const itemIdx = table.findIndex(r => String(r.id) === String(idParam));
            if (itemIdx !== -1) {
              table.splice(itemIdx, 1);
              responseStatus = 200;
              responseData = { status: "deleted", message: `ID ${idParam} removed from ${matchedTableKey}` };
              queryExecuted = `DELETE FROM ${matchedTableKey} WHERE id = ${idParam}`;
            } else {
              responseStatus = 404;
              responseData = { error: `Resource with ID ${idParam} not found` };
            }
          } else {
            responseStatus = 400;
            responseData = { error: "Missing ID parameter for DELETE operation" };
          }
        }
      } else {
        // Fallback standard dynamic response
        logMessages.push("No database match found for target path. Returning general dynamic mock template.");
        responseData = {
          message: "CodeScope dynamic sandbox online route",
          method,
          path: targetPath,
          timestamp: new Date().toISOString()
        };
      }
    }
  } catch (error: any) {
    responseStatus = 500;
    responseData = { error: `Internal Live Sandbox Error: ${error.message}` };
    logMessages.push(`Crash Fault: ${error.message}`);
  }

  const responseTime = Date.now() - startTime;
  
  // Log request execution details
  const logEntry = {
    timestamp: new Date().toLocaleTimeString(),
    method,
    url: targetPath,
    status: responseStatus,
    responseTime,
    query: queryExecuted,
    payload: JSON.stringify(req.body),
    response: JSON.stringify(responseData)
  };

  proj.logs.unshift(logEntry);
  if (proj.logs.length > 50) proj.logs.pop(); // cap logs

  res.setHeader("X-Runtime-Latency", `${responseTime}ms`);
  res.setHeader("X-Runtime-Status", "Sandbox Live Active");
  res.status(responseStatus).json(responseData);
});

// Real-time Static Code Diagnostics Hub (Deterministic AST Analyzer query)
app.get("/api/diagnostics/:projectName", (req, res) => {
  const { projectName } = req.params;
  const proj = sandboxProjects.get(projectName.toLowerCase());
  if (!proj) {
    return res.status(404).json({ error: "Project sandbox not found" });
  }
  return res.json({
    projectName: proj.projectName,
    healthScore: proj.analysis.healthScore,
    projectDNA: proj.analysis.projectDNA,
    modulesCount: proj.analysis.modules?.length || 0,
    endpointsCount: proj.analysis.endpoints?.length || 0,
    securityIssuesCount: proj.analysis.security?.length || 0,
    refactoringSuggestionsCount: proj.analysis.refactoring?.length || 0,
    performanceIssuesCount: proj.analysis.performance?.length || 0,
  });
});

// GET all cached active projects in sandbox Projects
app.get("/api/projects", (req, res) => {
  const list = Array.from(sandboxProjects.values()).map(p => ({
    projectName: p.projectName,
    healthScore: p.analysis.healthScore,
    issuesCount: (p.analysis.security?.length || 0) + (p.analysis.performance?.length || 0) + (p.analysis.bugs?.length || 0) + (p.analysis.codeSmells?.length || 0),
    lastUpdated: new Date().toISOString()
  }));
  return res.json(list);
});

// GET complete workspace analysis details for a cached project
app.get("/api/projects/:projectName", (req, res) => {
  const { projectName } = req.params;
  const proj = sandboxProjects.get(projectName.toLowerCase());
  if (!proj) {
    return res.status(404).json({ error: `Project sandbox not found for: ${projectName}` });
  }
  return res.json(proj.analysis);
});

// Live SQL Sandbox terminal executor
app.post("/api/sql-terminal/:projectName", (req, res) => {
  const { projectName } = req.params;
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "No SQL query provided" });
  }

  const proj = sandboxProjects.get(projectName.toLowerCase());
  if (!proj) {
    return res.status(404).json({ error: "Project sandbox not found" });
  }

  const startTime = Date.now();
  const result = executeSQL(query, proj.dbState);
  const responseTime = Date.now() - startTime;

  // Log this query into runtime workspace logs
  const logEntry = {
    timestamp: new Date().toLocaleTimeString(),
    method: "SQL_TERMINAL",
    url: `/terminal/query`,
    status: result.error ? 400 : 200,
    responseTime,
    query,
    payload: JSON.stringify({ query }),
    response: JSON.stringify(result)
  };
  proj.logs.unshift(logEntry);
  if (proj.logs.length > 50) proj.logs.pop();

  return res.json({
    status: result.error ? "error" : "success",
    rows: result.rows,
    affectedRows: result.affectedRows,
    error: result.error,
    dbState: proj.dbState
  });
});

async function startServer() {
  // Vite integration for rich frontend routing + server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, () => {
    console.log(`CodeScope Server running on port ${PORT}`);
  });
}

startServer();
