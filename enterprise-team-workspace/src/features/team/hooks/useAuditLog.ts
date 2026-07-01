import { useState, useEffect, useCallback } from "react";
import { AuditLogEntry } from "../types/activity";
import { Member } from "../types/member";
import { teamApi } from "../services/teamApi";

export function useAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  const refreshLogs = useCallback(() => {
    setLogs(teamApi.getAuditLogs());
  }, []);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  const logAction = useCallback(
    (actor: Member, action: string, target: string, category: AuditLogEntry["category"], details?: string) => {
      teamApi.addAuditLog(actor, action, target, category, details);
      refreshLogs();
    },
    [refreshLogs]
  );

  return {
    logs,
    logAction,
    refreshLogs
  };
}
