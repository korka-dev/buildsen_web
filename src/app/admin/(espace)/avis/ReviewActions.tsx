"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiCall } from "@/lib/client";

export function ReviewActions({ id, hidden }: { id: string; hidden: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    await apiCall(`/api/admin/reviews/${id}/${hidden ? "show" : "hide"}`);
    setBusy(false);
    router.refresh();
  }
  return <button type="button" className="btn g sm" disabled={busy} onClick={go}>{hidden ? "Remettre en ligne" : "Masquer"}</button>;
}
