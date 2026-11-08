import type { MetadataRoute } from "next";

// Moteurs de recherche : pages publiques autorisées, espaces privés et administration exclus
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/espace", "/pro$", "/pro/", "/messages", "/accueil", "/api/", "/reinitialiser", "/verifier-email", "/apercu"] },
    sitemap: "https://www.buildsen.com/sitemap.xml",
  };
}
