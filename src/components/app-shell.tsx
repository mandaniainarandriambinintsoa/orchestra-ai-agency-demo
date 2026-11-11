"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType, type ReactNode } from "react";
import type { IconProps } from "@tabler/icons-react";
import {
  IconBox,
  IconCalendarEvent,
  IconChartDots3,
  IconLayoutDashboard,
  IconMenu2,
  IconMessages,
  IconRefresh,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
};

const navigation: { label: string; items: NavItem[] }[] = [
  {
    label: "Pilotage",
    items: [
      { href: "/dashboard", label: "Vue d’ensemble", icon: IconLayoutDashboard },
      { href: "/dashboard/prospects", label: "Prospects", icon: IconUsers },
      { href: "/dashboard/conversations", label: "Conversations IA", icon: IconMessages },
      { href: "/dashboard/appointments", label: "Rendez-vous", icon: IconCalendarEvent },
    ],
  },
  {
    label: "Automatisation",
    items: [
      { href: "/dashboard/follow-ups", label: "Relances", icon: IconRefresh },
      { href: "/dashboard/stock", label: "Stock", icon: IconBox },
    ],
  },
];

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3" aria-label="Orchestra, accueil">
      <span className="grid size-9 place-items-center rounded-xl bg-ink text-white">
        <IconChartDots3 size={20} stroke={1.7} aria-hidden="true" />
      </span>
      <span>
        <strong className="block text-[15px] font-semibold tracking-[-0.03em]">Orchestra</strong>
        <small className="block text-[9px] uppercase tracking-[0.15em] text-muted">Centre d’opérations IA</small>
      </span>
    </Link>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-6" aria-label="Navigation principale">
      {navigation.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#86907e]">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = item.href === pathname || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-xs font-medium text-[#5a6558] transition-colors hover:bg-sage-50 hover:text-ink",
                    active && "bg-sage-100 font-semibold text-sage-700 hover:bg-sage-100 hover:text-sage-700",
                  )}
                >
                  <Icon size={17} stroke={1.65} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = navigation.flatMap((group) => group.items).find((item) => item.href === pathname || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)));

  return (
    <div className="min-h-dvh bg-canvas text-ink lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col overflow-y-auto border-r border-line bg-panel px-[17px] pb-[18px] pt-7 lg:flex">
        <div className="px-3"><Brand /></div>
        <p className="mb-8 mt-5 px-3 text-[9px] uppercase tracking-[0.16em] text-[#72806c]">Espace démonstration</p>
        <Navigation />
        <div className="mt-auto border-t border-[#e8ebe3] px-3 pt-5">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-sage-100 text-xs font-semibold text-sage-700">M</span>
            <span className="text-[11px]">Mode démonstration<small className="mt-0.5 block text-[9px] text-muted">Effets externes bloqués</small></span>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="hidden h-[74px] items-center justify-between border-b border-line bg-panel px-[clamp(24px,4vw,62px)] lg:flex">
          <span className="text-[10px] uppercase tracking-[0.13em] text-[#84907c]">Espace de travail <span className="px-2 text-[#adb6a8]">/</span> <strong className="font-semibold text-[#3e513b]">{current?.label ?? "Orchestra"}</strong></span>
          <span className="text-[11px] font-medium text-[#566a50]">Mode démo</span>
        </header>

        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-line bg-panel px-5 lg:hidden">
          <Brand />
          <button type="button" className="grid size-11 place-items-center rounded-full border border-line bg-white" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}>
            {menuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
          </button>
        </header>

        {menuOpen ? (
          <div id="mobile-navigation" className="fixed inset-x-0 bottom-0 top-[70px] z-20 overflow-y-auto border-b border-line bg-panel p-5 shadow-xl lg:hidden">
            <Navigation onNavigate={() => setMenuOpen(false)} />
          </div>
        ) : null}

        <main className="mx-auto min-w-0 max-w-[1440px] px-[clamp(18px,4vw,62px)] pb-16 pt-8 lg:pb-[70px] lg:pt-11">
          {children}
        </main>
      </div>
    </div>
  );
}
