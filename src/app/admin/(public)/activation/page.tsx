import QRCode from "qrcode";
import { Logo } from "@/components/ui";
import { apiRaw } from "@/lib/api";
import { ActivateForm } from "../../forms";

export const metadata = { title: "Activer mon accès administrateur · BUILDSEN" };

export default async function Page({ searchParams }: { searchParams: Promise<{ jeton?: string }> }) {
  const { jeton = "" } = await searchParams;
  const { data: u } = await apiRaw<{ valid: boolean; firstName?: string; email?: string; role?: string; secret?: string; uri?: string }>(`/api/admin/activation?token=${encodeURIComponent(jeton)}`);
  const valid = u.valid;
  const uri = valid ? u.uri ?? "" : "";
  const qr = valid ? await QRCode.toDataURL(uri, { margin: 1, width: 200 }) : "";
  return (
    <>
      <header className="hdr"><div className="hdr-in"><Logo /><span className="pill ink" style={{ marginLeft: "auto" }}>Administration</span></div></header>
      <div className="narrow">
        <div className="card stack" style={{ gap: 16, padding: 30 }}>
          <h1>Activer mon accès</h1>
          {!valid ? <div className="note e">Ce lien d&apos;activation n&apos;est plus valable. Demandez une nouvelle invitation à un super-administrateur.</div> : (
            <>
              <p className="muted">Bonjour {u.firstName}, vous êtes invité comme <b>{u.role}</b> ({u.email}).</p>
              <div className="stack" style={{ gap: 8 }}>
                <b>1. Installez une application d&apos;authentification</b>
                <span className="small muted">Google Authenticator ou Microsoft Authenticator, gratuites sur Android et iPhone.</span>
                <b>2. Scannez ce code avec l&apos;application</b>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="qr" src={qr} alt="QR code de double authentification" />
                <span className="small muted">Impossible de scanner ? Saisissez cette clé dans l&apos;application :</span>
                <code className="secret">{u.secret}</code>
                <b>3. Choisissez votre mot de passe et saisissez le code à 6 chiffres</b>
              </div>
              <ActivateForm token={jeton} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
