"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme: string; size: string; width: number; text: string }
          ) => void;
        };
      };
    };
  }
}

export default function GoogleButton() {
  const router = useRouter();
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const divRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    function render() {
      if (!window.google || !divRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId as string,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
            toast.success("Connexion réussie !");
            router.push("/dashboard");
          } catch (err: unknown) {
            const message =
              (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
              "Échec de la connexion Google";
            toast.error(message);
          }
        },
      });
      window.google.accounts.id.renderButton(divRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    }

    if (window.google) {
      render();
      return;
    }
    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval);
        render();
      }
    }, 150);
    return () => clearInterval(interval);
  }, [clientId, loginWithGoogle, router]);

  if (!clientId) return null;

  return (
    <div className="space-y-4">
      <div ref={divRef} className="flex justify-center" />
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">ou</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
