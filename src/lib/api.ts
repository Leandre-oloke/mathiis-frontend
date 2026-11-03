import axios, { AxiosInstance } from "axios";
import { getCsrfToken, isCsrfInvalidDetail, redirectToLoginAfterCsrfFailure } from "./csrf";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// withCredentials: les tokens vivent dans des cookies httpOnly posés par le
// backend (api.mathiis.com) -- cross-origin (sous-domaine différent du
// frontend) mais same-site, donc le navigateur n'attache ces cookies que si
// credentials est explicitement activé sur chaque requête.
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Le cookie d'auth est envoyé automatiquement par le navigateur (httpOnly,
  // plus rien à lire/attacher ici) -- seul le jeton CSRF (non httpOnly, donc
  // lisible) doit être attaché à la main sur les requêtes mutantes.
  if (config.method && config.method.toLowerCase() !== "get") {
    const csrf = getCsrfToken();
    if (csrf) config.headers["X-CSRF-Token"] = csrf;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 403 && isCsrfInvalidDetail(error.response?.data?.detail)) {
      await redirectToLoginAfterCsrfFailure();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && typeof window !== "undefined" && !error.config?._isRetry) {
      try {
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true, headers: { "X-CSRF-Token": getCsrfToken() } }
        );
        error.config._isRetry = true;
        error.config.headers["X-CSRF-Token"] = getCsrfToken();
        return api(error.config);
      } catch {
        const { useAuthStore } = await import("@/store/auth");
        useAuthStore.getState().logout().catch(() => {});
        window.location.href = "/auth/login";
      }
    }

    // Quota dépassé → ouvrir le modal paywall
    if (error.response?.status === 402 && typeof window !== "undefined") {
      const detail = error.response?.data?.detail;
      const code = typeof detail === "object" ? detail?.code : null;
      if (code === "QUOTA_EXCEEDED" || code === "PCT_QUOTA_EXCEEDED") {
        const reason =
          code === "PCT_QUOTA_EXCEEDED" ? "pct" : detail?.message?.includes("corrigé") ? "correction" : "exam";
        // Import dynamique pour éviter la dépendance circulaire
        import("@/store/quota").then(({ useQuotaStore }) => {
          useQuotaStore.getState().openPaywall(reason as "exam" | "correction" | "pct");
        });
      }
    }

    return Promise.reject(error);
  }
);
