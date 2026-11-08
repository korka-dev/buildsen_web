"use client";

import { useEffect, useState } from "react";

export type WaInfo = { enabled: boolean; simulator: boolean; link: string | null };

let cached: WaInfo | null | undefined;

/** État de l'assistant WhatsApp (activé ?, lien public, simulateur ?). Une seule requête par page. */
export function useWaInfo(): WaInfo | null {
  const [info, setInfo] = useState<WaInfo | null>(cached ?? null);
  useEffect(() => {
    if (cached !== undefined) return;
    fetch("/api/wa/info")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: WaInfo | null) => {
        // Le simulateur n'est pas un vrai WhatsApp : on ne montre rien de l'assistant sur le site tant qu'il n'est pas branché à Meta
        // (la page /simulateur reste accessible directement, pour les essais).
        d = d && d.simulator ? { ...d, enabled: false } : d;
        cached = d;
        setInfo(d);
      })
      .catch(() => {
        cached = null;
      });
  }, []);
  return info;
}
