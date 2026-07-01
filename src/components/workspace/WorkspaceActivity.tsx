import React from "react";
import { Activity, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import type { CodeScopeProject } from "../../stores/projectStore";

interface WorkspaceActivityProps {
  projects: CodeScopeProject[];
}

export default function WorkspaceActivity({ projects }: WorkspaceActivityProps) {
  const events = projects.flatMap((project) => [
    {
      icon: <CheckCircle2 size={15} className="text-emerald-300" />,
      title: `${project.name} analysis completed`,
      meta: `${project.analysis.modules.length} modules mapped`,
    },
    {
      icon: <ShieldAlert size={15} className="text-amber-300" />,
      title: `${project.name} security posture updated`,
      meta: `${project.security.issues.length} findings tracked`,
    },
  ]).slice(0, 6);

  return (
    <section className="rounded-lg border border-white/8 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Activity Feed</h3>
        <Activity size={18} className="text-slate-500" />
      </div>

      <div className="space-y-3">
        {events.map((event, index) => (
          <div key={`${event.title}-${index}`} className="flex items-start gap-3 rounded-md bg-black/20 border border-white/5 p-3">
            <div className="mt-0.5">{event.icon}</div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-200">{event.title}</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock size={12} /> {event.meta}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
