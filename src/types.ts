export interface LanguageDNA {
  name: string;
  percentage: number;
}

export interface ProjectDNA {
  languages: LanguageDNA[];
  frameworks: string[];
  databases: string[];
  infrastructure: string[];
  authentication: string[];
}

export interface HealthReason {
  category: string;
  score: number;
  description: string;
  recommendation: string;
}

export interface ArchitectureItem {
  style: string;
  confidence: number;
  explanation: string;
  diagrams: { source: string; target: string; type: string }[];
}

export interface ModuleItem {
  name: string;
  type: string;
  classes: string[];
  interfaces: string[];
  endpoints: string[];
  entities: string[];
  dependencies: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'controller' | 'service' | 'repository' | 'database' | 'external' | 'module' | 'middleware';
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface EndpointItem {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  description: string;
  auth: string;
  middlewares: string[];
  requestDto?: string;
  responseDto?: string;
  sqlQuery?: string;
  flow: string[];
}

export interface DBColumn {
  name: string;
  type: string;
  constraints?: string;
}

export interface DBRelationship {
  targetTable: string;
  type: 'one-to-many' | 'many-to-one' | 'one-to-one' | 'many-to-many';
  foreignKey: string;
}

export interface DBTable {
  name: string;
  columns: DBColumn[];
  relationships: DBRelationship[];
}

export interface DBReverseEngineer {
  tables: DBTable[];
}

export interface RefactoringSuggestion {
  file: string;
  loc: number;
  complexity: number;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  suggestion: string;
  benefit: string;
}

export interface SecurityIssue {
  category: string;
  file: string;
  line?: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  solution: string;
  oldCode?: string;
  newCode?: string;
}

export interface PerformanceIssue {
  issue: string;
  file: string;
  line?: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  suggestedOptimization: string;
  oldCode?: string;
  newCode?: string;
}

export interface FileSizeItem {
  file: string;
  size: string;
}

export interface ImportAnalysis {
  largestFiles: FileSizeItem[];
  circularDependencies: string[];
  circularDependenciesDetail?: string;
  packageCouplingScore: number;
}

export interface RuntimeStep {
  name: string;
  component: string;
  description: string;
}

export interface RuntimeFlow {
  label: string;
  steps: RuntimeStep[];
}

export interface CodeScopeAnalysis {
  projectName: string;
  healthScore: number;
  healthReasons: HealthReason[];
  projectDNA: ProjectDNA;
  architecture: ArchitectureItem;
  modules: ModuleItem[];
  dependencyGraph: DependencyGraph;
  endpoints: EndpointItem[];
  database: DBReverseEngineer;
  refactoring: RefactoringSuggestion[];
  security: SecurityIssue[];
  performance: PerformanceIssue[];
  importAnalysis: ImportAnalysis;
  runtimeFlow: RuntimeFlow[];
  bugs?: SecurityIssue[];
  codeSmells?: SecurityIssue[];
  compliance?: ComplianceIssue[];
  gitInsights?: GitInsight[];
  crashLogs?: CrashLogItem[];
}

export interface ComplianceIssue {
  category: string;
  file: string;
  line?: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  solution: string;
  oldCode?: string;
  newCode?: string;
}

export interface GitInsight {
  file: string;
  commitsCount: number;
  authorsCount: number;
  churnRate: number;
  riskScore: number;
}

export interface CrashLogItem {
  id: string;
  timestamp: string;
  level: 'error' | 'fatal' | 'warning';
  message: string;
  exceptionName: string;
  file: string;
  line?: number;
  stackTrace: string[];
  resolved: boolean;
}

export interface AuditIssue {
  id: string;
  filePath: string;
  line: number;
  category: 'security' | 'quality' | 'refactor';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  snippet: string;
  suggestion?: string;
  diff?: string;
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

export interface AnalysisReport {
  summary: AnalysisSummary;
  issues: AuditIssue[];
  files: {
    path: string;
    language: string;
    size: number;
    content: string;
    metrics?: FileMetrics;
  }[];
  tree: FileNode[];
}

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
