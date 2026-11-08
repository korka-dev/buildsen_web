import { redirect } from "next/navigation";
import { Footer, PublicHeader } from "@/components/ui";
import { getMe } from "@/lib/api";
import { CLIENTS_OPEN } from "@/lib/constants";
import { AuthPage } from "@/components/bs/AuthPage";

export const metadata = { title: "Créer un compte · BUILDSEN" };

export default async function Page({ searchParams }: { searchParams: Promise<{ profil?: string }> }) {
  const s = await getMe();
  if (s.user?.role === "PRO") redirect("/pro");
  if (s.user?.role === "CLIENT") redirect("/espace");
  const { profil } = await searchParams;
  // Tant que les particuliers ne sont pas ouverts, la page reste celle des professionnels
  const client = CLIENTS_OPEN && profil !== "pro";
  return (
    <>
      <PublicHeader />
      <main id="contenu" tabIndex={-1}>
      <AuthPage initialMode="signup" initialProfil={client ? "particulier" : "pro"} />
      </main>
      <Footer />
    </>
  );
}
