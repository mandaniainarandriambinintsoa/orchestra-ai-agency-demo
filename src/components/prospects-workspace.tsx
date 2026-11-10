"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { IconPlus, IconRefresh, IconSearch, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import type { ProspectStatus } from "@/lib/domain";

type ProspectRow = {
  id: number; full_name: string; company_name: string; email: string | null;
  status: ProspectStatus; qualification_score: number | null;
  qualification_summary: string | null; qualification_subject: string | null;
  interest_level: "high" | "medium" | "low" | "unknown" | null;
  request_text: string | null; source: string; created_at: string;
};

const fieldClass = "min-h-11 w-full rounded-[10px] border border-line bg-white px-3 text-sm outline-none placeholder:text-[#929a8d] focus:border-sage-600";

export function ProspectsWorkspace() {
  const [prospects, setProspects] = useState<ProspectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/prospects", { cache: "no-store" });
      const payload = (await response.json()) as { data?: ProspectRow[]; error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message || "Lecture impossible");
      setProspects(payload.data ?? []);
    } catch {
      setNotice("Impossible de charger les prospects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/prospects", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as { data?: ProspectRow[] };
        if (!response.ok) throw new Error();
        return payload.data ?? [];
      })
      .then((data) => { if (!cancelled) setProspects(data); })
      .catch(() => { if (!cancelled) setNotice("Impossible de charger les prospects."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    if (!normalized) return prospects;
    return prospects.filter((prospect) =>
      [prospect.full_name, prospect.company_name, prospect.email ?? "", prospect.request_text ?? ""]
        .some((value) => value.toLocaleLowerCase("fr").includes(normalized)),
    );
  }, [prospects, query]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSubmitting(true);
    setNotice("");
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          companyName: form.get("companyName"),
          request: form.get("request"),
        }),
      });
      const payload = (await response.json()) as { warning?: string; error?: { message?: string } };
      if (!response.ok && response.status !== 202) throw new Error(payload.error?.message || "Création impossible");
      setNotice(payload.warning ?? "Prospect enregistré et qualifié par l’agent IA.");
      formElement.reset();
      setShowForm(false);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Création impossible.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <label className="relative min-w-[240px] flex-1">
          <span className="sr-only">Rechercher</span>
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${fieldClass} pl-10`} placeholder="Nom, email, entreprise ou demande" />
        </label>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}><IconRefresh size={17} />Actualiser</Button>
        <Button onClick={() => setShowForm((value) => !value)}><IconPlus size={17} />Nouveau prospect</Button>
      </div>

      {notice ? <p className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-800" role="status">{notice}</p> : null}

      {showForm ? (
        <form onSubmit={submit} className="surface grid gap-4 p-5 md:grid-cols-2">
          <div><label htmlFor="prospect-full-name" className="mb-2 block text-xs font-semibold">Nom complet</label><input id="prospect-full-name" name="fullName" required minLength={2} maxLength={160} className={fieldClass} /></div>
          <div><label htmlFor="prospect-email" className="mb-2 block text-xs font-semibold">Email</label><input id="prospect-email" name="email" required type="email" maxLength={254} className={fieldClass} /></div>
          <div className="md:col-span-2"><label htmlFor="prospect-company" className="mb-2 block text-xs font-semibold">Entreprise <span className="font-normal text-muted">(facultatif)</span></label><input id="prospect-company" name="companyName" maxLength={180} className={fieldClass} /></div>
          <div className="md:col-span-2"><label htmlFor="prospect-request" className="mb-2 block text-xs font-semibold">Demande du prospect</label><textarea id="prospect-request" name="request" required minLength={10} maxLength={3000} rows={5} className={`${fieldClass} py-3`} placeholder="Ex. Nous recevons beaucoup de demandes et souhaitons automatiser leur qualification…" /></div>
          <div className="md:col-span-2 flex justify-end"><Button disabled={submitting}><IconSparkles size={17} />{submitting ? "Qualification en cours…" : "Enregistrer et qualifier"}</Button></div>
        </form>
      ) : null}

      <section className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-[#fbfcf8] text-[10px] uppercase tracking-[.12em] text-muted">
              <tr><th className="px-5 py-3">Prospect</th><th className="px-5 py-3">Demande / sujet</th><th className="px-5 py-3">Intérêt</th><th className="px-5 py-3">Score IA</th><th className="px-5 py-3">Statut</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((prospect) => (
                <tr key={prospect.id} className="align-top hover:bg-sage-50/50">
                  <td className="px-5 py-4"><p className="text-sm font-medium">{prospect.full_name}</p><p className="mt-1 text-[11px] text-muted">{prospect.company_name} · {prospect.email}</p></td>
                  <td className="max-w-[430px] px-5 py-4"><p className="text-xs font-semibold">{prospect.qualification_subject ?? "Analyse en attente"}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{prospect.qualification_summary ?? prospect.request_text}</p></td>
                  <td className="px-5 py-4 text-xs font-semibold">{prospect.interest_level === "high" ? "Élevé" : prospect.interest_level === "medium" ? "Moyen" : prospect.interest_level === "low" ? "Faible" : "—"}</td>
                  <td className="px-5 py-4 text-sm font-semibold tabular-nums">{prospect.qualification_score === null ? "—" : `${prospect.qualification_score}/100`}</td>
                  <td className="px-5 py-4"><StatusBadge status={prospect.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && visible.length === 0 ? <p className="p-10 text-center text-sm text-muted">Aucun prospect pour le moment.</p> : null}
        {loading ? <p className="p-10 text-center text-sm text-muted">Chargement…</p> : null}
      </section>
    </div>
  );
}
