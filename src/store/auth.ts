import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_admin?: boolean;
  is_superuser?: boolean;
  created_at: string;
  is_platform_blocked?: boolean;
  platform_message?: string | null;
  profile_type?: string | null;
  gender?: string | null;
  subject_taught?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    profile_type: string;
    gender: string;
    subject_taught?: string;
  }) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  _syncUserBestEffort: () => Promise<void>;
}

// Les tokens vivent désormais dans des cookies httpOnly posés par le backend
// (/auth/login, /auth/google, /auth/refresh) -- plus jamais lisibles ni
// stockés en JS. L'état persisté ne garde que isAuthenticated (simple hint
// UI pour éviter un flash de redirection avant que fetchMe() ne revalide le
// vrai état via le cookie) ; user n'était déjà pas persisté.
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      // /login et /google renvoient un UserResponse directement (plus besoin
      // d'un aller-retour séparé pour les tokens), mais pas le statut de
      // blocage plateforme (is_platform_blocked, calculé dans /me) -- on
      // enchaîne avec fetchMe() pour garder ce statut exact dès la connexion
      // (sinon le dashboard, qui ne rappelle fetchMe() que si `user` est
      // encore null, ne le rafraîchirait qu'au prochain rechargement).
      // BUG corrigé (constaté en conditions réelles -- "connexion réussie"
      // affiché puis retour immédiat à /auth/login) : /login renvoie déjà
      // l'utilisateur authentifié (cookies posés dans CETTE même réponse) --
      // c'est donc DÉJÀ suffisant pour isAuthenticated. L'ancien code
      // attendait en plus fetchMe() (un 2e aller-retour /auth/me, juste pour
      // récupérer is_platform_blocked) AVANT de considérer la connexion
      // valide -- si cette requête échouait ne serait-ce que ponctuellement
      // (observé : 401 transitoire juste après le login malgré des cookies
      // correctement posés, cause exacte non reproduite isolément mais
      // écartée côté cookies/CORS/transport -- testé successivement en fetch,
      // XHR brut et axios direct, tous systématiquement OK), fetchMe()
      // remettait isAuthenticated à false et annulait silencieusement une
      // connexion pourtant réussie. On rafraîchit donc ces détails en
      // best-effort (_syncUserBestEffort, ci-dessous) : met à jour `user` en
      // cas de succès, ignore silencieusement un échec SANS jamais pouvoir
      // défaire l'état déjà établi par /login -- contrairement à fetchMe(),
      // qui elle doit continuer à vraiment invalider la session (cf. son
      // usage dans dashboard/admin layout, au chargement initial).
      login: async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        set({ user: data, isAuthenticated: true });
        get()._syncUserBestEffort();
      },

      loginWithGoogle: async (credential) => {
        const { data } = await api.post("/auth/google", { credential });
        set({ user: data, isAuthenticated: true });
        get()._syncUserBestEffort();
      },

      _syncUserBestEffort: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data, isAuthenticated: true });
        } catch {
          // Échec ignoré volontairement : ne doit jamais défaire une
          // connexion déjà établie par /login (cf. commentaire ci-dessus).
        }
      },

      register: async (formData) => {
        const { data } = await api.post("/auth/register", formData);
        set({ user: data });
      },

      resendVerification: async (email) => {
        await api.post("/auth/resend-verification", { email });
      },

      // Best-effort : le nettoyage local (état + cookies via la réponse
      // serveur) ne doit jamais bloquer la déconnexion côté client même si
      // le réseau/serveur échoue. L'état est remis à zéro immédiatement
      // (synchrone) pour les appelants qui ne font pas `await logout()`.
      logout: async () => {
        set({ user: null, isAuthenticated: false });
        await api.post("/auth/logout").catch(() => {});
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
