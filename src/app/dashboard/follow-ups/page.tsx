import { FollowUpsWorkspace } from "@/components/follow-ups-workspace";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Relances" };

export default function FollowUpsPage() {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Relance intelligente"
        title="Messages à valider"
        description="Générez une relance personnalisée depuis un prospect. Le cron prépare aussi chaque matin les relances des prospects inactifs ; aucun message n’est envoyé sans validation."
      />
      <FollowUpsWorkspace />
    </section>
  );
}
