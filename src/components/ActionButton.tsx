"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/client";

// Bouton qui déclenche une action de l'API (clôturer, suspendre, mettre en vedette…), puis actualise la page
export function ActionButton({ path, method = "POST", body, className = "btn g sm", confirm, hard, children }: {
  path: string;
  method?: string;
  body?: unknown;
  className?: string;
  confirm?: string;
  hard?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <>
      <button type="button" className={className} disabled={busy} onClick={async () => {
        if (confirm && !window.confirm(confirm)) return;
        setBusy(true);
        setErr("");
        const r = await apiCall(path, { method, body });
        setBusy(false);
        if (!r.ok) return setErr(r.error);
        const redirect = r.data.redirect as string | undefined;
        if (redirect) return hard ? window.location.assign(redirect) : router.push(redirect);
        router.refresh();
      }}>{children}</button>
      {err && <span className="err-t" role="alert">{err}</span>}
    </>
  );
}

// Déconnexion : rechargement complet pour vider toutes les données de l'utilisateur affichées
export function LogoutButton({ admin = false }: { admin?: boolean }) {
  return <ActionButton path={admin ? "/api/admin/logout" : "/api/auth/logout"} hard>Déconnexion</ActionButton>;
}
