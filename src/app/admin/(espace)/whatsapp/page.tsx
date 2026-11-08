import { redirect } from "next/navigation";

// Rubrique retirée de l'administration pour l'instant : les anciens liens renvoient à la vue d'ensemble
export default function Retired() {
  redirect("/admin");
}
