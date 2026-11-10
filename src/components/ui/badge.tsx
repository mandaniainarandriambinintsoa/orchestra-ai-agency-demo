import type { AutomationStatus, ProspectStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";

const labels: Record<AutomationStatus | ProspectStatus | "demo", string> = {
  verifie: "Vérifié",
  configure: "Configuré",
  simule: "Simulé",
  indisponible: "Indisponible",
  nouveau: "Nouveau",
  en_cours: "En cours",
  qualifie: "Qualifié",
  non_qualifie: "Non qualifié",
  converti: "Converti",
  demo: "Données démo",
};

const tones: Record<AutomationStatus | ProspectStatus | "demo", string> = {
  verifie: "border-emerald-200 bg-emerald-50 text-emerald-800",
  configure: "border-sky-200 bg-sky-50 text-sky-800",
  simule: "border-amber-200 bg-amber-50 text-amber-800",
  indisponible: "border-stone-200 bg-stone-100 text-stone-700",
  nouveau: "border-sky-200 bg-sky-50 text-sky-800",
  en_cours: "border-amber-200 bg-amber-50 text-amber-800",
  qualifie: "border-emerald-200 bg-emerald-50 text-emerald-800",
  non_qualifie: "border-rose-200 bg-rose-50 text-rose-800",
  converti: "border-violet-200 bg-violet-50 text-violet-800",
  demo: "border-sage-200 bg-sage-50 text-sage-700",
};

export function StatusBadge({
  status,
  className,
}: {
  status: AutomationStatus | ProspectStatus | "demo";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
        tones[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
