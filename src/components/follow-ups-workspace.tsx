"use client";

import { useCallback, useEffect, useState } from "react";
import { IconClock, IconMail, IconRefresh, IconShieldCheck, IconSparkles } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

type ProspectOption = { id: number; full_name: string; company_name: string; email: string; status: string };
type FollowUp = {
  id: number; prospect_id: number; channel: string; status: string;
  proposed_message: string; scheduled_for: string | null; generation_source: "manual" | "cron"; created_at: string;
};

export function FollowUpsWorkspace() {
  const [prospects, setProspects] = useState<ProspectOption[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [selected, setSelected] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/follow-ups", { cache: "no-store" });
      const payload = (await response.json()) as { data?: { prospects: ProspectOption[]; followUps: FollowUp[] } };
      if (!response.ok || !payload.data) throw new Error();
      setProspects(payload.data.prospects);
      setFollowUps(payload.data.followUps);
      setSelected((current) => current || String(payload.data?.prospects[0]?.id ?? ""));
    } catch {
      setNotice("Impossible de charger les relances.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/follow-ups", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as { data?: { prospects: ProspectOption[]; followUps: FollowUp[] } };
        if (!response.ok || !payload.data) throw new Error();
        return payload.data;
      })
      .then((data) => {
        if (cancelled) return;
        setProspects(data.prospects);
        setFollowUps(data.followUps);
        setSelected(String(data.prospects[0]?.id ?? ""));
      })
      .catch(() => { if (!cancelled) setNotice("Impossible de charger les relances."); });
    return () => { cancelled = true; };
  }, []);

  async function generate() {
    if (!selected) return;
    setPending(true);
    setNotice("");
    try {
      const response = await fetch("/api/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectId: Number(selected) }),
      });
      const payload = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message || "Génération impossible");
      setNotice("Relance générée. Elle attend votre validation.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Génération impossible.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[16px] border border-sage-200 bg-sage-50 p-4 text-xs text-sage-800 sm:flex sm:items-center sm:justify-between">
        <span className="flex items-center gap-3"><IconShieldCheck size={18} />Validation humaine active : l’IA prépare, l’équipe décide de l’envoi.</span>
        <span className="mt-2 flex items-center gap-2 font-semibold sm:mt-0"><IconClock size={16} />Cron quotidien à 08:00 UTC</span>
      </div>

      <section className="surface flex flex-wrap items-end gap-3 p-5">
        <label className="min-w-[260px] flex-1">
          <span className="mb-2 block text-xs font-semibold">Prospect à relancer</span>
          <select value={selected} onChange={(event) => setSelected(event.target.value)} className="min-h-11 w-full rounded-[10px] border border-line bg-white px-3 text-sm">
            {prospects.map((prospect) => <option key={prospect.id} value={prospect.id}>{prospect.full_name} · {prospect.company_name}</option>)}
          </select>
        </label>
        <Button variant="secondary" onClick={() => void load()}><IconRefresh size={17} />Actualiser</Button>
        <Button onClick={() => void generate()} disabled={!selected || pending}><IconSparkles size={17} />{pending ? "Génération…" : "Générer la relance"}</Button>
      </section>

      {notice ? <p className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-800" role="status">{notice}</p> : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {followUps.map((followUp) => {
          const prospect = prospects.find((item) => item.id === followUp.prospect_id);
          return (
            <article key={followUp.id} className="surface flex min-h-[300px] flex-col p-5">
              <div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-full bg-sage-50 text-sage-700"><IconMail size={19} /></span><span className="text-[10px] uppercase tracking-[.1em] text-muted">{followUp.status.replace("_", " ")}</span></div>
              <h2 className="mt-5 text-lg font-medium">{prospect?.full_name ?? `Prospect #${followUp.prospect_id}`}</h2>
              <p className="mt-1 text-xs text-muted">{prospect?.company_name ?? "Entreprise"} · {followUp.generation_source === "cron" ? "Cron" : "Manuel"}</p>
              <p className="mt-5 whitespace-pre-wrap rounded-xl bg-[#fafbf8] p-4 text-xs leading-6 text-muted">{followUp.proposed_message}</p>
              <p className="mt-auto pt-5 text-[11px] text-muted">Créée le {new Date(followUp.created_at).toLocaleString("fr-FR")}</p>
            </article>
          );
        })}
      </div>
      {followUps.length === 0 ? <p className="surface p-10 text-center text-sm text-muted">Aucune relance générée pour le moment.</p> : null}
    </div>
  );
}
