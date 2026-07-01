/**
 * usePresence.ts — Socket.io presence hook
 * Tracks who is viewing which file in real-time & supports user management
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../stores/authStore";

export interface PresenceUser {
  username: string;
  nickname?: string;
  file?: string;
  line?: number;
  color: string;
  avatarUrl?: string;
}

// Stable colors per username
const PRESENCE_COLORS = [
  "#818cf8", "#f472b6", "#34d399", "#fb923c",
  "#38bdf8", "#a78bfa", "#4ade80", "#facc15",
  "#f87171", "#a855f7", "#06b6d4", "#ec4899"
];

function colorForUser(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length];
}

let globalSocket: Socket | null = null;
let currentRoomId: string | null = null;

export function usePresence(teamId: string | null) {
  const { user } = useAuthStore();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [viewingMap, setViewingMap] = useState<Record<string, PresenceUser>>({}); // username → PresenceUser
  const [userDetails, setUserDetails] = useState<Record<string, any>>({}); // username → user info
  const socketRef = useRef<Socket | null>(null);
  const presenceTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!teamId || !user) return;

    // Reuse socket if same team
    if (!globalSocket || currentRoomId !== teamId) {
      globalSocket?.disconnect();
      globalSocket = io(window.location.origin, {
        path: "/socket.io",
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });
      currentRoomId = teamId;
    }

    socketRef.current = globalSocket;

    globalSocket.on("connect", () => {
      globalSocket!.emit("team:join", { teamId, user });
    });

    globalSocket.on("presence:update", (users: string[]) => {
      setOnlineUsers(users);
    });

    globalSocket.on("presence:viewing", ({ user: presUser, file, line, nickname }: any) => {
      setViewingMap(prev => ({
        ...prev,
        [presUser.username]: {
          username: presUser.username,
          nickname: nickname || presUser.nickname,
          file,
          line,
          color: colorForUser(presUser.username),
          avatarUrl: presUser.avatarUrl,
        },
      }));
    });

    globalSocket.on("presence:user_added", ({ username, nickname, email }: any) => {
      setUserDetails(prev => ({
        ...prev,
        [username]: { username, nickname, email },
      }));
    });

    globalSocket.on("presence:user_removed", ({ username }: any) => {
      setOnlineUsers(prev => prev.filter(u => u !== username));
      setViewingMap(prev => {
        const newMap = { ...prev };
        delete newMap[username];
        return newMap;
      });
      setUserDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[username];
        return newDetails;
      });
    });

    // If socket already connected, join immediately
    if (globalSocket.connected) {
      globalSocket.emit("team:join", { teamId, user });
    }

    return () => {
      if (presenceTimeoutRef.current) {
        clearTimeout(presenceTimeoutRef.current);
      }
    };
  }, [teamId, user]);

  /** Broadcast that current user is viewing a file */
  const broadcastViewing = useCallback((file: string, line?: number) => {
    if (!socketRef.current || !teamId || !user) return;
    socketRef.current.emit("presence:viewing", { teamId, user, file, line });
  }, [teamId, user]);

  /** Get list of users currently viewing a specific file */
  const getUsersViewingFile = useCallback((file: string): PresenceUser[] => {
    return (Object.values(viewingMap) as PresenceUser[]).filter(
      p => p.file === file && p.username !== user?.username
    );
  }, [viewingMap, user]);

  /** Add user by nickname to team */
  const addUserByNickname = useCallback((nickname: string) => {
    if (!socketRef.current || !teamId || !user) return;
    socketRef.current.emit("team:invite_user", { teamId, nickname });
  }, [teamId, user]);

  /** Remove user from team */
  const removeUserFromTeam = useCallback((username: string) => {
    if (!socketRef.current || !teamId || !user) return;
    socketRef.current.emit("team:remove_user", { teamId, username });
  }, [teamId, user]);

  const onlineWithColors = onlineUsers.map(u => ({
    username: u,
    nickname: userDetails[u]?.nickname || u,
    color: colorForUser(u),
    isMe: u === user?.username,
    email: userDetails[u]?.email,
  }));

  return {
    onlineUsers,
    onlineWithColors,
    viewingMap,
    userDetails,
    broadcastViewing,
    getUsersViewingFile,
    addUserByNickname,
    removeUserFromTeam,
  };
}

/** Global socket getter for chat panel to reuse */
export function getGlobalSocket(): Socket | null {
  return globalSocket;
}

/** Disconnect socket explicitly if needed */
export function disconnectPresence() {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
    currentRoomId = null;
  }
}
