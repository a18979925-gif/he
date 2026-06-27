import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { processAnalysis } from "./mainalalize.js";
import { sandboxProjects, initializeMockData, executeSQL, matchRoute } from "./runtime.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3022;

app.use(express.json({ limit: "50mb" }));

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

// Auto-fix endpoint to modify code directly on disk
app.post("/api/fix-code", async (req, res) => {
  const { filePath, oldCode, newCode } = req.body;
  if (!filePath || oldCode === undefined || newCode === undefined) {
    return res.status(400).json({ error: "Missing filePath, oldCode or newCode parameters." });
  }

  try {
    // Resolve absolute path safely relative to process.cwd() (user's workspace root)
    const absolutePath = path.resolve(process.cwd(), filePath);
    
    // Prevent directory traversal: check if it starts with process.cwd()
    if (!absolutePath.toLowerCase().startsWith(process.cwd().toLowerCase())) {
      return res.status(403).json({ error: "Forbidden: Cannot edit files outside of the workspace directory." });
    }

    const fs = await import("fs/promises");
    
    // Check if the file exists
    try {
      await fs.access(absolutePath);
    } catch {
      return res.status(404).json({ error: `File not found on local disk at: ${filePath}` });
    }

    const fileContent = await fs.readFile(absolutePath, "utf-8");
    
    // Perform replacement (replace the old code with the new code)
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

  app.listen(PORT, () => {
    console.log(`CodeScope Server running on port ${PORT}`);
  });
}

startServer();
