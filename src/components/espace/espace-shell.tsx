"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChartNoAxesColumn, ChevronsUpDown, FileText, HelpCircle, Layers, LayoutGrid, LogOut, PanelLeft, Search, Sparkles, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BrandMarkColor as BrandMark } from "@/components/site/brand-mark";
import { useAuthStore } from "@/store/auth";
import { useQuotaStore } from "@/store/quota";
import { faq } from "@/lib/faq";
import { Kbd, useSearchShortcut } from "./parts";

// The sidebar holds the work only; everything about the account lives in the account menu.
const nav: { href: string; label: string; icon: typeof LayoutGrid; key?: string }[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutGrid },
  { href: "/dashboard/generate", label: "Générer une épreuve", icon: Sparkles, key: "N" },
  { href: "/dashboard/exams", label: "Mes épreuves", icon: FileText },
  { href: "/dashboard/documents", label: "Importer", icon: Upload, key: "I" },
];
const account: { href: string; label: string; icon: typeof LayoutGrid }[] = [
  { href: "/dashboard/subscription", label: "Utilisation", icon: ChartNoAxesColumn },
  { href: "/dashboard/help", label: "Obtenir de l’aide", icon: HelpCircle },
];
// Lien "Administration" retiré : ce dépôt (mathiis-frontend, partagé avec
// un collaborateur externe) ne contient plus les pages /admin.

export const initials = (name: string) => name.split(/[\s_.-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "M";

const typing = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
const isActive = (pathname: string, href: string) => (href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

function NavLinks({ onPick }: { onPick?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="esp-nav" aria-label="Mon espace">
      {nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined} onClick={onPick}>
            <item.icon /><span>{item.label}</span>{item.key && <Kbd>{item.key}</Kbd>}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountMenu({ onPick }: { onPick: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { exams_used, exams_limit, is_unlimited, loaded, fetchQuota } = useQuotaStore();
  useEffect(() => { if (!loaded) void fetchQuota(); }, [loaded, fetchQuota]);
  const isAdmin = user?.is_admin || user?.is_superuser;
  const name = user?.full_name || user?.username || "Mon compte";
  const role = user?.is_superuser ? "Super admin" : isAdmin ? "Administrateur" : is_unlimited ? "Accès illimité" : "Compte personnel";
  const open = (href: string) => { onPick(); router.push(href); };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="esp-account">
          <span className="esp-avatar">{initials(name)}</span>
          <span className="esp-account-name"><strong>{name}</strong><small>{role}</small></span>
          <ChevronsUpDown />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={8} className="esp-menu">
        <DropdownMenuLabel className="esp-menu-label">{user?.email ?? "Mon compte"}</DropdownMenuLabel>
        {account.filter((a) => !(isAdmin && a.href === "/dashboard/subscription")).map((a) => (
          <DropdownMenuItem key={a.href} onSelect={() => open(a.href)}>
            <a.icon />{a.label}
            {a.href === "/dashboard/subscription" && loaded && <span className="esp-menu-meta">{is_unlimited ? "Illimité" : `${exams_used} / ${exams_limit}`}</span>}
          </DropdownMenuItem>
        ))}
        {!isAdmin && <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => open("/dashboard/subscription#forfaits")}><Layers />Voir les forfaits</DropdownMenuItem>
        </>}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { onPick(); logout(); router.push("/auth/login"); }}><LogOut />Se déconnecter</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The signed-in workspace: sidebar, compact top bar and drawer on small screens, Ctrl/⌘+K palette, N / I / / shortcuts. */
export function EspaceShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [palette, setPalette] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const shortcut = useSearchShortcut();

  // Remembered per browser only (desktop sidebar collapse) -- never blocks
  // rendering if storage is unavailable (private window, blocked site data).
  useEffect(() => {
    try {
      if (localStorage.getItem("esp-sidebar-collapsed") === "1") setCollapsed(true);
    } catch { /* ignore */ }
  }, []);
  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem("esp-sidebar-collapsed", next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  };

  // Keyboard first: Ctrl/⌘+K anywhere, single letters when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((open) => !open); return; }
      if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target) || palette) return;
      const key = e.key.toLowerCase();
      if (key === "n") { e.preventDefault(); router.push("/dashboard/generate"); }
      else if (key === "i") { e.preventDefault(); router.push("/dashboard/documents"); }
      else if (key === "/") {
        e.preventDefault();
        const field = document.querySelector<HTMLInputElement>("[data-page-search]");
        if (field) field.focus(); else setPalette(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, palette]);

  const go = (href: string) => { setPalette(false); router.push(href); };
  const close = () => setDrawer(false);

  const sidebar = <>
    <div className="esp-side-head">
      <Link href="/dashboard" className="esp-brand"><BrandMark /><span>Mathiis<small>Au service de l’éducation béninoise</small></span></Link>
      <button type="button" className="esp-side-toggle" aria-label={collapsed ? "Déplier le menu" : "Réduire le menu"} aria-expanded={!collapsed} onClick={toggleCollapsed}><PanelLeft /></button>
    </div>
    <button type="button" className="esp-search-trigger" onClick={() => { close(); setPalette(true); }}><Search /><span>Rechercher…</span><Kbd>{shortcut}</Kbd></button>
    <NavLinks onPick={close} />
    <div className="esp-side-foot"><AccountMenu onPick={close} /></div>
  </>;

  return (
    <div className={`espace${collapsed ? " is-collapsed" : ""}`}>
      <aside className="esp-side">{sidebar}</aside>
      <header className="esp-topbar">
        <Link href="/dashboard" className="esp-brand compact"><BrandMark />Mathiis</Link>
        <div className="esp-topbar-actions">
          <Button variant="framed" size="icon" aria-label="Rechercher" onClick={() => setPalette(true)}><Search /></Button>
          <Button variant="framed" size="icon" aria-label={drawer ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={drawer} onClick={() => setDrawer(!drawer)}>
            {drawer ? <X /> : <PanelLeft />}
          </Button>
        </div>
      </header>
      {drawer && <div className="esp-drawer">{sidebar}</div>}
      <main className="esp-main">{children}</main>

      <CommandDialog open={palette} onOpenChange={setPalette}>
        <CommandInput placeholder="Que voulez-vous faire ?" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => go("/dashboard/generate")}><Sparkles /> Générer une épreuve<CommandShortcut>N</CommandShortcut></CommandItem>
            <CommandItem onSelect={() => go("/dashboard/documents")}><Upload /> Importer une épreuve à corriger<CommandShortcut>I</CommandShortcut></CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Aller à">
            {[...nav.filter((n) => !n.key), ...account].map((n) => <CommandItem key={n.href} onSelect={() => go(n.href)}><n.icon /> {n.label}</CommandItem>)}
            <CommandItem onSelect={() => go("/dashboard/subscription#forfaits")}><Layers /> Voir les forfaits</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Questions fréquentes">
            {faq.flatMap((g) => g.items).map((item) => <CommandItem key={item.id} value={item.q} onSelect={() => go(`/dashboard/help#${item.id}`)}><HelpCircle /> {item.q}</CommandItem>)}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
