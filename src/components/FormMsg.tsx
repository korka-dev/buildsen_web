import type { ApiState } from "@/lib/client";

// Message d'erreur ou de confirmation sous un formulaire
export function FormMsg({ s }: { s: ApiState }) {
  if (s?.error) return <p className="err-t" role="alert">{s.error}</p>;
  if (s?.ok) return <div className="note ok" role="status">{s.ok}</div>;
  return null;
}
