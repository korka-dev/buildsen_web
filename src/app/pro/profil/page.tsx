import { redirect } from "next/navigation";

// Le profil est dans « Mon compte »
export default function Profil() {
  redirect("/pro/compte");
}
