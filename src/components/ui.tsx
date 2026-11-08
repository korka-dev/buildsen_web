import Link from "next/link";
import { CLIENTS_OPEN, DOSSIER_LABELS, TEAM_INBOX, whatsappLink } from "@/lib/constants";
import { getMe } from "@/lib/api";
import { PublicNav } from "./bs/PublicNav";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link className="logo" href={href} aria-label="BUILDSEN, accueil">
      <span className="w"><span className="b">BUILD</span><span className="s">SEN</span></span>
      <span className="t">Construire avec confiance.</span>
    </Link>
  );
}

export function Pill({ children, tone = "" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

export function DossierPill({ state }: { state: string }) {
  const [t, c] = DOSSIER_LABELS[state] ?? [state, ""];
  return <Pill tone={c}>{t}</Pill>;
}

// En-tête public (design BUILDSEN) : logo à gauche, rubriques au centre, « Se connecter » à droite
export async function PublicHeader() {
  const s = await getMe();
  const space = s.user?.role === "PRO" ? "/pro" : s.user?.role === "CLIENT" ? "/espace" : null;
  return (
    <header className="bs-hdr">
      <div className="bs-hdr-in">
        <Logo />
        <PublicNav space={space} />
      </div>
    </header>
  );
}

// Pied de page vert (même vert que le bouton « Se connecter »)
export function Footer() {
  return (
    <footer className="bs-footer">
      <div className="bs-footer-in">
        <div>
          <Logo />
          <p className="bs-hide-m" style={{ marginTop: 8 }}>
            Vos plans, devis, métrés et études, réalisés par des professionnels vérifiés à Dakar.
          </p>
          <p className="bs-sub">
            © {new Date().getFullYear()} BUILDSEN · Dakar, Sénégal{CLIENTS_OPEN ? "" : " · Phase pilote"} · Aucun paiement ne transite par la plateforme.
          </p>
        </div>
        <ul>
          <li className="bs-hide-m"><Link href="/#a-propos">À propos</Link></li>
          <li><Link href="/cgu">Conditions générales</Link></li>
          <li><Link href="/confidentialite">Confidentialité</Link></li>
          <li className="bs-hide-m"><a href={`mailto:${TEAM_INBOX}`}>{TEAM_INBOX}</a></li>
          <li>
            <a className="bs-strong" href={whatsappLink("Bonjour BUILDSEN, j'ai besoin d'aide.")} target="_blank" rel="noopener">
              Nous écrire sur WhatsApp
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="f">
      {label}
      {hint && <span className="h">{hint}</span>}
      {children}
      {error && <span className="err-t">{error}</span>}
    </label>
  );
}

export const initials = (first: string, last: string) => `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

// Initiales d'une entreprise : premières lettres des deux premiers mots (« Sahel Études & Structures » → « SE »)
export const companyInitials = (name: string) =>
  name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^A-Za-z0-9]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
