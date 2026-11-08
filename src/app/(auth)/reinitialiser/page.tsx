import Link from "next/link";
import { PublicHeader } from "@/components/ui";
import { apiRaw } from "@/lib/api";
import { ResetForm } from "../forms";

export const metadata = { title: "Nouveau mot de passe · BUILDSEN" };

export default async function Page({ searchParams }: { searchParams: Promise<{ jeton?: string }> }) {
  const { jeton = "" } = await searchParams;
  const { data } = await apiRaw<{ valid: boolean }>(`/api/auth/reset/check?token=${encodeURIComponent(jeton)}`);
  const valid = data.valid;
  return (
    <>
      <PublicHeader />
      <main id="contenu" tabIndex={-1} className="narrow">
        <div className="card stack" style={{ gap: 18, padding: 30 }}>
          <h1>Nouveau mot de passe</h1>
          {valid ? <ResetForm token={jeton} /> : (
            <>
              <div className="note e">Ce lien n&apos;est plus valable.</div>
              <Link href="/mot-de-passe-oublie">Demander un nouveau lien</Link>
            </>
          )}
        </div>
      </main>
    </>
  );
}
