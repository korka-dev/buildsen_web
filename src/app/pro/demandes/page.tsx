import { ProRequestsView } from "./View";

export const metadata = { title: "Demandes · BUILDSEN" };

export default async function ProRequests({ searchParams }: { searchParams: Promise<{ tout?: string; vue?: string }> }) {
  const { tout, vue } = await searchParams;
  return <ProRequestsView tout={tout} vue={vue} />;
}
