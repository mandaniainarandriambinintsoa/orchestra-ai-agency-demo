"use client";

import { useMemo, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { StatusBadge } from "@/components/ui/badge";
import type { Prospect, ProspectStatus } from "@/lib/domain";

const filters: { label: string; value: "all" | ProspectStatus }[] = [
  { label: "Tous les statuts", value: "all" },
  { label: "Nouveaux", value: "nouveau" },
  { label: "En cours", value: "en_cours" },
  { label: "Qualifiés", value: "qualifie" },
  { label: "Non qualifiés", value: "non_qualifie" },
  { label: "Convertis", value: "converti" },
];

export function ProspectsTable({ prospects }: { prospects: Prospect[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ProspectStatus>("all");
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return prospects.filter((prospect) => {
      const matchesStatus = status === "all" || prospect.status === status;
      const matchesQuery = !normalized || [prospect.name, prospect.company, prospect.email].some((value) => value.toLocaleLowerCase("fr").includes(normalized));
      return matchesStatus && matchesQuery;
    });
  }, [prospects, query, status]);

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-wrap gap-3 border-b border-line p-4 sm:p-5">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Rechercher un prospect</span>
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, entreprise ou email" className="min-h-11 w-full rounded-[10px] border border-line bg-white pl-10 pr-3 text-sm outline-none placeholder:text-[#929a8d] focus:border-sage-600" />
        </label>
        <label>
          <span className="sr-only">Filtrer par statut</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as "all" | ProspectStatus)} className="min-h-11 rounded-[10px] border border-line bg-white px-3 text-sm text-ink focus:border-sage-600">
            {filters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-left">
          <thead className="bg-[#fbfcf8] text-[10px] uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Prospect</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
              <th className="px-5 py-3 font-semibold">Score IA</th>
              <th className="px-5 py-3 font-semibold">Source</th>
              <th className="px-5 py-3 font-semibold">Dernière activité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((prospect) => (
              <tr key={prospect.id} className="transition-colors hover:bg-sage-50/60">
                <td className="px-5 py-4"><p className="text-sm font-medium">{prospect.name}</p><p className="mt-1 text-[11px] text-muted">{prospect.company} · {prospect.email}</p></td>
                <td className="px-5 py-4"><StatusBadge status={prospect.status} /></td>
                <td className="px-5 py-4 text-sm font-semibold tabular-nums">{prospect.score === null ? "—" : `${prospect.score}/100`}</td>
                <td className="px-5 py-4 text-xs text-muted">{prospect.source}</td>
                <td className="px-5 py-4 text-xs text-muted">{prospect.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visible.length === 0 ? <div className="p-10 text-center"><p className="text-sm font-medium">Aucun prospect trouvé</p><p className="mt-2 text-xs text-muted">Modifiez la recherche ou le filtre de statut.</p></div> : null}
    </section>
  );
}
