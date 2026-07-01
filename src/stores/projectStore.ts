import { create } from "zustand";
import type {
  ArchitectureItem,
  CodeScopeAnalysis,
  DBReverseEngineer,
  EndpointItem,
  PerformanceIssue,
  RuntimeFlow,
  SecurityIssue,
} from "../types";

export type Analysis = Pick<
  CodeScopeAnalysis,
  "healthScore" | "healthReasons" | "modules" | "dependencyGraph" | "importAnalysis"
>;

export type Architecture = ArchitectureItem;

export interface ApiMap {
  endpoints: EndpointItem[];
}

export type DatabaseSchema = DBReverseEngineer;

export interface RuntimeData {
  status: "healthy" | "degraded" | "critical";
  flows: RuntimeFlow[];
}

export interface SecurityReport {
  issues: SecurityIssue[];
}

export interface PerformanceReport {
  issues: PerformanceIssue[];
}

export type ProjectRole = "owner" | "admin" | "lead_developer" | "developer" | "viewer";

export interface ProjectMember {
  uid: string;
  role: ProjectRole;
}

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

export interface CodeScopeProject {
  id: string;
  name: string;
  description: string;
  members: ProjectMember[];
  files: ProjectFile[];
  lastAnalysis: string;
  runtimeStatus: "Online" | "Degraded" | "Offline";
  securityStatus: "Good" | "Warning" | "Critical";
  pendingReviews: number;
  analysis: Analysis;
  architecture: Architecture;
  api: ApiMap;
  database: DatabaseSchema;
  runtime: RuntimeData;
  security: SecurityReport;
  performance: PerformanceReport;
}

interface ProjectState {
  projects: CodeScopeProject[];
  activeProjectId: string | null;
  setProjects: (projects: CodeScopeProject[]) => void;
  loadProjectsFromApi: () => Promise<void>;
  setActiveProjectId: (projectId: string | null) => void;
  upsertProject: (project: CodeScopeProject) => void;
  createProject: (input: { name: string; description: string; members: ProjectMember[] }) => void;
  importProjects: (projectIds: string[], member: ProjectMember) => void;
  deleteProject: (projectId: string) => void;
  updateProjectFile: (projectId: string, path: string, content: string) => void;
}

function emptyAnalysis(projectName: string): CodeScopeAnalysis {
  return {
    projectName,
    healthScore: 100,
    healthReasons: [],
    projectDNA: {
      languages: [],
      frameworks: [],
      databases: [],
      infrastructure: [],
      authentication: [],
    },
    architecture: {
      style: "Pending AI understanding",
      confidence: 0,
      explanation: "Run analysis to let CodeScope understand this application.",
      diagrams: [],
    },
    modules: [],
    dependencyGraph: { nodes: [], edges: [] },
    endpoints: [],
    database: { tables: [] },
    refactoring: [],
    security: [],
    performance: [],
    importAnalysis: {
      largestFiles: [],
      circularDependencies: [],
      packageCouplingScore: 0,
    },
    runtimeFlow: [],
  };
}

function filesFromAnalysis(analysis: CodeScopeAnalysis & { files?: ProjectFile[] }): ProjectFile[] {
  if (Array.isArray(analysis.files)) return analysis.files;

  return analysis.importAnalysis.largestFiles.map((file) => ({
    path: file.file,
    language: file.file.split(".").pop() || "text",
    content: "",
  }));
}

export function createCodeScopeProject(
  id: string,
  analysis: CodeScopeAnalysis,
  members: ProjectMember[] = [{ uid: "andrzej", role: "owner" }]
): CodeScopeProject {
  const criticalSecurity = analysis.security.filter((issue) => issue.severity === "Critical").length;
  const runtimeStatus =
    criticalSecurity > 0 || analysis.healthScore < 45
      ? "critical"
      : analysis.healthScore < 70
      ? "degraded"
      : "healthy";

  return {
    id,
    name: analysis.projectName,
    description: `${analysis.projectName} as an AI-understood application workspace.`,
    members,
    files: filesFromAnalysis(analysis),
    lastAnalysis: "loaded from database",
    runtimeStatus: runtimeStatus === "healthy" ? "Online" : runtimeStatus === "degraded" ? "Degraded" : "Offline",
    securityStatus: criticalSecurity > 0 ? "Critical" : analysis.security.length > 0 ? "Warning" : "Good",
    pendingReviews: id === "app-ecommerce" ? 1 : id === "app-fintech" ? 2 : 0,
    analysis: {
      healthScore: analysis.healthScore,
      healthReasons: analysis.healthReasons,
      modules: analysis.modules,
      dependencyGraph: analysis.dependencyGraph,
      importAnalysis: analysis.importAnalysis,
    },
    architecture: analysis.architecture,
    api: { endpoints: analysis.endpoints },
    database: analysis.database,
    runtime: {
      status: runtimeStatus,
      flows: analysis.runtimeFlow,
    },
    security: { issues: analysis.security },
    performance: { issues: analysis.performance },
  };
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  activeProjectId: null,
  setProjects: (projects) => set({ projects }),
  loadProjectsFromApi: async () => {
    const response = await fetch("/api/projects");
    if (!response.ok) throw new Error("Failed to load workspace projects");
    const summaries: Array<{ projectName: string }> = await response.json();

    const loadedProjects = await Promise.all(
      summaries.map(async (summary) => {
        const detailResponse = await fetch(`/api/projects/${encodeURIComponent(summary.projectName)}`);
        if (!detailResponse.ok) return createCodeScopeProject(summary.projectName, emptyAnalysis(summary.projectName), []);
        const analysis: CodeScopeAnalysis = await detailResponse.json();
        return createCodeScopeProject(summary.projectName, analysis);
      })
    );

    set({ projects: loadedProjects });
  },
  setActiveProjectId: (activeProjectId) => set({ activeProjectId }),
  upsertProject: (project) =>
    set((state) => ({
      projects: state.projects.some((item) => item.id === project.id)
        ? state.projects.map((item) => (item.id === project.id ? project : item))
        : [...state.projects, project],
    })),
  createProject: ({ name, description, members }) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          id: `project-${Date.now()}`,
          name,
          description,
          members,
          files: [],
          lastAnalysis: "not run yet",
          runtimeStatus: "Online",
          securityStatus: "Good",
          pendingReviews: 0,
          analysis: {
            healthScore: emptyAnalysis(name).healthScore,
            healthReasons: emptyAnalysis(name).healthReasons,
            modules: emptyAnalysis(name).modules,
            dependencyGraph: emptyAnalysis(name).dependencyGraph,
            importAnalysis: emptyAnalysis(name).importAnalysis,
          },
          architecture: emptyAnalysis(name).architecture,
          api: { endpoints: emptyAnalysis(name).endpoints },
          database: emptyAnalysis(name).database,
          runtime: { status: "healthy", flows: emptyAnalysis(name).runtimeFlow },
          security: { issues: [] },
          performance: { issues: [] },
        },
      ],
    })),
  importProjects: (projectIds, member) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        projectIds.includes(project.id) && !project.members.some((projectMember) => projectMember.uid === member.uid)
          ? { ...project, members: [member, ...project.members] }
          : project
      ),
    })),
  deleteProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== projectId),
      activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId,
    })),
  updateProjectFile: (projectId, path, content) =>
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              files: project.files.map((file) =>
                file.path === path ? { ...file, content } : file
              ),
            }
          : project
      ),
    })),
}));
