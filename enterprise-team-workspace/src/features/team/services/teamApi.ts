import { Organization, Project, ApiKey, Integration, BillingConfig } from "../types/team";
import { Member } from "../types/member";
import { AuditLogEntry, Deployment, Task, PullRequest, LogLine } from "../types/activity";
import { TeamRole, TeamPermission, ProjectRole } from "../types/role";
import { DEFAULT_ROLE_CONFIGS } from "../constants/permissions";

const STORAGE_KEYS = {
  ORGANIZATION: "team_workspace_org",
  MEMBERS: "team_workspace_members",
  PROJECTS: "team_workspace_projects",
  AUDIT_LOGS: "team_workspace_audit_logs",
  API_KEYS: "team_workspace_api_keys",
  INTEGRATIONS: "team_workspace_integrations",
  BILLING: "team_workspace_billing",
  TASKS: "team_workspace_tasks",
  PULL_REQUESTS: "team_workspace_prs",
  ROLE_PERMISSIONS: "team_workspace_role_permissions"
};

// Initial Setup Data
const INITIAL_ORG: Organization = {
  id: "org_1",
  name: "Synthetix Enterprise",
  logo: "⚡",
  domain: "synthetix.io",
  createdAt: "2025-01-10T08:00:00Z"
};

const INITIAL_MEMBERS: Member[] = [
  {
    id: "mem_1",
    name: "Andrzej Kowalski",
    email: "andrzej@synthetix.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    role: "owner",
    status: "active",
    joinedAt: "2025-01-10T09:00:00Z",
    department: "Executive",
    lastActive: "Active now",
    projectRoles: {
      proj_1: "owner",
      proj_2: "owner",
      proj_3: "owner"
    }
  },
  {
    id: "mem_2",
    name: "John Carter",
    email: "john.carter@synthetix.io",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    role: "admin",
    status: "active",
    joinedAt: "2025-02-14T10:30:00Z",
    department: "Operations",
    lastActive: "15 minutes ago",
    projectRoles: {
      proj_1: "maintainer",
      proj_2: "maintainer",
      proj_3: "viewer"
    }
  },
  {
    id: "mem_3",
    name: "Mike Tyson",
    email: "mike.t@synthetix.io",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
    role: "developer",
    status: "active",
    joinedAt: "2025-03-01T14:15:00Z",
    department: "Engineering",
    lastActive: "3 minutes ago",
    projectRoles: {
      proj_1: "developer", // Developer on Auth Service
      proj_2: "viewer",    // ONLY A VIEWER on Payment Gateway! Highlights project roles.
      proj_3: "developer"
    }
  },
  {
    id: "mem_4",
    name: "Sarah Jenkins",
    email: "sarah.j@synthetix.io",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    role: "security",
    status: "active",
    joinedAt: "2025-03-10T11:00:00Z",
    department: "Security & Compliance",
    lastActive: "2 hours ago",
    projectRoles: {
      proj_1: "viewer",
      proj_2: "maintainer",
      proj_3: "viewer"
    }
  },
  {
    id: "mem_5",
    name: "Robert Lewandowski",
    email: "robert.l@synthetix.io",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
    role: "manager",
    status: "active",
    joinedAt: "2025-04-18T09:45:00Z",
    department: "Product Management",
    lastActive: "1 day ago",
    projectRoles: {
      proj_1: "maintainer",
      proj_2: "maintainer",
      proj_3: "owner"
    }
  },
  {
    id: "mem_6",
    name: "Kevin De Bruyne",
    email: "kevin.db@synthetix.io",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
    role: "viewer",
    status: "active",
    joinedAt: "2025-05-22T16:00:00Z",
    department: "Marketing",
    lastActive: "3 days ago",
    projectRoles: {
      proj_1: "viewer",
      proj_2: "viewer",
      proj_3: "viewer"
    }
  },
  {
    id: "mem_7",
    name: "Alex Johnson (Pracownik)",
    email: "alex.j@synthetix.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    role: "worker",
    status: "active",
    joinedAt: "2026-06-01T10:00:00Z",
    department: "Dział Operacyjny",
    lastActive: "Aktywny teraz",
    projectRoles: {
      proj_1: "developer",
      proj_2: "developer",
      proj_3: "viewer"
    }
  }
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj_1",
    name: "Auth Service",
    description: "Next-gen OAuth2 federated single sign-on and verification cluster.",
    status: "active",
    createdAt: "2025-01-15T12:00:00Z",
    revenue: 120000,
    memberCount: 5,
    tags: ["Security", "OAuth", "Core-Service"]
  },
  {
    id: "proj_2",
    name: "Payment Gateway",
    description: "Stripe-connected high-throughput multi-currency settlement processor.",
    status: "active",
    createdAt: "2025-02-20T10:00:00Z",
    revenue: 350000,
    memberCount: 4,
    tags: ["Fintech", "Stripe", "Compliance"]
  },
  {
    id: "proj_3",
    name: "Mobile App Core",
    description: "React Native consumer-facing terminal application for iOS and Android.",
    status: "active",
    createdAt: "2025-04-01T09:30:00Z",
    revenue: 85000,
    memberCount: 3,
    tags: ["Frontend", "React-Native", "App-Store"]
  }
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log_1",
    actor: {
      id: "mem_1",
      name: "Andrzej Kowalski",
      email: "andrzej@synthetix.io",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      role: "owner"
    },
    action: "invited member",
    target: "Mike Tyson (mike.t@synthetix.io) with Developer role",
    createdAt: "2025-03-01T14:15:00Z",
    category: "member",
    details: "Assigned default permissions for Developer role."
  },
  {
    id: "log_2",
    actor: {
      id: "mem_3",
      name: "Mike Tyson",
      email: "mike.t@synthetix.io",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
      role: "developer"
    },
    action: "created project",
    target: "Auth Service (proj_1)",
    createdAt: "2025-03-05T10:20:00Z",
    category: "project",
    details: "Initialized Git repo and standard server scaffolding."
  },
  {
    id: "log_3",
    actor: {
      id: "mem_1",
      name: "Andrzej Kowalski",
      email: "andrzej@synthetix.io",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      role: "owner"
    },
    action: "changed role",
    target: "John Carter (Developer → Admin)",
    createdAt: "2025-03-15T09:00:00Z",
    category: "member",
    details: "Upgraded user to elevate operational workflow controls."
  },
  {
    id: "log_4",
    actor: {
      id: "mem_1",
      name: "Andrzej Kowalski",
      email: "andrzej@synthetix.io",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      role: "owner"
    },
    action: "created api_key",
    target: "Production Analytics Ingestion Key",
    createdAt: "2025-04-02T13:40:00Z",
    category: "security",
    details: "Authorized scoped access for analytical queries."
  },
  {
    id: "log_5",
    actor: {
      id: "mem_2",
      name: "John Carter",
      email: "john.carter@synthetix.io",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      role: "admin"
    },
    action: "updated settings",
    target: "Workspace integrations: Slack Connector",
    createdAt: "2025-04-10T16:22:00Z",
    category: "settings",
    details: "Enabled chat webhook notifications for build failures."
  }
];

