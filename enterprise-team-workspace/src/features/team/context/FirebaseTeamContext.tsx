import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  doc, 
  onSnapshot, 
  collection, 
  updateDoc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  writeBatch
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { firebaseTeamApi, UserProfile } from "../services/firebaseTeamApi";
import { Organization, Project, ApiKey, Integration, BillingConfig } from "../types/team";
import { Member } from "../types/member";
import { Task, PullRequest, AuditLogEntry, RepoFile, CodeAssignment, KbArticle } from "../types/activity";
import { TeamRole, TeamPermission } from "../types/role";
import { toast } from "sonner";

interface FirebaseTeamContextType {
  // Auth state
  user: User | null;
  profile: UserProfile | null;
  authLoading: boolean;
  
  // Real-time team state
  teamId: string | null;
  org: Organization | null;
  members: Member[];
  projects: Project[];
  apiKeys: ApiKey[];
  integrations: Integration[];
  billing: BillingConfig | null;
  tasks: Task[];
  prs: PullRequest[];
  rolePermissions: Record<TeamRole, TeamPermission[]>;
  auditLogs: AuditLogEntry[];
  repoFiles: RepoFile[];
  codeAssignments: CodeAssignment[];
  kbArticles: KbArticle[];
  activeMemberId: string;
  activeMember: Member | null;
  teamLoading: boolean;

  // Auth Operations
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname: string, preferredRole?: TeamRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Team Operations
  createWorkspace: (teamName: string, isDemo?: boolean) => Promise<void>;
  joinWorkspace: (inviteCode: string) => Promise<void>;
  changeActiveMember: (id: string) => void;
  leaveWorkspace: () => Promise<void>;

  // CRUD mutations
  inviteMember: (name: string, email: string, role: TeamRole, department: string) => Promise<void>;
  updateMember: (member: Member) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  createProject: (name: string, description: string, tags: string[]) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createApiKey: (name: string) => Promise<void>;
  revokeApiKey: (id: string) => Promise<void>;
  toggleIntegration: (id: string) => Promise<void>;
  updateBilling: (config: BillingConfig) => Promise<void>;
  updateTaskStatus: (id: string, status: Task["status"]) => Promise<void>;
  addTask: (task: Omit<Task, "id" | "projectName">) => Promise<void>;
  createPR: (pr: Omit<PullRequest, "id" | "status" | "createdAt" | "projectName">) => Promise<void>;
  updateRolePermissions: (role: TeamRole, permissions: TeamPermission[]) => Promise<void>;
  updateOrg: (newOrg: Organization) => Promise<void>;
  resetData: () => Promise<void>;
  logAction: (action: string, target: string, category: AuditLogEntry["category"], details?: string) => Promise<void>;
  updateRepoFile: (projectId: string, path: string, content: string) => Promise<void>;
  createCodeAssignment: (assignment: Omit<CodeAssignment, "id" | "status" | "createdAt">) => Promise<void>;
  updateCodeAssignment: (assignment: CodeAssignment) => Promise<void>;
  submitCodeAssignment: (id: string, editedContent: string) => Promise<void>;
  mergeCodeAssignment: (id: string) => Promise<void>;
  rejectCodeAssignment: (id: string, feedback: string) => Promise<void>;
  createKbArticle: (art: Omit<KbArticle, "id" | "lastUpdated" | "author" | "readTime">) => Promise<void>;
  updateKbArticle: (art: KbArticle) => Promise<void>;
  deleteKbArticle: (id: string) => Promise<void>;
}

const FirebaseTeamContext = createContext<FirebaseTeamContextType | undefined>(undefined);

