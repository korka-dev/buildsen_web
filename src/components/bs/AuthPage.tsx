"use client";

import { useState } from "react";
import { AUTH_TITLES, AuthForms, type AuthMode, type Profil } from "./AuthForms";

/** Pages /connexion et /inscription : même formulaire que le modal, dans une carte. */
export function AuthPage({
  initialMode,
  initialProfil = "particulier",
  notice,
}: {
  initialMode: AuthMode;
  initialProfil?: Profil;
  notice?: string;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [profil, setProfil] = useState<Profil>(initialProfil);
  const signup = mode === "signup";
  const [title, intro] = AUTH_TITLES[mode];
  return (
    <div className={`bs-page-auth${signup ? " bs-wide" : ""}`}>
      <div className="bs-card stack" style={{ gap: 6 }}>
        <h1>{title}</h1>
        <p className="muted" style={{ marginBottom: 14 }}>
          {intro}
        </p>
        {notice ? <div className="note ok" style={{ marginBottom: 14 }}>{notice}</div> : null}
        <AuthForms mode={mode} onModeChange={setMode} profil={profil} onProfilChange={setProfil} />
      </div>
    </div>
  );
}
