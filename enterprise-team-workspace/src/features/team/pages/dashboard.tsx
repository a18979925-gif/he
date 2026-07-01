import { useState, useEffect, FormEvent } from "react";
import { useFirebaseTeam } from "../context/FirebaseTeamContext";
import { usePermissions } from "../hooks/usePermissions";
import { TeamHeader } from "../components/TeamHeader";
import { TeamSidebar } from "../components/TeamSidebar";
import { TeamStats } from "../components/TeamStats";
import { TeamMembers } from "../components/TeamMembers";
import { TeamProjects } from "../components/TeamProjects";
import { TeamActivity } from "../components/TeamActivity";
import { TeamAuditLog } from "../components/TeamAuditLog";
import { TeamSettings } from "../components/TeamSettings";
import { CodeAssignments } from "../components/CodeAssignments";
import { DeveloperScratchpad } from "../components/DeveloperScratchpad";
import { ViewerRoleDashboard } from "../components/ViewerRoleDashboard";
import { ProgrammerRoleDashboard } from "../components/ProgrammerRoleDashboard";
import { DeveloperRoleDashboard } from "../components/DeveloperRoleDashboard";
import { AdministratorRoleDashboard } from "../components/AdministratorRoleDashboard";
import { ClusterVisualizer } from "../components/ClusterVisualizer";
import { ROLE_NAVIGATION_MAP } from "../constants/navigation";
import { WorkerDashboard } from "../components/WorkerDashboard";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { CommandPalette } from "../components/CommandPalette";
import { 
  KeyRound, ShieldAlert, Plus, Eye, EyeOff, Cpu
} from "lucide-react";

