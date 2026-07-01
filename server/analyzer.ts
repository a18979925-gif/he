import { GoogleGenAI, Type } from '@google/genai';
import AdmZip from 'adm-zip';
import crypto from 'crypto';
import { AuditIssue, FileNode, AnalysisSummary, AnalysisReport, StreamEvent, FileMetrics } from '../src/types';
import { scanTypeScript } from './rules/typescript';
import { scanGo } from './rules/go';
import { scanRust } from './rules/rust';
import { scanSecrets } from './rules/secrets';
import { scanPython } from './rules/python';
import { scanJava } from './rules/java';
import { scanDevops } from './rules/devops';
import { calculateComplexity } from './complexity';

// In-memory database of analyses
export const analyses = new Map<string, AnalysisReport>();

// Server-Sent Events connections registry
export const activeConnections = new Map<string, any[]>();

// Initialize Gemini SDK with telemetry header as required by rules
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Broadcasts SSE stream events to all connected clients for a specific analysis run
 */
export function broadcastEvent(analysisId: string, event: StreamEvent) {
  const connections = activeConnections.get(analysisId) || [];
  const eventString = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of connections) {
    res.write(eventString);
  }
}

/**
 * Helper to build directory tree recursively
 */
function buildFileTree(files: { path: string; language?: string }[]): FileNode[] {
  const root: FileNode[] = [];
  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);
    let currentLevel = root;
    let currentPath = '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = i === parts.length - 1;
      let existingNode = currentLevel.find((node) => node.name === part);
      if (!existingNode) {
        existingNode = {
          name: part,
          path: currentPath,
          type: isLast ? 'file' : 'directory',
          ...(isLast ? { language: file.language } : { children: [] }),
        };
        currentLevel.push(existingNode);
      }
      if (!isLast && existingNode.children) {
        currentLevel = existingNode.children;
      }
    }
  }

  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) sortNodes(node.children);
    }
  };
  sortNodes(root);
  return root;
}

/**
 * Language detector
 */
function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const baseName = filePath.split('/').pop()?.toLowerCase();
  if (baseName === 'dockerfile' || ext === 'dockerfile') {
    return 'Dockerfile';
  }
  switch (ext) {
    case 'ts': return 'TypeScript';
    case 'tsx': return 'TypeScript (JSX)';
    case 'js': return 'JavaScript';
    case 'jsx': return 'JavaScript (JSX)';
    case 'go': return 'Go';
    case 'rs': return 'Rust';
    case 'py': return 'Python';
    case 'java': return 'Java';
    case 'yml':
    case 'yaml': return 'YAML Config';
    default: return 'Unknown';
  }
}

/**
 * Run heuristic analysis (regex matches) on source files
 */
function scanHeuristics(filePath: string, content: string, language: string): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const lines = content.split('\n');

  lines.forEach((lineText, index) => {
    const lineNum = index + 1;

    // Scan secrets globally across all files
    issues.push(...scanSecrets(filePath, lineText, lineNum));

    // Delegate to language-specific analyzers
    if (['TypeScript', 'TypeScript (JSX)', 'JavaScript', 'JavaScript (JSX)'].includes(language)) {
      issues.push(...scanTypeScript(filePath, lineText, lineNum));
    } else if (language === 'Go') {
      issues.push(...scanGo(filePath, lineText, lineNum));
    } else if (language === 'Rust') {
      issues.push(...scanRust(filePath, lineText, lineNum));
    } else if (language === 'Python') {
      issues.push(...scanPython(filePath, lineText, lineNum));
    } else if (language === 'Java') {
      issues.push(...scanJava(filePath, lineText, lineNum));
    } else if (['Dockerfile', 'YAML Config'].includes(language)) {
      issues.push(...scanDevops(filePath, lineText, lineNum));
    }
  });

  // File-level complexity heuristic
  if (lines.length > 500) {
    issues.push({
      id: `h-qual-size-${crypto.randomUUID().substring(0, 8)}`,
      filePath,
      line: 1,
      category: 'quality',
      severity: 'warning',
      title: 'Giant File Detected (>500 lines)',
      description: `This source file has ${lines.length} lines. High line density increases mental load, slows compilation, and usually violates modularity rules.`,
      snippet: lines[0] || '',
      suggestion: 'Split this file into smaller, single-purpose subcomponents, hooks, helper files, or domain modules.',
    });
  }

  return issues;
}

/**
 * AI-driven analysis engine using Gemini API
 */
