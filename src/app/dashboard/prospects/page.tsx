import { IconSparkles } from "@tabler/icons-react";
import { ProspectsTable } from "@/components/prospects-table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { prospects } from "@/lib/demo-data";

export const metadata = { title: "Prospects" };

export default function ProspectsPage() {
  return (
    <section className="space-y-8">
      <PageHeader eyebrow="CRM" title="Prospects" description="Recherchez, filtrez et suivez les contacts. La qualification n8n restera une action serveur contrôlée et n’est pas déclenchée dans cette première démo." actions={<Button disabled title="Disponible après connexion à la base dédiée"><IconSparkles size={17} />Qualifier une sélection</Button>} />
      <ProspectsTable prospects={prospects} />
    </section>
  );
}
