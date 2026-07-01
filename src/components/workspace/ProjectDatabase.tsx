import React from "react";
import type { CodeScopeProject } from "../../stores/projectStore";

export default function ProjectDatabase({ project }: { project: CodeScopeProject }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {project.database.tables.map((table) => (
        <div key={table.name} className="rounded-lg border border-white/8 bg-white/[0.03] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8 font-black text-white">{table.name}</div>
          <div className="divide-y divide-white/5">
            {table.columns.map((column) => (
              <div key={column.name} className="px-4 py-2 flex items-center justify-between gap-3 text-xs">
                <span className="font-mono text-slate-200 truncate">{column.name}</span>
                <span className="text-slate-500 shrink-0">{column.type}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