async function scanWithGemini(
  filePath: string,
  content: string,
  language: string,
  heuristicsFound: AuditIssue[]
): Promise<AuditIssue[]> {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not configured. Skipping AI analysis.');
      return [];
    }

    // Limit AI scanner to only reasonably sized files to avoid rate/token limits
    if (content.length > 25000) {
      console.warn(`File ${filePath} is too large for Gemini scanning (${content.length} characters).`);
      return [];
    }

    const prompt = `You are a world-class code auditor and security engineering expert. Analyze the following ${language} file "${filePath}" for security vulnerabilities, software code quality issues, smells, and potential refactoring improvements.
    
    Here is the content of the file:
    \`\`\`${language.toLowerCase()}
    ${content}
    \`\`\`

    Below are initial static heuristic issues already uncovered in this file to assist you:
    ${JSON.stringify(heuristicsFound, null, 2)}

    Your task is to identify key issues (aim for the top 1-4 high-value, realistic security, quality, or refactor problems). Do not report trivial issues.
    For each issue, you must supply:
    1. Line number (1-based, exact line where it occurs or starts).
    2. Category: Must be exactly "security", "quality", or "refactor".
    3. Severity: Must be exactly "critical", "warning", or "info".
    4. Title: A concise human-readable heading.
    5. Description: Detailed description explaining the threat, risk, or code pattern problem.
    6. Snippet: The exact line or block of lines of original code containing the issue.
    7. Suggestion: Clear recommendation of how to fix this issue.
    8. Diff: A valid unified patch diff block showing the exact before and after lines. Ensure the diff block has a standard unified header format, for example:
       @@ -line,oldLines +line,newLines @@
       - [original line]
       + [suggested replacement line]

    Respond ONLY in a strict JSON format matching this schema:
    {
      "issues": [
        {
          "line": number,
          "category": "security" | "quality" | "refactor",
          "severity": "critical" | "warning" | "info",
          "title": "string",
          "description": "string",
          "snippet": "string",
          "suggestion": "string",
          "diff": "string"
        }
      ]
    }`;

    // Requesting structured JSON response schema from Gemini 3.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite automated security scanner and code quality helper. Always return precise line numbers and actionable unified diffs. Always output valid JSON strictly matching the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  line: { type: Type.INTEGER },
                  category: { type: Type.STRING, description: 'Must be security, quality, or refactor' },
                  severity: { type: Type.STRING, description: 'Must be critical, warning, or info' },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  snippet: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  diff: { type: Type.STRING },
                },
                required: ['line', 'category', 'severity', 'title', 'description', 'snippet'],
              },
            },
          },
          required: ['issues'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      console.error('Gemini returned an empty response.');
      return [];
    }

    const data = JSON.parse(text);
    if (data && Array.isArray(data.issues)) {
      // Map AI response items to AuditIssue schema
      const mappedIssues: AuditIssue[] = data.issues.map((issue: any) => ({
        id: `ai-${issue.category.substring(0, 3)}-${crypto.randomUUID().substring(0, 8)}`,
        filePath,
        line: Number(issue.line) || 1,
        category: issue.category as AuditIssue['category'],
        severity: issue.severity as AuditIssue['severity'],
        title: issue.title,
        description: issue.description,
        snippet: issue.snippet,
        suggestion: issue.suggestion,
        diff: issue.diff,
      }));
      return mappedIssues;
    }
    return [];
  } catch (error) {
    console.error(`Gemini scanning failed for ${filePath}:`, error);
    return [];
  }
}

/**
 * Executes full analysis lifecycle for an uploaded ZIP file asynchronously
 */
