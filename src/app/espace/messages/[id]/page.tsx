import Link from "next/link";
import { api } from "@/lib/api";
import type { ConversationFull } from "@/lib/types";
import { ConversationView } from "@/components/ConversationView";
import { BsIcon } from "@/components/bs/icons";

export const metadata = { title: "Conversation · BUILDSEN" };

// Ouvrir la conversation la marque comme lue
export default async function ClientConversation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { conversation, meId } = await api<{ conversation: ConversationFull; meId: string }>(`/api/conversations/${encodeURIComponent(id)}`);
  return (
    <div className="bs-page bs-conv-page">
      <Link className="bs-back" href={`/espace/demandes/${encodeURIComponent(conversation.request.ref)}`}><BsIcon name="chevronLeft" size={18} /> Retour à la demande</Link>
      <ConversationView c={conversation} viewer="client" meId={meId} />
    </div>
  );
}
