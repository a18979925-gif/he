/**
 * db.ts — SQLite database layer (WAL mode, zero external server)
 * Tables: users, teams, team_members, invite_tokens, projects, chat_messages, billing_events
 */

import Database from "better-sqlite3";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "codescope.db");
export const db = new Database(DB_PATH);

// Enable WAL mode for safe concurrent writes
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Schema Migrations ──────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    username    TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    plan        TEXT NOT NULL DEFAULT 'solo'
  );

  CREATE TABLE IF NOT EXISTS teams (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    owner_id    TEXT NOT NULL REFERENCES users(id),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS team_members (
    team_id     TEXT NOT NULL REFERENCES teams(id),
    user_id     TEXT NOT NULL REFERENCES users(id),
    role        TEXT NOT NULL DEFAULT 'dev',
    joined_at   TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (team_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS invite_tokens (
    token       TEXT PRIMARY KEY,
    team_id     TEXT NOT NULL REFERENCES teams(id),
    created_by  TEXT NOT NULL REFERENCES users(id),
    role        TEXT NOT NULL DEFAULT 'dev',
    max_uses    INTEGER NOT NULL DEFAULT 10,
    used_count  INTEGER NOT NULL DEFAULT 0,
    expires_at  TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    owner_id    TEXT NOT NULL REFERENCES users(id),
    team_id     TEXT REFERENCES teams(id),
    mode        TEXT NOT NULL DEFAULT 'solo',
    file_count  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id          TEXT PRIMARY KEY,
    team_id     TEXT NOT NULL REFERENCES teams(id),
    user_id     TEXT NOT NULL REFERENCES users(id),
    username    TEXT NOT NULL,
    message     TEXT NOT NULL,
    context_file TEXT,
    context_line INTEGER,
    context_issue_id TEXT,
    timestamp   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS billing_events (
    id          TEXT PRIMARY KEY,
    team_id     TEXT NOT NULL REFERENCES teams(id),
    user_id     TEXT NOT NULL REFERENCES users(id),
    type        TEXT NOT NULL,
    amount_gr   INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_chat_team ON chat_messages(team_id, timestamp);
  CREATE INDEX IF NOT EXISTS idx_billing_team ON billing_events(team_id, created_at);
`);

console.log(`[DB] SQLite connected: ${DB_PATH} (WAL mode)`);

// ─── User helpers ────────────────────────────────────────────────────────────
export const userDb = {
  create(username: string, passwordHash: string): string {
    const id = randomUUID();
    db.prepare(`INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)`).run(id, username.toLowerCase().trim(), passwordHash);
    return id;
  },
  findByUsername(username: string) {
    return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username.toLowerCase().trim()) as any;
  },
  findById(id: string) {
    return db.prepare(`SELECT id, username, created_at, plan FROM users WHERE id = ?`).get(id) as any;
  }
};

// ─── Team helpers ────────────────────────────────────────────────────────────
export const teamDb = {
  create(name: string, ownerId: string): string {
    const id = randomUUID();
    db.prepare(`INSERT INTO teams (id, name, owner_id) VALUES (?, ?, ?)`).run(id, name, ownerId);
    db.prepare(`INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'owner')`).run(id, ownerId);
    return id;
  },
  findById(id: string) {
    const team = db.prepare(`SELECT * FROM teams WHERE id = ?`).get(id) as any;
    if (!team) return null;
    team.members = db.prepare(`
      SELECT tm.role, tm.joined_at, u.id, u.username
      FROM team_members tm
      JOIN users u ON u.id = tm.user_id
      WHERE tm.team_id = ?
    `).all(id);
    return team;
  },
  getByUser(userId: string) {
    return db.prepare(`
      SELECT t.* FROM teams t
      JOIN team_members tm ON tm.team_id = t.id
      WHERE tm.user_id = ?
    `).all(userId) as any[];
  },
  addMember(teamId: string, userId: string, role = "dev") {
    try {
      db.prepare(`INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)`).run(teamId, userId, role);
      return true;
    } catch { return false; }
  },
  isMember(teamId: string, userId: string) {
    return !!db.prepare(`SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?`).get(teamId, userId);
  }
};

// ─── Invite Token helpers ────────────────────────────────────────────────────
export const inviteDb = {
  create(teamId: string, createdBy: string, role = "dev", maxUses = 10, expiresInHours = 72): string {
    const token = randomUUID().replace(/-/g, "").slice(0, 16);
    const expiresAt = new Date(Date.now() + expiresInHours * 3600_000).toISOString();
    db.prepare(`INSERT INTO invite_tokens (token, team_id, created_by, role, max_uses, expires_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(token, teamId, createdBy, role, maxUses, expiresAt);
    return token;
  },
  find(token: string) {
    return db.prepare(`SELECT * FROM invite_tokens WHERE token = ?`).get(token) as any;
  },
  use(token: string) {
    db.prepare(`UPDATE invite_tokens SET used_count = used_count + 1 WHERE token = ?`).run(token);
  },
  isValid(inv: any) {
    if (!inv) return false;
    if (new Date(inv.expires_at) < new Date()) return false;
    if (inv.used_count >= inv.max_uses) return false;
    return true;
  }
};

// ─── Project helpers ─────────────────────────────────────────────────────────
export const projectDb = {
  create(name: string, ownerId: string, mode: "solo" | "team", teamId: string | null, fileCount: number): string {
    const id = randomUUID();
    db.prepare(`INSERT INTO projects (id, name, owner_id, team_id, mode, file_count) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, name, ownerId, teamId, mode, fileCount);
    return id;
  },
  getByTeam(teamId: string) {
    return db.prepare(`SELECT * FROM projects WHERE team_id = ? ORDER BY created_at DESC`).all(teamId) as any[];
  },
  getByUser(userId: string) {
    return db.prepare(`SELECT * FROM projects WHERE owner_id = ? AND mode = 'solo' ORDER BY created_at DESC`).all(userId) as any[];
  }
};

// ─── Chat helpers ────────────────────────────────────────────────────────────
export const chatDb = {
  save(teamId: string, userId: string, username: string, message: string, context?: { file?: string; line?: number; issueId?: string }) {
    const id = randomUUID();
    db.prepare(`INSERT INTO chat_messages (id, team_id, user_id, username, message, context_file, context_line, context_issue_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, teamId, userId, username, message, context?.file ?? null, context?.line ?? null, context?.issueId ?? null);
    return id;
  },
  getRecent(teamId: string, limit = 50) {
    return db.prepare(`SELECT * FROM chat_messages WHERE team_id = ? ORDER BY timestamp DESC LIMIT ?`).all(teamId, limit).reverse() as any[];
  }
};

// ─── Billing helpers ─────────────────────────────────────────────────────────
export const billingDb = {
  log(teamId: string, userId: string, type: string, amountGr: number, description: string) {
    const id = randomUUID();
    db.prepare(`INSERT INTO billing_events (id, team_id, user_id, type, amount_gr, description) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(id, teamId, userId, type, amountGr, description);
  },
  getByTeam(teamId: string) {
    return db.prepare(`SELECT be.*, u.username FROM billing_events be JOIN users u ON u.id = be.user_id WHERE be.team_id = ? ORDER BY be.created_at DESC`).all(teamId) as any[];
  },
  getTotal(teamId: string) {
    const row = db.prepare(`SELECT SUM(amount_gr) as total FROM billing_events WHERE team_id = ?`).get(teamId) as any;
    return row?.total || 0;
  }
};
