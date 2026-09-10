"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Power, PowerOff, Loader2, Search, UserPlus, UserMinus, AlertTriangle, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AllowedUser {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
}

interface PlatformStatus {
  is_suspended: boolean;
  message: string | null;
  suspended_at: string | null;
  allowed_users: AllowedUser[];
}

interface SearchUser {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
}

const DEFAULT_MESSAGE = "La plateforme est temporairement suspendue pour maintenance. Merci de réessayer plus tard.";

export default function AdminPlatformPage() {
  const [status, setStatus] = useState<PlatformStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [toggling, setToggling] = useState(false);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/platform");
      setStatus(data);
      setMessage(data.message || DEFAULT_MESSAGE);
    } catch {
      toast.error("Erreur de chargement du statut de la plateforme");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleSearch = async (value: string) => {
    setSearch(value);
    if (!value.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await api.get("/admin/users", { params: { page: 1, per_page: 10, search: value } });
      setSearchResults(data.items);
    } catch {
      toast.error("Erreur de recherche");
    } finally {
      setSearching(false);
    }
  };

  const suspend = async () => {
    setToggling(true);
    try {
      const { data } = await api.post("/admin/platform/suspend", { message: message || undefined });
      setStatus(data);
      toast.success("Plateforme suspendue");
    } catch {
      toast.error("Erreur lors de la suspension");
    } finally {
      setToggling(false);
    }
  };

  const resume = async () => {
    setToggling(true);
    try {
      const { data } = await api.post("/admin/platform/resume");
      setStatus(data);
      toast.success("Plateforme réactivée");
    } catch {
      toast.error("Erreur lors de la réactivation");
    } finally {
      setToggling(false);
    }
  };

  const isAllowed = (userId: string) => !!status?.allowed_users.some((u) => u.id === userId);

  const grantAccess = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { data } = await api.post(`/admin/platform/allowed-users/${userId}`);
      setStatus(data);
      toast.success("Accès autorisé pendant la suspension");
    } catch {
      toast.error("Erreur");
    } finally {
      setActionLoading(null);
    }
  };

  const revokeAccess = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { data } = await api.delete(`/admin/platform/allowed-users/${userId}`);
      setStatus(data);
      toast.success("Accès retiré");
    } catch {
      toast.error("Erreur");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
      </div>
    );
  }

  const isSuspended = !!status?.is_suspended;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Suspension de la plateforme</h1>
        <p className="text-slate-500 mt-1">
          Coupez l&apos;accès à tous les utilisateurs, puis autorisez ceux de votre choix pendant la suspension.
        </p>
      </div>

      {/* Statut */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              isSuspended ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
            )}>
              {isSuspended ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-semibold text-slate-900">
                {isSuspended ? "Plateforme suspendue" : "Plateforme active"}
              </div>
              {isSuspended && status?.suspended_at && (
                <div className="text-xs text-slate-400">
                  Depuis le {new Date(status.suspended_at).toLocaleString("fr-FR")}
                </div>
              )}
            </div>
          </div>
          <span className={cn(
            "text-xs font-medium px-3 py-1 rounded-full",
            isSuspended ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
          )}>
            {isSuspended ? "Suspendue" : "Active"}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Message affiché aux utilisateurs bloqués
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            disabled={isSuspended}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        {isSuspended ? (
          <button
            onClick={resume}
            disabled={toggling}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
            Reprendre la plateforme
          </button>
        ) : (
          <button
            onClick={suspend}
            disabled={toggling}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <PowerOff className="w-4 h-4" />}
            Suspendre la plateforme
          </button>
        )}
      </div>

      {/* Utilisateurs autorisés */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Accès autorisé pendant la suspension</h2>

        {status && status.allowed_users.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {status.allowed_users.map((u) => (
              <span
                key={u.id}
                className="inline-flex items-center gap-2 text-xs font-medium pl-3 pr-1.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {u.full_name || u.username}
                <button
                  onClick={() => revokeAccess(u.id)}
                  disabled={actionLoading === u.id}
                  title="Retirer l'accès"
                  className="p-0.5 rounded-full hover:bg-indigo-100 disabled:opacity-40"
                >
                  {actionLoading === u.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <UserMinus className="w-3 h-3" />
                  )}
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Aucun utilisateur autorisé pour l&apos;instant.</p>
        )}

        <div className="relative pt-2">
          <Search className="absolute left-3 top-1/2 translate-y-[3px] w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher un utilisateur à autoriser..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>

        {searching ? (
          <div className="p-4 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mx-auto" />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {searchResults.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">{u.full_name || u.username}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                </div>
                {isAllowed(u.id) ? (
                  <span className="text-xs font-medium text-indigo-600">Déjà autorisé</span>
                ) : (
                  <button
                    onClick={() => grantAccess(u.id)}
                    disabled={actionLoading === u.id}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg disabled:opacity-40"
                  >
                    {actionLoading === u.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                    Autoriser
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
