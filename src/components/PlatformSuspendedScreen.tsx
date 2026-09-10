"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";

const DEFAULT_MESSAGE = "La plateforme est temporairement suspendue pour maintenance. Merci de réessayer plus tard.";

export function PlatformSuspendedScreen({ message }: { message?: string | null }) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-8 py-10 flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>

          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-800">Plateforme suspendue</p>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              {message || DEFAULT_MESSAGE}
            </p>
          </div>

          <button
            onClick={() => { logout(); router.push("/auth/login"); }}
            className="flex items-center gap-2 px-8 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
