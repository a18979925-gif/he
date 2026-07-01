/**
 * authRoutes.ts — Auth + Team + Invite endpoints
 */

import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userDb, teamDb, inviteDb, projectDb, billingDb } from "./db.js";

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "codescope-dev-secret-2024";

// ─── Middleware: Verify JWT ──────────────────────────────────────────────────
export function requireAuth(req: any, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────
authRouter.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });
  if (username.length < 3) return res.status(400).json({ error: "Username must be at least 3 characters" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  const exists = userDb.findByUsername(username);
  if (exists) return res.status(409).json({ error: "Username already taken" });

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = userDb.create(username, passwordHash);

  const token = jwt.sign({ id: userId, username: username.toLowerCase().trim() }, JWT_SECRET, { expiresIn: "30d" });
  return res.json({ token, user: { id: userId, username: username.toLowerCase().trim() } });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  const user = userDb.findByUsername(username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "30d" });
  return res.json({ token, user: { id: user.id, username: user.username } });
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
authRouter.get("/me", requireAuth, (req: any, res) => {
  const user = userDb.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const teams = teamDb.getByUser(user.id);
  return res.json({ user, teams });
});

// ─── POST /api/teams ─────────────────────────────────────────────────────────
authRouter.post("/teams", requireAuth, (req: any, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Team name required" });
  const teamId = teamDb.create(name.trim(), req.user.id);
  const team = teamDb.findById(teamId);
  return res.json(team);
});

// ─── GET /api/teams/:id ──────────────────────────────────────────────────────
authRouter.get("/teams/:id", requireAuth, (req: any, res) => {
  const team = teamDb.findById(req.params.id);
  if (!team) return res.status(404).json({ error: "Team not found" });
  if (!teamDb.isMember(team.id, req.user.id)) return res.status(403).json({ error: "Not a team member" });
  const billing = billingDb.getByTeam(team.id);
  const totalGr = billingDb.getTotal(team.id);
  const projects = projectDb.getByTeam(team.id);
  return res.json({ ...team, billing, totalGr, projects });
});

// ─── GET /api/teams/:id/members ──────────────────────────────────────────────
authRouter.get("/teams/:id/members", requireAuth, (req: any, res) => {
  const team = teamDb.findById(req.params.id);
  if (!team) return res.status(404).json({ error: "Team not found" });
  if (!teamDb.isMember(team.id, req.user.id)) return res.status(403).json({ error: "Not a team member" });
  return res.json(team.members);
});

// ─── POST /api/teams/:id/invite ──────────────────────────────────────────────
authRouter.post("/teams/:id/invite", requireAuth, (req: any, res) => {
  const team = teamDb.findById(req.params.id);
  if (!team) return res.status(404).json({ error: "Team not found" });
  if (team.owner_id !== req.user.id) return res.status(403).json({ error: "Only team owner can create invites" });

  const { role = "dev", maxUses = 10, expiresInHours = 72 } = req.body;
  const token = inviteDb.create(team.id, req.user.id, role, maxUses, expiresInHours);

  const inviteUrl = `${process.env.APP_URL || `http://localhost:3022`}/join/${token}`;
  return res.json({ token, inviteUrl, expiresInHours, maxUses, role });
});

// ─── POST /api/join/:token ──────────────────────────────────────────────────
authRouter.post("/join/:token", requireAuth, (req: any, res) => {
  const inv = inviteDb.find(req.params.token);
  if (!inviteDb.isValid(inv)) return res.status(410).json({ error: "Invite link expired or exhausted" });

  const team = teamDb.findById(inv.team_id);
  if (!team) return res.status(404).json({ error: "Team not found" });

  // Already a member?
  if (teamDb.isMember(team.id, req.user.id)) {
    return res.json({ team, alreadyMember: true });
  }

  // Add member
  teamDb.addMember(team.id, req.user.id, inv.role);
  inviteDb.use(inv.token);

  // Billing: 1 PLN per new member
  billingDb.log(team.id, req.user.id, "member_join", 100, `New member joined: @${req.user.username}`);

  const updatedTeam = teamDb.findById(team.id);
  return res.json({ team: updatedTeam, alreadyMember: false });
});

// ─── GET /api/invite/:token/info ────────────────────────────────────────────
authRouter.get("/invite/:token/info", (req, res) => {
  const inv = inviteDb.find(req.params.token);
  if (!inv) return res.status(404).json({ error: "Invite not found" });
  const valid = inviteDb.isValid(inv);
  if (!valid) return res.status(410).json({ error: "Invite expired or exhausted" });
  const team = teamDb.findById(inv.team_id);
  return res.json({ teamName: team?.name, role: inv.role, expiresAt: inv.expires_at });
});

// ─── GET /api/teams/:id/billing ─────────────────────────────────────────────
authRouter.get("/teams/:id/billing", requireAuth, (req: any, res) => {
  if (!teamDb.isMember(req.params.id, req.user.id)) return res.status(403).json({ error: "Not a team member" });
  const events = billingDb.getByTeam(req.params.id);
  const total = billingDb.getTotal(req.params.id);
  return res.json({ events, totalGr: total, totalPLN: (total / 100).toFixed(2) });
});

// ─── GET /api/teams/:id/chat ─────────────────────────────────────────────────
authRouter.get("/teams/:id/chat", requireAuth, (req: any, res) => {
  const { chatDb } = require("./db.js");
  if (!teamDb.isMember(req.params.id, req.user.id)) return res.status(403).json({ error: "Not a team member" });
  const messages = chatDb.getRecent(req.params.id, 100);
  return res.json(messages);
});
