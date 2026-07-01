import React from "react";
import type { CodeScopeProject } from "../../stores/projectStore";

export default function ProjectSecurity({ project }: { project: CodeScopeProject }) {
  return (
    <div className="space-y-3">
      {project.security.issues.map((issue) => (
        <div key={`${issue.file}-${issue.line}-${issue.description}`} className="rounded-lg border border-amber-400/15 bg-amber-400/[0.04] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-bold text-white">{issue.category}</div>
            <span className="rounded-md bg-amber-400/10 px-2 py-1 text-xs font-black text-amber-200">{issue.severity}</span>
          </div>
          <div className="mt-2 text-sm text-slate-300">{issue.description}</div>
          <div className="mt-2 font-mono text-xs text-slate-500">{issue.file}{issue.line ? `:${issue.line}` : ""}</div>
        </div>
      ))}
    </div>
  );
}
