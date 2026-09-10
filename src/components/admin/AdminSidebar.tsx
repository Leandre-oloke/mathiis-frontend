"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, CreditCard, Shield, LogOut, ArrowLeft, Power, X, MessageSquare
} from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Vue d'ensemble" },
  { href: "/admin/users", icon: Users, label: "Utilisateurs" },
  { href: "/admin/payments", icon: CreditCard, label: "Paiements" },
  { href: "/admin/platform", icon: Power, label: "Suspension" },
  { href: "/admin/suggestions", icon: MessageSquare, label: "Suggestions" },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

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
          "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 flex flex-col transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Administration</div>
              <div className="text-xs text-slate-400">Mathiis</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("w-4 h-4", active ? "text-indigo-400" : "text-slate-500")} />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800 mt-4">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              Retour à l&apos;app
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 mb-2">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user?.full_name || user?.username}
              </div>
              <div className="text-xs text-slate-400">Super Admin</div>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/auth/login"); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
}
