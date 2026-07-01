import React from "react";
import { Activity } from "lucide-react";

interface WorkspaceActivityItem {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

interface WorkspaceActivityProps {
  activities: WorkspaceActivityItem[];
}

export default function WorkspaceActivity({
  activities,
}: WorkspaceActivityProps) {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">
          Activity
        </h3>

        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
          <Activity size={14} className="text-indigo-400" />
          <span className="text-xs font-black text-slate-300">
            {activities.length} Events
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-white/8 bg-white/[0.03] divide-y divide-white/8">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No activity yet
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <div className="text-sm font-bold text-white">
                  {activity.user}
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  {activity.action}
                </div>
              </div>

              <div className="text-xs font-medium text-slate-500">
                {activity.timestamp}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}