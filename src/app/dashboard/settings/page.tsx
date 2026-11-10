import { IconCheck, IconDatabase, IconPlugConnected, IconShieldLock } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";

const integrations = [
  { name: "Supabase", detail: "Variables absentes — jeu de données local utilisé", status: "simule" as const, icon: IconDatabase },
  { name: "n8n Manda", detail: "Audit réalisé — appels applicatifs non activés", status: "configure" as const, icon: IconPlugConnected },
  { name: "Effets externes", detail: "Emails, calendriers et prospection bloqués", status: "verifie" as const, icon: IconShieldLock },
];

export const metadata = { title: "Paramètres" };

export default function SettingsPage() {
  return (
    <section className="space-y-8">
      <PageHeader eyebrow="Configuration" title="Paramètres" description="État public et non sensible des intégrations. Aucune clé, URL privée ou valeur d’environnement n’est affichée." actions={<StatusBadge status="demo" />} />
      <div className="grid gap-4 lg:grid-cols-3">{integrations.map((integration) => { const Icon = integration.icon; return <article key={integration.name} className="surface p-5"><div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-full bg-sage-50 text-sage-700"><Icon size={20} /></span><StatusBadge status={integration.status} /></div><h2 className="mt-5 text-lg font-medium">{integration.name}</h2><p className="mt-2 text-xs leading-6 text-muted">{integration.detail}</p></article>; })}</div>
      <section className="surface p-5 sm:p-7"><p className="eyebrow">Mode démonstration</p><h2 className="mt-3 text-xl font-medium">Barrières actives</h2><ul className="mt-5 grid gap-3 text-xs text-muted sm:grid-cols-2"><li className="flex items-start gap-2"><IconCheck className="mt-0.5 shrink-0 text-sage-700" size={16} />Données client réelles exclues</li><li className="flex items-start gap-2"><IconCheck className="mt-0.5 shrink-0 text-sage-700" size={16} />Secrets exclusivement côté serveur</li><li className="flex items-start gap-2"><IconCheck className="mt-0.5 shrink-0 text-sage-700" size={16} />Relances soumises à validation humaine</li><li className="flex items-start gap-2"><IconCheck className="mt-0.5 shrink-0 text-sage-700" size={16} />Aucun workflow original modifiable</li></ul></section>
    </section>
  );
}
