import { Result } from "./Result";

export const metadata = { title: "Paiement · BUILDSEN", robots: { index: false, follow: false } };

// Page où le fournisseur ramène le professionnel après le paiement
export default async function Page({ searchParams }: { searchParams: Promise<{ ref?: string; token?: string }> }) {
  const s = await searchParams;
  return <Result token={s.ref ?? s.token ?? ""} />;
}
