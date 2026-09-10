import axios, { AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refresh,
          });
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return api(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/auth/login";
        }
      }
    }

    // Quota dépassé → ouvrir le modal paywall
    if (error.response?.status === 402 && typeof window !== "undefined") {
      const detail = error.response?.data?.detail;
      const code = typeof detail === "object" ? detail?.code : null;
      if (code === "QUOTA_EXCEEDED") {
        const reason = detail?.message?.includes("corrigé") ? "correction" : "exam";
        // Import dynamique pour éviter la dépendance circulaire
        import("@/store/quota").then(({ useQuotaStore }) => {
          useQuotaStore.getState().openPaywall(reason as "exam" | "correction");
        });
      }
    }

    return Promise.reject(error);
  }
);
