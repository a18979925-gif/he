export interface AuditIssue {
  id: string;
  filePath: string; // Map file or use original
  line: number;
  category: string;
  severity: 'critical' | 'High' | 'Medium' | 'Low' | 'warning' | 'info';
  title?: string;
  description: string;
  snippet?: string; // The original lines of code
  solution?: string; // Suggested fix
  suggestion?: string; // Legacy field
  diff?: string; // Legacy field
  oldCode?: string;
  newCode?: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  language?: string;
}

export interface AnalysisSummary {
  id: string;
  fileName: string;
  status: 'pending' | 'extracting' | 'scanning_heuristics' | 'scanning_ai' | 'completed' | 'failed';
  progress: number;
  fileCount: number;
  scannedFileCount: number;
  languages: string[];
  issuesCount: {
    security: number;
    quality: number;
    refactor: number;
  };
  criticalCount: number;
  createdAt: string;
  plan?: 'basic' | 'super';
}

export interface FileMetrics {
  linesCount: number;
  emptyLinesCount: number;
  commentLinesCount: number;
  cyclomaticComplexity: number;
  nestingDepthMax: number;
  functionsCount: number;
  densityScore: 'Excellent' | 'Moderate' | 'Heavy';
}

export interface CodeScopeAnalysis {
  projectName: string;
  healthScore: number;
  healthReasons: {
    category: string;
    score: number;
    description: string;
    recommendation: string;
  }[];
  projectDNA: {
    languages: { name: string; percentage: number }[];
    frameworks: string[];
    databases: string[];
    infrastructure: string[];
    authentication: string[];
  };
  architecture: {
    style: string;
    confidence: number;
    explanation: string;
    diagrams: { source: string; target: string; label: string }[];
  };
  modules: {
    name: string;
    type: string;
    classes: string[];
    interfaces: string[];
    endpoints: string[];
    entities: string[];
    dependencies: string[];
  }[];
  dependencyGraph: {
    nodes: { id: string; label: string; type: string }[];
    edges: { source: string; target: string; label: string }[];
  };
  endpoints: {
    method: string;
    url: string;
    description: string;
    auth: string;
    middlewares: string[];
    requestDto: string;
    responseDto: string;
    sqlQuery: string;
    flow: string[];
  }[];
  database: {
    tables: {
      name: string;
      columns: { name: string; type: string; constraints: string }[];
      relationships: { targetTable: string; type: string; foreignKey: string }[];
    }[];
  };
  refactoring: {
    file: string;
    loc: number;
    complexity: number;
    risk: string;
    suggestion: string;
    benefit: string;
  }[];
  security: {
    category: string;
    file: string;
    line: number;
    severity: string;
    description: string;
    solution: string;
    oldCode: string;
    newCode: string;
  }[];
  performance: {
    issue: string;
    file: string;
    line: number;
    severity: string;
    description: string;
    suggestedOptimization: string;
  }[];
  importAnalysis: {
    largestFiles: { file: string; size: string }[];
    circularDependencies: any[];
    circularDependenciesDetail: string;
    packageCouplingScore: number;
  };
  runtimeFlow: {
    label: string;
    steps: { name: string; component: string; description: string }[];
  }[];
  summary?: AnalysisSummary;
  files?: {
    path: string;
    language: string;
    size: number;
    content: string;
    metrics?: FileMetrics;
  }[];
  tree?: FileNode[];
}

// We will map the new structure into AnalysisReport to preserve old UI somewhat or just replace AnalysisReport entirely.
export type AnalysisReport = CodeScopeAnalysis;

export type StreamEvent =
  | { type: 'STAGE_CHANGED'; status: AnalysisSummary['status']; progress: number; message: string }
  | { type: 'FILE_SCANNED'; filePath: string; progress: number }
  | { type: 'ISSUE_FOUND'; issue: AuditIssue }
  | { type: 'STAGE_COMPLETED'; status: AnalysisSummary['status']; summary: AnalysisSummary }
  | { type: 'ANALYSIS_DONE'; report: AnalysisReport }
  | { type: 'ERROR'; message: string };

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

