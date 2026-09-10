"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Sparkles, FileText, Upload, LogOut, User, Shield,
  CreditCard, X, HelpCircle, type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; icon: LucideIcon; label: string; external: boolean };

const navItemsPublic: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord", external: false },
  { href: "/dashboard/generate", icon: Sparkles, label: "Générer une épreuve", external: false },
  { href: "/dashboard/exams", icon: FileText, label: "Mes épreuves", external: false },
  { href: "/dashboard/documents", icon: Upload, label: "Mes corrigés", external: false },
  { href: "/dashboard/subscription", icon: CreditCard, label: "Abonnement", external: false },
  { href: "/dashboard/help", icon: HelpCircle, label: "Aide", external: false },
];

const navItemsAdmin: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord", external: false },
  { href: "/dashboard/generate", icon: Sparkles, label: "Générer une épreuve", external: false },
  { href: "/dashboard/exams", icon: FileText, label: "Mes épreuves", external: false },
  { href: "/dashboard/documents", icon: Upload, label: "Mes corrigés", external: false },
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
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm leading-none">Mathiis</div>
              <div className="text-xs text-slate-400 mt-0.5">Générateur d&apos;épreuves</div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = !item.external && (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)));
            const className = cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            );
            const icon = <item.icon className={cn("w-4 h-4", active ? "text-indigo-600" : "text-slate-400")} />;
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
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              {isAdmin
                ? <Shield className="w-4 h-4 text-indigo-600" />
                : <User className="w-4 h-4 text-indigo-600" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">
                {user?.full_name || user?.username}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {user?.is_superuser ? "Super Admin" : user?.is_admin ? "Admin" : user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