export async function runAnalysis(analysisId: string, zipBuffer: Buffer, fileName: string, plan: 'basic' | 'super' = 'basic') {
  try {
    // 1. EXTRACT STAGE
    console.log(`[Analysis ${analysisId}] Extracting zip files...`);
    broadcastEvent(analysisId, {
      type: 'STAGE_CHANGED',
      status: 'extracting',
      progress: 5,
      message: 'Extracting source files from uploaded ZIP archive...',
    });

    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    
    const parsedFiles: { path: string; language: string; size: number; content: string; metrics?: FileMetrics }[] = [];

    // Filter directories / binary files / unwanted folders
    const EXCLUDED_DIRS = ['node_modules', 'dist', 'build', '.git', 'vendor', 'target', '.idea', '.vscode', '.gradle', 'bin', 'obj'];
    const EXCLUDED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'zip', 'gz', 'tar', 'exe', 'dll', 'so', 'dylib', 'map', 'svg', 'woff', 'woff2', 'ttf', 'eot', 'ico', 'pdf'];

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      
      const entryName = entry.entryName;
      const pathParts = entryName.split('/');
      
      // Check for excluded folders in the path
      const hasExcludedFolder = pathParts.some(part => EXCLUDED_DIRS.includes(part));
      if (hasExcludedFolder) continue;

      // Check file extension
      const fileExt = entryName.split('.').pop()?.toLowerCase();
      if (!fileExt || EXCLUDED_EXTENSIONS.includes(fileExt)) continue;

      // Detect language (only analyzing react/js, rust, go)
      const language = detectLanguage(entryName);
      if (language === 'Unknown') continue; // Skip non-analyzable files

      try {
        const content = entry.getData().toString('utf8');
        const size = entry.header.size;
        const metrics = calculateComplexity(content);
        
        parsedFiles.push({
          path: entryName,
          language,
          size,
          content,
          metrics,
        });
      } catch (err) {
        console.error(`Failed to read zip entry data for ${entryName}:`, err);
      }
    }

    if (parsedFiles.length === 0) {
      throw new Error('No supported source files (TypeScript, React, Go, or Rust) were found in the ZIP archive.');
    }

    const tree = buildFileTree(parsedFiles);
    console.log(`[Analysis ${analysisId}] Extracted ${parsedFiles.length} source files.`);
    
    // Initial summary setup
    const summary: AnalysisSummary = {
      id: analysisId,
      fileName,
      status: 'scanning_heuristics',
      progress: 15,
      fileCount: parsedFiles.length,
      scannedFileCount: 0,
      languages: Array.from(new Set(parsedFiles.map(f => f.language))),
      issuesCount: { security: 0, quality: 0, refactor: 0 },
      criticalCount: 0,
      createdAt: new Date().toISOString(),
      plan,
    };

    // Store intermediate report
    const initialReport: AnalysisReport = {
      summary,
      issues: [],
      files: parsedFiles,
      tree,
    };
    analyses.set(analysisId, initialReport);

    broadcastEvent(analysisId, {
      type: 'STAGE_CHANGED',
      status: 'scanning_heuristics',
      progress: 20,
      message: `Analyzing file structure and scanning heuristics across ${parsedFiles.length} files...`,
    });

    // 2. HEURISTICS SCANNING STAGE
    const allIssues: AuditIssue[] = [];
    let scannedFiles = 0;

    for (const file of parsedFiles) {
      const fileIssues = scanHeuristics(file.path, file.content, file.language);
      
      // Stream each issue immediately for realistic realtime-ish updates!
      for (const issue of fileIssues) {
        allIssues.push(issue);
        broadcastEvent(analysisId, { type: 'ISSUE_FOUND', issue });
        
        // Update live counts
        summary.issuesCount[issue.category]++;
        if (issue.severity === 'critical') summary.criticalCount++;
      }

      scannedFiles++;
      summary.scannedFileCount = scannedFiles;
      
      // Progress calculation for heuristics (maps to 20% -> 50%)
      const heuristicProgress = Math.round(20 + (scannedFiles / parsedFiles.length) * 30);
      summary.progress = heuristicProgress;

      broadcastEvent(analysisId, {
        type: 'FILE_SCANNED',
        filePath: file.path,
        progress: heuristicProgress,
      });

      // Simple delay to make live stream visible on UI
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    // Store update after heuristics
    initialReport.issues = [...allIssues];
    analyses.set(analysisId, initialReport);

    // 3. AI/GEMINI ENHANCED AUDITING STAGE
    if (plan === 'super') {
      summary.status = 'scanning_ai';
      broadcastEvent(analysisId, {
        type: 'STAGE_CHANGED',
        status: 'scanning_ai',
        progress: 55,
        message: 'Running advanced AI security audits and patching suggestions using Gemini...',
      });

      // Pick top files for AI scanning (limit to max 3 files containing findings or larger size to be highly precise and responsive)
      const filesToAuditWithAI = parsedFiles
        // Prioritize files where heuristic findings occurred
        .sort((a, b) => {
          const aCount = allIssues.filter(i => i.filePath === a.path).length;
          const bCount = allIssues.filter(i => i.filePath === b.path).length;
          return bCount - aCount;
        })
        .slice(0, 3);

      let aiProcessedCount = 0;
      for (const file of filesToAuditWithAI) {
        const fileHeuristics = allIssues.filter(i => i.filePath === file.path);
        
        const aiIssues = await scanWithGemini(file.path, file.content, file.language, fileHeuristics);
        
        for (const issue of aiIssues) {
          // Exclude duplicate issues found by heuristics
          const isDuplicate = allIssues.some(
            hi => hi.filePath === issue.filePath && hi.line === issue.line && hi.category === issue.category
          );
          if (!isDuplicate) {
            allIssues.push(issue);
            broadcastEvent(analysisId, { type: 'ISSUE_FOUND', issue });
            
            summary.issuesCount[issue.category]++;
            if (issue.severity === 'critical') summary.criticalCount++;
          }
        }

        aiProcessedCount++;
        // Progress from 55% -> 90%
        const aiProgress = Math.round(55 + (aiProcessedCount / filesToAuditWithAI.length) * 35);
        summary.progress = aiProgress;
        
        broadcastEvent(analysisId, {
          type: 'STAGE_CHANGED',
          status: 'scanning_ai',
          progress: aiProgress,
          message: `Advanced AI Code Review: Audited ${file.path} successfully.`,
        });
      }
    } else {
      console.log(`[Analysis ${analysisId}] Plan is "basic", skipping AI enhanced audit stage.`);
      broadcastEvent(analysisId, {
        type: 'STAGE_CHANGED',
        status: 'scanning_ai',
        progress: 90,
        message: 'Finishing up heuristic code report generation...',
      });
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // 4. FINALIZE AND COMPLETE ANALYSIS
    summary.status = 'completed';
    summary.progress = 100;
    
    const finalReport: AnalysisReport = {
      summary,
      issues: allIssues,
      files: parsedFiles,
      tree,
    };
    analyses.set(analysisId, finalReport);

    broadcastEvent(analysisId, {
      type: 'STAGE_COMPLETED',
      status: 'completed',
      summary,
    });

    broadcastEvent(analysisId, {
      type: 'ANALYSIS_DONE',
      report: finalReport,
    });

    console.log(`[Analysis ${analysisId}] Completed successfully with ${allIssues.length} issues.`);

  } catch (err: any) {
    console.error(`[Analysis ${analysisId}] Failed:`, err);
    
    const currentReport = analyses.get(analysisId);
    if (currentReport) {
      currentReport.summary.status = 'failed';
      currentReport.summary.progress = 100;
      analyses.set(analysisId, currentReport);
    }

    broadcastEvent(analysisId, {
      type: 'ERROR',
      message: err?.message || 'Unknown internal analysis error occurred.',
    });
  }
}

