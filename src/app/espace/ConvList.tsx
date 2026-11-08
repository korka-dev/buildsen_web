import Link from "next/link";
import { STATUTS } from "@/lib/constants";
import type { ConversationSummary } from "@/lib/types";
import { BsIcon } from "@/components/bs/icons";

const when = (iso: string) => {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return d.toLocaleString("fr-FR", today ? { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Dakar" } : { day: "2-digit", month: "short", timeZone: "Africa/Dakar" });
};

/** Conversations avec les professionnels (messagerie et détail d'une demande). */
export function ConvList({ convs, withRequest = false, base = "/espace/messages" }: { convs: ConversationSummary[]; withRequest?: boolean; base?: string }) {
  return (
    <ul className="bs-conv-list">
      {convs.map((c) => (
        <li key={c.id}>
          <Link href={`${base}/${c.id}`} className={`bs-conv${c.unread ? " bs-unread" : ""}`}>
            <span className="bs-avatar" aria-hidden="true">{c.other.badge}</span>
            <span className="bs-conv-tx">
              <span className="bs-conv-top">
                <b>{c.other.name}</b>
                <small>{when(c.lastMessageAt)}</small>
              </span>
              <small className="bs-conv-who">
                {c.other.statut ? STATUTS[c.other.statut].name : "Professionnel"}
                {withRequest ? ` · ${c.request.title}` : ""}
              </small>
              <span className="bs-conv-last">
                {c.unread ? <i className="bs-dot" aria-label="Non lu" /> : null}
                {c.lastMessage}
              </span>
            </span>
            {c.shared ? (
              <span className="bs-wa-tag"><BsIcon name="phone" size={14} /> WhatsApp</span>
            ) : (
              <BsIcon name="chevronRight" size={20} />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
