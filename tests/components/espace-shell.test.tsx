import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("@/lib/api", () => ({ api }));
vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard/exams", useRouter: () => router }));

import { EspaceShell, initials } from "@/components/espace/espace-shell";
import { useAuthStore } from "@/store/auth";
import { useQuotaStore } from "@/store/quota";

const user = { id: "u1", email: "prof@exemple.bj", username: "prof", full_name: "Awa Houngbo", avatar_url: null, is_verified: true, created_at: "2026-10-01" };

// Radix menus measure the page; jsdom needs these to open them.
beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
  api.get.mockReset().mockResolvedValue({ data: {} });
  router.push.mockReset();
  useAuthStore.setState({ user, isAuthenticated: true });
  useQuotaStore.setState({ loaded: true, exams_used: 2, exams_limit: 10, is_unlimited: false });
});

const openAccountMenu = async () => {
  const trigger = screen.getAllByRole("button", { name: /Awa Houngbo/ })[0];
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false, pointerType: "mouse" });
  return screen.findByRole("menu");
};

describe("EspaceShell", () => {
  it("lists the work pages and marks the current one", () => {
    render(<EspaceShell><p>contenu</p></EspaceShell>);
    const nav = screen.getByRole("navigation", { name: "Mon espace" });
    expect(nav).toHaveTextContent("Tableau de bord");
    expect(screen.getByRole("link", { name: /Mes épreuves/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Tableau de bord/ })).not.toHaveAttribute("aria-current");
    expect(screen.getByText("contenu")).toBeInTheDocument();
  });

  it("shows the real account with its initials", () => {
    render(<EspaceShell><p /></EspaceShell>);
    expect(screen.getAllByRole("button", { name: /Awa Houngbo/ })[0]).toHaveTextContent("AH");
    expect(initials("jean_dupont")).toBe("JD");
    expect(initials("")).toBe("M");
  });

  it("opens the account menu with the email, the quota and sign-out", async () => {
    render(<EspaceShell><p /></EspaceShell>);
    const menu = await openAccountMenu();
    expect(menu).toHaveTextContent("prof@exemple.bj");
    expect(screen.getByRole("menuitem", { name: /Utilisation/ })).toHaveTextContent("2 / 10");
    fireEvent.click(screen.getByRole("menuitem", { name: /Se déconnecter/ }));
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(router.push).toHaveBeenCalledWith("/auth/login");
  });

  it("hides usage and plans for administrators", async () => {
    useAuthStore.setState({ user: { ...user, is_admin: true } });
    render(<EspaceShell><p /></EspaceShell>);
    await openAccountMenu();
    expect(screen.queryByRole("menuitem", { name: /Utilisation/ })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: /forfaits/ })).toBeNull();
  });

  it("goes to the generator with N and to import with I, but not while typing", async () => {
    render(<EspaceShell><input aria-label="champ" /></EspaceShell>);
    await userEvent.keyboard("n");
    expect(router.push).toHaveBeenLastCalledWith("/dashboard/generate");
    await userEvent.keyboard("i");
    expect(router.push).toHaveBeenLastCalledWith("/dashboard/documents");
    router.push.mockReset();
    await userEvent.type(screen.getByLabelText("champ"), "ni");
    expect(router.push).not.toHaveBeenCalled();
  });

  it("opens the command palette with Ctrl+K, including the help questions", async () => {
    render(<EspaceShell><p /></EspaceShell>);
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(await screen.findByPlaceholderText("Que voulez-vous faire ?")).toBeInTheDocument();
    expect(screen.getByText("Comment générer une épreuve ?")).toBeInTheDocument();
  });
});
