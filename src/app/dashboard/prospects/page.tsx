import { PageHeader } from "@/components/ui/page-header";
import { ProspectsWorkspace } from "@/components/prospects-workspace";

export const metadata = { title: "Prospects" };

export default function ProspectsPage() {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Qualification IA"
        title="Demandes entrantes"
        description="Ajoutez un prospect avec sa demande. Il est enregistré dans Supabase puis analysé par l’agent IA n8n : intérêt, sujet, score et prochaine action."
      />
      <ProspectsWorkspace />
    </section>
  );
}
