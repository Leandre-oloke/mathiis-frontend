"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { MathiisBrand } from "@/components/layout/MathiisBrand";
import {
  LayoutDashboard, Sparkles, FileText, FileCheck2, LogOut,
  CreditCard, X, HelpCircle, ChevronDown, type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; icon: LucideIcon; label: string; external: boolean };

const navItemsPublic: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil", external: false },
  { href: "/dashboard/generate", icon: Sparkles, label: "Générer", external: false },
  { href: "/dashboard/exams", icon: FileText, label: "Mes épreuves", external: false },
  { href: "/dashboard/documents", icon: FileCheck2, label: "Mes corrigés", external: false },
  { href: "/dashboard/subscription", icon: CreditCard, label: "Abonnement", external: false },
  { href: "/dashboard/help", icon: HelpCircle, label: "Aide", external: false },
];

const navItemsAdmin: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil", external: false },
  { href: "/dashboard/generate", icon: Sparkles, label: "Générer", external: false },
  { href: "/dashboard/exams", icon: FileText, label: "Mes épreuves", external: false },
  { href: "/dashboard/documents", icon: FileCheck2, label: "Mes corrigés", external: false },
  { href: "/dashboard/subscription", icon: CreditCard, label: "Abonnement", external: false },
  { href: "/dashboard/help", icon: HelpCircle, label: "Aide", external: false },
  // Lien "Administration" retiré : ce dépôt (mathiis-frontend, partagé avec
  // un collaborateur externe) ne contient plus les pages /admin.
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.is_admin || user?.is_superuser;

  const navItems = isAdmin ? navItemsAdmin : navItemsPublic;

  return (
    <>
      {/* Fond sombre — mobile uniquement, ferme la sidebar au clic */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-[#071a3d] text-white shadow-2xl shadow-slate-950/20 transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-7">
          <Link href="/dashboard" onClick={onClose} aria-label="Accueil Mathiis">
            <MathiisBrand />
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4 text-slate-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const active = !item.external && (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)));
            const className = cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
              active
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/30"
                : "text-slate-300 hover:bg-white/8 hover:text-white"
            );
            const icon = <item.icon className={cn("h-5 w-5", active ? "text-white" : "text-slate-400")} />;
            return item.external ? (
              <a key={item.href} href={item.href} className={className}>
                {icon}
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className={className} onClick={onClose}>
                {icon}
                {item.label}
              </Link>
            );
          })}
        </nav>


        {/* User info */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-white to-indigo-100 font-bold text-indigo-700 shadow-sm">
              {(user?.full_name || user?.username || "M").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {user?.full_name || user?.username}
              </div>
              <div className="truncate text-xs text-slate-400">
                {user?.is_superuser ? "Super Admin" : user?.is_admin ? "Admin" : user?.email}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/8 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
