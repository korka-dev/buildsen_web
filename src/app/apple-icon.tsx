import { appIcon } from "@/lib/appIcon";

// Icône utilisée par l'iPhone pour « Sur l'écran d'accueil »
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return appIcon(180);
}
