"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Menu latéral ; un compteur, ou un point vert (4e valeur à true) pour signaler une nouveauté
export function SideNav({ items }: { items: [string, string, (string | number)?, boolean?][] }) {
  const path = usePathname();
  return (
    <>
      {items.map(([href, label, count, dot]) => {
        const on = href === path || (href.split("/").length > 2 && path.startsWith(href + "/"));
        return (
          <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
            {label}
            {dot ? (count ? <span className="nav-dot" aria-label="Nouveau" /> : null) : count !== undefined && count !== 0 && <span className="pill ok" style={{ padding: "0 8px" }}>{count}</span>}
          </Link>
        );
      })}
    </>
  );
}
