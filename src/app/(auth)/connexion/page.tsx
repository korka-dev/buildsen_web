import { redirect } from "next/navigation";
import { Footer, PublicHeader } from "@/components/ui";
import { getMe } from "@/lib/api";
import { AuthPage } from "@/components/bs/AuthPage";

export const metadata = { title: "Connexion · BUILDSEN" };

export default async function Page({ searchParams }: { searchParams: Promise<{ reinitialise?: string }> }) {
  const s = await getMe();
  if (s.user?.role === "PRO") redirect("/pro");
  if (s.user?.role === "CLIENT") redirect("/espace");
  const { reinitialise } = await searchParams;
  return (
    <>
      <PublicHeader />
      <main id="contenu" tabIndex={-1}>
      <AuthPage
        initialMode="login"
        notice={reinitialise ? "Mot de passe modifié. Vous pouvez vous connecter." : undefined}
      />
      </main>
      <Footer />
    </>
  );
}
