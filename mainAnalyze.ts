import { GoogleGenAI, Type } from "@google/genai";
import { runCodebaseAnalysis } from "./analize.js";
import { CodeScopeAnalysis } from "./src/types.js";

/**
 * Main orchestration entrypoint for real-time codebase static analysis.
 * Adheres strictly to a data-driven structure with ZERO mock content.
 */
export async function processAnalysis(
  files: Array<{ name: string; size: number; content?: string }>,
  projectName: string,
  ai: GoogleGenAI | null,
  selectedFilesToAudit?: string[]
): Promise<CodeScopeAnalysis> {
  const projName = projectName || "Uploaded Project";

  // 1. Compile the strict dynamic static analysis report
  const baseline = runCodebaseAnalysis(files, projName);

  // 2. If AI client is configured, enhance findings using Gemini 3.5 Flash
  if (ai) {
    try {
      console.log(`[AI Oracle] Initiating ultra high-fidelity code parsing for: ${projName}...`);
      
      // Select files for AI scan
      let selectedFiles = [...files]
        .filter(f => f.content && f.content.trim().length > 0);

      if (selectedFilesToAudit && selectedFilesToAudit.length > 0) {
        selectedFiles = selectedFiles.filter(f => selectedFilesToAudit.includes(f.name));
      } else {
        const getPriority = (name: string): number => {
          const ln = name.toLowerCase();
          if (ln.includes("package.json") || ln.includes("composer.json") || ln.includes("pom.xml") || ln.includes("requirements.txt") || ln.includes("go.mod") || ln.includes("gemfile") || ln.includes(".env")) return 1;
          if (ln.includes("schema") || ln.includes("route") || ln.includes("server") || ln.includes("app.ts") || ln.includes("app.js")) return 2;
          if (ln.includes("controller") || ln.includes("model") || ln.includes("service") || ln.includes("repository")) return 3;
          return 4;
        };
        selectedFiles = selectedFiles
          .sort((a, b) => getPriority(a.name) - getPriority(b.name))
          .slice(0, 6); // Default to 6 files to speed up scanning
      }

      const MAX_FILE_CHARS = 6000;
      const configFiles = selectedFiles.map(f => {
        let content = f.content || "";
        if (content.length > MAX_FILE_CHARS) {
          content = content.substring(0, MAX_FILE_CHARS) + `\n\n// [... Content truncated by CodeScope AI for length constraints - showing first ${MAX_FILE_CHARS} characters ...]`;
        }
        return { name: f.name, content };
      });

      const filesMetadata = files.map(f => ({ name: f.name, size: f.size }));

      const prompt = `
You are CodeScope AI, an elite enterprise-grade static codebase analysis and cyber-security engine.
We have parsed a project called "${projName}".

Below is the verified project tree structure & size metadata (first 60 nodes):
${JSON.stringify(filesMetadata.slice(0, 60))}

Here is the actual source code or configuration definitions extracted from critical files:
${configFiles.map(f => `--- FILE: ${f.name} ---\n${f.content || "(No content)"}`).join("\n\n")}

Below is the dynamic baseline calculated by our local static scanner:
${JSON.stringify({
  languages: baseline.projectDNA.languages,
  frameworks: baseline.projectDNA.frameworks,
  databases: baseline.projectDNA.databases,
  infrastructure: baseline.projectDNA.infrastructure,
  authentication: baseline.projectDNA.authentication,
  architectureStyle: baseline.architecture.style,
  detectedEndpoints: baseline.endpoints.length,
  detectedTables: baseline.database.tables.length,
  securityIssues: baseline.security.length,
  performanceIssues: baseline.performance.length
})}

YOUR TASK:
Conduct an extremely deep, thorough, and precise static analysis matching SonarQube quality standards. Refine, enhance, and validate the baseline data.
You MUST follow these strict principles:
1. **Realism**: Only report details actually present in the source code or file layout. Do not invent fictional endpoints, folder names, database tables, or modules.
2. **Deep Security Sweep (OWASP Top 10)**: Review all file contents for hardcoded credentials, SQL injection patterns, command injections, unpurified HTML strings, permissive CORS headers, weak cryptos (e.g. DES, RC4), missing CSRF protections, BOLA/IDOR on parameterized endpoints, production debug mode configurations, or insecure deserialization. Give full lines and detailed fix guides. LIMIT output to the top 3 most critical findings.
3. **Performance Profiling**: Search for synchronous blocking filesystem operations, loops that issue queries repeatedly (N+1 query patterns), memory leaks, event listeners without removal, or quadratic nested loops (O(N^2)). LIMIT output to the top 3 findings.
4. **Advanced Bugs Detection**: Look for resource/handle leaks (unclosed files or DB connections), unsafe floating-point comparisons, generic exception catching that obscures original errors, and potential null pointer dereferences. LIMIT output to the top 3 findings.
5. **Code Smells & Maintainability**: Sweep for callback hell / deeply nested closures (>3 levels), magic numbers, commented-out source code blocks, and naming convention mismatches (e.g. local variables in snake_case). LIMIT output to the top 3 findings.
6. **Architectural Style Proof**: Verify if the layout represents a Clean Architecture, MVC, Layered Monolith, Microservices, or Domain-Driven Design (DDD). Provide concrete evidence.
7. **Interactive Endpoints & ERD**: Build a complete, highly structured blueprint of detected REST routing paths (max 8) and SQL/Prisma schemas (max 8).
8. **Keep descriptions and suggestions very short**: Write extremely concise, direct bullet points to minimize output JSON token size.

Respond with 100% valid, minified, strict JSON matching the exact schema layout below:
{
  "projectName": "${projName}",
  "healthScore": 1-100 number (highly reflective of security & code issues found),
  "healthReasons": [
    { "category": "Maintainability / Security / Complexity / Performance / etc", "score": 1-100, "description": "precise explanation", "recommendation": "suggested action" }
  ],
  "projectDNA": {
    "languages": [ { "name": "Language", "percentage": 100 } ],
    "frameworks": ["Framework"],
    "databases": ["Database"],
    "infrastructure": ["Infra"],
    "authentication": ["Auth"]
  },
  "architecture": {
    "style": "Layered Monolith / Clean Architecture / DDD / MVC / Hexagonal / Modular Monolith",
    "confidence": 1-100 percentage,
    "explanation": "strict factual proof why this style was chosen",
    "diagrams": [ { "source": "nodeA", "target": "nodeB", "label": "dependency" } ]
  },
  "modules": [
    { "name": "Module Name", "type": "Module Type", "classes": ["ClassA"], "interfaces": [], "endpoints": [], "entities": [], "dependencies": [] }
  ],
  "dependencyGraph": {
    "nodes": [ { "id": "node_id", "label": "Label", "type": "controller/service/repository/database/external/module/middleware" } ],
    "edges": [ { "source": "nodeA", "target": "nodeB", "label": "dependency description" } ]
  },
  "endpoints": [
    { "method": "GET/POST/PUT/DELETE", "url": "/url", "description": "desc", "auth": "JWT/Public", "middlewares": ["M1"], "requestDto": "RequestDto", "responseDto": "ResponseDto", "sqlQuery": "SELECT...", "flow": ["Step 1", "Step 2"] }
  ],
  "database": {
    "tables": [
      {
        "name": "table_name",
        "columns": [ { "name": "id", "type": "varchar", "constraints": "PRIMARY KEY" } ],
        "relationships": [ { "targetTable": "other_table", "type": "one-to-many", "foreignKey": "table_id" } ]
      }
    ]
  },
  "refactoring": [
    { "file": "path/to/file.ts", "loc": 500, "complexity": 80, "risk": "Low/Medium/High/Critical", "suggestion": "Refactor details", "benefit": "expected impact" }
  ],
  "security": [
    { "category": "SQL Injection/XSS/Hardcoded secrets/etc", "file": "path/to/vulnerable.ts", "line": 42, "severity": "Low/Medium/High/Critical", "description": "why it's bad", "solution": "how to fix", "oldCode": "bad code line", "newCode": "safe code line" }
  ],
  "performance": [
    { "issue": "N+1 / Missing index / etc", "file": "path/to/sluggish.ts", "line": 10, "severity": "Low/Medium/High/Critical", "description": "why it is slow", "suggestedOptimization": "fix" }
  ],
  "importAnalysis": {
    "largestFiles": [ { "file": "file.ts", "size": "12 KB" } ],
    "circularDependencies": [],
    "circularDependenciesDetail": "details",
    "packageCouplingScore": 65
  },
  "runtimeFlow": [
    {
      "label": "Scenario Flow",
      "steps": [ { "name": "HTTP Request", "component": "Nginx", "description": "details" } ]
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an elite static code analyzer. Return only valid, minified, strict JSON matching the requested structure without any extra words, symbols, or conversational filler.",
          temperature: 0.15
        }
      });

      const text = response.text || "";
      const cleaned = text.trim();
      const enhancedAnalysis = JSON.parse(cleaned);
      
      console.log("[AI Oracle] Successfully enhanced report using Google Gemini!");
      return {
        ...baseline,
        ...enhancedAnalysis,
        // Fallback or double guard properties
        projectName: enhancedAnalysis.projectName || baseline.projectName,
        healthScore: typeof enhancedAnalysis.healthScore === 'number' ? enhancedAnalysis.healthScore : baseline.healthScore
      };
    } catch (err) {
      console.error("[AI Oracle] Failed to process AI enhancement. Falling back to real static baseline:", err);
      return baseline;
    }
  }

  // Local static engine baseline processing
  console.log("[Local Analyzer] Generating dynamic static analysis report...");
  return baseline;
}
