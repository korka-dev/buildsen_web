import type { MetadataRoute } from "next";

// Rend le site installable sur téléphone comme une application (PWA)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BUILDSEN",
    short_name: "BUILDSEN",
    description: "Plans, métrés et études en bâtiment : des clients pour les professionnels vérifiés. Dakar.",
    lang: "fr",
    start_url: "/pro",
    scope: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#075B3C",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
