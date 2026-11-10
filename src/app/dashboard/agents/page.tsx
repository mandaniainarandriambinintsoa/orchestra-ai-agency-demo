import { IconAlertTriangle, IconCoin, IconMailForward, IconShieldCheck } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { agents } from "@/lib/demo-data";

const effectLabels = { aucun: { label: "Sans effet externe", icon: IconShieldCheck }, cout_fournisseur: { label: "Coût fournisseur possible", icon: IconCoin }, email_calendrier: { label: "Email / calendrier possibles", icon: IconMailForward } } as const;

export const metadata = { title: "Agents & workflows" };

export default function AgentsPage() {
  return (
    <section className="space-y-8">
      <PageHeader eyebrow="n8n Manda" title="Agents & workflows" description="État issu de l’audit en lecture seule. Une configuration visible ne prouve pas une exécution récente : aucune exécution conservée n’a été trouvée pour ces modules du showcase." />
      <div className="grid gap-4 lg:grid-cols-2">{agents.map((agent) => { const EffectIcon = effectLabels[agent.sideEffect].icon; return <article key={agent.id} className="surface p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.12em] text-muted">{agent.workflowRef}</p><h2 className="mt-2 text-lg font-medium">{agent.name}</h2></div><StatusBadge status={agent.status} /></div><p className="mt-4 text-xs leading-6 text-muted">{agent.role}</p><div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[11px] text-muted"><EffectIcon size={16} />{effectLabels[agent.sideEffect].label}</div></article>; })}</div>
      <div className="surface flex items-start gap-3 p-5 text-xs leading-6 text-muted"><IconAlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={18} /><p><strong className="text-ink">Limite vérifiée :</strong> le workflow de conversation sait créer des événements et envoyer des emails. Ces outils resteront inaccessibles depuis le navigateur et bloqués en mode démo.</p></div>
    </section>
  );
}
