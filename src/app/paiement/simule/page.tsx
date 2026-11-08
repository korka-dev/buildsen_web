import { notFound } from "next/navigation";
import { apiRaw } from "@/lib/api";
import { SimPay } from "./SimPay";

export const metadata = { title: "Paiement de test · BUILDSEN", robots: { index: false, follow: false } };

// Page de paiement de développement : remplace Wave / Orange Money. Introuvable en production.
export default async function Page({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const info = await apiRaw<{ simulator: boolean }>("/api/wa/info");
  if (!ref || info.status !== 200 || !info.data.simulator) notFound();
  const pay = await apiRaw<{ state: string; planName: string; amount: number; months: number }>(`/api/payments/${encodeURIComponent(ref)}`);
  if (pay.status !== 200) notFound();
  return <SimPay token={ref} plan={pay.data.planName} amount={pay.data.amount} months={pay.data.months} state={pay.data.state} />;
}
