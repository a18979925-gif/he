import React from "react";
import { Brain, GitBranch, Layers, ShieldCheck } from "lucide-react";
import type { CodeScopeProject } from "../../stores/projectStore";

export default function ProjectOverview({ project }: { project: CodeScopeProject }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {[
        { label: "AI Health", value: project.analysis.healthScore, icon: <Brain size={18} className="text-indigo-300" /> },
        { label: "Architecture", value: project.architecture.style, icon: <Layers size={18} className="text-sky-300" /> },
        { label: "Modules", value: project.analysis.modules.length, icon: <GitBranch size={18} className="text-emerald-300" /> },
        { label: "Security Issues", value: project.security.issues.length, icon: <ShieldCheck size={18} className="text-amber-300" /> },
      ].map((item) => (
        <div key={item.label} className="rounded-lg border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            {item.label}
            {item.icon}
          </div>
          <div className="mt-3 text-2xl font-black text-white truncate">{item.value}</div>
        </div>
      ))}

      <div className="xl:col-span-4 rounded-lg border border-white/8 bg-white/[0.03] p-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Application Understanding</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">{project.architecture.explanation}</p>
      </div>
    </div>
  );
}
