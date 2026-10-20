import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("@/lib/api", () => ({ api }));
vi.mock("next/navigation", () => ({ useRouter: () => router, useSearchParams: () => new URLSearchParams() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));
// Google sign-in loads a third-party script: out of scope for these tests.
vi.mock("@/components/auth/GoogleButton", () => ({ default: () => null }));

import LoginPage from "@/app/auth/login/page";
import RegisterPage from "@/app/auth/register/page";
import { useAuthStore } from "@/store/auth";

const field = (label: RegExp) => screen.getByText(label).closest("div")!.parentElement!.querySelector("input")!;

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
  router.push.mockReset();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe("Connexion", () => {
  it("validates the fields before calling the API", async () => {
    render(<LoginPage />);
    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }));
    expect(await screen.findByText("Email invalide")).toBeInTheDocument();
    expect(screen.getByText("Mot de passe requis")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("signs in and opens the dashboard", async () => {
    api.post.mockResolvedValueOnce({ data: { access_token: "a", refresh_token: "r" } });
    api.get.mockResolvedValueOnce({ data: { id: "u1", email: "prof@exemple.bj" } });
    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("vous@exemple.com"), "prof@exemple.bj");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "secret");
    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/dashboard"));
    expect(api.post).toHaveBeenCalledWith("/auth/login", { email: "prof@exemple.bj", password: "secret" });
  });

  it("offers to resend the verification email for an unverified account", async () => {
    api.post.mockRejectedValueOnce({ response: { data: { detail: { code: "EMAIL_NOT_VERIFIED", message: "Email non vérifié" } } } });
    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("vous@exemple.com"), "prof@exemple.bj");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "secret");
    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }));
    expect(await screen.findByRole("button", { name: /Renvoyer l'email de vérification/ })).toBeInTheDocument();
  });

  it("shows and hides the password", async () => {
    render(<LoginPage />);
    const password = screen.getByPlaceholderText("••••••••");
    expect(password).toHaveAttribute("type", "password");
    await userEvent.click(password.parentElement!.querySelector("button")!);
    expect(password).toHaveAttribute("type", "text");
  });
});

describe("Inscription", () => {
  it("fills the username from the full name, without accents or spaces", async () => {
    render(<RegisterPage />);
    await userEvent.type(field(/Nom complet/), "Rémi Adjovi");
    expect(screen.getByPlaceholderText("jean_dupont")).toHaveValue("remi_adjovi");
  });

  it("creates the account and asks to check the mailbox", async () => {
    api.post.mockResolvedValueOnce({ data: { id: "u2" } });
    render(<RegisterPage />);
    await userEvent.type(field(/Nom complet/), "Rémi Adjovi");
    await userEvent.type(screen.getByPlaceholderText("vous@exemple.com"), "remi@exemple.bj");
    await userEvent.type(screen.getByPlaceholderText("Minimum 8 caractères"), "motdepasse1");
    await userEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/auth/check-email?email=remi%40exemple.bj"));
    expect(api.post).toHaveBeenCalledWith("/auth/register", { full_name: "Rémi Adjovi", username: "remi_adjovi", email: "remi@exemple.bj", password: "motdepasse1" });
  });

  it("refuses a password shorter than 8 characters", async () => {
    render(<RegisterPage />);
    await userEvent.type(field(/Nom complet/), "Rémi Adjovi");
    await userEvent.type(screen.getByPlaceholderText("vous@exemple.com"), "remi@exemple.bj");
    await userEvent.type(screen.getByPlaceholderText("Minimum 8 caractères"), "court");
    await userEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));
    expect(await screen.findByText("Minimum 8 caractères")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });
});
