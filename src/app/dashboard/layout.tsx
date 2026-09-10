"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { PaywallModal } from "@/components/PaywallModal";
import { PlatformSuspendedScreen } from "@/components/PlatformSuspendedScreen";
import { Loader2, Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, fetchMe, user, hasHydrated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Ouvert par défaut sur grand écran, fermé sur mobile/tablette
    setSidebarOpen(window.innerWidth >= 1024);
  }, []);

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
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        className={cn(
          "min-h-screen transition-all duration-200",
          sidebarOpen ? "lg:pl-64" : "pl-0"
        )}
      >
        {/* Barre supérieure avec le bouton menu */}
        <div className="sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm px-4 py-3 lg:px-8 lg:py-4">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Basculer le menu"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-6 lg:px-8 lg:pb-8 animate-fade-in">
          {children}
        </div>
      </main>
      <PaywallModal />
    </div>
  );
}
