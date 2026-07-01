import { useState, FormEvent } from "react";
import { Member } from "../types/member";
import { Organization, Integration, BillingConfig } from "../types/team";
import { TeamRole, TeamPermission } from "../types/role";
import { WORKSPACE_PERMISSIONS } from "../constants/permissions";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Settings, Users, Key, Workflow, CreditCard, AlertOctagon, ShieldAlert, Check } from "lucide-react";
import { toast } from "sonner";

interface TeamSettingsProps {
  org: Organization | null;
  activeMember: Member | null;
  members: Member[];
  integrations: Integration[];
  billing: BillingConfig | null;
  rolePermissions: Record<TeamRole, TeamPermission[]>;
  hasPermission: (permission: any) => boolean;
  onUpdateOrg: (org: Organization) => void;
  onToggleIntegration: (id: string) => void;
  onUpdateBilling: (billing: BillingConfig) => void;
  onUpdateRolePermissions: (role: TeamRole, permissions: TeamPermission[]) => void;
  onResetData: () => void;
  logAction: (actor: Member, action: string, target: string, category: any, details?: string) => void;
}

export function TeamSettings({
  org,
  activeMember,
  members,
  integrations,
  billing,
  rolePermissions,
  hasPermission,
  onUpdateOrg,
  onToggleIntegration,
  onUpdateBilling,
  onUpdateRolePermissions,
  onResetData,
  logAction
}: TeamSettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"general" | "members" | "roles" | "integrations" | "billing" | "danger">("general");

  // General States
  const [orgName, setOrgName] = useState(org?.name || "");
  const [orgDomain, setOrgDomain] = useState(org?.domain || "");
  const [orgLogo, setOrgLogo] = useState(org?.logo || "⚡");

  // Billing States
  const [billingEmail, setBillingEmail] = useState(billing?.billingEmail || "");
  const [billingPlan, setBillingPlan] = useState(billing?.planName || "Enterprise");

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "error") {
      toast.error(message);
    } else {
      toast.info(message);
    }
  };

  // Clearance Check
  const canManage = hasPermission("settings.manage");
  const canManageBilling = hasPermission("billing.manage");

  const handleGeneralSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!org || !canManage) return;

    const updated = {
      ...org,
      name: orgName,
      domain: orgDomain,
      logo: orgLogo
    };
    onUpdateOrg(updated);
    
    if (activeMember) {
      logAction(
        activeMember,
        "updated settings",
        "Organization metadata configurations",
        "settings",
        `New branding: '${orgName}' (domain: ${orgDomain})`
      );
    }
    showToast("Ustawienia ogólne organizacji zostały zsynchronizowane.");
  };

  const handleIntegrationToggle = (int: Integration) => {
    if (!canManage) return;
    onToggleIntegration(int.id);
    
    if (activeMember) {
      const isConnecting = int.status === "disconnected";
      logAction(
        activeMember,
        isConnecting ? "connected integration" : "disconnected integration",
        int.name,
        "settings",
        `Integration pipeline ${isConnecting ? "opened" : "severed"}.`
      );
    }
  };

  const handleBillingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!billing || !canManageBilling) return;

    const updated = {
      ...billing,
      billingEmail,
      planName: billingPlan as any,
      amount: billingPlan === "Enterprise" ? 499.0 : billingPlan === "Business" ? 149.0 : 49.0
    };
    onUpdateBilling(updated);

    if (activeMember) {
      logAction(
        activeMember,
        "updated billing",
        `Subscription tier: ${billingPlan}`,
        "billing",
        `Billing communication target: ${billingEmail}`
      );
    }
    showToast("Konfiguracja planu rozliczeniowego została zaktualizowana.");
  };

  const handleRolePermissionToggle = (role: TeamRole, permission: TeamPermission) => {
    if (!canManage) return;

    const currentPerms = rolePermissions[role] || [];
    let updatedPerms: TeamPermission[] = [];

    if (currentPerms.includes(permission)) {
      // Don't let owners remove basic owner permissions for security
      if (role === "owner" && (permission === "settings.manage" || permission === "billing.manage")) {
        showToast("Ze względów bezpieczeństwa nie można odebrać uprawnień administracyjnych roli Właściciela.", "error");
        return;
      }
      updatedPerms = currentPerms.filter((p) => p !== permission);
    } else {
      updatedPerms = [...currentPerms, permission];
    }

    onUpdateRolePermissions(role, updatedPerms);

    if (activeMember) {
      logAction(
        activeMember,
        "updated role permissions",
        `${role.toUpperCase()} clearance permissions grid`,
        "settings",
        `Toggled permission: ${permission}`
      );
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Ustawienia Przestrzeni Roboczej (Workspace)</h2>
        <p className="text-xs text-slate-500">Edytuj ogólne metadane, konfiguruj szczegółowe matryce uprawnień ról, zarządzaj integracjami i przeglądaj szczegóły subskrypcji.</p>
      </div>

      {/* Settings layout split */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sub-Tab Panel */}
        <div className="md:w-56 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-3 md:pb-0 border-b md:border-b-0 md:border-r border-slate-200">
          {[
            { id: "general", name: "Ustawienia Ogólne", icon: Settings },
            { id: "members", name: "Podsumowanie Kont", icon: Users },
            { id: "roles", name: "Uprawnienia i Role", icon: ShieldCheck },
            { id: "integrations", name: "Integracje i Webhooki", icon: Workflow },
            { id: "billing", name: "Plany i Rozliczenia", icon: CreditCard },
            { id: "danger", name: "Krytyczne Resetowanie", icon: AlertOctagon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Form Area */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 shadow-xxs">
          {/* Clearance padlocks */}
          {!canManage && activeSubTab !== "billing" && (
            <div className="mb-5 rounded-lg border border-amber-100 bg-amber-50/50 p-4 text-xs text-amber-800 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Zabezpieczony Kontekst Konfiguracji</h4>
                <p className="mt-0.5 leading-relaxed">
                  Twój poziom uprawnień w symulatorze nie posiada wymaganej roli <strong>"settings.manage"</strong>. Możesz przeglądać parametry, lecz wszelkie modyfikacje są zablokowane do czasu przełączenia tożsamości.
                </p>
              </div>
            </div>
          )}

          {/* 1. GENERAL SETTINGS */}
          {activeSubTab === "general" && (
            <form onSubmit={handleGeneralSubmit} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Właściwości Organizacji</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Nazwa Przestrzeni (Workspace)</label>
                  <input
                    type="text"
                    disabled={!canManage}
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs bg-slate-50/30 focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Domena Firmowa</label>
                  <input
                    type="text"
                    disabled={!canManage}
                    value={orgDomain}
                    onChange={(e) => setOrgDomain(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs bg-slate-50/30 focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-500 mb-1">Emoji Logo Organizacji</label>
                  <input
                    type="text"
                    disabled={!canManage}
                    maxLength={2}
                    value={orgLogo}
                    onChange={(e) => setOrgLogo(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-xs bg-slate-50/30 focus:border-indigo-500 disabled:opacity-50 font-mono text-center"
                  />
                </div>
              </div>

              {canManage && (
                <div className="flex justify-end pt-4">
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg cursor-pointer">
                    Synchronizuj Metadane
                  </button>
                </div>
              )}
            </form>
          )}

          {/* 2. MEMBERS SHORTCUT */}
          {activeSubTab === "members" && (
            <div className="space-y-3.5 text-xs text-slate-700">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Podsumowanie Kont Użytkowników</h3>
              <p className="leading-relaxed text-slate-500">
                Aktywne przypisania i poziomy dostępu są zarządzane bezpośrednio w dedykowanej karcie <strong>"Zarządzanie Zespołem"</strong>. Poniżej znajduje się aktualny stan bazy:
              </p>
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 space-y-2">
                <div className="flex justify-between font-mono text-xxs text-slate-500 uppercase tracking-wide">
                  <span>Aktywne konta użytkowników:</span>
                  <span className="font-bold text-slate-800">{members.length} Profilów</span>
                </div>
                <div className="flex justify-between font-mono text-xxs text-slate-500 uppercase tracking-wide">
                  <span>Sektor Administracyjny:</span>
                  <span className="font-bold text-slate-800">{members.filter(m => m.role === "admin" || m.role === "owner").length} Profilów</span>
                </div>
                <div className="flex justify-between font-mono text-xxs text-slate-500 uppercase tracking-wide">
                  <span>Dział Techniczny (Deweloperzy):</span>
                  <span className="font-bold text-slate-800">{members.filter(m => m.role === "developer").length} Profilów</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. ROLES & DYNAMIC PERMISSIONS MATRIX */}
          {activeSubTab === "roles" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Matryca Uprawnień i Poziomów Dostępu</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dynamicznie dostosowuj przydział uprawnień w całym systemie. Zaznacz, które role mają dostęp do konkretnych sekcji platformy.
              </p>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xxs font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-3">Zakresy Uprawnień</th>
                      {(["owner", "admin", "developer", "security", "manager", "worker", "viewer"] as TeamRole[]).map((role) => (
                        <th key={role} className="px-4 py-3 text-center uppercase font-mono">
                          {role === "owner" ? "Właściciel" : 
                           role === "admin" ? "Admin" : 
                           role === "developer" ? "Deweloper" : 
                           role === "security" ? "Security" : 
                           role === "manager" ? "Menedżer" : 
                           role === "worker" ? "Pracownik" : 
                           "Widz"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {WORKSPACE_PERMISSIONS.map((perm) => (
                      <tr key={perm.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 leading-tight">
                            {perm.name === "Settings Manage" ? "Zarządzanie Ustawieniami" :
                             perm.name === "Billing Manage" ? "Zarządzanie Rozliczeniami" :
                             perm.name === "Member Invite" ? "Zapraszanie Członków" :
                             perm.name === "Member Remove" ? "Usuwanie Członków" :
                             perm.name === "Project Create" ? "Tworzenie Projektów" :
                             perm.name === "Project Delete" ? "Usuwanie Projektów" :
                             perm.name === "Credentials Manage" ? "Zarządzanie Kluczami API" :
                             perm.name === "Audit View" ? "Podgląd Audytu" : perm.name}
                          </p>
                          <p className="text-xxs text-slate-400 font-sans mt-0.5">
                            {perm.description === "Full administrative rights over workspace configuration." ? "Pełne prawa administracyjne do konfiguracji przestrzeni roboczej." :
                             perm.description === "Manage corporate invoices, subscription plans and payment gates." ? "Zarządzanie fakturami, subskrypcjami i bramkami płatności." :
                             perm.description === "Ability to invite external talent into the organization pipeline." ? "Możliwość zapraszania nowych osób do organizacji." :
                             perm.description === "Ability to sever user clearance nodes and completely remove them." ? "Możliwość odwoływania uprawnień i całkowitego usuwania użytkowników." :
                             perm.description === "Initialize brand new Git repositories and release branches." ? "Zainicjowanie zupełnie nowych repozytoriów i gałęzi wydań." :
                             perm.description === "Hard delete project repositories and database records." ? "Bezpowrotne usuwanie repozytoriów projektowych wraz z bazą danych." :
                             perm.description === "Write, compile, and configure API and SSH authentication variables." ? "Zapis, kompilacja oraz konfiguracja zmiennych autoryzacji API i SSH." :
                             perm.description === "Deep clearance read access to logs and security vault actions." ? "Szeroki dostęp do odczytu logów audytowych i rejestrów operacji." : perm.description}
                          </p>
                        </td>
                        {(["owner", "admin", "developer", "security", "manager", "worker", "viewer"] as TeamRole[]).map((role) => {
                          const hasClaim = (rolePermissions[role] || []).includes(perm.id);
                          return (
                            <td key={role} className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={hasClaim}
                                disabled={!canManage}
                                onChange={() => handleRolePermissionToggle(role, perm.id)}
                                className="h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. INTEGRATIONS */}
          {activeSubTab === "integrations" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Aktywne Integracje i Potoki (Pipelines)</h3>
              <p className="text-xs text-slate-500">Połącz zewnętrzne webhooki, komunikatory firmowe (Slack/Teams) oraz systemy ciągłego wdrażania (CI/CD).</p>

              <div className="grid gap-3.5 sm:grid-cols-2 text-xs">
                {integrations.map((int) => {
                  const isConnected = int.status === "connected";
                  return (
                    <div key={int.id} className="rounded-lg border border-slate-200 p-4 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{int.logo}</span>
                          <span className={`px-2 py-0.5 text-xxs font-bold font-mono rounded-full ${
                            isConnected ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500"
                          }`}>
                            {isConnected ? "POŁĄCZONO" : "ROZŁĄCZONO"}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 mt-2">{int.name}</h4>
                        <p className="text-xxs text-slate-400 leading-relaxed mt-1">
                          {int.description === "Pushes build failures and cluster updates to Slack channels." ? "Wysyła błędy kompilacji i aktualizacje klastrów na kanały Slack." :
                           int.description === "Automates repository sync and pull requests metadata feeds." ? "Automatyzuje synchronizację repozytorium i metadane pull requestów." :
                           int.description === "Triggers serverless containers deployment upon git release tag pushes." ? "Uruchamia wdrożenia kontenerów po przesłaniu tagów wydań git." :
                           int.description === "Triggers Stripe recurring subscription invoices and usage events." ? "Uruchamia cykliczne rozliczenia Stripe i zbiera statystyki." : int.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleIntegrationToggle(int)}
                        disabled={!canManage}
                        className={`w-full py-1.5 rounded-lg text-[10px] font-bold uppercase cursor-pointer ${
                          isConnected
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-indigo-600 text-white hover:bg-indigo-500"
                        } disabled:opacity-50 transition-colors`}
                      >
                        {isConnected ? "Odłącz Integrację" : "Uruchom Integrację"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. BILLING */}
          {activeSubTab === "billing" && (
            <form onSubmit={handleBillingSubmit} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Subskrypcja i Rozliczenia</h3>
              
              {!canManageBilling && (
                <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 text-amber-800 leading-relaxed">
                  Twój aktualny poziom dostępu w symulatorze nie posiada uprawnień <strong>"billing.manage"</strong>. Nie możesz modyfikować planów subskrypcji ani e-maili rozliczeniowych.
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-400 mb-1">Adres E-mail do Faktur</label>
                  <input
                    type="email"
                    disabled={!canManageBilling}
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 px-3"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold uppercase tracking-wide text-slate-400 mb-1">Plan Taryfowy Przedsiębiorstwa</label>
                  <select
                    disabled={!canManageBilling}
                    value={billingPlan}
                    onChange={(e) => setBillingPlan(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 bg-white"
                  >
                    <option value="Starter">Starter Plan - $49.00 / miesiąc</option>
                    <option value="Business">Business Plan - $149.00 / miesiąc</option>
                    <option value="Enterprise">Enterprise Plan - $499.00 / miesiąc</option>
                  </select>
                </div>
              </div>

              {canManageBilling && (
                <div className="flex justify-end pt-4">
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer">
                    Zapisz Ustawienia Rozliczeń
                  </button>
                </div>
              )}
            </form>
          )}

          {/* 6. DANGER ZONE */}
          {activeSubTab === "danger" && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-rose-800 border-b border-rose-100 pb-2 flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4 text-rose-600" />
                <span>Modyfikacje Krytyczne (Danger Zone)</span>
              </h3>
              <p className="leading-relaxed text-slate-500">
                Operacje w tej sekcji omijają standardowe zabezpieczenia i bezpowrotnie modyfikują bazę danych. Wykonuj tylko pod ścisłym nadzorem.
              </p>

              <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 leading-tight">Przywróć Ustawienia Fabryczne</h4>
                  <p className="text-xxs text-slate-500 mt-1">Usuwa wszystkie własne projekty, członków zespołu, logi audytowe oraz przywraca fabryczne ustawienia początkowe bazy danych Firebase.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Czy na pewno chcesz bezpowrotnie zresetować pamięć podręczną? Wszystkie dodane dane zostaną usunięte.")) {
                      try {
                        onResetData();
                        toast.success("Baza danych została zresetowana do stanu początkowego.");
                      } catch (err: any) {
                        toast.error("Błąd resetowania: " + err.message);
                      }
                    }
                  }}
                  className="px-3 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-500 cursor-pointer"
                >
                  Hard Reset Cache
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
