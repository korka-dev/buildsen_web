import Link from "next/link";
import { api } from "@/lib/api";
import type { ConversationFull } from "@/lib/types";
import { ConversationView } from "@/components/ConversationView";

export const metadata = { title: "Conversation · Espace professionnel BUILDSEN" };

// Ouvrir la conversation la marque comme lue
export default async function ProConversation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { conversation, meId } = await api<{ conversation: ConversationFull; meId: string }>(`/api/conversations/${encodeURIComponent(id)}`);
  return (
    <>
      <Link className="small" href="/pro/demandes">← Demandes</Link>
      <div style={{ marginTop: 14 }}><ConversationView c={conversation} viewer="pro" meId={meId} /></div>
    </>
  );
}
