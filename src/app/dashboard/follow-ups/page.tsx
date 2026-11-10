import { IconMail, IconMessage, IconShieldCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";

const followUps = [
  { prospect: "Thomas Bernard", company: "Atelier Kumo", channel: "Email", due: "Aujourd’hui, 16:00", message: "Bonjour Thomas, je reviens vers vous avec une proposition simple pour automatiser le suivi de vos devis…", state: "À valider" },
  { prospect: "Inès Martin", company: "Buroline Services", channel: "LinkedIn", due: "Demain, 09:30", message: "Bonjour Inès, votre besoin de centralisation des demandes fait écho à plusieurs missions récentes…", state: "Brouillon IA" },
  { prospect: "Emma Roux", company: "Maison Rivage", channel: "Email", due: "12 nov., 11:00", message: "Bonjour Emma, avant de clôturer notre échange, souhaitez-vous recevoir un exemple de parcours automatisé ?", state: "À valider" },
];

export const metadata = { title: "Relances" };

export default function FollowUpsPage() {
  return (
    <section className="space-y-8">
      <PageHeader eyebrow="Validation humaine" title="Relances automatisées" description="L’IA prépare les messages, l’équipe garde la décision finale. Les envois automatiques sont désactivés dans le prototype." actions={<StatusBadge status="simule" />} />
      <div className="rounded-[16px] border border-sage-200 bg-sage-50 p-4 text-xs text-sage-800 sm:flex sm:items-center sm:justify-between"><span className="flex items-center gap-3"><IconShieldCheck size={18} />Protection active : aucun envoi sans validation humaine.</span><strong className="mt-2 block sm:mt-0">0 message envoyé</strong></div>
      <div className="grid gap-4 xl:grid-cols-3">{followUps.map((followUp) => <article key={`${followUp.prospect}-${followUp.due}`} className="surface flex min-h-[330px] flex-col p-5"><div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-full bg-sage-50 text-sage-700">{followUp.channel === "Email" ? <IconMail size={19} /> : <IconMessage size={19} />}</span><span className="text-[10px] uppercase tracking-[.1em] text-muted">{followUp.state}</span></div><h2 className="mt-5 text-lg font-medium">{followUp.prospect}</h2><p className="mt-1 text-xs text-muted">{followUp.company} · {followUp.channel}</p><p className="mt-5 rounded-xl bg-[#fafbf8] p-4 text-xs leading-6 text-muted">{followUp.message}</p><div className="mt-auto flex items-end justify-between gap-3 pt-5"><p className="text-[11px] text-muted">Prévue : {followUp.due}</p><Button size="small" variant="secondary" disabled>Valider</Button></div></article>)}</div>
    </section>
  );
}
