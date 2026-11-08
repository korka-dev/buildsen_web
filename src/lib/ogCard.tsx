import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Carte affichée quand un lien BUILDSEN est partagé (WhatsApp, Facebook…) : texte à gauche, photo à droite
export const OG_SIZE = { width: 1200, height: 630 };
const GREEN = "#075B3C";

export async function ogCard({ title, lines, tag, initials, photo }: { title: string; lines: string[]; tag: string; initials?: string; photo?: string }) {
  const [sora, villa] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/Sora-ExtraBold.ttf")),
    photo ? null : readFile(join(process.cwd(), "src/assets/og-villa.jpg")),
  ]);
  const img = photo ?? `data:image/jpeg;base64,${villa!.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFFFFF" }}>
        <div style={{ width: 660, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 56px 0" }}>
          <div style={{ display: "flex", fontFamily: "Sora", fontSize: 40, letterSpacing: -1 }}>
            <span style={{ color: "#000000" }}>BUILD</span><span style={{ color: GREEN }}>SEN</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {initials && (
                <div style={{ width: 84, height: 84, borderRadius: 42, background: GREEN, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontSize: 32 }}>{initials}</div>
              )}
              <div style={{ display: "flex", background: "#E6F2EC", color: GREEN, fontSize: 24, fontWeight: 700, padding: "8px 18px", borderRadius: 999 }}>{tag}</div>
            </div>
            <div style={{ display: "flex", fontFamily: "Sora", fontSize: title.length > 26 ? 50 : 60, lineHeight: 1.08, color: "#0B1F17", letterSpacing: -1.5 }}>{title}</div>
            {lines.map((l) => (
              <div key={l} style={{ display: "flex", fontSize: 29, lineHeight: 1.35, color: "#3D4F47" }}>{l}</div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", background: GREEN, color: "#FFFFFF", margin: "0 -56px", padding: "26px 56px", fontSize: 27 }}>
            <span style={{ fontWeight: 700 }}>Décrire mon projet, c&apos;est gratuit</span>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={img} width={540} height={630} style={{ width: 540, height: 630, objectFit: "cover" }} />
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Sora", data: sora, weight: 800, style: "normal" }] },
  );
}
