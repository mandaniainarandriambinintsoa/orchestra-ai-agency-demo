export type DataOrigin = "demo" | "database" | "n8n";
export type ProspectStatus = "nouveau" | "en_cours" | "qualifie" | "non_qualifie" | "converti";
export type AutomationStatus = "verifie" | "configure" | "simule" | "indisponible";

export type Prospect = {
  id: string;
  name: string;
  company: string;
  email: string;
  status: ProspectStatus;
  score: number | null;
  source: string;
  lastActivity: string;
};

export type Activity = {
  id: string;
  label: string;
  detail: string;
  at: string;
  kind: "prospect" | "conversation" | "appointment" | "stock" | "automation";
};

export type AgentSummary = {
  id: string;
  name: string;
  role: string;
  workflowRef: string;
  status: AutomationStatus;
  lastActivity: string | null;
  sideEffect: "aucun" | "cout_fournisseur" | "email_calendrier";
};
