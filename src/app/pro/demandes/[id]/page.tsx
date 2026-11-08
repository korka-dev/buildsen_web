import { ProRequestsView } from "../View";

export const metadata = { title: "Demande · BUILDSEN" };

// Lien direct vers une demande (notifications, e-mails) : la liste avec le détail ouvert dans la fenêtre
export default async function ProRequest({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProRequestsView openId={decodeURIComponent(id)} vue="toutes" />;
}
