import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import "./buildsen-theme.css";
import { AuthModalProvider } from "@/components/bs/AuthModal";
import { WhatsAppButton } from "@/components/WhatsAppButton";

// Police du logo BUILDSEN (identique à la v2)
const sora = Sora({ subsets: ["latin"], weight: ["800"], variable: "--font-logo", display: "swap" });

const DESCRIPTION = "Décrivez votre projet de construction : des ingénieurs et techniciens vérifiés vous répondent pour vos plans, devis, métrés et études, à Dakar. Gratuit pour les particuliers.";

export const metadata: Metadata = {
  title: "BUILDSEN — Construire avec confiance.",
  description: DESCRIPTION,
  metadataBase: new URL("https://www.buildsen.com"),
  // Aperçu des liens partagés (WhatsApp, Facebook…) ; l'image vient de opengraph-image.tsx
  openGraph: { type: "website", locale: "fr_SN", siteName: "BUILDSEN", title: "BUILDSEN · Construire avec confiance.", description: DESCRIPTION },
  twitter: { card: "summary_large_image" },
  appleWebApp: { capable: true, title: "BUILDSEN", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#15803d" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={sora.variable}>
      <body>
        <a className="skip-link" href="#contenu">Aller au contenu</a>
        <AuthModalProvider>{children}</AuthModalProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