export default function Dashboard() {
  const {
    org,
    members,
    projects,
    apiKeys,
    integrations,
    billing,
    tasks,
    prs,
    rolePermissions,
    activeMember,
    changeActiveMember,
    inviteMember,
    updateMember,
    deleteMember,
    createProject,
    updateProject,
    deleteProject,
    createApiKey,
    revokeApiKey,
    toggleIntegration,
    updateBilling,
    updateTaskStatus,
    addTask,
    createPR,
    updateRolePermissions,
    updateOrg,
    resetData,
    auditLogs,
    logAction,
    profile
  } = useFirebaseTeam();

  // Prioritize active simulator member's role for testing/evaluating different roles (Viewer, Programmer, Developer, Admin)
  const userRole = activeMember?.role || profile?.role || "developer";

  // Use the active member for general settings/metadata
  const currentMember = activeMember;

  const { hasPermission } = usePermissions(currentMember);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Cmd/Ctrl + K shortcut to toggle Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // API Key States
  const [newKeyName, setNewKeyName] = useState("");
  const [showKeySecretId, setShowKeySecretId] = useState<string | null>(null);

  // If the user's role switches, verify that the newly loaded role has access to the current tab.
  useEffect(() => {
    if (userRole) {
      const validTabs = ROLE_NAVIGATION_MAP[userRole]?.map((i: any) => i.id) || [];
      if (activeTab !== "overview" && !validTabs.includes(activeTab)) {
        setActiveTab("overview");
      }
    }
  }, [userRole]);

  const handleResetData = async () => {
    if (window.confirm("Are you sure you want to reset all team data back to default?")) {
      try {
        await resetData();
        toast.success("Dane klastra zostały pomyślnie przywrócone do stanu fabrycznego!");
        setActiveTab("overview");
      } catch (err: any) {
        toast.error("Błąd podczas resetowania danych: " + err.message);
      }
    }
  };

  const handleCreateApiKey = async (e: FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !currentMember) return;

    try {
      await createApiKey(newKeyName);
      toast.success(`Klucz API "${newKeyName}" został pomyślnie wygenerowany!`);
      setNewKeyName("");
    } catch (err: any) {
      toast.error("Błąd generowania klucza: " + err.message);
    }
  };

  const handleRevokeApiKey = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to revoke and delete API Key '${name}'? This instantly blocks all associated incoming daemon calls.`)) {
      try {
        await revokeApiKey(id);
        toast.success(`Klucz API "${name}" został pomyślnie unieważniony.`);
      } catch (err: any) {
        toast.error("Błąd unieważniania klucza: " + err.message);
      }
    }
  };

  return (
    <div id="unified-dashboard-root" className="flex h-screen w-full flex-col bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      {/* 1. Universal Top Header */}
      <TeamHeader
        org={org}
        activeMember={currentMember}
        members={members}
        onChangeActiveMember={changeActiveMember}
        onResetData={handleResetData}
        onSearchClick={() => setIsCommandPaletteOpen(true)}
      />

      {/* 2. Main Workspace Split Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Role-Based Sidebar */}
        <TeamSidebar
          activeMember={currentMember}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          rolePermissions={rolePermissions}
        />

        {/* Right Active tab Content Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Dynamic Content Switching routing based on authenticated user's role */}
                {userRole === "worker" && activeTab !== "overview" ? (
                  <WorkerDashboard
                    activeMember={currentMember}
                    projects={projects}
                    members={members}
                    tasks={tasks}
                    onTabChange={setActiveTab}
                    activeSubTab={activeTab}
                    onUpdateTaskStatus={updateTaskStatus}
                  />
                ) : (
                  <>
                    {activeTab === "overview" && (
                      <div id="dynamic-role-dashboard-wrapper">
                        {userRole === "viewer" && (
                          <ViewerRoleDashboard
                            activeMember={currentMember}
                            projects={projects}
                          />
                        )}
                        {userRole === "worker" && (
                          <ProgrammerRoleDashboard
                            activeMember={currentMember}
                            projects={projects}
                          />
                        )}
                        {userRole === "developer" && (
                          <DeveloperRoleDashboard
                            activeMember={currentMember}
                            projects={projects}
                            members={members}
                          />
                        )}
                        {(userRole === "admin" || userRole === "owner") && (
                          <AdministratorRoleDashboard
                            activeMember={currentMember}
                            projects={projects}
                            members={members}
                            auditLogs={auditLogs}
                            onUpdateMember={updateMember}
                            onDeleteMember={deleteMember}
                          />
                        )}
                        {userRole !== "viewer" && userRole !== "worker" && userRole !== "developer" && userRole !== "admin" && userRole !== "owner" && (
                          <TeamStats
                            activeMember={currentMember}
                            projects={projects}
                            members={members}
                            tasks={tasks}
                            prs={prs}
                            onTabChange={setActiveTab}
                          />
                        )}
                      </div>
                    )}

                    {activeTab === "projects" && (
                      <TeamProjects
                        projects={projects}
                        members={members}
                        tasks={tasks}
                        activeMember={currentMember}
                        hasPermission={hasPermission}
                        onCreateProject={createProject}
                        onUpdateProject={updateProject}
                        onDeleteProject={deleteProject}
                        logAction={logAction}
                      />
                    )}

                    {activeTab === "members" && (
                      <TeamMembers
                        members={members}
                        projects={projects}
                        activeMember={currentMember}
                        hasPermission={hasPermission}
                        onInviteMember={inviteMember}
                        onUpdateMember={updateMember}
                        onDeleteMember={deleteMember}
                        logAction={logAction}
                      />
                    )}

                    {activeTab === "audit_logs" && (
                      <TeamAuditLog logs={auditLogs} />
                    )}

                    {activeTab === "deployments" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-indigo-600 animate-pulse" />
                            <span>Infrastruktura Klastra Chmurowego</span>
                          </h2>
                          <p className="text-xs text-slate-500">
                            Monitoruj stan serwerów w czasie rzeczywistym, badaj obciążenia, symuluj ataki wolumetryczne i sprawdzaj integrację z Gemini AI Safety Guardrails.
                          </p>
                        </div>
                        <ClusterVisualizer />
                      </div>
                    )}

                    {activeTab === "settings" && (
                      <TeamSettings
                        org={org}
                        activeMember={currentMember}
                        members={members}
                        integrations={integrations}
                        billing={billing}
                        rolePermissions={rolePermissions}
                        hasPermission={hasPermission}
                        onUpdateOrg={updateOrg}
                        onToggleIntegration={toggleIntegration}
                        onUpdateBilling={updateBilling}
                        onUpdateRolePermissions={updateRolePermissions}
                        onResetData={handleResetData}
                        logAction={logAction}
                      />
                    )}

                    {/* API KEYS SECTION */}
                    {activeTab === "api_keys" && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-indigo-600" />
                            <span>Credentials & API Keys</span>
                          </h2>
                          <p className="text-xs text-slate-500">
                            Deploy secure keys to authorize external service requests. API actions are bounded by compliance audits.
                          </p>
                        </div>

                        {/* API key generation (Guarded) */}
                        {hasPermission("settings.manage") ? (
                          <form onSubmit={handleCreateApiKey} className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex-1">
                              <label className="block text-xxs font-bold uppercase tracking-wide text-slate-400 mb-1">Key Description name</label>
                              <input
                                type="text"
                                required
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="Analytical Telemetry Ingestion Key"
                                className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                              />
                            </div>
                            <button type="submit" className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 text-xs rounded-lg flex items-center gap-2 cursor-pointer transition-colors">
                              <Plus className="h-4 w-4" />
                              <span>Provision Secure Key</span>
                            </button>
                          </form>
                        ) : (
                          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-xs text-amber-800 flex items-start gap-3">
                            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-bold">Guarded Scope variables</h4>
                              <p className="mt-0.5 leading-relaxed">
                                Generating API keys requires the <strong>"settings.manage"</strong> clearance. Switch to the Owner or Security Officer identity to configure.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Active Key List */}
                        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xxs font-bold uppercase tracking-wider text-slate-400">
                                  <th className="px-6 py-3.5">Credential Label</th>
                                  <th className="px-6 py-3.5">Key Token</th>
                                  <th className="px-6 py-3.5">Created Date</th>
                                  <th className="px-6 py-3.5 text-right font-mono">Last Ingress Use</th>
                                  <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {apiKeys.map((key) => {
                                  const isRevoked = key.status === "revoked";
                                  const isRevealed = showKeySecretId === key.id;

                                  return (
                                    <tr key={key.id} className={`${isRevoked ? "bg-slate-50/50 opacity-60" : "hover:bg-slate-50/20"}`}>
                                      <td className="px-6 py-4 font-semibold text-slate-900">{key.name}</td>
                                      <td className="px-6 py-4 font-mono text-slate-500">
                                        <div className="flex items-center gap-2">
                                          <span>{isRevealed ? `sk_live_${key.id.substring(4)}_full_secret_token_abc123` : key.key}</span>
                                          {!isRevoked && (
                                            <button
                                              type="button"
                                              onClick={() => setShowKeySecretId(isRevealed ? null : key.id)}
                                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                                            >
                                              {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-slate-400 font-mono text-xxs">{new Date(key.createdAt).toLocaleDateString()}</td>
                                      <td className="px-6 py-4 text-slate-500 font-mono text-xxs text-right">{key.lastUsed}</td>
                                      <td className="px-6 py-4 text-right">
                                        {isRevoked ? (
                                          <span className="rounded bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5">
                                            Revoked & Purged
                                          </span>
                                        ) : (
                                          hasPermission("settings.manage") ? (
                                            <button
                                              onClick={() => handleRevokeApiKey(key.id, key.name)}
                                              className="text-rose-600 hover:text-rose-800 font-semibold text-xxs bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                                            >
                                              Revoke Key
                                            </button>
                                          ) : (
                                            <span className="text-[10px] text-slate-400 font-mono">🔒 Guarded</span>
                                          )
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "code_assignments" && (
                      <CodeAssignments />
                    )}

                    {/* Catch-all for specialized Developer, Admin, or Viewer sub-tabs */}
                    {activeTab !== "overview" &&
                     activeTab !== "projects" &&
                     activeTab !== "members" &&
                     activeTab !== "audit_logs" &&
                     activeTab !== "settings" &&
                     activeTab !== "api_keys" &&
                     activeTab !== "deployments" &&
                     activeTab !== "code_assignments" && (
                      <TeamActivity
                        activeTab={activeTab}
                        projects={projects}
                        members={members}
                        tasks={tasks}
                        prs={prs}
                        activeMember={currentMember}
                        onUpdateTaskStatus={updateTaskStatus}
                        onAddTask={addTask}
                        onCreatePR={createPR}
                        onUpdatePRStatus={updateTaskStatus as any}
                        logAction={logAction}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <DeveloperScratchpad />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        members={members}
        projects={projects}
        tasks={tasks}
        apiKeys={apiKeys}
        auditLogs={auditLogs}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
