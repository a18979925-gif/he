import React, { useEffect, useMemo, useState } from "react";
import { Save, ShieldAlert, Trash2 } from "lucide-react";
import type { CodeScopeProject, ProjectFile, ProjectRole } from "../../stores/projectStore";

interface ProjectEditorProps {
  project: CodeScopeProject;
  currentUserId: string;
  onSave: (path: string, content: string) => void;
}

const canEditRoles: ProjectRole[] = ["owner", "admin", "lead_developer", "developer"];

export default function ProjectEditor({ project, currentUserId, onSave }: ProjectEditorProps) {
  const [selectedPath, setSelectedPath] = useState(project.files[0]?.path || "");
  const selectedFile = useMemo<ProjectFile | undefined>(
    () => project.files.find((file) => file.path === selectedPath),
    [project.files, selectedPath]
  );
  const [draft, setDraft] = useState(selectedFile?.content || "");
  const projectMember = project.members.find((member) => member.uid === currentUserId);
  const role = projectMember?.role || "viewer";
  const canEdit = canEditRoles.includes(role);
  const canManage = role === "owner";

  useEffect(() => {
    setDraft(selectedFile?.content || "");
  }, [selectedFile?.content, selectedPath]);

  if (!projectMember) {
    return (
      <div className="rounded-lg border border-rose-400/20 bg-rose-400/[0.04] p-5">
        <div className="flex items-center gap-2 font-black text-rose-200">
          <ShieldAlert size={18} /> Access denied
        </div>
        <p className="mt-2 text-sm text-slate-400">You are not assigned to this project.</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-[560px] grid-cols-[280px_minmax(0,1fr)] overflow-hidden rounded-lg border border-white/8 bg-white/[0.03]">
      <aside className="border-r border-white/8 bg-black/20 p-4">
        <div className="text-xs font-black uppercase tracking-wider text-slate-500">Project Files</div>
        <div className="mt-3 space-y-1">
          {project.files.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedPath(file.path)}
              className={`w-full rounded-md px-3 py-2 text-left font-mono text-xs transition-all ${
                selectedPath === file.path ? "bg-indigo-500/15 text-indigo-200" : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {file.path}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-w-0 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
          <div>
            <div className="font-mono text-sm font-black text-white">{selectedFile?.path || "No file selected"}</div>
            <div className="text-xs text-slate-500">
              {canEdit ? "Editor uses local state. Changes write to project store only after Save." : "Read only access"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <button className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black text-rose-300 hover:bg-rose-500/10">
                <Trash2 size={14} /> Delete
              </button>
            )}
            {canEdit && selectedFile && (
              <button onClick={() => onSave(selectedFile.path, draft)} className="flex items-center gap-2 rounded-md bg-indigo-500 px-3 py-2 text-xs font-black text-white hover:bg-indigo-400">
                <Save size={14} /> Save
              </button>
            )}
          </div>
        </div>

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          readOnly={!canEdit}
          spellCheck={false}
          className="min-h-0 flex-1 resize-none bg-[#070b16] p-5 font-mono text-sm leading-6 text-slate-200 outline-none read-only:text-slate-400"
        />
      </section>
    </div>
  );
}
