"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AUTH_TITLES, AuthForms, type AuthMode, type Profil } from "./AuthForms";
import { BsIcon } from "./icons";

type OpenOptions = { mode?: AuthMode; profil?: Profil };
const Context = createContext<{ openAuth: (o?: OpenOptions) => void }>({ openAuth: () => undefined });

export const useAuthModal = () => useContext(Context);


/** Modal de connexion / création de compte / mot de passe oublié, ouvert sur la page en cours sans la quitter. */
export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [profil, setProfil] = useState<Profil>("particulier");

  const openAuth = useCallback((o: OpenOptions = {}) => {
    setMode(o.mode ?? "login");
    setProfil(o.profil ?? "particulier");
    setOpen(true);
    ref.current?.showModal();
  }, []);
  const close = useCallback(() => ref.current?.close(), []);
  const value = useMemo(() => ({ openAuth }), [openAuth]);
  const [title, intro] = AUTH_TITLES[mode];

  return (
    <Context.Provider value={value}>
      {children}
      <dialog
        ref={ref}
        className={`bs-modal${mode === "signup" ? " bs-wide" : ""}`}
        aria-labelledby="bs-auth-title"
        onClose={(e) => {
          if (e.target === ref.current) setOpen(false);
        }}
        onClick={(e) => {
          if (e.target === ref.current) close();
        }}
      >
        <div className="bs-modal-h">
          <div>
            <h2 id="bs-auth-title">{title}</h2>
            <p>{intro}</p>
          </div>
          <button type="button" className="bs-close" onClick={close} aria-label="Fermer">
            <BsIcon name="close" size={20} />
          </button>
        </div>
        <div className="bs-modal-b">
          {/* Monté seulement modal ouvert : le formulaire repart de zéro à chaque ouverture */}
          {open ? <AuthForms mode={mode} onModeChange={setMode} profil={profil} onProfilChange={setProfil} /> : null}
        </div>
      </dialog>
    </Context.Provider>
  );
}

/** Bouton ou lien qui ouvre le modal (visiteur non connecté). */
export function AuthTrigger({
  mode = "login",
  profil,
  className,
  children,
}: {
  mode?: AuthMode;
  profil?: Profil;
  className?: string;
  children: React.ReactNode;
}) {
  const { openAuth } = useAuthModal();
  return (
    <button type="button" className={className} onClick={() => openAuth({ mode, profil })}>
      {children}
    </button>
  );
}
