import { ConversationWorkspace } from "@/components/conversation-workspace";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Conversations IA" };

export default function ConversationsPage() {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Agent conversationnel"
        title="Tester un parcours en direct"
        description="Choisissez un scénario. L’agent colis peut envoyer un récapitulatif ; les agents dentiste et garagiste consultent le calendrier, réservent puis envoient la confirmation par email."
      />
      <ConversationWorkspace />
    </section>
  );
}
