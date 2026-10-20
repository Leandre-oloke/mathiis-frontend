"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { PaywallModal } from "@/components/PaywallModal";
import { PlatformSuspendedScreen } from "@/components/PlatformSuspendedScreen";
import { Loader2, Menu } from "lucide-react";
import { Brand } from "@/components/brand/BrandMark";

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
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (user?.is_platform_blocked) {
    return (
      <div className="min-h-screen bg-background">
        <PlatformSuspendedScreen message={user.platform_message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        className={cn(
          "min-h-screen transition-all duration-200",
          sidebarOpen ? "lg:pl-64" : "pl-0"
        )}
      >
        {/* Barre supérieure avec le bouton menu */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-foreground/10 bg-background/85 px-4 py-3 backdrop-blur-sm lg:border-0 lg:px-8 lg:py-4">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border-[1.5px] border-foreground bg-card shadow-[0_3px_0_var(--foreground)] transition-transform active:translate-y-0.5 active:shadow-none"
            aria-label="Basculer le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="lg:hidden"><Brand /></span>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-6 lg:px-8 lg:pb-8 animate-fade-in">
          {children}
        </div>
      </main>
      <PaywallModal />
    </div>
  );
}
