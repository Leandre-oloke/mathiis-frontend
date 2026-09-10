"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Search, UserCheck, UserX, Shield, ShieldOff,
  Loader2, Users, ChevronLeft, ChevronRight, Crown, SlidersHorizontal, X, Zap, ZapOff, Trash2, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

interface AdminUser {
  id: string; email: string; username: string; full_name: string | null;
  is_active: boolean; is_verified: boolean; is_superuser: boolean;
  is_privileged: boolean;
  exam_count: number; created_at: string;
}

interface UserList {
  items: AdminUser[]; total: number; page: number; per_page: number; pages: number;
}

const ROLE_BADGE = {
  superadmin: "bg-red-100 text-red-700 border-red-200",
  admin: "bg-indigo-100 text-indigo-700 border-indigo-200",
  user: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const [data, setData] = useState<UserList | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [quotaUser, setQuotaUser] = useState<AdminUser | null>(null);
  const [quotaData, setQuotaData] = useState({ exams_limit: 5, corrections_limit: 5, exams_used: 0, corrections_used: 0 });
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async (p = page, s = search) => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/admin/users", {
        params: { page: p, per_page: 20, search: s || undefined },
      });
      setData(res);
    } catch { toast.error("Erreur de chargement"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(1, search); }, []);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
    fetchUsers(1, v);
  };

  const toggleActive = async (user: AdminUser) => {
    setActionLoading(user.id + "-active");
    try {
      await api.patch(`/admin/users/${user.id}`, { is_active: !user.is_active });
      toast.success(user.is_active ? "Compte désactivé" : "Compte activé");
      fetchUsers();
    } catch { toast.error("Erreur"); }
    finally { setActionLoading(null); }
  };

  const toggleAdmin = async (user: AdminUser) => {
    setActionLoading(user.id + "-admin");
    try {
      await api.patch(`/admin/users/${user.id}`, { is_superuser: !user.is_superuser });
      toast.success(user.is_superuser ? "Droits admin retirés" : "Rôle admin accordé");
      fetchUsers();
    } catch { toast.error("Erreur"); }
    finally { setActionLoading(null); }
  };

  const togglePrivilege = async (user: AdminUser) => {
    setActionLoading(user.id + "-privilege");
    try {
      await api.patch(`/admin/users/${user.id}/privilege`);
      toast.success(user.is_privileged ? "Accès illimité retiré" : "Accès illimité accordé");
      fetchUsers();
    } catch { toast.error("Erreur"); }
    finally { setActionLoading(null); }
  };

  const openQuota = async (user: AdminUser) => {
    setQuotaUser(user);
    try {
      const { data } = await api.get(`/admin/users/${user.id}/quota`);
      setQuotaData(data);
    } catch { toast.error("Impossible de charger le quota"); }
  };

  const saveQuota = async () => {
    if (!quotaUser) return;
    setQuotaLoading(true);
    try {
      await api.patch(`/admin/users/${quotaUser.id}/quota`, quotaData);
      toast.success("Quota mis à jour");
      setQuotaUser(null);
    } catch { toast.error("Erreur lors de la mise à jour"); }
    finally { setQuotaLoading(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`);
      toast.success("Utilisateur supprimé");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleLabel = (u: AdminUser) => {
    if (u.is_superuser) return { label: "Super Admin", style: ROLE_BADGE.superadmin, icon: Crown };
    return { label: "Utilisateur", style: ROLE_BADGE.user, icon: Users };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
          <p className="text-slate-500 mt-1">{data?.total ?? "-"} utilisateur{(data?.total ?? 0) > 1 ? "s" : ""} au total</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher par email, nom d'utilisateur ou nom..."
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      {/* Chargement / vide (partagé table + cartes) */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
        </div>
      ) : !data?.items.length ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">Aucun utilisateur trouvé</div>
      ) : (
        <>
          {/* Cartes (mobile / tablette) */}
          <div className="lg:hidden space-y-3">
            {data.items.map((user) => {
              const role = getRoleLabel(user);
              const isCurrentUser = currentUser?.id === user.id;
              const RoleIcon = role.icon;
              return (
                <div key={user.id} onClick={() => router.push(`/admin/users/${user.id}`)} className={cn(
                  "bg-white rounded-2xl border border-slate-100 p-4 cursor-pointer hover:border-indigo-200",
                  isCurrentUser && "bg-indigo-50/50 border-indigo-100"
                )}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-indigo-600">
                          {(user.full_name || user.username)[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 text-sm flex items-center gap-1 truncate">
                          {user.full_name || user.username}
                          {isCurrentUser && <span className="text-xs text-indigo-400 flex-shrink-0">(vous)</span>}
                        </div>
                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0",
                      user.is_active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                    )}>
                      {user.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border",
                      role.style
                    )}>
                      <RoleIcon className="w-3 h-3" />
                      {role.label}
                    </span>
                    {!user.is_verified && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-orange-50 text-orange-700 border-orange-200">
                        Non vérifié
                      </span>
                    )}
                    {user.is_privileged && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                        <Zap className="w-3 h-3" />
                        Accès illimité
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {user.exam_count} épreuve{user.exam_count > 1 ? "s" : ""} · {formatDate(user.created_at)}
                    </span>
                  </div>

                  <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 pt-2 border-t border-slate-100 flex-wrap">
                    {!isCurrentUser && (
                      <ActionBtn
                        onClick={() => toggleActive(user)}
                        loading={actionLoading === user.id + "-active"}
                        title={user.is_active ? "Désactiver" : "Activer"}
                        className={user.is_active
                          ? "hover:bg-red-50 hover:text-red-500"
                          : "hover:bg-emerald-50 hover:text-emerald-600"}
                      >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </ActionBtn>
                    )}
                    {!isCurrentUser && (
                      <ActionBtn
                        onClick={() => toggleAdmin(user)}
                        loading={actionLoading === user.id + "-admin"}
                        title={user.is_superuser ? "Retirer admin" : "Donner rôle admin"}
                        className={user.is_superuser
                          ? "hover:bg-orange-50 hover:text-orange-500"
                          : "hover:bg-indigo-50 hover:text-indigo-600"}
                      >
                        {user.is_superuser ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </ActionBtn>
                    )}
                    {!user.is_superuser && !user.is_active === false && (
                      <ActionBtn
                        onClick={() => openQuota(user)}
                        loading={false}
                        title="Ajuster le quota"
                        className="hover:bg-violet-50 hover:text-violet-600"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </ActionBtn>
                    )}
                    {!isCurrentUser && !user.is_superuser && (
                      <ActionBtn
                        onClick={() => togglePrivilege(user)}
                        loading={actionLoading === user.id + "-privilege"}
                        title={user.is_privileged ? "Retirer accès illimité" : "Donner accès illimité"}
                        className={user.is_privileged
                          ? "hover:bg-amber-50 hover:text-amber-600 text-amber-500"
                          : "hover:bg-amber-50 hover:text-amber-600"}
                      >
                        {user.is_privileged ? <ZapOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      </ActionBtn>
                    )}
                    {!isCurrentUser && !user.is_superuser && (
                      <ActionBtn
                        onClick={() => setDeleteTarget(user)}
                        loading={false}
                        title="Supprimer l'utilisateur"
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </ActionBtn>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tableau (desktop) */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Utilisateur</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Rôle</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Épreuves</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Inscrit le</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Statut</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((user) => {
                const role = getRoleLabel(user);
                const isCurrentUser = currentUser?.id === user.id;
                const RoleIcon = role.icon;
                return (
                  <tr key={user.id} onClick={() => router.push(`/admin/users/${user.id}`)} className={cn(
                    "hover:bg-slate-50 transition-colors cursor-pointer",
                    isCurrentUser && "bg-indigo-50/50"
                  )}>
                    {/* Utilisateur */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-indigo-600">
                            {(user.full_name || user.username)[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 text-sm flex items-center gap-1">
                            {user.full_name || user.username}
                            {isCurrentUser && <span className="text-xs text-indigo-400">(vous)</span>}
                          </div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Rôle */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border",
                          role.style
                        )}>
                          <RoleIcon className="w-3 h-3" />
                          {role.label}
                        </span>
                        {!user.is_verified && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-orange-50 text-orange-700 border-orange-200 w-fit">
                            Non vérifié
                          </span>
                        )}
                        {user.is_privileged && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                            <Zap className="w-3 h-3" />
                            Accès illimité
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Épreuves */}
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-700">{user.exam_count}</span>
                      <span className="text-xs text-slate-400 ml-1">épreuve{user.exam_count > 1 ? "s" : ""}</span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {formatDate(user.created_at)}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-4">
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full",
                        user.is_active
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-500"
                      )}>
                        {user.is_active ? "Actif" : "Inactif"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Activer/Désactiver */}
                        {!isCurrentUser && (
                          <ActionBtn
                            onClick={() => toggleActive(user)}
                            loading={actionLoading === user.id + "-active"}
                            title={user.is_active ? "Désactiver" : "Activer"}
                            className={user.is_active
                              ? "hover:bg-red-50 hover:text-red-500"
                              : "hover:bg-emerald-50 hover:text-emerald-600"}
                          >
                            {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </ActionBtn>
                        )}

                        {/* Promouvoir/Rétrograder Admin */}
                        {!isCurrentUser && (
                          <ActionBtn
                            onClick={() => toggleAdmin(user)}
                            loading={actionLoading === user.id + "-admin"}
                            title={user.is_superuser ? "Retirer admin" : "Donner rôle admin"}
                            className={user.is_superuser
                              ? "hover:bg-orange-50 hover:text-orange-500"
                              : "hover:bg-indigo-50 hover:text-indigo-600"}
                          >
                            {user.is_superuser ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </ActionBtn>
                        )}

                        {/* Ajuster quota */}
                        {!user.is_superuser && !user.is_active === false && (
                          <ActionBtn
                            onClick={() => openQuota(user)}
                            loading={false}
                            title="Ajuster le quota"
                            className="hover:bg-violet-50 hover:text-violet-600"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </ActionBtn>
                        )}

                        {/* Accès illimité */}
                        {!isCurrentUser && !user.is_superuser && (
                          <ActionBtn
                            onClick={() => togglePrivilege(user)}
                            loading={actionLoading === user.id + "-privilege"}
                            title={user.is_privileged ? "Retirer accès illimité" : "Donner accès illimité"}
                            className={user.is_privileged
                              ? "hover:bg-amber-50 hover:text-amber-600 text-amber-500"
                              : "hover:bg-amber-50 hover:text-amber-600"}
                          >
                            {user.is_privileged ? <ZapOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                          </ActionBtn>
                        )}

                        {/* Supprimer */}
                        {!isCurrentUser && !user.is_superuser && (
                          <ActionBtn
                            onClick={() => setDeleteTarget(user)}
                            loading={false}
                            title="Supprimer l'utilisateur"
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </ActionBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {data.page} sur {data.pages} · {data.total} utilisateurs
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { setPage(p => p - 1); fetchUsers(page - 1); }}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setPage(p => p + 1); fetchUsers(page + 1); }}
              disabled={page === data.pages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal ajustement quota */}
      {quotaUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Ajuster le quota</h2>
                <p className="text-slate-500 text-sm">{quotaUser.full_name || quotaUser.username} · {quotaUser.email}</p>
              </div>
              <button onClick={() => setQuotaUser(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Limite épreuves</label>
                  <input
                    type="number" min={0}
                    value={quotaData.exams_limit}
                    onChange={e => setQuotaData(d => ({ ...d, exams_limit: +e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Utilisées : {quotaData.exams_used}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Limite corrigés</label>
                  <input
                    type="number" min={0}
                    value={quotaData.corrections_limit}
                    onChange={e => setQuotaData(d => ({ ...d, corrections_limit: +e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Utilisés : {quotaData.corrections_used}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Épreuves utilisées</label>
                  <input
                    type="number" min={0}
                    value={quotaData.exams_used}
                    onChange={e => setQuotaData(d => ({ ...d, exams_used: +e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Corrigés utilisés</label>
                  <input
                    type="number" min={0}
                    value={quotaData.corrections_used}
                    onChange={e => setQuotaData(d => ({ ...d, corrections_used: +e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setQuotaUser(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50">
                Annuler
              </button>
              <button
                onClick={saveQuota}
                disabled={quotaLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                {quotaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SlidersHorizontal className="w-4 h-4" />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Supprimer cet utilisateur ?</h2>
                <p className="text-slate-500 text-sm mt-1">
                  {deleteTarget.full_name || deleteTarget.username} · {deleteTarget.email}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Cette action est irréversible. Le compte et ses données associées seront définitivement supprimés.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ onClick, loading, title, className, children }: {
  onClick: () => void; loading: boolean; title: string;
  className?: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={title}
      className={cn(
        "p-2 text-slate-400 rounded-lg transition-colors disabled:opacity-40",
        className
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}
