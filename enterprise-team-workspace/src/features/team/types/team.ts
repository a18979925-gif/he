export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived" | "paused";
  createdAt: string;
  revenue: number;
  memberCount: number;
  tags: string[];
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: "connected" | "disconnected";
}

export interface BillingConfig {
  planName: "Starter" | "Business" | "Enterprise";
  amount: number;
  nextInvoice: string;
  cardLast4: string;
  billingEmail: string;
}

export interface Organization {
  id: string;
  name: string;
  logo: string;
  domain: string;
  createdAt: string;
}
