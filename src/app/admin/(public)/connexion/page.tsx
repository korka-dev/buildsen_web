import { Logo } from "@/components/ui";
import { AdminLoginForm } from "../../forms";

export const metadata = { title: "Administration · BUILDSEN" };

export default function Page() {
  return (
    <>
      <header className="hdr"><div className="hdr-in"><Logo /><span className="pill ink" style={{ marginLeft: "auto" }}>Administration</span></div></header>
      <div className="narrow">
        <div className="card stack" style={{ gap: 16, padding: 30 }}>
          <h1>Connexion administrateur</h1>
          <AdminLoginForm />
        </div>
      </div>
    </>
  );
}
