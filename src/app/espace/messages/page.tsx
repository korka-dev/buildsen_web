import { api } from "@/lib/api";
import type { ConversationSummary } from "@/lib/types";
import { BsIcon } from "@/components/bs/icons";
import { ConvList } from "../ConvList";

export const metadata = { title: "Messagerie · BUILDSEN" };

export default async function ClientMessages() {
  const { conversations: convs } = await api<{ conversations: ConversationSummary[] }>("/api/client/conversations");
  const unread = convs.filter((c) => c.unread).length;
  return (
    <div className="bs-page bs-narrow">
      <div className="bs-page-h">
        <div>
          <h1>Messagerie</h1>
          <p>
            {convs.length
              ? `${convs.length} conversation${convs.length > 1 ? "s" : ""}${unread ? ` · ${unread} non lue${unread > 1 ? "s" : ""}` : ""}`
              : "Les professionnels qui vous ont écrit, toutes demandes confondues"}
          </p>
        </div>
      </div>
      {convs.length ? (
        <section className="bs-panel bs-panel-list">
          <ConvList convs={convs} withRequest />
        </section>
      ) : (
        <div className="bs-panel bs-empty-box">
          <span className="bs-ico"><BsIcon name="messages" /></span>
          <h2>Aucun message pour l&apos;instant</h2>
          <p>Dès qu&apos;un professionnel vous écrit, vous retrouvez la conversation ici et recevez un e-mail.</p>
        </div>
      )}
    </div>
  );
}
