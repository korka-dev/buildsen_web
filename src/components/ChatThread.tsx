import type { Message } from "@/lib/types";

const when = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Dakar" });

// Fil de la conversation : les messages de l'utilisateur connecté sont à droite
export function ChatThread({ messages, meId, otherName }: { messages: Message[]; meId: string; otherName: string }) {
  if (!messages.length) return <p className="muted small">Aucun message pour l&apos;instant.</p>;
  return (
    <div className="chat" role="log" aria-live="polite">
      {messages.map((m) => {
        const mine = m.senderId === meId;
        return (
          <div key={m.id} className={`bubble${mine ? " me" : ""}`}>
            {m.body}
            <div className="meta">{mine ? "Vous" : otherName} · {when(m.createdAt)}</div>
          </div>
        );
      })}
    </div>
  );
}
