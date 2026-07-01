import React, { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import type { ProjectMember, ProjectRole } from "../../stores/projectStore";
import type { WorkspaceMember } from "../../stores/workspaceStore";

interface CreateProjectModalProps {
  members: WorkspaceMember[];
  onClose: () => void;
  onCreate: (input: { name: string; description: string; members: ProjectMember[] }) => void;
}

const roleLabels: Record<ProjectRole, string> = {
  owner: "Full Access",
  admin: "Management Access",
  lead_developer: "Lead Code Access",
  developer: "Code Access",
  viewer: "Read Only",
};

export default function CreateProjectModal({ members, onClose, onCreate }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [created, setCreated] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(members.slice(0, 4).map((member) => [member.id, true]))
  );
  const [roles, setRoles] = useState<Record<string, ProjectRole>>(() =>
    Object.fromEntries(
      members.map((member) => [
        member.id,
        member.role === "owner" ? "owner" : member.role === "admin" ? "admin" : member.role === "viewer" ? "viewer" : "developer",
      ])
    )
  );

  const selectedMembers = members
    .filter((member) => selected[member.id])
    .map((member) => ({ uid: member.id, role: roles[member.id] || "viewer" }));

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim(), members: selectedMembers });
    setCreated(true);
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-[#0b1020] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h3 className="text-lg font-black text-white">Create Project</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-white/8 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {created ? (
          <div className="space-y-4 p-6">
            {["Project Created", "Members Assigned", "Permissions Generated"].map((label) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.04] p-4">
                <CheckCircle2 size={19} className="text-emerald-300" />
                <span className="font-black text-white">{label}</span>
              </div>
            ))}
            <button onClick={onClose} className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-black text-white hover:bg-indigo-400">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5 p-6">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Project Name</label>
              <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-indigo-400/50" />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-500">Description</label>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 h-20 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-indigo-400/50" />
            </div>

            <div className="border-y border-white/8 py-4">
              <div className="text-xs font-black uppercase tracking-wider text-slate-500">Members</div>
              <div className="mt-3 space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="grid grid-cols-[24px_1fr_170px] items-center gap-3">
                    <input type="checkbox" checked={!!selected[member.id]} onChange={(event) => setSelected((prev) => ({ ...prev, [member.id]: event.target.checked }))} />
                    <span className="font-bold text-white">{member.nickname}</span>
                    <select value={roles[member.id]} onChange={(event) => setRoles((prev) => ({ ...prev, [member.id]: event.target.value as ProjectRole }))} className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-sm text-slate-200 outline-none">
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="lead_developer">Lead Developer</option>
                      <option value="developer">Developer</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-500">Permissions Preview</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {Object.entries(roleLabels).map(([role, label]) => (
                  <div key={role} className="flex justify-between rounded-md border border-white/5 bg-black/20 px-3 py-2">
                    <span className="font-black capitalize text-slate-200">{role.replace("_", " ")}</span>
                    <span className="text-slate-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleCreate} className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-black text-white hover:bg-indigo-400">
              Create Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
