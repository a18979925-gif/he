import React from "react";
import type { CodeScopeProject } from "../../stores/projectStore";

export default function ProjectReports({ project }: { project: CodeScopeProject }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] p-5">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Reports</h3>
      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-3">
        {project.analysis.healthReasons.map((reason) => (
          <div key={reason.category} className="rounded-md bg-black/20 border border-white/5 p-4">
            <div className="text-sm font-bold text-white">{reason.category}</div>
            <div className="mt-2 text-2xl font-black text-indigo-200">{reason.score}</div>
            <div className="mt-2 text-xs text-slate-500">{reason.recommendation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
