import { IconCalendarEvent, IconMessageCircle, IconRobot } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";

const conversations = [
  { id: "CV-301", name: "Thomas Bernard", company: "Atelier Kumo", preview: "Nous cherchons à automatiser les relances après devis…", summary: "Besoin CRM, relances et rendez-vous. Budget à préciser.", agent: "Agent conversationnel", messages: 12, appointment: "Proposé" },
  { id: "CV-298", name: "Sophie Laurent", company: "Nova RH", preview: "Peut-on qualifier les demandes entrantes avant le commercial ?", summary: "Qualification automatique avec validation humaine souhaitée.", agent: "Agent conversationnel", messages: 8, appointment: "Non demandé" },
  { id: "CV-294", name: "Lucas Morel", company: "Mecatech Conseil", preview: "Le créneau de jeudi à 14 h me convient.", summary: "Rendez-vous validé dans le scénario de démonstration.", agent: "Agent conversationnel", messages: 15, appointment: "Confirmé (démo)" },
];

export const metadata = { title: "Conversations IA" };

export default function ConversationsPage() {
  return (
    <section className="space-y-8">
      <PageHeader eyebrow="Supervision" title="Conversations IA" description="Consultez le contexte, le résumé et les actions proposées par l’agent. Aucun message réel n’est envoyé depuis cet écran." actions={<StatusBadge status="demo" />} />
      <div className="grid gap-4 xl:grid-cols-3">
        {conversations.map((conversation) => (
          <article key={conversation.id} className="surface flex min-h-[310px] flex-col p-5">
            <div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-full bg-sage-50 text-sage-700"><IconMessageCircle size={20} stroke={1.6} /></span><span className="text-[10px] text-muted">{conversation.messages} messages</span></div>
            <h2 className="mt-5 text-lg font-medium tracking-[-0.025em]">{conversation.name}</h2><p className="mt-1 text-xs text-muted">{conversation.company}</p>
            <blockquote className="mt-5 border-l-2 border-sage-200 pl-3 text-xs leading-6 text-muted">« {conversation.preview} »</blockquote>
            <p className="mt-4 text-xs leading-6"><strong className="font-semibold">Résumé :</strong> {conversation.summary}</p>
            <div className="mt-auto grid gap-2 border-t border-line pt-4 text-[11px] text-muted"><span className="flex items-center gap-2"><IconRobot size={15} />{conversation.agent}</span><span className="flex items-center gap-2"><IconCalendarEvent size={15} />{conversation.appointment}</span></div>
          </article>
        ))}
      </div>
    </section>
  );
}
