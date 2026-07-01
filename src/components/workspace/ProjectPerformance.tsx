import React from "react";
import type { CodeScopeProject } from "../../stores/projectStore";

export default function ProjectPerformance({ project }: { project: CodeScopeProject }) {
  return (
    <div className="space-y-3">
      {project.performance.issues.map((issue) => (
        <div key={`${issue.file}-${issue.line}-${issue.issue}`} className="rounded-lg border border-sky-400/15 bg-sky-400/[0.04] p-4">
          <div className="font-bold text-white">{issue.issue}</div>
          <div className="mt-2 text-sm text-slate-300">{issue.description}</div>
          <div className="mt-2 text-xs text-sky-200">{issue.suggestedOptimization}</div>
        </div>
      ))}
    </div>
  );
}
