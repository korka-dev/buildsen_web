import Link from "next/link";
import { SPECIALTIES, STATUTS, fcfa, formatPhone } from "@/lib/constants";
import { waLink } from "@/lib/market";
import type { ConversationFull } from "@/lib/types";
import { Pill } from "./ui";
import { ChatThread } from "./ChatThread";
import { MessageComposer, ReportForm } from "./MessageComposer";
import { ActionButton } from "./ActionButton";
import { Rating } from "./Stars";
import { ReviewBox } from "./ReviewBox";

// Conversation vue par le client ou par le professionnel
export function ConversationView({ c, viewer, meId }: { c: ConversationFull; viewer: "client" | "pro"; meId: string }) {
  const o = c.other;
  const isClient = viewer === "client";
  const closed = c.request.state === "CLOSED";
  const verifiedLabel = o.statut === "ENT" ? "Entreprise vérifiée" : "Profil vérifié";
  const wa = waLink(o.phone);
  return (
    <div className="conv-grid">
      <div className="stack conv-main" style={{ gap: 14, minWidth: 0 }}>
        <div className="row conv-head" style={{ gap: 12, flexWrap: "nowrap" }}>
          <span className="avatar">{o.badge}</span>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 22, margin: 0 }}>{o.name}</h1>
            <span className="small muted">{c.request.title}</span>
          </div>
        </div>
        <ChatThread messages={c.messages} meId={meId} otherName={o.name} />
        <MessageComposer conversationId={c.id} closed={closed} />
        <p className="small muted" style={{ margin: 0 }}>
          {isClient ? "Ne versez jamais la totalité du prix d'avance. Le prix, le contrat et le paiement se décident directement entre vous." : "Restez professionnel : le client peut signaler une conversation à tout moment."}
        </p>
        <ReportForm conversationId={c.id} />
      </div>

      <aside className="stack conv-side" style={{ gap: 14 }}>
        {isClient ? (
          <div className="card stack" style={{ gap: 10 }}>
            <b style={{ fontSize: 17 }}>{o.name}</b>
            <Rating rating={o.rating} />
            <div className="row" style={{ gap: 6 }}>
              {o.state === "VERIFIED" && <Pill tone="ok">{verifiedLabel}</Pill>}
              {o.statut && <span className="small muted">{STATUTS[o.statut].name}</span>}
            </div>
            {o.companyName && <span className="small muted">Gérant : {o.firstName} {o.lastName}</span>}
            {o.commune && <span className="small muted">{o.commune}{o.experienceYears != null ? ` · ${o.experienceYears} an${o.experienceYears > 1 ? "s" : ""} ${o.statut === "ENT" ? "d'activité" : "d'expérience"}` : ""}</span>}
            {o.bio && <p className="small" style={{ margin: 0, color: "var(--slate)", whiteSpace: "pre-wrap" }}>{o.bio}</p>}
            {!!o.specialties?.length && <div className="row" style={{ gap: 6 }}>{o.specialties.map((s) => <Pill key={s}>{SPECIALTIES[s] ?? s}</Pill>)}</div>}
            {o.software && <span className="small muted">Logiciels : {o.software}</span>}
            {!!o.portfolio?.length && (
              <div className="stack" style={{ gap: 6 }}>
                <b className="small">Réalisations</b>
                <div className="pf-mini">
                  {o.portfolio.map((it) => (
                    <a key={it.id} href={`/api/fichiers/portfolio/${it.id}`} target="_blank" rel="noopener" title={it.caption}>
                      {it.mime.startsWith("image/")
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={`/api/fichiers/portfolio/${it.id}`} alt={it.caption} loading="lazy" />
                        : <span className="pf-doc">PDF</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card stack" style={{ gap: 8 }}>
            <b style={{ fontSize: 17 }}>{o.name}</b>
            <span className="small muted">Particulier · {c.request.commune}</span>
          </div>
        )}

        <div className="share-box">
          {c.shared ? (
            <>
              <b>{isClient ? `Vous avez partagé votre WhatsApp avec ${o.name}` : `${o.name} a partagé son WhatsApp avec vous`}</b>
              <span className="num">{formatPhone(o.phone)}</span>
              {wa && <a className="btn wa" href={wa} target="_blank" rel="noopener">Continuer sur WhatsApp</a>}
            </>
          ) : isClient ? (
            <>
              <b>Prêt à continuer avec {o.name} ?</b>
              <span className="small">Partagez votre numéro : {o.name} pourra vous écrire sur WhatsApp, et vous verrez le sien.</span>
              {!closed && <ActionButton path={`/api/client/conversations/${c.id}/share`} className="btn wa">Partager mon WhatsApp</ActionButton>}
            </>
          ) : (
            <>
              <b>Numéro du client</b>
              <span className="small">Le client choisit avec qui il partage son WhatsApp. Présentez clairement votre offre : prix indicatif, délai, façon de travailler.</span>
            </>
          )}
        </div>

        {isClient && <ReviewBox conversationId={c.id} review={c.review ?? null} canReview={!!c.canReview} name={o.name} />}

        <div className="card flat stack" style={{ gap: 4 }}>
          <span className="small muted">Demande</span>
          <b>{c.request.title}</b>
          <span className="small muted">{c.request.commune} · budget {fcfa(c.request.budget)}</span>
          <Link className="small" href={isClient ? `/espace/demandes/${c.request.ref}` : `/pro/demandes/${c.request.id}`}>Voir la demande</Link>
        </div>
      </aside>
    </div>
  );
}
