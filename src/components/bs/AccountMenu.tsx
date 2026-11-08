"use client";

import { useState } from "react";
import { apiCall } from "@/lib/client";
import { Modal } from "./Modal";
import { BsIcon } from "./icons";

/** Modal de déconnexion, ouvert depuis le compte en bas du menu (ou depuis la page Mon compte). */
function LogoutModal({ open, onClose, name, initials, role, path }: { open: boolean; onClose: () => void; name: string; initials: string; role: string; path: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function logout() {
    setBusy(true);
    setErr("");
    const r = await apiCall(path);
    if (!r.ok) {
      setBusy(false);
      setErr(r.error);
      return;
    }
    // Rechargement complet pour vider toutes les données affichées
    window.location.assign((r.data.redirect as string | undefined) ?? "/");
  }
  return (
    <Modal open={open} onClose={onClose} title="Se déconnecter ?">
      <div className="bs-logout">
        <div className="bs-logout-who">
          <span className="bs-avatar" aria-hidden="true">{initials}</span>
          <span>
            <b>{name}</b>
            <small>{role}</small>
          </span>
        </div>
        <p>Vous devrez saisir votre numéro et votre mot de passe pour revenir sur votre espace.</p>
        {err ? <p className="err-t" role="alert">{err}</p> : null}
        <div className="bs-logout-act">
          <button type="button" className="btn g" onClick={onClose}>Annuler</button>
          <button type="button" className="btn p" onClick={logout} disabled={busy}>
            <BsIcon name="logOut" size={18} /> {busy ? "Déconnexion…" : "Se déconnecter"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** Compte en bas du menu latéral : un clic ouvre le modal de déconnexion. */
export function AccountMenu({ name, initials, role, logoutPath = "/api/auth/logout" }: { name: string; initials: string; role: string; logoutPath?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="bs-account" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className="bs-avatar" aria-hidden="true">{initials}</span>
        <span className="bs-account-tx">
          <b>{name}</b>
          <small>{role}</small>
        </span>
        <BsIcon name="logOut" size={18} />
      </button>
      <LogoutModal open={open} onClose={() => setOpen(false)} name={name} initials={initials} role={role} path={logoutPath} />
    </>
  );
}

/** Bouton « Se déconnecter » (page Mon compte, surtout utile sur téléphone). */
export function LogoutAction({ name, initials, role, logoutPath = "/api/auth/logout" }: { name: string; initials: string; role: string; logoutPath?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn g bs-logout-btn" onClick={() => setOpen(true)}>
        <BsIcon name="logOut" size={18} /> Se déconnecter
      </button>
      <LogoutModal open={open} onClose={() => setOpen(false)} name={name} initials={initials} role={role} path={logoutPath} />
    </>
  );
}
