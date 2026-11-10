"use client";

import { FormEvent, useMemo, useState } from "react";
import { IconCalendarEvent, IconMail, IconRobot, IconSend } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

type Scenario = "colis" | "dentiste" | "garagiste";
type Message = { id: string; role: "agent" | "user"; body: string };

const scenarios: Record<Scenario, { label: string; greeting: string; detail: string }> = {
  colis: {
    label: "Colis",
    greeting: "Bonjour ! Je peux vérifier le statut de votre colis. Avez-vous un numéro de suivi au format FR-XXXX-XXXX ?",
    detail: "Suivi fictif, puis récapitulatif envoyé à l’adresse saisie.",
  },
  dentiste: {
    label: "Dentiste",
    greeting: "Bonjour ! Quel soin souhaitez-vous réserver et quels jours vous conviennent ?",
    detail: "Disponibilités Google Calendar, réservation et email de confirmation.",
  },
  garagiste: {
    label: "Garagiste",
    greeting: "Bonjour ! Quelle intervention souhaitez-vous planifier et pour quel véhicule ?",
    detail: "Disponibilités Google Calendar, réservation et email de confirmation.",
  },
};

export function ConversationWorkspace() {
  const [scenario, setScenario] = useState<Scenario>("colis");
  const [messages, setMessages] = useState<Record<Scenario, Message[]>>({
    colis: [{ id: "welcome-colis", role: "agent", body: scenarios.colis.greeting }],
    dentiste: [{ id: "welcome-dentiste", role: "agent", body: scenarios.dentiste.greeting }],
    garagiste: [{ id: "welcome-garagiste", role: "agent", body: scenarios.garagiste.greeting }],
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const sessionIds = useMemo<Record<Scenario, string>>(
    () => ({
      colis: `orchestra-colis-${crypto.randomUUID()}`,
      dentiste: `orchestra-dentiste-${crypto.randomUUID()}`,
      garagiste: `orchestra-garagiste-${crypto.randomUUID()}`,
    }),
    [],
  );

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = new FormData(form).get("message")?.toString().trim();
    if (!input || pending) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", body: input };
    setMessages((current) => ({ ...current, [scenario]: [...current[scenario], userMessage] }));
    form.reset();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, sessionId: sessionIds[scenario], userMessage: input }),
      });
      const payload = (await response.json()) as { data?: { reply: string }; error?: { message?: string } };
      if (!response.ok || !payload.data) throw new Error(payload.error?.message || "Agent indisponible");
      setMessages((current) => ({
        ...current,
        [scenario]: [...current[scenario], { id: crypto.randomUUID(), role: "agent", body: payload.data!.reply }],
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "L’agent est indisponible.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="surface overflow-hidden">
      <header className="border-b border-line p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(scenarios) as Scenario[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setScenario(key)}
              className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${scenario === key ? "border-ink bg-ink text-white" : "border-line bg-white hover:bg-sage-50"}`}
            >
              {scenarios[key].label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs leading-6 text-muted">{scenarios[scenario].detail}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted">
          <span className="flex items-center gap-2"><IconRobot size={15} />Agent n8n avec mémoire</span>
          <span className="flex items-center gap-2"><IconCalendarEvent size={15} />Calendrier réel pour les rendez-vous</span>
          <span className="flex items-center gap-2"><IconMail size={15} />Email après confirmation explicite</span>
        </div>
      </header>

      <div className="min-h-[440px] space-y-3 bg-[#fdfdfb] p-5 sm:p-7" aria-live="polite">
        {messages[scenario].map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <p className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-ink text-white" : "border border-line bg-white text-ink"}`}>
              {message.body}
            </p>
          </div>
        ))}
        {pending ? <p className="text-xs text-muted">L’agent réfléchit…</p> : null}
        {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-800" role="alert">{error}</p> : null}
      </div>

      <form onSubmit={send} className="flex gap-3 border-t border-line p-4">
        <label className="flex-1"><span className="sr-only">Votre message</span><input name="message" required maxLength={2000} autoComplete="off" className="min-h-12 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-sage-600" placeholder="Tapez votre message…" /></label>
        <Button disabled={pending} aria-label="Envoyer"><IconSend size={18} /><span className="hidden sm:inline">Envoyer</span></Button>
      </form>
    </section>
  );
}
