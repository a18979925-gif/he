import React from "react";
import { Activity, Boxes, Database, FileText, Gauge, Network, ShieldAlert, X, Code2, Files, SquarePen } from "lucide-react";
import type { CodeScopeProject } from "../../stores/projectStore";
import { useProjectStore } from "../../stores/projectStore";
import { useUiStore } from "../../stores/uiStore";
import ProjectOverview from "./ProjectOverview";
import ProjectArchitecture from "./ProjectArchitecture";
import ProjectApi from "./ProjectApi";
import ProjectDatabase from "./ProjectDatabase";
import ProjectRuntime from "./ProjectRuntime";
import ProjectSecurity from "./ProjectSecurity";
import ProjectPerformance from "./ProjectPerformance";
import ProjectReports from "./ProjectReports";
import ProjectEditor from "./ProjectEditor";

interface ProjectWorkspaceProps {
  project: CodeScopeProject;
  currentUserId: string;
  onBack: () => void;
}

const tabs = [
  { id: "overview", label: "Overview", icon: <Boxes size={16} /> },
  { id: "architecture", label: "Architecture", icon: <Network size={16} /> },
  { id: "api", label: "API", icon: <Code2 size={16} /> },
  { id: "database", label: "Database", icon: <Database size={16} /> },
  { id: "runtime", label: "Runtime", icon: <Activity size={16} /> },
  { id: "security", label: "Security", icon: <ShieldAlert size={16} /> },
  { id: "performance", label: "Performance", icon: <Gauge size={16} /> },
  { id: "reports", label: "Reports", icon: <FileText size={16} /> },
  { id: "files", label: "Files", icon: <Files size={16} /> },
  { id: "editor", label: "Editor", icon: <SquarePen size={16} /> },
] as const;

export default function ProjectWorkspace({ project, currentUserId, onBack }: ProjectWorkspaceProps) {
  const { activeProjectTab, setActiveProjectTab } = useUiStore();
  const { updateProjectFile } = useProjectStore();
  const projectMember = project.members.find((member) => member.uid === currentUserId);

  return (
    <div className="min-h-full">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-indigo-300">AI-understood application</div>
          <h2 className="mt-2 text-3xl font-black text-white">{project.name}</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Project workspace maps behavior, architecture, data, runtime, security, performance, reports, and files.
          </p>
          <div className="mt-3 inline-flex rounded-md border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs font-black capitalize text-indigo-200">
            Project role: {(projectMember?.role || "viewer").replace("_", " ")}
          </div>
        </div>
        <button onClick={onBack} className="rounded-lg p-3 text-slate-500 hover:text-white hover:bg-white/8 transition-all" title="Close project">
          <X size={22} />
        </button>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-white/8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveProjectTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
              activeProjectTab === tab.id
                ? "border-indigo-400 text-indigo-200"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeProjectTab === "overview" && <ProjectOverview project={project} />}
        {activeProjectTab === "architecture" && <ProjectArchitecture project={project} />}
        {activeProjectTab === "api" && <ProjectApi project={project} />}
        {activeProjectTab === "database" && <ProjectDatabase project={project} />}
        {activeProjectTab === "runtime" && <ProjectRuntime project={project} />}
        {activeProjectTab === "security" && <ProjectSecurity project={project} />}
        {activeProjectTab === "performance" && <ProjectPerformance project={project} />}
        {activeProjectTab === "reports" && <ProjectReports project={project} />}
        {activeProjectTab === "files" && (
          <div className="rounded-lg border border-white/8 bg-white/[0.03] p-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Files</h3>
            <div className="mt-4 space-y-2">
              {project.analysis.importAnalysis.largestFiles.map((file) => (
                <div key={file.file} className="flex items-center justify-between gap-3 rounded-md bg-black/20 border border-white/5 px-4 py-3">
                  <span className="font-mono text-xs text-slate-200 truncate">{file.file}</span>
                  <span className="text-xs font-bold text-slate-500 shrink-0">{file.size}</span>
                </div>
              ))}
              {project.files.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setActiveProjectTab("editor")}
                  className="flex w-full items-center justify-between gap-3 rounded-md bg-black/20 border border-white/5 px-4 py-3 text-left hover:bg-white/[0.05]"
                >
                  <span className="font-mono text-xs text-slate-200 truncate">{file.path}</span>
                  <span className="text-xs font-bold text-slate-500 shrink-0">{file.language}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {activeProjectTab === "editor" && (
          <ProjectEditor
            project={project}
            currentUserId={currentUserId}
            onSave={(path, content) => updateProjectFile(project.id, path, content)}
          />
        )}
      </div>
    </div>
  );
}
