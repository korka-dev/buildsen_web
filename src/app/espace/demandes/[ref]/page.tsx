import { RequestsView } from "../../RequestsView";

export const metadata = { title: "Ma demande · BUILDSEN" };

// Lien direct vers une demande (après publication, e-mails) : la liste avec le détail ouvert dans le modal
export default async function ClientRequest({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ envoyee?: string }> }) {
  const { ref } = await params;
  const { envoyee } = await searchParams;
  return <RequestsView openRef={decodeURIComponent(ref)} published={!!envoyee} />;
}
