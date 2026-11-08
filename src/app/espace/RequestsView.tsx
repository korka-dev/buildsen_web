import { api, requireClient } from "@/lib/api";
import type { ServiceRequest } from "@/lib/types";
import { BsIcon } from "@/components/bs/icons";
import { NewRequestButton } from "./NewRequest";
import { RequestList } from "./RequestList";

// Page « Mes demandes » ; openRef ouvre directement le détail d'une demande dans le modal
export async function RequestsView({ openRef, published }: { openRef?: string; published?: boolean }) {
  const [{ user }, { requests }] = await Promise.all([requireClient(), api<{ requests: ServiceRequest[] }>("/api/client/requests")]);
  const verified = !!user.emailVerifiedAt;
  return (
    <div className="bs-page">
      {/* Le bouton est sur la même ligne que le titre ; le nombre de demandes passe dessous */}
      <div className="bs-page-h bs-page-h-row">
        <div className="bs-title-row">
          <h1>Mes demandes</h1>
          <NewRequestButton email={user.email} verified={verified} className="btn p bs-new-btn" short="Nouvelle" />
        </div>
        <p>{requests.length ? `${requests.length} demande${requests.length > 1 ? "s" : ""}` : "Aucune demande pour l'instant"}</p>
      </div>
      {requests.length ? (
        <RequestList requests={requests} openRef={openRef} published={published} />
      ) : (
        <div className="bs-panel bs-empty-box">
          <span className="bs-ico"><BsIcon name="filePen" /></span>
          <h2>Vous n&apos;avez pas encore de demande</h2>
          <p>Décrivez votre projet en quelques minutes : plans, devis et métrés, dessin technique ou études de structure.</p>
          <NewRequestButton email={user.email} verified={verified} label="Décrire mon projet" />
        </div>
      )}
    </div>
  );
}