const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: "key_1",
    name: "Production Gateway Live Key",
    key: "sk_live_51Nx...A98q1",
    createdAt: "2025-02-20T11:00:00Z",
    lastUsed: "Active now",
    status: "active"
  },
  {
    id: "key_2",
    name: "Developer Staging Sandpit",
    key: "sk_test_51Nx...D61rZ",
    createdAt: "2025-02-21T09:30:00Z",
    lastUsed: "2 minutes ago",
    status: "active"
  },
  {
    id: "key_3",
    name: "Telemetry Pipeline Client",
    key: "sk_live_51Oy...K24zB",
    createdAt: "2025-04-02T13:40:00Z",
    lastUsed: "1 day ago",
    status: "active"
  }
];

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "int_1",
    name: "Slack Connector",
    description: "Sends automated build notifications and task assignments to slack channels.",
    logo: "💬",
    status: "connected"
  },
  {
    id: "int_2",
    name: "GitHub Enterprise",
    description: "Enables single-direction PR synchronization, status checks, and log mapping.",
    logo: "🐙",
    status: "connected"
  },
  {
    id: "int_3",
    name: "Google Drive Backup",
    description: "Hourly automatic binary logs and static resource backups.",
    logo: "📁",
    status: "disconnected"
  },
  {
    id: "int_4",
    name: "Amazon Web Services",
    description: "Deploys lambda clusters directly from merged release branches.",
    logo: "☁️",
    status: "connected"
  }
];

const INITIAL_BILLING: BillingConfig = {
  planName: "Enterprise",
  amount: 499.00,
  nextInvoice: "2026-07-15",
  cardLast4: "9824",
  billingEmail: "finance@synthetix.io"
};

const INITIAL_TASKS: Task[] = [
  {
    id: "task_1",
    projectId: "proj_1",
    projectName: "Auth Service",
    title: "Implement FIDO2 WebAuthn multi-factor challenge",
    status: "in-progress",
    assignedTo: "mem_3", // Mike Tyson
    dueDate: "2026-07-05",
    priority: "high"
  },
  {
    id: "task_2",
    projectId: "proj_1",
    projectName: "Auth Service",
    title: "Review JWT symmetric encryption rotation interval",
    status: "todo",
    assignedTo: "mem_3",
    dueDate: "2026-07-12",
    priority: "medium"
  },
  {
    id: "task_3",
    projectId: "proj_2",
    projectName: "Payment Gateway",
    title: "Migrate deprecated Stripe API endpoints to v2024-04-12",
    status: "review",
    assignedTo: "mem_2", // John Carter
    dueDate: "2026-07-01",
    priority: "high"
  },
  {
    id: "task_4",
    projectId: "proj_3",
    projectName: "Mobile App Core",
    title: "Fix deep linking verification triggers on iOS 17.4+",
    status: "done",
    assignedTo: "mem_3",
    dueDate: "2026-06-28",
    priority: "high"
  }
];

