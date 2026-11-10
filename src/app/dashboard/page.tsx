import Link from "next/link";
import {
  IconCalendarCheck,
  IconMessageCircleCheck,
  IconRefreshAlert,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import { ActivityChart } from "@/components/charts/activity-chart";
import { StatusBadge } from "@/components/ui/badge";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { activities, agents } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <section className="space-y-9">
      <PageHeader
        eyebrow="Pilotage quotidien"
        title="Tout ce qui mérite votre attention."
        description="Prospects, conversations et automatisations réunis dans une vue opérationnelle. Les chiffres affichés aujourd’hui sont des données de démonstration clairement identifiées."
        actions={<StatusBadge status="demo" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Prospects entrants" value="112" change="+18 % / 7 j" icon={IconUsers} />
        <MetricCard label="Prospects qualifiés" value="68" change="60,7 %" icon={IconUserCheck} />
        <MetricCard label="Rendez-vous" value="21" change="7 à confirmer" icon={IconCalendarCheck} />
        <MetricCard label="Relances en attente" value="14" change="Validation requise" icon={IconRefreshAlert} />
        <MetricCard label="Conversations traitées" value="87" change="12 aujourd’hui" icon={IconMessageCircleCheck} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
        <section className="surface min-w-0 p-5 sm:p-7">
          <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Activité sur 7 jours</p>
              <h2 className="mt-3 text-xl font-medium tracking-[-0.025em]">Entrants et qualification</h2>
            </div>
            <div className="flex gap-4 text-[11px] text-muted">
              <span className="flex items-center gap-2"><i className="size-2 rounded-full bg-sage-600" />Entrants</span>
              <span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#9cad92]" />Qualifiés</span>
            </div>
          </header>
          <ActivityChart />
        </section>

        <section className="surface p-5 sm:p-7">
          <header>
            <p className="eyebrow">Agents & automatisations</p>
            <h2 className="mt-3 text-xl font-medium tracking-[-0.025em]">État vérifié</h2>
          </header>
          <div className="mt-5 divide-y divide-line">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between gap-3 py-4 first:pt-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{agent.name}</p>
                  <p className="mt-1 truncate text-[11px] text-muted">Workflow {agent.workflowRef}</p>
                </div>
                <StatusBadge status={agent.status} />
              </div>
            ))}
          </div>
          <Link href="/dashboard/agents" className="mt-4 inline-flex min-h-11 items-center text-xs font-semibold text-sage-700 hover:text-ink">Voir la supervision complète →</Link>
        </section>
      </div>

      <section className="surface p-5 sm:p-7">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Traçabilité</p>
            <h2 className="mt-3 text-xl font-medium tracking-[-0.025em]">Dernières actions</h2>
          </div>
          <span className="text-[11px] text-muted">Source : jeu de données de démonstration</span>
        </header>
        <div className="mt-5 divide-y divide-line">
          {activities.map((activity) => (
            <article key={activity.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_2fr_auto] sm:items-center sm:gap-5">
              <p className="text-sm font-medium">{activity.label}</p>
              <p className="text-xs leading-6 text-muted">{activity.detail}</p>
              <time className="text-[11px] text-muted">{activity.at}</time>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
