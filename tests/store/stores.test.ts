import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/lib/api", () => ({ api }));

import { useAuthStore } from "@/store/auth";
import { useQuotaStore } from "@/store/quota";

const user = { id: "u1", email: "prof@exemple.bj", username: "prof", full_name: "Prof", avatar_url: null, is_verified: true, created_at: "2026-10-01" };

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
  useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  useQuotaStore.setState({ loaded: false, exams_used: 0, exams_limit: 10, showPaywall: false, paywallReason: null });
});

describe("useAuthStore", () => {
  it("logs in, stores the tokens and loads the profile", async () => {
    api.post.mockResolvedValueOnce({ data: { access_token: "a1", refresh_token: "r1" } });
    api.get.mockResolvedValueOnce({ data: user });

    await useAuthStore.getState().login("prof@exemple.bj", "secret");

    expect(api.post).toHaveBeenCalledWith("/auth/login", { email: "prof@exemple.bj", password: "secret" });
    expect(api.get).toHaveBeenCalledWith("/auth/me");
    expect(localStorage.getItem("access_token")).toBe("a1");
    expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: true, accessToken: "a1", user });
  });

  it("lets a failed login reject without signing in", async () => {
    api.post.mockRejectedValueOnce({ response: { status: 401 } });
    await expect(useAuthStore.getState().login("x@y.bj", "bad")).rejects.toBeTruthy();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("signs out when the profile cannot be loaded", async () => {
    useAuthStore.setState({ isAuthenticated: true });
    api.get.mockRejectedValueOnce(new Error("401"));
    await useAuthStore.getState().fetchMe();
    expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: false, user: null });
  });

  it("clears tokens on logout", () => {
    localStorage.setItem("access_token", "a1");
    localStorage.setItem("refresh_token", "r1");
    useAuthStore.setState({ user, isAuthenticated: true, accessToken: "a1" });
    useAuthStore.getState().logout();
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(useAuthStore.getState()).toMatchObject({ user: null, isAuthenticated: false, accessToken: null });
  });
});

describe("useQuotaStore", () => {
  it("loads the quota from the API", async () => {
    api.get.mockResolvedValueOnce({ data: { exams_used: 3, exams_limit: 10, is_unlimited: false } });
    await useQuotaStore.getState().fetchQuota();
    expect(api.get).toHaveBeenCalledWith("/subscriptions/quota");
    expect(useQuotaStore.getState()).toMatchObject({ exams_used: 3, loaded: true });
  });

  it("stays usable when the API is down", async () => {
    api.get.mockRejectedValueOnce(new Error("réseau"));
    await useQuotaStore.getState().fetchQuota();
    expect(useQuotaStore.getState().loaded).toBe(false);
  });

  it("opens and closes the paywall with its reason", () => {
    useQuotaStore.getState().openPaywall("correction");
    expect(useQuotaStore.getState()).toMatchObject({ showPaywall: true, paywallReason: "correction" });
    useQuotaStore.getState().closePaywall();
    expect(useQuotaStore.getState()).toMatchObject({ showPaywall: false, paywallReason: null });
  });
});
