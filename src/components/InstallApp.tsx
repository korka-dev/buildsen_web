"use client";

import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

// Encadré « Installer l'application » : bouton direct sur Android, instructions sur iPhone, masqué si déjà installée
export function InstallApp() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as InstallEvent); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (installed || (!evt && !ios)) return null;
  return (
    <div className="card row between" style={{ gap: 14 }}>
      <div className="stack" style={{ gap: 4, maxWidth: "60ch" }}>
        <b>Installez l&apos;application BUILDSEN</b>
        <span className="small muted">
          {ios
            ? "Sur iPhone : touchez le bouton Partager (le carré avec une flèche) en bas de Safari, puis « Sur l'écran d'accueil »."
            : "Retrouvez BUILDSEN sur l'écran d'accueil de votre téléphone, comme une application."}
        </span>
      </div>
      {evt && <button className="btn p" onClick={async () => { await evt.prompt(); setEvt(null); }}>Installer l&apos;application</button>}
    </div>
  );
}
