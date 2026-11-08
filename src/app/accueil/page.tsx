import Link from "next/link";
import { redirect } from "next/navigation";
import { requireMember } from "@/lib/api";
import { MAX_PROS_PER_REQUEST } from "@/lib/constants";
import { Footer } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { MemberHeader } from "@/components/MemberHeader";

export const metadata = { title: "Accueil · BUILDSEN" };

// Accueil commun aux particuliers et aux professionnels connectés
export default async function MemberHome() {
  const me = await requireMember();
  const client = me.user.role === "CLIENT";
  // Le particulier arrive directement sur son tableau de bord
  if (client) redirect("/espace");
  // Le professionnel arrive directement dans son espace (menu à gauche)
  if (me.user.role === "PRO") redirect("/pro");
  const next = me.next ?? null;
  const n = me.notifs;
  const summary = n?.items.length ? n.title : next ? (next.cta ? "Votre profil n'est pas encore vérifié." : next.title) : "Aucune nouveauté pour l'instant.";
  return (
    <>
      <MemberHeader me={me} />
      <main id="contenu" tabIndex={-1} className="home-m">
        <div className="wrap stack" style={{ gap: 30 }}>
          <div className="hm-hello">
            <div>
              <h1>Bonjour {me.user.firstName}</h1>
              <p>{summary}</p>
            </div>
            <Link className="btn p hm-access" href={client ? "/espace" : "/pro"}>
              <Icon name={client ? "demandes" : "pro"} />{client ? "Accéder à mes demandes" : "Accéder à mon espace pro"}
            </Link>
          </div>
          {next && (
            <div className="note w row between" style={{ gap: 14 }}>
              <span><b>{next.title}</b><br />{next.text}</span>
              {next.cta && <Link className="btn p" href="/pro/verification">{next.cta}</Link>}
            </div>
          )}
          {client && (
            <div className="cta-band">
              <div className="stack" style={{ gap: 8, maxWidth: "60ch" }}>
                <h2>Un nouveau projet ?</h2>
                <p>Décrivez votre besoin : jusqu&apos;à {MAX_PROS_PER_REQUEST} professionnels vérifiés vous écrivent dans la messagerie.</p>
              </div>
              <Link className="btn" href="/espace/demandes/nouvelle">Décrire mon projet</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
