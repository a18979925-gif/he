import { TeamRole } from "../types/role";

export interface NavigationItem {
  id: string;
  name: string;
  icon: string; // Icon name from lucide
  description: string;
}

export const ROLE_NAVIGATION_MAP: Record<TeamRole, NavigationItem[]> = {
  owner: [
    { id: "overview", name: "Executive Overview", icon: "LayoutDashboard", description: "Global metrics & health overview" },
    { id: "revenue", name: "Revenue & Finances", icon: "TrendingUp", description: "Organization revenues & invoices" },
    { id: "projects", name: "Workspace Projects", icon: "Briefcase", description: "Manage all corporate projects" },
    { id: "code_assignments", name: "Zlecenia Kodu (SaaS)", icon: "Code", description: "Wysyłaj pliki do edycji i zatwierdzaj kod" },
    { id: "members", name: "Members & Access", icon: "Users", description: "Team list and dynamic roles" },
    { id: "audit_logs", name: "Audit Trail", icon: "ShieldCheck", description: "Tamper-proof action logs" },
    { id: "billing", name: "Subscription & Billing", icon: "CreditCard", description: "Billing settings & plan details" },
    { id: "deployments", name: "Cloud Deployments", icon: "Cpu", description: "Active microservice cluster maps" },
    { id: "api_keys", name: "Developer API Keys", icon: "KeyRound", description: "Manage enterprise credentials" },
    { id: "settings", name: "Workspace Settings", icon: "Settings", description: "Manage General, Roles, & Integrations" }
  ],
  admin: [
    { id: "overview", name: "Admin Dashboard", icon: "LayoutDashboard", description: "System status & alerts" },
    { id: "projects", name: "Workspace Projects", icon: "Briefcase", description: "Manage all corporate projects" },
    { id: "code_assignments", name: "Zlecenia Kodu (SaaS)", icon: "Code", description: "Wysyłaj pliki do edycji i zatwierdzaj kod" },
    { id: "members", name: "Members & Access", icon: "Users", description: "Team list and permissions" },
    { id: "activity", name: "Activity Stream", icon: "Activity", description: "Live updates across systems" },
    { id: "deployments", name: "Deployments", icon: "Cpu", description: "Active cloud running services" },
    { id: "analytics", name: "Platform Analytics", icon: "BarChart3", description: "Resource utilization metrics" },
    { id: "settings", name: "Workspace Settings", icon: "Settings", description: "Configure General, Roles, & Integrations" }
  ],
  developer: [
    { id: "overview", name: "Developer Center", icon: "LayoutDashboard", description: "Developer stats and assigned tasks" },
    { id: "code_assignments", name: "Edytor Kodu (Zlecenia)", icon: "Code", description: "Odbieraj pliki, edytuj w SaaS i oddawaj zmiany" },
    { id: "projects", name: "My Projects", icon: "Briefcase", description: "Projects you are assigned to" },
    { id: "tasks", name: "Assigned Tasks", icon: "CheckSquare", description: "Assigned bugs & features" },
    { id: "files", name: "Repository Files", icon: "FolderGit2", description: "Browse source tree structure" },
    { id: "pull_requests", name: "Pull Requests", icon: "GitPullRequest", description: "Code review and open branches" },
    { id: "deployments", name: "Cloud Deployments", icon: "Cpu", description: "Active microservice cluster maps" },
    { id: "runtime_logs", name: "Runtime Logs", icon: "Terminal", description: "Standard outputs & stack traces" }
  ],
  security: [
    { id: "overview", name: "Security Audit Center", icon: "Shield", description: "Security postures and keys" },
    { id: "deployments", name: "Cloud Deployments", icon: "Cpu", description: "Active microservice cluster maps" },
    { id: "audit_logs", name: "Audit Trail", icon: "ShieldCheck", description: "Enterprise-grade user action tracking" },
    { id: "api_keys", name: "API Credentials", icon: "KeyRound", description: "Key rotation & active credentials" },
    { id: "settings", name: "Security Settings", icon: "Settings", description: "Integrations and key properties" }
  ],
  manager: [
    { id: "overview", name: "Manager Dashboard", icon: "LayoutDashboard", description: "Team overview & planning" },
    { id: "projects", name: "Workspace Projects", icon: "Briefcase", description: "Manage active team projects" },
    { id: "code_assignments", name: "Zlecenia Kodu (SaaS)", icon: "Code", description: "Wysyłaj pliki do edycji i zatwierdzaj kod" },
    { id: "members", name: "Members & Access", icon: "Users", description: "Invite and assign roles" },
    { id: "audit_logs", name: "Activity Logs", icon: "ShieldCheck", description: "View recent team actions" },
    { id: "settings", name: "Settings", icon: "Settings", description: "General workspace configuration" }
  ],
  viewer: [
    { id: "overview", name: "Viewer Board", icon: "LayoutDashboard", description: "Read-only workspace status" },
    { id: "projects", name: "Projects Library", icon: "Briefcase", description: "Browse active projects & targets" },
    { id: "reports", name: "Executive Reports", icon: "LineChart", description: "Visual graphs and downloadable PDFs" },
    { id: "documentation", name: "Documentation", icon: "BookOpen", description: "API and technical setup guides" },
    { id: "knowledge_base", name: "Knowledge Base", icon: "Library", description: "Company wiki and search indexing" },
    { id: "activity_feed", name: "Workspace Activity", icon: "Rss", description: "Feed of events inside the team" }
  ],
  worker: [
    { id: "overview", name: "Portal Pracownika", icon: "LayoutDashboard", description: "Przegląd zadań i podsumowanie" },
    { id: "my_tasks", name: "Moje Zadania", icon: "CheckSquare", description: "Zadania przypisane do Ciebie" },
    { id: "received_files", name: "Pliki od Zespołu", icon: "Inbox", description: "Pliki i instrukcje od administratora" },
    { id: "my_projects", name: "Moje Projekty", icon: "Briefcase", description: "Projekty, w których uczestniczysz" },
    { id: "team_chat", name: "Team Chat", icon: "MessagesSquare", description: "Komunikacja w czasie rzeczywistym" },
    { id: "mini_editor", name: "Wbudowany Edytor", icon: "Code", description: "Edytor kodu VS Code Lite" },
    { id: "invites", name: "Zaproszenia", icon: "Mail", description: "Zaproszenia do projektów i zespołów" },
    { id: "notifications", name: "Powiadomienia", icon: "Bell", description: "Aktualne powiadomienia i statusy" },
    { id: "profile", name: "Mój Profil", icon: "User", description: "Dane profilowe i uprawnienia" }
  ]
};
