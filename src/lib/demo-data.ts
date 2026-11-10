import type { Activity, AgentSummary, Prospect } from "@/lib/domain";

export const dataOrigin = "demo" as const;

export const prospects: Prospect[] = [
  { id: "PR-1042", name: "Sophie Laurent", company: "Cabinet Nova RH", email: "sophie.laurent@example.com", status: "qualifie", score: 86, source: "Formulaire site", lastActivity: "Aujourd’hui, 09:42" },
  { id: "PR-1041", name: "Thomas Bernard", company: "Atelier Kumo", email: "thomas.bernard@example.com", status: "en_cours", score: 72, source: "Conversation IA", lastActivity: "Aujourd’hui, 08:16" },
  { id: "PR-1039", name: "Inès Martin", company: "Buroline Services", email: "ines.martin@example.com", status: "nouveau", score: null, source: "Import manuel", lastActivity: "Hier, 17:28" },
  { id: "PR-1036", name: "Lucas Morel", company: "Mecatech Conseil", email: "lucas.morel@example.com", status: "converti", score: 91, source: "Recherche prospects FR", lastActivity: "Hier, 11:04" },
  { id: "PR-1032", name: "Emma Roux", company: "Maison Rivage", email: "emma.roux@example.com", status: "non_qualifie", score: 34, source: "Formulaire site", lastActivity: "8 nov., 15:20" },
];

export const activities: Activity[] = [
  { id: "AC-81", label: "Prospect qualifié", detail: "Nova RH atteint un score de 86/100.", at: "09:42", kind: "prospect" },
  { id: "AC-80", label: "Conversation résumée", detail: "Besoin CRM et relances identifié pour Atelier Kumo.", at: "08:18", kind: "conversation" },
  { id: "AC-79", label: "Rendez-vous proposé", detail: "Trois créneaux préparés, en attente de validation humaine.", at: "08:05", kind: "appointment" },
  { id: "AC-78", label: "Alerte de stock", detail: "Casques USB Pro sous le seuil minimum.", at: "Hier", kind: "stock" },
];

export const agents: AgentSummary[] = [
  { id: "AG-CHAT", name: "Agent conversationnel", role: "Dialogue, qualification et proposition de rendez-vous", workflowRef: "aAzD…whr", status: "configure", lastActivity: null, sideEffect: "email_calendrier" },
  { id: "AG-SCORE", name: "Qualification prospects FR", role: "Recherche officielle, score et angles d’approche", workflowRef: "nHSB…4u0", status: "verifie", lastActivity: null, sideEffect: "aucun" },
  { id: "AG-COPY", name: "Assistant de relance", role: "Prépare les messages sans les envoyer", workflowRef: "rZLc…eKt", status: "verifie", lastActivity: null, sideEffect: "aucun" },
  { id: "AG-LINKEDIN", name: "Sourcing LinkedIn", role: "Recherche et scoring de cinq profils", workflowRef: "1zPg…1dA", status: "configure", lastActivity: null, sideEffect: "cout_fournisseur" },
];

export const activitySeries = [
  { day: "Lun", entrants: 12, qualifies: 7 },
  { day: "Mar", entrants: 18, qualifies: 10 },
  { day: "Mer", entrants: 15, qualifies: 9 },
  { day: "Jeu", entrants: 22, qualifies: 14 },
  { day: "Ven", entrants: 26, qualifies: 17 },
  { day: "Sam", entrants: 11, qualifies: 6 },
  { day: "Dim", entrants: 8, qualifies: 5 },
];
