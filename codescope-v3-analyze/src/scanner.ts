import * as fs from "fs";
import * as path from "path";
import { analyzeFile } from "./rules/analyze";

export interface ScanResult {
  file: string;
  issues: any[];
}

export function scanFolder(target: string) {
  const results: ScanResult[] = [];
  const filesList: string[] = [];

  // Helper to resolve files recursively
  function walk(dir: string) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (entry === "node_modules" || entry === ".git" || entry === "dist" || entry === "build") continue;
      const full = path.join(dir, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else {
        filesList.push(full);
      }
    }
  }

  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    walk(target);
  } else {
    filesList.push(target);
  }

  // Analyze each file
  filesList.forEach(file => {
    try {
      const result = analyzeFile(file);
      results.push(result);
    } catch (err) {
      results.push({ file, issues: [] });
    }
  });

  // Cross-file analysis: Build a dependency graph based on imports
  const nodes: any[] = [];
  const edges: any[] = [];
  const fileSet = new Set(filesList);

  filesList.forEach(file => {
    const base = path.basename(file);
    nodes.push({
      id: file,
      label: base,
      type: file.endsWith(".ts") || file.endsWith(".tsx") ? "typescript" : file.endsWith(".go") ? "go" : "rust"
    });

    try {
      const content = fs.readFileSync(file, "utf-8");
      // Match ES import / require statements
      const importRegex = /(?:import|from|require)\s*\(?\s*['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const impPath = match[1];
        if (impPath.startsWith(".")) {
          // Resolve relative path
          const resolved = path.normalize(path.join(path.dirname(file), impPath)).replace(/\\/g, "/");
          const candidates = [
            resolved,
            resolved + ".ts",
            resolved + ".tsx",
            resolved + ".js",
            resolved + ".jsx",
            resolved + ".go",
            resolved + ".rs"
          ];
          for (const cand of candidates) {
            const matchFile = filesList.find(f => f.replace(/\\/g, "/").toLowerCase() === cand.toLowerCase());
            if (matchFile && matchFile !== file) {
              edges.push({
                source: file,
                target: matchFile,
                label: "imports"
              });
              break;
            }
          }
        }
      }
    } catch (err) {
      // ignore read errors
    }
  });

  return {
    results,
    dependencyGraph: { nodes, edges }
  };
}
