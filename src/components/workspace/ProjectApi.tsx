import React from "react";
import type { CodeScopeProject } from "../../stores/projectStore";

export default function ProjectApi({ project }: { project: CodeScopeProject }) {
  return (
    <div className="space-y-3">
      {project.api.endpoints.map((endpoint) => (
        <div key={`${endpoint.method}-${endpoint.url}`} className="rounded-lg border border-white/8 bg-white/[0.03] p-4 flex items-center gap-4">
          <span className="w-16 text-center rounded-md bg-indigo-500/15 border border-indigo-400/20 px-2 py-1 text-xs font-black text-indigo-200">{endpoint.method}</span>
          <div className="min-w-0">
            <div className="font-mono text-sm text-white truncate">{endpoint.url}</div>
            <div className="text-xs text-slate-500 truncate">{endpoint.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
