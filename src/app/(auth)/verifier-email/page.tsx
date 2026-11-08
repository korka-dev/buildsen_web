import Link from "next/link";
import { PublicHeader } from "@/components/ui";
import { apiRaw } from "@/lib/api";

export const metadata = { title: "Confirmation de l'adresse e-mail · BUILDSEN" };

// Confirmation de l'adresse e-mail d'un particulier à partir du lien reçu
export default async function Page({ searchParams }: { searchParams: Promise<{ jeton?: string }> }) {
  const { jeton } = await searchParams;
  // Confirmation par le jeton secret reçu par e-mail (à usage unique)
  const { data } = await apiRaw<{ ok: boolean; firstName?: string }>("/api/auth/verify-email", { method: "POST", body: { token: jeton ?? "" } });
  const u = data.ok ? { firstName: data.firstName ?? "" } : null;
  return (
    <>
      <PublicHeader />
      <main id="contenu" tabIndex={-1} className="narrow">
        <div className="card stack" style={{ gap: 16, padding: 30 }}>
          {u ? (
            <>
              <h1>Adresse confirmée</h1>
              <p className="muted">Merci {u.firstName} ! Vous pouvez maintenant décrire votre projet.</p>
              <Link className="btn p" href="/espace/demandes/nouvelle" style={{ alignSelf: "flex-start" }}>Décrire mon projet</Link>
            </>
          ) : (
            <>
              <h1>Lien expiré ou déjà utilisé</h1>
              <p className="muted">Connectez-vous à votre espace : si votre adresse n&apos;est pas encore confirmée, vous pourrez recevoir un nouveau lien.</p>
              <Link className="btn p" href="/connexion" style={{ alignSelf: "flex-start" }}>Se connecter</Link>
            </>
          )}
        </div>
      </main>
    </>
  );
}
