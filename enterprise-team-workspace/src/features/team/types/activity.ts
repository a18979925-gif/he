import { TeamRole } from "./role";

export interface AuditLogEntry {
  id: string;
  actor: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: TeamRole;
  };
  action: string;
  target: string;
  createdAt: string;
  category: "project" | "member" | "billing" | "security" | "settings";
  details?: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  projectName: string;
  env: "production" | "staging" | "preview";
  version: string;
  status: "success" | "building" | "failed";
  deployedBy: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  status: "todo" | "in-progress" | "review" | "done";
  assignedTo: string; // memberId
  dueDate: string;
  priority: "low" | "medium" | "high";
}

export interface PullRequest {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  author: string; // memberId
  status: "open" | "merged" | "closed";
  branch: string;
  createdAt: string;
}

export interface LogLine {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  service: string;
  message: string;
}

export interface RepoFile {
  id: string; // project_id_filepath
  projectId: string;
  path: string;
  language: string;
  content: string;
  updatedAt: string;
}

export interface CodeAssignment {
  id: string;
  projectId: string;
  projectName: string;
  filePath: string;
  originalContent: string;
  editedContent: string;
  instructions: string;
  assignedTo: string; // memberId
  assignedToName: string;
  assignedBy: string; // memberId
  assignedByName: string;
  status: "assigned" | "submitted" | "merged" | "rejected";
  createdAt: string;
  submittedAt?: string;
  feedback?: string;
}

export interface KbArticle {
  id: string;
  title: string;
  category: "SSO" | "Security" | "Disaster" | "API" | "Finance";
  description: string;
  content: string;
  codeSnippet?: string;
  lastUpdated: string;
  author: string;
  readTime: string;
}