/**
 * Technical AI Discussion helper for a specific audit finding
 */
export async function discussIssueWithAI(
  issue: AuditIssue,
  history: { sender: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return 'The Gemini Review Engine key is not configured. Please define GEMINI_API_KEY to start remediation conversations.';
    }

    const conversationHistoryFormatted = history
      .map((msg) => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const prompt = `You are an expert security engineer, Go/Rust/TypeScript architect, and professional code auditor.
The user is asking a question about a specific code issue flagged by our static scanner.

--- Flagged Finding ---
File: ${issue.filePath}
Line: ${issue.line}
Category: ${issue.category.toUpperCase()}
Severity: ${issue.severity.toUpperCase()}
Title: ${issue.title}
Threat Description: ${issue.description}
Code Snippet:
\`\`\`
${issue.snippet}
\`\`\`
Proposed Remediation: ${issue.suggestion || 'None provided'}
Proposed Diff Patch:
\`\`\`diff
${issue.diff || 'No diff patch generated'}
\`\`\`

--- Conversation History ---
${conversationHistoryFormatted}

Latest User Question: ${userMessage}

Please write a highly technical, precise, helpful, and objective response.
Explain the exact security or performance implications, suggest best practices, and optionally refine the suggested code patch.
Keep explanations concise, secure, and focused on production-ready patterns. Do not mention system-internal paths.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite secure coding assistant. Answer the user\'s question with code-driven facts, referencing OWASP rules and exact performance guidelines when applicable.',
      },
    });

    return response.text || 'Sorry, I am unable to formulate an audit reply at this moment.';
  } catch (error: any) {
    console.error('Discussion with Gemini failed:', error);
    return `Remediation session stalled: ${error?.message || 'Unknown model issue'}`;
  }
}

