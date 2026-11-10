import Link from "next/link";
import { IconCalendarCheck, IconMessageCircleCheck, IconRefreshAlert, IconUserCheck, IconUsers } from "@tabler/icons-react";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { getOrganizationId } from "@/lib/orchestra";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const organizationId = await getOrganizationId();
  const supabase = createServiceClient();
  const [prospects, qualified, appointments, followUps, conversations, agents, activity] = await Promise.all([
    supabase.from("orchestra_prospects").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
    supabase.from("orchestra_prospects").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "qualifie"),
    supabase.from("orchestra_appointments").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).in("status", ["proposed", "pending_confirmation", "confirmed"]),
    supabase.from("orchestra_follow_ups").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).in("status", ["draft", "pending_approval", "scheduled"]),
    supabase.from("orchestra_conversations").select("*", { count: "exact", head: true }).eq("organization_id", organizationId),
    supabase.from("orchestra_agents").select("id,name,workflow_ref,status,last_activity_at").eq("organization_id", organizationId).order("name"),
    supabase.from("orchestra_activity_logs").select("id,action,entity_type,actor_type,created_at,metadata").eq("organization_id", organizationId).order("created_at", { ascending: false }).limit(8),
  ]);
  return {
    counts: { prospects: prospects.count ?? 0, qualified: qualified.count ?? 0, appointments: appointments.count ?? 0, followUps: followUps.count ?? 0, conversations: conversations.count ?? 0 },
    agents: agents.data ?? [],
    activity: activity.data ?? [],
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const qualificationRate = data.counts.prospects ? Math.round((data.counts.qualified / data.counts.prospects) * 100) : 0;
  return (
    <section className="space-y-9">
      <PageHeader eyebrow="Pilotage en temps réel" title="Tout ce qui mérite votre attention." description="Les chiffres proviennent de Supabase et se mettent à jour à chaque nouvelle qualification, conversation, relance ou rendez-vous." actions={<StatusBadge status="verifie" />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Prospects entrants" value={String(data.counts.prospects)} change="Base active" icon={IconUsers} />
        <MetricCard label="Prospects qualifiés" value={String(data.counts.qualified)} change={`${qualificationRate} % des entrants`} icon={IconUserCheck} />
        <MetricCard label="Rendez-vous" value={String(data.counts.appointments)} change="Actifs ou à confirmer" icon={IconCalendarCheck} />
        <MetricCard label="Relances en attente" value={String(data.counts.followUps)} change="Validation requise" icon={IconRefreshAlert} />
        <MetricCard label="Conversations" value={String(data.counts.conversations)} change="Sessions enregistrées" icon={IconMessageCircleCheck} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <section className="surface p-5 sm:p-7">
          <p className="eyebrow">Accès rapide</p><h2 className="mt-3 text-xl font-medium">Parcours opérationnels</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link className="rounded-xl border border-line p-4 text-sm font-semibold hover:bg-sage-50" href="/dashboard/prospects">Ajouter et qualifier un prospect <span className="mt-2 block text-xs font-normal text-muted">Formulaire → Supabase → agent n8n</span></Link>
            <Link className="rounded-xl border border-line p-4 text-sm font-semibold hover:bg-sage-50" href="/dashboard/conversations">Tester une conversation <span className="mt-2 block text-xs font-normal text-muted">Calendrier et confirmation email</span></Link>
            <Link className="rounded-xl border border-line p-4 text-sm font-semibold hover:bg-sage-50" href="/dashboard/follow-ups">Préparer une relance <span className="mt-2 block text-xs font-normal text-muted">Bouton manuel et cron quotidien</span></Link>
            <Link className="rounded-xl border border-line p-4 text-sm font-semibold hover:bg-sage-50" href="/dashboard/stock">Gérer le stock <span className="mt-2 block text-xs font-normal text-muted">CRUD, entrées, sorties et seuils</span></Link>
          </div>
        </section>
        <section className="surface p-5 sm:p-7">
          <p className="eyebrow">Agents n8n</p><h2 className="mt-3 text-xl font-medium">État configuré</h2>
          <div className="mt-5 divide-y divide-line">
            {data.agents.map((agent) => <div key={agent.id} className="flex items-center justify-between gap-3 py-4"><div><p className="text-sm font-medium">{agent.name}</p><p className="mt-1 text-[11px] text-muted">Workflow {agent.workflow_ref}</p></div><StatusBadge status={agent.status === "verified" ? "verifie" : agent.status === "unavailable" ? "indisponible" : "configure"} /></div>)}
          </div>
        </section>
      </div>

      <section className="surface p-5 sm:p-7">
        <p className="eyebrow">Traçabilité</p><h2 className="mt-3 text-xl font-medium">Dernières actions enregistrées</h2>
        <div className="mt-5 divide-y divide-line">
          {data.activity.map((item) => <article key={item.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_1fr_auto]"><p className="text-sm font-medium">{String(item.action).replaceAll(".", " ")}</p><p className="text-xs text-muted">{item.actor_type} · {item.entity_type}</p><time className="text-[11px] text-muted">{new Date(item.created_at).toLocaleString("fr-FR")}</time></article>)}
          {data.activity.length === 0 ? <p className="py-8 text-sm text-muted">Les prochaines actions apparaîtront ici.</p> : null}
        </div>
      </section>
    </section>
  );
}
