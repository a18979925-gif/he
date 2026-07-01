/**
 * src/features/team/types/activity.ts
 */

export interface ActivityEvent {
  id: string;
  actor: {
    id: string;
    username: string;
    avatar?: string;
  };
  action: string;
  target?: {
    type: string;
    id: string;
    name: string;
  };
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export type ActivityFilter = "all" | "members" | "projects" | "security" | "billing" | "settings";