export const FirebaseTeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Team state
  const [teamId, setTeamId] = useState<string | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [billing, setBilling] = useState<BillingConfig | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<TeamRole, TeamPermission[]>>({} as any);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [repoFiles, setRepoFiles] = useState<RepoFile[]>([]);
  const [codeAssignments, setCodeAssignments] = useState<CodeAssignment[]>([]);
  const [kbArticles, setKbArticles] = useState<KbArticle[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string>("");
  const [teamLoading, setTeamLoading] = useState(false);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          // Fetch custom user profile with local resilience fallbacks
          let userProfile: UserProfile | null = null;
          try {
            userProfile = await firebaseTeamApi.getUserProfile(firebaseUser.uid);
            if (!userProfile) {
              // Fallback if auth exists but no document (should not normally happen if signed up via UI)
              userProfile = await firebaseTeamApi.createUserProfile(
                firebaseUser.uid,
                firebaseUser.email?.split("@")[0] || "Guest",
                firebaseUser.email || ""
              );
            }
            // Save to offline cache
            localStorage.setItem("last_known_profile_" + firebaseUser.uid, JSON.stringify(userProfile));
            if (userProfile.teamId) {
              localStorage.setItem("last_known_team_id_" + firebaseUser.uid, userProfile.teamId);
            }
          } catch (profileErr: any) {
            console.warn("Could not fetch user profile from server, trying offline cache:", profileErr);
            const cached = localStorage.getItem("last_known_profile_" + firebaseUser.uid);
            if (cached) {
              try {
                userProfile = JSON.parse(cached);
              } catch (_) {}
            }
            if (!userProfile) {
              // Construct a temporary offline profile using Auth info
              const cachedTeamId = localStorage.getItem("last_known_team_id_" + firebaseUser.uid) || null;
              userProfile = {
                uid: firebaseUser.uid,
                nickname: firebaseUser.email?.split("@")[0] || "Guest",
                email: firebaseUser.email || "",
                teamId: cachedTeamId
              };
            }
            toast.error("Wykryto tryb offline lub opóźnienie bazy. Używam lokalnej pamięci podręcznej.");
          }

          setProfile(userProfile);
          setTeamId(userProfile.teamId);
          setActiveMemberId(firebaseUser.uid); // Active member id starts as the logged in user's UID!
        } else {
          setProfile(null);
          setTeamId(null);
          setOrg(null);
          setMembers([]);
          setProjects([]);
          setApiKeys([]);
          setIntegrations([]);
          setBilling(null);
          setTasks([]);
          setPrs([]);
          setRolePermissions({} as any);
          setAuditLogs([]);
          setRepoFiles([]);
          setCodeAssignments([]);
          setActiveMemberId("");
        }
      } catch (err) {
        console.error("Error in onAuthStateChanged: ", err);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Team listeners once teamId is available
  useEffect(() => {
    if (!teamId) {
      setOrg(null);
      setTeamLoading(false);
      return;
    }

    setTeamLoading(true);

    // Main doc listener
    const unsubOrg = onSnapshot(doc(db, "teams", teamId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setOrg({
          id: data.id,
          name: data.name,
          logo: data.logo,
          domain: data.domain,
          createdAt: data.createdAt,
          inviteCode: data.inviteCode
        });
        setBilling(data.billing || null);
        setRolePermissions(data.rolePermissions || ({} as any));
      }
      setTeamLoading(false);
    });

    // Subcollections
    const unsubMembers = onSnapshot(collection(db, "teams", teamId, "members"), (snap) => {
      const list: Member[] = [];
      snap.forEach((d) => list.push(d.data() as Member));
      setMembers(list);
    });

    const unsubProjects = onSnapshot(collection(db, "teams", teamId, "projects"), (snap) => {
      const list: Project[] = [];
      snap.forEach((d) => list.push(d.data() as Project));
      setProjects(list);
    });

    const unsubTasks = onSnapshot(collection(db, "teams", teamId, "tasks"), (snap) => {
      const list: Task[] = [];
      snap.forEach((d) => list.push(d.data() as Task));
      setTasks(list);
    });

    const unsubPrs = onSnapshot(collection(db, "teams", teamId, "prs"), (snap) => {
      const list: PullRequest[] = [];
      snap.forEach((d) => list.push(d.data() as PullRequest));
      setPrs(list);
    });

    const unsubIntegrations = onSnapshot(collection(db, "teams", teamId, "integrations"), (snap) => {
      const list: Integration[] = [];
      snap.forEach((d) => list.push(d.data() as Integration));
      setIntegrations(list);
    });

    const unsubKeys = onSnapshot(collection(db, "teams", teamId, "api_keys"), (snap) => {
      const list: ApiKey[] = [];
      snap.forEach((d) => list.push(d.data() as ApiKey));
      setApiKeys(list);
    });

    const unsubLogs = onSnapshot(collection(db, "teams", teamId, "audit_logs"), (snap) => {
      const list: AuditLogEntry[] = [];
      snap.forEach((d) => list.push(d.data() as AuditLogEntry));
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAuditLogs(list);
    });

    const unsubRepoFiles = onSnapshot(collection(db, "teams", teamId, "repo_files"), (snap) => {
      const list: RepoFile[] = [];
      snap.forEach((d) => list.push(d.data() as RepoFile));
      setRepoFiles(list);
    });

    const unsubAssignments = onSnapshot(collection(db, "teams", teamId, "code_assignments"), (snap) => {
      const list: CodeAssignment[] = [];
      snap.forEach((d) => list.push(d.data() as CodeAssignment));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setCodeAssignments(list);
    });

    const unsubKbArticles = onSnapshot(collection(db, "teams", teamId, "knowledge_base"), (snap) => {
      const list: KbArticle[] = [];
      snap.forEach((d) => list.push(d.data() as KbArticle));
      setKbArticles(list);
    });

    return () => {
      unsubOrg();
      unsubMembers();
      unsubProjects();
      unsubTasks();
      unsubPrs();
      unsubIntegrations();
      unsubKeys();
      unsubLogs();
      unsubRepoFiles();
      unsubAssignments();
      unsubKbArticles();
    };
  }, [teamId]);

  // Active member helper
  const activeMember = members.find((m) => m.id === activeMemberId) || members[0] || null;

  // --- Auth operations ---
  const login = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setAuthLoading(false);
      throw e;
    }
  };

  const signup = async (email: string, password: string, nickname: string, preferredRole?: TeamRole) => {
    setAuthLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await firebaseTeamApi.createUserProfile(res.user.uid, nickname, email, preferredRole);
    } catch (e: any) {
      setAuthLoading(false);
      throw e;
    }
  };

  const loginWithGoogle = async () => {
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      let userProfile = await firebaseTeamApi.getUserProfile(res.user.uid);
      if (!userProfile) {
        userProfile = await firebaseTeamApi.createUserProfile(
          res.user.uid,
          res.user.displayName || res.user.email?.split("@")[0] || "User",
          res.user.email || ""
        );
      }
      setProfile(userProfile);
      setTeamId(userProfile.teamId);
      setActiveMemberId(res.user.uid);
    } catch (e: any) {
      setAuthLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // --- Workspace setup operations ---
  const createWorkspace = async (teamName: string, isDemo?: boolean) => {
    if (!user || !profile) return;
    setTeamLoading(true);
    try {
      if (isDemo) {
        // Fast/instant path for Demo mode:
        const demoTeamId = "team_demo_" + Math.random().toString(36).substring(2, 10);
        
        // Optimistically set the state immediately to trigger instant redirect
        setTeamId(demoTeamId);
        setProfile((prev) => prev ? { ...prev, teamId: demoTeamId } : null);
        setTeamLoading(false);

        // Run the actual firestore creation asynchronously in the background so there's zero wait
        firebaseTeamApi.createTeam(teamName, user.uid, profile.nickname, user.email || "", demoTeamId, profile.role)
          .then(() => {
            console.log("Demo workspace successfully seeded in background");
          })
          .catch((err) => {
            console.error("Background seeding error:", err);
          });
        return;
      }

      const newTeamId = await firebaseTeamApi.createTeam(teamName, user.uid, profile.nickname, user.email || "", undefined, profile.role);
      setTeamId(newTeamId);
      setProfile((prev) => prev ? { ...prev, teamId: newTeamId } : null);
    } catch (e) {
      setTeamLoading(false);
      throw e;
    }
  };

  const joinWorkspace = async (inviteCode: string) => {
    if (!user || !profile) return;
    setTeamLoading(true);
    try {
      const newTeamId = await firebaseTeamApi.joinTeam(inviteCode, user.uid, profile.nickname, user.email || "", profile.role);
      setTeamId(newTeamId);
      setProfile((prev) => prev ? { ...prev, teamId: newTeamId } : null);
    } catch (e) {
      setTeamLoading(false);
      throw e;
    }
  };

  const changeActiveMember = (id: string) => {
    setActiveMemberId(id);
  };

  const leaveWorkspace = async () => {
    if (!user) return;
    // Remove teamId from profile
    await updateDoc(doc(db, "users", user.uid), { teamId: null });
    setTeamId(null);
    setProfile((prev) => prev ? { ...prev, teamId: null } : null);
  };

  // --- Firestore CRUD operations ---
  const inviteMember = async (name: string, email: string, role: TeamRole, department: string) => {
    if (!teamId || !activeMember) return;
    const memberId = "mem_" + Math.random().toString(36).substring(2, 10);
    const newMember: Member = {
      id: memberId,
      name,
      email,
      avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 100) + 1500000000000}?auto=format&fit=crop&w=150&h=150&q=80`,
      role,
      status: "active",
      joinedAt: new Date().toISOString(),
      department: department || "Engineering",
      lastActive: "Never active",
      projectRoles: {
        proj_1: "viewer",
        proj_2: "viewer",
        proj_3: "viewer"
      }
    };

    await setDoc(doc(db, "teams", teamId, "members", memberId), newMember);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "invited member",
      `${name} (${email}) as ${role}`,
      "member",
      `Assigned standard ${department} clearance configurations.`
    );
  };

  const updateMember = async (member: Member) => {
    if (!teamId || !activeMember) return;
    await setDoc(doc(db, "teams", teamId, "members", member.id), member);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "updated member",
      `${member.name} (${member.role})`,
      "member",
      `Synchronized new clearance credentials and project roles.`
    );
  };

  const deleteMember = async (id: string) => {
    if (!teamId || !activeMember) return;
    const mDoc = doc(db, "teams", teamId, "members", id);
    const snap = await getDoc(mDoc);
    if (!snap.exists()) return;
    const memberData = snap.data() as Member;

    await deleteDoc(mDoc);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "removed member",
      `${memberData.name}`,
      "member",
      "Revoked all workspace tokens and key registrations."
    );

    toast.success(`Usunięto członka "${memberData.name}"`, {
      action: {
        label: "Cofnij (10s)",
        onClick: async () => {
          try {
            await setDoc(mDoc, memberData);
            await firebaseTeamApi.addAuditLog(
              teamId,
              activeMember,
              "restored member",
              `${memberData.name}`,
              "member",
              "Restored member identity, clearances, and project privileges."
            );
            toast.success(`Przywrócono członka "${memberData.name}"`);
          } catch (err: any) {
            toast.error("Błąd przywracania: " + err.message);
          }
        }
      },
      duration: 10000
    });
  };

  const createProject = async (name: string, description: string, tags: string[]) => {
    if (!teamId || !activeMember) return;
    const id = "proj_" + Math.random().toString(36).substring(2, 10);
    const newProj: Project = {
      id,
      name,
      description,
      status: "active",
      createdAt: new Date().toISOString(),
      revenue: Math.floor(Math.random() * 150000) + 10000,
      memberCount: 1,
      tags
    };

    await setDoc(doc(db, "teams", teamId, "projects", id), newProj);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "created project",
      `${name}`,
      "project",
      `Created project repository with tags: ${tags.join(", ")}`
    );
  };

  const updateProject = async (project: Project) => {
    if (!teamId || !activeMember) return;
    await setDoc(doc(db, "teams", teamId, "projects", project.id), project);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "updated project",
      `${project.name}`,
      "project",
      "Modified repository metadata settings."
    );
  };

  const deleteProject = async (id: string) => {
    if (!teamId || !activeMember) return;
    const pDoc = doc(db, "teams", teamId, "projects", id);
    const snap = await getDoc(pDoc);
    if (!snap.exists()) return;
    const projectData = snap.data() as Project;

    await deleteDoc(pDoc);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "deleted project",
      `${projectData.name}`,
      "project",
      "Purged project source artifacts from cloud telemetry system."
    );

    toast.success(`Usunięto projekt "${projectData.name}"`, {
      action: {
        label: "Cofnij (10s)",
        onClick: async () => {
          try {
            await setDoc(pDoc, projectData);
            await firebaseTeamApi.addAuditLog(
              teamId,
              activeMember,
              "restored project",
              `${projectData.name}`,
              "project",
              "Restored project repository and telemetry markers."
            );
            toast.success(`Przywrócono projekt "${projectData.name}"`);
          } catch (err: any) {
            toast.error("Błąd przywracania: " + err.message);
          }
        }
      },
      duration: 10000
    });
  };

  const createApiKey = async (name: string) => {
    if (!teamId || !activeMember) return;
    const id = "key_" + Math.random().toString(36).substring(2, 10);
    const key = `sk_live_${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`;
    const newKey: ApiKey = {
      id,
      name,
      key,
      createdAt: new Date().toISOString(),
      lastUsed: "Never",
      status: "active"
    };

    await setDoc(doc(db, "teams", teamId, "api_keys", id), newKey);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "created api_key",
      `${name}`,
      "security",
      "Authorized scoped client access credentials for API operations."
    );
  };

  const revokeApiKey = async (id: string) => {
    if (!teamId || !activeMember) return;
    const kDoc = doc(db, "teams", teamId, "api_keys", id);
    const snap = await getDoc(kDoc);
    const name = snap.exists() ? snap.data().name : "Unknown Key";

    await updateDoc(kDoc, { status: "revoked" });
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "revoked api_key",
      `${name}`,
      "security",
      "Blacklisted token ID. Access is immediately denied across edge clusters."
    );
  };

  const toggleIntegration = async (id: string) => {
    if (!teamId || !activeMember) return;
    const int = integrations.find((i) => i.id === id);
    if (!int) return;

    const newStatus = int.status === "connected" ? "disconnected" : "connected";
    await updateDoc(doc(db, "teams", teamId, "integrations", id), { status: newStatus });
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      newStatus === "connected" ? "enabled integration" : "disabled integration",
      `${int.name}`,
      "settings",
      newStatus === "connected" 
        ? "Connected webhook callback channel and granted read access." 
        : "Severed webhook listener connection and cleared credentials."
    );
  };

  const updateBilling = async (config: BillingConfig) => {
    if (!teamId || !activeMember) return;
    await updateDoc(doc(db, "teams", teamId), { billing: config });
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "updated billing",
      `Payment config for ${config.planName}`,
      "settings",
      `Synchronized invoice target to: ${config.billingEmail}`
    );
  };

  const updateTaskStatus = async (id: string, status: Task["status"]) => {
    if (!teamId || !activeMember) return;
    const tDoc = doc(db, "teams", teamId, "tasks", id);
    const snap = await getDoc(tDoc);
    const taskTitle = snap.exists() ? snap.data().title : "Task";

    await updateDoc(tDoc, { status });
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "updated task status",
      `"${taskTitle}" → ${status}`,
      "project",
      "Updated project tracking status on standard scrum canvas."
    );
  };

  const addTask = async (task: Omit<Task, "id" | "projectName">) => {
    if (!teamId || !activeMember) return;
    const id = "task_" + Math.random().toString(36).substring(2, 10);
    const proj = projects.find((p) => p.id === task.projectId);
    const projectName = proj ? proj.name : "Unknown Project";

    const newTask: Task = {
      ...task,
      id,
      projectName,
      dueDate: task.dueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    };

    await setDoc(doc(db, "teams", teamId, "tasks", id), newTask);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "added task",
      `"${task.title}" under ${projectName}`,
      "project",
      `Assigned task with priority: ${task.priority}`
    );
  };

  const createPR = async (pr: Omit<PullRequest, "id" | "status" | "createdAt" | "projectName">) => {
    if (!teamId || !activeMember) return;
    const id = "pr_" + Math.random().toString(36).substring(2, 10);
    const proj = projects.find((p) => p.id === pr.projectId);
    const projectName = proj ? proj.name : "Unknown Project";

    const newPr: PullRequest = {
      ...pr,
      id,
      status: "open",
      createdAt: new Date().toISOString(),
      projectName
    };

    await setDoc(doc(db, "teams", teamId, "prs", id), newPr);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "opened pull_request",
      `PR "${pr.title}" inside ${projectName}`,
      "project",
      `Tracked code changes on upstream branch: ${pr.branch}`
    );
  };

  const updateRolePermissions = async (role: TeamRole, permissions: TeamPermission[]) => {
    if (!teamId || !activeMember) return;
    const updatedRolePerms = { ...rolePermissions, [role]: permissions };
    await updateDoc(doc(db, "teams", teamId), { rolePermissions: updatedRolePerms });
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "updated role permissions",
      `Modified capabilities for ${role} role`,
      "security",
      "Applied new authorization settings across all active users with this role."
    );
  };

  const updateOrg = async (newOrg: Organization) => {
    if (!teamId || !activeMember) return;
    await updateDoc(doc(db, "teams", teamId), {
      name: newOrg.name,
      logo: newOrg.logo,
      domain: newOrg.domain
    });
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "updated organization configurations",
      `${newOrg.name}`,
      "settings",
      `Renamed corporate domain structure to: ${newOrg.domain}`
    );
  };

  const resetData = async () => {
    if (!teamId || !activeMember || !user) return;
    // Clears and sets default state in Firestore
    const batch = writeBatch(db);

    // Delete subcollections first
    // Note: Free tier firestore delete collections must be done document by document
    projects.forEach((p) => batch.delete(doc(db, "teams", teamId, "projects", p.id)));
    tasks.forEach((t) => batch.delete(doc(db, "teams", teamId, "tasks", t.id)));
    prs.forEach((pr) => batch.delete(doc(db, "teams", teamId, "prs", pr.id)));
    apiKeys.forEach((key) => batch.delete(doc(db, "teams", teamId, "api_keys", key.id)));
    integrations.forEach((int) => batch.delete(doc(db, "teams", teamId, "integrations", int.id)));
    auditLogs.forEach((log) => batch.delete(doc(db, "teams", teamId, "audit_logs", log.id)));
    repoFiles.forEach((f) => batch.delete(doc(db, "teams", teamId, "repo_files", f.id)));
    codeAssignments.forEach((c) => batch.delete(doc(db, "teams", teamId, "code_assignments", c.id)));
    kbArticles.forEach((art) => batch.delete(doc(db, "teams", teamId, "knowledge_base", art.id)));

    // Reset members (delete all except current logged-in user)
    members.forEach((m) => {
      if (m.id !== user.uid) {
        batch.delete(doc(db, "teams", teamId, "members", m.id));
      }
    });

    // Re-seed simulated members
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

    // Re-initialize default collections
    const defaults = [
      { id: "proj_1", name: "Auth Service", description: "Next-gen OAuth2 federated single sign-on and verification cluster.", status: "active", revenue: 120000, memberCount: 5, tags: ["Security", "OAuth", "Core-Service"] },
      { id: "proj_2", name: "Payment Gateway", description: "Stripe-connected high-throughput multi-currency settlement processor.", status: "active", revenue: 350000, memberCount: 4, tags: ["Fintech", "Stripe", "Compliance"] },
      { id: "proj_3", name: "Mobile App Core", description: "React Native consumer-facing terminal application for iOS and Android.", status: "active", revenue: 85000, memberCount: 3, tags: ["Frontend", "React-Native", "App-Store"] }
    ];

    defaults.forEach((proj) => {
      batch.set(doc(db, "teams", teamId, "projects", proj.id), {
        ...proj,
        createdAt: new Date().toISOString()
      });
    });

    const ints = [
      { id: "int_1", name: "Slack Connector", description: "Sends automated build notifications and task assignments to slack channels.", logo: "💬", status: "connected" },
      { id: "int_2", name: "GitHub Enterprise", description: "Enables single-direction PR synchronization, status checks, and log mapping.", logo: "🐙", status: "connected" },
      { id: "int_3", name: "Google Drive Backup", description: "Hourly automatic binary logs and static resource backups.", logo: "📁", status: "disconnected" },
      { id: "int_4", name: "Amazon Web Services", description: "Deploys lambda clusters directly from merged release branches.", logo: "☁️", status: "connected" }
    ];

    ints.forEach((int) => {
      batch.set(doc(db, "teams", teamId, "integrations", int.id), int);
    });

    const tsks = [
      { id: "task_1", projectId: "proj_1", projectName: "Auth Service", title: "Implement FIDO2 WebAuthn multi-factor challenge", status: "in-progress", assignedTo: user.uid, priority: "high" },
      { id: "task_2", projectId: "proj_1", projectName: "Auth Service", title: "Review JWT symmetric encryption rotation interval", status: "todo", assignedTo: user.uid, priority: "medium" },
      { id: "task_3", projectId: "proj_2", projectName: "Payment Gateway", title: "Migrate deprecated Stripe API endpoints to v2024-04-12", status: "review", assignedTo: user.uid, priority: "high" },
      { id: "task_4", projectId: "proj_3", projectName: "Mobile App Core", title: "Fix deep linking verification triggers on iOS 17.4+", status: "done", assignedTo: user.uid, priority: "high" }
    ];

    tsks.forEach((task) => {
      batch.set(doc(db, "teams", teamId, "tasks", task.id), {
        ...task,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      });
    });

    const pullRequests = [
      { id: "pr_1", projectId: "proj_1", projectName: "Auth Service", title: "feat: add secure session state synchronization across regional endpoints", author: user.uid, status: "open", branch: "feature/sync-regions" },
      { id: "pr_2", projectId: "proj_2", projectName: "Payment Gateway", title: "fix: handle duplicate idempotency keys on payment retries", author: user.uid, status: "merged", branch: "fix/stripe-idempotency" }
    ];

    pullRequests.forEach((pr) => {
      batch.set(doc(db, "teams", teamId, "prs", pr.id), {
        ...pr,
        createdAt: new Date().toISOString()
      });
    });

    const defaultRepoFiles = [
      {
        id: "proj_1_src_server_ts",
        projectId: "proj_1",
        path: "src/server.ts",
        language: "typescript",
        content: "import express from 'express';\nconst app = express();\n\n// JWT verification middleware\napp.use('/api', (req, res, next) => {\n  const token = req.headers.authorization;\n  if (!token) return res.status(401).json({ error: 'MFA clearance required' });\n  next();\n});\n\napp.listen(3000);"
      },
      {
        id: "proj_1_src_auth_webauthn_ts",
        projectId: "proj_1",
        path: "src/auth/webauthn.ts",
        language: "typescript",
        content: "export async function generateChallenge(userId: string) {\n  const challenge = crypto.getRandomValues(new Uint8Array(32));\n  // Store in cache with 120s TTL\n  return challenge;\n}"
      },
      {
        id: "proj_1_package_json",
        projectId: "proj_1",
        path: "package.json",
        language: "json",
        content: "{\n  \"name\": \"auth-service\",\n  \"dependencies\": {\n    \"@google/genai\": \"^2.4.0\",\n    \"jose\": \"^5.2.0\"\n  }\n}"
      },
      {
        id: "proj_2_src_stripe_client_ts",
        projectId: "proj_2",
        path: "src/stripe/client.ts",
        language: "typescript",
        content: "import Stripe from 'stripe';\n\nconst stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {\n  apiVersion: '2024-04-12'\n});\n\nexport async function captureCharge(amount: number) {\n  return stripe.charges.create({ amount, currency: 'usd' });\n}"
      },
      {
        id: "proj_2_src_db_migrations_sql",
        projectId: "proj_2",
        path: "src/db/migrations.sql",
        language: "sql",
        content: "CREATE TABLE invoices (\n  id VARCHAR(64) PRIMARY KEY,\n  amount DECIMAL(12, 2),\n  currency VARCHAR(3),\n  status VARCHAR(20)\n);"
      },
      {
        id: "proj_3_src_App_tsx",
        projectId: "proj_3",
        path: "src/App.tsx",
        language: "typescript",
        content: "import React from 'react';\nimport { View, Text } from 'react-native';\n\nexport default function App() {\n  return (\n    <View style={{ flex: 1, justify: 'center' }}>\n      <Text>Secure Ledger v1.4</Text>\n    </View>\n  );\n}"
      }
    ];

    defaultRepoFiles.forEach((f) => {
      batch.set(doc(db, "teams", teamId, "repo_files", f.id), {
        ...f,
        updatedAt: new Date().toISOString()
      });
    });

    const keys = [
      { id: "key_1", name: "Production Gateway Live Key", key: "sk_live_51Nx...A98q1", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), lastUsed: "Active now", status: "active" },
      { id: "key_2", name: "Developer Staging Sandpit", key: "sk_test_51Nx...D61rZ", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), lastUsed: "2 minutes ago", status: "active" }
    ];

    keys.forEach((key) => {
      batch.set(doc(db, "teams", teamId, "api_keys", key.id), key);
    });

    const initialArticles: KbArticle[] = [
      {
        id: "kb-1",
        title: "Zasady Bezpieczeństwa (Poradnik integracji SSO)",
        category: "SSO",
        description: "Wymuszanie uwierzytelniania dwuskładnikowego FIDO2/WebAuthn dla klastrów SaaS.",
        content: "Wszystkie regionalne serwery klastra Synthetix muszą wymusić uwierzytelnianie FIDO2/WebAuthn przed wygenerowaniem krótkotrwałych tokenów dostępowych JWT. Czas życia JWT wynosi dokładnie 7200 sekund.\\n\\nAby zintegrować moduł SSO z bramą Ingress Gateway, należy zmodyfikować nagłówki uwierzytelnienia w filtrze Envoy. Brama automatycznie odrzuci połączenia bez aktywnej sesji MFA i skieruje użytkownika do portalu uwierzytelnień.",
        codeSnippet: "// Przykładowy filtr nagłówków weryfikacyjnych\\nexport async function verifyClusterToken(token: string): Promise<boolean> {\\n  const claims = await jwtVerify(token, CLUSTER_PUBLIC_KEY, {\\n    algorithms: [\"RS256\"],\\n    issuer: \"synthetix-auth-cluster\",\\n    clockTolerance: \"10s\"\\n  });\\n  \\n  return claims.payload.mfa_cleared === true;\\n}",
        lastUpdated: "2026-06-15 14:20",
        author: "Andrzej (Owner)",
        readTime: "4 min"
      },
      {
        id: "kb-2",
        title: "Procedury Awaryjne i Serwery Zapasowe (DRP)",
        category: "Disaster",
        description: "Plany awaryjne przełączania ruchu DNS w przypadku niedostępności AWS/GCP.",
        content: "Punkty końcowe DNS automatycznie przełączają się w przypadku awarii klastrów AWS przy użyciu technologii Cloudflare Magic Transit i dynamicznych rekordów seryjnych SRV. Logi, bazy danych i schematy struktur są archiwizowane co godzinę.\\n\\nW przypadku awarii strefy europejskiej, główny router przekierowuje zapytania do bazy repliki w regionie zapasowym (us-east). Czas przełączenia (RTO) wynosi mniej niż 12 sekund.",
        codeSnippet: "# Skrypt wyzwalający ręczną procedurę failover klastra\\ncurl -X POST https://api.synthetix.io/v2/cluster/failover \\\\\\n  -H \"Authorization: Bearer $SYSTEM_ROOT_SECRET\" \\\\\\n  -H \"Content-Type: application/json\" \\\\\\n  -d '{\"target_region\": \"eu-west-2\", \"force_replica_promotion\": true}'",
        lastUpdated: "2026-06-20 09:12",
        author: "Sandra (Manager)",
        readTime: "6 min"
      },
      {
        id: "kb-3",
        title: "Porozumienie o Poziomie Usług (SLA) i Rozliczenia",
        category: "Finance",
        description: "Standardy dostępności (99.99%) i zintegrowany mechanizm rozliczeń ze Stripe.",
        content: "Nasza umowa SLA gwarantuje dostępność platformy na poziomie 99.99% w skali miesiąca. Kary umowne są naliczane automatycznie jako kredyty rozliczeniowe w panelu klienta w przypadku awarii trwających powyżej 15 minut.\\n\\nIntegracja ze Stripe obsługuje cykliczne płatności subskrypcyjne. Wszystkie webhooki dotyczące płatności przechodzą przez system walidacji sygnatur.",
        codeSnippet: "// Walidacja podpisu webhooka Stripe (Payment-Engine)\\nconst event = stripe.webhooks.constructEvent(\\n  req.rawBody,\\n  req.headers['stripe-signature'],\\n  process.env.STRIPE_WEBHOOK_SECRET\\n);",
        lastUpdated: "2026-05-30 11:45",
        author: "Karol (Finances)",
        readTime: "3 min"
      },
      {
        id: "kb-4",
        title: "Konfiguracja Integracji ze Slackiem",
        category: "API",
        description: "Przewodnik po aktywacji powiadomień o wdrożeniach i zadaniach programistów.",
        content: "Użyj integracji Slack Connector, aby otrzymywać powiadomienia o zatwierdzonych i scalonych Pull Requestach bezpośrednio na kanale #synthetix-builds.\\n\\nPołączenie wymaga podania bezpiecznego Webhook URL wygenerowanego w Slack API Dashboard. Uprawnienia są nadawane na poziomie organizacji.",
        lastUpdated: "2026-06-28 16:05",
        author: "Mike (Developer)",
        readTime: "2 min"
      }
    ];

    initialArticles.forEach((art) => {
      batch.set(doc(db, "teams", teamId, "knowledge_base", art.id), art);
    });

    // Create log
    const logId = "log_" + Date.now();
    const logRef = doc(db, "teams", teamId, "audit_logs", logId);
    const resetLog: AuditLogEntry = {
      id: logId,
      actor: {
        id: activeMember.id,
        name: activeMember.name,
        email: activeMember.email,
        avatar: activeMember.avatar,
        role: activeMember.role
      },
      action: "reset database",
      target: "Corporate Database Clusters",
      createdAt: new Date().toISOString(),
      category: "settings",
      details: "Reconstructed default development workspaces, mock revenue stats, and system integration pipelines."
    };
    batch.set(logRef, resetLog);

    await batch.commit();
  };

  const logAction = async (action: string, target: string, category: AuditLogEntry["category"], details?: string) => {
    if (!teamId || !activeMember) return;
    await firebaseTeamApi.addAuditLog(teamId, activeMember, action, target, category, details);
  };

  const updateRepoFile = async (projectId: string, path: string, content: string) => {
    if (!teamId || !activeMember) return;
    const fileId = `${projectId}_${path.replace(/\//g, "_")}`;
    const language = path.endsWith(".ts") || path.endsWith(".tsx") ? "typescript" : path.endsWith(".sql") ? "sql" : path.endsWith(".json") ? "json" : "plaintext";
    
    const fileDoc: RepoFile = {
      id: fileId,
      projectId,
      path,
      language,
      content,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, "teams", teamId, "repo_files", fileId), fileDoc);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "updated file",
      `${path} in ${projectId}`,
      "project",
      `Saved source changes directly into the cluster repository.`
    );
  };

  const createCodeAssignment = async (assignment: Omit<CodeAssignment, "id" | "status" | "createdAt">) => {
    if (!teamId || !activeMember) return;
    const id = "asg_" + Math.random().toString(36).substring(2, 10);
    const newAsg: CodeAssignment = {
      ...assignment,
      id,
      status: "assigned",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, "teams", teamId, "code_assignments", id), newAsg);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "assigned code task",
      `${assignment.filePath} to ${assignment.assignedToName}`,
      "project",
      `Instructions: ${assignment.instructions.substring(0, 60)}...`
    );
  };

  const updateCodeAssignment = async (assignment: CodeAssignment) => {
    if (!teamId || !activeMember) return;
    await setDoc(doc(db, "teams", teamId, "code_assignments", assignment.id), assignment);
  };

  const submitCodeAssignment = async (id: string, editedContent: string) => {
    if (!teamId || !activeMember) return;
    const asgRef = doc(db, "teams", teamId, "code_assignments", id);
    await updateDoc(asgRef, {
      editedContent,
      status: "submitted",
      submittedAt: new Date().toISOString()
    });
    
    const snap = await getDoc(asgRef);
    const asg = snap.data() as CodeAssignment;
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "submitted code task",
      `${asg?.filePath || "file"} code modifications`,
      "project",
      `Sent back to the administrator for merge review.`
    );
  };

  const mergeCodeAssignment = async (id: string) => {
    if (!teamId || !activeMember) return;
    const asgRef = doc(db, "teams", teamId, "code_assignments", id);
    const snap = await getDoc(asgRef);
    if (!snap.exists()) return;
    const asg = snap.data() as CodeAssignment;
    
    // 1. Update assignment status
    await updateDoc(asgRef, { status: "merged" });
    
    // 2. Actually update the file in the repository!
    await updateRepoFile(asg.projectId, asg.filePath, asg.editedContent);
    
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "merged code task",
      `PR-${id} into main branch`,
      "project",
      `Successfully integrated changes of ${asg.filePath} from ${asg.assignedToName}.`
    );
  };

  const rejectCodeAssignment = async (id: string, feedback: string) => {
    if (!teamId || !activeMember) return;
    const asgRef = doc(db, "teams", teamId, "code_assignments", id);
    await updateDoc(asgRef, {
      status: "rejected",
      feedback
    });
    
    const snap = await getDoc(asgRef);
    const asg = snap.data() as CodeAssignment;
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "rejected code task",
      `Code changes for ${asg?.filePath || "file"} rejected`,
      "project",
      `Feedback: ${feedback}`
    );
  };

  const createKbArticle = async (art: Omit<KbArticle, "id" | "lastUpdated" | "author" | "readTime">) => {
    if (!teamId || !activeMember) return;
    const id = "kb_" + Math.random().toString(36).substring(2, 10);
    const newArt: KbArticle = {
      ...art,
      id,
      lastUpdated: new Date().toISOString().substring(0, 16).replace("T", " "),
      author: activeMember.name,
      readTime: "3 min"
    };
    await setDoc(doc(db, "teams", teamId, "knowledge_base", id), newArt);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "created kb_article",
      art.title,
      "settings",
      `Created article under category: ${art.category}`
    );
  };

  const updateKbArticle = async (art: KbArticle) => {
    if (!teamId || !activeMember) return;
    const updatedArt: KbArticle = {
      ...art,
      lastUpdated: new Date().toISOString().substring(0, 16).replace("T", " ")
    };
    await setDoc(doc(db, "teams", teamId, "knowledge_base", art.id), updatedArt);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "updated kb_article",
      art.title,
      "settings",
      `Updated article under category: ${art.category}`
    );
  };

  const deleteKbArticle = async (id: string) => {
    if (!teamId || !activeMember) return;
    const ref = doc(db, "teams", teamId, "knowledge_base", id);
    const snap = await getDoc(ref);
    const title = snap.exists() ? snap.data().title : "Artykuł";
    await deleteDoc(ref);
    await firebaseTeamApi.addAuditLog(
      teamId,
      activeMember,
      "deleted kb_article",
      title,
      "settings",
      "Purged article from cloud knowledge base system."
    );
  };

  return (
    <FirebaseTeamContext.Provider value={{
      user,
      profile,
      authLoading,
      teamId,
      org,
      members,
      projects,
      apiKeys,
      integrations,
      billing,
      tasks,
      prs,
      rolePermissions,
      auditLogs,
      repoFiles,
      codeAssignments,
      kbArticles,
      activeMemberId,
      activeMember,
      teamLoading,
      login,
      signup,
      loginWithGoogle,
      logout,
      createWorkspace,
      joinWorkspace,
      changeActiveMember,
      leaveWorkspace,
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
      logAction,
      updateRepoFile,
      createCodeAssignment,
      updateCodeAssignment,
      submitCodeAssignment,
      mergeCodeAssignment,
      rejectCodeAssignment,
      createKbArticle,
      updateKbArticle,
      deleteKbArticle
    }}>
      {children}
    </FirebaseTeamContext.Provider>
  );
};

export const useFirebaseTeam = () => {
  const context = useContext(FirebaseTeamContext);
  if (context === undefined) {
    throw new Error("useFirebaseTeam must be used within a FirebaseTeamProvider");
  }
  return context;
};
