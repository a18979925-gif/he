import React from "react";
import type { CodeScopeProject } from "../../stores/projectStore";

export default function ProjectRuntime({ project }: { project: CodeScopeProject }) {
  return (
    <div className="space-y-4">
      {project.runtime.flows.map((flow) => (
        <div key={flow.label} className="rounded-lg border border-white/8 bg-white/[0.03] p-5">
          <div className="text-base font-black text-white">{flow.label}</div>
          <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-3">
            {flow.steps.map((step) => (
              <div key={`${flow.label}-${step.name}`} className="rounded-md bg-black/20 border border-white/5 p-3">
                <div className="text-sm font-bold text-slate-200">{step.name}</div>
                <div className="text-xs text-indigo-300 mt-1">{step.component}</div>
                <div className="text-xs text-slate-500 mt-2">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
