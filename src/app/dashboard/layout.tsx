"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { PaywallModal } from "@/components/PaywallModal";
import { PlatformSuspendedScreen } from "@/components/PlatformSuspendedScreen";
import { Bell, ChevronDown, Loader2, Menu, Search } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, fetchMe, user, hasHydrated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!user) fetchMe();
  }, [hasHydrated, isAuthenticated, user, router, fetchMe]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (user?.is_platform_blocked) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PlatformSuspendedScreen message={user.platform_message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-h-screen transition-all duration-200 lg:pl-64">
        <div className="sticky top-0 z-20 border-b border-white/60 bg-[#f5f8ff]/85 px-4 py-3 backdrop-blur-xl lg:px-8 lg:py-4">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 lg:hidden"
              aria-label="Basculer le menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <label className="relative hidden w-full max-w-xl sm:block">
              <span className="sr-only">Rechercher une épreuve ou un thème</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Rechercher une épreuve, un thème..."
                className="h-12 w-full rounded-2xl border border-slate-200/90 bg-white pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
            </label>
            <div className="ml-auto flex items-center gap-3">
              <button className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-white hover:text-indigo-600" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-[#f5f8ff]" />
              </button>
              <div className="hidden h-8 w-px bg-slate-200 sm:block" />
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                  {(user?.full_name || user?.username || "M").charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-slate-900">{user?.full_name || user?.username}</div>
                  <div className="text-xs text-slate-500">{user?.is_admin ? "Administrateur" : "Enseignant"}</div>
                </div>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl animate-fade-in px-4 pb-8 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-7">
          {children}
        </div>
      </main>
      <PaywallModal />
    </div>
  );
}
