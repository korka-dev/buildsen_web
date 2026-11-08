"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { BsIcon, type BsIconName } from "./icons";

export type AppNavItem = { href: string; label: string; short?: string; icon: BsIconName; count?: number; exact?: boolean; alert?: boolean;
  /** false : absent de la barre d'onglets du téléphone (5 onglets au maximum), présent dans le menu latéral */ tab?: boolean };

const isOn = (path: string, item: AppNavItem) => (item.exact ? path === item.href : path === item.href || path.startsWith(item.href + "/"));

/** Menu de l'espace connecté : barre latérale sur ordinateur, barre d'onglets en bas sur téléphone. */
export function AppNav({ items, label }: { items: AppNavItem[]; label: string }) {
  const path = usePathname();
  const [more, setMore] = useState(false);
  // Rubriques absentes de la barre du téléphone (cinq onglets au maximum) : regroupées derrière un onglet « Plus »
  const hidden = items.filter((it) => it.tab === false);
  const hiddenOn = hidden.some((it) => isOn(path, it));
  return (
    <>
      <nav className="bs-side-nav" aria-label={label}>
        {items.map((it) => {
          const on = isOn(path, it);
          return (
            <Link key={it.href} href={it.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
              <BsIcon name={it.icon} size={20} />
              <span>{it.label}</span>
              {it.count ? <i className={`bs-count${it.alert ? " bs-count-red" : ""}`} aria-label={`${it.count} nouveau${it.count > 1 ? "x" : ""}`}>{it.count}</i> : null}
            </Link>
          );
        })}
      </nav>
      {more && hidden.length > 0 && (
        <>
          <button type="button" className="bs-more-bg" aria-label="Fermer" onClick={() => setMore(false)} />
          <ul className="bs-more" role="menu" aria-label="Autres rubriques">
            {hidden.map((it) => (
              <li key={it.href} role="none">
                <Link href={it.href} role="menuitem" className={isOn(path, it) ? "on" : ""} onClick={() => setMore(false)}>
                  <BsIcon name={it.icon} size={20} /> {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <nav className="bs-tabbar" aria-label={label}>
        {items.filter((it) => it.tab !== false).map((it) => {
          const on = isOn(path, it);
          return (
            <Link key={it.href} href={it.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
              <span className="bs-tab-ico">
                <BsIcon name={it.icon} size={22} />
                {it.count ? <i className={`bs-count${it.alert ? " bs-count-red" : ""}`} aria-label={`${it.count} nouveau${it.count > 1 ? "x" : ""}`}>{it.count}</i> : null}
              </span>
              <span>{it.short ?? it.label}</span>
            </Link>
          );
        })}
        {hidden.length > 0 && (
          <button type="button" className={`bs-tab-more${hiddenOn || more ? " on" : ""}`} aria-expanded={more} aria-haspopup="menu" onClick={() => setMore((v) => !v)}>
            <span className="bs-tab-ico"><BsIcon name="menu" size={22} /></span>
            <span>Plus</span>
          </button>
        )}
      </nav>
    </>
  );
}
