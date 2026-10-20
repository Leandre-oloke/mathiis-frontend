"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useQuotaStore } from "@/store/quota";
import { cn } from "@/lib/utils";
import { Brand } from "@/components/brand/BrandMark";
import {
  LayoutDashboard, Sparkles, FileText, Upload, LogOut, Plus,
  CreditCard, X, HelpCircle, ChevronsUpDown, type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; icon: LucideIcon; label: string };

// The sidebar holds the work; account pages (subscription, help, sign-out) live in the account menu at its foot.
const workItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/dashboard/generate", icon: Sparkles, label: "Générer une épreuve" },
  { href: "/dashboard/exams", icon: FileText, label: "Mes épreuves" },
  { href: "/dashboard/documents", icon: Upload, label: "Mes corrigés" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "M";
}

function AccountMenu({ onNavigate }: { onNavigate: () => void }) {
  const { user, logout } = useAuthStore();
  const { exams_used, exams_limit, is_unlimited, loaded, fetchQuota } = useQuotaStore();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const isAdmin = user?.is_admin || user?.is_superuser;
  const name = user?.full_name || user?.username || "Mon compte";

  useEffect(() => { if (!loaded) fetchQuota(); }, [loaded, fetchQuota]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  const items: { href: string; icon: LucideIcon; label: string; meta?: string }[] = [
    ...(isAdmin ? [] : [{ href: "/dashboard/subscription", icon: CreditCard, label: "Abonnement & quota", meta: is_unlimited ? "Illimité" : loaded ? `${exams_used} / ${exams_limit}` : undefined }]),
    { href: "/dashboard/help", icon: HelpCircle, label: "Obtenir de l’aide" },
  ];

  return (
    <div ref={box} className="relative">
      {open && (
        <div role="menu" className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl border-[1.5px] border-foreground bg-card p-1.5 shadow-[0_4px_0_var(--foreground)]">
          <p className="px-2.5 pb-1.5 pt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted truncate">{user?.email}</p>
          {items.map((item) => (
            <Link key={item.href} role="menuitem" href={item.href} onClick={() => { setOpen(false); onNavigate(); }}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm hover:bg-foreground hover:text-background">
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.meta && <span className="font-mono text-[11px] opacity-60">{item.meta}</span>}
            </Link>
          ))}
          <div className="my-1 h-px bg-foreground/10" />
          <button role="menuitem" onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm hover:bg-foreground hover:text-background">
            <LogOut className="h-4 w-4" />Se déconnecter
          </button>
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu"
        className={cn("flex w-full items-center gap-3 rounded-xl border-[1.5px] p-2 text-left transition-colors",
          open ? "border-foreground bg-background" : "border-transparent hover:border-foreground")}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground font-mono text-xs font-semibold text-background">{initials(name)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{name}</span>
          <span className="block truncate text-xs text-muted">{user?.is_superuser ? "Super admin" : isAdmin ? "Admin" : "Compte personnel"}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-muted" />
      </button>
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Fond sombre — mobile uniquement, ferme la sidebar au clic */}
      {isOpen && <div className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col gap-4 border-r-[1.5px] border-foreground bg-card px-4 pb-4 pt-5 transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-1">
          <Link href="/dashboard" onClick={onClose}><Brand subtitle="Générateur d’épreuves" /></Link>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-foreground/5 lg:hidden" aria-label="Fermer le menu">
            <X className="h-4 w-4" />
          </button>
        </div>

        <Link href="/dashboard/generate" onClick={onClose}
          className="flex h-11 items-center gap-2 rounded-xl bg-foreground px-3.5 text-sm font-semibold text-background transition-transform hover:-translate-y-px">
          <Plus className="h-4 w-4" />Nouvelle épreuve
        </Link>

        <nav className="flex-1 space-y-0.5 overflow-y-auto" aria-label="Espace">
          {workItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={onClose} aria-current={active ? "page" : undefined}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/5")}>
                <item.icon className={cn("h-4 w-4", active ? "opacity-100" : "opacity-70")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-foreground/10 pt-3">
          <AccountMenu onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}
