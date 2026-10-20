"use client";

import { useRouter } from "next/navigation";
import { LogOut, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/espace/parts";
import { useAuthStore } from "@/store/auth";

const DEFAULT_MESSAGE = "La plateforme est temporairement suspendue pour maintenance. Merci de réessayer plus tard.";

export function PlatformSuspendedScreen({ message }: { message?: string | null }) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return (
    <main className="auth-page">
      <section className="auth-card" aria-live="polite">
        <EmptyState icon={<TriangleAlert />} title="Plateforme suspendue" text={message || DEFAULT_MESSAGE}>
          <Button variant="framed" onClick={() => { logout(); router.push("/auth/login"); }}><LogOut /> Se déconnecter</Button>
        </EmptyState>
      </section>
    </main>
  );
}
