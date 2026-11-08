import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Icône de l'application : le logo BUILDSEN sur deux lignes (BUILD en noir, SEN en vert) sur fond blanc,
// assez petit pour rester dans la zone visible des icônes adaptatives d'Android.
// Police Sora (licence libre OFL) embarquée pour un rendu identique au site.
// scale : taille du texte par rapport à l'icône (0,2 pour les icônes d'application, plus grand pour le favicon)
export async function appIcon(size: number, scale = 0.2) {
  const sora = await readFile(join(process.cwd(), "src/assets/Sora-ExtraBold.ttf"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FFFFFF", fontFamily: "Sora", fontWeight: 800, fontSize: size * scale, lineHeight: 1 }}>
        <span style={{ color: "#000000" }}>BUILD</span>
        <span style={{ color: "#075B3C" }}>SEN</span>
      </div>
    ),
    { width: size, height: size, fonts: [{ name: "Sora", data: sora, weight: 800, style: "normal" }] },
  );
}
