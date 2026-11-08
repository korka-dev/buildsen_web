import type { NextConfig } from "next";

// Adresse de l'API FastAPI, connue du serveur Next.js seulement (jamais du navigateur)
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

// En-têtes de sécurité appliqués à toutes les pages
const security = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // Sous-ensemble sans risque pour Next.js (les scripts en ligne de Next imposeraient un jeton par requête) : pas d'encadrement, pas d'objets, formulaires vers le site seulement
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Image Docker légère : serveur Node autonome (voir Dockerfile)
  output: "standalone",
  // Police et photo des images d'aperçu générées à la demande (profils), lues sur le disque par le serveur
  outputFileTracingIncludes: { "/**": ["./src/assets/**"] },
  // Relais vers l'API : le navigateur appelle /api/… sur le site lui-même. Les cookies de session restent sur le domaine
  // du site, et l'API n'a pas besoin d'être exposée publiquement ni ouverte en CORS.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
  // Ancienne page des crédits (remplacée par « Mon abonnement »)
  async redirects() {
    return [{ source: "/pro/credits", destination: "/pro", permanent: false }];
  },
  async headers() {
    return [{ source: "/:path*", headers: security }];
  },
};

export default nextConfig;
