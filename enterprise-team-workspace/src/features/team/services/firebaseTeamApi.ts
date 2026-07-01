import { 
  doc, setDoc, getDoc, updateDoc, collection, 
  getDocs, query, where, deleteDoc, writeBatch
} from "firebase/firestore";
import { db } from "./firebase";
import { Organization, Project, ApiKey, Integration, BillingConfig } from "../types/team";
import { Member } from "../types/member";
import { Task, PullRequest, AuditLogEntry } from "../types/activity";
import { TeamRole, TeamPermission, ProjectRole } from "../types/role";
import { DEFAULT_ROLE_CONFIGS } from "../constants/permissions";

export interface UserProfile {
  uid: string;
  nickname: string;
  email: string;
  teamId: string | null;
  role?: TeamRole;
}

const INITIAL_PROJECTS: Omit<Project, "createdAt">[] = [
  {
    id: "proj_1",
    name: "Auth Service",
    description: "Next-gen OAuth2 federated single sign-on and verification cluster.",
    status: "active",
    revenue: 120000,
    memberCount: 5,
    tags: ["Security", "OAuth", "Core-Service"]
  },
  {
    id: "proj_2",
    name: "Payment Gateway",
    description: "Stripe-connected high-throughput multi-currency settlement processor.",
    status: "active",
    revenue: 350000,
    memberCount: 4,
    tags: ["Fintech", "Stripe", "Compliance"]
  },
  {
    id: "proj_3",
    name: "Mobile App Core",
    description: "React Native consumer-facing terminal application for iOS and Android.",
    status: "active",
    revenue: 85000,
    memberCount: 3,
    tags: ["Frontend", "React-Native", "App-Store"]
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

const INITIAL_TASKS: Omit<Task, "dueDate">[] = [
  {
    id: "task_1",
    projectId: "proj_1",
    projectName: "Auth Service",
    title: "Implement FIDO2 WebAuthn multi-factor challenge",
    status: "in-progress",
    assignedTo: "owner_id", // will be replaced dynamically
    priority: "high"
  },
  {
    id: "task_2",
    projectId: "proj_1",
    projectName: "Auth Service",
    title: "Review JWT symmetric encryption rotation interval",
    status: "todo",
    assignedTo: "owner_id",
    priority: "medium"
  },
  {
    id: "task_3",
    projectId: "proj_2",
    projectName: "Payment Gateway",
    title: "Migrate deprecated Stripe API endpoints to v2024-04-12",
    status: "review",
    assignedTo: "owner_id",
    priority: "high"
  },
  {
    id: "task_4",
    projectId: "proj_3",
    projectName: "Mobile App Core",
    title: "Fix deep linking verification triggers on iOS 17.4+",
    status: "done",
    assignedTo: "owner_id",
    priority: "high"
  }
];

const INITIAL_PRS: Omit<PullRequest, "createdAt">[] = [
  {
    id: "pr_1",
    projectId: "proj_1",
    projectName: "Auth Service",
    title: "feat: add secure session state synchronization across regional endpoints",
    author: "owner_id",
    status: "open",
    branch: "feature/sync-regions"
  },
  {
    id: "pr_2",
    projectId: "proj_2",
    projectName: "Payment Gateway",
    title: "fix: handle duplicate idempotency keys on payment retries",
    author: "owner_id",
    status: "merged",
    branch: "fix/stripe-idempotency"
  }
];

const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: "key_1",
    name: "Production Gateway Live Key",
    key: "sk_live_51Nx...A98q1",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: "Active now",
    status: "active"
  },
  {
    id: "key_2",
    name: "Developer Staging Sandpit",
    key: "sk_test_51Nx...D61rZ",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: "2 minutes ago",
    status: "active"
  }
];

