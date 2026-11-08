import { Footer, PublicHeader } from "@/components/ui";
import { CLIENTS_OPEN } from "@/lib/constants";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main id="contenu" tabIndex={-1}>
      <section className="sec">
        <div className="wrap legal stack" style={{ gap: 6 }}>
          <span className="eyebrow">Information</span>
          {children}
          <div className="note w" style={{ marginTop: 20 }}>{CLIENTS_OPEN ? "Texte provisoire : la version définitive sera validée par un avocat." : <>Texte provisoire de la phase pilote : la version définitive sera rédigée et validée par un avocat avant l&apos;ouverture aux particuliers.</>}</div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
