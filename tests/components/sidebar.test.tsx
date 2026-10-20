import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/lib/api", () => ({ api }));
vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard/exams" }));

import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/auth";
import { useQuotaStore } from "@/store/quota";

const user = { id: "u1", email: "prof@exemple.bj", username: "prof", full_name: "Awa Houngbo", avatar_url: null, is_verified: true, created_at: "2026-10-01" };

beforeEach(() => {
  api.get.mockReset().mockResolvedValue({ data: {} });
  useAuthStore.setState({ user, isAuthenticated: true });
  useQuotaStore.setState({ loaded: true, exams_used: 2, exams_limit: 10, is_unlimited: false });
});

describe("Sidebar", () => {
  it("lists the work pages and marks the current one", () => {
    render(<Sidebar isOpen onClose={() => {}} />);
    const nav = screen.getByRole("navigation", { name: "Espace" });
    expect(nav).toHaveTextContent("Tableau de bord");
    expect(screen.getByRole("link", { name: "Mes épreuves" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Tableau de bord" })).not.toHaveAttribute("aria-current");
  });

  it("shows the account with initials and opens its menu", async () => {
    render(<Sidebar isOpen onClose={() => {}} />);
    const toggle = screen.getByRole("button", { name: /Awa Houngbo/ });
    expect(toggle).toHaveTextContent("AH");
    expect(screen.queryByRole("menu")).toBeNull();

    await userEvent.click(toggle);
    const menu = screen.getByRole("menu");
    expect(menu).toHaveTextContent("prof@exemple.bj");
    expect(screen.getByRole("menuitem", { name: /Abonnement & quota/ })).toHaveTextContent("2 / 10");
    expect(screen.getByRole("menuitem", { name: /Obtenir de l’aide/ })).toHaveAttribute("href", "/dashboard/help");
  });

  it("closes the menu with Escape", async () => {
    render(<Sidebar isOpen onClose={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /Awa Houngbo/ }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("hides the subscription entry for admins", async () => {
    useAuthStore.setState({ user: { ...user, is_admin: true } });
    render(<Sidebar isOpen onClose={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /Awa Houngbo/ }));
    expect(screen.queryByRole("menuitem", { name: /Abonnement/ })).toBeNull();
  });

  it("signs out from the menu", async () => {
    render(<Sidebar isOpen onClose={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /Awa Houngbo/ }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Se déconnecter" }));
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
