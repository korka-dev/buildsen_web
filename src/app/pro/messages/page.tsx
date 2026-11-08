import { redirect } from "next/navigation";

// Pas de messagerie séparée : les échanges se retrouvent depuis les demandes et les notifications
export default function ProMessages() {
  redirect("/pro/demandes");
}
