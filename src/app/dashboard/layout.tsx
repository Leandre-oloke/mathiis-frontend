"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { EspaceShell } from "@/components/espace/espace-shell";
import { PaywallModal } from "@/components/PaywallModal";
import { PlatformSuspendedScreen } from "@/components/PlatformSuspendedScreen";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, fetchMe, user, hasHydrated } = useAuthStore();
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
      <div className="espace-gate" aria-busy="true" />
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
    <>
      <EspaceShell>{children}</EspaceShell>
      <PaywallModal />
    </>
  );
}
