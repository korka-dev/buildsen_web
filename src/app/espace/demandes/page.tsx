import { RequestsView } from "../RequestsView";

export const metadata = { title: "Mes demandes · BUILDSEN" };

// Toutes les demandes du particulier, avec leur statut ; le détail s'ouvre dans un modal
export default function ClientRequests() {
  return <RequestsView />;
}