const INITIAL_PRS: PullRequest[] = [
  {
    id: "pr_1",
    projectId: "proj_1",
    projectName: "Auth Service",
    title: "feat: add secure session state synchronization across regional endpoints",
    author: "mem_3",
    status: "open",
    branch: "feature/sync-regions",
    createdAt: "2026-06-29T10:00:00Z"
  },
  {
    id: "pr_2",
    projectId: "proj_2",
    projectName: "Payment Gateway",
    title: "fix: handle duplicate idempotency keys on payment retries",
    author: "mem_2",
    status: "merged",
    branch: "fix/stripe-idempotency",
    createdAt: "2026-06-25T14:30:00Z"
  }
];

// Helper to load/save
function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage`, e);
  }
}

// Service API
export const teamApi = {
  // Init database
  initialize() {
    if (!localStorage.getItem(STORAGE_KEYS.ORGANIZATION)) {
      setStorageItem(STORAGE_KEYS.ORGANIZATION, INITIAL_ORG);
      setStorageItem(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
      setStorageItem(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
      setStorageItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
      setStorageItem(STORAGE_KEYS.API_KEYS, INITIAL_API_KEYS);
      setStorageItem(STORAGE_KEYS.INTEGRATIONS, INITIAL_INTEGRATIONS);
      setStorageItem(STORAGE_KEYS.BILLING, INITIAL_BILLING);
      setStorageItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
      setStorageItem(STORAGE_KEYS.PULL_REQUESTS, INITIAL_PRS);
      // Copy defaults
      const rolePerms: Record<TeamRole, TeamPermission[]> = {} as any;
      Object.keys(DEFAULT_ROLE_CONFIGS).forEach((k) => {
        rolePerms[k as TeamRole] = [...DEFAULT_ROLE_CONFIGS[k as TeamRole].permissions];
      });
      setStorageItem(STORAGE_KEYS.ROLE_PERMISSIONS, rolePerms);
    }
  },

  // Organization
  getOrg(): Organization {
    return getStorageItem(STORAGE_KEYS.ORGANIZATION, INITIAL_ORG);
  },
  updateOrg(org: Organization): Organization {
    setStorageItem(STORAGE_KEYS.ORGANIZATION, org);
    return org;
  },

  // Members
  getMembers(): Member[] {
    return getStorageItem(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  },
  saveMembers(members: Member[]): void {
    setStorageItem(STORAGE_KEYS.MEMBERS, members);
  },
  addMember(member: Omit<Member, "id" | "joinedAt" | "projectRoles">): Member {
    const members = this.getMembers();
    const newMember: Member = {
      ...member,
      id: `mem_${Date.now()}`,
      joinedAt: new Date().toISOString(),
      projectRoles: {
        proj_1: "viewer",
        proj_2: "viewer",
        proj_3: "viewer"
      }
    };
    members.push(newMember);
    this.saveMembers(members);
    return newMember;
  },
  updateMember(updated: Member): Member {
    const members = this.getMembers();
    const idx = members.findIndex((m) => m.id === updated.id);
    if (idx !== -1) {
      members[idx] = updated;
      this.saveMembers(members);
    }
    return updated;
  },
  deleteMember(id: string): void {
    const members = this.getMembers();
    const filtered = members.filter((m) => m.id !== id);
    this.saveMembers(filtered);
  },

  // Projects
  getProjects(): Project[] {
    return getStorageItem(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  },
  saveProjects(projects: Project[]): void {
    setStorageItem(STORAGE_KEYS.PROJECTS, projects);
  },
  addProject(project: Omit<Project, "id" | "createdAt" | "revenue" | "memberCount">): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      ...project,
      id: `proj_${Date.now()}`,
      createdAt: new Date().toISOString(),
      revenue: Math.floor(Math.random() * 150000) + 10000,
      memberCount: 1
    };
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  },
  updateProject(updated: Project): Project {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.id === updated.id);
    if (idx !== -1) {
      projects[idx] = updated;
      this.saveProjects(projects);
    }
    return updated;
  },
  deleteProject(id: string): void {
    const projects = this.getProjects();
    const filtered = projects.filter((p) => p.id !== id);
    this.saveProjects(filtered);
  },

  // Audit Logs
  getAuditLogs(): AuditLogEntry[] {
    return getStorageItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(actor: Member, action: string, target: string, category: AuditLogEntry["category"], details?: string): AuditLogEntry {
    const logs = this.getAuditLogs();
    const newLog: AuditLogEntry = {
      id: `log_${Date.now()}`,
      actor: {
        id: actor.id,
        name: actor.name,
        email: actor.email,
        avatar: actor.avatar,
        role: actor.role
      },
      action,
      target,
      createdAt: new Date().toISOString(),
      category,
      details
    };
    logs.unshift(newLog); // Put newest first
    setStorageItem(STORAGE_KEYS.AUDIT_LOGS, logs);
    return newLog;
  },

  // API Keys
  getApiKeys(): ApiKey[] {
    return getStorageItem(STORAGE_KEYS.API_KEYS, INITIAL_API_KEYS);
  },
  saveApiKeys(keys: ApiKey[]): void {
    setStorageItem(STORAGE_KEYS.API_KEYS, keys);
  },
  createApiKey(name: string): ApiKey {
    const keys = this.getApiKeys();
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      key: `sk_live_${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      lastUsed: "Never",
      status: "active"
    };
    keys.unshift(newKey);
    this.saveApiKeys(keys);
    return newKey;
  },
  revokeApiKey(id: string): void {
    const keys = this.getApiKeys();
    const idx = keys.findIndex((k) => k.id === id);
    if (idx !== -1) {
      keys[idx].status = "revoked";
      this.saveApiKeys(keys);
    }
  },

  // Integrations
  getIntegrations(): Integration[] {
    return getStorageItem(STORAGE_KEYS.INTEGRATIONS, INITIAL_INTEGRATIONS);
  },
  toggleIntegration(id: string): Integration | null {
    const integrations = this.getIntegrations();
    const idx = integrations.findIndex((i) => i.id === id);
    if (idx !== -1) {
      integrations[idx].status = integrations[idx].status === "connected" ? "disconnected" : "connected";
      setStorageItem(STORAGE_KEYS.INTEGRATIONS, integrations);
      return integrations[idx];
    }
    return null;
  },

  // Billing
  getBilling(): BillingConfig {
    return getStorageItem(STORAGE_KEYS.BILLING, INITIAL_BILLING);
  },
  updateBilling(billing: BillingConfig): BillingConfig {
    setStorageItem(STORAGE_KEYS.BILLING, billing);
    return billing;
  },

  // Tasks
  getTasks(): Task[] {
    return getStorageItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },
  saveTasks(tasks: Task[]): void {
    setStorageItem(STORAGE_KEYS.TASKS, tasks);
  },
  addTask(task: Omit<Task, "id" | "projectName">): Task {
    const tasks = this.getTasks();
    const projects = this.getProjects();
    const proj = projects.find((p) => p.id === task.projectId);
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}`,
      projectName: proj ? proj.name : "Unknown Project"
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  },
  updateTaskStatus(id: string, status: Task["status"]): void {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      tasks[idx].status = status;
      this.saveTasks(tasks);
    }
  },

  // Pull Requests
  getPRs(): PullRequest[] {
    return getStorageItem(STORAGE_KEYS.PULL_REQUESTS, INITIAL_PRS);
  },
  savePRs(prs: PullRequest[]): void {
    setStorageItem(STORAGE_KEYS.PULL_REQUESTS, prs);
  },
  createPR(pr: Omit<PullRequest, "id" | "status" | "createdAt" | "projectName">): PullRequest {
    const prs = this.getPRs();
    const projects = this.getProjects();
    const proj = projects.find((p) => p.id === pr.projectId);
    const newPr: PullRequest = {
      ...pr,
      id: `pr_${Date.now()}`,
      status: "open",
      createdAt: new Date().toISOString(),
      projectName: proj ? proj.name : "Unknown Project"
    };
    prs.unshift(newPr);
    this.savePRs(prs);
    return newPr;
  },

  // Role Configurable Permissions Map
  getRolePermissions(): Record<TeamRole, TeamPermission[]> {
    const defaultPerms: Record<TeamRole, TeamPermission[]> = {} as any;
    Object.keys(DEFAULT_ROLE_CONFIGS).forEach((k) => {
      defaultPerms[k as TeamRole] = [...DEFAULT_ROLE_CONFIGS[k as TeamRole].permissions];
    });
    return getStorageItem(STORAGE_KEYS.ROLE_PERMISSIONS, defaultPerms);
  },
  updateRolePermissions(role: TeamRole, permissions: TeamPermission[]): Record<TeamRole, TeamPermission[]> {
    const current = this.getRolePermissions();
    current[role] = permissions;
    setStorageItem(STORAGE_KEYS.ROLE_PERMISSIONS, current);
    return current;
  }
};