export const firebaseTeamApi = {
  // --- User Profiles ---
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  },

  async createUserProfile(uid: string, nickname: string, email: string, role?: TeamRole): Promise<UserProfile> {
    const profile: UserProfile = {
      uid,
      nickname,
      email,
      teamId: null,
      role: role || "developer"
    };
    await setDoc(doc(db, "users", uid), profile);
    return profile;
  },

  // --- Team Operations ---
  async createTeam(
    teamName: string, 
    userUid: string, 
    userNickname: string, 
    userEmail: string,
    predefinedTeamId?: string,
    preferredRole?: TeamRole
  ): Promise<string> {
    const teamId = predefinedTeamId || "team_" + Math.random().toString(36).substring(2, 10);
    // 6 digit random uppercase invite code
    const inviteCode = "SYN-" + Math.floor(100000 + Math.random() * 900000).toString();

    const rolePerms: Record<TeamRole, TeamPermission[]> = {} as any;
    Object.keys(DEFAULT_ROLE_CONFIGS).forEach((k) => {
      rolePerms[k as TeamRole] = [...DEFAULT_ROLE_CONFIGS[k as TeamRole].permissions];
    });

    const billing: BillingConfig = {
      planName: "Enterprise",
      amount: 499.00,
      nextInvoice: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      cardLast4: "9824",
      billingEmail: userEmail
    };

    const teamData = {
      id: teamId,
      name: teamName,
      logo: "⚡",
      domain: teamName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".io",
      createdAt: new Date().toISOString(),
      inviteCode,
      billing,
      rolePermissions: rolePerms
    };

    // 1. Create main Team document
    await setDoc(doc(db, "teams", teamId), teamData);

    const mappedProjRole: ProjectRole = 
      (preferredRole === "owner" || preferredRole === "admin") ? "owner" : 
      (preferredRole === "viewer") ? "viewer" : "developer";

    // 2. Create owner Member document
    const ownerMember: Member = {
      id: userUid,
      name: userNickname,
      email: userEmail,
      avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80`,
      role: preferredRole || "owner",
      status: "active",
      joinedAt: new Date().toISOString(),
      department: preferredRole === "admin" ? "Management" : preferredRole === "developer" ? "Engineering" : preferredRole === "worker" ? "Engineering" : "Executive",
      lastActive: "Active now",
      projectRoles: {
        proj_1: mappedProjRole,
        proj_2: mappedProjRole,
        proj_3: mappedProjRole
      }
    };
    await setDoc(doc(db, "teams", teamId, "members", userUid), ownerMember);

    // 3. Populate default subcollections using batch write for speed
    const batch = writeBatch(db);

    // Seed default simulated members
    const simulatedMembers: Member[] = [
      {
        id: "mem_admin",
        name: "John Carter (Admin)",
        email: "john.carter@synthetix.io",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
        role: "admin",
        status: "active",
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        department: "Operations",
        lastActive: "15 minutes ago",
        projectRoles: { proj_1: "maintainer", proj_2: "maintainer", proj_3: "viewer" }
      },
      {
        id: "mem_developer",
        name: "Mike Tyson (Dev)",
        email: "mike.t@synthetix.io",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
        role: "developer",
        status: "active",
        joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        department: "Engineering",
        lastActive: "3 minutes ago",
        projectRoles: { proj_1: "developer", proj_2: "viewer", proj_3: "developer" }
      },
      {
        id: "mem_security",
        name: "Sarah Jenkins (Security)",
        email: "sarah.j@synthetix.io",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
        role: "security",
        status: "active",
        joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        department: "Security & Compliance",
        lastActive: "2 hours ago",
        projectRoles: { proj_1: "viewer", proj_2: "maintainer", proj_3: "viewer" }
      },
      {
        id: "mem_manager",
        name: "Robert Lewandowski (Manager)",
        email: "robert.l@synthetix.io",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
        role: "manager",
        status: "active",
        joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        department: "Product Management",
        lastActive: "1 day ago",
        projectRoles: { proj_1: "maintainer", proj_2: "maintainer", proj_3: "owner" }
      },
      {
        id: "mem_viewer",
        name: "Kevin De Bruyne (Viewer)",
        email: "kevin.db@synthetix.io",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
        role: "viewer",
        status: "active",
        joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        department: "Auditing & Compliance",
        lastActive: "3 days ago",
        projectRoles: { proj_1: "viewer", proj_2: "viewer", proj_3: "viewer" }
      },
      {
        id: "mem_worker",
        name: "Alex Johnson (Programmer)",
        email: "alex.j@synthetix.io",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
        role: "worker",
        status: "active",
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        department: "Dział Operacyjny",
        lastActive: "Active now",
        projectRoles: { proj_1: "developer", proj_2: "developer", proj_3: "viewer" }
      }
    ];

    simulatedMembers.forEach((m) => {
      batch.set(doc(db, "teams", teamId, "members", m.id), m);
    });

    // Projects
    INITIAL_PROJECTS.forEach((proj) => {
      const projRef = doc(db, "teams", teamId, "projects", proj.id);
      batch.set(projRef, {
        ...proj,
        createdAt: new Date().toISOString()
      });
    });

    // Integrations
    INITIAL_INTEGRATIONS.forEach((int) => {
      const intRef = doc(db, "teams", teamId, "integrations", int.id);
      batch.set(intRef, int);
    });

    // Tasks
    INITIAL_TASKS.forEach((task) => {
      const taskRef = doc(db, "teams", teamId, "tasks", task.id);
      batch.set(taskRef, {
        ...task,
        assignedTo: userUid,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      });
    });

    // PRs
    INITIAL_PRS.forEach((pr) => {
      const prRef = doc(db, "teams", teamId, "prs", pr.id);
      batch.set(prRef, {
        ...pr,
        author: userUid,
        createdAt: new Date().toISOString()
      });
    });

    // API Keys
    INITIAL_API_KEYS.forEach((key) => {
      const keyRef = doc(db, "teams", teamId, "api_keys", key.id);
      batch.set(keyRef, key);
    });

    // Audit logs
    const logId = "log_" + Date.now();
    const logRef = doc(db, "teams", teamId, "audit_logs", logId);
    const initialLog: AuditLogEntry = {
      id: logId,
      actor: {
        id: userUid,
        name: userNickname,
        email: userEmail,
        avatar: ownerMember.avatar,
        role: "owner"
      },
      action: "created workspace",
      target: `${teamName} Enterprise Cluster`,
      createdAt: new Date().toISOString(),
      category: "settings",
      details: "Initialized team structure, database models, and default role-based clearances."
    };
    batch.set(logRef, initialLog);

    await batch.commit();

    // 4. Update user profile to link to teamId
    await updateDoc(doc(db, "users", userUid), { teamId });

    return teamId;
  },

  async joinTeam(
    inviteCode: string, 
    userUid: string, 
    userNickname: string, 
    userEmail: string,
    preferredRole?: TeamRole
  ): Promise<string> {
    // Query teams collection for inviteCode
    const teamsRef = collection(db, "teams");
    const q = query(teamsRef, where("inviteCode", "==", inviteCode.trim()));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error("Invalid invite code. Workspace cluster not found.");
    }

    const teamDoc = snap.docs[0];
    const teamId = teamDoc.id;

    // Check if member already exists
    const memberRef = doc(db, "teams", teamId, "members", userUid);
    const memberSnap = await getDoc(memberRef);

    if (!memberSnap.exists()) {
      const activeRole = preferredRole || "developer";
      const mappedProjRole: ProjectRole = 
        (activeRole === "owner" || activeRole === "admin") ? "owner" : 
        (activeRole === "viewer") ? "viewer" : "developer";

      const newMember: Member = {
        id: userUid,
        name: userNickname,
        email: userEmail,
        avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 100) + 1500000000000}?auto=format&fit=crop&w=150&h=150&q=80`,
        role: activeRole,
        status: "active",
        joinedAt: new Date().toISOString(),
        department: activeRole === "admin" ? "Management" : activeRole === "developer" ? "Engineering" : activeRole === "worker" ? "Engineering" : "Executive",
        lastActive: "Active now",
        projectRoles: {
          proj_1: mappedProjRole,
          proj_2: "viewer",
          proj_3: mappedProjRole
        }
      };

      // 1. Create member in team subcollection
      await setDoc(memberRef, newMember);

      // 2. Add an Audit Log
      const logId = "log_" + Date.now();
      const logRef = doc(db, "teams", teamId, "audit_logs", logId);
      const joinLog: AuditLogEntry = {
        id: logId,
        actor: {
          id: userUid,
          name: userNickname,
          email: userEmail,
          avatar: newMember.avatar,
          role: activeRole
        },
        action: "joined workspace",
        target: `Workspace via invite code`,
        createdAt: new Date().toISOString(),
        category: "member",
        details: `Assigned standard ${activeRole} project clearance settings.`
      };
      await setDoc(logRef, joinLog);
    }

    // 3. Update user profile
    await updateDoc(doc(db, "users", userUid), { teamId });

    return teamId;
  },

  // --- Dynamic updates helper ---
  async addAuditLog(
    teamId: string, 
    actor: Member, 
    action: string, 
    target: string, 
    category: AuditLogEntry["category"], 
    details?: string
  ): Promise<void> {
    const logId = "log_" + Date.now();
    const logRef = doc(db, "teams", teamId, "audit_logs", logId);
    const entry: AuditLogEntry = {
      id: logId,
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
      details: details || ""
    };
    await setDoc(logRef, entry);
  }
};
