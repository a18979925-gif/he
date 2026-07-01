import React, { useState } from "react";
import { X } from "lucide-react";
import type { CodeScopeProject } from "../../stores/projectStore";

interface ImportProjectModalProps {
  projects: CodeScopeProject[];
  onClose: () => void;
  onImport: (projectIds: string[]) => void;
}

export default function ImportProjectModal({ projects, onClose, onImport }: ImportProjectModalProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedIds = Object.entries(selected)
    .filter(([, checked]) => checked)
    .map(([projectId]) => projectId);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-xl rounded-lg border border-white/10 bg-[#0b1020] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h3 className="text-lg font-black text-white">Import Existing</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-white/8 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="text-xs font-black uppercase tracking-wider text-slate-500">Select Project</div>
          <div className="mt-3 space-y-2">
            {projects.map((project) => (
              <label key={project.id} className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-3">
                <input type="checkbox" checked={!!selected[project.id]} onChange={(event) => setSelected((prev) => ({ ...prev, [project.id]: event.target.checked }))} />
                <span className="font-black text-white">{project.name}</span>
              </label>
            ))}
          </div>
          <button onClick={() => onImport(selectedIds)} className="mt-5 w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-black text-white hover:bg-indigo-400">
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
