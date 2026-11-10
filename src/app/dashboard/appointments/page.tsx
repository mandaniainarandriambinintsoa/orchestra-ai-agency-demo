import { IconCalendar, IconClock, IconMailCheck } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";

const appointments = [
  { day: "11", month: "NOV", time: "10:00", prospect: "Sophie Laurent", company: "Nova RH", subject: "Cadrage qualification IA", status: "Confirmé — démo" },
  { day: "12", month: "NOV", time: "14:30", prospect: "Thomas Bernard", company: "Atelier Kumo", subject: "Automatisation des relances", status: "À confirmer" },
  { day: "14", month: "NOV", time: "09:00", prospect: "Inès Martin", company: "Buroline Services", subject: "Découverte des besoins", status: "Proposé" },
];

export const metadata = { title: "Rendez-vous" };

export default function AppointmentsPage() {
  return (
    <section className="space-y-8">
      <PageHeader eyebrow="Agenda" title="Rendez-vous" description="Le calendrier présente un parcours contrôlé. La synchronisation Google Calendar réelle est volontairement inactive dans l’environnement public." actions={<StatusBadge status="simule" />} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="surface p-5 sm:p-7"><header><p className="eyebrow">Prochains créneaux</p><h2 className="mt-3 text-xl font-medium">Agenda de l’équipe</h2></header><div className="mt-5 divide-y divide-line">{appointments.map((appointment) => <article key={`${appointment.day}-${appointment.time}`} className="grid gap-4 py-5 sm:grid-cols-[64px_90px_1fr_auto] sm:items-center"><div className="rounded-xl bg-sage-50 p-2 text-center"><strong className="block text-xl font-medium">{appointment.day}</strong><span className="text-[9px] font-semibold tracking-[.12em] text-sage-700">{appointment.month}</span></div><p className="flex items-center gap-2 text-sm font-semibold tabular-nums"><IconClock size={16} />{appointment.time}</p><div><h3 className="text-sm font-medium">{appointment.subject}</h3><p className="mt-1 text-xs text-muted">{appointment.prospect} · {appointment.company}</p></div><span className="text-[11px] text-muted">{appointment.status}</span></article>)}</div></section>
        <aside className="surface p-5 sm:p-7"><span className="grid size-11 place-items-center rounded-full bg-sage-50 text-sage-700"><IconCalendar size={21} /></span><h2 className="mt-5 text-xl font-medium">Parcours démontré</h2><ol className="mt-5 space-y-4 text-xs leading-6 text-muted"><li><strong className="text-ink">01.</strong> Prospect entrant</li><li><strong className="text-ink">02.</strong> Qualification IA</li><li><strong className="text-ink">03.</strong> Trois créneaux proposés</li><li><strong className="text-ink">04.</strong> Validation humaine</li><li><strong className="text-ink">05.</strong> Email récapitulatif</li></ol><div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><IconMailCheck className="mt-0.5 shrink-0" size={17} /><p>L’étape d’envoi réel reste bloquée tant que les effets externes ne sont pas explicitement autorisés.</p></div></aside>
      </div>
    </section>
  );
}
