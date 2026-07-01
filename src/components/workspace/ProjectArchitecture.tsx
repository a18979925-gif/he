import React from "react";
import type { CodeScopeProject } from "../../stores/projectStore";

export default function ProjectArchitecture({ project }: { project: CodeScopeProject }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {project.analysis.modules.map((module) => (
        <div key={module.name} className="rounded-lg border border-white/8 bg-white/[0.03] p-5">
          <div className="text-base font-black text-white">{module.name}</div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-indigo-300">{module.type}</div>
          <div className="mt-4 text-sm text-slate-400">{module.dependencies.length} dependencies, {module.endpoints.length} endpoints, {module.entities.length} entities</div>
        </div>
      ))}
    </div>
  );
}
