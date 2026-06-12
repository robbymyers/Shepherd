"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EventsIcon, TrainIcon, ProgressIcon, AccountIcon } from "./Icons";

const TABS = [
  { href: "/", label: "Events", Icon: EventsIcon, match: (p: string) => p === "/" },
  { href: "/train", label: "Train", Icon: TrainIcon, match: (p: string) => p.startsWith("/train") },
  { href: "/progress", label: "Progress", Icon: ProgressIcon, match: (p: string) => p.startsWith("/progress") },
  { href: "/account", label: "Account", Icon: AccountIcon, match: (p: string) => p.startsWith("/account") },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar">
      {TABS.map(({ href, label, Icon, match }) => {
        const active = match(pathname);
        return (
          <Link key={href} href={href} className={active ? "active" : ""}>
            <Icon width={26} height={26} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
