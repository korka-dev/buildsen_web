import { appIcon } from "@/lib/appIcon";

// Icône du site (onglet du navigateur, Google, aperçu des liens) : le logo BUILDSEN
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return appIcon(192, 0.27);
}
